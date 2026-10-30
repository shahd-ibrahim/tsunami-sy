"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CustomerDrawer } from "@/components/CustomerDrawer";
import { useUserRole } from "@/components/UserRoleContext";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/Footer";
import { Zap, LogIn, Plus, Sun, Moon } from "lucide-react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { currentUser, numericId, userName, walletBalance } = useUserRole();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Mobile Bar - Visible only on mobile (< 1024px) */}
      <header className="lg:hidden flex items-center justify-between px-3 py-2 w-full max-w-full overflow-hidden border-b border-slate-200 dark:border-[#1e3a5f] bg-white dark:bg-[#0d1b2a] sticky top-0 z-40 transition-colors">
        {/* Right (RTL): Official TSUNAMI Logo crest + small gold text "TSUNAMI" */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            <div className="w-full h-full rounded-[9px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center p-0.5">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          <span className="text-sm font-black tracking-wider text-amber-600 dark:text-[#d4af37] font-sans">
            TSUNAMI
          </span>
        </Link>

        {/* Left: A single, compact golden pill container + small '+' deposit button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser ? (
            <>
              {/* Golden Pill: Balance + Numeric ID */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-[#d4af37]/15 border border-amber-400/40 dark:border-[#d4af37]/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-mono font-bold shadow-xs">
                <span className="font-black text-amber-700 dark:text-[#d4af37]">${walletBalance.toFixed(2)}</span>
                <span className="opacity-40 text-slate-400 dark:text-slate-500">|</span>
                <span className="text-[10px] opacity-90 text-slate-600 dark:text-slate-300">#{numericId || 1000}</span>
              </div>

              {/* Small '+' deposit button */}
              <Link
                href="/deposit"
                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0 transition-transform active:scale-95"
                title="شحن رصيد"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-xs transition-transform active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </Link>
          )}
        </div>
      </header>

      {/* Lightweight Elegant Header (Desktop Only - >= 1024px) */}
      <header className="hidden lg:flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-[#1e3a5f] bg-white/95 dark:bg-[#0d1b2a]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
        {/* Right (RTL): Official TSUNAMI brand emblem + domain indicator */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0 overflow-hidden">
              <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center p-1">
                <Image
                  src="/images/logo.png"
                  alt="TSUNAMI Emblem"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  priority
                />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-slate-900 via-amber-700 to-amber-600 dark:from-white dark:via-[#f3e5ab] dark:to-[#d4af37] bg-clip-text text-transparent font-sans block leading-none">
                TSUNAMI
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  tsunami-sy.com
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Subtle Navigation Links */}
        <nav className="flex items-center gap-1 text-xs font-bold">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-[#d4af37] hover:bg-slate-100 dark:hover:bg-[#13253a]/60 transition-colors"
          >
            الرئيسية
          </Link>
          <Link
            href="/about"
            className="px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-[#d4af37] hover:bg-slate-100 dark:hover:bg-[#13253a]/60 transition-colors"
          >
            من نحن
          </Link>
          <a
            href="/#services"
            className="px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-[#d4af37] hover:bg-slate-100 dark:hover:bg-[#13253a]/60 transition-colors"
          >
            خدمات الشحن
          </a>
          <Link
            href="/agents"
            className="px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-[#d4af37] hover:bg-slate-100 dark:hover:bg-[#13253a]/60 transition-colors"
          >
            الوكلاء المعتمدون
          </Link>
        </nav>

        {/* Left: Compact Action Button or User Balance + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-[#d4af37] flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0"
            title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
            aria-label="تبديل المظهر"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#d4af37]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/deposit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-[#d4af37]/15 border border-amber-500/30 dark:border-[#d4af37]/40 text-amber-800 dark:text-[#f3e5ab] text-xs font-mono font-bold hover:scale-[1.02] transition-transform"
              >
                <span className="font-black text-amber-700 dark:text-[#d4af37]">
                  ${walletBalance.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">#{numericId}</span>
                <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
              </Link>
              <Link
                href="/profile"
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-[#1e3a5f] transition-colors"
              >
                {userName || "حسابي"}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa820a] shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all group"
            >
              <div className="px-4 py-2 rounded-[10.5px] bg-white dark:bg-[#070e17] group-hover:bg-transparent text-slate-950 dark:text-[#f3e5ab] group-hover:text-slate-950 text-xs font-black flex items-center gap-1.5 transition-colors">
                <LogIn className="w-3.5 h-3.5 text-[#d4af37] group-hover:text-slate-950" />
                <span>تسجيل الدخول / حساب جديد</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Side-by-Side Area */}
      <div className="flex-1 w-full flex items-start">
        {/* 1. Persistent Sidebar (Stays on the side, docked) */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] border-l border-slate-200 dark:border-[#1e3a5f] bg-white dark:bg-[#0d1b2a] p-4 transition-colors z-30 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* 2. Main Content Column + Confined Footer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-5rem)]">
          <main className="flex-1 p-3.5 sm:p-5 lg:p-7 pb-8 overflow-x-hidden">
            {children}
          </main>

          {/* Footer sits ONLY here, confined to this column, NOT spanning under the sidebar */}
          <Footer />
        </div>
      </div>

      {/* Mobile Drawer (Only visible on mobile when toggled) */}
      <CustomerDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Mobile Bottom Navigation - Visible only on mobile (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileBottomNav onOpenDrawer={() => setMobileDrawerOpen(true)} />
      </div>
    </div>
  );
}
