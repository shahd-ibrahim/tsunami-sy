import { NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";

export async function GET() {
  try {
    const metrics = await OrderService.getAdminMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
