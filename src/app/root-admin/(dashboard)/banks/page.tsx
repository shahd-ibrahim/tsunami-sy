"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Building2,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  Loader2,
  Smartphone,
  Coins,
  ShieldCheck,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { UniversalActionToolbar } from "@/components/admin/UniversalActionToolbar";

interface PaymentChannel {
  id: string;
  type: string;
  title: string;
  accountNumber: string;
  recipientName?: string | null;
  qrCodeUrl?: string | null;
  instructions?: string | null;
  isActive: boolean;
  updatedAt: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  currency: string;
  minDeposit: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function RootAdminBanksPage() {
  const [activeTab, setActiveTab] = useState<"banks" | "channels">("banks");
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  // Modal state
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<PaymentChannel | null>(null);
  const [channelForm, setChannelForm] = useState({
    type: "SHAM_CASH",
    title: "",
    accountNumber: "",
    recipientName: "",
    qrCodeUrl: "",
    instructions: "",
  });

  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountHolder: "",
    iban: "",
    currency: "TRY",
    minDeposit: 50,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [chRes, bankRes] = await Promise.all([
        fetch("/api/admin/payment-channels"),
        fetch("/api/admin/banks"),
      ]);

      const chData = chRes.ok ? await chRes.json() : {};
      const bankData = bankRes.ok ? await bankRes.json() : {};

      if (chData.success && chData.channels) setChannels(chData.channels);
      if (bankData.success && bankData.banks) setBanks(bankData.banks);
    } catch {
      toast.error("فشل تحميل بيانات بوابات وطرق الدفع");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    toast.success("تم نسخ رقم الآيبان الحساب");
    setTimeout(() => setCopiedIban(null), 2000);
  };

