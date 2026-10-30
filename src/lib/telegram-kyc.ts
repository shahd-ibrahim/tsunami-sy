/**
 * Telegram KYC Notification & Inspection Report Service
 * Formats rich inspection reports with smart document classification & expiry rules
 */

import {
  KycValidationInput,
  KycValidationResult,
  validateKycDocument,
} from "./kyc-validator";

/**
 * Escape HTML special characters for Telegram HTML mode
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build Structured Telegram Inspection Report matching task specification:
 * 
 * 🆔 طلب توثيق حساب جديد (KYC)
 * ━━━━━━━━━━━━━━━━━━━━━
 * 👤 الاسم المدخل: {fullName}
 * 🔢 الرقم الوطني: {nationalId}
 * 🆔 معرف الحساب: #{userNumericId}
 * 📧 البريد: {email}
 * 📱 الهاتف: {phone}
 * 
 * 📋 نتيجة الفحص والتدقيق الآلي:
 * • نوع الوثيقة: {حماية مؤقتة (كملك) | إقامة | رخصة قيادة}
 * • تاريخ آخر تحديث للبيانات: {lastUpdateDate} (في حال الكملك)
 * • تاريخ الصلاحية المحسوب: {calculatedExpiryDate} (+4 سنوات)
 * • حالة الصلاحية: {سارية المفعول ✅ | منتهية الصلاحية ❌}
 * • مطابقة الاسم: {مطابق 100% ✅ | غير مطابق ⚠️}
 * ━━━━━━━━━━━━━━━━━━━━━
 * ⚠️ توصية البوت: {موصى بالاعتماد ✅ | يرجى التدقيق يدوياً أو الرفض ❌}
 */
export function formatTelegramKycReport(result: KycValidationResult): string {
  const userIdentifier = result.userNumericId ? `#${result.userNumericId}` : "غير محدد";
  const email = result.userEmail || "غير متوفر";
  const phone = result.userPhone || "غير متوفر";

  const lines: string[] = [
    `🆔 <b>طلب توثيق حساب جديد (KYC)</b>`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 <b>الاسم المدخل:</b> ${escapeTelegramHtml(result.fullName)}`,
    `🔢 <b>الرقم الوطني:</b> <code>${escapeTelegramHtml(result.nationalId)}</code>`,
    `🆔 <b>معرف الحساب:</b> <code>${userIdentifier}</code>`,
    `📧 <b>البريد:</b> ${escapeTelegramHtml(email)}`,
    `📱 <b>الهاتف:</b> ${escapeTelegramHtml(phone)}`,
    ``,
    `📋 <b>نتيجة الفحص والتدقيق الآلي:</b>`,
    `• نوع الوثيقة: <b>${escapeTelegramHtml(result.documentTypeLabel)}</b>`,
  ];

  if (result.documentType === "KIMLIK_99") {
    lines.push(`• تاريخ آخر تحديث للبيانات: <code>${result.lastUpdateDateStr || "غير محدد"}</code> (في حال الكملك)`);
    lines.push(`• تاريخ الصلاحية المحسوب: <code>${result.calculatedExpiryDateStr || "غير محدد"}</code> (+4 سنوات)`);
  } else if (result.expiryDateStr && (result.documentType === "RESIDENCE_PERMIT" || result.documentType === "DRIVERS_LICENSE")) {
    lines.push(`• تاريخ انتهاء الصلاحية: <code>${result.expiryDateStr}</code>`);
  }

  lines.push(`• حالة الصلاحية: <b>${result.validityStatusText}</b>`);
  lines.push(`• مطابقة الاسم: <b>${result.nameMatchText}</b>`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⚠️ <b>توصية البوت:</b> <b>${result.recommendationText}</b>`);

  return lines.join("\n");
}

/**
 * Generate formatted report directly from submission inputs
 */
export function generateTelegramKycReport(input: KycValidationInput): {
  reportText: string;
  validation: KycValidationResult;
} {
  const validation = validateKycDocument(input);
  const reportText = formatTelegramKycReport(validation);
  return { reportText, validation };
}

// Re-export core validators for convenience
export * from "./kyc-validator";

/**
 * Dispatch real-time KYC notification to the configured Telegram Admin group
 */
export async function dispatchKycToTelegram(payload: {
  userId: string;
  userName: string;
  idNumber: string;
  userPhone?: string;
  userNumericId?: number | string;
  idCardFrontUrl: string;
  idCardBackUrl?: string | null;
  botNotes?: string;
  matchScore?: number;
  status?: string;
}) {
  const { dispatchKycAlert } = await import("./telegram");
  return await dispatchKycAlert({
    id: `kyc-${Date.now()}`,
    ...payload,
  });
}
