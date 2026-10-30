/**
 * TSUNAMI Digital Goods & Gaming Platform
 * Dedicated Multi-Group Telegram Dispatcher & Event Router
 *
 * Operational Channels:
 * 1. KYC Verification: TELEGRAM_KYC_CHAT_ID (-1004469980167)
 * 2. Manual Deposits & Receipts: TELEGRAM_DEPOSITS_CHAT_ID (-4885671656)
 * 3. Automated Orders & Dispatch: TELEGRAM_ORDERS_CHAT_ID (-5527645465)
 * 4. Admin Alerts & Security: TELEGRAM_SECURITY_CHAT_ID (-5504890302)
 */

import fs from "fs";
import path from "path";

export const TELEGRAM_CHANNELS = {
  KYC: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_KYC_CHAT_ID || "-1004469980167",
  DEPOSITS: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_DEPOSITS_CHAT_ID || "-1004469980167",
  ORDERS: process.env.TELEGRAM_ORDERS_CHAT_ID || "-5527645465",
  SECURITY: process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_SECURITY_CHAT_ID || "-5504890302",
};

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramSendMessageOptions {
  chatId: string;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: {
    inline_keyboard?: TelegramInlineButton[][];
  };
}

export interface TelegramSendPhotoOptions {
  chatId: string;
  photoUrl: string;
  caption: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: {
    inline_keyboard?: TelegramInlineButton[][];
  };
}

export interface TelegramSendPhotoBufferOptions {
  chatId: string;
  buffer: Buffer;
  filename: string;
  caption: string;
  parse_mode?: "HTML" | "Markdown";
  reply_markup?: {
    inline_keyboard?: TelegramInlineButton[][];
  };
}

/**
 * Check if Telegram Bot credentials are configured
 */
export function isTelegramConfigured(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return Boolean(
    token &&
    token !== "your_bot_token_from_botfather" &&
    token.length > 20
  );
}

/**
 * Raw Telegram Bot API request executor
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
    console.error(`[Telegram API Error] ${method}:`, err.message);
    return { ok: false, description: err.message };
  }
}

/**
 * Send HTML/Markdown text message to a specific Telegram channel
 */
export async function sendTelegramMessage(options: TelegramSendMessageOptions) {
  const chatId = options.chatId || TELEGRAM_CHANNELS.SECURITY;
  return await telegramApiRequest("sendMessage", {
    chat_id: chatId,
    text: options.text,
    parse_mode: options.parse_mode || "HTML",
    disable_web_page_preview: false,
    reply_markup: options.reply_markup,
  });
}

/**
 * Send photo via public URL with caption and inline keyboard
 */
export async function sendTelegramPhoto(options: TelegramSendPhotoOptions) {
  const chatId = options.chatId || TELEGRAM_CHANNELS.DEPOSITS;
  return await telegramApiRequest("sendPhoto", {
    chat_id: chatId,
    photo: options.photoUrl,
    caption: options.caption,
    parse_mode: options.parse_mode || "HTML",
    reply_markup: options.reply_markup,
  });
}

/**
 * Send photo buffer/file from disk with caption and inline keyboard
 */
