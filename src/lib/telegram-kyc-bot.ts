/**
 * TSUNAMI Digital Goods & Gaming Platform
 * Private Telegram Admin Bot Service for Automated KYC Verification & Weekly Audits
 */

import fs from "fs";
import path from "path";
import { DynamicKycItem, getKycVerifications, reviewKycManual } from "./dynamic-hub";
import { formatTelegramKycReport, validateKycDocument } from "./telegram-kyc";

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramSendMessageOptions {
  chatId?: string;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard?: TelegramInlineButton[][];
  };
}

/**
 * Check if Telegram Bot credentials are configured
 */
export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  return Boolean(
    token &&
    chatId &&
    token !== "your_bot_token_from_botfather" &&
    chatId !== "-100xxxxxxxxx"
  );
}

/**
 * Send raw request to Telegram Bot API
 */
export async function telegramApiRequest(method: string, payload: Record<string, any>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === "your_bot_token_from_botfather") {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error(`[Telegram API Error] ${method}:`, err);
    return { ok: false, description: err.message };
  }
}

/**
 * Send HTML/Markdown text message to Telegram Admin chat
 */
export async function sendTelegramMessage(options: TelegramSendMessageOptions) {
  const chatId = options.chatId || process.env.TELEGRAM_KYC_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || "-1004469980167";
  if (!chatId) return { ok: false, description: "Admin Chat ID missing" };

  return await telegramApiRequest("sendMessage", {
    chat_id: chatId,
    text: options.text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: false,
    reply_markup: options.reply_markup,
  });
}

/**
 * Send photo with caption to Telegram Admin chat
 */
