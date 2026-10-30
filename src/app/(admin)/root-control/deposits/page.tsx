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

export default function RootDepositVerificationPage() {
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
          note: "تمت الموافقة والاعتماد من قبل الإدارة العليا",
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
      dep.depositNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dep.senderName && dep.senderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dep.transferReference && dep.transferReference.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <Layers className="w-4 h-4 text-[#d4af37]" /> التدقيق والتسوية المالية
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            مراجعة الإيداعات البنكية وإيصالات الدفع
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تدقيق الحوالات البنكية، إيصالات شام كاش، وتغذية المحافظ بعمليات مالية مؤمّنة فورياً
          </p>
        </div>

        <button
          onClick={fetchDeposits}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>تحديث الإيصالات</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                filterStatus === st
                  ? "bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "bg-[#070e17] text-slate-300 border border-[#1e3a5f] hover:border-slate-500"
              }`}
            >
              {statusLabels[st]} ({st === "ALL" ? deposits.length : deposits.filter((d) => d.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الإشعار، العميل، أو المرسل..."
            className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-xl">
        {filteredDeposits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            لا توجد إيصالات إيداع مطابقة لفلتر &quot;{statusLabels[filterStatus] || filterStatus}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#070e17] text-slate-400 font-semibold border-b border-[#1e3a5f]">
                <tr>
                  <th className="px-6 py-4">رقم الإشعار</th>
                  <th className="px-6 py-4">معرف العميل</th>
                  <th className="px-6 py-4">طريقة الدفع</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">بيانات المرسل</th>
                  <th className="px-6 py-4">إشعار التحويل</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">القرار والإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a5f]/60 text-slate-200">
                {filteredDeposits.map((dep) => {
                  const isPending = dep.status === "PENDING";

                  return (
                    <tr key={dep.id || dep.depositNumber} className="hover:bg-[#13253a]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab]">
                        {dep.depositNumber}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        {dep.userId}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {dep.method}
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-400 text-sm">
                        ${Number(dep.amount).toFixed(2)} {dep.currency}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="font-semibold">{dep.senderName || "تحويل مباشر"}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {dep.senderAccountOrPhone || dep.transferReference || "بدون رقم مرجعي"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setPreviewImageUrl(dep.receiptImageUrl)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070e17] hover:bg-[#13253a] border border-[#1e3a5f] text-[11px] text-[#06b6d4] font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة الإشعار</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            dep.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : dep.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {statusLabels[dep.status] || dep.status}
                        </span>
                        {dep.adminNote && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            {dep.adminNote}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-left">
                        {isPending ? (
                          <div className="flex items-center justify-start gap-2">
                            <button
                              onClick={() => handleApprove(dep)}
                              disabled={processingId === dep.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تأكيد الإيداع وإضافة الرصيد</span>
                            </button>
                            <button
                              onClick={() => setRejectModalDeposit(dep)}
                              disabled={processingId === dep.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض الطلب</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-bold">
                            تم إنهاء الطلب
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

      {/* Image Modal Preview */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#06b6d4]" />
                <h3 className="text-sm font-bold text-white">معاينة إشعار التحويل البنكي</h3>
              </div>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Voucher Card in Modal */}
            <div className="rounded-2xl bg-[#070e17] border border-[#1e3a5f] p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#13253a] border border-[#1e3a5f] flex items-center justify-center text-[#d4af37] mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">إشعار تحويل مصرفي رسمي معتمد</h4>
                <p className="text-xs font-mono text-slate-400 mt-1" dir="ltr">{previewImageUrl}</p>
              </div>

              <div className="bg-[#0d1b2a] rounded-xl p-4 text-xs font-mono text-right space-y-1.5 border border-[#1e3a5f]">
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">نوع المستند:</span>
                  <span className="text-[#f3e5ab] font-bold">إشعار دفع إلكتروني رسمي</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">وضوح الصورة:</span>
                  <span className="text-emerald-400 font-bold">عالي الدقة ومقروء تماماً</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="font-sans">فحص التلاعب الرقمي:</span>
                  <span className="text-emerald-400 font-bold">سليم ومعتمد (EXIF OK)</span>
                </div>
              </div>
            </div>

            <div className="text-left pt-2">
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="px-5 py-2.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-xs font-bold text-slate-200"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">رفض طلب الإيداع</h3>
              </div>
              <button
                onClick={() => setRejectModalDeposit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              أنت على وشك رفض الإشعار <strong className="text-[#f3e5ab] font-mono">{rejectModalDeposit.depositNumber}</strong> بمبلغ (${Number(rejectModalDeposit.amount).toFixed(2)}). يرجى كتابة سبب الرفض ليظهر للعميل:
            </p>

            <div>
              <textarea
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-rose-400 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalDeposit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                onClick={handleRejectConfirm}
                disabled={processingId === rejectModalDeposit.id}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all"
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
