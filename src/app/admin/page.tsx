"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Wallet,
  Coins,
  TrendingUp,
  Shield,
  ShieldCheck,
  Zap,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  Loader2,
  DollarSign,
  UserCheck,
  Check,
  FileText,
  Clock,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

interface ClientLookupResult {
  id: string;
  numericId: number;
  name: string;
  username: string;
  email: string;
  image?: string | null;
  role: string;
  isVerified: boolean;
  kycStatus: string;
  currentBalance: number;
}

interface DispatchedHistoryItem {
  id: string;
  createdAt: string;
  clientName: string;
  clientTag: string;
  amount: number;
  myProfit: number;
  companyShare: number;
  status: string;
  reference: string;
  note?: string;
}

interface AdminDashboardData {
  admin: {
    id: string;
    name: string;
    username: string;
    email: string;
    image?: string | null;
    role: string;
    rootCommissionRate: number;
    operatingBalance: number;
  };
  metrics: {
    myNetProfit: number;
    companyRootShare: number;
    totalDispatchedVolume: number;
    clientsServedCount: number;
  };
  history: DispatchedHistoryItem[];
}

export default function DedicatedAdminDashboard() {
  const { theme, toggleTheme } = useTheme();

  // Dashboard Data State
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Top-Up Station State
  const [clientQuery, setClientQuery] = useState<string>("");
  const [isSearchingClient, setIsSearchingClient] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<ClientLookupResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [rechargeNote, setRechargeNote] = useState<string>("");
  const [isSubmittingRecharge, setIsSubmittingRecharge] = useState<boolean>(false);

  // History search filter
  const [historySearch, setHistorySearch] = useState<string>("");

  // 1. Fetch Dashboard Stats & Balance
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "فشل جلب بيانات لوحة التحكم");
      }
      setData(resData);
      if (isManualRefresh) {
        toast.success("تم تحديث الرصيد وسجل العمليات بنجاح");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Debounced Client Lookup
  useEffect(() => {
    if (!clientQuery || clientQuery.trim().length < 2) {
      setSelectedClient(null);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingClient(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/admin/lookup-client?query=${encodeURIComponent(clientQuery.trim())}`);
        const result = await res.json();
        if (result.found && result.client) {
          setSelectedClient(result.client);
          setSearchError(null);
        } else {
          setSelectedClient(null);
          setSearchError(result.message || "لم يتم العثور على زبون مطابق");
        }
      } catch {
        setSelectedClient(null);
        setSearchError("فشل الاتصال بمحرك البحث عن الزبائن");
      } finally {
        setIsSearchingClient(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [clientQuery]);

  // 3. Handle Client Recharge Execution
  const handleExecuteRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      toast.error("يرجى البحث عن الزبون وتحديده أولاً");
      return;
    }

    const amountNum = parseFloat(rechargeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("يرجى إدخال مبلغ شحن صالح أكبر من الصفر");
      return;
    }

    const currentBalance = data?.admin?.operatingBalance || 0;
    if (amountNum > currentBalance) {
      toast.error(`المبلغ المطلوب ($${amountNum}) يتجاوز رصيدك التشغيلي المتاح ($${currentBalance.toFixed(2)})`);
      return;
    }

    setIsSubmittingRecharge(true);
    try {
      const res = await fetch("/api/admin/recharge-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          amount: amountNum,
          note: rechargeNote,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "فشل إتمام عملية الشحن");
      }

      toast.success(resData.message || "تم شحن رصيد الزبون بنجاح!", {
        description: `تم خصم $${amountNum} من رصيدك وإيداعها في محفظة ${selectedClient.name}`,
      });

      // Clear input form & refresh data
      setRechargeAmount("");
      setRechargeNote("");
      setClientQuery("");
      setSelectedClient(null);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "تعذر إتمام عملية الشحن");
    } finally {
      setIsSubmittingRecharge(false);
    }
  };

  // 4. Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  // Calculations for live profit estimation
  const enteredAmount = parseFloat(rechargeAmount) || 0;
  const estimatedGrossMargin = enteredAmount * 0.05;
  const rootRate = data?.admin?.rootCommissionRate ?? 10.0;
  const estimatedRootShare = (estimatedGrossMargin * rootRate) / 100;
  const estimatedAdminProfit = estimatedGrossMargin - estimatedRootShare;

  const operatingBalance = data?.admin?.operatingBalance || 0.0;
  const filteredHistory = data?.history?.filter((h) => {
    if (!historySearch.trim()) return true;
    const term = historySearch.toLowerCase();
    return (
      h.clientName.toLowerCase().includes(term) ||
      h.clientTag.toLowerCase().includes(term) ||
      h.reference.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="min-h-screen text-right transition-colors duration-200" dir="rtl">
      {/* 1. Dedicated Admin Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#070e17]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1e3a5f]/80 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-amber-500/30">
                <Image
                  src="/images/logo.png"
                  alt="Tsunami Logo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 dark:text-white text-base tracking-tight">
                    تسونامي
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-[#06b6d4] border border-cyan-500/30">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                  بوابة المشرفين المعتمدين • شحن الزبائن
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile, Theme Toggle & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#132840] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#132840] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Admin Profile Chip */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-500/30">
                {data?.admin?.name ? data.admin.name.charAt(0) : "A"}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {data?.admin?.name || "مشرف معتمد"}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  @{data?.admin?.username || "admin"}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              جاري تحميل المحفظة التشغيلية ومؤشرات المشرف...
            </p>
          </div>
        ) : (
          <>
            {/* 2. Prominent Balance Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600/15 via-cyan-600/10 to-amber-600/15 dark:from-[#0d2238] dark:via-[#091624] dark:to-[#07101a] border border-cyan-500/30 dark:border-cyan-500/25 p-6 sm:p-8 shadow-sm dark:shadow-2xl">
              <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-bold font-mono">
                    <Wallet className="w-3.5 h-3.5 text-cyan-600 dark:text-[#06b6d4]" />
                    <span>OPERATING WALLET • رصيد العمليات التشغيلية</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                      ${operatingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-cyan-700 dark:text-[#06b6d4]">
                      USD
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>
                      يتم شحن وتعبئة هذا الرصيد التشغيلي حصراً بواسطة الإدارة العليا (الروت).
                    </span>
                  </p>
                </div>

                {/* Quick Info Box */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f] backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">حصة المشرف الصافية</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {100 - rootRate}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f] backdrop-blur-sm space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">اقتطاع الروت (Root Cut)</span>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                      {rootRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Visual Financial & Customers Metrics (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: My Net Profit */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">أرباحي الصافية (Net Profit)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +${(data?.metrics?.myNetProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  أرباحك المباشرة المستحقة من عمليات الشحن
                </span>
              </div>

              {/* Card 2: Company / Root Share */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حصة الشركة / الروت (Root Share)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  ${(data?.metrics?.companyRootShare || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  عائد المنصة ({rootRate}%) المحسوب تلقائياً
                </span>
              </div>

              {/* Card 3: Total Volume Dispatched */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي المبالغ المشحونة (Volume)</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-[#06b6d4] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  ${(data?.metrics?.totalDispatchedVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  مجموع الأرصدة المحولة للزبائن
                </span>
              </div>

              {/* Card 4: Clients Served */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">عدد الزبائن المخدومين</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {data?.metrics?.clientsServedCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  عملاء مميزون تم إنجاز شحن محافظهم
                </span>
              </div>
            </div>

            {/* 4. Client Fast Top-Up Station */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      محطة الشحن السريع للزبائن (Client Fast Top-Up Station)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ابحث عن حساب الزبون واشحن محفظته فورياً مع احتساب مباشر لصافي ربحك وحصة الشركة
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#070e17] text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                  <span>المتاح:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${operatingBalance.toFixed(2)}</span>
                </div>
              </div>

              <form onSubmit={handleExecuteRecharge} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Step 1: Client Search & Instant Lookup */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      1. معرف الزبون، اسم المستخدم، أو البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        placeholder="ابحث بالمعرف الرقمي (مثال: #1003) أو اسم المستخدم أو الإيميل..."
                        className="w-full pr-10 pl-10 py-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 transition-colors"
                      />
                      {isSearchingClient && (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {/* Instant Verification Feedback Card */}
                    {selectedClient && (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 overflow-hidden bg-slate-900 shrink-0">
                            <img
                              src={selectedClient.image || "/images/logo.png"}
                              alt={selectedClient.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "/images/logo.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                              <span>{selectedClient.name}</span>
                              {selectedClient.isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                  <UserCheck className="w-2.5 h-2.5" />
                                  <span>موثق KYC</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              @{selectedClient.username} • #{selectedClient.numericId}
                            </div>
                          </div>
                        </div>

                        <div className="text-left font-mono">
                          <span className="text-[10px] text-slate-500 block">رصيد الزبون الحالي</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ${selectedClient.currentBalance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {searchError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{searchError}</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Recharge Amount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        2. المبلغ المراد شحنه ($ Amount) *
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        الحد الأقصى: ${operatingBalance.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        step="any"
                        min="1"
                        max={operatingBalance}
                        required
                        dir="ltr"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-9 pr-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-base outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {[10, 25, 50, 100, 250].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRechargeAmount(preset.toString())}
                          disabled={preset > operatingBalance}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#070e17] hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-[11px] font-mono font-bold transition-colors cursor-pointer border border-slate-200 dark:border-[#1e3a5f] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +${preset}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRechargeAmount(operatingBalance.toString())}
                        disabled={operatingBalance <= 0}
                        className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-[#06b6d4] text-[11px] font-bold transition-colors cursor-pointer border border-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        كامل رصيدي (${operatingBalance.toFixed(2)})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Note & Live Estimation Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-end">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      3. ملاحظة العملية أو رقم المعاملة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={rechargeNote}
                      onChange={(e) => setRechargeNote(e.target.value)}
                      placeholder="مثال: شحن فوري بناءً على إشعار تحويل محلي..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Real-time Profit Preview Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block text-[11px]">
                          محاكاة الربح المباشر:
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          هامش خدمة 5% • حصة الـ Root: {rootRate}%
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        ربحك: +${estimatedAdminProfit.toFixed(2)}
                      </div>
                      <div className="text-amber-600 dark:text-amber-400 text-[10px]">
                        الشركة: ${estimatedRootShare.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingRecharge || !selectedClient || enteredAmount <= 0 || enteredAmount > operatingBalance}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRecharge ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري تنفيذ الشحن والاقتطاع...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>⚡ إتمام الشحن للزبون فورياً</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* 5. Client Operations History Table */}
            <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl overflow-hidden shadow-sm space-y-4 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1e3a5f] pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <span>سجل عمليات الزبائن المنفذة (Dispatched History)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أرشيف مفصل لجميع عمليات شحن الرصيد المنجزة من محفظتك التشغيلية
                  </p>
                </div>

                {/* Filter */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="فلترة بالزبون أو الرقم المرجعي..."
                    className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>لم يتم تسجيل أي عمليات شحن للزبائن حتى الآن.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-[#102235] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                      <tr>
                        <th className="px-5 py-3.5">تاريخ ووقت العملية</th>
                        <th className="px-5 py-3.5">الزبون</th>
                        <th className="px-5 py-3.5 text-center">المبلغ المشحون</th>
                        <th className="px-5 py-3.5 text-center">ربحي من العملية ($)</th>
                        <th className="px-5 py-3.5 text-center">حصة الشركة ($)</th>
                        <th className="px-5 py-3.5 text-left">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                      {filteredHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-[#132840]/60 transition-colors"
                        >
                          {/* Date & Time */}
                          <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(item.createdAt).toLocaleString("ar-SY", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* Client */}
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <span>{item.clientName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#070e17] text-slate-500 border border-slate-200 dark:border-[#1e3a5f]">
                                {item.clientTag}
                              </span>
                            </div>
                          </td>

                          {/* Amount Dispatched */}
                          <td className="px-5 py-3.5 text-center font-mono font-black text-slate-900 dark:text-white">
                            ${item.amount.toFixed(2)}
                          </td>

                          {/* My Profit */}
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +${item.myProfit.toFixed(2)}
                          </td>

                          {/* Company Cut */}
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                            ${item.companyShare.toFixed(2)}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5 text-left">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مكتملة بنجاح</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
