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

export default function RootKycDashboardPage() {
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <Bot className="w-4 h-4 text-[#d4af37]" /> محرك توثيق الهويات الذكي (AI / OCR Verification Engine)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            مراجعة وتدقيق هويات العملاء والموزعين
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            استخراج بيانات البطاقات الشخصية عبر OCR، مطابقة الأسماء آلياً، والاعتماد الفوري أو المراجعة الإدارية
          </p>
        </div>

        <button
          onClick={fetchKycRecords}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] hover:border-[#d4af37] text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          <span>تحديث الطلبات</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">إجمالي طلبات التوثيق</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{kycRecords.length} طلب</span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">توثيق آلي بالذكاء الاصطناعي</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {totalVerified} طلب
          </span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">بانتظار تدقيق المشرف</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
            {totalPending} طلب
          </span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">مستندات مرفوضة</span>
          <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
            {totalRejected} طلب
          </span>
        </div>
      </div>

      {/* Telegram Bot Integration & Weekly Audit Bar */}
      <div className="bg-gradient-to-r from-[#071322] via-[#0d213a] to-[#0a192f] border border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0088cc]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/15 border border-[#0088cc]/30 flex items-center justify-center shrink-0 text-[#0088cc]">
              <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black text-white">
                  بوت تيليجرام الإداري لتدقيق الهويات والتقارير الأسبوعية
                </span>
                {telegramStatus?.configured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    متصل ونشط
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    بحاجة لضبط التوكن (.env)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                إرسال إشعارات فورية مع بطاقات الهوية وأزرار اتخاذ القرار (قبول/رفض) مباشرة من تيليجرام، مع تدقيق أسبوعي دوري.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleFetchAuditPreview}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] hover:border-[#d4af37] text-slate-300 hover:text-white text-xs font-bold transition-all"
            >
              <BarChart3 className="w-4 h-4 text-[#d4af37]" />
              <span>معاينة التدقيق الأسبوعي</span>
            </button>

            <button
              onClick={handleSendWeeklyAudit}
              disabled={isSendingAudit || !telegramStatus?.configured}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#006699] hover:from-[#0099e6] hover:to-[#0077b3] disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all"
            >
              {isSendingAudit ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>إرسال التقرير لتيليجرام</span>
            </button>

            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramStatus?.configured}
              title="إرسال إشعار فحص الاتصال للتأكد من وصول الرسائل لمجموعة الإدارة"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] hover:border-[#0088cc] disabled:opacity-50 text-slate-300 hover:text-[#38bdf8] text-xs font-bold transition-all"
            >
              {isTestingTelegram ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0088cc]" />
              ) : (
                <MessageSquare className="w-4 h-4 text-[#0088cc]" />
              )}
              <span>فحص الاتصال (Ping)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-slate-950 shadow-md"
                : "bg-[#070e17] text-slate-300 border border-[#1e3a5f]"
            }`}
          >
            جميع الطلبات ({kycRecords.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-[#070e17] text-slate-300 border border-[#1e3a5f]"
            }`}
          >
            بانتظار المراجعة ({totalPending})
          </button>
          <button
            onClick={() => setStatusFilter("AUTO_VERIFIED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "AUTO_VERIFIED"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "bg-[#070e17] text-slate-300 border border-[#1e3a5f]"
            }`}
          >
            موثق رسمياً ({totalVerified})
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
              statusFilter === "REJECTED"
                ? "bg-rose-500 text-white shadow-md"
                : "bg-[#070e17] text-slate-300 border border-[#1e3a5f]"
            }`}
          >
            مرفوض ({totalRejected})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الرقم الوطني، أو المعرف..."
            className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* KYC Records List */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e17] border-b border-[#1e3a5f] text-slate-400 font-bold">
              <tr>
                <th className="p-4">المعرف</th>
                <th className="p-4">اسم العميل</th>
                <th className="p-4">الرقم الوطني / الهوية</th>
                <th className="p-4">الاسم المستخرج (OCR)</th>
                <th className="p-4 text-center">نسبة التطابق الذكي</th>
                <th className="p-4">حالة القرار</th>
                <th className="p-4 text-center">إجراء المشرف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a5f]/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin mx-auto mb-2" />
                    <span>جاري تحميل طلبات الهوية...</span>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    لا توجد طلبات توثيق مطابقة في هذا التصنيف.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#13253a]/50 transition-colors">
                    {/* User Numeric ID */}
                    <td className="p-4">
                      <span className="font-mono font-black text-[#d4af37] bg-[#070e17] px-2.5 py-1 rounded-lg border border-[#d4af37]/30 text-xs">
                        #{record.userNumericId || "1004"}
                      </span>
                    </td>

                    {/* Name & Email */}
                    <td className="p-4">
                      <span className="font-bold text-white block">{record.userName || "عميل تسونامي"}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {record.userEmail || "—"}
                      </span>
                    </td>

                    {/* ID Number */}
                    <td className="p-4">
                      <span className="font-mono text-slate-200 font-bold text-xs">
                        {record.idNumber || "لم يُسجل"}
                      </span>
                    </td>

                    {/* OCR Extracted Name */}
                    <td className="p-4">
                      <span className="text-slate-300 font-semibold">
                        {record.extractedName || "جاري الاستخراج..."}
                      </span>
                    </td>

                    {/* Match Score Meter */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs bg-[#070e17] border border-[#1e3a5f]">
                        <span
                          className={
                            (record.matchScore ?? 0) >= 85
                              ? "text-emerald-400"
                              : (record.matchScore ?? 0) >= 60
                              ? "text-amber-400"
                              : "text-rose-400"
                          }
                        >
                          {record.matchScore ? `${record.matchScore}%` : "—"}
                        </span>
                        <Bot className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {record.status === "AUTO_VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> موثق تلقائياً
                        </span>
                      ) : record.status === "MANUAL_REVIEW" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> يتطلب فحص يدوي
                        </span>
                      ) : record.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> مرفوض
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> فحص الروبوت
                        </span>
                      )}
                    </td>

                    {/* Inspection Button */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowRejectForm(false);
                          setRejectionReason("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>فحص المستندات</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Verification Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    تدقيق طلب توثيق الهوية — العميل #{selectedRecord.userNumericId || "1004"}
                  </h2>
                  <span className="text-xs text-slate-400">
                    مقارنة الوثائق المرفوعة مع بيانات الحساب الشخصي عبر الذكاء الاصطناعي
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-[#070e17] text-slate-400 hover:text-white border border-[#1e3a5f]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-Side Inspection Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Account Profile vs OCR Extracted Data */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#06b6d4]" />
                  بيانات الحساب ومطابقة OCR
                </h3>

                <div className="p-4 rounded-2xl bg-[#070e17] border border-[#1e3a5f] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الاسم المسجل بالحساب:</span>
                    <span className="font-bold text-white text-sm">{selectedRecord.userName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الاسم المستخرج من البطاقة:</span>
                    <span className="font-bold text-[#f3e5ab] text-sm font-mono">
                      {selectedRecord.extractedName || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الرقم الوطني / الهوية:</span>
                    <span className="font-mono text-white font-bold text-sm">
                      {selectedRecord.idNumber || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">البريد الإلكتروني:</span>
                    <span className="font-mono text-slate-300">{selectedRecord.userEmail}</span>
                  </div>

                  <div className="pt-2 border-t border-[#1e3a5f]/60 flex items-center justify-between">
                    <span className="text-slate-400">نسبة تطابق الروبوت:</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`text-base font-black ${
                          (selectedRecord.matchScore ?? 0) >= 85
                            ? "text-emerald-400"
                            : (selectedRecord.matchScore ?? 0) >= 60
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {selectedRecord.matchScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {(selectedRecord.matchScore ?? 0) >= 85 ? "تطابق ممتاز" : "تطابق جزئي"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bot Audit Notes */}
                <div className="p-4 rounded-2xl bg-[#13253a]/60 border border-[#1e3a5f] space-y-2">
                  <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    تقرير روبوت الذكاء الاصطناعي:
                  </span>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                    {selectedRecord.botNotes || "تمت معالجة المستند عبر نظام التحقق الآلي."}
                  </p>
                </div>
              </div>

              {/* Right Column: Uploaded Documents */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#d4af37]" />
                  الوثائق الرسمية المرفوعة
                </h3>

                <div className="space-y-3">
                  {/* Front ID Card */}
                  <div className="p-3 rounded-2xl bg-[#070e17] border border-[#1e3a5f] space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      وجه الهوية الأمامي (Front ID)
                    </span>
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {selectedRecord.idCardFrontUrl ? (
                        <div className="text-center p-4">
                          <CreditCard className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                          <span className="text-xs text-slate-300 font-mono block">
                            {selectedRecord.idCardFrontUrl}
                          </span>
                          <span className="text-[10px] text-emerald-400 mt-1 block">
                            ✅ بطاقة الهوية الوطنية السورية / التركية
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">لا توجد صورة</span>
                      )}
                    </div>
                  </div>

                  {/* Back ID Card or Selfie */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-[#070e17] border border-[#1e3a5f] space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block">الوجه الخلفي</span>
                      <div className="h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-[11px]">
                        {selectedRecord.idCardBackUrl ? (
                          <span className="text-emerald-400 font-bold">مرفق ✅</span>
                        ) : (
                          "غير مرفق"
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#070e17] border border-[#1e3a5f] space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 block">صورة السيلفي الشخصية</span>
                      <div className="h-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-[11px]">
                        {selectedRecord.selfieUrl ? (
                          <div className="text-center">
                            <Camera className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                            <span className="text-emerald-400 font-bold">تم الفحص ✅</span>
                          </div>
                        ) : (
                          "غير مرفق"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Form Input */}
            {showRejectForm && (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                <label className="block text-xs font-bold text-rose-300">
                  سبب رفض التوثيق (سيظهر للمستخدم لتصحيح الطلب):
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: صورة البطاقة غير واضحة وبها انعكاس ضوئي يحجب الرقم الوطني، يرجى إعادة التصوير."
                  className="w-full bg-[#070e17] border border-rose-500/40 text-xs text-white rounded-xl p-3 outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                المشرف المسؤول: <strong>Root Super-Admin</strong>
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {showRejectForm ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                    >
                      تراجع
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleReject(selectedRecord)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
                    >
                      {isProcessingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>تأكيد الرفض</span>}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>رفض التوثيق مع ذكر السبب</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleApprove(selectedRecord)}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-lg transition-all"
                    >
                      {isProcessingAction ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>قبول التوثيق واعتماد الحساب</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Audit Preview Modal */}
      {auditModalOpen && auditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">تقرير التدقيق الأسبوعي لتوثيق الهويات (KYC Audit)</h3>
                  <p className="text-xs text-slate-400">الفترة: {auditReport.startDate} إلى {auditReport.endDate}</p>
                </div>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#070e17] border border-[#1e3a5f] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">إجمالي الطلبات</span>
                <span className="text-xl font-black text-white font-mono mt-0.5 block">{auditReport.totalSubmissions}</span>
              </div>
              <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">موثق ومقبول</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">{auditReport.autoVerified} ({auditReport.autoVerifyRate}%)</span>
              </div>
              <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">قيد المراجعة</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">{auditReport.manualReview}</span>
              </div>
              <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold">مرفوض</span>
                <span className="text-xl font-black text-rose-400 font-mono mt-0.5 block">{auditReport.rejected} ({auditReport.rejectionRate}%)</span>
              </div>
            </div>

            <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-300 block mb-2">نص الرسالة المعد للإرسال عبر تيليجرام:</span>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-[#050b12] p-4 rounded-xl border border-[#1e3a5f]/50 max-h-56 overflow-y-auto leading-relaxed">
                {auditReport.formattedReport?.replace(/<[^>]+>/g, "")}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1e3a5f]">
              <span className="text-[11px] text-slate-500">
                متوسط تطابق OCR الذكي: <strong className="text-emerald-400">{auditReport.avgScore}%</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    handleSendWeeklyAudit();
                    setAuditModalOpen(false);
                  }}
                  disabled={isSendingAudit || !telegramStatus?.configured}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0099e6] disabled:opacity-50 text-white text-xs font-bold shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال لمجموعة تيليجرام</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
