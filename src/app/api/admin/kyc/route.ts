import { NextRequest, NextResponse } from "next/server";
import { getKycVerifications, reviewKycManual } from "@/lib/dynamic-hub";

export async function GET() {
  try {
    const kycRecords = await getKycVerifications();
    return NextResponse.json({ success: true, kycRecords });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { kycId, decision, reviewedBy, notes } = body;

    if (!kycId || !decision || !["APPROVE", "REJECT"].includes(decision)) {
      return NextResponse.json(
        { success: false, error: "معرف الطلب والقرار (APPROVE أو REJECT) مطلوبان" },
        { status: 400 }
      );
    }

    if (decision === "REJECT" && (!notes || notes.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: "يرجى ذكر سبب الرفض لتوجيه العميل بشكل صحيح" },
        { status: 400 }
      );
    }

    const updated = await reviewKycManual(
      kycId,
      decision,
      reviewedBy || "Root Super-Admin",
      notes
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "طلب التوثيق غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: decision === "APPROVE" ? "تم قبول التوثيق وتفعيل شارة الحساب الموثوق" : "تم رفض طلب التوثيق وتسجيل الملاحظة",
      kyc: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
