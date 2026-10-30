"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  Wallet,
  ClipboardList,
  Users,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Copy,
  Check,
  Zap,
  Moon,
  Sun,
  Send,
  MessageCircle,
  Lock,
  ChevronLeft,
  Headphones,
  CreditCard,
  HelpCircle,
  Info,
} from "lucide-react";
import { useUserRole } from "./UserRoleContext";
import { toast } from "sonner";
import KycRequiredModal from "./ui/KycRequiredModal";

interface SidebarProps {
  onRequireAuth?: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({ onRequireAuth, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const {
    currentUser,
    isVerified,
    numericId,
    userName,
    userEmail,
    role,
    walletBalance,
    logout,
  } = useUserRole();

  const [copiedId, setCopiedId] = useState(false);
  const [showKycRequiredModal, setShowKycRequiredModal] = useState(false);
  const [kycGateReason, setKycGateReason] = useState("يتطلب شحن المحفظة توثيق هويتك أولاً");

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `#${numericId}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(true);
    toast.success("تم نسخ معرّف الحساب بنجاح", {
      description: textToCopy,
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Public informational navigation links for guests
  const guestNavLinks = [
    {
      name: "الرئيسية",
      href: "/",
      icon: Home,
      badge: null,
      badgeColor: "",
    },
    {
      name: "وكلاؤنا المعتمدون",
      href: "/agents",
      icon: Users,
      badge: "مراكز الدفع",
      badgeColor: "text-sky-800 dark:text-cyan-300 bg-sky-100 dark:bg-cyan-950/50 border-sky-300 dark:border-cyan-400/30",
    },
    {
      name: "من نحن (عن تسونامي)",
      href: "/about",
      icon: Info,
      badge: null,
      badgeColor: "",
    },
    {
      name: "دليل الاستخدام والمساعدة",
      href: "/guide",
      icon: HelpCircle,
      badge: "دليل",
      badgeColor: "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-400/30",
    },
  ];

  // Full operational suite for authenticated customers
  const userNavLinks = [
    {
      name: "الرئيسية",
      href: "/",
      icon: Home,
      badge: null,
      badgeColor: "",
    },
    {
      name: "إضافة رصيد (شحن المحفظة)",
      href: "/deposit",
      icon: Plus,
      badge: !isVerified ? "يتطلب توثيق 🔒" : "فوري",
      badgeColor: !isVerified
        ? "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-400/30"
        : "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-400/30",
      isKycGated: !isVerified,
    },
    {
      name: "محفظتي وسجل الحركات",
      href: "/wallet?tab=ledger",
      icon: Wallet,
      badge: !isVerified ? "مقيد 🔒" : null,
      badgeColor: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
      exactMatchPrefix: "/wallet",
    },
    {
      name: "طلباتي (متابعة الفواتير)",
      href: "/wallet?tab=orders",
      icon: ClipboardList,
      badge: !isVerified ? "مقيد 🔒" : "مباشر",
      badgeColor: !isVerified
        ? "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
        : "text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-400/30",
    },
    {
      name: "وكلاؤنا المعتمدون",
      href: "/agents",
      icon: Users,
      badge: "مراكز الدفع",
      badgeColor: "text-sky-800 dark:text-cyan-300 bg-sky-100 dark:bg-cyan-950/50 border-sky-300 dark:border-cyan-400/30",
    },
    {
      name: "دليل الاستخدام والمساعدة",
      href: "/guide",
      icon: HelpCircle,
      badge: "دليل",
      badgeColor: "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-400/30",
    },
    {
      name: "الملف الشخصي والأمان",
      href: "/profile",
      icon: ShieldCheck,
      badge: !isVerified ? "وثّق الآن ⚠️" : "موثق ✅",
      badgeColor: !isVerified
        ? "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-400/40"
        : "text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-400/30",
    },
  ];

  const navLinks = currentUser ? userNavLinks : guestNavLinks;

  const handleWhatsApp = () => {
    window.open("https://wa.me/963911223344?text=مرحباً%20خدمة%20عملاء%20تسونامي", "_blank");
  };

  const handleTelegram = () => {
    window.open("https://t.me/tsunami_sy", "_blank");
  };

  return (
    <div className="flex flex-col h-fit text-right space-y-4">
      <div className="space-y-4">
        {/* 1. User Profile & Live Balance Card (Starts directly with NO redundant logo) */}
        {currentUser ? (
          <div className="rounded-2xl p-4 bg-white dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-3 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] shadow-sm shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center text-sm font-black text-[#d4af37] overflow-hidden">
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userName ? userName.charAt(0) : "U"
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {currentUser.username || userName}
                  </h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-[#13253a] text-amber-800 dark:text-[#06b6d4] border border-amber-300 dark:border-[#06b6d4]/30 shrink-0">
                    {role === "RESELLER" ? "موزع" : "عميل"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {userEmail}
                </p>

                {/* 4-Digit Numeric ID Badge with Copy Button */}
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#0d1b2a] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#d4af37]/40 text-[10px] font-mono text-slate-700 dark:text-[#f3e5ab] transition-colors"
                    title="انقر لنسخ المعرف"
                  >
                    <span className="text-slate-400 font-sans text-[9px]">المعرّف:</span>
                    <span className="font-black text-amber-700 dark:text-[#d4af37]">#{numericId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Large Bold Live Balance with Deposit Button */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]/80 flex items-center justify-between shadow-xs transition-colors">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  الرصيد المتاح
                </span>
                <div className="text-lg font-black text-amber-600 dark:text-[#d4af37] font-mono">
                  ${walletBalance.toFixed(2)}{" "}
                  <span className="text-[10px] text-slate-400 font-sans font-bold">USD</span>
                </div>
              </div>

              {isVerified ? (
                <Link
                  href="/deposit"
                  onClick={onCloseMobile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ شحن رصيد</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setKycGateReason("يتطلب شحن المحفظة توثيق هويتك أولاً");
                    setShowKycRequiredModal(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-black bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm transition-all cursor-pointer"
                  title="يتطلب توثيق الحساب"
                >
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>شحن (مقفل)</span>
                </button>
              )}
            </div>

            {!isVerified && (
              <Link
                href="/profile"
                onClick={onCloseMobile}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>حسابك غير موثق (KYC)</span>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 underline">وثّق الآن ←</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Card 1: بطاقة الدخول السريع (Quick Access) */}
            <div className="rounded-2xl p-4 bg-white dark:bg-[#070e17] border border-amber-300 dark:border-[#d4af37]/40 shadow-sm space-y-3 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-[#d4af37]/20 border border-amber-500/30 dark:border-[#d4af37]/40 flex items-center justify-center text-amber-700 dark:text-[#d4af37] shrink-0 shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    مرحباً بك في تسونامي
                  </h3>
                  <span className="text-[10px] text-amber-600 dark:text-[#f3e5ab] font-bold block">
                    بوابتك الرقمية الأولى
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                بوابتك المباشرة لشحن الألعاب وتطبيقات الدردشة بأمان وسرعة
              </p>

              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={onCloseMobile}
                  className="w-full py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.01]"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </Link>

                <Link
                  href="/register"
                  onClick={onCloseMobile}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-[#0d1b2a] hover:bg-slate-100 dark:hover:bg-[#13253a] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-[#1e3a5f] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
                  <span>إنشاء حساب ومحفظة</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. Primary Navigation Menu Links */}
        <nav className="space-y-1 pt-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isExactHome = link.href === "/" && pathname === "/";
            const isSubPath = link.href !== "/" && pathname.startsWith(link.href.split("?")[0]);
            const isActive = isExactHome || isSubPath;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if ((link as any).isKycGated) {
                    e.preventDefault();
                    setKycGateReason("يتطلب شحن المحفظة توثيق هويتك أولاً");
                    setShowKycRequiredModal(true);
                    return;
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#13253a] dark:text-[#06b6d4] dark:border-[#00a8b5]/40 shadow-xs"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#13253a]/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-amber-700 dark:text-[#06b6d4]"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span>{link.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  {link.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Widget: Developer Credits */}
      <div className="pt-3 mt-auto border-t border-slate-200 dark:border-[#1e3a5f]/50 text-center flex flex-col items-center justify-center gap-1">
        {currentUser && (
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              logout();
            }}
            className="w-full mb-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400">
          برمجة وتطوير:{' '}
          <a 
            href="https://shayasoft.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
          >
            شايا سوفت | SHAYA SOFT
          </a>
        </div>
        <span dir="ltr" className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          © 2026 TSUNAMI (tsunami-sy.com)
        </span>
      </div>

      <KycRequiredModal
        isOpen={showKycRequiredModal}
        onClose={() => setShowKycRequiredModal(false)}
        message={kycGateReason}
      />
    </div>
  );
}
