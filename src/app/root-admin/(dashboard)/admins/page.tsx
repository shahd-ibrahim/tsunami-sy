"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  Check,
  X,
  Loader2,
  Trash2,
  KeyRound,
  Edit2,
  AlertTriangle,
  UserCheck,
  Shield,
  Layers,
  Percent,
  Info,
  Coins,
  Wallet,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface RootAdminRecord {
  id: string;
  numericId?: number;
  name: string;
  username: string;
  email: string;
  image?: string | null;
  role: string;
  isActive: boolean;
  isPrimary?: boolean;
  createdAt: string;
  rootCommissionRate?: number;
  totalVolumeHandled?: number;
  adminEarnings?: number;
  rootEarningsFromAdmin?: number;
  operatingBalance?: number;
}

export default function RootAdminManagementPage() {
  const [admins, setAdmins] = useState<RootAdminRecord[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal 1: Add Root
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    image: "/images/logo.png",
    rootCommissionRate: 10,
  });

  // Modal 2: Reset Password
  const [resetAdmin, setResetAdmin] = useState<RootAdminRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // Modal 3: Edit Admin
  const [editAdmin, setEditAdmin] = useState<RootAdminRecord | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editCommissionRate, setEditCommissionRate] = useState<number>(10);
  const [isEditing, setIsEditing] = useState(false);

  // Modal 4: Delete Admin
  const [deleteAdmin, setDeleteAdmin] = useState<RootAdminRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal 5: Inject Balance
  const [injectAdmin, setInjectAdmin] = useState<RootAdminRecord | null>(null);
  const [injectAmount, setInjectAmount] = useState<string>("");
  const [injectNote, setInjectNote] = useState<string>("");
  const [isInjecting, setIsInjecting] = useState<boolean>(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/root-admin/admins");
      const data = await res.json();
      if (data.success && data.admins) {
        setAdmins(data.admins);
        if (data.currentAdminId) {
          setCurrentAdminId(data.currentAdminId);
        }
      }
    } catch {
      toast.error("فشل جلب قائمة حسابات المشرفين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // 1. Add New Root Admin
  const handleCreateRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error("يرجى تعبئة جميع الحقول الإلزامية");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم إنشاء حساب الروت الجديد بنجاح");
      setShowAddModal(false);
      setAddForm({
        name: "",
        username: "",
        email: "",
        password: "",
        image: "/images/logo.png",
        rootCommissionRate: 10,
      });
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "فشل إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Toggle Status (Active / Disabled)
  const handleToggleStatus = async (admin: RootAdminRecord) => {
    if (admin.isPrimary) {
      toast.error("لا يمكن تعديل حالة الجذر الرئيسي المؤسس للنظام");
      return;
    }
    if (admin.id === currentAdminId) {
      toast.error("إجراء أمان: لا يمكنك تعطيل حسابك النشط حالياً");
      return;
    }

    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: admin.id,
          action: "TOGGLE_STATUS",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, isActive: !a.isActive } : a))
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير حالة الحساب");
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAdmin || !newPassword) return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: resetAdmin.id,
          action: "RESET_PASSWORD",
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم تعيين كلمة المرور الجديدة بنجاح");
      setResetAdmin(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "فشل تعيين كلمة المرور");
    } finally {
      setIsResetting(false);
    }
  };

  // 4. Edit Profile
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdmin) return;

    setIsEditing(true);
    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: editAdmin.id,
          action: "EDIT_PROFILE",
          name: editName,
          image: editImage,
          rootCommissionRate: editCommissionRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم تحديث بيانات المشرف بنجاح");
      setEditAdmin(null);
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث البيانات");
    } finally {
      setIsEditing(false);
    }
  };

  // 5. Delete Admin
  const handleDeleteAdmin = async () => {
    if (!deleteAdmin) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/root-admin/admins?id=${deleteAdmin.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم حذف المشرف بنجاح");
      setDeleteAdmin(null);
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "فشل حذف المشرف");
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Inject Operating Balance (Root to Admin)
  const handleInjectBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectAdmin || !injectAmount) return;

    const parsedAmount = parseFloat(injectAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صالح أكبر من الصفر");
      return;
    }

    setIsInjecting(true);
    try {
      const res = await fetch("/api/root-admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: injectAdmin.id,
          action: "INJECT_BALANCE",
          amount: parsedAmount,
          note: injectNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم شحن الرصيد التشغيلي للمشرف بنجاح");
      setInjectAdmin(null);
      setInjectAmount("");
      setInjectNote("");
      await fetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "فشل شحن الرصيد");
    } finally {
      setIsInjecting(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    return (
      searchQuery === "" ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              إدارة المشرفين والروت الأعلى (Super-Admin Accounts)
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
              {admins.length} حسابات روت
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وإدارة حسابات المشرفين العامين بصلاحيات Root كاملة، وتتبع هويات العمليات المالية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchAdmins}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مشرف / روت جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">إجمالي المشرفين (Roots)</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
              {admins.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">الحسابات النشطة والمصرحة</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
              {admins.filter((a) => a.isActive).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">مستوى تصريح الأمان</span>
            <div className="text-xs font-black text-amber-600 dark:text-[#f3e5ab] mt-1 font-mono">
              TIER-1 MASTER_ROOT
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-[#06b6d4] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم، البريد الإلكتروني، أو اسم المستخدم..."
          className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-sm"
        />
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <span>جاري تحميل بيانات المشرفين...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-[#102235] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                <tr>
                  <th className="px-5 py-4">المشرف والصورة</th>
                  <th className="px-5 py-4">البريد الإلكتروني واسم الدخول</th>
                  <th className="px-5 py-4 text-center">نسبة الـ Root (% Cut)</th>
                  <th className="px-5 py-4 text-center">المبيعات / الأرباح / الرصيد</th>
                  <th className="px-5 py-4 text-center">الحالة والصلاحية</th>
                  <th className="px-5 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                {filteredAdmins.map((adm) => {
                  const isCurrent = adm.id === currentAdminId;
                  return (
                    <tr
                      key={adm.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#132840]/60 transition-colors"
                    >
                      {/* Avatar & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden shrink-0 bg-slate-900 shadow-xs">
                            <img
                              src={adm.image || "/images/logo.png"}
                              alt={adm.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "/images/logo.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{adm.name}</span>
                              {adm.isPrimary && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  الجذر المؤسس
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-[#06b6d4] border border-cyan-500/30">
                                  أنت (الحساب الحالي)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              @{adm.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Role */}
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="text-slate-700 dark:text-slate-300">{adm.email}</div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {adm.role}
                        </span>
                      </td>

                      {/* Root Commission Rate % */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-[#f3e5ab] font-mono font-black text-xs border border-amber-500/30">
                          <Percent className="w-3 h-3 text-amber-500" />
                          <span>{adm.rootCommissionRate ?? 10}%</span>
                        </span>
                      </td>

                      {/* Volume, Profit & Operating Balance */}
                      <td className="px-5 py-4 text-center font-mono">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          مبيعات: ${(adm.totalVolumeHandled || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          أرباح: +${(adm.adminEarnings || 0).toFixed(1)}
                        </div>
                        <div className="text-[10px] text-cyan-600 dark:text-[#06b6d4] font-black mt-0.5">
                          رصيد: ${(adm.operatingBalance || 0).toFixed(2)}
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-5 py-4 text-center">
                        {adm.isPrimary || isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            <span>مفعّل دائم</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(adm)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              adm.isActive
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                            }`}
                          >
                            {adm.isActive ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>نشط ومصرح</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>معطل وموقوف</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inject Operating Balance Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setInjectAdmin(adm);
                              setInjectAmount("");
                              setInjectNote("");
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition-colors cursor-pointer"
                            title="تعبئة الرصيد التشغيلي للمشرف (Inject Balance)"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditAdmin(adm);
                              setEditName(adm.name);
                              setEditImage(adm.image || "/images/logo.png");
                              setEditCommissionRate(adm.rootCommissionRate ?? 10);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="تعديل الاسم والصورة ونسبة الـ Root"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          {!adm.isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                setResetAdmin(adm);
                                setNewPassword("");
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete (Hidden for Primary and Current) */}
                          {!adm.isPrimary && !isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeleteAdmin(adm)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                              title="حذف حساب المشرف نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Root Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-2xl text-right space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  إضافة حساب مشرف عام جديد (New Root Super-Admin)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoot} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    الاسم الكامل للمشرف *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="م. أحمد الشامي"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    اسم الدخول (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="ahmad_root"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني الرسمي *
                  </label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="ahmad@tsunami-sy.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    كلمة المرور الرئيسية *
                  </label>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="كلمة مرور (6+ خانات)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  رابط الصورة الرمزية (Avatar URL)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={addForm.image}
                  onChange={(e) => setAddForm({ ...addForm, image: e.target.value })}
                  placeholder="/images/logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Root Commission Rate Slider */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-[#070e17] border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-[#f3e5ab] flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    <span>نسبة أرباح الـ Root من هذا المشرف (% Root Cut)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-[#f3e5ab] font-mono font-black text-xs">
                    <span>{addForm.rootCommissionRate}%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={addForm.rootCommissionRate}
                  onChange={(e) =>
                    setAddForm({ ...addForm, rootCommissionRate: Number(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>0% (المشرف 100%)</span>
                  <span>50% (مناصفة)</span>
                  <span>100% (الروت بالكامل)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1b2a] border border-amber-500/20 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">ملاحظة توضيحية: </span>
                    إذا كانت النسبة <strong>{addForm.rootCommissionRate}%</strong>، فسيحصل الـ Root على{" "}
                    <strong className="text-amber-600 dark:text-amber-400">{addForm.rootCommissionRate}$</strong> من كل 100$ أرباح يحققها المشرف، ويحتفظ المشرف بـ{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">{100 - addForm.rootCommissionRate}$</strong>.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-300">
                <p className="text-[11px] leading-relaxed">
                  الحساب الجديد سيتم منحه صلاحية <strong>SUPER_ADMIN</strong> الكاملة وسيتطلب تسجيل دخوله إدخال Master PIN المعتمد.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>تأكيد وإنشاء حساب الروت</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reset Password Modal */}
      {resetAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>إعادة تعيين كلمة المرور: {resetAdmin.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetAdmin(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="كلمة مرور جديدة (6 أحرف على الأقل)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetAdmin(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وتعيين كلمة المرور</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Admin Profile Modal */}
      {editAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                <span>تعديل بيانات المشرف: {editAdmin.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditAdmin(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  رابط الصورة الرمزية (Avatar URL)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="/images/logo.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Root Commission Rate Slider */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-[#070e17] border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-[#f3e5ab] flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    <span>نسبة أرباح الـ Root من هذا المشرف (% Root Cut)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-[#f3e5ab] font-mono font-black text-xs">
                    <span>{editCommissionRate}%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={editCommissionRate}
                  onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>0% (المشرف 100%)</span>
                  <span>50% (مناصفة)</span>
                  <span>100% (الروت بالكامل)</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0d1b2a] border border-amber-500/20 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-600 dark:text-amber-400">ملاحظة توضيحية: </span>
                    إذا كانت النسبة <strong>{editCommissionRate}%</strong>، فسيحصل الـ Root على{" "}
                    <strong className="text-amber-600 dark:text-amber-400">{editCommissionRate}$</strong> من كل 100$ أرباح يحققها المشرف، ويحتفظ المشرف بـ{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">{100 - editCommissionRate}$</strong>.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isEditing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete Confirmation Modal */}
      {deleteAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تأكيد حذف حساب المشرف ({deleteAdmin.name})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ سيتم إلغاء جميع صلاحيات الدخول إلى لوحة الروت فوراً.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteAdmin(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                تراجع وإلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>نعم، حذف الحساب نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Inject Operating Balance Modal */}
      {injectAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-500" />
                <span>تعبئة الرصيد التشغيلي: {injectAdmin.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setInjectAdmin(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">الرصيد التشغيلي الحالي</span>
                <div className="text-base font-black text-cyan-600 dark:text-[#06b6d4] font-mono">
                  ${(injectAdmin.operatingBalance || 0).toFixed(2)} USD
                </div>
              </div>
              <div className="text-left font-mono text-xs text-slate-500 dark:text-slate-400">
                <div>@{injectAdmin.username}</div>
                <div className="text-[10px] text-amber-500 font-bold">{injectAdmin.role}</div>
              </div>
            </div>

            <form onSubmit={handleInjectBalance} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  المبلغ المراد شحنه لمحفظة الآدمن ($ USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    dir="ltr"
                    value={injectAmount}
                    onChange={(e) => setInjectAmount(e.target.value)}
                    placeholder="مثال: 500.00"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-sm outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Fast presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInjectAmount(preset.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#13253a] hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-[11px] font-mono font-bold transition-colors cursor-pointer border border-slate-200 dark:border-[#1e3a5f]"
                  >
                    +${preset}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  ملاحظة أو سبب التغذية (اختياري)
                </label>
                <input
                  type="text"
                  value={injectNote}
                  onChange={(e) => setInjectNote(e.target.value)}
                  placeholder="مثال: تغذية تشغيلية أولية للفرع"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  سيتم إضافة هذا المبلغ فورياً إلى محفظة المشرف التشغيلية، وسيكون بإمكانه توزيعه وشحن حسابات الزبائن منه.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInjectAdmin(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isInjecting}
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isInjecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Coins className="w-3.5 h-3.5" />
                  )}
                  <span>تأكيد وشحن الرصيد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
