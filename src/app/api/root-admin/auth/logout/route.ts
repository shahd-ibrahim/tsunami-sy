import { NextResponse } from "next/server";
import { ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج من لوحة الجذر وإبطال الجلسة بنجاح.",
  });

  response.cookies.delete(ROOT_COOKIE_NAME);
  return response;
}
