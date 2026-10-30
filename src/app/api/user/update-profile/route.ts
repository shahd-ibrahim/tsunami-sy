import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  createSessionToken,
  updateUserProfile,
  COOKIE_NAME,
} from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const token =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get(COOKIE_NAME)?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "جلسة غير صالحة" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, image, phone, countryCode, countryName } = body;

    const updatedUser = await updateUserProfile(session.id, {
      name,
      username,
      image,
      phone,
      countryCode,
      countryName,
    });

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
    const status = err.message?.includes("مأخوذ بالفعل") ? 409 : 400;
    return NextResponse.json(
      { error: err.message || "فشل تحديث البيانات الشخصية" },
      { status }
    );
  }
}

