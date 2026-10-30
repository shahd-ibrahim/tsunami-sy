"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, PlusCircle, Receipt, User } from "lucide-react";
import { useUserRole } from "./UserRoleContext";

interface MobileBottomNavProps {
  onRequireAuth?: () => void;
  onOpenDrawer?: () => void;
}

function MobileBottomNavInner({ onRequireAuth, onOpenDrawer }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const { currentUser } = useUserRole();

  const handleAuthGuardedClick = (e: React.MouseEvent, target: string) => {
    if (!currentUser) {
      e.preventDefault();
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        window.location.href = `/login?redirect=${encodeURIComponent(target)}&auth_required=true`;
      }
    }
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenDrawer) {
      onOpenDrawer();
    } else if (currentUser) {
      window.location.href = "/profile";
    } else {
      window.location.href = "/login";
    }
  };

  const isHomeActive = pathname === "/";
  const isDepositActive = pathname === "/deposit";
  const isOrdersActive = pathname === "/wallet" && currentTab === "orders";
  const isProfileActive = pathname === "/profile";

  return (
    <nav className="h-14 fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0d1b2a]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1e3a5f] px-1 flex items-center justify-around shadow-lg transition-colors">
      {/* 1. الرئيسية (Home) */}
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[10px] font-bold transition-all ${
          isHomeActive
            ? "text-amber-700 dark:text-[#d4af37] font-black"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <Home className={`w-4 h-4 ${isHomeActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span>الرئيسية</span>
      </Link>

      {/* 2. شحن رصيد (Deposit) */}
      <Link
        href="/deposit"
        onClick={(e) => handleAuthGuardedClick(e, "/deposit")}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[10px] font-bold transition-all ${
          isDepositActive
            ? "text-amber-700 dark:text-[#d4af37] font-black"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <PlusCircle className={`w-4 h-4 ${isDepositActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span>شحن رصيد</span>
      </Link>

      {/* 3. طلباتي (Orders) */}
      <Link
        href="/wallet?tab=orders"
        onClick={(e) => handleAuthGuardedClick(e, "/wallet?tab=orders")}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[10px] font-bold transition-all ${
          isOrdersActive
            ? "text-amber-700 dark:text-[#d4af37] font-black"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <Receipt className={`w-4 h-4 ${isOrdersActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span>طلباتي</span>
      </Link>

      {/* 4. حسابي (Account - opens drawer) */}
      <button
        type="button"
        onClick={handleAccountClick}
        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
          isProfileActive
            ? "text-amber-700 dark:text-[#d4af37] font-black"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }`}
      >
        <User className={`w-4 h-4 ${isProfileActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span>حسابي</span>
      </button>
    </nav>
  );
}

export function MobileBottomNav(props: MobileBottomNavProps) {
  return (
    <Suspense fallback={
      <nav className="h-14 fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0d1b2a]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1e3a5f] px-1 flex items-center justify-around" />
    }>
      <MobileBottomNavInner {...props} />
    </Suspense>
  );
}


