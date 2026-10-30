"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  Search,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Check,
  X,
  Loader2,
  Trash2,
  UserCog,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface UserRecord {
  id: string;
  numericId: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  kycStatus: string;
  isFrozen: boolean;
  walletBalance: number;
  commissionRate?: number;
  countryName?: string | null;
  createdAt: string;
}

export default function RootAdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [kycFilter, setKycFilter] = useState<string>("ALL");

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryName: "سوريا 🇸🇾",
    role: "USER",
    walletBalance: 0,
    isVerified: true,
  });

  // Balance Adjustment Modal
  const [balanceUser, setBalanceUser] = useState<UserRecord | null>(null);
  const [balanceMode, setBalanceMode] = useState<"ADD" | "DEDUCT">("ADD");
  const [balanceAmount, setBalanceAmount] = useState<string>("");
  const [balanceNote, setBalanceNote] = useState<string>("");
  const [isAdjustingBalance, setIsAdjustingBalance] = useState(false);

  // Role Adjustment Modal
  const [roleUser, setRoleUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("USER");
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Delete Confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch {
      toast.error("فشل جلب قائمة المستخدمين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 1. Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم إنشاء الحساب بنجاح");
      setShowCreateModal(false);
      setNewUserForm({
        name: "",
        email: "",
        phone: "",
        countryName: "سوريا 🇸🇾",
        role: "USER",
        walletBalance: 0,
        isVerified: true,
      });
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل إنشاء الحساب");
    } finally {
      setIsCreating(false);
    }
  };

  // 2. Adjust Balance (+ / -)
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUser) return;
    const amountVal = parseFloat(balanceAmount);
    if (!amountVal || amountVal <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (!balanceNote.trim()) {
      toast.error("يرجى كتابة سبب التعديل (ملاحظة التدقيق)");
      return;
    }

    setIsAdjustingBalance(true);
    const finalAmount = balanceMode === "ADD" ? amountVal : -amountVal;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: balanceUser.id,
          action: "ADJUST_BALANCE",
          amount: finalAmount,
          note: balanceNote.trim(),
          performedBy: "Root Super-Admin",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setBalanceUser(null);
      setBalanceAmount("");
      setBalanceNote("");
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل تعديل الرصيد");
    } finally {
      setIsAdjustingBalance(false);
    }
  };

  // 3. Change Role
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleUser) return;

    setIsChangingRole(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: roleUser.id,
          action: "CHANGE_ROLE",
          role: selectedRole,
          commissionRate: Number(commissionRate) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message);
      setRoleUser(null);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل تحديث الرتبة");
    } finally {
      setIsChangingRole(false);
    }
  };

  // 4. Toggle KYC Override
  const handleToggleKyc = async (user: UserRecord) => {
    const nextVerified = !user.isVerified;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "KYC_OVERRIDE",
          isVerified: nextVerified,
          kycStatus: nextVerified ? "AUTO_VERIFIED" : "REJECTED",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isVerified: nextVerified, kycStatus: nextVerified ? "AUTO_VERIFIED" : "REJECTED" }
            : u
        )
      );
      toast.success(
        nextVerified
          ? `تم توثيق حساب "${user.name}" بنجاح يدوياً`
          : `تم إلغاء توثيق حساب "${user.name}"`
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير حالة التوثيق");
    }
  };

  // 5. Toggle Freeze
  const handleToggleFreeze = async (user: UserRecord) => {
    const nextFrozen = !user.isFrozen;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "TOGGLE_FREEZE",
          isFrozen: nextFrozen,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isFrozen: nextFrozen } : u))
      );
      toast.success(
        nextFrozen
          ? `تم تجميد وتقييد حساب "${user.name}" بنجاح`
          : `تم فك التجميد وتفعيل حساب "${user.name}"`
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تعديل حالة التجميد");
    }
  };

  // 6. Delete / Ban User
  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      toast.success("تم حذف وحظر المستخدم نهائياً من النظام");
      setDeleteUserId(null);
    } catch (err: any) {
      toast.error(err.message || "فشل حذف المستخدم");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.numericId).includes(searchQuery) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesKyc =
      kycFilter === "ALL" ||
      (kycFilter === "VERIFIED" && u.isVerified) ||
      (kycFilter === "UNVERIFIED" && !u.isVerified);

    return matchesSearch && matchesRole && matchesKyc;
  });

  const totalBalance = users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);
  const verifiedCount = users.filter((u) => u.isVerified).length;

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              إدارة الحسابات والمستخدمين والعمليات المالية
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
              {users.length} مستخدم
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            إضافة حسابات يدوية بصلاحيات مخصصة، تعديل وتغذية الأرصدة فورياً، التوثيق اليدوي (KYC Override)، وإدارة التجميد
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب يدوي (Root Add)</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">إجمالي المستخدمين</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1">{users.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">الحسابات الموثقة KYC</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {verifiedCount} <span className="text-xs text-slate-400 font-normal">({users.length ? Math.round((verifiedCount / users.length) * 100) : 0}%)</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">إجمالي أرصدة المحافظ</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">الحسابات المجمدة</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            {users.filter((u) => u.isFrozen).length}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، البريد، رقم المعرف (#ID)، أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">كافة الرتب (الكل)</option>
            <option value="USER">مستخدم عادي</option>
            <option value="RESELLER">موزع معتمد</option>
            <option value="AGENT">وكيل شحن</option>
          </select>

          {/* KYC Filter */}
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold outline-none cursor-pointer shadow-xs"
          >
            <option value="ALL">حالة التوثيق (الكل)</option>
            <option value="VERIFIED">موثق فقط ✓</option>
            <option value="UNVERIFIED">غير موثق</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
          <span>جاري تحميل بيانات المستخدمين...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-8 space-y-3 shadow-xs">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">لا يوجد مستخدمين مطابقين للبحث</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">يمكنك إنشاء حساب جديد أو تعديل معايير البحث.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-[#1e3a5f] bg-white dark:bg-[#0d1b2a] shadow-sm">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-[#102235] text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-[#1e3a5f]">
              <tr>
                <th className="py-3 px-4 font-bold">المعرف والمستخدم</th>
                <th className="py-3 px-4 font-bold">الرتبة</th>
                <th className="py-3 px-4 font-bold">حالة التوثيق (KYC)</th>
                <th className="py-3 px-4 font-bold">رصيد المحفظة</th>
                <th className="py-3 px-4 font-bold">حالة الحساب</th>
                <th className="py-3 px-4 font-bold text-center">إجراءات الإدارة المالية (Root Toolbar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-slate-50 dark:hover:bg-[#132840]/60 transition-colors ${
                    u.isFrozen ? "bg-rose-500/5 dark:bg-rose-950/20" : ""
                  }`}
                >
                  {/* User info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] font-bold font-mono flex items-center justify-center shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            #{u.numericId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5" dir="ltr">
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono" dir="ltr">
                            {u.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleUser(u);
                        setSelectedRole(u.role);
                        setCommissionRate(u.commissionRate || 0);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] hover:border-amber-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer font-bold text-[11px] shadow-xs"
                    >
                      <UserCog className="w-3 h-3 text-amber-500" />
                      <span>
                        {u.role === "RESELLER" ? "موزع معتمد" : u.role === "AGENT" ? "وكيل شحن" : "مستخدم عادي"}
                      </span>
                    </button>
                  </td>

                  {/* KYC */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleKyc(u)}
                      title="انقر لتعديل التوثيق فورياً"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        u.isVerified
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                          : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                      }`}
                    >
                      {u.isVerified ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>موثق بالكامل ✓</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>غير موثق (توثيق يدوي)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Wallet Balance */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                        ${(u.walletBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBalanceUser(u);
                          setBalanceMode("ADD");
                          setBalanceAmount("");
                          setBalanceNote("");
                        }}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>تعديل الرصيد</span>
                      </button>
                    </div>
                  </td>

                  {/* Freeze Status */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleFreeze(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        u.isFrozen
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
                          : "bg-slate-50 dark:bg-emerald-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1e3a5f] hover:border-emerald-500/50"
                      }`}
                    >
                      {u.isFrozen ? (
                        <>
                          <Lock className="w-3 h-3 text-rose-500" />
                          <span>محفظة مجمدة 🔒</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-emerald-500" />
                          <span>نشط ومفعل</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Action Toolbar */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-1 shadow-xs">
                      {/* Add/Deduct Balance button */}
                      <button
                        type="button"
                        title="تغذية أو خصم رصيد"
                        onClick={() => {
                          setBalanceUser(u);
                          setBalanceMode("ADD");
                          setBalanceAmount("");
                          setBalanceNote("");
                        }}
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Role button */}
                      <button
                        type="button"
                        title="تعديل الرتبة والعمولة"
                        onClick={() => {
                          setRoleUser(u);
                          setSelectedRole(u.role);
                          setCommissionRate(u.commissionRate || 0);
                        }}
                        className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete / Ban User button */}
                      <button
                        type="button"
                        title="حذف أو حظر المستخدم"
                        onClick={() => setDeleteUserId(u.id)}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1b2a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">إنشاء حساب مستخدم جديد (Root Add)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="محمد الأحمد"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="+963911223344"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">البلد</label>
                  <input
                    type="text"
                    value={newUserForm.countryName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, countryName: e.target.value })}
                    placeholder="سوريا 🇸🇾"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الرتبة والصلاحيات *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none font-bold"
                  >
                    <option value="USER">مستخدم عادي (USER)</option>
                    <option value="RESELLER">موزع معتمد (RESELLER)</option>
                    <option value="AGENT">وكيل شحن ومكتب (AGENT)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الرصيد الافتتاحي ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newUserForm.walletBalance}
                    onChange={(e) => setNewUserForm({ ...newUserForm, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUserForm.isVerified}
                    onChange={(e) => setNewUserForm({ ...newUserForm, isVerified: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded bg-slate-100 dark:bg-[#13253a] border-slate-300 dark:border-[#1e3a5f] focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">توثيق الحساب فورياً (Verified KYC)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">تمكين كامل العمليات المالية والشحن مباشرة دون الحاجة لرفع مستندات</span>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>إنشاء الحساب الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Adjust Balance Modal */}
      {balanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">تعديل وتغذية الرصيد المالي</h3>
              </div>
              <button
                type="button"
                onClick={() => setBalanceUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-1">
              <div className="text-xs text-slate-600 dark:text-slate-300">
                المستخدم: <strong className="text-slate-900 dark:text-white">{balanceUser.name}</strong> (#{balanceUser.numericId})
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                الرصيد الحالي: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">${balanceUser.walletBalance.toFixed(2)} USD</strong>
              </div>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              {/* Add vs Deduct toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setBalanceMode("ADD")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    balanceMode === "ADD"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>إضافة وتغذية (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceMode("DEDUCT")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    balanceMode === "DEDUCT"
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>خصم رصيد (-)</span>
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">المبلغ ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="50.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm outline-none"
                />
              </div>

              {/* Audit Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  سبب التعديل (ملاحظة التدقيق الإداري - Audit Note) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder="مثال: تسوية إيداع يدوي عبر حوالة شام كاش رقم #10928"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none resize-none"
                />
                <span className="text-[10px] text-slate-500 block">
                  سيتم تسجيل هذه الملاحظة تلقائياً في دفتر القيود وسجل المعاملات
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setBalanceUser(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isAdjustingBalance}
                  className={`px-6 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer ${
                    balanceMode === "ADD"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-rose-500 hover:bg-rose-400 text-white"
                  }`}
                >
                  {isAdjustingBalance ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{balanceMode === "ADD" ? "تأكيد إضافة الرصيد" : "تأكيد خصم الرصيد"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Role Modal */}
      {roleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">تعديل رتبة وصلاحيات المستخدم</h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              المستخدم: <strong className="text-slate-900 dark:text-white">{roleUser.name}</strong> (#{roleUser.numericId})
            </div>

            <form onSubmit={handleChangeRole} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الرتبة الجديدة *</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs font-bold outline-none"
                >
                  <option value="USER">مستخدم عادي (USER) - أسعار التجزئة</option>
                  <option value="RESELLER">موزع معتمد (RESELLER) - أسعار الجملة + تخفيضات</option>
                  <option value="AGENT">وكيل شحن (AGENT) - نقطة معتمدة + عمولة إيداعات</option>
                </select>
              </div>

              {(selectedRole === "RESELLER" || selectedRole === "AGENT") && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">نسبة الخصم / العمولة (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    placeholder="3.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setRoleUser(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isChangingRole}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isChangingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>حفظ وتطبيق الرتبة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1b2a] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-right space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد حظر / حذف المستخدم</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف وحظر هذا الحساب؟ سيتم منعه من تسجيل الدخول وإلغاء أي جلسات نشطة له.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e3a5f]">
              <button
                type="button"
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>نعم، حذف الحساب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
