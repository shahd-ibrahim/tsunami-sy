"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gamepad2,
  CreditCard,
  Users,
  Sparkles,
  UserCheck,
  ShieldCheck,
  ShoppingBag,
  Layers,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RootAdminPayload } from "@/lib/root-admin-auth";

interface RootAdminNavProps {
  admin: RootAdminPayload;
}

export function RootAdminNav({ admin }: RootAdminNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    {
      name: "لوحة المراقبة",
      href: "/root-admin",
      icon: LayoutDashboard,
      badge: "حي",
    },
    {
      name: "الكتالوج والألعاب والتطبيقات",
      href: "/root-admin/catalog",
      icon: Gamepad2,
      badge: "CRUD",
    },
    {
      name: "البنوك وطرق الدفع",
      href: "/root-admin/banks",
      icon: CreditCard,
      badge: "شام كاش وبنوك",
    },
    {
      name: "مراجعة الإيداعات",
      href: "/root-admin/deposits",
      icon: Layers,
      badge: "تسوية",
    },
    {
      name: "توثيق الهويات (KYC)",
      href: "/root-admin/kyc",
      icon: ShieldCheck,
      badge: "AI Bot",
    },
    {
      name: "إدارة المستخدمين",
      href: "/root-admin/users",
      icon: UserCheck,
      badge: "الرصيد",
    },
    {
      name: "مدراء الروت",
      href: "/root-admin/admins",
      icon: ShieldCheck,
      badge: "ROOT",
    },
    {
      name: "من نحن والرؤية",
      href: "/root-admin/about",
      icon: Sparkles,
      badge: "المحتوى",
    },
    {
      name: "إعدادات وسجل العمليات",
      href: "/root-admin/settings",
      icon: Sliders,
      badge: "نظام",
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/root-admin/auth/logout", { method: "POST" });
      toast.success("تم إغلاق جلسة الجذر بنجاح");
      window.location.href = "/root-admin/login";
    } catch {
      window.location.href = "/root-admin/login";
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#070e17] border-l border-slate-200 dark:border-[#1e3a5f]/80 text-right select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-[#1e3a5f]/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl border-2 border-amber-500/60 shadow-[0_0_15px_rgba(212,175,55,0.25)] bg-slate-50 dark:bg-[#050b14] p-1 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="TSUNAMI"
              width={42}
              height={42}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider font-mono">TSUNAMI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-[#f3e5ab] border border-amber-500/40">
                ROOT
              </span>
            </div>
            <div className="text-[11px] text-cyan-600 dark:text-[#06b6d4] font-mono mt-0.5 font-bold">
              Super-Admin Ecosystem
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          مراكز التحكم المباشر (Universal CRUD)
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-gradient-to-l from-amber-500/15 via-amber-500/10 to-transparent text-amber-900 dark:text-[#f3e5ab] border-r-4 border-amber-500 dark:border-[#d4af37] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#13253a]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-600 dark:text-[#d4af37]" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isActive
                      ? "bg-amber-500/20 text-amber-800 dark:text-[#f3e5ab] border border-amber-500/40 font-bold"
                      : "bg-slate-100 dark:bg-[#13253a] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#1e3a5f]/60"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions: View Store & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1b2a] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-[#06b6d4] transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>عرض المتجر العام</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Live</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isLoggingOut ? "جاري قفل الجلسة..." : "تسجيل خروج آمن"}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 h-screen sticky top-0 z-40">
        {navContent}
      </aside>

      {/* Mobile Top Toggle Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-white dark:bg-[#070e17] border-b border-slate-200 dark:border-[#1e3a5f] px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-amber-500/40 p-0.5 bg-slate-50 dark:bg-[#050b14]">
            <Image src="/images/logo.png" alt="TSUNAMI" width={28} height={28} className="object-contain" />
          </div>
          <span className="font-black text-xs text-slate-900 dark:text-white font-mono">TSUNAMI ROOT</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] text-slate-700 dark:text-slate-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