export async function sendTelegramPhoto(options: {
  chatId?: string;
  photoUrl: string;
  caption: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: { inline_keyboard?: TelegramInlineButton[][] };
}) {
  const chatId = options.chatId || process.env.TELEGRAM_KYC_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || "-1004469980167";
  if (!chatId) return { ok: false, description: "Admin Chat ID missing" };

  return await telegramApiRequest("sendPhoto", {
    chat_id: chatId,
    photo: options.photoUrl,
    caption: options.caption,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Send photo buffer/file directly via multipart/form-data to Telegram Admin chat
 */
export async function sendTelegramPhotoBuffer(options: {
  chatId?: string;
  buffer: Buffer;
  filename: string;
  caption: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: { inline_keyboard?: TelegramInlineButton[][] };
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || process.env.TELEGRAM_KYC_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || "-1004469980167";
  if (!token || !chatId || token === "your_bot_token_from_botfather") {
    return { ok: false, description: "Admin Chat ID or Token missing" };
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", chatId);
    const blob = new Blob([new Uint8Array(options.buffer)]);
    formData.append("photo", blob, options.filename);
    formData.append("caption", options.caption);
    formData.append("parse_mode", options.parse_mode || "HTML");
    if (options.reply_markup) {
      formData.append("reply_markup", JSON.stringify(options.reply_markup));
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: formData,
    });
    return await res.json();
  } catch (err: any) {
    console.error("[Telegram sendPhotoBuffer Error]:", err);
    return { ok: false, description: err.message };
  }
}

/**
 * Edit text of an existing message
 */
export async function editTelegramMessageText(options: {
  chatId: string | number;
  messageId: number;
  text: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: { inline_keyboard?: TelegramInlineButton[][] };
}) {
  return await telegramApiRequest("editMessageText", {
    chat_id: options.chatId,
    message_id: options.messageId,
    text: options.text,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Edit caption of an existing photo message
 */
export async function editTelegramMessageCaption(options: {
  chatId: string | number;
  messageId: number;
  caption: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: { inline_keyboard?: TelegramInlineButton[][] };
}) {
  return await telegramApiRequest("editMessageCaption", {
    chat_id: options.chatId,
    message_id: options.messageId,
    caption: options.caption,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Acknowledge Telegram callback query
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  return await telegramApiRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text || "تم تنفيذ الإجراء",
    show_alert: showAlert,
  });
}

/**
 * Build rich HTML notification card for a KYC verification submission
 * Displays document classification, last update date, calculated expiry, validity status & bot recommendation
 */
export function formatKycTelegramCard(kyc: DynamicKycItem): string {
  const validation = validateKycDocument({
    userId: kyc.userId,
    fullName: kyc.userName || "غير معروف",
    nationalId: kyc.idNumber || "",
    rawOcrText: kyc.rawOcrText || kyc.botNotes,
    extractedName: kyc.extractedName,
    userEmail: kyc.userEmail,
    userPhone: kyc.userPhone,
    userNumericId: kyc.userNumericId,
    lastUpdateDateOverride: kyc.lastUpdateDate,
    expiryDateOverride: kyc.expiryDate || kyc.calculatedExpiryDate,
  });

  return formatTelegramKycReport(validation);
}

/**
 * Escape HTML for Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send Telegram notification when a KYC document is submitted
 */
export async function notifyTelegramKycSubmission(kyc: DynamicKycItem) {
  if (!isTelegramConfigured()) {
    console.log("[Telegram KYC] Credentials not configured, skipping Telegram alert.");
    return { ok: false, reason: "NOT_CONFIGURED" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const messageText = formatKycTelegramCard(kyc);

  // Action Buttons
  const inline_keyboard: TelegramInlineButton[][] = [];

  // If still requires review, give decision buttons
  if (kyc.status === "MANUAL_REVIEW" || kyc.status === "PENDING_BOT_REVIEW") {
    inline_keyboard.push([
      { text: "✅ قبول وتوثيق", callback_data: `kyc_appr_${kyc.id}` },
      { text: "❌ رفض الطلب", callback_data: `kyc_rejc_${kyc.id}` },
    ]);
    inline_keyboard.push([
      { text: "🔄 طلب إعادة رفع الهوية", callback_data: `kyc_reup_${kyc.id}` },
    ]);
  }

  // Admin link button
  inline_keyboard.push([
    { text: "🌐 فتح لوحة التوثيق (Root Admin)", url: `${appUrl}/root-admin/kyc` },
  ]);

  const sendAdditionalPhoto = async (url?: string, label?: string) => {
    if (!url) return;
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        await sendTelegramPhoto({ photoUrl: url, caption: `📎 <b>${escapeHtml(label || "مستند إضافي")}</b>` });
      } else {
        const cleanRel = url.startsWith("/") ? url.slice(1) : url;
        const localFilePath = path.join(process.cwd(), "public", cleanRel);
        if (fs.existsSync(localFilePath)) {
          const fileBuffer = fs.readFileSync(localFilePath);
          const filename = path.basename(localFilePath);
          await sendTelegramPhotoBuffer({
            buffer: fileBuffer,
            filename,
            caption: `📎 <b>${escapeHtml(label || "مستند إضافي")}</b>`,
          });
        }
      }
    } catch (e) {
      console.warn(`[Telegram KYC] Error sending additional photo (${label}):`, e);
    }
  };

  // 1. If front image exists locally on disk, send directly as Photo Buffer
  if (kyc.idCardFrontUrl && !kyc.idCardFrontUrl.startsWith("http")) {
    try {
      const cleanRel = kyc.idCardFrontUrl.startsWith("/") ? kyc.idCardFrontUrl.slice(1) : kyc.idCardFrontUrl;
      const localFilePath = path.join(process.cwd(), "public", cleanRel);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const filename = path.basename(localFilePath);
        const photoRes = await sendTelegramPhotoBuffer({
          buffer: fileBuffer,
          filename,
          caption: messageText,
          reply_markup: { inline_keyboard },
        });

        if (photoRes.ok) {
          if (kyc.idCardBackUrl) await sendAdditionalPhoto(kyc.idCardBackUrl, "الوجه الخلفي للهوية");
          if (kyc.selfieUrl) await sendAdditionalPhoto(kyc.selfieUrl, "صورة السيلفي مع الهوية");
          return photoRes;
        }
      }
    } catch (e) {
      console.warn("[Telegram KYC] Error reading local image buffer:", e);
    }
  }

  // 2. If front image is a valid remote HTTP/HTTPS link, send as Photo URL
  const isHttpUrl = (url?: string) => Boolean(url && (url.startsWith("http://") || url.startsWith("https://")));

  if (isHttpUrl(kyc.idCardFrontUrl)) {
    const photoRes = await sendTelegramPhoto({
      photoUrl: kyc.idCardFrontUrl,
      caption: messageText,
      reply_markup: { inline_keyboard },
    });

    if (photoRes.ok) {
      if (kyc.idCardBackUrl) await sendAdditionalPhoto(kyc.idCardBackUrl, "الوجه الخلفي للهوية");
      if (kyc.selfieUrl) await sendAdditionalPhoto(kyc.selfieUrl, "صورة السيلفي مع الهوية");
      return photoRes;
    }
  }

  // 3. Fallback: send as HTML text message
  const textRes = await sendTelegramMessage({
    text: messageText,
    reply_markup: { inline_keyboard },
  });
  if (kyc.idCardBackUrl) await sendAdditionalPhoto(kyc.idCardBackUrl, "الوجه الخلفي للهوية");
  if (kyc.selfieUrl) await sendAdditionalPhoto(kyc.selfieUrl, "صورة السيلفي مع الهوية");
  return textRes;
}

/**
 * Handle Admin decision initiated via Telegram inline buttons
 */
export async function handleTelegramKycCallback(params: {
  callbackQueryId: string;
  data: string;
  fromUser: { id: number; first_name?: string; username?: string };
  message?: { message_id: number; chat: { id: number | string }; text?: string; caption?: string };
}) {
  const { callbackQueryId, data, fromUser, message } = params;
  const adminName = fromUser.username ? `@${fromUser.username}` : (fromUser.first_name || `Admin#${fromUser.id}`);

  // Prefix routing
  // data format: kyc_appr_<id>, kyc_rejc_<id>, kyc_reup_<id>
  let action: "APPROVE" | "REJECT" | "REUPLOAD" | null = null;
  let kycId = "";

  if (data.startsWith("kyc_appr_")) {
    action = "APPROVE";
    kycId = data.replace("kyc_appr_", "");
  } else if (data.startsWith("kyc_rejc_")) {
    action = "REJECT";
    kycId = data.replace("kyc_rejc_", "");
  } else if (data.startsWith("kyc_reup_")) {
    action = "REUPLOAD";
    kycId = data.replace("kyc_reup_", "");
  }

  if (!action || !kycId) {
    await answerCallbackQuery(callbackQueryId, "إجراء غير معروف", true);
    return;
  }

  const decisionReason =
    action === "APPROVE"
      ? `تم الاعتماد عبر بوت الإدارة تيليجرام بواسطة ${adminName}`
      : action === "REJECT"
      ? `تم الرفض عبر بوت الإدارة تيليجرام بواسطة ${adminName}: المستند غير مطابق للشروط`
      : `تم طلب إعادة الرفع بواسطة ${adminName}: صورة الهوية غير واضحة`;

  const updatedKyc = await reviewKycManual(
    kycId,
    action === "APPROVE" ? "APPROVE" : "REJECT",
    adminName,
    decisionReason
  );

  if (!updatedKyc) {
    await answerCallbackQuery(callbackQueryId, "⚠️ تعذر العثور على سجل التوثيق المطلوب", true);
    return;
  }

  // Answer callback notification toast in Telegram client
  const toastMessage =
    action === "APPROVE"
      ? "✅ تم قبول توثيق الهوية وتفعيل الشارة بنجاح!"
      : action === "REJECT"
      ? "❌ تم رفض طلب التوثيق وتسجيل الإشعار"
      : "🔄 تم تسجيل طلب إعادة رفع المستندات";

  await answerCallbackQuery(callbackQueryId, toastMessage, false);

  // Update existing message in Telegram to reflect decision and remove action buttons
  if (message && message.chat && message.message_id) {
    const timeString = new Date().toLocaleString("ar-SY", { timeZone: "Asia/Damascus" });
    const decisionBanner =
      action === "APPROVE"
        ? `\n\n🟢 <b>[قرار المشرف]: تمت الموافقة والاعتماد ✅</b>\n👤 <b>المشرف:</b> ${adminName}\n⏰ <i>${timeString}</i>`
        : `\n\n🔴 <b>[قرار المشرف]: تم الرفض ❌</b>\n👤 <b>المشرف:</b> ${adminName}\n📝 <b>السبب:</b> ${decisionReason}\n⏰ <i>${timeString}</i>`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tsunami-sy.com";
    const updatedKeyboard: TelegramInlineButton[][] = [
      [{ text: "🌐 فحص السجل في لوحة التحكم", url: `${appUrl}/root-admin/kyc` }],
    ];

    if (message.caption !== undefined) {
      // Photo message caption
      await editTelegramMessageCaption({
        chatId: message.chat.id,
        messageId: message.message_id,
        caption: `${message.caption}${decisionBanner}`,
        reply_markup: { inline_keyboard: updatedKeyboard },
      });
    } else if (message.text !== undefined) {
      // Text message
      await editTelegramMessageText({
        chatId: message.chat.id,
        messageId: message.message_id,
        text: `${message.text}${decisionBanner}`,
        reply_markup: { inline_keyboard: updatedKeyboard },
      });
    }
  }
}

/**
 * Generate comprehensive Weekly KYC Review & Audit Report
 */
export async function generateWeeklyKycAuditReport(days: number = 7) {
  const allRecords = await getKycVerifications();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentRecords = allRecords.filter((k) => {
    const created = new Date(k.createdAt);
    return created >= cutoffDate;
  });

  const total = recentRecords.length;
  const autoVerified = recentRecords.filter((k) => k.status === "AUTO_VERIFIED").length;
  const manualReview = recentRecords.filter((k) => k.status === "MANUAL_REVIEW").length;
  const pendingBot = recentRecords.filter((k) => k.status === "PENDING_BOT_REVIEW").length;
  const rejected = recentRecords.filter((k) => k.status === "REJECTED").length;

  const totalReviewed = autoVerified + rejected;
  const avgScore =
    total > 0
      ? Math.round(
          recentRecords.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / total
        )
      : 0;

  const autoVerifyRate = total > 0 ? Math.round((autoVerified / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  const startDateStr = cutoffDate.toLocaleDateString("ar-SY");
  const endDateStr = new Date().toLocaleDateString("ar-SY");

  const reportText = [
    `📊 <b>[TSUNAMI] تقرير التدقيق الأسبوعي لتوثيق الهويات (KYC Weekly Audit)</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🗓 <b>الفترة:</b> من ${startDateStr} إلى ${endDateStr} (${days} أيام)`,
    `👥 <b>إجمالي الطلبات المستلمة:</b> <b>${total} طلب</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <b>مؤشرات التحقق الذكي والاعتماد:</b>`,
    `• ✅ <b>تم التوثيق والقبول:</b> <b>${autoVerified}</b> (${autoVerifyRate}%)`,
    `• ⏳ <b>بانتظار تدقيق المشرف:</b> <b>${manualReview + pendingBot}</b>`,
    `• ❌ <b>طلبات مرفوضة:</b> <b>${rejected}</b> (${rejectionRate}%)`,
    `• 🎯 <b>متوسط نسبة تطابق الـ OCR:</b> <b>${avgScore}%</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🔍 <b>تقييم الأداء الأمني:</b>`,
    autoVerifyRate >= 70
      ? `🟢 <i>معدل التوثيق الآلي ممتاز ويسرّع خدمة العملاء مع الحفاظ على الأمان.</i>`
      : `🟡 <i>نسبة المراجعة اليدوية مرتفعة؛ يوصى بمراجعة جودة صور البطاقات المرفوعة من العملاء.</i>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🚀 <i>تم توليد هذا التقرير آلياً بواسطة نظام الرقابة المركزي لمنصة TSUNAMI.</i>`,
  ].join("\n");

  return {
    periodDays: days,
    startDate: startDateStr,
    endDate: endDateStr,
    totalSubmissions: total,
    autoVerified,
    manualReview: manualReview + pendingBot,
    rejected,
    avgScore,
    autoVerifyRate,
    rejectionRate,
    formattedReport: reportText,
  };
}

/**
 * Send Weekly KYC Audit directly to Telegram Admin Group
 */
export async function sendWeeklyKycAuditToTelegram(days: number = 7) {
  if (!isTelegramConfigured()) {
    return { ok: false, error: "Telegram credentials are not configured" };
  }

  const audit = await generateWeeklyKycAuditReport(days);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tsunami-sy.com";

  const res = await sendTelegramMessage({
    text: audit.formattedReport,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📋 مراجعة الطلبات المعلقة", callback_data: "cmd_pending_kyc" },
          { text: "🌐 فتح لوحة التحكم", url: `${appUrl}/root-admin/kyc` },
        ],
      ],
    },
  });

  return { ok: res.ok, result: res, audit };
}

/**
 * Test Telegram connection and send a test ping to the configured admin chat
 */
export async function testTelegramConnection() {
  if (!isTelegramConfigured()) {
    return {
      success: false,
      message: "لم يتم ضبط متغيرات TELEGRAM_BOT_TOKEN أو TELEGRAM_ADMIN_CHAT_ID في ملف .env",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const now = new Date().toLocaleString("ar-SY", { timeZone: "Asia/Damascus" });

  const testMessage = [
    `🤖 <b>[TSUNAMI] اختبار اتصال بوت الإدارة المركزي بنجاح!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📡 <b>الحالة:</b> متصل بالخادم وتدفق الـ Webhook نشط`,
    `⏰ <b>التوقيت المحلي:</b> ${now}`,
    `🛡️ <b>وظائف البوت:</b>`,
    `  • إشعارات تدقيق الهويات KYC الفورية`,
    `  • مراجعة واعتماد المستندات من تيليجرام مباشرة`,
    `  • إرسال تقارير التدقيق الأسبوعية`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🚀 <i>منصة تسونامي للخدمات الرقمية وشحن الألعاب</i>`,
  ].join("\n");

  const res = await sendTelegramMessage({
    text: testMessage,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 الانتقال للوحة الإدارة", url: `${appUrl}/root-admin/kyc` }],
      ],
    },
  });

  if (res.ok) {
    return { success: true, message: "تم إرسال إشعار الاختبار بنجاح إلى مجموعة الإدارة على تيليجرام!" };
  } else {
    return { success: false, message: `فشل الإرسال: ${res.description || "خطأ غير متوقع"}` };
  }
}
