"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { BankAccountItem } from "@/lib/dynamic-hub";

export default function BanksManagementPage() {
  const [banks, setBanks] = useState<BankAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formBankName, setFormBankName] = useState("");
  const [formAccountHolder, setFormAccountHolder] = useState("");
  const [formIban, setFormIban] = useState("");
  const [formCurrency, setFormCurrency] = useState("TRY");
  const [formMinDeposit, setFormMinDeposit] = useState("10");
  const [formNotes, setFormNotes] = useState("");

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banks");
      const data = await res.json();
      if (data.success) {
        setBanks(data.banks);
      } else {
        toast.error("فشل جلب الحسابات البنكية");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleCopyIban = (iban: string, id: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedId(id);
    toast.success("تم نسخ رقم الآيبان (IBAN)");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch("/api/admin/banks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) =>
          prev.map((b) => (b.id === id ? { ...b, isActive: data.bank.isActive } : b))
        );
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل حالة الحساب");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الحساب البنكي "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/banks?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBanks((prev) => prev.filter((b) => b.id !== id));
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل حذف الحساب البنكي");
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankName.trim() || !formAccountHolder.trim() || !formIban.trim()) {
      toast.error("يرجى ملء جميع الحقول الإلزامية");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: formBankName.trim(),
          accountHolder: formAccountHolder.trim(),
          iban: formIban.trim(),
          currency: formCurrency,
          minDeposit: Number(formMinDeposit) || 10,
          notes: formNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setBanks((prev) => [data.bank, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setFormBankName("");
        setFormAccountHolder("");
        setFormIban("");
        setFormNotes("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل إضافة الحساب البنكي");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = banks.filter(
    (b) =>
      b.bankName.toLowerCase().includes(search.toLowerCase()) ||
      b.accountHolder.toLowerCase().includes(search.toLowerCase()) ||
      b.iban.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e3a5f]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الحسابات البنكية والآيبانات</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-[#d4af37] border border-[#d4af37]/30">
              ديناميكي
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة أرقام الآيبان وحسابات البنوك التركية والسورية، وتنعكس مباشرة لدى العملاء في صفحة الإيداع.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBanks}
            className="p-2.5 rounded-xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-300 hover:text-white transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة حساب بنكي / IBAN جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم البنك أو الآيبان أو المستفيد..."
            className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#d4af37]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>إجمالي الحسابات: <strong className="text-white">{banks.length}</strong></span>
          <span>•</span>
          <span>النشطة: <strong className="text-emerald-400">{banks.filter((b) => b.isActive).length}</strong></span>
        </div>
      </div>

      {/* Accounts Grid / Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="text-xs text-slate-400">جاري تحميل الحسابات البنكية...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي حسابات بنكية</p>
          <p className="text-xs mt-1">اضغط على زر "إضافة حساب بنكي جديد" لإدراج أول آيبان معتمد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bank) => (
            <div
              key={bank.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                bank.isActive
                  ? "bg-[#0d1b2a] border-[#1e3a5f] shadow-lg hover:border-[#d4af37]/60"
                  : "bg-[#09111c] border-slate-800 opacity-60"
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{bank.bankName}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#13253a] text-cyan-400 border border-cyan-500/30">
                      {bank.currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(bank.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      bank.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title={bank.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(bank.id, bank.bankName)}
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="حذف الحساب"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Account Holder */}
              <div className="text-xs mb-2">
                <span className="text-slate-400 text-[10px] block">اسم صاحب الحساب:</span>
                <span className="font-bold text-slate-200">{bank.accountHolder}</span>
              </div>

              {/* IBAN Box with Copy Button */}
              <div className="p-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] flex items-center justify-between gap-2 mb-3">
                <div className="overflow-hidden">
                  <span className="text-[9px] text-slate-500 font-mono block">IBAN:</span>
                  <span className="text-xs font-mono font-black text-[#f3e5ab] tracking-wider truncate block" dir="ltr">
                    {bank.iban}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyIban(bank.iban, bank.id)}
                  className="p-1.5 rounded-lg bg-[#13253a] hover:bg-[#1e3a5f] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="نسخ الآيبان"
                >
                  {copiedId === bank.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Notes & Min Deposit */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1e3a5f]/60 font-mono">
                <span>الحد الأدنى: <strong className="text-white">{bank.minDeposit} {bank.currency}</strong></span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  bank.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {bank.isActive ? "متاح بالمتجر" : "معطل"}
                </span>
              </div>

              {bank.notes && (
                <p className="text-[10px] text-slate-400 mt-2 bg-[#13253a]/50 p-2 rounded-lg leading-relaxed">
                  {bank.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Bank Modal */}
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
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">إضافة حساب بنكي / IBAN جديد</h3>
                <p className="text-xs text-slate-400">ستظهر هذه البيانات مباشرة للعملاء عند شحن المحفظة</p>
              </div>
            </div>

            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم البنك</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Ziraat Bankası أو بنك البركة"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستفيد / صاحب الحساب</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: TSUNAMI DIJITAL HIZMETLERI"
                  value={formAccountHolder}
                  onChange={(e) => setFormAccountHolder(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الآيبان (IBAN)</label>
                <input
                  type="text"
                  required
                  placeholder="TRXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={formIban}
                  onChange={(e) => setFormIban(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#f3e5ab] outline-none focus:border-[#d4af37] uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العملة</label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                  >
                    <option value="TRY">TRY - ليرة تركية</option>
                    <option value="USD">USD - دولار أمريكي</option>
                    <option value="SYP">SYP - ليرة سورية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأدنى للإيداع</label>
                  <input
                    type="number"
                    min="1"
                    value={formMinDeposit}
                    onChange={(e) => setFormMinDeposit(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تعليمات الإيداع للعميل (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: يرجى كتابة رقم الهاتف في خانة الوصف لسرعة التأكيد"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                    <span>حفظ الحساب وتفعيله فوراً</span>
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
