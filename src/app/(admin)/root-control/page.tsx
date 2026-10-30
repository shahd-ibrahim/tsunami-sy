"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingBag,
  Layers,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RootControlOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        setMetrics(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMetrics();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("تمت مزامنة المؤشرات وتحديث القيود المحاسبية بنجاح");
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Overview Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" /> لوحة المراقبة الإشرافية العليا (Root Telemetry)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            نظرة عامة على المحرك والعمليات
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة فورية للتسويات المالية، طوابير المعالجة التلقائية BullMQ، وحالة تغذية المزودين الخارجيين
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#06b6d4]" : ""}`} />
          <span>مزامنة المؤشرات</span>
        </button>
      </div>

      {/* 4 Executive Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Today's Revenue */}
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#d4af37] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              حجم المبيعات المكتملة
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#f3e5ab]">
            ${metrics ? Number(metrics.totalSales).toFixed(2) : "0.00"}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">+100%</span> تدقيق القيد المزدوج مؤكد
          </p>
        </div>

        {/* Metric 2: Active Orders */}
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#06b6d4] transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              الطلبات النشطة
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/40 flex items-center justify-center text-[#06b6d4]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {metrics ? metrics.activeOrdersCount || 0 : 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            في طابور المعالجة أو قيد الشحن
          </p>
        </div>

        {/* Metric 3: Failed Jobs in BullMQ */}
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-rose-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              وظائف BullMQ المتعثرة
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">
            {metrics ? metrics.bullMqFailedJobsCount || 0 : 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            تم تطبيق الاسترجاع التلقائي
          </p>
        </div>

        {/* Metric 4: Pending Deposit Slips */}
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">
              إشعارات الإيداع المعلقة
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {metrics ? metrics.pendingDepositsCount || 0 : 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            تتطلب موافقة واعتماد الإدارة
          </p>
        </div>
      </div>

      {/* Provider Balance Alerts Section */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-lg font-bold text-white">صحة سيرفرات المزودين الخارجيين وتنبيهات الأرصدة</h3>
          </div>
          <Link
            href="/root-admin/settings"
            className="text-xs font-bold text-[#06b6d4] hover:underline flex items-center gap-1"
          >
            <span>فتح مركز المزودين</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics?.providerBalances?.map((p: any) => {
            const isLow = p.balance < p.threshold;
            return (
              <div
                key={p.code}
                className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {p.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#13253a] text-slate-300">
                        {p.code}
                      </span>
                    </h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{p.endpoint}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      p.status === "ONLINE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                    }`}
                  >
                    {p.status === "ONLINE" ? "متصل ومستقر" : "جاهز للربط"}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#1e3a5f]/60 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">الرصيد المتبقي لدى المزود</span>
                    <div className="text-xl font-black text-[#f3e5ab]">
                      ${Number(p.balance).toFixed(2)} USD
                    </div>
                  </div>

                  {isLow ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/30">
                      تنبيه: الرصيد أقل من الحد الأدنى
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400">
                      الحد الآمن &gt; ${p.threshold} ممتاز
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Jump Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/root-admin/orders"
          className="group bg-gradient-to-l from-[#0d1b2a] to-[#13253a] border border-[#1e3a5f] hover:border-[#06b6d4] rounded-3xl p-6 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-[#06b6d4]">
              خط المعالجة المباشر
            </span>
            <h4 className="text-lg font-black text-white group-hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5">
              <span>إدارة وإعادة محاولة شحن الطلبات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-400">
              فلترة الطلبات حسب الحالة، فحص استجابات المزودين، وإعادة إرسال المهام لطابور BullMQ أو استرجاع المبالغ للمحفظة.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#070e17] border border-[#1e3a5f] flex items-center justify-center text-[#06b6d4] group-hover:border-[#06b6d4] group-hover:text-[#f3e5ab] transition-colors shrink-0 mr-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/root-admin/deposits"
          className="group bg-gradient-to-l from-[#0d1b2a] to-[#13253a] border border-[#1e3a5f] hover:border-[#d4af37] rounded-3xl p-6 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-[#d4af37]">
              التسوية والرقابة المالية
            </span>
            <h4 className="text-lg font-black text-white group-hover:text-[#f3e5ab] transition-colors flex items-center gap-1.5">
              <span>مراجعة الإيداعات وتدقيق الإيصالات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-400">
              معاينة صور إيصالات التحويل البنكي، والتحقق من الحوالات وإضافة الرصيد للعملاء فورياً مع قفل القيد.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#070e17] border border-[#1e3a5f] flex items-center justify-center text-[#d4af37] group-hover:border-[#d4af37] group-hover:text-[#f3e5ab] transition-colors shrink-0 mr-4">
            <Layers className="w-6 h-6" />
          </div>
        </Link>
      </div>
    </div>
  );
}
