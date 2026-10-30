"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  RefreshCw,
  Save,
  DollarSign,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformRateItem } from "@/lib/dynamic-hub";

export default function PlatformRatesPage() {
  const [rates, setRates] = useState<PlatformRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<{ [key: string]: boolean }>({});
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/rates");
      const data = await res.json();
      if (data.success) {
        setRates(data.rates);
        const map: { [key: string]: string } = {};
        data.rates.forEach((r: PlatformRateItem) => {
          map[r.key] = String(r.rate);
        });
        setEditableValues(map);
      } else {
        toast.error("فشل جلب أسعار الصرف");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSaveRate = async (key: string) => {
    const newVal = parseFloat(editableValues[key]);
    if (isNaN(newVal) || newVal <= 0) {
      toast.error("يرجى إدخال قيمة رقمية صحيحة أكبر من الصفر");
      return;
    }

    try {
      setSavingKeys((prev) => ({ ...prev, [key]: true }));
      const res = await fetch("/api/admin/rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, rate: newVal }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setRates((prev) =>
          prev.map((r) => (r.key === key ? { ...r, rate: newVal, updatedAt: data.rate.updatedAt } : r))
        );
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل تحديث السعر");
    } finally {
      setSavingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const currencyRates = rates.filter((r) => r.category === "CURRENCY");
  const appRates = rates.filter((r) => r.category === "APP_RATE");

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e3a5f]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">أسعار العملات وتطبيقات الدردشة</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-[#d4af37] border border-[#d4af37]/30">
              تسعير لحظي
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تحديث أسعار صرف الدولار الأمريكي وسعر وحدات الكوينز لتطبيقي سول ستار وسول شيل لجميع العملاء والموزعين.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRates}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          <span>إعادة تحميل الأسعار</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="text-xs text-slate-400">جاري تحميل لوحة الأسعار الحية...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Currency Exchange Rates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>أسعار صرف العملات الدولية والمحلية</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currencyRates.map((r) => {
                const isSaving = savingKeys[r.key] || false;
                return (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-[#0d1b2a] border border-[#1e3a5f] shadow-lg hover:border-[#d4af37]/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-100">{r.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13253a] text-cyan-400 border border-cyan-500/30">
                          {r.key}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        سعر التحويل المعتمد تلقائياً في فواتير الإيداع وحاسبات الشحن.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="any"
                          value={editableValues[r.key] || ""}
                          onChange={(e) =>
                            setEditableValues({ ...editableValues, [r.key]: e.target.value })
                          }
                          className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-[#f3e5ab] outline-none focus:border-[#d4af37]"
                          dir="ltr"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveRate(r.key)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Coins & Chat Apps Rates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Coins className="w-4 h-4 text-[#d4af37]" />
              <span>تسعير كوينز وماسات تطبيقات الدردشة (SoulStar & SoulChill)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appRates.map((r) => {
                const isSaving = savingKeys[r.key] || false;
                const isAgent = r.key.includes("AGENT");
                return (
                  <div
                    key={r.id}
                    className={`p-5 rounded-2xl border shadow-lg transition-all flex flex-col justify-between ${
                      isAgent
                        ? "bg-[#0d1b2a] border-cyan-500/40 hover:border-cyan-400"
                        : "bg-[#0d1b2a] border-[#1e3a5f] hover:border-amber-500/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{r.name}</h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isAgent
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {isAgent ? "سعر الموزع / الوكيل" : "سعر العميل العادي"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        الكمية المستلمة لكل $1.00 USD مدفوع.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="1"
                          value={editableValues[r.key] || ""}
                          onChange={(e) =>
                            setEditableValues({ ...editableValues, [r.key]: e.target.value })
                          }
                          className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-sm font-mono font-black text-[#f3e5ab] outline-none focus:border-[#d4af37]"
                          dir="ltr"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveRate(r.key)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>حفظ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