export async function sendTelegramPhotoBuffer(options: TelegramSendPhotoBufferOptions) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = options.chatId || TELEGRAM_CHANNELS.DEPOSITS;
  if (!token || token === "your_bot_token_from_botfather") {
    return { ok: false, description: "Token missing" };
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
    console.error("[Telegram sendPhotoBuffer Error]:", err.message);
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
 * Acknowledge Telegram callback query (shows notification/toast in Telegram client)
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

function escapeHtml(text: string): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function getValidTelegramUrl(subPath: string = ""): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl =
    envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")
      ? envUrl.replace(/\/$/, "")
      : "https://tsunami-sy.com";
  const cleanPath = subPath.startsWith("/") ? subPath : `/${subPath}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Helper to reliably send image to Telegram as buffer (if local/localhost) or URL (if external)
 */
async function sendTelegramImageOrBuffer(options: {
  chatId: string;
  imageUrl: string;
  caption: string;
  reply_markup?: { inline_keyboard?: TelegramInlineButton[][] };
}): Promise<{ ok: boolean; [key: string]: any }> {
  const { chatId, imageUrl, caption, reply_markup } = options;
  if (!imageUrl) return { ok: false, description: "No image URL" };

  try {
    let localRelPath: string | null = null;
    if (imageUrl.startsWith("/")) {
      localRelPath = imageUrl.slice(1);
    } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      try {
        const parsed = new URL(imageUrl);
        if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
          localRelPath = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
        }
      } catch {}
    }

    if (localRelPath) {
      const fullPath = path.join(process.cwd(), "public", localRelPath);
      if (fs.existsSync(fullPath)) {
        const buffer = fs.readFileSync(fullPath);
        const filename = path.basename(fullPath);
        return await sendTelegramPhotoBuffer({
          chatId,
          buffer,
          filename,
          caption,
          reply_markup,
        });
      }
    }

    // Remote URL
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return await sendTelegramPhoto({
        chatId,
        photoUrl: imageUrl,
        caption,
        reply_markup,
      });
    }
  } catch (err: any) {
    console.warn("[Telegram sendTelegramImageOrBuffer Error]:", err.message);
  }

  return { ok: false, description: "Unable to send image as buffer or URL" };
}

// =========================================================================
// 1. MANUAL DEPOSITS GROUP ROUTER (TELEGRAM_ADMIN_CHAT_ID: -1004469980167)
// =========================================================================

export interface DepositAlertPayload {
  id: string;
  depositNumber: string;
  userId: string;
  userNumericId?: number | string;
  userName?: string;
  amount: number | string;
  currency?: string;
  method: string;
  senderName?: string | null;
  senderAccountOrPhone?: string | null;
  transferReference?: string | null;
  receiptImageUrl?: string | null;
  createdAt?: string;
}

/**
 * Dispatches a rich manual deposit notification with attached receipt and action buttons
 */
export async function dispatchDepositAlert(deposit: DepositAlertPayload) {
  if (!isTelegramConfigured()) return { ok: false, reason: "NOT_CONFIGURED" };

  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || TELEGRAM_CHANNELS.DEPOSITS || "-1004469980167";

  const uId = deposit.userNumericId ? `#${deposit.userNumericId}` : deposit.userId.slice(0, 8);
  const uName = escapeHtml(deposit.userName || deposit.senderName || "عميل تسونامي");
  const phone = escapeHtml(deposit.senderAccountOrPhone || "غير محدد");
  const ref = escapeHtml(deposit.transferReference || deposit.depositNumber);
  const formattedAmount = Number(deposit.amount).toFixed(2);
  const timeStr = new Date(deposit.createdAt || Date.now()).toLocaleString("ar-SY", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const caption = [
    `💵 <b>[TSUNAMI] إشعار إيداع جديد يتطلب المراجعة</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>العميل:</b> ${uName} (<code>${uId}</code>)`,
    `💰 <b>المبلغ المحول:</b> <b>$${formattedAmount} USD</b>`,
    `🏦 <b>بوابة الدفع:</b> <b>${escapeHtml(deposit.method)}</b>`,
    `📱 <b>حساب / هاتف المحول:</b> <code>${phone}</code>`,
    `🔖 <b>مرجع التحويل / TxID:</b> <code>${ref}</code>`,
    `🔢 <b>رقم الإيداع:</b> <code>${deposit.depositNumber}</code>`,
    `📅 <b>التوقيت:</b> ${timeStr}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>اضغط على أحد الأزرار أدناه للاعتماد وتنزيل الرصيد تلقائياً أو الرفض:</i>`,
  ].join("\n");

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: "💵 اعتماد وتنزيل الرصيد", callback_data: `deposit_approve:${deposit.id}` },
      { text: "❌ رفض الإيصال", callback_data: `deposit_reject:${deposit.id}` },
    ],
    [
      { text: "🌐 مراجعة في لوحة الإيداعات", url: getValidTelegramUrl("/root-admin/deposits") },
    ],
  ];

  // Try sending receipt photo if available
  if (deposit.receiptImageUrl) {
    const photoRes = await sendTelegramImageOrBuffer({
      chatId,
      imageUrl: deposit.receiptImageUrl,
      caption,
      reply_markup: { inline_keyboard },
    });
    if (photoRes && photoRes.ok) return photoRes;
  }

  // Fallback to text message
  return await sendTelegramMessage({
    chatId,
    text: caption,
    reply_markup: { inline_keyboard },
  });
}

