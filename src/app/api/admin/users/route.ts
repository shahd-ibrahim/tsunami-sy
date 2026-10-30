import { NextRequest, NextResponse } from "next/server";
import {
  getDynamicUsers,
  createDynamicUser,
  updateUserRole,
  toggleFreezeUser,
  adjustUserBalance,
  overrideUserKyc,
  deleteUser,
} from "@/lib/dynamic-hub";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";

export async function GET() {
  try {
    const users = await getDynamicUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: "الاسم، البريد الإلكتروني، والرتبة حقول إلزامية" },
        { status: 400 }
      );
    }

    const newUser = await createDynamicUser({
      name: body.name,
      email: body.email,
      role: body.role,
      walletBalance: Number(body.walletBalance) || 0,
      phone: body.phone,
      countryName: body.countryName,
      isVerified: Boolean(body.isVerified),
    });

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب المستخدم بنجاح (#${newUser.numericId})`,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: "معرف المستخدم ونوع الإجراء مطلوبان" },
        { status: 400 }
      );
    }

    if (action === "KYC_OVERRIDE") {
      const { isVerified, kycStatus } = body;
      const updated = await overrideUserKyc(
        userId,
        Boolean(isVerified),
        kycStatus || (isVerified ? "AUTO_VERIFIED" : "REJECTED")
      );
      return NextResponse.json({
        success: true,
        message: isVerified ? "تم توثيق الحساب يدوياً بنجاح" : "تم إلغاء توثيق الحساب",
        user: updated,
      });
    }

    if (action === "CHANGE_ROLE") {
      const { role, commissionRate } = body;
      if (!["USER", "RESELLER", "AGENT"].includes(role)) {
        return NextResponse.json(
          { success: false, error: "الرتبة المحددة غير صالحة" },
          { status: 400 }
        );
      }
      const updated = await updateUserRole(userId, role, commissionRate);
      return NextResponse.json({
        success: true,
        message: `تم تحديث رتبة المستخدم إلى ${role === "RESELLER" ? "موزع" : role === "AGENT" ? "وكيل" : "مستخدم عادي"}`,
        user: updated,
      });
    }

    if (action === "TOGGLE_FREEZE") {
      const { isFrozen } = body;
      const updated = await toggleFreezeUser(userId, Boolean(isFrozen));
      return NextResponse.json({
        success: true,
        message: isFrozen ? "تم تقييد وتجميد محفظة الحساب بنجاح" : "تم إلغاء تجميد الحساب وإعادة تفعيله",
        user: updated,
      });
    }

    if (action === "ADJUST_BALANCE") {
      const { amount, note, performedBy, operatorId, operatorAvatar } = body;
      if (amount === undefined || isNaN(Number(amount))) {
        return NextResponse.json(
          { success: false, error: "يرجى تحديد المبلغ المراد إضافته أو خصمه" },
          { status: 400 }
        );
      }
      if (!note || note.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: "الملاحظة الإدارية (Audit Note) إلزامية لتسجيل العملية في دفتر القيود" },
          { status: 400 }
        );
      }

      // Extract logged-in root operator if present
      const rootToken = req.cookies.get(ROOT_COOKIE_NAME)?.value;
      const rootAdmin = rootToken ? await verifyRootToken(rootToken) : null;

      const finalOperatorName = performedBy || rootAdmin?.fullName || "المشرف العام (Root Super-Admin)";
      const finalOperatorId = operatorId || rootAdmin?.id || "root-super-admin-01";
      const finalOperatorAvatar = operatorAvatar || (rootAdmin as any)?.avatar || "/images/logo.png";

      const result = await adjustUserBalance(
        userId,
        Number(amount),
        note.trim(),
        finalOperatorName,
        finalOperatorId,
        finalOperatorAvatar
      );

      return NextResponse.json({
        success: true,
        message: `تم تعديل الرصيد بنجاح. الرصيد الجديد: $${result.newBalance.toFixed(2)}`,
        user: result.user,
        newBalance: result.newBalance,
      });
    }

    return NextResponse.json({ success: false, error: "نوع الإجراء غير معروف" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.userId) {
      return NextResponse.json({ success: false, error: "معرّف المستخدم مطلوب للحظر" }, { status: 400 });
    }

    await deleteUser(body.userId);
    return NextResponse.json({ success: true, message: "تم حذف / حظر المستخدم بنجاح" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
