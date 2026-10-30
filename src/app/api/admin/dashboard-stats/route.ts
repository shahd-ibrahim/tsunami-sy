import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { persistentStore } from "@/lib/persistent-store";
import { WalletService } from "@/lib/wallet-service";

export async function GET(req: NextRequest) {
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

    // 2. Fetch fresh Admin record & operating wallet
    const adminUser = persistentStore.getUserById(callerAdmin.id) || callerAdmin;
    let operatingBalance = 0.0;
    try {
      const wallet = await WalletService.getBalance(callerAdmin.id);
      operatingBalance = wallet.balance;
    } catch {
      operatingBalance = 0.0;
    }

    // 3. Retrieve transactions dispatched by this admin
    const allTx = persistentStore.getTransactions();
    const adminTxList = allTx.filter((t) => {
      return (
        t.processedByAdminId === callerAdmin.id ||
        (t.userId === callerAdmin.id && t.type === "ADMIN_DISPATCH")
      );
    });

    // 4. Calculate unique clients served
    // Try to extract client identifiers from description or transaction link
    const clientSet = new Set<string>();
    const formattedHistory = adminTxList.map((tx) => {
      const amount = Math.abs(tx.amount || 0);
      const gross = tx.grossProfit || Number((amount * 0.05).toFixed(2));
      const rate = adminUser.rootCommissionRate ?? 10.0;
      const rootShare = tx.rootCutAmount !== undefined ? tx.rootCutAmount : Number(((gross * rate) / 100).toFixed(2));
      const adminShare = tx.adminCutAmount !== undefined ? tx.adminCutAmount : Number((gross - rootShare).toFixed(2));

      // Extract client name / ID from description e.g. "شحن رصيد للزبون أحمد (#1003)"
      const clientMatch = tx.description?.match(/للزبون\s+([^(]+)(?:\((#[^)]+)\))?/);
      const clientName = clientMatch ? clientMatch[1].trim() : "زبون المنصة";
      const clientTag = clientMatch && clientMatch[2] ? clientMatch[2].trim() : "#Client";

      clientSet.add(clientName);

      return {
        id: tx.id,
        createdAt: tx.createdAt,
        clientName,
        clientTag,
        amount,
        myProfit: adminShare,
        companyShare: rootShare,
        status: "COMPLETED",
        reference: tx.reference,
        note: tx.description,
      };
    });

    const clientsServedCount = clientSet.size;

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        username: adminUser.username || adminUser.email.split("@")[0],
        email: adminUser.email,
        image: adminUser.image || "/images/logo.png",
        role: adminUser.role,
        rootCommissionRate: adminUser.rootCommissionRate ?? 10.0,
        operatingBalance,
      },
      metrics: {
        myNetProfit: adminUser.adminEarnings || 0.0,
        companyRootShare: adminUser.rootEarningsFromAdmin || 0.0,
        totalDispatchedVolume: adminUser.totalVolumeHandled || 0.0,
        clientsServedCount,
      },
      history: formattedHistory,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
