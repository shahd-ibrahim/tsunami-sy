import { NextRequest, NextResponse } from "next/server";
import { verifyStaffToken, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export async function GET(req: NextRequest) {
  try {
    const staffCookie = req.cookies.get(STAFF_COOKIE_NAME)?.value;
    if (!staffCookie) {
      return NextResponse.json({ authenticated: false, staff: null }, { status: 401 });
    }

    const payload = await verifyStaffToken(staffCookie);
    if (!payload) {
      return NextResponse.json({ authenticated: false, staff: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      staff: payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "فشل التحقق من هوية المشرف" }, { status: 500 });
  }
}
