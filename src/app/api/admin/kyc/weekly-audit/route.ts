import { NextRequest, NextResponse } from "next/server";
import {
  generateWeeklyKycAuditReport,
  sendWeeklyKycAuditToTelegram,
  isTelegramConfigured,
} from "@/lib/telegram-kyc-bot";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7", 10);

    const audit = await generateWeeklyKycAuditReport(isNaN(days) ? 7 : days);
    return NextResponse.json({
      success: true,
      audit,
      telegramConfigured: isTelegramConfigured(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const days = body.days ? parseInt(body.days, 10) : 7;

    if (!isTelegramConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "بيانات تيليجرام غير مكتملة في .env. يرجى ضبط TELEGRAM_BOT_TOKEN و TELEGRAM_ADMIN_CHAT_ID",
        },
        { status: 400 }
      );
    }

    const result = await sendWeeklyKycAuditToTelegram(days);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: (result as any).error || "فشل إرسال التقرير إلى تيليجرام" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال تقرير التدقيق الأسبوعي بنجاح إلى مجموعة تيليجرام!",
      audit: result.audit,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
