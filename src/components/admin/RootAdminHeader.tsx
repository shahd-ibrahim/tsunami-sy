"use client";

import React from "react";
import { Sun, Moon, ShieldCheck } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { RootAdminPayload } from "@/lib/root-admin-auth";

interface RootAdminHeaderProps {
  admin: RootAdminPayload;
}

export function RootAdminHeader({ admin }: RootAdminHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#070e17]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1e3a5f]/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Telemetry and Security Status */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
        <div className="text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">حالة الخادم: </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">MILITARY_ISOLATED • 200 OK</span>
        </div>
        <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan-700 dark:text-[#06b6d4]">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>مستوى الأمان: </span>
          <span className="font-bold text-amber-700 dark:text-[#f3e5ab]">TIER-1 MASTER_ROOT</span>
        </div>
      </div>

      {/* Right Actions: Theme Toggle & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Compact Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-[#d4af37] flex items-center justify-center transition-all shadow-xs cursor-pointer"
          title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Admin Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono hidden sm:inline font-bold">
            {admin.fullName}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-[10px] font-mono font-black">
            SUPER_ADMIN
          </span>
        </div>
      </div>
    </header>
  );
}
