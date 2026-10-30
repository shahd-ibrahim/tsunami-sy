"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  RotateCcw,
  Undo2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Code,
  X,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function RootOrdersManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionInProgress, setIsActionInProgress] = useState<string | null>(null);

  // Force Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("تعذر الاتصال ببوابة الشحن الخارجية - استرجاع يدوي للمحفظة");

  // Raw JSON Inspection Modal
  const [viewJsonOrder, setViewJsonOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRetryJob = async (orderId: string, orderNumber: string) => {
    setIsActionInProgress(orderId);
    try {
      const res = await fetch("/api/admin/orders/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت إعادة محاولة الشحن");

      toast.success("تمت إعادة جدولة المهمة في طابور BullMQ بنجاح", {
        description: `الطلب ${orderNumber} قيد المعالجة الآن عبر معالج المزود.`,
      });
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إعادة محاولة الطلب");
    } finally {
      setIsActionInProgress(null);
    }
  };

  const handleExecuteForceRefund = async () => {
    if (!refundModalOrder) return;
    setIsActionInProgress(refundModalOrder.id);

    try {
      const res = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          adminUserId: "admin-root",
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل استرجاع المبلغ للمحفظة");

      toast.success("تم استرجاع المبلغ للمحفظة بنجاح", {
        description: `تمت إضافة $${Number(refundModalOrder.amount).toFixed(2)} إلى محفظة العميل وتوثيق قيد محاسبي.`,
      });

      setRefundModalOrder(null);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تنفيذ عملية الاسترجاع");
    } finally {
      setIsActionInProgress(null);
    }
  };

  const statusLabels: Record<string, string> = {
    ALL: "الكل",
    PENDING: "معلق",
    PROCESSING: "قيد المعالجة",
    COMPLETED: "مكتمل",
    FAILED: "فشل",
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.targetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.userId && order.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.playerNickname && order.playerNickname.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06b6d4]/15 text-[#06b6d4] text-xs font-bold mb-2 border border-[#06b6d4]/30">
            <ShoppingBag className="w-4 h-4" /> محرك تنفيذ الطلبات وتوزيع الرصيد
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إدارة الطلبات والتحكم بمهام الشحن
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تدقيق عمليات الشحن، إعادة إرسال المهام لطابور المعالجة يدوياً، وتنفيذ استرجاع المبالغ للمحفظة فورياً
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#06b6d4]" />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                filterStatus === st
                  ? "bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "bg-[#070e17] text-slate-300 border border-[#1e3a5f] hover:border-slate-500"
              }`}
            >
              {statusLabels[st]} ({st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب أو معرف اللاعب..."
            className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#06b6d4] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            لا توجد طلبات مطابقة لمعايير البحث الحالية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#070e17] text-slate-400 font-semibold border-b border-[#1e3a5f]">
                <tr>
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">معرف العميل</th>
                  <th className="px-6 py-4">المنتج والباقة</th>
                  <th className="px-6 py-4">معرّف الحساب / Player ID</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">سجل المزود الخارجي</th>
                  <th className="px-6 py-4 text-left">الإجراءات الإدارية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3a5f]/60 text-slate-200">
                {filteredOrders.map((order) => {
                  const isFailed = order.status === "FAILED";
                  const isCompleted = order.status === "COMPLETED";

                  return (
                    <tr key={order.id || order.orderNumber} className="hover:bg-[#13253a]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab]">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                        {order.userId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{order.productName || "شحن مباشر"}</div>
                        <div className="text-[11px] text-slate-400">{order.packageName || order.packageId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-100 font-mono">{order.targetId}</div>
                        {order.playerNickname && (
                          <div className="text-[10px] text-[#06b6d4] font-medium">{order.playerNickname}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-[#d4af37]">
                        ${Number(order.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : order.status === "PROCESSING"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 animate-pulse"
                              : order.status === "FAILED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                            {order.providerTxId || order.errorMessage || "مدرج في طابور المعالجة"}
                          </span>
                          <button
                            onClick={() => setViewJsonOrder(order)}
                            className="p-1 rounded bg-[#13253a] hover:bg-[#1e3a5f] text-slate-400 hover:text-white"
                            title="عرض تفاصيل الاستجابة (JSON)"
                          >
                            <Code className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-start gap-2">
                          {/* Retry Button */}
                          <button
                            onClick={() => handleRetryJob(order.id, order.orderNumber)}
                            disabled={isActionInProgress === order.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                            title="إعادة إرسال المهمة لطابور الشحن"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>إعادة محاولة الشحن</span>
                          </button>

                          {/* Force Refund Button (Available unless already failed/refunded) */}
                          {!isFailed && (
                            <button
                              onClick={() => setRefundModalOrder(order)}
                              disabled={isActionInProgress === order.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                              title="استرجاع المبلغ فورياً لمحفظة العميل"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>استرجاع المبلغ للمحفظة</span>
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

      {/* Force Refund Confirmation Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">تأكيد استرجاع المبلغ للمحفظة</h3>
              </div>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              سيتم إضافة مبلغ <strong className="text-[#d4af37] font-mono">${Number(refundModalOrder.amount).toFixed(2)}</strong> فورياً إلى محفظة العميل <strong className="text-white font-mono">{refundModalOrder.userId}</strong> وتعيين حالة الطلب <strong className="text-[#f3e5ab] font-mono">{refundModalOrder.orderNumber}</strong> كـ &quot;فشل&quot; مع تسجيل قيد تدقيق مالي مؤمّن.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                سبب الاسترجاع (للتدقيق الإداري) *
              </label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleExecuteForceRefund}
                disabled={isActionInProgress === refundModalOrder.id}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg transition-all"
              >
                {isActionInProgress === refundModalOrder.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>تأكيد استرجاع الرصيد</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw JSON Inspection Modal */}
      {viewJsonOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#06b6d4]" />
                <h3 className="text-sm font-bold text-white">
                  بيانات وحمولة الطلب البرمجية: {viewJsonOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setViewJsonOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#070e17] rounded-xl p-4 font-mono text-[11px] text-emerald-400 max-h-80 overflow-y-auto text-left" dir="ltr">
              <pre>{JSON.stringify(viewJsonOrder, null, 2)}</pre>
            </div>

            <div className="text-left pt-2">
              <button
                onClick={() => setViewJsonOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-xs font-bold text-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
