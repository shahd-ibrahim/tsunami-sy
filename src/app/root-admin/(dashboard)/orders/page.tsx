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

export default function RootAdminOrdersPage() {
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

      if (!res.ok) throw new Error(data.error || "فشلت إعادة الإرسال");

      toast.success("تم إرسال المهمة لطابور المعالجة الآلي مجدداً", {
        description: `الطلب ${orderNumber} أصبح في طابور الشحن الفوري عبر BullMQ.`,
      });
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إعادة إرسال الطلب");
    } finally {
      setIsActionInProgress(null);
    }
  };

  const handleConfirmRefund = async () => {
    if (!refundModalOrder) return;
    setIsActionInProgress(refundModalOrder.id);

    try {
      const res = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          reason: refundReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الاسترجاع للمحفظة");

      toast.success("تم استرجاع المبلغ للمحفظة بنجاح", {
        description: `تم إيداع $${Number(refundModalOrder.totalAmount).toFixed(2)} في رصيد المستخدم.`,
      });
      setRefundModalOrder(null);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء معالجة الاسترجاع");
    } finally {
      setIsActionInProgress(null);
    }
  };

  const statusLabels: Record<string, string> = {
    ALL: "الكل",
    PENDING: "قيد الانتظار",
    PROCESSING: "جاري التنفيذ",
    COMPLETED: "مكتمل وناجح",
    FAILED: "فشل المعالجة",
    REFUNDED: "مسترجع للمحفظة",
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.playerCustomId && order.playerCustomId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.productTitle && order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPER-ADMIN ORDER DISPATCH & FULFILLMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              إدارة وتوزيع طلبات الشحن الفوري
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              متابعة طوابير المعالجة (BullMQ)، إعادة المحاولة للطلبات المعلقة، وإجراء استرجاع رصيد المحفظة الفوري.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "REFUNDED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
                }`}
              >
                {statusLabels[st]} ({st === "ALL" ? orders.length : orders.filter((o) => o.status === st).length})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الطلب، المعرف، أو اللاعب..."
              className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] overflow-hidden shadow-xs dark:shadow-xl">
        {isLoading && orders.length === 0 ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-mono">جاري تحميل الطلبات...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              لا توجد طلبات مطابقة لفلتر &quot;{statusLabels[filterStatus] || filterStatus}&quot;
            </h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                <tr>
                  <th className="px-5 py-4">رقم الطلب</th>
                  <th className="px-5 py-4">المنتج والحزمة</th>
                  <th className="px-5 py-4">معرف اللاعب</th>
                  <th className="px-5 py-4">القيمة</th>
                  <th className="px-5 py-4">الحالة</th>
                  <th className="px-5 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-[#13253a]/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-amber-600 dark:text-[#f3e5ab]">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {order.productTitle || "شحن مباشر"}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {order.packageTitle || order.userId}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {order.playerCustomId || "-"}
                    </td>
                    <td className="px-5 py-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                          order.status === "COMPLETED"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            : order.status === "FAILED"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                            : order.status === "REFUNDED"
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30"
                            : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center justify-start gap-2">
                        {order.status === "FAILED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRetryJob(order.id, order.orderNumber)}
                              disabled={isActionInProgress === order.id}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>إعادة شحن</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRefundModalOrder(order)}
                              disabled={isActionInProgress === order.id}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>استرجاع</span>
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewJsonOrder(order)}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] text-slate-500 dark:text-slate-300 cursor-pointer"
                          title="فحص السجل الرقمي JSON"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Viewer Modal */}
      {viewJsonOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono">
                Payload JSON: {viewJsonOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setViewJsonOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-xs font-mono text-cyan-700 dark:text-[#06b6d4] overflow-x-auto max-h-96">
              {JSON.stringify(viewJsonOrder, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                استرجاع قيمة الطلب للمحفظة
              </h3>
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              سيتم استرجاع مبلغ (${Number(refundModalOrder.totalAmount).toFixed(2)}) فورياً إلى رصيد محفظة المستخدم.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سبب الاسترجاع:</label>
              <textarea
                rows={2}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                disabled={isActionInProgress === refundModalOrder.id}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md cursor-pointer"
              >
                تأكيد الاسترجاع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
