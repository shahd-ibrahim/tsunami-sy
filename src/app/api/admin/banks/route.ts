import { NextRequest, NextResponse } from "next/server";
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  toggleBankAccount,
  deleteBankAccount,
} from "@/lib/dynamic-hub";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    const banks = await getBankAccounts(activeOnly);
    return NextResponse.json({ success: true, banks });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.bankName || !body.accountHolder || !body.iban) {
      return NextResponse.json(
        { success: false, error: "يرجى ملء كافة الحقول الأساسية (اسم البنك، صاحب الحساب، والآيبان)" },
        { status: 400 }
      );
    }

    const bank = await createBankAccount({
      bankName: body.bankName,
      accountHolder: body.accountHolder,
      iban: body.iban,
      currency: body.currency || "TRY",
      minDeposit: Number(body.minDeposit) || 10,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, message: "تمت إضافة الحساب البنكي بنجاح", bank });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف الحساب مطلوب" }, { status: 400 });
    }

    const updated = await updateBankAccount(body.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "الحساب البنكي غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث بيانات الحساب البنكي بنجاح", bank: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "معرّف الحساب مطلوب" }, { status: 400 });
    }

    const updated = await toggleBankAccount(body.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "الحساب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة الحساب البنكي", bank: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "معرّف الحساب مطلوب" }, { status: 400 });
    }

    await deleteBankAccount(id);
    return NextResponse.json({ success: true, message: "تم حذف الحساب البنكي بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
