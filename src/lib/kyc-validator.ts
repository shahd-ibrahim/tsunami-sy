/**
 * TSUNAMI Smart KYC Verification Engine & Document Validator
 * Document Classification, Expiry Date Calculation Rules & Fuzzy OCR Matching
 * 
 * Rules:
 * - Case A: Temporary Protection / كملك حماية مؤقتة (starts with 99...)
 *   No explicit expiry date printed. Locate last update date (Son Güncelleme / Düzenleme Tarihi).
 *   Calculation: Valid Until = Last Update Date + 4 Years.
 * - Case B: Residence Permit / إقامة (İkamet İzni) or Driver's License / رخصة قيادة (Sürücü Belgesi)
 *   Explicitly printed expiry date (Geçerlilik / Son Geçerlilik Tarihi).
 */

export type KycDocumentType =
  | "KIMLIK_99" // حماية مؤقتة (كملك)
  | "RESIDENCE_PERMIT" // إقامة
  | "DRIVERS_LICENSE" // رخصة قيادة
  | "NATIONAL_ID" // هوية وطنية
  | "PASSPORT" // جواز سفر
  | "UNKNOWN"; // وثيقة رسمية

export interface KycValidationInput {
  userId?: string;
  fullName: string;
  nationalId: string;
  rawOcrText?: string;
  extractedName?: string;
  userEmail?: string;
  userPhone?: string;
  userNumericId?: number;
  documentTypeOverride?: KycDocumentType;
  lastUpdateDateOverride?: string;
  expiryDateOverride?: string;
}

export interface KycValidationResult {
  documentType: KycDocumentType;
  documentTypeLabel: string;
  nationalId: string;
  fullName: string;
  extractedName: string;
  userNumericId?: number;
  userEmail?: string;
  userPhone?: string;

  // Date attributes
  lastUpdateDate?: Date;
  lastUpdateDateStr?: string;
  calculatedExpiryDate?: Date;
  calculatedExpiryDateStr?: string;
  expiryDate?: Date;
  expiryDateStr?: string;

  // Status flags
  isExpired: boolean;
  validityStatusText: string;
  nameMatchScore: number;
  nameMatchText: string;
  recommendationText: string;
  botNotes: string;
}

/**
 * Normalize Arabic text for phonetic and lexical comparison
 */
