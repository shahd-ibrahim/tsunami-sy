import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { persistentStore, PersistentUser } from "@/lib/persistent-store";
import { prisma } from "@/lib/prisma";
import { WalletService } from "@/lib/wallet-service";

// Primary Immutable Root Super-Admin
const PRIMARY_ROOT_ADMIN = {
  id: "root-super-admin-01",
  name: "المشرف العام الأعلى (Root Super-Admin)",
  username: "ROOT_SUPER_ADMIN",
  email: "admin@tsunami-sy.com",
  image: "/images/logo.png",
  role: "SUPER_ADMIN",
  isActive: true,
  isPrimary: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    const currentAdmin = token ? await verifyRootToken(token) : null;
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const admins: any[] = [{
      ...PRIMARY_ROOT_ADMIN,
      rootCommissionRate: 10.0,
      totalVolumeHandled: 12900.0,
      adminEarnings: 1741.5,
      rootEarningsFromAdmin: 193.5,
    }];

    // Fetch from persistentStore
    const storeUsers = persistentStore.getAllUsers();
    for (const u of storeUsers) {
      if ((u.role === "SUPER_ADMIN" || u.role === "ADMIN") && u.email !== PRIMARY_ROOT_ADMIN.email && u.id !== PRIMARY_ROOT_ADMIN.id) {
        admins.push({
          id: u.id,
          numericId: u.numericId,
          name: u.name,
          username: u.username || u.email.split("@")[0],
          email: u.email,
          image: u.image || "/images/logo.png",
          role: u.role || "SUPER_ADMIN",
          isActive: u.isActive !== false,
          isPrimary: false,
          rootCommissionRate: u.rootCommissionRate ?? 10.0,
          totalVolumeHandled: u.totalVolumeHandled ?? 0.0,
          adminEarnings: u.adminEarnings ?? 0.0,
          rootEarningsFromAdmin: u.rootEarningsFromAdmin ?? 0.0,
          createdAt: u.createdAt,
        });
      }
    }

    // Attempt Prisma fetch if available
    try {
      const dbAdmins = await (prisma as any).user.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
          NOT: { email: PRIMARY_ROOT_ADMIN.email },
        },
      });

      for (const d of dbAdmins) {
        if (!admins.some((a) => a.id === d.id || a.email.toLowerCase() === d.email.toLowerCase())) {
          admins.push({
            id: d.id,
            numericId: d.numericId,
            name: d.name,
            username: d.username || d.email.split("@")[0],
            email: d.email,
            image: d.image || "/images/logo.png",
            role: d.role || "SUPER_ADMIN",
            isActive: d.isActive !== false,
            isPrimary: false,
            rootCommissionRate: d.rootCommissionRate ?? 10.0,
            totalVolumeHandled: d.totalVolumeHandled ?? 0.0,
            adminEarnings: d.adminEarnings ?? 0.0,
            rootEarningsFromAdmin: d.rootEarningsFromAdmin ?? 0.0,
            createdAt: d.createdAt.toISOString(),
          });
        }
      }
    } catch {
      // Prisma fallback
    }

    // Attach current operating wallet balance for each admin
    for (const a of admins) {
      try {
        const w = await WalletService.getBalance(a.id);
        a.operatingBalance = w.balance;
      } catch {
        a.operatingBalance = 0.0;
      }
    }

    return NextResponse.json({
      success: true,
      admins,
      currentAdminId: currentAdmin.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    const currentAdmin = token ? await verifyRootToken(token) : null;
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, email, password, image, rootCommissionRate = 10.0 } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم، البريد الإلكتروني، وكلمة المرور حقول مطلوبة" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split("@")[0];

    // Check duplicate
    const existingInStore =
      persistentStore.getUserByEmail(cleanEmail) ||
      persistentStore.getUserByUsername(cleanUsername);

    if (existingInStore) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو اسم المستخدم مسجل بالفعل في النظام" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const newId = `root-admin-${Date.now()}`;
    const numericId = persistentStore.getNextNumericId();
    const now = new Date().toISOString();
    const parsedRate = Math.max(0, Math.min(100, Number(rootCommissionRate) || 10.0));

    const newRootUser: PersistentUser = {
      id: newId,
      numericId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      image: image || "/images/logo.png",
      role: "SUPER_ADMIN",
      isActive: true,
      isVerified: true,
      kycStatus: "APPROVED",
      isFrozen: false,
      rootCommissionRate: parsedRate,
      totalVolumeHandled: 0.0,
      adminEarnings: 0.0,
      rootEarningsFromAdmin: 0.0,
      authProvider: "EMAIL",
      createdAt: now,
      updatedAt: now,
    };

    persistentStore.saveUser(newRootUser);

    // Save to Prisma if accessible
    try {
      await (prisma as any).user.create({
        data: {
          id: newId,
          name: name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          passwordHash,
          image: image || "/images/logo.png",
          role: "SUPER_ADMIN",
          isActive: true,
          isVerified: true,
          kycStatus: "APPROVED",
          isFrozen: false,
          rootCommissionRate: parsedRate,
          totalVolumeHandled: 0.0,
          adminEarnings: 0.0,
          rootEarningsFromAdmin: 0.0,
          authProvider: "EMAIL",
        },
      });
    } catch {
      // Prisma fallback
    }

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب المشرف العام (${name}) بصلاحيات SUPER_ADMIN كاملة مع نسبة استقطاع ${parsedRate}%`,
      admin: {
        id: newId,
        numericId,
        name: newRootUser.name,
        username: newRootUser.username,
        email: newRootUser.email,
        image: newRootUser.image,
        role: "SUPER_ADMIN",
        isActive: true,
        isPrimary: false,
        rootCommissionRate: parsedRate,
        totalVolumeHandled: 0.0,
        adminEarnings: 0.0,
        rootEarningsFromAdmin: 0.0,
        createdAt: now,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    const currentAdmin = token ? await verifyRootToken(token) : null;
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { adminId, action } = body;

    if (!adminId || !action) {
      return NextResponse.json({ error: "معرف المشرف ونوع الإجراء مطلوبان" }, { status: 400 });
    }

    // Safety rule: Cannot alter primary root
    if (adminId === PRIMARY_ROOT_ADMIN.id) {
      return NextResponse.json(
        { error: "لا يمكن تعديل حالة أو بيانات حساب الجذر الرئيسي المؤسس للنظام" },
        { status: 403 }
      );
    }

    // Action 1: TOGGLE_STATUS
    if (action === "TOGGLE_STATUS") {
      // Safety rule: Root cannot deactivate self
      if (adminId === currentAdmin.id || adminId === currentAdmin.key) {
        return NextResponse.json(
          { error: "إجراء أمان: لا يمكنك تعطيل حسابك النشط حالياً" },
          { status: 403 }
        );
      }

      const user = persistentStore.getUserById(adminId);
      if (!user) {
        return NextResponse.json({ error: "المشرف غير موجود" }, { status: 404 });
      }

      const nextStatus = user.isActive === false ? true : false;
      user.isActive = nextStatus;
      persistentStore.saveUser(user);

      try {
        await (prisma as any).user.update({
          where: { id: adminId },
          data: { isActive: nextStatus },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: nextStatus ? `تم تفعيل حساب المشرف بنجاح` : `تم تعطيل حساب المشرف وإيقاف صلاحياته`,
        isActive: nextStatus,
      });
    }

    // Action 2: RESET_PASSWORD
    if (action === "RESET_PASSWORD") {
      const { newPassword } = body;
      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" },
          { status: 400 }
        );
      }

      const user = persistentStore.getUserById(adminId);
      if (!user) {
        return NextResponse.json({ error: "المشرف غير موجود" }, { status: 404 });
      }

      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      user.passwordHash = passwordHash;
      persistentStore.saveUser(user);

      try {
        await (prisma as any).user.update({
          where: { id: adminId },
          data: { passwordHash },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "تم تحديث وتعيين كلمة المرور الجديدة للمشرف بنجاح",
      });
    }

    // Action 3: EDIT_PROFILE
    if (action === "EDIT_PROFILE") {
      const { name, image, rootCommissionRate } = body;
      const user = persistentStore.getUserById(adminId);
      if (!user) {
        return NextResponse.json({ error: "المشرف غير موجود" }, { status: 404 });
      }

      if (name) user.name = name.trim();
      if (image !== undefined) user.image = image;
      if (rootCommissionRate !== undefined) {
        const rate = Math.max(0, Math.min(100, Number(rootCommissionRate) || 0));
        user.rootCommissionRate = rate;
        const volume = user.totalVolumeHandled || 0;
        const grossProfit = volume * 0.15;
        user.rootEarningsFromAdmin = Number(((grossProfit * rate) / 100).toFixed(2));
        user.adminEarnings = Number((grossProfit - user.rootEarningsFromAdmin).toFixed(2));
      }
      persistentStore.saveUser(user);

      try {
        await (prisma as any).user.update({
          where: { id: adminId },
          data: {
            ...(name ? { name: name.trim() } : {}),
            ...(image !== undefined ? { image } : {}),
            ...(rootCommissionRate !== undefined ? { rootCommissionRate: user.rootCommissionRate } : {}),
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: "تم تحديث بيانات المشرف ونسبة العمولة بنجاح",
        admin: user,
      });
    }

    // Action 4: UPDATE_COMMISSION
    if (action === "UPDATE_COMMISSION") {
      const { rootCommissionRate } = body;
      const rate = Math.max(0, Math.min(100, Number(rootCommissionRate) || 0));
      const updatedUser = persistentStore.updateAdminCommission(adminId, rate);
      if (!updatedUser) {
        return NextResponse.json({ error: "المشرف غير موجود" }, { status: 404 });
      }

      try {
        await (prisma as any).user.update({
          where: { id: adminId },
          data: {
            rootCommissionRate: rate,
            adminEarnings: updatedUser.adminEarnings,
            rootEarningsFromAdmin: updatedUser.rootEarningsFromAdmin,
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: `تم ضبط نسبة استقطاع الـ Root إلى ${rate}% بنجاح`,
        admin: updatedUser,
      });
    }

    // Action 5: INJECT_BALANCE
    if (action === "INJECT_BALANCE") {
      const { amount, note } = body;
      const injectAmount = Number(amount);
      if (isNaN(injectAmount) || injectAmount <= 0) {
        return NextResponse.json(
          { error: "يرجى إدخال مبلغ صالح أكبر من الصفر للشحن" },
          { status: 400 }
        );
      }

      const user = persistentStore.getUserById(adminId);
      if (!user) {
        return NextResponse.json({ error: "المشرف غير موجود" }, { status: 404 });
      }

      const creditResult = await WalletService.creditFunds({
        userId: adminId,
        amount: injectAmount,
        type: "MANUAL_ADJUST" as any,
        description:
          `شحن رصيد تشغيلي بواسطة الإدارة العليا (Root)` +
          (note ? ` - ملاحظة: ${note.trim()}` : ""),
        operatorName: (currentAdmin as any).fullName || "Root Super-Admin",
      });

      // Dispatch Security Alert to Telegram Security Group (-5504890302)
      import("@/lib/telegram").then(({ dispatchSecurityAlert }) => {
        dispatchSecurityAlert({
          type: "ADMIN_BALANCE_INJECTION",
          operatorName: (currentAdmin as any).fullName || "Root Super-Admin",
          operatorEmail: (currentAdmin as any).email || "root@tsunami-sy.com",
          targetAdminName: user.name,
          targetAdminId: adminId,
          amount: injectAmount,
          note: note ? note.trim() : undefined,
        });
      }).catch((e) => console.error("[Telegram Security Dispatch Error]:", e.message));

      return NextResponse.json({
        success: true,
        message: `تم شحن $${injectAmount.toFixed(2)} بنجاح إلى المحفظة التشغيلية للمشرف (${user.name})`,
        newBalance: creditResult.balanceAfter,
        adminId,
      });
    }

    return NextResponse.json({ error: "نوع الإجراء غير معروف" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    const currentAdmin = token ? await verifyRootToken(token) : null;
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("id");

    if (!adminId) {
      return NextResponse.json({ error: "معرف المشرف مطلوب للحذف" }, { status: 400 });
    }

    // Safety rule: Cannot delete primary root
    if (adminId === PRIMARY_ROOT_ADMIN.id) {
      return NextResponse.json(
        { error: "لا يمكن حذف حساب الجذر الرئيسي المؤسس للنظام" },
        { status: 403 }
      );
    }

    // Safety rule: Cannot delete currently logged in account
    if (adminId === currentAdmin.id || adminId === currentAdmin.key) {
      return NextResponse.json(
        { error: "إجراء أمان: لا يمكنك حذف حسابك المسجل به حالياً" },
        { status: 403 }
      );
    }

    persistentStore.deleteUser(adminId);

    try {
      await (prisma as any).user.delete({ where: { id: adminId } });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "تم حذف حساب المشرف نهائياً من النظام بنجاح",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
