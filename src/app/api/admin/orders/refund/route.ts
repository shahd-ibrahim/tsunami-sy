import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { forceRefundSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = forceRefundSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, adminUserId, reason } = parsed.data;
    const result = await OrderService.forceRefund(orderId, adminUserId, reason);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
