import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { enqueueTopUpOrder } from "@/lib/queue/order-queue";
import { PRODUCTS } from "@/lib/catalog";
import { orderRetrySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = orderRetrySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    const order = await OrderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const product = PRODUCTS.find((p) => p.id === order.productId || p.slug === order.productId);
    const gameCode = product ? product.gameCode : "GENERIC";

    const result = await enqueueTopUpOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      amount: Number(order.amount),
      gameCode,
      targetId: order.targetId,
      targetZoneId: order.targetZoneId || undefined,
      packageCode: order.packageId,
    });

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} re-enqueued for provider retry`,
      queueJobId: result.jobId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
