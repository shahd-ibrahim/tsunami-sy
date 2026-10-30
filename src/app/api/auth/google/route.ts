import { NextRequest, NextResponse } from "next/server";
import { loginOrRegisterGoogle, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, googleId, avatarUrl, image, picture } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "البريد الإلكتروني من Google غير صالح" },
        { status: 400 }
      );
    }

    const { user, needsProfileCompletion } = await loginOrRegisterGoogle({
      email,
      name: name || "Google User",
      googleId,
      avatarUrl: image || picture || avatarUrl,
      image: image || picture || avatarUrl,
      picture: picture || image || avatarUrl,
    });

    const token = await createSessionToken(user);

    const redirectUrl = needsProfileCompletion ? "/complete-profile" : "/";
    const res = NextResponse.json({
      success: true,
      user,
      token,
      needsProfileCompletion,
      redirectUrl,
    });

    // Set HTTP-Only Cookie
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Client-visible role cookie
    res.cookies.set("tsunami_role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error("[Google Auth Error]:", err);
    return NextResponse.json(
      { error: err.message || "فشل تسجيل الدخول بواسطة Google" },
      { status: 500 }
    );
  }
}
