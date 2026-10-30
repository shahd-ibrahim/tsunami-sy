"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Power,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  Lock,
  KeyRound,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { StaffMemberItem } from "@/lib/dynamic-hub";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formRole, setFormRole] = useState<"ROOT_ADMIN" | "FINANCE_OFFICER" | "SUPPORT_AGENT">("FINANCE_OFFICER");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "MANAGE_DEPOSITS",
    "MANAGE_ORDERS",
  ]);

  const ALL_PERMISSIONS = [
    { key: "MANAGE_DEPOSITS", label: "مراجعة وتأكيد الإيداعات البنكية" },
    { key: "MANAGE_ORDERS", label: "متابعة وإعادة معالجة الطلبات" },
    { key: "MANAGE_PRICES", label: "تعديل أسعار الكتالوج والكوينز" },
    { key: "MANAGE_BANKS", label: "إدارة الحسابات البنكية والآيبانات" },
    { key: "MANAGE_AGENTS", label: "إدارة شبكة الوكلاء المعتمدين" },
    { key: "MANAGE_STAFF", label: "إدارة صلاحيات المشرفين والموظفين" },
  ];

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff);
      } else {
        toast.error("فشل جلب قائمة المشرفين");
      }
    } catch {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED"
  ) => {
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: data.staff.status } : s))
        );
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل حالة المشرف");
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب المشرف "${name}" نهائياً؟`)) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل حذف المشرف");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formFullName.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني والاسم الكامل");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail.trim(),
          fullName: formFullName.trim(),
          role: formRole,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setStaffList((prev) => [data.staff, ...prev]);
        setIsModalOpen(false);
        setFormEmail("");
        setFormFullName("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("فشل إضافة المشرف");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === "ROOT_ADMIN") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
          ROOT ADMIN
        </span>
      );
    }
    if (role === "FINANCE_OFFICER") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/30">
          مسؤول المالية
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
        دعم ومتابعة
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" /> نشط
        </span>
      );
    }
    if (status === "PENDING_APPROVAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" /> بانتظار الموافقة
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <Ban className="w-3 h-3" /> معلق
      </span>
    );
  };

  const filtered = staffList.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e3a5f]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة المشرفين والمدراء المساعدين</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Root Super-Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            صلاحيات إدارة طاقم العمل، قبول طلبات الموظفين الجدد، وتعيين أذونات الوصول للعمليات والكتالوج.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStaff}
            className="p-2.5 rounded-xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-300 hover:text-white transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>تعيين مشرف / موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Notice Card for Root Authority */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-[#d4af37]/40 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
        <ShieldAlert className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">حماية مشددة للمستوى السيادي (Root Super-Admin):</strong>
          حصر صلاحية إنشاء المشرفين، تعديل الصلاحيات الإدارية، وإدارة أرقام الآيبانات بالحساب الرئيسي فقط. أي محاولة وصول من حسابات غير مصرحة سيتم رفضها وتسجيلها في سجل التدقيق الأمني.
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="w-full bg-[#0d1b2a] border border-[#1e3a5f] rounded-xl px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#d4af37]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>إجمالي المشرفين: <strong className="text-white">{staffList.length}</strong></span>
          <span>•</span>
          <span>النشطون: <strong className="text-emerald-400">{staffList.filter((s) => s.status === "ACTIVE").length}</strong></span>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#d4af37]" />
          <p className="text-xs text-slate-400">جاري تحميل بيانات المشرفين...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0d1b2a] border border-[#1e3a5f] text-slate-400">
          <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-bold text-slate-300">لم يتم العثور على أي مشرفين</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#1e3a5f] bg-[#0d1b2a] shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e17] text-slate-400 font-bold border-b border-[#1e3a5f]">
              <tr>
                <th className="p-3.5">المشرف / الاسم</th>
                <th className="p-3.5">الدور الإداري</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">الصلاحيات الممنوحة</th>
                <th className="p-3.5 text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a5f]/60">
              {filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#13253a]/40 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{staff.fullName}</div>
                    <div className="font-mono text-[11px] text-slate-400">{staff.email}</div>
                  </td>

                  <td className="p-3.5">
                    {getRoleBadge(staff.role)}
                  </td>

                  <td className="p-3.5">
                    {getStatusBadge(staff.status)}
                  </td>

                  <td className="p-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {staff.permissions && staff.permissions.length > 0 ? (
                        staff.permissions.map((p) => (
                          <span
                            key={p}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[#13253a] text-slate-300 border border-[#1e3a5f]"
                          >
                            {p.replace("MANAGE_", "")}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500">لا توجد صلاحيات (بانتظار الاعتماد)</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {staff.status === "PENDING_APPROVAL" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(staff.id, "ACTIVE")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                          title="قبول وتفعيل الحساب"
                        >
                          قبول الطلب
                        </button>
                      )}

                      {staff.status === "ACTIVE" && staff.role !== "ROOT_ADMIN" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(staff.id, "SUSPENDED")}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                          title="إيقاف الحساب مؤقتاً"
                        >
                          إيقاف مؤقت
                        </button>
                      )}

                      {staff.status === "SUSPENDED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(staff.id, "ACTIVE")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                          title="إعادة التفعيل"
                        >
                          إعادة تفعيل
                        </button>
                      )}

                      {staff.role !== "ROOT_ADMIN" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff.id, staff.fullName)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="حذف الحساب نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
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
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">إضافة وتعيين مشرف جديد</h3>
                <p className="text-xs text-slate-400">تحديد الدور والصلاحيات الممنوحة داخل لوحة التحكم</p>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الكامل للمشرف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: م. عمر الحلبي"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني المهني</label>
                <input
                  type="email"
                  required
                  placeholder="name@tsunami-sy.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  dir="ltr"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الدور الإداري</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full bg-[#070e17] border border-[#1e3a5f] rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="FINANCE_OFFICER">مسؤول المالية والحسابات (Finance Officer)</option>
                  <option value="SUPPORT_AGENT">موظف الدعم والطلبات (Support Agent)</option>
                  <option value="ROOT_ADMIN">مشرف سيادي عام (Root Super-Admin)</option>
                </select>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">الصلاحيات الممنوحة للحساب</label>
                <div className="space-y-2 bg-[#070e17] p-3 rounded-2xl border border-[#1e3a5f]">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className="flex items-center gap-2.5 text-xs cursor-pointer hover:text-white transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.key)}
                          className="rounded border-[#1e3a5f] text-amber-500 focus:ring-0 bg-[#0d1b2a]"
                        />
                        <span className={isChecked ? "text-slate-100 font-bold" : "text-slate-400"}>
                          {perm.label}
                        </span>
                      </label>
                    );
                  })}
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
                    <span>تأكيد إضافة المشرف وتفعيله</span>
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
