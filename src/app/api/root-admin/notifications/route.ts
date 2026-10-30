import { NextRequest, NextResponse } from "next/server";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { persistentStore } from "@/lib/persistent-store";
import { getKycVerifications, DynamicKycItem } from "@/lib/dynamic-hub";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    const currentAdmin = token ? await verifyRootToken(token) : null;
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Pending KYC Verifications
    let pendingKyc: any[] = [];
    try {
      const kycList: DynamicKycItem[] = await getKycVerifications();
      pendingKyc = kycList.filter(
        (k: DynamicKycItem) => k.status === "PENDING_BOT_REVIEW" || k.status === "MANUAL_REVIEW"
      );
    } catch {
      pendingKyc = [];
    }

    // 2. Pending Deposits
    let pendingDeposits: any[] = [];
    try {
      const allDeposits = persistentStore.getDeposits();
      pendingDeposits = allDeposits.filter((d) => d.status === "PENDING");

      if (pendingDeposits.length === 0) {
        const dbPending = await prisma.depositRequest.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        if (dbPending) {
          pendingDeposits = dbPending.map((d) => ({
            id: d.id,
            depositNumber: d.depositNumber,
            userId: d.userId,
            amount: Number(d.amount),
            currency: d.currency,
            method: d.method,
            createdAt: d.createdAt.toISOString(),
          }));
        }
      }
    } catch {
      pendingDeposits = [];
    }

    const totalCount = pendingKyc.length + pendingDeposits.length;

    return NextResponse.json({
      success: true,
      totalCount,
      pendingKycCount: pendingKyc.length,
      pendingDepositCount: pendingDeposits.length,
      kycItems: pendingKyc.slice(0, 5).map((k) => ({
        id: k.id,
        userName: k.userName || k.extractedName || "مستخدم",
        status: k.status,
        time: k.createdAt,
      })),
      depositItems: pendingDeposits.slice(0, 5).map((d) => ({
        id: d.id,
        depositNumber: d.depositNumber,
        amount: d.amount,
        currency: d.currency || "USD",
        method: d.method,
        time: d.createdAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