export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/[\u064B-\u065F]/g, "") // tashkeel
    .replace(/[^a-zA-Z0-9\u0621-\u064A\s]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Calculate token + Levenshtein character similarity (0 - 100%)
 */
export function calculateNameSimilarity(str1: string, str2: string): number {
  const s1 = normalizeArabicText(str1);
  const s2 = normalizeArabicText(str2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  const words1 = s1.split(" ").filter(Boolean);
  const words2 = s2.split(" ").filter(Boolean);

  let matchedWords = 0;
  for (const w1 of words1) {
    if (words2.some((w2) => w2 === w1 || (w2.length > 3 && (w2.includes(w1) || w1.includes(w2))))) {
      matchedWords++;
    }
  }

  const tokenScore = (matchedWords / Math.max(words1.length, words2.length, 1)) * 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 100;

  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  const editDistance = costs[shorter.length];
  const charScore = ((longer.length - editDistance) / longer.length) * 100;

  return Math.min(100, Math.max(0, Math.round(tokenScore * 0.6 + charScore * 0.4)));
}

/**
 * Parse date string from common patterns (DD/MM/YYYY, DD.MM.YYYY, YYYY-MM-DD)
 */
export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Pattern DD[./-]MM[./-]YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Pattern YYYY[./-]MM[./-]DD
  const ymdMatch = clean.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const standard = new Date(clean);
  if (!isNaN(standard.getTime())) return standard;

  return null;
}

/**
 * Format Date to DD/MM/YYYY
 */
export function formatDateDMY(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Add specified number of years to a date
 */
export function addYearsToDate(date: Date, years: number): Date {
  const copy = new Date(date.getTime());
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

/**
 * Detect document classification based on National ID and text keywords
 */
export function detectDocumentClassification(
  nationalId: string,
  ocrText?: string,
  override?: KycDocumentType
): { type: KycDocumentType; labelAr: string } {
  if (override) {
    switch (override) {
      case "KIMLIK_99":
        return { type: "KIMLIK_99", labelAr: "حماية مؤقتة (كملك)" };
      case "RESIDENCE_PERMIT":
        return { type: "RESIDENCE_PERMIT", labelAr: "إقامة" };
      case "DRIVERS_LICENSE":
        return { type: "DRIVERS_LICENSE", labelAr: "رخصة قيادة" };
      case "NATIONAL_ID":
        return { type: "NATIONAL_ID", labelAr: "هوية وطنية" };
      case "PASSPORT":
        return { type: "PASSPORT", labelAr: "جواز سفر" };
      default:
        return { type: "UNKNOWN", labelAr: "وثيقة رسمية" };
    }
  }

  const cleanId = (nationalId || "").replace(/\D/g, "");
  const upper = (ocrText || "").toUpperCase();

  // 1. Explicit Driver's License title
  const isDriversLicense =
    upper.includes("SÜRÜCÜ BELGESİ") ||
    upper.includes("SURUCU BELGESI") ||
    upper.includes("DRIVING LICENCE") ||
    upper.includes("DRIVER LICENSE") ||
    upper.includes("رخصة قيادة") ||
    upper.includes("شهادة سياقة") ||
    upper.includes("شهادة قيادة");

  if (isDriversLicense) {
    return { type: "DRIVERS_LICENSE", labelAr: "رخصة قيادة" };
  }

  // 2. Explicit Residence Permit title (İkamet İzni)
  const isResidence =
    upper.includes("İKAMET İZNİ") ||
    upper.includes("IKAMET IZNI") ||
    upper.includes("RESIDENCE PERMIT") ||
    upper.includes("بطاقة إقامة") ||
    upper.includes("إقامة") ||
    upper.includes("اقامة");

  if (isResidence) {
    return { type: "RESIDENCE_PERMIT", labelAr: "إقامة" };
  }

  // 3. Temporary Protection (Kimlik 99)
  // Indicator: Begins with 99, or title is "GEÇİCİ KORUMA KİMLİK BELGESİ"
  const isKimlikId = cleanId.startsWith("99") && cleanId.length === 11;
  const isKimlikTitle =
    upper.includes("GEÇİCİ KORUMA") ||
    upper.includes("GECICI KORUMA") ||
    upper.includes("KİMLİK BELGESİ") ||
    upper.includes("KIMLIK BELGESI") ||
    upper.includes("حماية مؤقتة") ||
    upper.includes("كملك");

  if (isKimlikId || isKimlikTitle) {
    return { type: "KIMLIK_99", labelAr: "حماية مؤقتة (كملك)" };
  }

  // 4. National ID
  if (cleanId.length === 11) {
    return { type: "NATIONAL_ID", labelAr: "هوية وطنية" };
  }

  return { type: "UNKNOWN", labelAr: "وثيقة رسمية" };
}

/**
 * Extract all dates from text formatted as DD.MM.YYYY, DD/MM/YYYY, or YYYY-MM-DD
 */
export function extractDatesFromText(text: string): Array<{ date: Date; dateStr: string; index: number }> {
  if (!text) return [];

  // Normalize spacing around date separators (e.g. "30 . 12 . 2020" -> "30.12.2020")
  const normalized = text.replace(/(\d{1,2})\s*([./-])\s*(\d{1,2})\s*([./-])\s*(\d{4})/g, "$1$2$3$4$5");

  const results: Array<{ date: Date; dateStr: string; index: number }> = [];
  const regex = /\b(\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}[./-]\d{1,2}[./-]\d{1,2})\b/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    const raw = match[1];
    const parsed = parseDateString(raw);
    if (parsed) {
      results.push({
        date: parsed,
        dateStr: formatDateDMY(parsed),
        index: match.index,
      });
    }
  }

  return results;
}

/**
 * Locate Turkish Kimlik Last Update Date (Son Güncelleme / Düzenleme Tarihi)
 */
export function extractKimlikUpdateDate(ocrText?: string): Date | null {
  if (!ocrText) return null;

  // Normalize spaces around dots and slashes
  const clean = ocrText.replace(/(\d{1,2})\s*([./-])\s*(\d{1,2})\s*([./-])\s*(\d{4})/g, "$1$2$3$4$5");

  // Look for keywords followed by a date
  const patterns = [
    /(?:son\s*g[uü]ncelleme(?:\s*tarihi)?|g[uü]ncelleme\s*tarihi|d[uü]zenleme\s*tarihi|verili[sş]\s*tarihi|تاريخ\s*(?:آخر\s*)?تحديث(?:\s*البيانات)?|تاريخ\s*الإصدار|تاريخ\s*الاصدار)[\s\:\.\-]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
    /(?:d[uü]zenleyen|makam|belge)[\s\S]{0,40}?(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const parsed = parseDateString(match[1]);
      if (parsed) return parsed;
    }
  }

  // Fallback: If dates exist in the text, Kimlik usually has birth date first, then update date at bottom
  const allDates = extractDatesFromText(clean);
  if (allDates.length > 0) {
    // Pick the most recent date as the update date (birth dates are in the past)
    const sorted = [...allDates].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted[0].date;
  }

  return null;
}

/**
 * Locate Explicit Expiry Date for Residence Permit / Driver's License
 */
export function extractExplicitExpiryDate(ocrText?: string): Date | null {
  if (!ocrText) return null;

  const clean = ocrText.replace(/(\d{1,2})\s*([./-])\s*(\d{1,2})\s*([./-])\s*(\d{4})/g, "$1$2$3$4$5");

  const patterns = [
    /(?:ge[cç]erlilik(?:\s*tarihi)?|son\s*ge[cç]erlilik(?:\s*tarihi)?|biti[sş]\s*tarihi|son\s*kullanma|valid\s*until|expiry(?:\s*date)?|تاريخ\s*(?:الانتهاء|انتهاء|الصلاحية)|صالح\s*لغاية|ينتهي\s*في)[\s\:\.\-]*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const parsed = parseDateString(match[1]);
      if (parsed) return parsed;
    }
  }

  const allDates = extractDatesFromText(clean);
  if (allDates.length > 0) {
    // The expiry date is typically the furthest date in the future or latest date
    const sorted = [...allDates].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted[0].date;
  }

  return null;
}

