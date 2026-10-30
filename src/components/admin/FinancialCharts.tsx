"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
  ShieldCheck,
  Percent,
  Sliders,
  Check,
  X,
  Loader2,
  RefreshCw,
  Coins,
  Wallet,
  Activity,
  UserCheck,
  Edit2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface FinancialSummary {
  totalInflow: number;
  totalOutflow: number;
  netProfit: number;
  rootRoyalty: number;
  inflowTrend: string;
  outflowTrend: string;
  netProfitMargin: string;
  activeAdminsCount: number;
}

interface ChartPoint {
  label: string;
  inflow: number;
  outflow: number;
  profit: number;
}

interface CategoryProfit {
  id: string;
  name: string;
  marginPercent: number;
  profitAmount: number;
  color: string;
  inflowShare: string;
}

interface AdminCommissionItem {
  id: string;
  name: string;
  email: string;
  username: string;
  image?: string | null;
  role: string;
  isActive: boolean;
  handledVolume: number;
  grossProfit: number;
  rootCommissionRate: number;
  rootShare: number;
  adminNet: number;
}

export function FinancialCharts() {
  const [timeframe, setTimeframe] = useState<"today" | "7days" | "month" | "year">("7days");
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [categories, setCategories] = useState<CategoryProfit[]>([]);
  const [admins, setAdmins] = useState<AdminCommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Commission Modal State
  const [editingAdmin, setEditingAdmin] = useState<AdminCommissionItem | null>(null);
  const [modalRate, setModalRate] = useState<number>(10);
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  const fetchFinanceData = async (activeTimeframe = timeframe) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/root-admin/analytics/finance?timeframe=${activeTimeframe}`);
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setChartData(data.chartData);
        setCategories(data.categoryBreakdown);
        setAdmins(data.adminMatrix);
      }
    } catch {
      toast.error("فشل جلب المؤشرات المالية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData(timeframe);
  }, [timeframe]);

  // Handle Quick Rate Update
  const handleSaveCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setIsSavingCommission(true);

    try {
      const res = await fetch("/api/root-admin/analytics/finance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: editingAdmin.id,
          rootCommissionRate: modalRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(data.message || "تم تحديث نسبة العمولة بنجاح", {
        description: `حصة الـ Root: ${modalRate}% • صافي المشرف: ${100 - modalRate}%`,
      });

      // Update local state smoothly
      setAdmins((prev) =>
        prev.map((adm) => {
          if (adm.id === editingAdmin.id) {
            const rootShare = Number(((adm.grossProfit * modalRate) / 100).toFixed(2));
            const adminNet = Number((adm.grossProfit - rootShare).toFixed(2));
            return {
              ...adm,
              rootCommissionRate: modalRate,
              rootShare,
              adminNet,
            };
          }
          return adm;
        })
      );

      // Recalculate root royalty
      setSummary((prev) => {
        if (!prev) return prev;
        const totalRoyalty = admins.reduce((acc, a) => {
          if (a.id === editingAdmin.id) {
            return acc + Number(((a.grossProfit * modalRate) / 100).toFixed(2));
          }
          return acc + a.rootShare;
        }, 0);
        return {
          ...prev,
          rootRoyalty: Number(totalRoyalty.toFixed(2)),
        };
      });

      setEditingAdmin(null);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء حفظ نسبة العمولة");
    } finally {
      setIsSavingCommission(false);
    }
  };

  // SVG Chart Geometry Calculations
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.inflow, d.outflow)),
    1000
  );

  const getCoordinates = (index: number, value: number) => {
    const totalPoints = chartData.length;
    const x =
      paddingX +
      (index / (totalPoints > 1 ? totalPoints - 1 : 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      (value / (maxVal * 1.15)) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  // Build SVG Path Strings
  const inflowPoints = chartData.map((d, i) => getCoordinates(i, d.inflow));
  const outflowPoints = chartData.map((d, i) => getCoordinates(i, d.outflow));

  const inflowPath =
    inflowPoints.length > 0
      ? `M ${inflowPoints[0].x} ${inflowPoints[0].y} ` +
        inflowPoints
          .slice(1)
          .map((p, i) => {
            const prev = inflowPoints[i];
            const cx1 = prev.x + (p.x - prev.x) / 2;
            const cx2 = cx1;
            return `C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
          })
          .join(" ")
      : "";

  const outflowPath =
    outflowPoints.length > 0
      ? `M ${outflowPoints[0].x} ${outflowPoints[0].y} ` +
        outflowPoints
          .slice(1)
          .map((p, i) => {
            const prev = outflowPoints[i];
            const cx1 = prev.x + (p.x - prev.x) / 2;
            const cx2 = cx1;
            return `C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
          })
          .join(" ")
      : "";

  const inflowAreaPath =
    inflowPoints.length > 0
      ? `${inflowPath} L ${inflowPoints[inflowPoints.length - 1].x} ${
          chartHeight - paddingY
        } L ${inflowPoints[0].x} ${chartHeight - paddingY} Z`
      : "";

  const outflowAreaPath =
    outflowPoints.length > 0
      ? `${outflowPath} L ${outflowPoints[outflowPoints.length - 1].x} ${
          chartHeight - paddingY
        } L ${outflowPoints[0].x} ${chartHeight - paddingY} Z`
      : "";

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* 1. Dynamic Financial Summary Cards (Top Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inflow */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-emerald-500/30 p-5 shadow-xs hover:border-emerald-500/50 transition-all group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              إجمالي الإيرادات الداخلة (Inflow / الداخل)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              ${summary?.totalInflow.toLocaleString() || "0.00"}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">USD</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{summary?.inflowTrend || "+18.4%"} نمو متصاعد</span>
            </span>
            <span className="text-slate-400 font-mono">إيداعات ومبيعات</span>
          </div>
        </div>

        {/* Card 2: Total Outflow */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-rose-500/30 p-5 shadow-xs hover:border-rose-500/50 transition-all group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              إجمالي المصاريف والمشتريات (Outflow / الطالع)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              ${summary?.totalOutflow.toLocaleString() || "0.00"}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">USD</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{summary?.outflowTrend || "+14.2%"} تكلفة المزودين</span>
            </span>
            <span className="text-slate-400 font-mono">API Wholesale</span>
          </div>
        </div>

        {/* Card 3: Total Net Platform Profit */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-white dark:via-[#0d1b2a] to-amber-500/5 border border-amber-500/40 p-5 shadow-xs hover:border-amber-500 transition-all group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-amber-900 dark:text-[#f3e5ab]">
              صافي أرباح المنصة الكلية (Net Profit)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-[#d4af37] border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-700 dark:text-[#f3e5ab]">
              ${summary?.netProfit.toLocaleString() || "0.00"}
            </span>
            <span className="text-xs font-mono text-amber-800 dark:text-[#f3e5ab]/80 font-bold">صافي</span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold text-amber-800 dark:text-[#f3e5ab]">
              هامش الربح: {summary?.netProfitMargin || "24.0%"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-[#f3e5ab] font-bold">
              حقيقي بعد الاقتطاع
            </span>
          </div>
        </div>

        {/* Card 4: Root Royalty from Admins */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-cyan-500/30 p-5 shadow-xs hover:border-cyan-500/50 transition-all group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              عوائد الـ Root من المشرفين (Root Royalty)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-600 dark:text-[#06b6d4]">
              ${summary?.rootRoyalty.toLocaleString() || "0.00"}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">USD</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-cyan-700 dark:text-cyan-400">
              عائد غير مشروط (Passive Root Cut)
            </span>
            <span className="text-slate-400 font-mono">{admins.length} مشرف</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Graphical Charts Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Inflow vs. Outflow Over Time (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  مسار التدفق المالي (Inflow vs. Outflow)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مقارنة حية بين الأموال الداخلة (إيداعات ومبيعات) والتكاليف الصادرة للمزودين
              </p>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
              {[
                { key: "today", label: "اليوم" },
                { key: "7days", label: "7 أيام" },
                { key: "month", label: "هذا الشهر" },
                { key: "year", label: "السنة" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTimeframe(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tab.key
                      ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((ratio, idx) => {
                const y = paddingY + ratio * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-[#1e3a5f]/40 stroke-dasharray-[4_4]"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Filled Areas */}
              <path d={inflowAreaPath} fill="url(#inflowGradient)" />
              <path d={outflowAreaPath} fill="url(#outflowGradient)" />

              {/* Stroke Lines */}
              <path
                d={inflowPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <path
                d={outflowPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              {/* Data Points / Hover Markers */}
              {chartData.map((d, i) => {
                const inPt = getCoordinates(i, d.inflow);
                const outPt = getCoordinates(i, d.outflow);
                const isHovered = hoveredPointIndex === i;

                return (
                  <g key={i}>
                    {/* Hover vertical guide line */}
                    {isHovered && (
                      <line
                        x1={inPt.x}
                        y1={paddingY}
                        x2={inPt.x}
                        y2={chartHeight - paddingY}
                        stroke="#d4af37"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="animate-in fade-in"
                      />
                    )}

                    {/* Inflow point circle */}
                    <circle
                      cx={inPt.x}
                      cy={inPt.y}
                      r={isHovered ? 6 : 4}
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                    />

                    {/* Outflow point circle */}
                    <circle
                      cx={outPt.x}
                      cy={outPt.y}
                      r={isHovered ? 5 : 3}
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                    />

                    {/* X-Axis Labels */}
                    <text
                      x={inPt.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Tooltip Callout */}
            {hoveredPointIndex !== null && chartData[hoveredPointIndex] && (
              <div
                className="absolute top-2 left-6 rounded-2xl bg-slate-900/95 dark:bg-[#070e17]/95 border border-amber-500/40 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-20 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setHoveredPointIndex(null)}
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-700/60 pb-1 font-bold text-slate-200">
                  <span>{chartData[hoveredPointIndex].label}</span>
                  <span className="text-[10px] text-amber-400 font-mono">تفاصيل التدفق</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-emerald-400 font-mono">
                  <span className="flex items-center gap-1.5 font-sans text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>الداخل (Inflow):</span>
                  </span>
                  <strong>${chartData[hoveredPointIndex].inflow.toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-rose-400 font-mono">
                  <span className="flex items-center gap-1.5 font-sans text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>الطالع (Outflow):</span>
                  </span>
                  <strong>${chartData[hoveredPointIndex].outflow.toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between gap-4 text-amber-300 font-mono border-t border-slate-700/60 pt-1 font-black">
                  <span className="font-sans text-slate-200">صافي الربح:</span>
                  <strong>+${chartData[hoveredPointIndex].profit.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Legend Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1e3a5f]/60 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>الداخل (Inflow)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>الطالع (Outflow)</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">تحديث فوري مباشر</span>
          </div>
        </div>

        {/* Chart 2: Profit by Category (1 Column Donut/Bar) */}
        <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                توزيع الأرباح حسب الفئات
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              نسب هوامش الأرباح المحققة على مدار المبيعات
            </p>
          </div>

          {/* Visual Donut / Segmented Progress Bar */}
          <div className="space-y-4 py-2">
            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-[#070e17] p-0.5 border border-slate-200 dark:border-[#1e3a5f]">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    width: `${cat.marginPercent}%`,
                    backgroundColor: cat.color,
                  }}
                  className="h-full rounded-full transition-all duration-300 hover:opacity-80 cursor-pointer"
                  title={`${cat.name}: ${cat.marginPercent}%`}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              ))}
            </div>

            {/* Category Cards List */}
            <div className="space-y-2.5">
              {categories.map((cat) => {
                const isHovered = hoveredCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isHovered
                        ? "bg-slate-50 dark:bg-[#13253a] border-amber-400 dark:border-[#d4af37] shadow-xs"
                        : "bg-slate-50/50 dark:bg-[#070e17] border-slate-200 dark:border-[#1e3a5f]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate max-w-[170px]">{cat.name}</span>
                      </span>
                      <span className="font-mono font-black text-amber-700 dark:text-[#f3e5ab]">
                        {cat.marginPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>حصة الأرباح الصافية:</span>
                      <strong className="text-slate-900 dark:text-slate-200 font-mono">
                        ${cat.profitAmount.toLocaleString()} USD
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-[#f3e5ab] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>الأعلى عائداً: بطاقات الألعاب الإلكترونية والبث الحي</span>
          </div>
        </div>
      </div>

      {/* 3. Admins Revenue Breakdown & Commission Matrix */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] overflow-hidden shadow-xs transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold mb-1.5 border border-amber-500/30">
              <Percent className="w-3.5 h-3.5 text-amber-500" />
              <span>DYNAMIC REVENUE-SHARING ENGINE</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              تفاصيل أرباح المشرفين وحصة الـ Root (Admins Profit Share)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              مصفوفة توزيع العوائد اللحظية، ضبط نسب الاقتطاع من أرباح كل مشرف، واحتساب الدخل السلبي للـ Root
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchFinanceData(timeframe)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? "animate-spin" : ""}`} />
            <span>مزامنة الأرباح</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
              <tr>
                <th className="px-5 py-4">المشرف (Admin)</th>
                <th className="px-5 py-4">حجم المبيعات (Handled Volume)</th>
                <th className="px-5 py-4">إجمالي الربح (Gross Profit)</th>
                <th className="px-5 py-4">نسبة اقتطاع الـ Root (%)</th>
                <th className="px-5 py-4">حصة الـ Root الصافية ($)</th>
                <th className="px-5 py-4">صافي أرباح المشرف ($)</th>
                <th className="px-5 py-4 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
              {admins.map((adm) => (
                <tr
                  key={adm.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#13253a]/40 transition-colors"
                >
                  {/* Admin Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-900 shrink-0">
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
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{adm.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            {adm.role}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">{adm.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Volume Handled */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ${adm.handledVolume.toLocaleString()}
                  </td>

                  {/* Gross Profit */}
                  <td className="px-5 py-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ${adm.grossProfit.toLocaleString()}
                  </td>

                  {/* Root Cut % Badge */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdmin(adm);
                        setModalRate(adm.rootCommissionRate);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-[#f3e5ab] border border-amber-500/40 text-xs font-mono font-black transition-all cursor-pointer"
                      title="انقر لتعديل نسبة استقطاع الـ Root"
                    >
                      <Percent className="w-3 h-3 text-amber-500" />
                      <span>{adm.rootCommissionRate}%</span>
                    </button>
                  </td>

                  {/* Root Share $ */}
                  <td className="px-5 py-4 font-mono font-black text-cyan-600 dark:text-[#06b6d4] text-sm">
                    +${adm.rootShare.toLocaleString()}
                  </td>

                  {/* Admin Net $ */}
                  <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                    ${adm.adminNet.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdmin(adm);
                        setModalRate(adm.rootCommissionRate);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-500" />
                      <span>ضبط النسبة</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal: Quick Admin Commission Rate Adjuster */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ضبط نسبة أرباح الـ Root من المشرف
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Admin Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={editingAdmin.image || "/images/logo.png"}
                  alt={editingAdmin.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{editingAdmin.name}</h4>
                <p className="text-[11px] font-mono text-slate-400">{editingAdmin.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveCommissionRate} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    نسبة استقطاع الـ Root (% Root Cut)
                  </label>
                  <span className="font-mono font-black text-base text-amber-600 dark:text-[#f3e5ab]">
                    {modalRate}%
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={modalRate}
                  onChange={(e) => setModalRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (المشرف يحتفظ بكامل الربح)</span>
                  <span>50%</span>
                  <span>100% (الـ Root يأخذ كامل الربح)</span>
                </div>
              </div>

              {/* Explanatory Helper Box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-[#f3e5ab] font-bold">
                  <Info className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>محاكاة توزيع الأرباح:</span>
                </div>
                <p className="text-[11px]">
                  إذا حقق المشرف أرباحاً قدرها <strong>100$</strong>:
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-center">
                    حصة الـ Root: <strong>${modalRate}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-800 dark:text-slate-200 text-center">
                    صافي المشرف: <strong>${100 - modalRate}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1e3a5f]/60">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSavingCommission}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  {isSavingCommission ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>حفظ واعتماد النسبة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancialCharts;
