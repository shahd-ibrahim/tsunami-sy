import { NextRequest, NextResponse } from "next/server";
import {
  TELEGRAM_CHANNELS,
  isTelegramConfigured,
  dispatchDepositAlert,
  dispatchKycAlert,
  dispatchOrderSuccessAlert,
  dispatchOrderFailureAlert,
  dispatchSecurityAlert,
  sendTelegramMessage,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    if (!isTelegramConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات تيليجرام غير مهيأة في .env (TELEGRAM_BOT_TOKEN غير محدد)",
        },
        { status: 400 }
      );
    }

    let channel = "all";
    try {
      const body = await req.json();
      if (body?.channel) channel = body.channel;
    } catch {}

    const results: Record<string, any> = {};

    // 1. DEPOSITS CHANNEL TEST
    if (channel === "deposits" || channel === "all") {
      results.deposits = await dispatchDepositAlert({
        id: `test-dep-${Date.now()}`,
        depositNumber: `DEP-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: "user-1001",
        userNumericId: 1001,
        userName: "أحمد المحمد (تجربة نظام الإيداع)",
        amount: 50.0,
        currency: "USD",
        method: "شام كاش (Sham Cash #1)",
        senderName: "أحمد المحمد",
        senderAccountOrPhone: "+963988776655",
        transferReference: `TX-SHAM-${Date.now().toString().slice(-6)}`,
        receiptImageUrl: "/images/logo.png",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. KYC CHANNEL TEST
    if (channel === "kyc" || channel === "all") {
      results.kyc = await dispatchKycAlert({
        id: `test-kyc-${Date.now()}`,
        userId: "user-1002",
        userNumericId: 1002,
        userName: "عمر الحلبي (تجربة توثيق الهوية)",
        userPhone: "+963911223344",
        idNumber: "01020304050",
        idCardFrontUrl: "/images/logo.png",
        matchScore: 92,
        status: "AUTO_VERIFIED",
        botNotes: "الهوية الوطنية السورية - كافة الحقول واضحة ومطابقة للبيانات المسجلة بنجاح.",
        createdAt: new Date().toISOString(),
      });
    }

    // 3. ORDERS CHANNEL TEST
    if (channel === "orders" || channel === "all") {
      results.orderSuccess = await dispatchOrderSuccessAlert({
        orderId: `test-ord-${Date.now()}`,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        userId: "user-1003",
        gameCode: "PUBG_MOBILE",
        gameName: "ببجي موبايل (PUBG Mobile)",
        packageCode: "PUBG_660_UC",
        packageName: "660 شدة ببجي (UC)",
        targetId: "5123456789",
        playerNickname: "TSUNAMI_Gamer",
        amount: 9.99,
        costPrice: 8.80,
        providerCode: "SMILE_ONE_DIRECT",
        providerTxId: `TX-SMILE-${Date.now().toString().slice(-5)}`,
      });
    }

    // 4. SECURITY CHANNEL TEST
    if (channel === "security" || channel === "all") {
      results.security = await dispatchSecurityAlert({
        type: "ADMIN_BALANCE_INJECTION",
        operatorName: "المشرف العام (Root Super-Admin)",
        operatorEmail: "root@tsunami-sy.com",
        targetAdminName: "مشرف مبيعات دمشق (Admin Damascus)",
        targetAdminId: "admin-damascus-01",
        amount: 500.0,
        note: "تعبئة الرصيد التشغيلي الأسبوعي لنقطة الميدان",
      });
    }

    return NextResponse.json({
      success: true,
      message: `تم إرسال رسائل الفحص بنجاح للقنوات المحددة (${channel})`,
      channels: TELEGRAM_CHANNELS,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isTelegramConfigured(),
    channels: TELEGRAM_CHANNELS,
    instructions: "Send POST with { channel: 'deposits' | 'kyc' | 'orders' | 'security' | 'all' } to dispatch test events",
  });
}
