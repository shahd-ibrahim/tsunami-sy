import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070e17] text-slate-900 dark:text-slate-100 flex flex-col justify-between text-right relative overflow-hidden transition-colors duration-200">
      {/* Background ambient gold & teal glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 dark:bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/10 dark:bg-[#00a8b5]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#d4af37] p-[2px] shadow-sm overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center p-1">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI"
                width={36}
                height={36}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                priority
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-wider text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-[#f3e5ab] dark:to-[#d4af37] dark:bg-clip-text dark:text-transparent font-sans">
                TSUNAMI
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-[#1e3a5f] text-amber-800 dark:text-[#06b6d4] border border-amber-300 dark:border-[#06b6d4]/30 font-mono">
                STORE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">tsunami-sy.com</p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs hover:border-amber-400 dark:hover:border-[#d4af37]/40 transition-colors"
        >
          <span>العودة للمتجر</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 font-sans relative z-10 border-t border-slate-200 dark:border-[#1e3a5f]/40">
        جميع الحقوق محفوظة © 2026 لمنصة <strong className="text-amber-600 dark:text-[#d4af37]">تسونامي TSUNAMI</strong> (tsunami-sy.com) • All rights reserved
      </footer>
    </div>
  );
}
