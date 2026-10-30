import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { placeOrderSchema } from "@/lib/validations";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Strict Authentication Wall: reject guests
    const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    const session = token ? await verifySessionToken(token) : null;
    const roleCookie = req.cookies.get("tsunami_role")?.value;

    if (!session && !roleCookie) {
      return NextResponse.json(
        { error: "Unauthorized: يرجى تسجيل الدخول أولاً لتنفيذ طلبات الشحن" },
        { status: 401 }
      );
    }

    const json = await req.json();
    const parsed = placeOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const effectiveUserId = session?.id || parsed.data.userId;

    // Strict KYC Gate: unverified accounts cannot place charge orders
    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { isVerified: true, kycStatus: true, role: true },
    });

    const isVerifiedUser =
      user?.role === "ADMIN" ||
      user?.isVerified === true ||
      user?.kycStatus === "AUTO_VERIFIED";

    if (!isVerifiedUser) {
      return NextResponse.json(
        {
          error: "يتطلب تنفيذ طلبات الشحن توثيق هويتك أولاً (KYC Gate). يرجى التوجه لصفحة الملف الشخصي لرفع مستندات التحقق.",
          code: "KYC_REQUIRED",
        },
        { status: 403 }
      );
    }

    const orderResult = await OrderService.placeOrder({
      ...parsed.data,
      userId: effectiveUserId,
    });
    return NextResponse.json(orderResult, { status: 201 });
  } catch (error: any) {
    console.error("[Orders API] Order placement failed:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to place order" },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const orders = await OrderService.listOrders(userId);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
