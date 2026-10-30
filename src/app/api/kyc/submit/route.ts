import { NextRequest, NextResponse } from "next/server";
import { submitKycVerification } from "@/lib/dynamic-hub";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let userId = "";
    let userName = "";
    let idNumber = "";
    let idCardFrontUrl = "";
    let idCardBackUrl: string | undefined = undefined;
    let selfieUrl: string | undefined = undefined;
    let rawOcrText: string | undefined = undefined;
    let userPhone: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      userId = (formData.get("userId") as string) || "";
      userName = (formData.get("userName") as string) || "";
      idNumber = (formData.get("idNumber") as string) || "";
      rawOcrText = (formData.get("rawOcrText") as string) || undefined;
      userPhone = ((formData.get("phone") as string) || (formData.get("userPhone") as string) || "").trim() || undefined;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const saveUploadedFile = async (entry: FormDataEntryValue | null, prefix: string) => {
        if (!entry || typeof entry === "string") return undefined;
        const file = entry as File;
        if (!file.name || file.size === 0) return undefined;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || ".jpg";
        const cleanExt = ext.match(/^\.(png|jpe?g|webp)$/i) ? ext : ".jpg";
        const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${cleanExt}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/kyc/${fileName}`;
      };

      const frontEntry = formData.get("idCardFront");
      const backEntry = formData.get("idCardBack");
      const selfieEntry = formData.get("selfie");

      if (frontEntry && typeof frontEntry !== "string") {
        idCardFrontUrl = (await saveUploadedFile(frontEntry, "front")) || "";
      } else if (typeof formData.get("idCardFrontUrl") === "string") {
        idCardFrontUrl = formData.get("idCardFrontUrl") as string;
      }

      if (backEntry && typeof backEntry !== "string") {
        idCardBackUrl = await saveUploadedFile(backEntry, "back");
      } else if (typeof formData.get("idCardBackUrl") === "string") {
        idCardBackUrl = formData.get("idCardBackUrl") as string;
      }

      if (selfieEntry && typeof selfieEntry !== "string") {
        selfieUrl = await saveUploadedFile(selfieEntry, "selfie");
      } else if (typeof formData.get("selfieUrl") === "string") {
        selfieUrl = formData.get("selfieUrl") as string;
      }
    } else {
      // JSON payload fallback
      const body = await req.json();
      userId = body.userId || "";
      userName = body.userName || "";
      idNumber = body.idNumber || "";
      idCardFrontUrl = body.idCardFrontUrl || "";
      idCardBackUrl = body.idCardBackUrl;
      selfieUrl = body.selfieUrl;
      rawOcrText = body.rawOcrText;
      userPhone = body.phone || body.userPhone;
    }

    if (!userId || !userName || !idNumber || !idCardFrontUrl) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة كافة الحقول الإلزامية (الاسم، الرقم الوطني، وصورة الهوية الأمامية)" },
        { status: 400 }
      );
    }

    const kyc = await submitKycVerification({
      userId,
      userName,
      idNumber,
      idCardFrontUrl,
      idCardBackUrl,
      selfieUrl,
      rawOcrText,
      userPhone,
    });

    return NextResponse.json({
      success: true,
      message:
        kyc.status === "AUTO_VERIFIED"
          ? "🎉 تم التحقق وتوثيق حسابك فورياً بواسطة روبوت الذكاء الاصطناعي!"
          : "⏳ تم استلام مستنداتك وإحالتها للمراجعة السريعة من قِبل المشرف.",
      kyc,
    });
  } catch (err: any) {
    console.error("[KYC Submit API Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
