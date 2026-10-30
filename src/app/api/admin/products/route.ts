import { NextRequest, NextResponse } from "next/server";
import {
  getDynamicProducts,
  createDynamicProduct,
  updateDynamicProduct,
  toggleDynamicProduct,
  deleteDynamicProduct,
} from "@/lib/dynamic-hub";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const products = await getDynamicProducts(activeOnly);
    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nameAr || !body.slug || !body.categoryId || body.unitPriceUser === undefined) {
      return NextResponse.json(
        { success: false, error: "يرجى ملء كافة الحقول الأساسية للمنتج (الاسم، المعرف slug، التصنيف، وسعر العميل)" },
        { status: 400 }
      );
    }

    const product = await createDynamicProduct({
      nameAr: body.nameAr,
      nameEn: body.nameEn || body.nameAr,
      slug: body.slug,
      categoryId: body.categoryId,
      categoryName: body.categoryName,
      iconUrl: body.iconUrl,
      bannerUrl: body.bannerUrl,
      unitType: body.unitType || "Coins",
      unitPriceUser: Number(body.unitPriceUser),
      unitPriceReseller: Number(body.unitPriceReseller ?? body.unitPriceUser),
      requiresUid: body.requiresUid ?? true,
      uidLabel: body.uidLabel || "معرف اللاعب",
      validationApiUrl: body.validationApiUrl,
      description: body.description,
    });

    return NextResponse.json({ success: true, message: "تمت إضافة المنتج بنجاح", product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف المنتج مطلوب للتعديل" }, { status: 400 });
    }

    const updated = await updateDynamicProduct(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث بيانات المنتج بنجاح", product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || body.isActive === undefined) {
      return NextResponse.json({ success: false, error: "معرّف المنتج وحالة التفعيل مطلوبان" }, { status: 400 });
    }

    const updated = await toggleDynamicProduct(body.id, Boolean(body.isActive));
    if (!updated) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة ظهور المنتج", product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف المنتج مطلوب" }, { status: 400 });
    }

    await deleteDynamicProduct(body.id);
    return NextResponse.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
