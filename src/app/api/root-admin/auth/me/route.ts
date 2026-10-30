import { NextRequest, NextResponse } from "next/server";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ROOT_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const rootAdmin = await verifyRootToken(token);
  if (!rootAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, admin: rootAdmin });
}
