"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Power,
  Trash2,
  RefreshCw,
  Search,
  Smartphone,
  Building2,
  Coins,
  QrCode,
  Copy,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PaymentChannelItem } from "@/lib/dynamic-hub";

export default function PaymentChannelsPage() {
  const [channels, setChannels] = useState<PaymentChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState("SHAM_CASH");
  const [formTitle, setFormTitle] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formRecipientName, setFormRecipientName] = useState("");
  const [formQrCodeUrl, setFormQrCodeUrl] = useState("");
  const [formInstructions, setFormInstructions] = useState("");

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment-channels");
      const data = await res.json();
      if (data.success) {
        setChannels(data.channels);
      } else {
        toast.error("فشل جلب قنوات الدفع");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ الرقم بنجاح");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch("/api/admin/payment-channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setChannels((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: data.channel.isActive } : c))
        );
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل حالة القناة");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف قناة الدفع "${title}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/payment-channels?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setChannels((prev) => prev.filter((c) => c.id !== id));
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل حذف قناة الدفع");
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAccountNumber.trim()) {
      toast.error("يرجى ملء اسم القناة ورقم المحفظة/الحساب");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/payment-channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          title: formTitle.trim(),
          accountNumber: formAccountNumber.trim(),
          recipientName: formRecipientName.trim(),
          qrCodeUrl: formQrCodeUrl.trim(),
          instructions: formInstructions.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setChannels((prev) => [data.channel, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormAccountNumber("");
        setFormRecipientName("");
        setFormQrCodeUrl("");
        setFormInstructions("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل إضافة قناة الدفع");
    } finally {
      setSubmitting(false);
    }
  };

  const getChannelIcon = (type: string) => {
    if (type.includes("SHAM") || type.includes("SYRIATEL") || type.includes("MTN") || type.includes("PHONE")) return <Smartphone className="w-5 h-5 text-amber-400" />;
    if (type.includes("HARAM") || type.includes("LOCAL")) return <Building2 className="w-5 h-5 text-cyan-400" />;
    if (type.includes("USDT") || type.includes("CRYPTO")) return <Coins className="w-5 h-5 text-emerald-400" />;
    return <CreditCard className="w-5 h-5 text-[#d4af37]" />;
  };

  const filtered = channels.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.recipientName && c.recipientName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e3a5f]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة قنوات الدفع والمحافظ والكاش</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ديناميكي حي
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إضافة وتعديل أرقام محافظ شام كاش، بيانات مستلم حوالات الهرم، وعناوين USDT TRC20/BEP20.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchChannels}
            className="p-2.5 rounded-xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-300 hover:text-white transition-colors"
            title="تحديث القنوات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة قناة دفع / كاش جديدة</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالقناة أو رقم المحفظة أو المستلم..."
            className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#d4af37]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>إجمالي القنوات: <strong className="text-white">{channels.length}</strong></span>
          <span>•</span>
          <span>النشطة: <strong className="text-emerald-400">{channels.filter((c) => c.isActive).length}</strong></span>
        </div>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="text-xs text-slate-400">جاري تحميل قنوات الدفع...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي قنوات دفع مطابقة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ch) => (
            <div
              key={ch.id}
              className={`p-5 rounded-2xl border transition-all ${
                ch.isActive
                  ? "bg-[#0d1b2a] border-[#1e3a5f] shadow-lg hover:border-[#d4af37]/60"
                  : "bg-[#09111c] border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#13253a] border border-[#1e3a5f] flex items-center justify-center shrink-0">
                    {getChannelIcon(ch.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{ch.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-500/30">
                      {ch.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(ch.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      ch.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title={ch.isActive ? "تعطيل القناة فوراً" : "تفعيل القناة"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(ch.id, ch.title)}
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="حذف القناة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Account / Address Box */}
              <div className="p-3 rounded-xl bg-[#070e17] border border-[#1e3a5f] flex items-center justify-between gap-2 mb-3">
                <div className="overflow-hidden">
                  <span className="text-[9px] text-slate-500 font-mono block">رقم المحفظة / العنوان:</span>
                  <span className="text-xs font-mono font-bold text-[#f3e5ab] tracking-wider truncate block" dir="ltr">
                    {ch.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(ch.accountNumber, ch.id)}
                  className="p-2 rounded-lg bg-[#13253a] hover:bg-[#1e3a5f] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="نسخ الرقم"
                >
                  {copiedId === ch.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {ch.recipientName && (
                <div className="text-xs mb-2">
                  <span className="text-slate-400 text-[10px]">المستلم المعتمد: </span>
                  <span className="font-bold text-slate-200">{ch.recipientName}</span>
                </div>
              )}

              {ch.instructions && (
                <div className="text-[11px] text-slate-400 bg-[#13253a]/60 p-2.5 rounded-xl leading-relaxed mt-2">
                  <span className="font-bold text-amber-400">التعليمات: </span>
                  {ch.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d1b2a] border border-[#d4af37]/40 rounded-3xl p-6 shadow-2xl relative text-right text-white animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-[#13253a] text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">إضافة قناة دفع أو محفظة كاش جديدة</h3>
                <p className="text-xs text-slate-400">تظهر في خيارات شحن الرصيد المتاحة للزبائن</p>
              </div>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع القناة / التصنيف</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="SHAM_CASH">شام كاش (Sham Cash) - الخيار الأول (#1)</option>
                  <option value="AL_HARAM">شركة الهرم للحوالات (Al-Haram)</option>
                  <option value="USDT_TRC20">تيذر USDT (شبكة TRC20)</option>
                  <option value="USDT_BEP20">تيذر USDT (شبكة BEP20)</option>
                  <option value="LOCAL_DELIVERY">تسليم كاش باليد / مراكز ومكاتب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم القناة المعروض للعميل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شام كاش - المحفظة المالية المعتمدة"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم المحفظة / عنوان العملة المشفرة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 0987654321 أو TXyZ... (عنوان الـ TRC20)"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#f3e5ab] outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستلم (لحوالات الهرم أو الكاش)</label>
                <input
                  type="text"
                  placeholder="مثال: أحمد المحمد - فرع الميدان"
                  value={formRecipientName}
                  onChange={(e) => setFormRecipientName(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تعليمات التحويل (كود الاتصال أو التوضيح)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: اطلب الكود *3040# للتحويل السريع إلى الرقم الموضح، وأرفق إشعار العملية."
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ القناة وتفعيلها للعملاء</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 rounded-xl bg-[#13253a] text-slate-300 text-xs font-bold hover:bg-[#1e3a5f] transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
