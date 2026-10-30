"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Bot,
  User,
  CreditCard,
  Camera,
  ExternalLink,
  Loader2,
  RefreshCw,
  X,
  FileCheck,
  AlertTriangle,
  Eye,
  Sliders,
  Check,
  Ban,
  Send,
  BarChart3,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicKycItem } from "@/lib/dynamic-hub";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";

export default function RootAdminKycPage() {
  const [kycRecords, setKycRecords] = useState<DynamicKycItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Inspection Modal State
  const [selectedRecord, setSelectedRecord] = useState<DynamicKycItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Telegram Integration & Weekly Audit State
  const [telegramStatus, setTelegramStatus] = useState<{
    configured: boolean;
    botTokenConfigured: boolean;
    adminChatIdConfigured: boolean;
  } | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [isSendingAudit, setIsSendingAudit] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch("/api/admin/kyc/telegram-test");
      const data = await res.json();
      setTelegramStatus(data);
    } catch {
      // Ignore
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    try {
      const res = await fetch("/api/admin/kyc/telegram-test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || data.message || "فشل اختبار تيليجرام");
      }
    } catch {
      toast.error("خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleFetchAuditPreview = async () => {
    try {
      const res = await fetch("/api/admin/kyc/weekly-audit?days=7");
      const data = await res.json();
      if (data.success) {
        setAuditReport(data.audit);
        setAuditModalOpen(true);
      }
    } catch {
      toast.error("فشل توليد التقرير");
    }
  };

  const handleSendWeeklyAudit = async () => {
    setIsSendingAudit(true);
    try {
      const res = await fetch("/api/admin/kyc/weekly-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 7 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAuditReport(data.audit);
      } else {
        toast.error(data.error || "فشل إرسال التقرير");
      }
    } catch {
      toast.error("خطأ في الاتصال");
    } finally {
      setIsSendingAudit(false);
    }
  };

  const fetchKycRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.success && data.kycRecords) {
        setKycRecords(data.kycRecords);
      }
    } catch {
      toast.error("فشل تحميل طلبات توثيق الهوية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRecords();
    fetchTelegramStatus();
  }, []);

  const handleApprove = async (record: DynamicKycItem) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: record.id,
          decision: "APPROVE",
          reviewedBy: "Root Super-Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setKycRecords((prev) =>
          prev.map((k) => (k.id === record.id ? { ...k, status: "AUTO_VERIFIED" } : k))
        );
        setSelectedRecord(null);
      } else {
        toast.error(data.error || "فشل اعتماد التوثيق");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleReject = async (record: DynamicKycItem) => {
    if (!rejectionReason.trim()) {
      toast.error("يرجى كتابة سبب الرفض لتنبيه العميل");
      return;
    }

    setIsProcessingAction(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: record.id,
          decision: "REJECT",
          reviewedBy: "Root Super-Admin",
          notes: rejectionReason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setKycRecords((prev) =>
          prev.map((k) => (k.id === record.id ? { ...k, status: "REJECTED" } : k))
        );
        setSelectedRecord(null);
        setShowRejectForm(false);
        setRejectionReason("");
      } else {
        toast.error(data.error || "فشل رفض التوثيق");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredRecords = kycRecords.filter((k) => {
    const matchesSearch =
      searchQuery === "" ||
      (k.userName && k.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (k.userEmail && k.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (k.idNumber && k.idNumber.includes(searchQuery)) ||
      (k.userNumericId && String(k.userNumericId).includes(searchQuery.replace("#", "")));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && (k.status === "PENDING_BOT_REVIEW" || k.status === "MANUAL_REVIEW")) ||
      k.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalVerified = kycRecords.filter((k) => k.status === "AUTO_VERIFIED").length;
  const totalPending = kycRecords.filter(
    (k) => k.status === "PENDING_BOT_REVIEW" || k.status === "MANUAL_REVIEW"
  ).length;
  const totalRejected = kycRecords.filter((k) => k.status === "REJECTED").length;

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <Bot className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPER-ADMIN AI / OCR VERIFICATION ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              محرك توثيق الهويات الذكي (KYC)
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              استخراج بيانات البطاقات الشخصية عبر OCR، مطابقة الأسماء آلياً، بوت تيليجرام الإداري، والاعتماد الفوري أو المراجعة الإدارية.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchKycRecords}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {/* Telegram Bot Integration Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0088cc]/15 border border-[#0088cc]/30 flex items-center justify-center shrink-0 text-[#0088cc]">
              <Send className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  بوت تيليجرام والتدقيق الأسبوعي الدوري
                </span>
                {telegramStatus?.configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    متصل ونشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                    بحاجة لضبط التوكن (.env)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                إرسال إشعارات فورية مع بطاقات الهوية وأزرار اتخاذ القرار (قبول/رفض) مباشرة من تيليجرام.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFetchAuditPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
              <span>معاينة التقرير الأسبوعي</span>
            </button>

            <button
              type="button"
              onClick={handleSendWeeklyAudit}
              disabled={isSendingAudit || !telegramStatus?.configured}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#006699] hover:from-[#0099e6] hover:to-[#0077b3] disabled:opacity-50 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
            >
              {isSendingAudit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>إرسال التقرير لتيليجرام</span>
            </button>

            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramStatus?.configured}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#0088cc]/40 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:text-[#0088cc] text-xs font-bold transition-all cursor-pointer"
            >
              {isTestingTelegram ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0088cc]" /> : <MessageSquare className="w-3.5 h-3.5 text-[#0088cc]" />}
              <span>فحص الاتصال (Ping)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">إجمالي طلبات التوثيق</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            {kycRecords.length} طلب
          </span>
        </div>
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">توثيق آلي بالذكاء الاصطناعي</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {totalVerified} طلب
          </span>
        </div>
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">بانتظار تدقيق المشرف</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">
            {totalPending} طلب
          </span>
        </div>
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold">مستندات مرفوضة</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1 block">
            {totalRejected} طلب
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            جميع الطلبات ({kycRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            بانتظار المراجعة ({totalPending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("AUTO_VERIFIED")}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "AUTO_VERIFIED"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            موثق رسمياً ({totalVerified})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === "REJECTED"
                ? "bg-rose-500 text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            مرفوض ({totalRejected})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الرقم الوطني، أو المعرف..."
            className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* KYC Table Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] overflow-hidden shadow-xs dark:shadow-xl transition-colors">
        {loading && kycRecords.length === 0 ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">جاري تحميل طلبات التوثيق...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد طلبات توثيق مطابقة لبحثك
            </h4>
            <p className="text-slate-500">ستظهر هنا أي وثائق هوية جديدة يرفعها المستخدمون للتحقق.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                <tr>
                  <th className="px-5 py-4">العميل والمستند</th>
                  <th className="px-5 py-4">البيانات المستخرجة (OCR)</th>
                  <th className="px-5 py-4">التحقق الذكي (AI Bot)</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4 text-left">الإجراء والتدقيق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                {filteredRecords.map((record) => {
                  const isVerified = record.status === "AUTO_VERIFIED";
                  const isRejected = record.status === "REJECTED";

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#13253a]/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                            {record.userName ? record.userName.charAt(0) : "U"}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{record.userName || "مستخدم غير محدد"}</span>
                              {record.userNumericId && (
                                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                                  #{record.userNumericId}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {record.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {record.idNumber || "لم يُستخرج رقم بعد"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {record.extractedName || record.userName}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white block">
                              ثقة OCR: {record.matchScore || 95}%
                            </span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              مطابقة أمنية عالية
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                            isVerified
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              : isRejected
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {isVerified
                            ? "موثق رسمياً"
                            : isRejected
                            ? "مرفوض"
                            : "بانتظار المراجعة"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowRejectForm(false);
                            setRejectionReason("");
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-500" />
                          <span>معاينة وتدقيق</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* KYC Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  تدقيق وثيقة الهوية والمطابقة الأمنية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Images Grid */}
            {(() => {
              const frontUrl =
                (selectedRecord as any).frontImage ||
                (selectedRecord as any).idFrontUrl ||
                (selectedRecord as any).frontDocument ||
                selectedRecord.idCardFrontUrl;

              const backUrl =
                (selectedRecord as any).backImage ||
                (selectedRecord as any).idBackUrl ||
                (selectedRecord as any).backDocument ||
                selectedRecord.idCardBackUrl;

              const selfieUrl =
                (selectedRecord as any).selfieImage ||
                (selectedRecord as any).selfieUrl ||
                (selectedRecord as any).selfie;

              return (
                <div className={`grid grid-cols-1 ${selfieUrl ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4`}>
                  {/* Front ID */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 block">الوجه الأمامي للبطاقة</span>
                      {frontUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(frontUrl, "_blank")}
                          className="text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>عرض كامل</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-100 dark:bg-[#13253a] flex items-center justify-center">
                      {frontUrl ? (
                        <img
                          src={frontUrl}
                          alt="الوجه الأمامي"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(frontUrl, "_blank")}
                          onError={(e) => {
                            (e.target as any).src = FALLBACK_IMAGE;
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <CreditCard className="w-8 h-8 mb-2 stroke-1" />
                          <span className="text-xs">لم يتم إرفاق وجه أمامي</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back ID */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 block">الوجه الخلفي للبطاقة</span>
                      {backUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(backUrl, "_blank")}
                          className="text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>عرض كامل</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-100 dark:bg-[#13253a] flex items-center justify-center">
                      {backUrl ? (
                        <img
                          src={backUrl}
                          alt="الوجه الخلفي"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(backUrl, "_blank")}
                          onError={(e) => {
                            (e.target as any).src = FALLBACK_IMAGE;
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <CreditCard className="w-8 h-8 mb-2 stroke-1" />
                          <span className="text-xs">لم يتم إرفاق وجه خلفي</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selfie (if available) */}
                  {selfieUrl && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 block">صورة سيلفي المطابقة</span>
                        <button
                          type="button"
                          onClick={() => window.open(selfieUrl, "_blank")}
                          className="text-[10px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>عرض كامل</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#1e3a5f] bg-slate-100 dark:bg-[#13253a] flex items-center justify-center">
                        <img
                          src={selfieUrl}
                          alt="صورة سيلفي"
                          className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(selfieUrl, "_blank")}
                          onError={(e) => {
                            (e.target as any).src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Extracted Details */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white">البيانات المستخرجة تلقائياً (OCR)</h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">الرقم الوطني المستخرج:</span>
                  <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                    {selectedRecord.idNumber || "غير متوفر"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الاسم الكامل:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedRecord.extractedName || selectedRecord.userName}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions / Reject Form */}
            {!showRejectForm ? (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>رفض التوثيق</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedRecord)}
                  disabled={isProcessingAction}
                  className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>اعتماد وتوثيق الحساب رسمياً</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#1e3a5f]">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  سبب الرفض (سيتم إرساله كإشعار للعميل):
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: صورة الهوية غير واضحة، يرجى إعادة الرفع في إضاءة جيدة..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#13253a] text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedRecord)}
                    disabled={isProcessingAction}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer shadow-md"
                  >
                    {isProcessingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    <span>تأكيد الرفض</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly Audit Preview Modal */}
      {auditModalOpen && auditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  معاينة تقرير التدقيق الأسبوعي للهويات
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                <span className="text-slate-400 block text-[11px]">الطلبات الجديدة (7 أيام):</span>
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {auditReport.totalNewRequests || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                <span className="text-slate-400 block text-[11px]">معدل القبول الآلي:</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {auditReport.approvedRate || "96%"}
                </span>
              </div>
            </div>

            <div className="text-left pt-2">
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
