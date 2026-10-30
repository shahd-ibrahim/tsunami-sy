"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  User,
  Edit2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { RootAdminPayload } from "@/lib/root-admin-auth";

interface RootHeaderProps {
  admin: RootAdminPayload;
}

export function RootHeader({ admin }: RootHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  // Notification State
  const [notifications, setNotifications] = useState<{
    totalCount: number;
    pendingKycCount: number;
    pendingDepositCount: number;
    kycItems: any[];
    depositItems: any[];
  }>({
    totalCount: 0,
    pendingKycCount: 0,
    pendingDepositCount: 0,
    kycItems: [],
    depositItems: [],
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile Pill & Edit State
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentName, setCurrentName] = useState(admin.fullName);
  const [currentAvatar, setCurrentAvatar] = useState(admin.avatar || "/images/logo.png");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(admin.fullName);
  const [editAvatar, setEditAvatar] = useState(admin.avatar || "/images/logo.png");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Logout State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/root-admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/root-admin/auth/logout", { method: "POST" });
      toast.success("تم إنهاء جلسة الروت بنجاح");
      window.location.href = "/root-admin/login";
    } catch {
      window.location.href = "/root-admin/login";
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          action: "EDIT_PROFILE",
          name: editName,
          image: editAvatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentName(editName);
      setCurrentAvatar(editAvatar);
      setIsEditingProfile(false);
      setShowProfileDropdown(false);
      toast.success("تم تحديث بيانات الملف الشخصي للمشرف بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث البيانات");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 dark:bg-[#0d1b2a]/95 border-b border-slate-200 dark:border-[#1e3a5f] backdrop-blur px-6 flex items-center justify-between transition-colors duration-200">
      {/* Right Side (Brand & Status) */}
      <div className="flex items-center gap-3">
        <Link href="/root-admin" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 p-[1.5px] shadow-sm">
            <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center p-1">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI"
                width={26}
                height={26}
                className="object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
              <span>لوحة التحكم الإدارية</span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">(Root Control)</span>
            </h1>
          </div>
        </Link>
      </div>

      {/* Left Side (Strictly essential controls only - no clutter) */}
      <div className="flex items-center gap-2.5">
        {/* 1. Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-amber-400 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* 2. Notification Bell with Real-Time Badge & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="الإشعارات والطلبات المعلقة"
          >
            <Bell className="w-4 h-4" />
            {notifications.totalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                {notifications.totalCount > 9 ? "9+" : notifications.totalCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-2xl p-4 text-right z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3a5f]/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">الإشعارات الإدارية الحية</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                  {notifications.totalCount} قيد المراجعة
                </span>
              </div>

              {notifications.totalCount === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <span>لا توجد طلبات معلقة حالياً • النظام مستقر</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                  {/* KYC Pending */}
                  {notifications.pendingKycCount > 0 && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                          <span>توثيق الهويات الذكي (KYC)</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300">
                          {notifications.pendingKycCount} طلب
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        هويات جديدة بانتظار التدقيق والمراجعة البشرية.
                      </p>
                      <Link
                        href="/root-admin/kyc"
                        onClick={() => setShowNotifDropdown(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline pt-1"
                      >
                        <span>مراجعة الهويات الآن</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </Link>
                    </div>
                  )}

                  {/* Deposits Pending */}
                  {notifications.pendingDepositCount > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-500" />
                          <span>إيداعات بنكية وكاش</span>
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">
                          {notifications.pendingDepositCount} إشعار
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        إشعارات تحويل وحوالات بانتظار المطابقة واعتماد الرصيد.
                      </p>
                      <Link
                        href="/root-admin/deposits"
                        onClick={() => setShowNotifDropdown(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline pt-1"
                      >
                        <span>مراجعة الإيداعات الآن</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Root Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setIsEditingProfile(false);
            }}
            className="flex items-center gap-2.5 p-1 pl-3 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] transition-all cursor-pointer shadow-xs"
          >
            {/* Avatar circle with gold border */}
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden shrink-0 bg-slate-900">
              <img
                src={currentAvatar}
                alt={currentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).src = "/images/logo.png";
                }}
              />
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                {currentName}
              </div>
              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-black flex items-center gap-1">
                <span>ROOT / مشرف عام</span>
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-2xl p-4 text-right z-50 animate-in fade-in zoom-in-95 duration-150">
              {!isEditingProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#1e3a5f]/60">
                    <div className="w-11 h-11 rounded-full border-2 border-amber-500 overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={currentAvatar}
                        alt={currentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = "/images/logo.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{currentName}</h4>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{admin.email}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        SUPER_ADMIN
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditName(currentName);
                      setEditAvatar(currentAvatar);
                      setIsEditingProfile(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>تعديل الاسم والصورة</span>
                    </span>
                    <ArrowRight className="w-3 h-3 rotate-180 text-slate-400" />
                  </button>

                  <Link
                    href="/root-admin/admins"
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                      <span>إدارة حسابات الروت الأخرى</span>
                    </span>
                    <ArrowRight className="w-3 h-3 rotate-180 text-slate-400" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1e3a5f]/60 pb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">تعديل الملف الشخصي</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">الاسم الظاهر</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">رابط الصورة الرمزية (Avatar URL)</label>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="/images/logo.png أو رابط صورة"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#13253a] text-[11px] font-bold text-slate-600 dark:text-slate-300"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      {isSavingProfile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      <span>حفظ</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* 4. Minimal Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          title="تسجيل الخروج وإنهاء جلسة الروت"
        >
          {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
