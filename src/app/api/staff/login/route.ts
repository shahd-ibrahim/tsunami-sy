import { NextRequest, NextResponse } from "next/server";
import { staffLoginSchema, authenticateStaff, createStaffToken, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validationResult = staffLoginSchema.safeParse(body);
    if (!validationResult.success) {
      const errorList = (validationResult.error as any).issues || [];
      const firstError = errorList[0]?.message || "بيانات غير صالحة";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const staffUser = await authenticateStaff(validationResult.data);
    const token = await createStaffToken(staffUser);

    const response = NextResponse.json({
      success: true,
      message: "تم التحقق من هوية المشرف/الوكيل بنجاح",
      user: staffUser,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Set isolated staff session token
    response.cookies.set({
      name: STAFF_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 24 * 60 * 60, // 2 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "فشل تسجيل دخول المشرف" },
      { status: 401 }
    );
  }
}
