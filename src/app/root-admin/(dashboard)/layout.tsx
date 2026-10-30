import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { RootAdminNav } from "@/components/admin/RootAdminNav";
import { RootHeader } from "@/components/admin/RootHeader";

export const metadata = {
  title: "لوحة الجذر العليا | TSUNAMI Super-Admin Fortress",
  description: "منظومة التحكم الشاملة والآمنة لإدارة متجر ومنصة تسونامي الرقمية",
};

export default async function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ROOT_COOKIE_NAME)?.value;

  // Validate Super-Admin token server-side
  let rootAdmin = null;
  if (token) {
    rootAdmin = await verifyRootToken(token);
  }

  // If unauthenticated, redirect to isolated login screen
  if (!rootAdmin) {
    redirect("/root-admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans selection:bg-amber-500/20 dark:selection:bg-[#d4af37]/30 antialiased transition-colors duration-300">
      {/* Root Admin Navigation Sidebar */}
      <RootAdminNav admin={rootAdmin} />

      {/* Main Administrative Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Sleek Minimal Fixed Root Header */}
        <RootHeader admin={rootAdmin} />

        {/* Child Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
