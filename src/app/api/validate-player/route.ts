import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { validatePlayerSchema } from "@/lib/validations";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Strict Authentication Wall: reject guests
    const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    const session = token ? await verifySessionToken(token) : null;
    const roleCookie = req.cookies.get("tsunami_role")?.value;

    if (!session && !roleCookie) {
      return NextResponse.json(
        { valid: false, errorMessage: "Unauthorized: يرجى تسجيل الدخول أولاً للتحقق من هوية اللاعب" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = validatePlayerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, errorMessage: "بيانات التحقق غير صحيحة: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { gameCode, playerId, zoneId } = parsed.data;
    const result = await OrderService.validatePlayer(gameCode, playerId.trim(), zoneId?.trim());
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, errorMessage: error.message || "Failed to validate player" },
      { status: 500 }
    );
  }
}
