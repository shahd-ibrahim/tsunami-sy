import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { verifySessionToken } from "@/lib/auth";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { persistentStore } from "@/lib/persistent-store";
import { WalletService } from "@/lib/wallet-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate caller (ADMIN or SUPER_ADMIN)
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("tsunami_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    let callerAdmin: any = null;

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
        callerAdmin = payload;
      }
    }

    if (!callerAdmin) {
      const rootToken = req.cookies.get(ROOT_COOKIE_NAME)?.value;
      if (rootToken) {
        const rootPayload = await verifyRootToken(rootToken);
        if (rootPayload) {
          callerAdmin = rootPayload;
        }
      }
    }

    if (!callerAdmin) {
      return NextResponse.json(
        { error: "غير مصرح: هذا الإجراء محصور بالمشرفين المعتمدين فقط" },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const { clientId, amount, note } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "يرجى إدخال مبلغ شحن صالح أكبر من الصفر" },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "يرجى تحديد الزبون المراد شحن رصيده" },
        { status: 400 }
      );
    }

    // 3. Find client and admin in persistentStore / DB
    const adminUser = persistentStore.getUserById(callerAdmin.id) || callerAdmin;
    const clientUser = persistentStore.getUserById(clientId);

    if (!clientUser) {
      return NextResponse.json(
        { error: "حساب الزبون غير موجود في المنظومة" },
        { status: 404 }
      );
    }

    if (clientUser.id === callerAdmin.id) {
      return NextResponse.json(
        { error: "لا يمكن للمشرف شحن رصيده الذاتي من هذه المحطة" },
        { status: 400 }
      );
    }

    // 4. Verify Admin has sufficient operating balance
    const adminWallet = await WalletService.getBalance(callerAdmin.id);
    if (adminWallet.balance < parsedAmount) {
      return NextResponse.json(
        {
          error: `رصيدك التشغيلي المتاح ($${adminWallet.balance.toFixed(2)}) غير كافٍ لإتمام عملية الشحن ($${parsedAmount.toFixed(2)})`,
          currentBalance: adminWallet.balance,
          requiredAmount: parsedAmount,
        },
        { status: 400 }
      );
    }

    // 5. Execute Atomic Balance Transfer
    // A) Deduct amount from Admin's wallet
    const deductResult = await WalletService.deductFunds({
      userId: callerAdmin.id,
      amount: parsedAmount,
      description: `تحويل شحن رصيد للزبون ${clientUser.name} (#${clientUser.numericId})` +
        (note ? ` - ملاحظة: ${note.trim()}` : ""),
    });

    // B) Credit amount to Client's wallet
    const creditResult = await WalletService.creditFunds({
      userId: clientUser.id,
      amount: parsedAmount,
      type: "DEPOSIT" as any,
      description: `شحن رصيد المحفظة بواسطة المشرف: ${adminUser.name || "إدارة العمليات"}` +
        (note ? ` - ملاحظة: ${note.trim()}` : ""),
      processedById: callerAdmin.id,
      operatorName: adminUser.name || "مشرف معتمد",
    });

    // 6. Revenue Share & Profit Calculation
    // Service profit margin: 5% standard service fee
    const grossMargin = Number((parsedAmount * 0.05).toFixed(2));
    const rootRate = adminUser.rootCommissionRate ?? 10.0;
    const rootProfit = Number(((grossMargin * rootRate) / 100).toFixed(2));
    const adminProfit = Number((grossMargin - rootProfit).toFixed(2));

    // Update Admin's cumulative metrics
    adminUser.totalVolumeHandled = Number(((adminUser.totalVolumeHandled || 0) + parsedAmount).toFixed(2));
    adminUser.adminEarnings = Number(((adminUser.adminEarnings || 0) + adminProfit).toFixed(2));
    adminUser.rootEarningsFromAdmin = Number(((adminUser.rootEarningsFromAdmin || 0) + rootProfit).toFixed(2));
    persistentStore.saveUser(adminUser);

    try {
      await (prisma as any).user.update({
        where: { id: adminUser.id },
        data: {
          totalVolumeHandled: adminUser.totalVolumeHandled,
          adminEarnings: adminUser.adminEarnings,
          rootEarningsFromAdmin: adminUser.rootEarningsFromAdmin,
        },
      });
    } catch {}

    // 7. Record Dispatched Transaction for Admin Auditing
    const adminDispatchTx = {
      id: `TX-DISPATCH-${Date.now()}-${uuidv4().substring(0, 6)}`,
      walletId: deductResult.walletId,
      userId: callerAdmin.id,
      type: "ADMIN_DISPATCH",
      amount: -parsedAmount,
      balanceBefore: deductResult.balanceBefore,
      balanceAfter: deductResult.balanceAfter,
      description: `شحن رصيد للزبون ${clientUser.name} (#${clientUser.numericId})` +
        (note ? ` - ${note.trim()}` : ""),
      reference: `DISP-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`,
      processedById: callerAdmin.id,
      processedByAdminId: callerAdmin.id,
      operatorName: adminUser.name,
      operatorAvatar: adminUser.image || "/images/logo.png",
      costPrice: Number((parsedAmount - grossMargin).toFixed(2)),
      sellingPrice: parsedAmount,
      grossProfit: grossMargin,
      rootCutAmount: rootProfit,
      adminCutAmount: adminProfit,
      createdAt: new Date().toISOString(),
    };
    persistentStore.addTransaction(adminDispatchTx);

    return NextResponse.json({
      success: true,
      message: `تم شحن رصيد الزبون (${clientUser.name}) بمبلغ $${parsedAmount.toFixed(2)} بنجاح!`,
      dispatchedAmount: parsedAmount,
      adminBalanceAfter: deductResult.balanceAfter,
      clientBalanceAfter: creditResult.balanceAfter,
      adminProfit,
      rootProfit,
      grossMargin,
      client: {
        id: clientUser.id,
        numericId: clientUser.numericId,
        name: clientUser.name,
        username: clientUser.username,
      },
      transaction: {
        id: adminDispatchTx.id,
        reference: adminDispatchTx.reference,
        createdAt: adminDispatchTx.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
