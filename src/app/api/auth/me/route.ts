import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, getUserById, COOKIE_NAME } from "@/lib/auth";
import { WalletService } from "@/lib/wallet-service";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("tsunami_session")?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value;
    const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const token = sessionCookie || authHeader;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let freshUser = payload;
    try {
      const dbUser = await getUserById(payload.id);
      if (dbUser) freshUser = dbUser;
    } catch {
      freshUser = payload;
    }

    let walletBalance = 0;
    let walletCurrency = "USD";
    try {
      const wallet = await WalletService.getBalance(payload.id);
      walletBalance = wallet.balance;
      walletCurrency = wallet.currency;
    } catch {
      walletBalance = 0;
    }

    const response = NextResponse.json({
      authenticated: true,
      user: freshUser,
      token,
      wallet: {
        balance: walletBalance,
        currency: walletCurrency,
      },
    });

    const isProduction = process.env.NODE_ENV === "production";
    const THIRTY_DAYS = 30 * 24 * 60 * 60; // 30 days persistence

    // Ensure persistent cookies are refreshed for active sessions
    response.cookies.set("next-auth.session-token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
    response.cookies.set("tsunami_session", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
    response.cookies.set("tsunami_role", freshUser.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
    response.cookies.set("tsunami_user_id", freshUser.id, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "فشل جلب بيانات الجلسة" },
      { status: 500 }
    );
  }
}