/**
 * Main Smart Validation Engine
 */
export function validateKycDocument(input: KycValidationInput): KycValidationResult {
  const {
    fullName,
    nationalId,
    rawOcrText,
    extractedName,
    userNumericId,
    userEmail,
    userPhone,
    documentTypeOverride,
    lastUpdateDateOverride,
    expiryDateOverride,
  } = input;

  const cleanId = (nationalId || "").replace(/\D/g, "");
  const docClassification = detectDocumentClassification(nationalId, rawOcrText, documentTypeOverride);
  const docType = docClassification.type;
  const docTypeLabel = docClassification.labelAr;

  // Effective extracted name
  const effectiveExtractedName = extractedName?.trim() || fullName.trim();
  const nameScore = calculateNameSimilarity(fullName, effectiveExtractedName);
  const nameMatchText = nameScore >= 90 ? "مطابق 100% ✅" : `غير مطابق (${nameScore}%) ⚠️`;

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  let lastUpdateDate: Date | undefined = undefined;
  let lastUpdateDateStr: string | undefined = undefined;
  let calculatedExpiryDate: Date | undefined = undefined;
  let calculatedExpiryDateStr: string | undefined = undefined;
  let expiryDate: Date | undefined = undefined;
  let expiryDateStr: string | undefined = undefined;
  let isExpired = false;
  let validityStatusText = "سارية المفعول ✅";

  // CASE A: Temporary Protection / كملك حماية مؤقتة (starts with 99...)
  if (docType === "KIMLIK_99") {
    // 1. Locate last update date
    if (lastUpdateDateOverride) {
      lastUpdateDate = parseDateString(lastUpdateDateOverride) || undefined;
    } else {
      lastUpdateDate = extractKimlikUpdateDate(rawOcrText) || undefined;
    }

    if (lastUpdateDate) {
      lastUpdateDateStr = formatDateDMY(lastUpdateDate);
      // Valid Until = Last Update Date + 4 Years
      calculatedExpiryDate = addYearsToDate(lastUpdateDate, 4);
      calculatedExpiryDateStr = formatDateDMY(calculatedExpiryDate);
      expiryDate = calculatedExpiryDate;
      expiryDateStr = calculatedExpiryDateStr;

      const expiryMidnight = new Date(
        calculatedExpiryDate.getFullYear(),
        calculatedExpiryDate.getMonth(),
        calculatedExpiryDate.getDate()
      ).getTime();

      if (expiryMidnight < todayMidnight) {
        isExpired = true;
        validityStatusText = "منتهية الصلاحية ❌";
      } else {
        isExpired = false;
        validityStatusText = "سارية المفعول ✅";
      }
    } else {
      // Date not detectable in OCR text: require manual check
      lastUpdateDateStr = "غير محدد بالمسح الآلي";
      calculatedExpiryDateStr = "يتطلب فحص يدوي";
      validityStatusText = "بانتظار التحقق اليدوي ⚠️";
    }
  }

  // CASE B: Residence Permit (إقامة) or Driver's License (رخصة قيادة)
  else if (docType === "RESIDENCE_PERMIT" || docType === "DRIVERS_LICENSE") {
    if (expiryDateOverride) {
      expiryDate = parseDateString(expiryDateOverride) || undefined;
    } else {
      expiryDate = extractExplicitExpiryDate(rawOcrText) || undefined;
    }

    if (expiryDate) {
      expiryDateStr = formatDateDMY(expiryDate);
      const expiryMidnight = new Date(
        expiryDate.getFullYear(),
        expiryDate.getMonth(),
        expiryDate.getDate()
      ).getTime();

      if (expiryMidnight < todayMidnight) {
        isExpired = true;
        validityStatusText = "منتهية الصلاحية ❌";
      } else {
        isExpired = false;
        validityStatusText = "سارية المفعول ✅";
      }
    } else {
      expiryDateStr = "غير محدد بالمسح الآلي";
      validityStatusText = "بانتظار التحقق اليدوي ⚠️";
    }
  }

  // Standard National ID / Passport
  else {
    const isIdValid = cleanId.length >= 8 && cleanId.length <= 14;
    validityStatusText = isIdValid ? "سارية المفعول ✅" : "رقم هوية غير صالح ❌";
  }

  // Recommendation determination
  const idValid = cleanId.length >= 8 && cleanId.length <= 14;
  let recommendationText: string;

  if (isExpired) {
    recommendationText = "يرجى التدقيق يدوياً أو الرفض ❌";
  } else if (!idValid) {
    recommendationText = "يرجى التدقيق يدوياً أو الرفض ❌ (الرقم الوطني غير صحيح)";
  } else if (nameScore >= 85) {
    recommendationText = "موصى بالاعتماد ✅";
  } else {
    recommendationText = "يرجى التدقيق يدوياً أو الرفض ❌";
  }

  // Build human-readable bot notes
  const notesParts: string[] = [];
  notesParts.push(`• نوع الوثيقة: ${docTypeLabel}`);
  if (docType === "KIMLIK_99") {
    notesParts.push(`• تاريخ آخر تحديث للبيانات: ${lastUpdateDateStr || "غير محدد"}`);
    notesParts.push(`• تاريخ الصلاحية المحسوب: ${calculatedExpiryDateStr || "غير محدد"} (+4 سنوات)`);
  } else if (expiryDateStr) {
    notesParts.push(`• تاريخ انتهاء الصلاحية: ${expiryDateStr}`);
  }
  notesParts.push(`• حالة الصلاحية: ${validityStatusText}`);
  notesParts.push(`• مطابقة الاسم: ${nameMatchText}`);
  notesParts.push(`• التوصية: ${recommendationText}`);

  return {
    documentType: docType,
    documentTypeLabel: docTypeLabel,
    nationalId,
    fullName,
    extractedName: effectiveExtractedName,
    userNumericId,
    userEmail,
    userPhone,
    lastUpdateDate,
    lastUpdateDateStr,
    calculatedExpiryDate,
    calculatedExpiryDateStr,
    expiryDate,
    expiryDateStr,
    isExpired,
    validityStatusText,
    nameMatchScore: nameScore,
    nameMatchText,
    recommendationText,
    botNotes: notesParts.join("\n"),
  };
}
