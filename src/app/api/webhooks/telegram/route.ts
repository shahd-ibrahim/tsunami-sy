import { NextRequest, NextResponse } from "next/server";
import {
  TELEGRAM_CHANNELS,
  answerCallbackQuery,
  editTelegramMessageText,
  editTelegramMessageCaption,
  sendTelegramMessage,
  isTelegramConfigured,
} from "@/lib/telegram";
import { OrderService } from "@/lib/order-service";
import { reviewKycManual, getKycVerifications } from "@/lib/dynamic-hub";
import { enqueueTopUpOrder } from "@/lib/queue/order-queue";
import { generateWeeklyKycAuditReport } from "@/lib/telegram-kyc-bot";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "TSUNAMI Multi-Group Telegram Dispatcher & Webhook Router",
    configured: isTelegramConfigured(),
    channels: {
      kyc: TELEGRAM_CHANNELS.KYC,
      deposits: TELEGRAM_CHANNELS.DEPOSITS,
      orders: TELEGRAM_CHANNELS.ORDERS,
      security: TELEGRAM_CHANNELS.SECURITY,
    },
    supportedCallbacks: [
      "deposit_approve:{id}",
      "deposit_reject:{id}",
      "kyc_approve:{id}",
      "kyc_reject:{id}",
      "order_retry:{id}",
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    // Webhook secret validation if set
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    const querySecret = req.nextUrl.searchParams.get("secret");

    if (
      webhookSecret &&
      webhookSecret !== "random_secure_secret" &&
      headerSecret !== webhookSecret &&
      querySecret !== webhookSecret
    ) {
      console.warn("[Telegram Webhook] Unauthorized secret token received");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await req.json();

    // =========================================================================
    // 1. HANDLE INLINE KEYBOARD CALLBACK QUERIES
    // =========================================================================
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = String(cb.data || "").trim();
      const from = cb.from;
      const operatorName = from?.username
        ? `@${from.username}`
        : [from?.first_name, from?.last_name].filter(Boolean).join(" ") || "مشرف تيليجرام";

      const timeStamp = new Date().toLocaleString("ar-SY", {
        timeZone: "Asia/Damascus",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log(`[Telegram Webhook] Callback: ${data} from: ${operatorName}`);

      // --- A. MANUAL DEPOSIT APPROVAL ---
      if (data.startsWith("deposit_approve:") || data.startsWith("deposit_appr_")) {
        const depositId = data.replace(/^deposit_approve:/, "").replace(/^deposit_appr_/, "");
        try {
          const result = await OrderService.approveDeposit(
            depositId,
            `telegram-${from?.id || "bot"}`,
            "اعتماد فوري عبر بوت تيليجرام",
            operatorName,
            from?.username ? `https://t.me/${from.username}` : undefined
          );

          await answerCallbackQuery(
            cb.id,
            `✅ تم اعتماد الإيداع بنجاح وتنزيل الرصيد في محفظة العميل فوراً!`,
            true
          );

          // Update original message / photo caption with approval stamp
          const stamp = `\n\n━━━━━━━━━━━━━━━━━━━━━\n✅ <b>[معتمد ومصروف]</b> تم اعتماد الإيداع وتنزيل الرصيد بواسطة المشرف <b>${operatorName}</b> بتاريخ <code>${timeStamp}</code>`;

          if (cb.message?.photo && cb.message?.photo.length > 0) {
            const currentCaption = cb.message?.caption || "";
            await editTelegramMessageCaption({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              caption: `${currentCaption}${stamp}`,
              reply_markup: { inline_keyboard: [] }, // disable buttons to prevent double execution
            });
          } else if (cb.message) {
            const currentText = cb.message?.text || "";
            await editTelegramMessageText({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              text: `${currentText}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          }

          return NextResponse.json({ ok: true, status: "APPROVED", depositId });
        } catch (err: any) {
          console.error("[Telegram Deposit Approve Error]:", err.message);
          await answerCallbackQuery(
            cb.id,
            `⚠️ تعذر الاعتماد: ${err.message || "الطلب معتمد مسبقاً"}`,
            true
          );
          return NextResponse.json({ ok: false, error: err.message });
        }
      }

      // --- B. MANUAL DEPOSIT REJECTION ---
      if (data.startsWith("deposit_reject:") || data.startsWith("deposit_rejc_")) {
        const depositId = data.replace(/^deposit_reject:/, "").replace(/^deposit_rejc_/, "");
        try {
          await OrderService.rejectDeposit(
            depositId,
            `telegram-${from?.id || "bot"}`,
            `تم رفض الإيصال عبر تيليجرام بواسطة ${operatorName}`
          );

          await answerCallbackQuery(
            cb.id,
            `❌ تم رفض إيصال الإيداع وإشعار العميل في حسابه.`,
            true
          );

          const stamp = `\n\n━━━━━━━━━━━━━━━━━━━━━\n❌ <b>[إيصال مرفوض]</b> تم رفض هذا الإيداع بواسطة المشرف <b>${operatorName}</b> بتاريخ <code>${timeStamp}</code>`;

          if (cb.message?.photo && cb.message?.photo.length > 0) {
            const currentCaption = cb.message?.caption || "";
            await editTelegramMessageCaption({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              caption: `${currentCaption}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          } else if (cb.message) {
            const currentText = cb.message?.text || "";
            await editTelegramMessageText({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              text: `${currentText}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          }

          return NextResponse.json({ ok: true, status: "REJECTED", depositId });
        } catch (err: any) {
          console.error("[Telegram Deposit Reject Error]:", err.message);
          await answerCallbackQuery(
            cb.id,
            `⚠️ تعذر الرفض: ${err.message || "الطلب معالج مسبقاً"}`,
            true
          );
          return NextResponse.json({ ok: false, error: err.message });
        }
      }

      // --- C. KYC APPROVAL ---
      if (data.startsWith("kyc_approve:") || data.startsWith("kyc_appr_")) {
        const kycId = data.replace(/^kyc_approve:/, "").replace(/^kyc_appr_/, "");
        try {
          await reviewKycManual(kycId, "APPROVE", operatorName, "اعتماد مباشر عبر بوت الإشراف في تيليجرام");

          await answerCallbackQuery(
            cb.id,
            `🎉 تم قبول وتوثيق حساب العميل بنجاح وتم فتح سقف الشحن!`,
            true
          );

          const stamp = `\n\n━━━━━━━━━━━━━━━━━━━━━\n✅ <b>[الحساب موثق ومفعل]</b> تمت الموافقة والتوثيق بواسطة <b>${operatorName}</b> بتاريخ <code>${timeStamp}</code>`;

          if (cb.message?.photo && cb.message?.photo.length > 0) {
            const currentCaption = cb.message?.caption || "";
            await editTelegramMessageCaption({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              caption: `${currentCaption}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          } else if (cb.message) {
            const currentText = cb.message?.text || "";
            await editTelegramMessageText({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              text: `${currentText}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          }

          return NextResponse.json({ ok: true, status: "KYC_APPROVED", kycId });
        } catch (err: any) {
          console.error("[Telegram KYC Approve Error]:", err.message);
          await answerCallbackQuery(
            cb.id,
            `⚠️ تعذر التوثيق: ${err.message}`,
            true
          );
          return NextResponse.json({ ok: false, error: err.message });
        }
      }

      // --- D. KYC REJECTION ---
      if (data.startsWith("kyc_reject:") || data.startsWith("kyc_rejc_")) {
        const kycId = data.replace(/^kyc_reject:/, "").replace(/^kyc_rejc_/, "");
        try {
          await reviewKycManual(kycId, "REJECT", operatorName, "المستند غير واضح أو غير مطابق");

          await answerCallbackQuery(
            cb.id,
            `❌ تم رفض مستند التوثيق وإشعار العميل بإعادة الرفع.`,
            true
          );

          const stamp = `\n\n━━━━━━━━━━━━━━━━━━━━━\n❌ <b>[طلب توثيق مرفوض]</b> تم رفض المستندات بواسطة <b>${operatorName}</b> بتاريخ <code>${timeStamp}</code>`;

          if (cb.message?.photo && cb.message?.photo.length > 0) {
            const currentCaption = cb.message?.caption || "";
            await editTelegramMessageCaption({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              caption: `${currentCaption}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          } else if (cb.message) {
            const currentText = cb.message?.text || "";
            await editTelegramMessageText({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              text: `${currentText}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          }

          return NextResponse.json({ ok: true, status: "KYC_REJECTED", kycId });
        } catch (err: any) {
          console.error("[Telegram KYC Reject Error]:", err.message);
          await answerCallbackQuery(
            cb.id,
            `⚠️ تعذر رفض الطلب: ${err.message}`,
            true
          );
          return NextResponse.json({ ok: false, error: err.message });
        }
      }

      // --- E. ORDER MANUAL RETRY ---
      if (data.startsWith("order_retry:") || data.startsWith("order_retry_")) {
        const orderId = data.replace(/^order_retry:/, "").replace(/^order_retry_/, "");
        try {
          const order = await OrderService.getOrder(orderId);
          if (!order) throw new Error("Order not found");

          await enqueueTopUpOrder({
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            amount: Number(order.amount),
            gameCode: order.product?.gameCode || "PUBG_MOBILE",
            targetId: order.targetId,
            targetZoneId: order.targetZoneId || undefined,
            packageCode: order.package?.sku || "PACKAGE_DEFAULT",
            providerCode: "MOCK_TOPUP",
          });

          await answerCallbackQuery(
            cb.id,
            `🔄 تم إرسال الطلب ${order.orderNumber} لإعادة المحاولة فوراً!`,
            true
          );

          const stamp = `\n\n━━━━━━━━━━━━━━━━━━━━━\n🔄 <b>[إعادة محاولة جارية]</b> تم طلب إعادة التنفيذ بواسطة <b>${operatorName}</b> بتاريخ <code>${timeStamp}</code>`;

          if (cb.message) {
            const currentText = cb.message.text || "";
            await editTelegramMessageText({
              chatId: cb.message.chat.id,
              messageId: cb.message.message_id,
              text: `${currentText}${stamp}`,
              reply_markup: { inline_keyboard: [] },
            });
          }

          return NextResponse.json({ ok: true, status: "ORDER_RETRIED", orderId });
        } catch (err: any) {
          console.error("[Telegram Order Retry Error]:", err.message);
          await answerCallbackQuery(
            cb.id,
            `⚠️ فشلت إعادة المحاولة: ${err.message}`,
            true
          );
          return NextResponse.json({ ok: false, error: err.message });
        }
      }

      // Fallback ACK
      await answerCallbackQuery(cb.id, "تم استلام الأمر بنجاح");
      return NextResponse.json({ ok: true });
    }

    // =========================================================================
    // 2. HANDLE TELEGRAM TEXT COMMANDS
    // =========================================================================
    if (update.message && update.message.text) {
      const msg = update.message;
      const text = String(msg.text).trim();
      const chatId = msg.chat.id;

      if (text.startsWith("/start") || text.startsWith("/help")) {
        const helpMessage = [
          `👋 <b>أهلاً بك في بوت الإشراف والعمليات لمنصة TSUNAMI!</b>`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `🛡️ <b>القنوات والمجموعات المتصلة بالبوت:</b>`,
          `• <b>توثيق الهويات:</b> <code>${TELEGRAM_CHANNELS.KYC}</code>`,
          `• <b>الإيداعات اليدوية وشام كاش:</b> <code>${TELEGRAM_CHANNELS.DEPOSITS}</code>`,
          `• <b>غرفة عمليات الشحن الحي:</b> <code>${TELEGRAM_CHANNELS.ORDERS}</code>`,
          `• <b>الأمان وتدقيق الإدارة العليا:</b> <code>${TELEGRAM_CHANNELS.SECURITY}</code>`,
          `━━━━━━━━━━━━━━━━━━━━━`,
          `⚡ <i>يتم توجيه الأحداث والإشعارات تلقائياً إلى قنواتها المحددة.</i>`,
        ].join("\n");

        await sendTelegramMessage({ chatId, text: helpMessage });
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/ping")) {
        await sendTelegramMessage({
          chatId,
          text: `🏓 <b>Pong!</b> نظام TSUNAMI Dispatcher متصل ويعمل بكفاءة فائقة.`,
        });
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith("/audit") || text.startsWith("/weekly_audit")) {
        const audit = await generateWeeklyKycAuditReport(7);
        await sendTelegramMessage({
          chatId,
          text: audit.formattedReport,
        });
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err: any) {
    console.error("[Telegram Webhook Exception]:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
