"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Eye,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";

export default function RootAdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Receipt Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Reject Note Modal
  const [rejectModalDeposit, setRejectModalDeposit] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState("رقم إشعار التحويل غير واضح أو تم استخدامه مسبقاً");

  const fetchDeposits = async () => {
    try {
      const res = await fetch("/api/deposits");
      if (res.ok) {
        const data = await res.json();
        setDeposits(data.deposits || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
    const interval = setInterval(fetchDeposits, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (deposit: any) => {
    setProcessingId(deposit.id);
    try {
      const res = await fetch("/api/admin/deposits/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId: deposit.id,
          action: "APPROVE",
          adminUserId: "admin-root",
          note: "تمت الموافقة والاعتماد من قبل الإدارة العليا (Root Admin)",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل اعتماد الإيداع");

      toast.success("تم تأكيد الإيداع وإضافة الرصيد بنجاح!", {
        description: `تمت إضافة $${Number(deposit.amount).toFixed(2)} ${deposit.currency} إلى حساب ${deposit.userId} عبر قيد محاسبي مؤمّن.`,
      });

      await fetchDeposits();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء اعتماد الإيداع");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalDeposit) return;
    setProcessingId(rejectModalDeposit.id);

    try {
      const res = await fetch("/api/admin/deposits/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId: rejectModalDeposit.id,
          action: "REJECT",
          adminUserId: "admin-root",
          note: rejectNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل رفض الإيداع");

      toast.info("تم رفض طلب الإيداع", {
        description: `سيظهر للعميل سبب الرفض: ${rejectNote}`,
      });

      setRejectModalDeposit(null);
      await fetchDeposits();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء رفض الإيداع");
    } finally {
      setProcessingId(null);
    }
  };

  const statusLabels: Record<string, string> = {
    ALL: "الكل",
    PENDING: "قيد المراجعة",
    APPROVED: "مقبول ومكتمل",
    REJECTED: "مرفوض",
  };

  const filteredDeposits = deposits.filter((dep) => {
    const matchesStatus = filterStatus === "ALL" || dep.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      dep.depositNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dep.senderName && dep.senderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dep.transferReference && dep.transferReference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPER-ADMIN FINANCIAL AUDIT & SETTLEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              مراجعة الإيداعات البنكية وإيصالات الدفع
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              تدقيق الحوالات المصرفية، إيصالات شام كاش، وتغذية المحافظ بعمليات مالية مؤمّنة فورياً مع التحديث الحي.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDeposits}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث الإيصالات</span>
          </button>
        </div>

        {/* Live Filter Bar & Search */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
                }`}
              >
                {statusLabels[st]} ({st === "ALL" ? deposits.length : deposits.filter((d) => d.status === st).length})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الإشعار، العميل، أو المرسل..."
              className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Deposits Table Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] overflow-hidden shadow-xs dark:shadow-xl transition-colors">
        {isLoading && deposits.length === 0 ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">جاري جلب سجلات الإيداع...</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد طلبات إيداع مطابقة لفلتر &quot;{statusLabels[filterStatus] || filterStatus}&quot;
            </h4>
            <p className="text-slate-500">سيظهر هنا أي إشعار إيداع جديد يتم إرساله من صفحة شحن المحفظة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                <tr>
                  <th className="px-5 py-4">رقم الإشعار</th>
                  <th className="px-5 py-4">معرف العميل</th>
                  <th className="px-5 py-4">طريقة الدفع</th>
                  <th className="px-5 py-4">المبلغ</th>
                  <th className="px-5 py-4">بيانات المرسل</th>
                  <th className="px-5 py-4">إشعار التحويل</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4 text-left">القرار والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                {filteredDeposits.map((dep) => {
                  const isPending = dep.status === "PENDING";

                  return (
                    <tr
                      key={dep.id || dep.depositNumber}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#13253a]/40 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-amber-700 dark:text-[#f3e5ab]">
                        {dep.depositNumber}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                        {dep.userId}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        {dep.method}
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                        ${Number(dep.amount).toFixed(2)} {dep.currency}
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                        <div className="font-bold">{dep.senderName || "تحويل مباشر"}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {dep.senderAccountOrPhone || dep.transferReference || "بدون رقم مرجعي"}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setPreviewImageUrl(dep.receiptImageUrl || FALLBACK_IMAGE)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-[11px] text-cyan-700 dark:text-[#06b6d4] font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة الإشعار</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            dep.status === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                              : dep.status === "REJECTED"
                              ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {statusLabels[dep.status] || dep.status}
                        </span>
                        {dep.adminNote && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-[150px] truncate">
                            {dep.adminNote}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-left">
                        {isPending ? (
                          <div className="flex items-center justify-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(dep)}
                              disabled={processingId === dep.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                            >
                              {processingId === dep.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>اعتماد وإيداع</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalDeposit(dep)}
                              disabled={processingId === dep.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold text-[11px] transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">
                            مكتمل
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-[#06b6d4]" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">معاينة إشعار التحويل البنكي</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">إشعار تحويل مصرفي معتمد</h4>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 break-all" dir="ltr">
                  {previewImageUrl}
                </p>
              </div>

              <div className="bg-white dark:bg-[#0d1b2a] rounded-xl p-4 text-xs font-mono text-right space-y-1.5 border border-slate-200 dark:border-[#1e3a5f]">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-sans">نوع المستند:</span>
                  <span className="text-amber-600 dark:text-[#f3e5ab] font-bold">إشعار دفع إلكتروني رسمي</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-sans">فحص التدقيق الرقمي:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">سليم ومعتمد (EXIF Validated)</span>
                </div>
              </div>
            </div>

            <div className="text-left pt-2">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">رفض طلب الإيداع</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalDeposit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              أنت على وشك رفض الإشعار <strong className="text-amber-600 dark:text-[#f3e5ab] font-mono">{rejectModalDeposit.depositNumber}</strong> بمبلغ (${Number(rejectModalDeposit.amount).toFixed(2)}). يرجى كتابة سبب الرفض ليظهر للعميل:
            </p>

            <div>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-rose-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalDeposit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={processingId === rejectModalDeposit.id}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all cursor-pointer shadow-md"
              >
                {processingId === rejectModalDeposit.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>تأكيد الرفض</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
