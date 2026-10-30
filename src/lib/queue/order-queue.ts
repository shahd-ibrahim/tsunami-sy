import { Queue } from "bullmq";
import { redisConnectionConfig } from "./redis";
import { OrderJobData, TOPUP_ORDER_QUEUE_NAME, processOrderExecution } from "./order-worker";

let orderQueue: Queue<OrderJobData> | null = null;

export function getOrderQueue(): Queue<OrderJobData> | null {
  if (orderQueue) return orderQueue;

  try {
    orderQueue = new Queue<OrderJobData>(TOPUP_ORDER_QUEUE_NAME, {
      connection: redisConnectionConfig as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000, // 2s, 4s, 8s
        },
        removeOnComplete: {
          age: 3600, // keep for 1 hour
          count: 1000,
        },
        removeOnFail: {
          age: 86400, // keep failed for 24h for audit
        },
      },
    });

    orderQueue.on("error", (err) => {
      // Graceful error logging when Redis is unavailable
      if (!err.message.includes("ECONNREFUSED")) {
        console.warn("[BullMQ Queue] Error:", err.message);
      }
    });

    return orderQueue;
  } catch (err: any) {
    console.warn("[BullMQ Queue] Could not initialize BullMQ:", err.message);
    return null;
  }
}

/**
 * Dispatches an order job to BullMQ or resilient async background runner
 */
export async function enqueueTopUpOrder(jobData: OrderJobData): Promise<{ jobId: string; mode: "REDIS_BULLMQ" | "ASYNC_DISPATCH" }> {
  try {
    const queue = getOrderQueue();
    if (queue) {
      // Test if queue is ready or can push
      const job = await queue.add(`order-${jobData.orderNumber}`, jobData, {
        jobId: jobData.orderId,
      });
      return {
        jobId: job.id || jobData.orderId,
        mode: "REDIS_BULLMQ",
      };
    }
  } catch (err: any) {
    console.warn(`[OrderQueue] BullMQ Redis unreachable, dispatching via resilient async worker: ${err.message}`);
  }

  // Resilient non-blocking async execution (Non-blocking response to user immediately)
  setImmediate(async () => {
    try {
      await processOrderExecution(jobData);
    } catch (err: any) {
      console.error(`[AsyncQueueRunner] Unhandled error processing order ${jobData.orderNumber}:`, err.message);
    }
  });

  return {
    jobId: `local-async-${jobData.orderId}`,
    mode: "ASYNC_DISPATCH",
  };
}
