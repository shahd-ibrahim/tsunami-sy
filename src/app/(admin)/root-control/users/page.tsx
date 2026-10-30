"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Award,
  AlertTriangle,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  MinusCircle,
  Loader2,
  RefreshCw,
  X,
  FileText,
  UserCheck,
  UserX,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicUserItem } from "@/lib/dynamic-hub";

export default function RootUsersModerationPage() {
  const [users, setUsers] = useState<DynamicUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [kycFilter, setKycFilter] = useState("ALL");

  // Role Change Modal
  const [roleModalUser, setRoleModalUser] = useState<DynamicUserItem | null>(null);
  const [newRole, setNewRole] = useState<"USER" | "RESELLER" | "AGENT">("USER");
  const [customRate, setCustomRate] = useState<number>(5.0);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Balance Adjust Modal
  const [balanceModalUser, setBalanceModalUser] = useState<DynamicUserItem | null>(null);
  const [adjustType, setAdjustType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [auditNote, setAuditNote] = useState<string>("");
  const [isSubmittingBalance, setIsSubmittingBalance] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch {
      toast.error("فشل تحميل قائمة المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Toggle Freeze
  const handleToggleFreeze = async (user: DynamicUserItem) => {
    const nextStatus = !user.isFrozen;
    const confirmMsg = nextStatus
      ? `هل أنت متأكد من تجميد حساب #${user.numericId} (${user.name})؟ سيتم إيقاف الشحن والإيداع للمحفظة.`
      : `هل أنت متأكد من إلغاء تجميد حساب #${user.numericId} (${user.name})؟`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "TOGGLE_FREEZE",
          isFrozen: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isFrozen: nextStatus } : u))
        );
      } else {
        toast.error(data.error || "فشل تحديث حالة الحساب");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    }
  };

  // Handle Role Change
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsSubmittingRole(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: roleModalUser.id,
          action: "CHANGE_ROLE",
          role: newRole,
          commissionRate: newRole !== "USER" ? Number(customRate) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: newRole, commissionRate: customRate } : u))
        );
        setRoleModalUser(null);
      } else {
        toast.error(data.error || "فشل ترقية المستخدم");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ الرتبة");
    } finally {
      setIsSubmittingRole(false);
    }
  };

  // Handle Manual Balance Adjust
  const handleSaveBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح أكبر من صفر");
      return;
    }
    if (!auditNote.trim() || auditNote.trim().length < 3) {
      toast.error("الملاحظة الإدارية (Audit Note) إلزامية لتسجيل القيد المحاسبي");
      return;
    }

    setIsSubmittingBalance(true);
    const finalAmount = adjustType === "CREDIT" ? amt : -amt;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: balanceModalUser.id,
          action: "ADJUST_BALANCE",
          amount: finalAmount,
          note: auditNote.trim(),
          performedBy: "Root Super-Admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === balanceModalUser.id ? { ...u, walletBalance: data.newBalance } : u))
        );
        setBalanceModalUser(null);
        setAdjustAmount("");
        setAuditNote("");
      } else {
        toast.error(data.error || "فشل تعديل الرصيد");
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل الرصيد");
    } finally {
      setIsSubmittingBalance(false);
    }
  };

  // Handle Delete / Ban
  const handleDeleteUser = async (user: DynamicUserItem) => {
    if (!confirm(`هل أنت متأكد من حذف / حظر حساب العميل #${user.numericId} (${user.name}) نهائياً؟`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم حذف حساب #${user.numericId} بنجاح`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        toast.error(data.error || "فشل حذف المستخدم");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(u.numericId).includes(searchQuery.replace("#", "")) ||
      (u.phone && u.phone.includes(searchQuery));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && !u.isFrozen) ||
      (statusFilter === "FROZEN" && u.isFrozen);
    const matchesKyc = kycFilter === "ALL" || u.kycStatus === kycFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesKyc;
  });

  // Calculate Metrics
  const totalBalance = users.reduce((acc, curr) => acc + curr.walletBalance, 0);
  const totalVerified = users.filter((u) => u.isVerified).length;
  const totalFrozen = users.filter((u) => u.isFrozen).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <Users className="w-4 h-4 text-[#d4af37]" /> مركز الرقابة الشاملة وإدارة المستخدمين
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إدارة الحسابات، الرتب، وتدقيق الأرصدة
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة العملاء، ترقية الموزعين والوكلاء، تجميد المحافظ المشبوهة، والتعديل اليدوي للأرصدة مع القيود الإلزامية
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] hover:border-[#d4af37] text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">إجمالي الحسابات المسجلة</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{users.length} عميل</span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">إجمالي السيولة في محافظ العملاء</span>
          <span className="text-2xl font-black text-[#d4af37] font-mono mt-1 block">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">الحسابات الموثقة بهوية رسمية</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
            {totalVerified} حساب
          </span>
        </div>
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] text-slate-400 block font-semibold">الحسابات المقيدة / المجمدة</span>
          <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">
            {totalFrozen} حساب
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، البريد، الهاتف، أو المعرف #1004..."
              className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#070e17] border border-[#1e3a5f] text-xs text-slate-300 rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">جميع الرتب</option>
              <option value="USER">عميل عادي</option>
              <option value="RESELLER">موزع VIP</option>
              <option value="AGENT">وكيل معتمد</option>
            </select>

            {/* KYC Filter */}
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="bg-[#070e17] border border-[#1e3a5f] text-xs text-slate-300 rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">حالة التوثيق (الكل)</option>
              <option value="AUTO_VERIFIED">موثق بالذكاء الاصطناعي</option>
              <option value="MANUAL_REVIEW">بانتظار مراجعة المشرف</option>
              <option value="PENDING_BOT_REVIEW">قيد فحص البوت</option>
              <option value="REJECTED">مرفوض</option>
              <option value="NOT_SUBMITTED">غير موثق</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#070e17] border border-[#1e3a5f] text-xs text-slate-300 rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">حالة الحساب</option>
              <option value="ACTIVE">نشط</option>
              <option value="FROZEN">مجمد / مقيد</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e17] border-b border-[#1e3a5f] text-slate-400 font-bold">
              <tr>
                <th className="p-4">المعرّف</th>
                <th className="p-4">المستخدم</th>
                <th className="p-4">الهاتف / الدولة</th>
                <th className="p-4">الرصيد المتاح</th>
                <th className="p-4">الرتبة</th>
                <th className="p-4">التوثيق (KYC)</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراءات الرقابة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a5f]/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin mx-auto mb-2" />
                    <span>جاري تحميل بيانات المستخدمين...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    لم يتم العثور على أي مستخدمين يطابقون شروط البحث.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-[#13253a]/50 transition-colors ${
                      user.isFrozen ? "bg-rose-950/15" : ""
                    }`}
                  >
                    {/* Numeric ID */}
                    <td className="p-4">
                      <span className="font-mono font-black text-[#d4af37] bg-[#070e17] px-2.5 py-1 rounded-lg border border-[#d4af37]/30 text-xs">
                        #{user.numericId}
                      </span>
                    </td>

                    {/* Full Name & Email */}
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isVerified && (
                          <span title="حساب موثق"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{user.email}</span>
                    </td>

                    {/* Phone & Country */}
                    <td className="p-4">
                      <span className="font-mono text-slate-200 block text-xs" dir="ltr">
                        {user.phone || "—"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{user.countryName || "سوريا"}</span>
                    </td>

                    {/* Balance */}
                    <td className="p-4">
                      <span className="font-mono font-black text-sm text-[#f3e5ab]">
                        ${user.walletBalance.toFixed(2)}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      {user.role === "AGENT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 text-[10px] font-bold">
                          <Award className="w-3 h-3 text-[#d4af37]" /> وكيل معتمد
                        </span>
                      ) : user.role === "RESELLER" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40 text-[10px] font-bold">
                          <TrendingUp className="w-3 h-3 text-[#06b6d4]" /> موزع VIP
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                          عميل عادي
                        </span>
                      )}
                    </td>

                    {/* KYC Status */}
                    <td className="p-4">
                      {user.kycStatus === "AUTO_VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> موثق ذاتياً
                        </span>
                      ) : user.kycStatus === "MANUAL_REVIEW" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> مراجعة إدارية
                        </span>
                      ) : user.kycStatus === "PENDING_BOT_REVIEW" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> فحص البوت
                        </span>
                      ) : user.kycStatus === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> مرفوض
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">غير مقدم</span>
                      )}
                    </td>

                    {/* State (Active / Frozen) */}
                    <td className="p-4">
                      {user.isFrozen ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                          <Lock className="w-3 h-3" /> مجمد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> نشط
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Promote / Change Role */}
                        <button
                          onClick={() => {
                            setRoleModalUser(user);
                            setNewRole(user.role);
                            setCustomRate(user.commissionRate || 5.0);
                          }}
                          className="p-1.5 rounded-lg bg-[#070e17] hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-colors"
                          title="ترقية / تغيير الرتبة"
                        >
                          <Award className="w-3.5 h-3.5 text-[#06b6d4]" />
                        </button>

                        {/* Adjust Balance */}
                        <button
                          onClick={() => {
                            setBalanceModalUser(user);
                            setAdjustType("CREDIT");
                            setAdjustAmount("");
                            setAuditNote("");
                          }}
                          className="p-1.5 rounded-lg bg-[#070e17] hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-colors"
                          title="تعديل الرصيد يدوياً"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-[#d4af37]" />
                        </button>

                        {/* Freeze / Unfreeze */}
                        <button
                          onClick={() => handleToggleFreeze(user)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            user.isFrozen
                              ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40"
                              : "bg-[#070e17] hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border-[#1e3a5f]"
                          }`}
                          title={user.isFrozen ? "إلغاء التجميد" : "تجميد الحساب"}
                        >
                          {user.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Ban / Delete */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-[#070e17] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-[#1e3a5f] transition-colors"
                          title="حظر / حذف الحساب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Promotion Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setRoleModalUser(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-[#070e17] text-slate-400 hover:text-white border border-[#1e3a5f]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-[#d4af37]" />
              ترقية وتغيير رتبة الحساب
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              العميل: <strong className="text-white">{roleModalUser.name}</strong> (#{roleModalUser.numericId})
            </p>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اختر الرتبة الجديدة</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole("USER")}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      newRole === "USER"
                        ? "bg-slate-700 border-white text-white shadow-md"
                        : "bg-[#070e17] border-[#1e3a5f] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    عميل عادي
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("RESELLER")}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      newRole === "RESELLER"
                        ? "bg-[#06b6d4]/20 border-[#06b6d4] text-[#06b6d4] shadow-md"
                        : "bg-[#070e17] border-[#1e3a5f] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    موزع VIP
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("AGENT")}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      newRole === "AGENT"
                        ? "bg-[#d4af37]/20 border-[#d4af37] text-[#f3e5ab] shadow-md"
                        : "bg-[#070e17] border-[#1e3a5f] text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    وكيل رسمي
                  </button>
                </div>
              </div>

              {newRole !== "USER" && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    نسبة خصم الموزع / الوكيل المخصصة (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={customRate}
                    onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white font-mono rounded-xl p-3 outline-none"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    سيحصل هذا الحساب على أسعار الجملة المخفضة تلقائياً عند الشحن.
                  </span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRole}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e5c05b] hover:to-[#d4af37] text-slate-950 text-xs font-black shadow-md"
                >
                  {isSubmittingRole ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>حفظ وتطبيق الرتبة</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Balance Adjustment Modal */}
      {balanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setBalanceModalUser(null)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-[#070e17] text-slate-400 hover:text-white border border-[#1e3a5f]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
              تعديل الرصيد يدوياً (Manual Ledger Entry)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              العميل: <strong className="text-white">{balanceModalUser.name}</strong> (#{balanceModalUser.numericId}) — الرصيد الحالي:{" "}
              <span className="text-[#f3e5ab] font-mono font-bold">${balanceModalUser.walletBalance.toFixed(2)}</span>
            </p>

            <form onSubmit={handleSaveBalance} className="space-y-4">
              {/* Type: Credit or Debit */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نوع التعديل</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType("CREDIT")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      adjustType === "CREDIT"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md"
                        : "bg-[#070e17] border-[#1e3a5f] text-slate-400"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة رصيد (شحن)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("DEBIT")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      adjustType === "DEBIT"
                        ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-md"
                        : "bg-[#070e17] border-[#1e3a5f] text-slate-400"
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>خصم رصيد (استرجاع)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  المبلغ بالدولار ($) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-sm text-white font-mono rounded-xl p-3 outline-none"
                  dir="ltr"
                />
              </div>

              {/* Mandatory Audit Note */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الملاحظة الإدارية الإلزامية (Audit Note) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={auditNote}
                  onChange={(e) => setAuditNote(e.target.value)}
                  placeholder="مثال: تسوية إيداع كاش عبر الهرم إشعار رقم #99283 أو تعويض شحن مباشر"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  سيتم حفظ هذه الملاحظة وتوقيع المشرف في سجل الحركات المالية (Transaction Ledger).
                </span>
              </div>

              {/* Balance Preview */}
              {adjustAmount && !isNaN(parseFloat(adjustAmount)) && (
                <div className="p-3 rounded-xl bg-[#070e17] border border-[#1e3a5f] text-xs flex items-center justify-between">
                  <span className="text-slate-400">الرصيد بعد التعديل:</span>
                  <span className="font-mono font-black text-sm text-[#f3e5ab]">
                    $
                    {Math.max(
                      0,
                      balanceModalUser.walletBalance +
                        (adjustType === "CREDIT" ? parseFloat(adjustAmount) : -parseFloat(adjustAmount))
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setBalanceModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBalance}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e5c05b] hover:to-[#d4af37] text-slate-950 text-xs font-black shadow-md"
                >
                  {isSubmittingBalance ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>تأكيد وتسجيل القيد</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