  // Channel Actions
  const handleToggleChannel = async (channel: PaymentChannel) => {
    const nextStatus = !channel.isActive;
    try {
      const res = await fetch("/api/admin/payment-channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: channel.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, isActive: nextStatus } : c))
      );
      toast.success(
        nextStatus
          ? `تم تفعيل "${channel.title}" في صفحة الإيداع`
          : `تم تعطيل "${channel.title}" وإخفاؤها من صفحة الإيداع`
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير حالة القناة");
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/payment-channels?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setChannels((prev) => prev.filter((c) => c.id !== id));
      toast.success("تم حذف قناة الدفع بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل حذف القناة");
    }
  };

  const openCreateChannel = () => {
    setEditingChannel(null);
    setChannelForm({
      type: "SHAM_CASH",
      title: "",
      accountNumber: "",
      recipientName: "",
      qrCodeUrl: "",
      instructions: "",
    });
    setShowChannelModal(true);
  };

  const openEditChannel = (ch: PaymentChannel) => {
    setEditingChannel(ch);
    setChannelForm({
      type: ch.type,
      title: ch.title,
      accountNumber: ch.accountNumber,
      recipientName: ch.recipientName || "",
      qrCodeUrl: ch.qrCodeUrl || "",
      instructions: ch.instructions || "",
    });
    setShowChannelModal(true);
  };

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingChannel) {
        const res = await fetch("/api/admin/payment-channels", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingChannel.id, ...channelForm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("تم تحديث بيانات القناة بنجاح");
      } else {
        const res = await fetch("/api/admin/payment-channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(channelForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("تمت إضافة قناة الدفع بنجاح");
      }
      setShowChannelModal(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ القناة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bank Actions
  const handleToggleBank = async (bank: BankAccount) => {
    const nextStatus = !bank.isActive;
    try {
      const res = await fetch("/api/admin/banks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bank.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBanks((prev) =>
        prev.map((b) => (b.id === bank.id ? { ...b, isActive: nextStatus } : b))
      );
      toast.success(
        nextStatus
          ? `تم تفعيل حساب "${bank.bankName}" في بوابة الإيداع`
          : `تم تعطيل حساب "${bank.bankName}" وإخفاؤه من بوابة الإيداع`
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير حالة الحساب البنكي");
    }
  };

  const handleDeleteBank = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banks?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setBanks((prev) => prev.filter((b) => b.id !== id));
      toast.success("تم حذف الحساب البنكي بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل حذف الحساب");
    }
  };

  const openCreateBank = () => {
    setEditingBank(null);
    setBankForm({
      bankName: "",
      accountHolder: "",
      iban: "",
      currency: "TRY",
      minDeposit: 50,
      notes: "",
    });
    setShowBankModal(true);
  };

  const openEditBank = (bank: BankAccount) => {
    setEditingBank(bank);
    setBankForm({
      bankName: bank.bankName,
      accountHolder: bank.accountHolder,
      iban: bank.iban,
      currency: bank.currency,
      minDeposit: bank.minDeposit,
      notes: bank.notes || "",
    });
    setShowBankModal(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBank) {
        const res = await fetch("/api/admin/banks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingBank.id, ...bankForm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("تم تحديث الحساب البنكي بنجاح");
      } else {
        const res = await fetch("/api/admin/banks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bankForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success("تمت إضافة الحساب البنكي بنجاح");
      }
      setShowBankModal(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ الحساب البنكي");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPER-ADMIN BANKING & PAYMENT ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              البنوك وطرق الدفع (كاش وبنوك)
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              إدارة الحسابات البنكية المعتمدة، قنوات شام كاش، سيريتل كاش، USDT، وأرقام التحويل والباركودات المباشرة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>تحديث</span>
            </button>

            {activeTab === "banks" ? (
              <button
                type="button"
                onClick={openCreateBank}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حساب بنكي</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateChannel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قناة دفع إلكتروني</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("banks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "banks"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>الحسابات البنكية المعتمدة ({banks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("channels")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "channels"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>بوابات الكاش والدفع السريع ({channels.length})</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-mono">جاري تحميل البنوك وقنوات الدفع...</p>
        </div>
      ) : activeTab === "banks" ? (
        /* Banks Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>الحسابات البنكية المتاحة للمستخدمين في صفحة الإيداع</span>
            <span>{banks.length} حساب مسجل</span>
          </div>

          {banks.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] p-8">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد حسابات بنكية مضافة بعد</h3>
              <p className="text-xs text-slate-500 mt-1">أضف حساباً بنكياً أولياً لتمكين الإيداع المصرفي للمستخدمين.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                    bank.isActive
                      ? "border-slate-200 dark:border-[#1e3a5f] hover:border-amber-400 dark:hover:border-[#d4af37]/50"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070e17]/80 opacity-75"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{bank.bankName}</span>
                            {!bank.isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                معطل
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {bank.accountHolder}
                          </span>
                        </div>
                      </div>

                      <UniversalActionToolbar
                        isActive={bank.isActive}
                        onToggleActive={() => handleToggleBank(bank)}
                        onEdit={() => openEditBank(bank)}
                        onDelete={() => handleDeleteBank(bank.id)}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[11px] text-slate-400 font-sans">رقم الآيبان (IBAN):</span>
                        <button
                          type="button"
                          onClick={() => handleCopyIban(bank.iban)}
                          className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-[#f3e5ab] hover:underline"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedIban === bank.iban ? "تم النسخ!" : "نسخ"}</span>
                        </button>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all dir-ltr text-left">
                        {bank.iban}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">الحد الأدنى للإيداع:</span>
                      <span className="font-black text-slate-900 dark:text-white font-mono">
                        {bank.minDeposit} {bank.currency}
                      </span>
                    </div>

                    {bank.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {bank.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Channels Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>قنوات الكاش والدفع السريع (شام كاش، سيريتل كاش، USDT)</span>
            <span>{channels.length} قناة مفعلة</span>
          </div>

          {channels.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] p-8">
              <Smartphone className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد قنوات دفع مضافة بعد</h3>
              <p className="text-xs text-slate-500 mt-1">أضف قناة شام كاش أو سيريتل كاش لتمكين الدفع السريع الفوري.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((ch) => (
                <div
                  key={ch.id}
                  className={`p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                    ch.isActive
                      ? "border-slate-200 dark:border-[#1e3a5f] hover:border-amber-400 dark:hover:border-[#d4af37]/50"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070e17]/80 opacity-75"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                          {ch.type === "CRYPTO" ? <Coins className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{ch.title}</span>
                            {!ch.isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                                معطل
                              </span>
                            )}
                          </h3>
                          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                            {ch.type}
                          </span>
                        </div>
                      </div>

                      <UniversalActionToolbar
                        isActive={ch.isActive}
                        onToggleActive={() => handleToggleChannel(ch)}
                        onEdit={() => openEditChannel(ch)}
                        onDelete={() => handleDeleteChannel(ch.id)}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
                      <div className="text-[11px] text-slate-400 font-sans">رقم الحساب / المحفظة:</div>
                      <div className="text-xs font-mono font-bold text-slate-900 dark:text-white break-all dir-ltr text-left">
                        {ch.accountNumber}
                      </div>
                      {ch.recipientName && (
                        <div className="text-[11px] text-slate-500">
                          اسم المستلم: <strong className="text-slate-700 dark:text-slate-300">{ch.recipientName}</strong>
                        </div>
                      )}
                    </div>

                    {ch.instructions && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {ch.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Channel Create / Edit Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingChannel ? "تعديل قناة دفع" : "إضافة قناة دفع إلكتروني جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setShowChannelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نوع القناة</label>
                  <select
                    value={channelForm.type}
                    onChange={(e) => setChannelForm({ ...channelForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-bold outline-none"
                  >
                    <option value="SHAM_CASH">شام كاش (Sham Cash)</option>
                    <option value="SYRIATEL_CASH">سيريتل كاش (Syriatel Cash)</option>
                    <option value="MTN_CASH">كاش إم تي إن (MTN Cash)</option>
                    <option value="CRYPTO">عملات رقمية (USDT TRC20)</option>
                    <option value="AL_HARAM">شركة الهرم للحوالات</option>
                    <option value="AL_FOUAD">شركة الفؤاد للحوالات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">عنوان القناة الظاهر</label>
                  <input
                    type="text"
                    required
                    value={channelForm.title}
                    onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })}
                    placeholder="مثال: شام كاش - الحساب الرسمي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">رقم الحساب / المحفظة</label>
                  <input
                    type="text"
                    required
                    value={channelForm.accountNumber}
                    onChange={(e) => setChannelForm({ ...channelForm, accountNumber: e.target.value })}
                    placeholder="مثال: 0912345678 أو عنوان المحفظة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اسم صاحب الحساب / المستلم</label>
                  <input
                    type="text"
                    value={channelForm.recipientName}
                    onChange={(e) => setChannelForm({ ...channelForm, recipientName: e.target.value })}
                    placeholder="مثال: متجر تسونامي الرسمي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رابط صورة الباركود (QR Code URL)</label>
                <input
                  type="text"
                  value={channelForm.qrCodeUrl}
                  onChange={(e) => setChannelForm({ ...channelForm, qrCodeUrl: e.target.value })}
                  placeholder="رابط صورة الباركود إن وجد"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">تعليمات الإيداع للمستخدمين</label>
                <textarea
                  rows={3}
                  value={channelForm.instructions}
                  onChange={(e) => setChannelForm({ ...channelForm, instructions: e.target.value })}
                  placeholder="يرجى كتابة رقم العملية وإرفاق لقطة شاشة للإشعار بعد التحويل..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1e3a5f]/60">
                <button
                  type="button"
                  onClick={() => setShowChannelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingChannel ? "حفظ التعديلات" : "إضافة القناة"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Create / Edit Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingBank ? "تعديل حساب بنكي" : "إضافة حساب بنكي جديد"}
              </h3>
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اسم المصرف / البنك</label>
                  <input
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="مثال: بنك بيمو السعودي الفرنسي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">اسم صاحب الحساب</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                    placeholder="مثال: شركة تسونامي للتجارة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رقم الحساب / الآيبان (IBAN)</label>
                <input
                  type="text"
                  required
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                  placeholder="مثال: SY00 0000 0000 0000 0000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">العملة</label>
                  <select
                    value={bankForm.currency}
                    onChange={(e) => setBankForm({ ...bankForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-bold outline-none"
                  >
                    <option value="SYP">ليرة سورية (SYP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="TRY">ليرة تركية (TRY)</option>
                    <option value="EUR">يورو (EUR)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الحد الأدنى للإيداع</label>
                  <input
                    type="number"
                    min="1"
                    value={bankForm.minDeposit}
                    onChange={(e) => setBankForm({ ...bankForm, minDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ملاحظات وتعليمات التحويل</label>
                <textarea
                  rows={2}
                  value={bankForm.notes}
                  onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                  placeholder="ملاحظات توضيحية تظهر للمستخدم..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1e3a5f]/60">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingBank ? "حفظ التعديلات" : "إضافة الحساب"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