// =========================================================================
// 2. KYC VERIFICATION GROUP ROUTER (TELEGRAM_ADMIN_CHAT_ID: -1004469980167)
// =========================================================================

export interface KycAlertPayload {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userNumericId?: number | string;
  idNumber?: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string | null;
  matchScore?: number;
  status?: string;
  botNotes?: string | null;
  createdAt?: string;
}

/**
 * Dispatches a KYC identity verification alert with document photos and approval buttons
 */
export async function dispatchKycAlert(kyc: KycAlertPayload) {
  if (!isTelegramConfigured()) return { ok: false, reason: "NOT_CONFIGURED" };

  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || TELEGRAM_CHANNELS.KYC || "-1004469980167";

  const uId = kyc.userNumericId ? `#${kyc.userNumericId}` : (kyc.userId ? (kyc.userId.length > 12 ? kyc.userId.slice(0, 10) : kyc.userId) : "غير محدد");
  const uName = escapeHtml(kyc.userName || "مستخدم جديد");
  const idNum = escapeHtml(kyc.idNumber || "غير متوفر");
  const phone = escapeHtml(kyc.userPhone || "غير مسجل");
  const score = kyc.matchScore ?? 0;
  const isAutoPassed = kyc.status === "AUTO_VERIFIED" || score >= 85;

  const statusBadge = isAutoPassed
    ? "🟢 مطابق وموثق آلياً"
    : "🟡 يتطلب تدقيق ومراجعة المشرف";

  const validationNote = kyc.botNotes
    ? escapeHtml(kyc.botNotes)
    : "فحص الصلاحية والمطابقة بالذكاء الاصطناعي (Kimlik 99 / Expiry Check)";

  const caption = [
    `🛡️ <b>[TSUNAMI] طلب توثيق هوية جديد (KYC)</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>الاسم الكامل:</b> ${uName}`,
    `🆔 <b>الرقم الوطني / الهوية:</b> <code>${idNum}</code>`,
    `📱 <b>رقم الهاتف:</b> <code>${phone}</code>`,
    `🔢 <b>معرف المستخدم:</b> <code>${escapeHtml(kyc.userId)}</code> (${uId})`,
    `📊 <b>حالة الفحص:</b> ${statusBadge}`,
    `📝 <b>ملاحظة التحقق:</b> <i>${validationNote}</i>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `⚡ <i>اختر الإجراء المناسب لتوثيق الحساب أو رفض المستندات:</i>`,
  ].filter(Boolean).join("\n");

  const inline_keyboard: TelegramInlineButton[][] = [
    [
      { text: "✅ اعتماد الحساب", callback_data: `kyc_approve:${kyc.userId}` },
      { text: "❌ رفض", callback_data: `kyc_reject:${kyc.userId}` },
    ],
    [
      { text: "🌐 مراجعة في لوحة التوثيق", url: getValidTelegramUrl("/root-admin/kyc") },
    ],
  ];

  // Send front ID photo if available
  if (kyc.idCardFrontUrl) {
    const frontRes = await sendTelegramImageOrBuffer({
      chatId,
      imageUrl: kyc.idCardFrontUrl,
      caption,
      reply_markup: { inline_keyboard },
    });

    if (frontRes && frontRes.ok) {
      // Send back photo if available
      if (kyc.idCardBackUrl) {
        await sendTelegramImageOrBuffer({
          chatId,
          imageUrl: kyc.idCardBackUrl,
          caption: `📎 <b>الوجه الخلفي للهوية:</b> ${uName}`,
        });
      }
      return frontRes;
    }
  }

  // Fallback to text message
  return await sendTelegramMessage({
    chatId,
    text: caption,
    reply_markup: { inline_keyboard },
  });
}


// =========================================================================
// 3. LIVE OPERATIONS GROUP ROUTER (TELEGRAM_ORDERS_CHAT_ID: -5527645465)
// =========================================================================

export interface OrderAlertPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  gameCode: string;
  gameName?: string;
  packageCode: string;
  packageName?: string;
  targetId: string;
  targetZoneId?: string;
  playerNickname?: string;
  amount: number | string;
  costPrice?: number | string;
  providerCode?: string;
  providerTxId?: string;
  errorMessage?: string;
}

/**
 * Dispatches a success alert when an order is completed via provider
 */
export async function dispatchOrderSuccessAlert(order: OrderAlertPayload) {
  if (!isTelegramConfigured()) return { ok: false, reason: "NOT_CONFIGURED" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tsunami-sy.com";
  const chatId = TELEGRAM_CHANNELS.ORDERS;

  const sellingPrice = Number(order.amount).toFixed(2);
  const cost = order.costPrice ? Number(order.costPrice).toFixed(2) : (Number(order.amount) * 0.9).toFixed(2);
  const netProfit = (Number(sellingPrice) - Number(cost)).toFixed(2);
  const profitMargin = Number(sellingPrice) > 0 ? (((Number(sellingPrice) - Number(cost)) / Number(sellingPrice)) * 100).toFixed(1) : "0.0";

  const zoneText = order.targetZoneId ? ` | Zone: <code>${escapeHtml(order.targetZoneId)}</code>` : "";
  const nickText = order.playerNickname ? ` (${escapeHtml(order.playerNickname)})` : "";

  const text = [
    `🟢 <b>[TSUNAMI] تم تنفيذ طلب شحن فوري بنجاح ✓</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🎮 <b>اللعبة / الخدمة:</b> <b>${escapeHtml(order.gameName || order.gameCode)}</b>`,
    `🎯 <b>معرف اللاعب:</b> <code>${escapeHtml(order.targetId)}</code>${nickText}${zoneText}`,
    `📦 <b>الباقة / الرمز:</b> <code>${escapeHtml(order.packageName || order.packageCode)}</code>`,
    `🔢 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>`,
    `💵 <b>سعر البيع للعميل:</b> $${sellingPrice} USD`,
    `🏷️ <b>سعر التكلفة (Wholesale):</b> $${cost} USD`,
    `📈 <b>صافي الربح:</b> <b>+$${netProfit} USD</b> (${profitMargin}%)`,
    `⚡ <b>بوابة المزود:</b> <code>${escapeHtml(order.providerCode || "MOCK_TOPUP")}</code>`,
    order.providerTxId ? `🔖 <b>مرجع المزود:</b> <code>${escapeHtml(order.providerTxId)}</code>` : "",
    `━━━━━━━━━━━━━━━━━━━━━`,
  ].filter(Boolean).join("\n");

  return await sendTelegramMessage({
    chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 مراجعة الطلب في لوحة التحكم", url: getValidTelegramUrl("/root-admin/orders") }],
      ],
    },
  });
}

/**
 * Dispatches an urgent failure/warning alert when an automated order fails
 */
export async function dispatchOrderFailureAlert(order: OrderAlertPayload) {
  if (!isTelegramConfigured()) return { ok: false, reason: "NOT_CONFIGURED" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tsunami-sy.com";
  const chatId = TELEGRAM_CHANNELS.ORDERS;

  const amountStr = Number(order.amount).toFixed(2);
  const zoneText = order.targetZoneId ? ` | Zone: <code>${escapeHtml(order.targetZoneId)}</code>` : "";

  const text = [
    `🔴 <b>[TSUNAMI] تنبيه عاجل: فشل تنفيذ طلب شحن!</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🎮 <b>اللعبة / الخدمة:</b> <b>${escapeHtml(order.gameName || order.gameCode)}</b>`,
    `🎯 <b>معرف اللاعب (UID):</b> <code>${escapeHtml(order.targetId)}</code>${zoneText}`,
    `📦 <b>الباقة:</b> <code>${escapeHtml(order.packageName || order.packageCode)}</code>`,
    `🔢 <b>رقم الطلب:</b> <code>${order.orderNumber}</code>`,
    `💰 <b>قيمة الطلب:</b> $${amountStr} USD`,
    `⚠️ <b>سبب الخطأ:</b> <code>${escapeHtml(order.errorMessage || "فشل رد المزود الخارجي")}</code>`,
    `🛡️ <b>إجراء الأمان:</b> تم استرجاع الرصيد تلقائياً إلى محفظة العميل`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👨‍💻 <i>يرجى من المشرف التدخل لإعادة المعالجة يدوياً أو تفقد رصيد المزود:</i>`,
  ].join("\n");

  return await sendTelegramMessage({
    chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔄 إعادة المحاولة يدوياً", callback_data: `order_retry:${order.orderId}` },
          { text: "🌐 فحص في لوحة التحكم", url: getValidTelegramUrl("/root-admin/orders") },
        ],
      ],
    },
  });
}

