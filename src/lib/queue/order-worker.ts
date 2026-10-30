import { Worker, Job } from "bullmq";
import { redisConnectionConfig } from "./redis";
import { adapterRegistry, OrderPayload } from "../adapters";
import { providerEngine } from "../providers";
import { WalletService } from "../wallet-service";
import { prisma } from "../prisma";
import { OrderStatus, TransactionType } from "@prisma/client";

export interface OrderJobData {
  orderId: string;
  orderNumber: string;
  userId: string;
  amount: number;
  gameCode: string;
  targetId: string;
  targetZoneId?: string;
  packageCode: string;
  providerCode?: string;
}

export const TOPUP_ORDER_QUEUE_NAME = "topup-orders";

/**
 * Core order execution logic shared between BullMQ Worker and local fallback processor
 */
export async function processOrderExecution(jobData: OrderJobData): Promise<{ success: boolean; status: OrderStatus; message?: string }> {
  const { orderId, orderNumber, userId, amount, gameCode, targetId, targetZoneId, packageCode, providerCode } = jobData;

  console.log(`[OrderWorker] Processing order: ${orderNumber} for Target: ${targetId} (${gameCode})`);

  // Step 1: Mark order as PROCESSING in database
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    });
  } catch (err: any) {
    console.warn(`[OrderWorker] Note updating order status: ${err.message}`);
  }

  // Step 2: Dispatch top-up via Extensible Provider Engine
  try {
    const result = await providerEngine.executeTopUp(
      {
        playerId: targetId,
        packageCode,
        orderId: orderNumber,
        zoneId: targetZoneId,
        gameCode,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/topup-callback`,
      },
      providerCode
    );

    if (result.success && result.status === "COMPLETED") {
      // Step 3: Provider succeeded -> Mark order COMPLETED
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.COMPLETED,
            providerTxId: result.externalTxId || `TX-${orderNumber}`,
            providerRawResponse: result.rawResponse as any,
          },
        });
      } catch (err: any) {
        console.warn(`[OrderWorker] Database update error: ${err.message}`);
      }

      console.log(`[OrderWorker] Order ${orderNumber} COMPLETED successfully via ${result.providerId}. Tx: ${result.externalTxId}`);

      // Dispatch Success Alert to Live Operations Group (-5527645465)
      import("../telegram").then(({ dispatchOrderSuccessAlert }) => {
        dispatchOrderSuccessAlert({
          orderId,
          orderNumber,
          userId,
          gameCode,
          packageCode,
          targetId,
          targetZoneId,
          amount,
          providerCode: result.providerId || providerCode || "MOCK_TOPUP",
          providerTxId: result.externalTxId || `TX-${orderNumber}`,
        });
      }).catch((e) => console.error("[Telegram Order Alert Error]:", e.message));

      return { success: true, status: OrderStatus.COMPLETED };
    } else {
      // Step 4: Permanent provider failure -> Trigger automatic refund via WalletService
      console.warn(`[OrderWorker] Provider failed for order ${orderNumber}. Initiating automatic refund...`);

      const refundResult = await WalletService.creditFunds({
        userId,
        amount,
        type: TransactionType.ORDER_REFUND,
        orderId,
        description: `Automated refund for failed order ${orderNumber}: ${result.error || "Provider rejected top-up"}`,
        reference: `REFUND-${orderNumber}`,
      });

      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.FAILED,
            errorMessage: result.error || "Provider fulfillment failed",
            providerTxId: result.externalTxId,
            providerRawResponse: result.rawResponse as any,
          },
        });
      } catch (err: any) {
        console.warn(`[OrderWorker] Note updating failed order status: ${err.message}`);
      }

      console.log(`[OrderWorker] Automatic refund completed for order ${orderNumber}. Refund ref: ${refundResult.reference}`);

      // Dispatch Warning/Failure Alert to Live Operations Group (-5527645465)
      import("../telegram").then(({ dispatchOrderFailureAlert }) => {
        dispatchOrderFailureAlert({
          orderId,
          orderNumber,
          userId,
          gameCode,
          packageCode,
          targetId,
          targetZoneId,
          amount,
          errorMessage: result.error || "Provider fulfillment failed",
        });
      }).catch((e) => console.error("[Telegram Order Alert Error]:", e.message));

      return {
        success: false,
        status: OrderStatus.FAILED,
        message: result.error,
      };
    }
  } catch (error: any) {
    console.error(`[OrderWorker] Provider communication error for order ${orderNumber}:`, error.message);
    // Bubble up network/transient error to BullMQ for automatic exponential backoff retry
    throw error;
  }
}

/**
 * BullMQ Worker instance
 */
let orderWorker: Worker<OrderJobData> | null = null;

export function initOrderWorker(): Worker<OrderJobData> | null {
  if (orderWorker) return orderWorker;

  try {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    const redisOpts = { ...redisConnectionConfig, lazyConnect: true };

    orderWorker = new Worker<OrderJobData>(
      TOPUP_ORDER_QUEUE_NAME,
      async (job: Job<OrderJobData>) => {
        return await processOrderExecution(job.data);
      },
      {
        connection: redisOpts as any,
        concurrency: 5,
      }
    );

    orderWorker.on("completed", (job) => {
      console.log(`[BullMQ Worker] Job ${job.id} (${job.data.orderNumber}) completed successfully`);
    });

    orderWorker.on("failed", async (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed after ${job?.attemptsMade} attempts: ${err.message}`);
      
      // If max retries exhausted, perform safety refund
      if (job && job.opts.attempts && job.attemptsMade >= job.opts.attempts) {
        console.warn(`[BullMQ Worker] Max retries reached for order ${job.data.orderNumber}. Processing final refund.`);
        try {
          await WalletService.creditFunds({
            userId: job.data.userId,
            amount: job.data.amount,
            type: TransactionType.ORDER_REFUND,
            orderId: job.data.orderId,
            description: `Automated safety refund after max retries: ${err.message}`,
          });

          await prisma.order.update({
            where: { id: job.data.orderId },
            data: {
              status: OrderStatus.FAILED,
              errorMessage: `Failed after ${job.attemptsMade} attempts: ${err.message}`,
            },
          });
        } catch (cleanupErr: any) {
          console.error(`[BullMQ Worker] Error during final refund:`, cleanupErr.message);
        }
      }
    });

    return orderWorker;
  } catch (e: any) {
    console.warn(`[BullMQ Worker] Redis connection unavailable. In-memory queue active.`);
    return null;
  }
}
