import { NextRequest, NextResponse } from "next/server";
import {
  authenticateRootAdmin,
  createRootToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  ROOT_COOKIE_NAME,
} from "@/lib/root-admin-auth";

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  // 1. Rate Limit Enforcement (Max 5 attempts / 15 mins)
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `تم تجاوز الحد الأقصى للمحاولات (5 محاولات). تم إغلاق الولوج مؤقتًا لمدة ${Math.ceil(
          rateLimit.retryAfterSeconds / 60
        )} دقيقة لدواعي الأمان العسكري.`,
        retryAfter: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const { identifier, password, masterPin } = body;

    if (!identifier || !password || !masterPin) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى تعبئة كافة الحقول الأمنية (المعرّف، كلمة المرور، ورمز الأمان PIN)",
        },
        { status: 400 }
      );
    }

    const rootAdmin = await authenticateRootAdmin(identifier, password, masterPin);

    // Reset rate limiter on successful auth
    resetRateLimit(ip);

    // Create signed token
    const token = await createRootToken(rootAdmin);

    const response = NextResponse.json({
      success: true,
      message: "تم التحقق من الصلاحيات الأمنية العليا بنجاح. مرحباً بك في لوحة الجذر.",
      admin: rootAdmin,
    });

    // Set signed admin session cookie with path isolation
    response.cookies.set({
      name: ROOT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // accessible for root-admin pages and its APIs
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return response;
  } catch (err: any) {
    const failInfo = recordFailedAttempt(ip);

    let errorMsg = err.message || "فشل التحقق من صلاحيات الجذر.";
    if (failInfo.remainingAttempts > 0) {
      errorMsg += ` (المحاولات المتبقية: ${failInfo.remainingAttempts})`;
    } else {
      errorMsg += ` تم حظر المحاولات مؤقتاً لمدة 15 دقيقة.`;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        remainingAttempts: failInfo.remainingAttempts,
      },
      { status: 401 }
    );
  }
}
