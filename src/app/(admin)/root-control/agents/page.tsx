"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Power,
  Trash2,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Check,
  Copy,
  Percent,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AgentItem } from "@/lib/dynamic-hub";

export default function AgentsManagementPage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCountry, setFormCountry] = useState("سوريا 🇸🇾");
  const [formCity, setFormCity] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formTelegram, setFormTelegram] = useState("");
  const [formDiscountRate, setFormDiscountRate] = useState("2.5");

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
      } else {
        toast.error("فشل جلب قائمة الوكلاء");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: data.agent.isActive } : a))
        );
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل حالة الوكيل");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الوكيل "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/admin/agents?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAgents((prev) => prev.filter((a) => a.id !== id));
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل حذف الوكيل");
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim() || !formPhone.trim() || !formCity.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة للوكيل");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          agentCode: formCode.trim().toUpperCase(),
          country: formCountry,
          city: formCity.trim(),
          address: formAddress.trim(),
          phone: formPhone.trim(),
          whatsapp: formWhatsapp.trim() || formPhone.trim().replace(/[^0-9]/g, ""),
          telegram: formTelegram.trim(),
          discountRate: Number(formDiscountRate) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAgents((prev) => [data.agent, ...prev]);
        setIsModalOpen(false);
        // Reset form
        setFormName("");
        setFormCode("");
        setFormCity("");
        setFormAddress("");
        setFormPhone("");
        setFormWhatsapp("");
        setFormTelegram("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل إضافة الوكيل");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.agentCode || "").toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e3a5f]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة الوكلاء والمكاتب المعتمدة</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              شبكة الموزعين
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            إدارة نقاط البيع والمكاتب المعتمدة بالمحافظات والدول، وتنعكس مباشرة في دليل الوكلاء العام (/agents).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAgents}
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
            <span>إضافة وكيل / مكتب جديد</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم الوكيل أو الكود أو المدينة..."
            className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#d4af37]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>إجمالي الوكلاء: <strong className="text-white">{agents.length}</strong></span>
          <span>•</span>
          <span>النشطون: <strong className="text-emerald-400">{agents.filter((a) => a.isActive).length}</strong></span>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="text-xs text-slate-400">جاري تحميل الوكلاء...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي وكلاء مطابقين</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className={`p-5 rounded-2xl border transition-all ${
                agent.isActive
                  ? "bg-[#0d1b2a] border-[#1e3a5f] shadow-lg hover:border-[#d4af37]/60"
                  : "bg-[#09111c] border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#06b6d4] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{agent.name}</h3>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#070e17] text-[#d4af37] border border-[#d4af37]/30">
                      {agent.agentCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(agent.id)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      agent.isActive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title={agent.isActive ? "تعطيل ظهور الوكيل" : "تفعيل ظهور الوكيل"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(agent.id, agent.name)}
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="حذف الوكيل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Location & Contact Info */}
              <div className="space-y-1.5 text-xs text-slate-300 mb-3 pt-2 border-t border-[#1e3a5f]/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{agent.country} - {agent.city}</span>
                </div>

                {agent.address && (
                  <p className="text-[11px] text-slate-400 pl-5 pr-5 leading-tight">
                    {agent.address}
                  </p>
                )}

                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span dir="ltr">{agent.phone}</span>
                </div>

                {agent.telegram && (
                  <div className="flex items-center gap-2 font-mono text-cyan-400">
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span>{agent.telegram}</span>
                  </div>
                )}
              </div>

              {/* Bottom Details */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#1e3a5f]/60 text-slate-400">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  نسبة الخصم: <strong className="text-white">{agent.discountRate}%</strong>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  agent.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {agent.isActive ? "ظاهر بالدليل" : "مخفي"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Agent Modal */}
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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">إضافة وكيل أو مركز معتمد جديد</h3>
                <p className="text-xs text-slate-400">ينعكس فوراً في صفحة دليل الوكلاء العامة للمستخدمين</p>
              </div>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الوكيل / المكتب</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مكتب الفاتح الرقمي"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كود الوكالة الفريد</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: AGENT-IST-05"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#f3e5ab] outline-none focus:border-[#d4af37] uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الدولة</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                  >
                    <option value="سوريا 🇸🇾">سوريا 🇸🇾</option>
                    <option value="تركيا 🇹🇷">تركيا 🇹🇷</option>
                    <option value="العراق 🇮🇶">العراق 🇮🇶</option>
                    <option value="لبنان 🇱🇧">لبنان 🇱🇧</option>
                    <option value="الإمارات 🇦🇪">الإمارات 🇦🇪</option>
                    <option value="ألمانيا 🇩🇪">ألمانيا 🇩🇪</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: إسطنبول - الفاتح أو دمشق"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان التفصيلي (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: شارع الرئيسي بجانب البنك المركزي، عمارة الأمل"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (مع الكود الدولي)</label>
                  <input
                    type="text"
                    required
                    placeholder="+963911223344"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">معرف تيليجرام (اختياري)</label>
                  <input
                    type="text"
                    placeholder="@agent_tsunami"
                    value={formTelegram}
                    onChange={(e) => setFormTelegram(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs font-mono text-cyan-400 outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    placeholder="963911223344"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نسبة الخصم الممنوحة للوكيل (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={formDiscountRate}
                    onChange={(e) => setFormDiscountRate(e.target.value)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#d4af37]"
                  />
                </div>
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
                    <span>إدراج الوكيل وتفعيله بالمتجر</span>
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
