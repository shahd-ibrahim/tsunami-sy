import { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة المشرف المعتمد (Admin Hub) | تسونامي",
  description: "محطة شحن رصيد الزبائن ومتابعة العمولات والأرباح للمشرفين المعتمدين.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060c14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {children}
    </div>
  );
}
