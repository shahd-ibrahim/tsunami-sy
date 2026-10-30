import React from "react";

export const metadata = {
  title: "لوحة الجذر العليا | TSUNAMI Super-Admin Fortress",
  description: "منظومة التحكم الشاملة والآمنة لإدارة متجر ومنصة تسونامي الرقمية",
};

export default function RootAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-300">
      {children}
    </div>
  );
}
