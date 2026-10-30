"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogIn,
  UserPlus,
  Wallet,
  Plus,
  LogOut,
  Home,
  Info,
  ClipboardList,
  Moon,
  Shield,
  MessageSquare,
  Phone,
  Check,
  X,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useUserRole } from "./UserRoleContext";
import { toast } from "sonner";

interface AlfaoreSidebarProps {
  onRequireAuth?: () => void;
  onCloseMobile?: () => void;
}

export function AlfaoreSidebar({ onRequireAuth, onCloseMobile }: AlfaoreSidebarProps) {
  const pathname = usePathname();
  const { currentUser, userName, userEmail, role, walletBalance, logout } = useUserRole();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleOrdersClick = (e: React.MouseEvent) => {
    if (!currentUser) {
      e.preventDefault();
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        toast.error("يجب تسجيل الدخول أولاً لاستعراض طلباتك السابقة.");
      }
    }
  };

  const handleSupportWhatsApp = () => {
    window.open("https://wa.me/963900000000?text=مرحباً%20خدمة%20عملاء%20تسونامي", "_blank");
  };

  const handleSupportFacebook = () => {
    window.open("https://facebook.com/tsunami.syria.store", "_blank");
  };

  return (
    <>
      <aside className="w-full flex flex-col justify-between bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-5 shadow-2xl text-right overflow-hidden relative">
        {/* Subtle ambient gold accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* =========================================
              1. TOP AUTH CARD (بطاقة تسجيل الدخول)
             ========================================= */}
          {!currentUser ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#13253a] to-[#070e17] border border-[#d4af37]/40 p-5 shadow-lg text-center relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mx-auto mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-white">تسجيل الدخول</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                قم بتسجيل الدخول وتمتع بتجربة شراء سهلة
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/login"
                  onClick={onCloseMobile}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-[#d4af37] to-[#aa820a] hover:from-[#f3e5ab] hover:to-[#d4af37] text-slate-950 shadow-md flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </Link>

                <Link
                  href="/register"
                  onClick={onCloseMobile}
                  className="block text-xs font-bold text-[#06b6d4] hover:text-[#d4af37] hover:underline pt-1 transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-[#13253a] to-[#070e17] border border-[#1e3a5f] p-4 shadow-lg relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#d4af37] p-[1.5px] shadow-sm shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-[#070e17] flex items-center justify-center text-[#d4af37] font-black text-sm">
                    {userName ? userName.charAt(0) : "U"}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-white truncate">{userName}</h4>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{userEmail}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1e3a5f] text-[#06b6d4] border border-[#06b6d4]/30">
                    {role === "RESELLER" ? "موزع VIP معتمد" : "حساب عميل"}
                  </span>
                </div>
              </div>

              {/* Live Wallet Balance */}
              <div className="bg-[#070e17]/80 rounded-xl p-3 border border-[#1e3a5f] mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">الرصيد المتاح</span>
                  <span className="text-sm font-black text-[#f3e5ab] font-mono">
                    ${walletBalance.toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/deposit"
                  onClick={onCloseMobile}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-[#d4af37] hover:bg-[#e5c05b] text-slate-950 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>شحن الرصيد</span>
                </Link>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5">

                <button
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              2. SIDEBAR NAVIGATION LINKS
             ========================================= */}
          <nav className="space-y-1 text-xs font-bold">
            <Link
              href="/"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                pathname === "/"
                  ? "bg-[#13253a] text-[#d4af37] border border-[#d4af37]/30 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-[#13253a]/60"
              }`}
            >
              <Home className="w-4 h-4 text-[#06b6d4]" />
              <span>الرئيسية</span>
            </Link>

            <button
              onClick={() => setShowAboutModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-[#13253a]/60 transition-colors text-right"
            >
              <Info className="w-4 h-4 text-[#d4af37]" />
              <span>من نحن</span>
            </button>

            <Link
              href="/wallet?tab=orders"
              onClick={(e) => {
                handleOrdersClick(e);
                if (currentUser && onCloseMobile) onCloseMobile();
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                pathname.startsWith("/wallet")
                  ? "bg-[#13253a] text-[#d4af37] border border-[#d4af37]/30"
                  : "text-slate-300 hover:text-white hover:bg-[#13253a]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-[#00a8b5]" />
                <span>طلباتي ومحفظتي</span>
              </div>
              {!currentUser && <Lock className="w-3 h-3 text-slate-500" />}
            </Link>
          </nav>

          {/* =========================================
              3. SETTINGS & SUPPORT
             ========================================= */}
          <div className="pt-4 border-t border-[#1e3a5f]/60 space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Moon className="w-4 h-4 text-[#d4af37]" />
                <span>الوضع الداكن</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  toast.info(isDarkMode ? "تم تثبيت النمط الليلي الفاخر" : "النمط الليلي الفاخر نشط");
                }}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isDarkMode ? "bg-[#d4af37]" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-[#070e17] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isDarkMode ? "translate-x-0" : "-translate-x-5"
                  }`}
                />
              </button>
            </div>

            {/* Customer Support Social Icons */}
            <div className="bg-[#070e17]/60 rounded-2xl p-3 border border-[#1e3a5f]/60">
              <p className="text-[11px] font-bold text-slate-400 mb-2.5">
                خدمة العملاء والدعم الفني
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={handleSupportWhatsApp}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-[11px] font-bold transition-colors"
                  title="تواصل عبر واتساب"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>واتساب</span>
                </button>
                <button
                  onClick={handleSupportFacebook}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-[#1877F2] text-[11px] font-bold transition-colors"
                  title="تواصل عبر فيسبوك"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>فيسبوك</span>
                </button>
                <button
                  onClick={() => window.open("https://t.me/tsunami_support", "_blank")}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/40 text-[#229ED9] text-[11px] font-bold transition-colors"
                  title="تواصل عبر تيليجرام"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.942z" />
                  </svg>
                  <span>تيليجرام</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            4. FOOTER
           ========================================= */}
        <div className="pt-6 border-t border-[#1e3a5f]/40 text-center relative z-10">
          <p className="text-[11px] font-medium text-slate-500 font-mono">
            © 2026 متجر تسونامي - tsunami-sy.com
          </p>
        </div>
      </aside>

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0d1b2a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-slate-100 space-y-5 text-right">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#13253a] hover:bg-[#1e3a5f] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Arabic Logo Emblem */}
            <div className="flex items-center gap-4 border-b border-[#1e3a5f]/80 pb-4">
              <div className="w-16 h-16 rounded-full border border-amber-500/40 shadow-xl shadow-amber-500/10 bg-gradient-to-br from-amber-500/15 via-slate-900/60 to-[#070e17] p-2 flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo-arabic.png"
                  alt="منصة تسونامي الرقمية"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">منصة تسونامي الرقمية (TSUNAMI)</h3>
                <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                  بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-amber-400">الرؤية:</strong> بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية الفورية بأعلى معايير الأمان والسرعة.
              </p>
              <p>
                <strong className="text-amber-400">القيم الأساسية:</strong> تنفيذ آلي فوري، أسعار منافسة للمستخدمين والوكلاء، ودعم فني متواصل على مدار الساعة.
              </p>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تنفيذ آلي لحظي بدون تدخل بشري عبر السيرفرات الرسمية.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>شام كاش (Sham Cash) الخيار الأول للحوالات الفورية، بالإضافة إلى الهرم وتيذر USDT.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حماية متقدمة للمحفظة الرقمية وأسعار حصرية للموزعين والوكلاء.</span>
              </div>
            </div>

            {/* Accreditation */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-center text-slate-300">
              اعتماد التطوير: تطوير وتشغيل بواسطة وكالة{" "}
              <a
                href="https://shayasoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors inline-flex items-center gap-1"
              >
                شايا سوفت | SHAYA SOFT
              </a>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-colors shadow-md"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
}
