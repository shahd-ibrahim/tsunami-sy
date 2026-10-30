import { NextRequest, NextResponse } from "next/server";
import { registerSchema, registerUser, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Strict Zod Validation
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      const errorList = (validationResult.error as any).issues || (validationResult.error as any).errors || [];
      const firstError = errorList[0]?.message || "بيانات التسجيل غير صالحة";
      return NextResponse.json(
        {
          error: firstError,
          details: errorList,
        },
        { status: 400 }
      );
    }

    // 2. Execute User & Wallet Lifecycle Registration
    const { user, initialBalance } = await registerUser(validationResult.data);

    // 3. Issue Encrypted JWT Session Token
    const sessionToken = await createSessionToken(user);

    // 4. Set HttpOnly, SameSite=Lax, Secure Cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب والمحفظة الرقمية بنجاح",
        user,
        token: sessionToken,
        wallet: {
          balance: initialBalance,
          currency: "USD",
        },
      },
      { status: 201 }
    );

    const isProduction = process.env.NODE_ENV === "production";
    const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30 days persistence

    // Set NextAuth persistent session cookie
    response.cookies.set({
      name: "next-auth.session-token",
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    // Set legacy tsunami_session cookie
    response.cookies.set({
      name: "tsunami_session",
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    // Set role & user ID cookies for client context synchronization
    response.cookies.set({
      name: "tsunami_role",
      value: user.role,
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge: THIRTY_DAYS,
    });

    response.cookies.set({
      name: "tsunami_user_id",
      value: user.id,
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge: THIRTY_DAYS,
    });

    return response;
  } catch (err: any) {
    console.error("[Register API Error]:", err);
    const status =
      err.message?.includes("مأخوذ بالفعل") || err.message?.includes("مسجل مسبقاً")
        ? 409
        : 400;
    return NextResponse.json(
      { error: err.message || "فشل تسجيل الحساب، يرجى المحاولة لاحقاً" },
      { status }
    );
  }
}
