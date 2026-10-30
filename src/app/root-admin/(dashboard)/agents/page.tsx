"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  Check,
  X,
  Loader2,
  Building,
  MessageCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Power,
  AlertTriangle,
  LayoutGrid,
  List,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

export interface AgentRecord {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  phone: string;
  whatsappUrl?: string | null;
  image?: string | null;
  isActive: boolean;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

const COMMON_CITIES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "اللاذقية",
  "طرطوس",
  "حماة",
  "درعا",
  "السويداء",
  "دير الزور",
  "الحسكة",
  "الرقة",
  "إدلب",
  "إسطنبول (تركيا)",
  "بيروت (لبنان)",
  "بغداد (العراق)",
];

export default function RootAdminAgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deletingAgent, setDeletingAgent] = useState<AgentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    city: "دمشق",
    address: "",
    phone: "+9639",
    whatsappUrl: "",
    image: "/images/logo.png",
    isActive: true,
    orderIndex: 0,
  });

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgents(data.agents);
      } else {
        toast.error(data.error || "فشل جلب قائمة الوكلاء");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم لجلب قائمة الوكلاء");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // WhatsApp Link Helper
  const getWhatsAppLink = (agent: { phone: string; whatsappUrl?: string | null }) => {
    if (agent.whatsappUrl && agent.whatsappUrl.trim().startsWith("http")) {
      return agent.whatsappUrl.trim();
    }
    const cleanNumber = agent.phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  // Status Toggle (Active / Inactive)
  const handleToggleActive = async (agent: AgentRecord) => {
    const nextStatus = !agent.isActive;
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agent.id, isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "فشل تغيير الحالة");

      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, isActive: nextStatus } : a))
      );

      toast.success(
        nextStatus
          ? `تم تفعيل الوكيل "${agent.name}" (يظهر الآن في دليل المتجر العام)`
          : `تم تعطيل الوكيل "${agent.name}" (أصبح مخفياً من دليل المتجر)`
      );
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تعديل حالة الوكيل");
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingAgent(null);
    setFormData({
      name: "",
      city: "دمشق",
      address: "",
      phone: "+9639",
      whatsappUrl: "",
      image: "/images/logo.png",
      isActive: true,
      orderIndex: agents.length,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (ag: AgentRecord) => {
    setEditingAgent(ag);
    setFormData({
      name: ag.name,
      city: ag.city,
      address: ag.address || "",
      phone: ag.phone,
      whatsappUrl: ag.whatsappUrl || "",
      image: ag.image || "/images/logo.png",
      isActive: ag.isActive,
      orderIndex: ag.orderIndex ?? 0,
    });
    setShowModal(true);
  };

  // Save Form (Create or Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.phone.trim()) {
      toast.error("يرجى ملء كافة الحقول الأساسية (الاسم، المدينة، الهاتف)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAgent) {
        // Update existing agent
        const res = await fetch("/api/admin/agents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAgent.id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "فشل تحديث بيانات الوكيل");

        toast.success(data.message || "تم حفظ تعديلات الوكيل بنجاح");
      } else {
        // Create new agent
        const res = await fetch("/api/admin/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "فشل إنشاء الوكيل");

        toast.success(data.message || "تمت إضافة الوكيل الجديد بنجاح");
      }

      setShowModal(false);
      await fetchAgents();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء حفظ بيانات الوكيل");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingAgent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/agents?id=${deletingAgent.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "فشل حذف الوكيل");

      setAgents((prev) => prev.filter((a) => a.id !== deletingAgent.id));
      toast.success(data.message || `تم حذف الوكيل "${deletingAgent.name}" بنجاح`);
      setDeletingAgent(null);
    } catch (err: any) {
      toast.error(err.message || "فشل حذف الوكيل من النظام");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredAgents = useMemo(() => {
    return agents
      .filter((ag) => {
        // Status filter
        if (statusFilter === "ACTIVE" && !ag.isActive) return false;
        if (statusFilter === "INACTIVE" && ag.isActive) return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          ag.name.toLowerCase().includes(q) ||
          ag.city.toLowerCase().includes(q) ||
          (ag.address && ag.address.toLowerCase().includes(q)) ||
          ag.phone.includes(q)
        );
      })
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [agents, statusFilter, searchQuery]);

  const activeCount = agents.filter((a) => a.isActive).length;
  const inactiveCount = agents.length - activeCount;

  return (
    <div className="space-y-6 text-right transition-colors duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              <span>إدارة الوكلاء المعتمدين ومراكز الدفع</span>
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold">
              الإجمالي: {agents.length}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
              نشط: {activeCount}
            </span>
            {inactiveCount > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/30 font-bold">
                معطل: {inactiveCount}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إضافة وإدارة نقاط التحصيل ومكاتب الشحن بالمحافظات، تعديل أرقام التواصل وروابط واتساب، والتحكم الفوري بظهورها في صفحة الوكلاء العامة
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchAgents}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
          </button>

          {/* View Toggle (Grid / Table) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f]">
            <button
              type="button"
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-[#0d1b2a] text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="عرض البطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-[#0d1b2a] text-amber-600 dark:text-amber-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Agent Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة وكيل جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الوكيل، المدينة، العنوان، أو الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none shadow-xs transition-colors"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            الكل ({agents.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            النشط ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "INACTIVE"
                ? "bg-slate-600 text-white dark:bg-slate-700 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            المعطل ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin mx-auto text-amber-500" />
          <p className="text-xs font-bold">جاري تحميل بيانات الوكلاء من السيرفر...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-8 space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">لم يتم العثور على وكلاء</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchQuery ? "لا توجد نتائج مطابقة لبحثك الحالي." : "لم تتم إضافة أي وكيل معتمد بعد."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول وكيل الآن</span>
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((ag) => {
            const waLink = getWhatsAppLink(ag);
            return (
              <div
                key={ag.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  ag.isActive
                    ? "border-slate-200 dark:border-[#1e3a5f] hover:border-amber-500/50"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070e17]/80 opacity-75"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Header Row: Avatar + Name + Toggle */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden font-black text-amber-600 dark:text-amber-400 text-base">
                        {ag.image && ag.image.startsWith("/") ? (
                          <img
                            src={ag.image}
                            alt={ag.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{ag.name.trim().charAt(0) || "و"}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {ag.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]">
                            {ag.city}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ترتيب: #{ag.orderIndex ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Active Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(ag)}
                      title={ag.isActive ? "تعطيل الوكيل (إخفاء فوري)" : "تفعيل الوكيل (إظهار فوري)"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        ag.isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      <Power className={`w-3 h-3 ${ag.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                      <span>{ag.isActive ? "نشط" : "معطل"}</span>
                    </button>
                  </div>

                  {/* Location & Details Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#1e3a5f]/60 space-y-2 text-xs">
                    {ag.address && (
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ag.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-mono" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{ag.phone}</span>
                      </div>

                      {/* Working WhatsApp Test Link Button */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                        title="اختبار فتح محادثة الواتساب المباشرة للوكيل"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>اختبار واتساب</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Actions (Edit & Delete) */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-mono">
                    {ag.isActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ ظاهر بالمتجر</span>
                    ) : (
                      <span className="text-rose-500 font-bold">✕ مخفي بالمتجر</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(ag)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingAgent(ag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold transition-all cursor-pointer"
                      title="حذف الوكيل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl shadow-xs">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e3a5f] bg-slate-50/70 dark:bg-[#070e17]/60 text-slate-600 dark:text-slate-400 font-black">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">الوكيل / المركز</th>
                <th className="py-3.5 px-4">المدينة / المحافظة</th>
                <th className="py-3.5 px-4">العنوان التفصيلي</th>
                <th className="py-3.5 px-4">رقم الهاتف وواتساب</th>
                <th className="py-3.5 px-4 text-center">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
              {filteredAgents.map((ag) => {
                const waLink = getWhatsAppLink(ag);
                return (
                  <tr
                    key={ag.id}
                    className={`hover:bg-slate-50 dark:hover:bg-[#13253a]/40 transition-colors ${
                      !ag.isActive ? "opacity-60 bg-slate-50/50 dark:bg-[#070e17]/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-400">{ag.orderIndex ?? 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {ag.name.trim().charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{ag.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-[#1e3a5f]">
                        {ag.city}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {ag.address || "—"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono" dir="ltr">{ag.phone}</span>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 transition-colors"
                          title="اختبار واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(ag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          ag.isActive
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{ag.isActive ? "نشط" : "معطل"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(ag)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#13253a] hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                          title="تعديل البيانات"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAgent(ag)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#13253a] hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT AGENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingAgent ? `تعديل بيانات الوكيل: ${editingAgent.name}` : "إضافة وكيل معتمد جديد"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    اسم الوكيل أو المركز المعتمد *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: مكتب الميدان للشحن الفوري"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    المحافظة / المدينة *
                  </label>
                  <input
                    type="text"
                    required
                    list="city-suggestions"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="دمشق"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                  />
                  <datalist id="city-suggestions">
                    {COMMON_CITIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  العنوان التفصيلي ونقطة العلام
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="مثال: دمشق - الميدان شارع الجزماتية، مقابل جامع المنصور"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                />
              </div>

              {/* Phone & WhatsApp Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم الهاتف / الاتصال *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+963911223344"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>رابط محادثة واتساب المباشر</span>
                    <span className="text-[10px] text-slate-400 font-normal">اختياري (تلقائي)</span>
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={formData.whatsappUrl}
                    onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/963911223344"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400">
                    إذا ترك فارغاً سيتم توليد رابط wa.me تلقائياً من رقم الهاتف.
                  </p>
                </div>
              </div>

              {/* Image URL & Order Index */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    رابط الشعار أو الصورة
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500 placeholder-slate-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    ترتيب الظهور في القائمة
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">تفعيل الوكيل في المتجر العام</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    عند التفعيل يظهر فوراً في دليل الوكلاء العام للمستخدمين
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingAgent ? "حفظ التعديلات" : "إضافة الوكيل الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1b2a] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تأكيد حذف الوكيل نهائياً
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                هل أنت متأكد من رغبتك في حذف الوكيل{" "}
                <strong className="text-rose-600 dark:text-rose-400">{deletingAgent.name}</strong>؟
              </p>
              <p className="text-[11px] text-slate-400">
                سيتم مسح هذا الوكيل بصورة نهائية من قاعدة البيانات وتخزين النظام ولن يظهر بعد الآن في أي مكان.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>نعم، حذف نهائي</span>
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingAgent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors border border-slate-200 dark:border-[#1e3a5f] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
