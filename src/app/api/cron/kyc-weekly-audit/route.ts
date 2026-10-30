import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyKycAuditToTelegram, isTelegramConfigured } from "@/lib/telegram-kyc-bot";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretParam = req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET || process.env.JWT_SECRET;

    // Optional verification if CRON_SECRET is provided
    if (process.env.CRON_SECRET) {
      if (
        authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
        secretParam !== process.env.CRON_SECRET
      ) {
        return NextResponse.json({ error: "Unauthorized cron call" }, { status: 401 });
      }
    }

    if (!isTelegramConfigured()) {
      return NextResponse.json({
        skipped: true,
        reason: "Telegram credentials are not configured",
      });
    }

    const res = await sendWeeklyKycAuditToTelegram(7);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: res,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
