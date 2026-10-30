import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentChannels,
  createPaymentChannel,
  updatePaymentChannel,
  togglePaymentChannel,
  deletePaymentChannel,
} from "@/lib/dynamic-hub";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const channels = await getPaymentChannels(activeOnly);
    return NextResponse.json({ success: true, channels });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.accountNumber || !body.type) {
      return NextResponse.json(
        { success: false, error: "يرجى ملء نوع القناة، العنوان، ورقم المحفظة/الحساب" },
        { status: 400 }
      );
    }

    const channel = await createPaymentChannel({
      type: body.type,
      title: body.title,
      accountNumber: body.accountNumber,
      recipientName: body.recipientName,
      qrCodeUrl: body.qrCodeUrl,
      instructions: body.instructions,
    });

    return NextResponse.json({ success: true, message: "تمت إضافة قناة الدفع بنجاح", channel });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف القناة مطلوب" }, { status: 400 });
    }

    const updated = await updatePaymentChannel(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "القناة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث بيانات قناة الدفع بنجاح", channel: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف القناة مطلوب" }, { status: 400 });
    }

    const updated = await togglePaymentChannel(body.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "القناة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة القناة بنجاح", channel: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "معرّف القناة مطلوب" }, { status: 400 });
    }

    await deletePaymentChannel(id);
    return NextResponse.json({ success: true, message: "تم حذف قناة الدفع بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
