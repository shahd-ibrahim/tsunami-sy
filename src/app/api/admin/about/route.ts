import { NextRequest, NextResponse } from "next/server";
import {
  getAboutContent,
  updateAboutContent,
  toggleAboutValue,
  addPromoBanner,
  togglePromoBanner,
  deletePromoBanner,
} from "@/lib/dynamic-hub";

export async function GET() {
  try {
    const about = await getAboutContent();
    return NextResponse.json({ success: true, about });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateAboutContent(body);
    return NextResponse.json({
      success: true,
      message: "تم تحديث محتوى قسم (من نحن والرؤية) بنجاح",
      about: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id } = body;

    if (action === "TOGGLE_VALUE" && id) {
      const updated = await toggleAboutValue(id);
      return NextResponse.json({ success: true, message: "تم تحديث حالة القيمة", about: updated });
    }

    if (action === "TOGGLE_BANNER" && id) {
      const updated = await togglePromoBanner(id);
      return NextResponse.json({ success: true, message: "تم تحديث حالة البانر", about: updated });
    }

    return NextResponse.json({ success: false, error: "إجراء غير صالح" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.subtitle) {
      return NextResponse.json(
        { success: false, error: "عنوان البانر والوصف مطلوبان" },
        { status: 400 }
      );
    }

    const banner = await addPromoBanner({
      title: body.title,
      subtitle: body.subtitle,
      badge: body.badge,
      link: body.link,
    });

    return NextResponse.json({ success: true, message: "تمت إضافة البانر الترويجي بنجاح", banner });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "معرّف البانر مطلوب" }, { status: 400 });
    }

    const updated = await deletePromoBanner(id);
    return NextResponse.json({ success: true, message: "تم حذف البانر بنجاح", about: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
