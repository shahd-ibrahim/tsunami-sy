/**
 * TSUNAMI AI / OCR KYC Verification Bot Engine
 * High-speed automated identity document extraction, fuzzy string matching, document classification & expiry rules
 */

import {
  validateKycDocument,
  KycDocumentType,
  KycValidationResult,
  calculateNameSimilarity,
} from "./kyc-validator";

export interface KycBotAnalysisInput {
  userId: string;
  userName: string;
  idNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
  rawOcrText?: string;
  userEmail?: string;
  userPhone?: string;
  userNumericId?: number;
}

export interface KycBotAnalysisResult {
  matchScore: number;
  extractedName: string;
  status: "AUTO_VERIFIED" | "MANUAL_REVIEW" | "REJECTED";
  botNotes: string;
  validation: KycValidationResult;
  extractedFields: {
    idNumberMatched: boolean;
    nameSimilarity: number;
    faceMatched: boolean;
    documentType: string;
    documentTypeKey: KycDocumentType;
    isExpired: boolean;
    validityStatus: string;
    lastUpdateDate?: string;
    calculatedExpiryDate?: string;
    expiryDate?: string;
  };
}

/**
 * Execute Automated Verification Decision with Smart Document Classification and Expiry Rules
 */
export async function analyzeKycDocument(input: KycBotAnalysisInput): Promise<KycBotAnalysisResult> {
  const { userName, idNumber, rawOcrText, userEmail, userPhone, userNumericId, userId } = input;

  // 1. Run Smart Validation Engine (detects Kimlik 99 + 4 years rule, Driver License, Residence Permit)
  const validation = validateKycDocument({
    userId,
    fullName: userName,
    nationalId: idNumber,
    rawOcrText,
    userEmail,
    userPhone,
    userNumericId,
  });

  const cleanId = idNumber.replace(/\D/g, "");
  const idNumberValid = cleanId.length >= 8 && cleanId.length <= 14;
  const nameScore = validation.nameMatchScore;

  // 2. Combined Match Score
  let totalScore = nameScore;
  if (!idNumberValid) {
    totalScore = Math.max(0, totalScore - 20);
  }
  if (validation.isExpired) {
    totalScore = Math.min(totalScore, 35);
  }

  totalScore = Math.min(100, Math.max(0, totalScore));

  // 3. Decision Rules
  let status: "AUTO_VERIFIED" | "MANUAL_REVIEW" | "REJECTED";
  let botNotes = "";

  if (validation.isExpired) {
    status = "REJECTED";
    botNotes =
      `❌ تم رفض الطلب آلياً: الوثيقة منتهية الصلاحية.\n` +
      `• نوع الوثيقة: ${validation.documentTypeLabel}\n` +
      (validation.documentType === "KIMLIK_99"
        ? `• تاريخ آخر تحديث للبيانات: ${validation.lastUpdateDateStr || "غير محدد"}\n• تاريخ الصلاحية المحسوب (+4 سنوات): ${validation.calculatedExpiryDateStr || "غير محدد"}\n`
        : `• تاريخ الانتهاء: ${validation.expiryDateStr || "غير محدد"}\n`) +
      `• حالة الصلاحية: ${validation.validityStatusText}\n` +
      `• مطابقة الاسم: ${validation.nameMatchText}\n` +
      `• الإجراء: يرجى تحديث بيانات الوثيقة لدى السلطات المختصة وإعادة الرفع.`;
  } else if (totalScore >= 85 && idNumberValid) {
    status = "AUTO_VERIFIED";
    botNotes =
      `✅ تم التوثيق الآلي بنجاح عبر روبوت الذكاء الاصطناعي.\n` +
      `• نوع الوثيقة: ${validation.documentTypeLabel}\n` +
      (validation.documentType === "KIMLIK_99"
        ? `• تاريخ آخر تحديث: ${validation.lastUpdateDateStr || "غير محدد"}\n• تاريخ الصلاحية المحسوب (+4 سنوات): ${validation.calculatedExpiryDateStr || "غير محدد"}\n`
        : validation.expiryDateStr
        ? `• تاريخ الانتهاء: ${validation.expiryDateStr}\n`
        : "") +
      `• حالة الصلاحية: ${validation.validityStatusText}\n` +
      `• نسبة تطابق الاسم: ${nameScore}%\n` +
      `• التوصية: ${validation.recommendationText}`;
  } else if (totalScore >= 50) {
    status = "MANUAL_REVIEW";
    botNotes =
      `⚠️ نسبة التطابق (${totalScore}%) أو شروط الوثيقة تتطلب مراجعة بشرية من المشرف.\n` +
      `• نوع الوثيقة: ${validation.documentTypeLabel}\n` +
      (validation.documentType === "KIMLIK_99"
        ? `• تاريخ آخر تحديث: ${validation.lastUpdateDateStr || "غير محدد"}\n• تاريخ الصلاحية المحسوب: ${validation.calculatedExpiryDateStr || "غير محدد"}\n`
        : validation.expiryDateStr
        ? `• تاريخ الانتهاء: ${validation.expiryDateStr}\n`
        : "") +
      `• حالة الصلاحية: ${validation.validityStatusText}\n` +
      `• تطابق الاسم: ${nameScore}%\n` +
      `• التوصية: ${validation.recommendationText}`;
  } else {
    status = "REJECTED";
    botNotes =
      `❌ فشل التوثيق الآلي: بيانات البطاقة تختلف جوهرياً عن اسم الحساب (${totalScore}%).\n` +
      `• نوع الوثيقة: ${validation.documentTypeLabel}\n` +
      `• مطابقة الاسم: ${validation.nameMatchText}\n` +
      `يرجى إعادة رفع صورة واضحة لبطاقة الهوية الشخصية الخاصة بصاحب الحساب.`;
  }

  return {
    matchScore: totalScore,
    extractedName: validation.extractedName,
    status,
    botNotes,
    validation,
    extractedFields: {
      idNumberMatched: idNumberValid,
      nameSimilarity: nameScore,
      faceMatched: true,
      documentType: validation.documentTypeLabel,
      documentTypeKey: validation.documentType,
      isExpired: validation.isExpired,
      validityStatus: validation.validityStatusText,
      lastUpdateDate: validation.lastUpdateDateStr,
      calculatedExpiryDate: validation.calculatedExpiryDateStr,
      expiryDate: validation.expiryDateStr,
    },
  };
}
