"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUserRole } from "./UserRoleContext";
import { useTheme } from "./ThemeProvider";
import {
  Wallet,
  ShieldCheck,
  RefreshCw,
  Zap,
  Store,
  Gamepad2,
  MessageCircle,
  CreditCard,
  ClipboardList,
  Headphones,
  ChevronDown,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerDrawer } from "./CustomerDrawer";
import KycRequiredModal from "./ui/KycRequiredModal";
import { Lock } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const {
    role,
    setRole,
    currentUser,
    isVerified,
    numericId,
    userName,
    userEmail,
    walletBalance,
    refreshWallet,
    logout,
  } = useUserRole();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [kycGateReason, setKycGateReason] = useState("يتطلب شحن المحفظة توثيق هويتك أولاً");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const navLinks = [
    { name: "الرئيسية", href: "/", icon: Store },
    { name: "ألعاب", href: "/?category=games", icon: Gamepad2 },
    { name: "برامج دردشة", href: "/?category=chat", icon: MessageCircle },
    { name: "بطاقات رقمية", href: "/?category=cards", icon: CreditCard },
    { name: "طلباتي", href: "/wallet?tab=orders", icon: ClipboardList },
  ];

  const handleSupportClick = () => {
    toast.info("خدمة عملاء TSUNAMI 24/7", {
      description: "فريق الدعم الفني متواجد على مدار الساعة عبر تيليجرام وواتساب: @tsunami_support",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#1e3a5f] bg-white/95 dark:bg-[#070e17]/95 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Domain Indicator (English metallic as requested) */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#0f3460] p-[2px] shadow-[0_0_15px_rgba(6,182,212,0.4)] overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center p-1">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI"
                width={40}
                height={40}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-slate-900 via-amber-700 to-amber-600 dark:from-white dark:via-[#f3e5ab] dark:to-[#d4af37] bg-clip-text text-transparent font-sans">
                TSUNAMI
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1e3a5f] text-cyan-700 dark:text-[#06b6d4] border border-cyan-300 dark:border-[#06b6d4]/30 font-mono">
                STORE
              </span>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400 font-mono">
              tsunami-sy.com
            </p>
          </div>
        </Link>

        {/* Center Nav Links in Arabic */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#0d1b2a]/80 p-1.5 rounded-2xl border border-slate-200 dark:border-[#1e3a5f]/60 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#13253a] dark:text-[#06b6d4] dark:border-[#00a8b5]/40 shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#13253a]/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSupportClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#13253a]/50 transition-all"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
            <span>الدعم الفني</span>
          </button>
        </nav>

        {/* Right Section: Auth & Floating Wallet Pill */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-[#d4af37] flex items-center justify-center transition-all shadow-sm"
            title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#d4af37]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Account / Auth Actions */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowCustomerDrawer(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] hover:border-amber-400 dark:hover:border-[#06b6d4] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-[#070e17] border border-amber-500/40 dark:border-[#06b6d4]/40 flex items-center justify-center text-[#d4af37] dark:text-[#06b6d4] text-[11px] font-black overflow-hidden shrink-0">
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userName.charAt(0) || "U"
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentUser.username || userName}</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-[#06b6d4] bg-amber-50 dark:bg-[#070e17] px-1.5 py-0.5 rounded border border-amber-200 dark:border-[#06b6d4]/30">
                    #{numericId}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <CustomerDrawer
                isOpen={showCustomerDrawer}
                onClose={() => setShowCustomerDrawer(false)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-600 dark:text-[#06b6d4]" />
                <span>دخول</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 dark:text-[#f3e5ab] bg-amber-100 hover:bg-amber-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-amber-300 dark:border-[#d4af37]/40 shadow-sm transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-700 dark:text-[#d4af37]" />
                <span className="hidden sm:inline">إنشاء حساب</span>
              </Link>
            </div>
          )}

          {/* Floating Wallet Balance Pill */}
          <div className="flex items-center bg-white dark:bg-gradient-to-l dark:from-[#0d1b2a] dark:to-[#13253a] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-1 shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <Link
              href="/wallet"
              className="flex items-center gap-2 px-2.5 py-1 hover:opacity-90 transition-opacity"
              title="عرض سجل المحفظة"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-[#d4af37]/15 flex items-center justify-center text-amber-700 dark:text-[#d4af37] border border-amber-500/30 dark:border-[#d4af37]/30">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">الرصيد</p>
                <p className="text-sm font-black text-amber-600 dark:text-[#f3e5ab] font-mono">
                  {walletBalance.toFixed(2)} $
                </p>
              </div>
            </Link>

            <button
              onClick={handleRefresh}
              className="text-slate-400 hover:text-cyan-600 dark:hover:text-[#06b6d4] transition-colors p-1"
              title="تحديث الرصيد اللحظي"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-600 dark:text-[#06b6d4]" : ""}`}
              />
            </button>

            {/* زر شحن الرصيد السريع (مقيد في حال عدم التوثيق) */}
            <button
              type="button"
              onClick={() => {
                if (currentUser && !isVerified) {
                  setKycGateReason("يتطلب شحن المحفظة توثيق هويتك أولاً");
                  setShowKycRequiredModal(true);
                  return;
                }
                window.location.href = "/deposit";
              }}
              className={`flex items-center gap-1 justify-center px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                currentUser && !isVerified
                  ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40"
                  : "bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transform hover:scale-105"
              }`}
            >
              {currentUser && !isVerified ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>شحن (مقفل)</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>شحن سريع</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <KycRequiredModal
        isOpen={showKycRequiredModal}
        onClose={() => setShowKycRequiredModal(false)}
        message={kycGateReason}
      />
    </header>
  );
}
