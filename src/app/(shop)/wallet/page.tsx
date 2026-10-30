"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUserRole } from "@/components/UserRoleContext";
import Link from "next/link";
import {
  Wallet,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import KycRequiredModal from "@/components/ui/KycRequiredModal";

function WalletContent() {
  const { role, userId, numericId, userName, walletBalance, refreshWallet, currentUser, isVerified } = useUserRole();
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;

  const [activeTab, setActiveTab] = useState<"ledger" | "orders">("ledger");
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
    if (tabParam === "orders") {
      setActiveTab("orders");
    } else {
      setActiveTab("ledger");
    }
  }, [tabParam]);

  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersRes, walletRes] = await Promise.all([
        fetch(`/api/orders?userId=${userId}`),
        fetch(`/api/wallet/balance?userId=${userId}`),
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setTransactions(wData.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    await fetchData();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("تم تحديث الرصيد وسجل الحساب بنجاح");
    }, 400);
  };

  const handleCopyId = () => {
    const textToCopy = `#${numericId}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(true);
    toast.success("تم نسخ معرّف الحساب بنجاح", { description: textToCopy });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            مكتمل ومسلّم
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            قيد المعالجة
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            في طابور الشحن
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            فشل وتم الاسترجاع
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/15 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen text-right transition-colors duration-200 space-y-6">
      {/* 1. Wallet Header & Account Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-7 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#d4af37] p-[2px] shadow-sm shrink-0">
            <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center font-black text-xl text-[#f3e5ab]">
              {userName.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{userName}</h1>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  role === "RESELLER"
                    ? "bg-sky-100 text-sky-800 border-sky-300 dark:bg-[#06b6d4]/20 dark:text-[#06b6d4] dark:border-[#06b6d4]/40"
                    : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40"
                }`}
              >
                {role === "RESELLER" ? "حساب موزع VIP" : "حساب عميل"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-[#070e17] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#d4af37]/40 text-xs font-mono font-bold text-slate-700 dark:text-[#f3e5ab] transition-colors"
                title="نسخ المعرف"
              >
                <span className="text-slate-400 font-sans text-[10px]">معرّف الحساب:</span>
                <span className="text-amber-700 dark:text-[#d4af37] font-black">#{numericId}</span>
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Balance Card + Direct Primary Deposit Button */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 sm:p-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 dark:text-[#d4af37] border border-amber-500/30 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                الرصيد المتاح
              </span>
              <button
                onClick={handleManualRefresh}
                className="text-slate-400 hover:text-amber-600 dark:hover:text-[#d4af37] transition-colors p-0.5"
                title="تحديث الرصيد"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isRefreshing ? "animate-spin text-amber-600 dark:text-[#d4af37]" : ""}`}
                />
              </button>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-[#f3e5ab] font-mono leading-none mt-1">
              ${walletBalance.toFixed(2)}{" "}
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">USD</span>
            </div>
          </div>

          {currentUser && !isVerified ? (
            <button
              type="button"
              onClick={() => setShowKycModal(true)}
              className="mr-2 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.02] whitespace-nowrap opacity-90 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>+ شحن رصيد جديد</span>
            </button>
          ) : (
            <Link
              href="/deposit"
              className="mr-2 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.02] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ شحن رصيد جديد</span>
            </Link>
          )}
        </div>
      </div>

      {/* KYC View-Only Restriction Banner */}
      {currentUser && !isVerified && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                  حسابك مقيد (وضع العرض فقط)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  يتطلب توثيق الهوية KYC
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                وفقاً لسياسة الأمان والامتثال المالي، لا يمكنك تنفيذ عمليات شحن المحفظة أو طلبات الشحن الرقمية حتى يتم إتمام توثيق هويتك بنجاح.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm shrink-0 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>توثيق الحساب الآن</span>
          </Link>
        </div>
      )}

      {/* Top-Up Operator Notification Banner */}
      {(() => {
        const latestTopup = transactions.find((t) => t.operatorName && (t.type === "DEPOSIT" || Number(t.amount) > 0));
        if (!latestTopup) return null;
        return (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  تمت إضافة الرصيد بنجاح لحسابك بواسطة المشرف: <span className="text-amber-600 dark:text-amber-400 font-black">{latestTopup.operatorName}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  المبلغ: +${Math.abs(Number(latestTopup.amount)).toFixed(2)} • {latestTopup.description} • {new Date(latestTopup.createdAt).toLocaleString("ar-SY")}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap hidden sm:inline-block">
              إشعار معتمد ✓
            </span>
          </div>
        );
      })()}

      {/* 2. Navigation Tabs (Ledger & Orders only) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "ledger"
                ? "border-amber-500 text-amber-700 dark:text-[#d4af37]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سجل الحركات والقيود المحاسبية ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "border-cyan-500 text-cyan-700 dark:text-[#06b6d4]"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سجل طلبات الشحن الرقمية ({orders.length})</span>
          </button>
        </div>

        {currentUser && !isVerified ? (
          <button
            type="button"
            onClick={() => setShowKycModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-[#d4af37] hover:underline cursor-pointer"
          >
            <span>بوابة الإيداع الموحدة</span>
            <Lock className="w-3 h-3 text-amber-500" />
          </button>
        ) : (
          <Link
            href="/deposit"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-[#d4af37] hover:underline"
          >
            <span>بوابة الإيداع الموحدة</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        )}
      </div>

      {/* Tab 1: Ledger Transactions Table */}
      {activeTab === "ledger" && (
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
                سجل القيود المحاسبية للمحفظة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تتبع تدفق الرصيد، الإيداعات المعتمدة، والمبالغ المخصومة لكل طلب
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {transactions.length} قيد محاسبي
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p>لا توجد حركات مالية مسجلة في محفظتك حتى الآن.</p>
              <div>
                <Link
                  href="/deposit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إيداع رصيد جديد الآن</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-600 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                  <tr>
                    <th className="px-6 py-3.5">نوع الحركة</th>
                    <th className="px-6 py-3.5">البيان والتفاصيل</th>
                    <th className="px-6 py-3.5">المرجع</th>
                    <th className="px-6 py-3.5">المبلغ</th>
                    <th className="px-6 py-3.5">الرصيد بعد الحركة</th>
                    <th className="px-6 py-3.5">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "DEPOSIT" || tx.type === "ORDER_REFUND" || Number(tx.amount) > 0;
                    return (
                      <tr key={tx.id || tx.reference} className="hover:bg-slate-50 dark:hover:bg-[#13253a]/40 transition-colors">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCredit
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            )}
                            {tx.type === "DEPOSIT"
                              ? "إيداع رصيد"
                              : tx.type === "ORDER_PAYMENT"
                              ? "شراء / شحن"
                              : tx.type === "ORDER_REFUND"
                              ? "استرجاع رصيد"
                              : "تسوية حساب"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-xs">
                          <div className="truncate">{tx.description || "معاملة حساب"}</div>
                          {tx.operatorName && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                              <span>تم الشحن والاعتماد بواسطة:</span>
                              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                                <img
                                  src={tx.operatorAvatar || "/images/logo.png"}
                                  alt={tx.operatorName}
                                  className="w-4 h-4 rounded-full border border-amber-500/50 object-cover"
                                />
                                <span>{tx.operatorName || "إدارة تسونامي"}</span>
                                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">إدارة</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {tx.reference}
                        </td>
                        <td
                          className={`px-6 py-4 font-mono font-black text-xs ${
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isCredit ? "+" : "-"}${Math.abs(Number(tx.amount)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                          ${Number(tx.balanceAfter).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(tx.createdAt).toLocaleString("ar-SY", { timeZone: "Asia/Damascus" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders History */}
      {activeTab === "orders" && (
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-600 dark:text-[#06b6d4]" />
                الطلبات الرقمية المنفذة
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تحديث فوري لحالات الطلبات عبر السيرفر
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {orders.length} طلب
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p>لم تقم بإجراء أي عمليات شحن بعد.</p>
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-50 hover:bg-cyan-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-cyan-700 dark:text-[#06b6d4] border border-cyan-300 dark:border-[#06b6d4]/40 transition-colors"
                >
                  تصفح دليل الألعاب والخدمات
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-600 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                  <tr>
                    <th className="px-6 py-3.5">رقم الطلب</th>
                    <th className="px-6 py-3.5">الخدمة والباقة</th>
                    <th className="px-6 py-3.5">معرّف الحساب / UID</th>
                    <th className="px-6 py-3.5">المبلغ</th>
                    <th className="px-6 py-3.5">حالة الشحن</th>
                    <th className="px-6 py-3.5">التوقيت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                  {orders.map((order) => (
                    <tr key={order.id || order.orderNumber} className="hover:bg-slate-50 dark:hover:bg-[#13253a]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-amber-700 dark:text-[#f3e5ab]">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {order.productName || "شحن رقمي"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {order.packageName || order.packageId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">{order.targetId}</div>
                        {order.playerNickname && (
                          <div className="text-[11px] text-cyan-700 dark:text-[#06b6d4] font-bold">
                            {order.playerNickname}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-amber-600 dark:text-[#d4af37] font-mono">
                        ${Number(order.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleString("ar-SY", { timeZone: "Asia/Damascus" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KYC Restriction Modal */}
      <KycRequiredModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        actionName="شحن الرصيد والعمليات المالية"
      />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-500">
          جاري تحميل بيانات المحفظة...
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
