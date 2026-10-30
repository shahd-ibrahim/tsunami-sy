import { NextRequest, NextResponse } from "next/server";
import { getPlatformRates, updatePlatformRate } from "@/lib/dynamic-hub";

export async function GET() {
  try {
    const rates = await getPlatformRates();
    return NextResponse.json({ success: true, rates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.key || body.rate === undefined) {
      return NextResponse.json(
        { success: false, error: "مفتاح السعر والقيمة الجديدة مطلوبان" },
        { status: 400 }
      );
    }

    const updated = await updatePlatformRate(body.key, Number(body.rate));
    if (!updated) {
      return NextResponse.json({ success: false, error: "المفتاح غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${updated.name} إلى ${updated.rate} بنجاح`,
      rate: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
