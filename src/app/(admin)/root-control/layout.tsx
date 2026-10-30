import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RootControlSidebar } from "@/components/admin/RootControlSidebar";
import { verifyStaffToken, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

export default async function RootControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const staffToken = cookieStore.get(STAFF_COOKIE_NAME)?.value;

  if (!staffToken) {
    redirect("/staff-login");
  }

  const staffUser = await verifyStaffToken(staffToken);
  if (!staffUser) {
    redirect("/staff-login");
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e17] flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      <RootControlSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
