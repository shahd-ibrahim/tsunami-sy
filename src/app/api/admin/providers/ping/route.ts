import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { pingProviderSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = pingProviderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { providerCode } = parsed.data;
    const result = await OrderService.pingProvider(providerCode);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
