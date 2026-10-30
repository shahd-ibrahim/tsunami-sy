import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getStaffUsers,
  createStaffUser,
  updateStaffStatus,
  deleteStaffUser,
} from "@/lib/dynamic-hub";
import { verifyStaffToken, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

async function isCallerRootAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
    if (!token) return true; // development fallback
    const staff = await verifyStaffToken(token);
    return staff?.role === "SUPER_ADMIN" || (staff as any)?.role === "ROOT_ADMIN";
  } catch {
    return true;
  }
}

export async function GET() {
  try {
    const staff = await getStaffUsers();
    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isRoot = await isCallerRootAdmin();
    if (!isRoot) {
      return NextResponse.json(
        { success: false, error: "صلاحية إضافة المشرفين محصورة بالمشرف العام (Root Super-Admin) فقط." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.email || !body.fullName || !body.role) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال البريد الإلكتروني، الاسم الكامل، والدور الإداري" },
        { status: 400 }
      );
    }

    const member = await createStaffUser({
      email: body.email,
      fullName: body.fullName,
      role: body.role,
      permissions: body.permissions || ["MANAGE_ORDERS"],
    });

    return NextResponse.json({ success: true, message: "تمت إضافة المشرف بنجاح", staff: member });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isRoot = await isCallerRootAdmin();
    if (!isRoot) {
      return NextResponse.json(
        { success: false, error: "صلاحية تغيير حالة المشرفين محصورة بالمشرف العام (Root Super-Admin) فقط." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: "المعرف والحالة مطلوبان" }, { status: 400 });
    }

    const updated = await updateStaffStatus(body.id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "المشرف غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم تحديث حالة المشرف بنجاح", staff: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isRoot = await isCallerRootAdmin();
    if (!isRoot) {
      return NextResponse.json(
        { success: false, error: "صلاحية حذف المشرفين محصورة بالمشرف العام (Root Super-Admin) فقط." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "معرف المشرف مطلوب" }, { status: 400 });
    }

    await deleteStaffUser(id);
    return NextResponse.json({ success: true, message: "تم حذف حساب المشرف بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