// =========================================================================
// 4. SECURITY & ROOT GROUP ROUTER (TELEGRAM_SECURITY_CHAT_ID: -5504890302)
// =========================================================================

export interface SecurityAlertPayload {
  type: "ADMIN_BALANCE_INJECTION" | "PROVIDER_LOW_BALANCE" | "SECURITY_EXCEPTION" | "SUSPICIOUS_LOGIN";
  title?: string;
  operatorName?: string;
  operatorEmail?: string;
  targetAdminName?: string;
  targetAdminId?: string;
  amount?: number | string;
  note?: string;
  providerName?: string;
  providerCode?: string;
  currentBalance?: number | string;
  threshold?: number | string;
  details?: string;
  ip?: string;
}

/**
 * Dispatches a high-priority security or root admin operational alert
 */
export async function dispatchSecurityAlert(alert: SecurityAlertPayload) {
  if (!isTelegramConfigured()) return { ok: false, reason: "NOT_CONFIGURED" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tsunami-sy.com";
  const chatId = TELEGRAM_CHANNELS.SECURITY;
  const timeStr = new Date().toLocaleString("ar-SY", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let text = "";

  if (alert.type === "ADMIN_BALANCE_INJECTION") {
    text = [
      `🚨 <b>[تدقيق أمان TSUNAMI] شحن رصيد تشغيلي لمشرف فرعي</b>`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `👑 <b>المنفذ (Root Super-Admin):</b> ${escapeHtml(alert.operatorName || "المشرف العام")} (${escapeHtml(alert.operatorEmail || "root@tsunami-sy.com")})`,
      `👨‍💼 <b>المشرف المستلم:</b> ${escapeHtml(alert.targetAdminName || "مشرف")} (<code>${alert.targetAdminId}</code>)`,
      `💵 <b>المبلغ المشحون:</b> <b>$${Number(alert.amount).toFixed(2)} USD</b>`,
      alert.note ? `📝 <b>البيان / الملاحظة:</b> <i>${escapeHtml(alert.note)}</i>` : "",
      `📅 <b>التوقيت:</b> ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `🔒 <i>تم تسجيل هذا الإجراء في سجل التدقيق الأمني لمنع أي تجاوزات.</i>`,
    ].filter(Boolean).join("\n");
  } else if (alert.type === "PROVIDER_LOW_BALANCE") {
    text = [
      `⚠️ <b>[تحذير أمان TSUNAMI] انخفاض رصيد مزود الشحن Wholesale!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `🔌 <b>المزود:</b> <b>${escapeHtml(alert.providerName || "مزود خارجي")}</b> (<code>${escapeHtml(alert.providerCode || "PROVIDER")}</code>)`,
      `📉 <b>الرصيد المتاح حالياً:</b> <b>$${Number(alert.currentBalance).toFixed(2)} USD</b>`,
      `🛑 <b>الحد الأدنى الآمن:</b> $${Number(alert.threshold).toFixed(2)} USD`,
      `📅 <b>التوقيت:</b> ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `⚡ <i>يرجى شحن رصيد المزود فوراً لتجنب توقف أو فشل طلبات الشحن التلقائية.</i>`,
    ].join("\n");
  } else {
    text = [
      `🛡️ <b>[تنبيه أمان واستثناءات TSUNAMI] ${escapeHtml(alert.title || "تنبيه أمني")}</b>`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📌 <b>النوع:</b> <code>${alert.type}</code>`,
      alert.details ? `📝 <b>التفاصيل:</b> <code>${escapeHtml(alert.details)}</code>` : "",
      alert.ip ? `🌐 <b>عنوان IP:</b> <code>${alert.ip}</code>` : "",
      `📅 <b>التوقيت:</b> ${timeStr}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
    ].filter(Boolean).join("\n");
  }

  return await sendTelegramMessage({
    chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌐 لوحة التحكم والأمان (Root)", url: getValidTelegramUrl("/root-admin") }],
      ],
    },
  });
}
