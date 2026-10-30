import { NextRequest, NextResponse } from "next/server";
import { WalletService, fallbackWalletEngine } from "@/lib/wallet-service";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get(COOKIE_NAME)?.value ||
      req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    const session = token ? await verifySessionToken(token) : null;
    const { searchParams } = new URL(req.url);
    const userId = session?.id || searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: يرجى تسجيل الدخول أولاً للاطلاع على رصيد المحفظة" },
        { status: 401 }
      );
    }

    const walletInfo = await WalletService.getBalance(userId);

    let transactions: any[] = [];
    try {
      const dbTx = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      if (dbTx && dbTx.length > 0) {
        transactions = dbTx.map((t: any) => ({
          id: t.id,
          walletId: t.walletId,
          userId: t.userId,
          type: t.type,
          amount: Number(t.amount),
          balanceBefore: Number(t.balanceBefore),
          balanceAfter: Number(t.balanceAfter),
          orderId: t.orderId,
          depositRequestId: t.depositRequestId,
          description: t.description,
          reference: t.reference,
          processedById: t.processedById || null,
          operatorName: t.operatorName || null,
          operatorAvatar: t.operatorAvatar || null,
          createdAt: t.createdAt,
        }));
      } else {
        transactions = fallbackWalletEngine.getTransactions(userId);
      }
    } catch {
      transactions = fallbackWalletEngine.getTransactions(userId);
    }

    return NextResponse.json({
      balance: walletInfo.balance,
      currency: walletInfo.currency,
      isFrozen: walletInfo.isFrozen,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

