import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { persistentStore } from "@/lib/persistent-store";
import { WalletService } from "@/lib/wallet-service";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate caller (ADMIN or SUPER_ADMIN)
    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("tsunami_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    let callerRole: string | null = null;
    let callerId: string | null = null;

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        callerRole = payload.role;
        callerId = payload.id;
      }
    }

    if (!callerRole) {
      const rootToken = req.cookies.get(ROOT_COOKIE_NAME)?.value;
      if (rootToken) {
        const rootPayload = await verifyRootToken(rootToken);
        if (rootPayload) {
          callerRole = rootPayload.role;
          callerId = rootPayload.id;
        }
      }
    }

    if (!callerRole || (callerRole !== "ADMIN" && callerRole !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "غير مصرح: هذا الإجراء محصور بالمشرفين المعتمدين فقط" },
        { status: 403 }
      );
    }

    // 2. Extract search query
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "يرجى إدخال حرفين أو رقمين على الأقل للبحث",
      });
    }

    const cleanQuery = query.startsWith("#") ? query.slice(1).trim() : query;
    const isNum = /^\d+$/.test(cleanQuery);
    const targetNumeric = isNum ? parseInt(cleanQuery, 10) : null;
    const lowerQuery = cleanQuery.toLowerCase();

    // 3. Search in persistentStore
    const allUsers = persistentStore.getAllUsers();
    let foundUser = allUsers.find((u) => {
      if (targetNumeric !== null && u.numericId === targetNumeric) return true;
      if (u.id === cleanQuery) return true;
      if (u.username && u.username.toLowerCase() === lowerQuery) return true;
      if (u.email.toLowerCase() === lowerQuery) return true;
      return false;
    });

    // Fuzzy fallback on username / name if exact match not found
    if (!foundUser) {
      foundUser = allUsers.find((u) => {
        if (u.username && u.username.toLowerCase().includes(lowerQuery)) return true;
        if (u.name && u.name.toLowerCase().includes(lowerQuery)) return true;
        return false;
      });
    }

    // Attempt Prisma search if available
    if (!foundUser) {
      try {
        const dbUser = await (prisma as any).user.findFirst({
          where: {
            OR: [
              ...(targetNumeric !== null ? [{ numericId: targetNumeric }] : []),
              { id: cleanQuery },
              { username: cleanQuery },
              { email: lowerQuery },
            ],
          },
        });
        if (dbUser) {
          foundUser = {
            id: dbUser.id,
            numericId: dbUser.numericId,
            email: dbUser.email,
            name: dbUser.name,
            username: dbUser.username,
            image: dbUser.image,
            role: dbUser.role,
            isVerified: dbUser.isVerified,
            kycStatus: dbUser.kycStatus,
            authProvider: dbUser.authProvider,
            createdAt: dbUser.createdAt.toISOString(),
            updatedAt: dbUser.updatedAt.toISOString(),
          };
        }
      } catch {}
    }

    if (!foundUser) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "لم يتم العثور على أي زبون مطابق للمدخلات",
      });
    }

    // Safety: Prevent admin from topping up self or another admin via client station
    if (foundUser.id === callerId) {
      return NextResponse.json({
        success: true,
        found: false,
        message: "هذا هو حسابك الشخصي؛ ميزة الشحن مخصصة لزبائن المنصة فقط",
      });
    }

    // 4. Fetch Client's current live balance
    let currentBalance = 0.0;
    try {
      const wallet = await WalletService.getBalance(foundUser.id);
      currentBalance = wallet.balance;
    } catch {
      currentBalance = 0.0;
    }

    return NextResponse.json({
      success: true,
      found: true,
      client: {
        id: foundUser.id,
        numericId: foundUser.numericId,
        name: foundUser.name,
        username: foundUser.username || foundUser.email.split("@")[0],
        email: foundUser.email,
        image: foundUser.image || "/images/logo.png",
        role: foundUser.role,
        isVerified: foundUser.isVerified ?? false,
        kycStatus: foundUser.kycStatus || "NOT_SUBMITTED",
        currentBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
