import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج بنجاح",
  });

  // Clear authentication cookies
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete("tsunami_role");
  response.cookies.delete("tsunami_user_id");

  return response;
}
