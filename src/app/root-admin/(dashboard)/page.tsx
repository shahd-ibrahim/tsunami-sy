"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Gamepad2,
  CreditCard,
  Users,
  Sparkles,
  UserCheck,
  RefreshCw,
  Zap,
  Cpu,
  ArrowRight,
  Layers,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import FinancialCharts from "@/components/admin/FinancialCharts";

export default function RootAdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>({
    appsCount: 0,
    paymentsCount: 0,
    agentsCount: 0,
    usersCount: 0,
    depositsPending: 0,
    ordersActive: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const [prodsRes, payRes, agentsRes, usersRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/payment-channels"),
        fetch("/api/admin/agents"),
        fetch("/api/admin/users"),
      ]);

      const prodsData = prodsRes.ok ? await prodsRes.json() : {};
      const payData = payRes.ok ? await payRes.json() : {};
      const agentsData = agentsRes.ok ? await agentsRes.json() : {};
      const usersData = usersRes.ok ? await usersRes.json() : {};

      setMetrics({
        appsCount: prodsData.products?.length || 0,
        paymentsCount: payData.channels?.length || 0,
        agentsCount: agentsData.agents?.length || 0,
        usersCount: usersData.users?.length || 0,
        depositsPending: 2,
        ordersActive: 5,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSummary();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("تم تحديث قراءات ومؤشرات لوحة الجذر");
    }, 400);
  };

  const controlCenters = [
    {
      title: "الكتالوج والألعاب وتطبيقات الدردشة",
      desc: "إضافة ألعاب جديدة، تعديل أسعار الصرف، ومفاتيح التشغيل الفوري (Active/Disabled)",
      href: "/root-admin/catalog",
      icon: Gamepad2,
      count: `${metrics.appsCount} تطبيق / لعبة`,
      color: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/30",
      accent: "text-amber-600 dark:text-[#d4af37]",
    },
    {
      title: "البنوك وطرق الدفع (شام كاش، بنوك، USDT)",
      desc: "إدارة الحسابات البنكية، أرقام المحافظ، وباركودات الدفع الفوري وتعليمات التحويل",
      href: "/root-admin/banks",
      icon: CreditCard,
      count: `${metrics.paymentsCount} قناة وبنك`,
      color: "from-cyan-500/20 to-cyan-600/5",
      border: "border-cyan-500/30",
      accent: "text-cyan-600 dark:text-[#06b6d4]",
    },
    {
      title: "مراجعة الإيداعات وإيصالات الدفع",
      desc: "تدقيق الحوالات البنكية وإيصالات شام كاش وإضافة الأرصدة فورياً للمحافظ",
      href: "/root-admin/deposits",
      icon: Layers,
      count: "تسوية فورية",
      color: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "محرك توثيق الهويات الذكي (KYC)",
      desc: "استخراج بيانات البطاقات الشخصية عبر OCR، مطابقة الأسماء آلياً، وبوت تيليجرام",
      href: "/root-admin/kyc",
      icon: ShieldCheck,
      count: "AI Bot نشط",
      color: "from-sky-500/20 to-sky-600/5",
      border: "border-sky-500/30",
      accent: "text-sky-600 dark:text-sky-400",
    },
    {
      title: "إدارة الحسابات والمستخدمين",
      desc: "إنشاء حسابات يدوياً، تعديل الأرصدة (+/-)، تغيير الرتب، وتخطي توثيق KYC",
      href: "/root-admin/users",
      icon: UserCheck,
      count: `${metrics.usersCount} حساب مسجل`,
      color: "from-blue-500/20 to-blue-600/5",
      border: "border-blue-500/30",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "إدارة المشرفين وصلاحيات الروت",
      desc: "إدارة حسابات المسؤولين، مفاتيح الوصول العسكري، وسجل الجلسات النشطة",
      href: "/root-admin/admins",
      icon: ShieldCheck,
      count: "ROOT Fortress",
      color: "from-amber-500/20 to-amber-600/5",
      border: "border-amber-500/30",
      accent: "text-amber-600 dark:text-[#d4af37]",
    },
    {
      title: "قسم 'من نحن' والرؤية والبانرات",
      desc: "تعديل نصوص الرؤية والرسالة، المميزات الأساسية، والبانرات الترويجية الحية",
      href: "/root-admin/about",
      icon: Sparkles,
      count: "محتوى ديناميكي",
      color: "from-purple-500/20 to-purple-600/5",
      border: "border-purple-500/30",
      accent: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "إعدادات المنظومة وسجل العمليات",
      desc: "سجل التدقيق الأمني، أسعار صرف الليرة والعملات، ومراقبة صحة سيرفرات المزودين",
      href: "/root-admin/settings",
      icon: Sliders,
      count: "Audit Trail",
      color: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/30",
      accent: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPER-ADMIN COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              منظومة التحكم الشامل لوحدة الجذر (Root Dashboard)
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              تحكم ديناميكي فوري بالكتالوج، المحتوى العام، بوابات الدفع وشام كاش، شبكة الوكلاء، ومحافظ المستخدمين مع مفاتيح تشغيل وإيقاف فورية.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
            <span>مزامنة القيود والمؤشرات</span>
          </button>
        </div>
      </div>

      {/* Dynamic Financial Overview, Analytics Charts & Admins Commission Engine */}
      <FinancialCharts />

      {/* 5 Standardized Universal CRUD Control Centers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>مراكز إدارة المحتوى والعمليات (Universal CRUD Hub)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono font-bold">5 Modules Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {controlCenters.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:${mod.border} hover:border-amber-400 dark:hover:border-[#d4af37] transition-all transform hover:-translate-y-1 shadow-xs dark:shadow-sm flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-gradient-to-br dark:${mod.color} border border-slate-200 dark:${mod.border} flex items-center justify-center ${mod.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#070e17] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]">
                      {mod.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#f3e5ab] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-[#d4af37] transition-colors">
                  <span>فتح وحدة التحكم</span>
                  <ArrowRight className="w-4 h-4 rotate-180 transform group-hover:-translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Architecture & Security Specifications Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-600 dark:text-[#06b6d4]" />
          <span>المعايير الأمنية المطبقة في لوحة الجذر</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
            <span className="font-bold text-cyan-700 dark:text-[#06b6d4]">1. العزل العسكري والتخفي:</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              محاولات الوصول المباشرة بدون جلسة جذر موقعة تعيد رمز HTTP 404 أو تحول تلقائياً لشاشة التحقق المزدوجة.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
            <span className="font-bold text-amber-700 dark:text-[#d4af37]">2. محدد المعدل (Rate Limiter):</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              حظر تلقائي مدته 15 دقيقة عند تجاوز 5 محاولات خاطئة لمنع هجمات التخمين والقوة العمياء (Brute Force).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">3. الانعكاس الفوري (Live Sync):</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              أي عملية تشغيل أو إيقاف (Active Toggle) تنعكس بلحظتها في المتجر والواجهة العامة للمستخدمين.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
