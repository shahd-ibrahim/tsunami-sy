import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, COOKIE_NAME, isUsernameTaken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username || username.length < 3) {
    return NextResponse.json(
      { available: false, message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل" },
      { status: 400 }
    );
  }

  // Regex: letters, numbers, underscores, dots only
  const validRegex = /^[a-zA-Z0-9_.]+$/;
  if (!validRegex.test(username)) {
    return NextResponse.json(
      { available: false, message: "يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)" },
      { status: 400 }
    );
  }

  // Get current user id from session cookie if present
  let currentUserId: string | undefined = undefined;
  const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
  if (sessionCookie) {
    const session = await verifySessionToken(sessionCookie);
    if (session?.id) {
      currentUserId = session.id;
    }
  }

  // Optional query param fallback for client component passing currentUserId explicitly
  if (!currentUserId) {
    const excludeId = searchParams.get("currentUserId")?.trim();
    if (excludeId) {
      currentUserId = excludeId;
    }
  }

  // 1. Direct Prisma DB Check
  let takenInDb = false;
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // case-insensitive check
        },
        NOT: currentUserId ? { id: currentUserId } : undefined,
      },
      select: { id: true },
    });
    if (existingUser) {
      takenInDb = true;
    }
  } catch {
    // If DB is offline or querying in dev mode, fallback is handled below
  }

  // 2. Resilient check across DB and In-Memory store
  const taken = takenInDb || (await isUsernameTaken(username, currentUserId));

  if (taken) {
    return NextResponse.json({
      available: false,
      message: "اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر",
    });
  }

  return NextResponse.json({
    available: true,
    message: "اسم المستخدم متاح للاستخدام",
  });
}
