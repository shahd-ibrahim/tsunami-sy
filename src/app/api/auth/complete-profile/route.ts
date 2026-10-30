import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  createSessionToken,
  completeUserProfile,
  completeProfileSchema,
  COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get(COOKIE_NAME)?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "غير مصرح: يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "جلسة غير صالحة، يرجى إعادة تسجيل الدخول" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = completeProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "بيانات غير مكتملة" },
        { status: 400 }
      );
    }

    const updatedUser = await completeUserProfile(session.id, parsed.data);
    const newToken = await createSessionToken(updatedUser);

    const res = NextResponse.json({
      success: true,
      user: updatedUser,
      token: newToken,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const THIRTY_DAYS = 30 * 24 * 60 * 60;

    res.cookies.set({
      name: "next-auth.session-token",
      value: newToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    res.cookies.set({
      name: "tsunami_session",
      value: newToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    return res;
  } catch (err: any) {
    console.error("[Complete Profile Error]:", err);
    const status = err.message?.includes("مأخوذ بالفعل") ? 409 : 500;
    return NextResponse.json(
      { error: err.message || "فشل حفظ بيانات الملف الشخصي" },
      { status }
    );
  }
}
