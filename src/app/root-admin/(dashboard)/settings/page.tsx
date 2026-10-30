"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  ClipboardList,
  Coins,
  Server,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Send,
  Lock,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformRateItem } from "@/lib/dynamic-hub";

interface AuditLogEntry {
  id: string;
  action: string;
  admin: string;
  target: string;
  details: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "INFO";
}

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: "AUD-8921",
    action: "تأكيد إيداع مصرفي يدوي",
    admin: "admin-root",
    target: "DEP-2026-001 (user-vip-1)",
    details: "إضافة رصيد 150.00 $ عبر شام كاش مع قفل محاسبي مؤمّن.",
    timestamp: "منذ 4 دقائق",
    status: "SUCCESS",
  },
  {
    id: "AUD-8920",
    action: "استرجاع مبلغ طلب للمحفظة",
    admin: "admin-root",
    target: "TS-884219 (PUBG 60 UC)",
    details: "تم رد 0.99 $ للمحفظة بسبب انقطاع مؤقت في خادم المزود.",
    timestamp: "منذ 18 دقيقة",
    status: "WARNING",
  },
  {
    id: "AUD-8919",
    action: "إعادة محاولة شحن مهمة BullMQ",
    admin: "admin-root",
    target: "TS-991204 (Free Fire 100 Diamonds)",
    details: "إعادة إرسال المهمة لطابور المعالجة الآلي واكتمالها بنجاح.",
    timestamp: "منذ 42 دقيقة",
    status: "SUCCESS",
  },
  {
    id: "AUD-8918",
    action: "فحص مصافحة HMAC وبوابة الربط",
    admin: "system-cron",
    target: "MOCK_TOPUP Gateway",
    details: "استجابة إيجابية خلال 14 مللي ثانية مع سلامة المفتاح السري.",
    timestamp: "منذ ساعة و10 دقائق",
    status: "INFO",
  },
  {
    id: "AUD-8917",
    action: "رفض إشعار تحويل بنكي",
    admin: "admin-root",
    target: "DEP-2026-004 (user-98)",
    details: "السبب: رقم إشعار التحويل غير واضح أو تم استخدامه مسبقاً.",
    timestamp: "منذ ساعتين",
    status: "WARNING",
  },
];

interface ProviderItem {
  id: string;
  name: string;
  status: "ONLINE" | "READY" | "DEGRADED";
  balance: number;
  currency: string;
  isConfigured: boolean;
  latencyMs: number;
  message?: string;
}

const INITIAL_PROVIDERS: ProviderItem[] = [
  {
    id: "smile_one",
    name: "Smile One B2B Gateway",
    status: "ONLINE",
    balance: 1450.5,
    currency: "USD",
    isConfigured: true,
    latencyMs: 45,
    message: "Direct API Gateway Active",
  },
  {
    id: "razer_b2b",
    name: "Razer Gold B2B Direct",
    status: "ONLINE",
    balance: 3280.0,
    currency: "USD",
    isConfigured: true,
    latencyMs: 38,
    message: "Razer Gold Direct Merchant Online",
  },
  {
    id: "custom_server",
    name: "Custom B2B Reseller Server",
    status: "ONLINE",
    balance: 850.0,
    currency: "USD",
    isConfigured: false,
    latencyMs: 82,
    message: "Custom Webhook Endpoint",
  },
  {
    id: "mock_provider",
    name: "TSUNAMI Sandbox Gateway",
    status: "ONLINE",
    balance: 5000.0,
    currency: "USD",
    isConfigured: true,
    latencyMs: 12,
    message: "Sandbox Simulated Engine",
  },
];

export default function RootAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "rates" | "providers" | "security">("logs");

  // Audit Logs State
  const [logs] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
  const [logSearch, setLogSearch] = useState("");
  const [logFilter, setLogFilter] = useState("ALL");

  // Rates State
  const [rates, setRates] = useState<PlatformRateItem[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [savingKeys, setSavingKeys] = useState<{ [key: string]: boolean }>({});
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});

  // Providers State
  const [providers, setProviders] = useState<ProviderItem[]>(INITIAL_PROVIDERS);
  const [isPinging, setIsPinging] = useState<string | null>(null);

  // Player ID Validation Tester State
  const [testGame, setTestGame] = useState("PUBG_MOBILE");
  const [testPlayerId, setTestPlayerId] = useState("512345678");
  const [testZoneId, setTestZoneId] = useState("");
  const [testProviderId, setTestProviderId] = useState("auto");
  const [isValidatingPlayer, setIsValidatingPlayer] = useState(false);
  const [playerTestResult, setPlayerTestResult] = useState<any>(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers");
      const data = await res.json();
      if (data.success && Array.isArray(data.providers)) {
        setProviders(data.providers);
      }
    } catch {
      // Fallback
    }
  };

  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      const res = await fetch("/api/admin/rates");
      const data = await res.json();
      if (data.success) {
        setRates(data.rates);
        const map: { [key: string]: string } = {};
        data.rates.forEach((r: PlatformRateItem) => {
          map[r.key] = String(r.rate);
        });
        setEditableValues(map);
      }
    } catch {
      // Ignore
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    fetchProviders();
  }, []);

  const handleSaveRate = async (key: string) => {
    const newVal = parseFloat(editableValues[key]);
    if (isNaN(newVal) || newVal <= 0) {
      toast.error("يرجى إدخال قيمة رقمية صحيحة أكبر من الصفر");
      return;
    }

    try {
      setSavingKeys((prev) => ({ ...prev, [key]: true }));
      const res = await fetch("/api/admin/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, rate: newVal }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم تحديث سعر الصرف (${key}) بنجاح`);
        await fetchRates();
      } else {
        toast.error(data.error || "فشل حفظ سعر الصرف");
      }
    } catch {
      toast.error("خطأ أثناء الاتصال بالخادم");
    } finally {
      setSavingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handlePingProvider = async (id: string) => {
    setIsPinging(id);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PING", providerId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تم الاتصال بنجاح بـ ${data.name} (الزمن: ${data.latencyMs}ms)`);
        await fetchProviders();
      } else {
        toast.error(data.message || "فشل الاتصال بالمزود");
      }
    } catch (err: any) {
      toast.error(err.message || "خطأ في الشبكة");
    } finally {
      setIsPinging(null);
    }
  };

  const handleTestPlayer = async () => {
    if (!testPlayerId.trim()) {
      toast.error("يرجى إدخال معرّف اللاعب");
      return;
    }

    setIsValidatingPlayer(true);
    setPlayerTestResult(null);

    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHECK_PLAYER",
          gameCode: testGame,
          playerId: testPlayerId.trim(),
          zoneId: testZoneId.trim() || undefined,
          providerId: testProviderId === "auto" ? undefined : testProviderId,
        }),
      });

      const data = await res.json();
      setPlayerTestResult(data);

      if (data.valid) {
        toast.success(`تم التحقق بنجاح: ${data.nickname}`);
      } else {
        toast.error(data.errorMessage || "لم يتم العثور على اللاعب");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل استعلام اللاعب");
    } finally {
      setIsValidatingPlayer(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      logSearch === "" ||
      l.action.includes(logSearch) ||
      l.target.includes(logSearch) ||
      l.admin.includes(logSearch);
    const matchesFilter = logFilter === "ALL" || l.status === logFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#070e17] dark:to-[#04080e] border border-slate-200 dark:border-[#d4af37]/30 p-6 sm:p-8 shadow-sm dark:shadow-2xl transition-colors">
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold font-mono">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>SYSTEM OPERATIONS & AUDIT TRAIL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              إعدادات المنظومة وسجل العمليات
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              سجل التدقيق الأمني للعمليات، أسعار صرف الليرة والعملات، ومراقبة صحة بوابات الشحن الخارجية المباشرة.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "logs"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>سجل العمليات والرقابة (Audit Trail)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rates")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "rates"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>أسعار الصرف والليرة ({rates.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("providers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "providers"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>بوابات الشحن والمزودين ({providers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>معايير الأمان وجدار الحماية</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["ALL", "SUCCESS", "WARNING", "INFO"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setLogFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    logFilter === st
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-[#070e17] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]"
                  }`}
                >
                  {st === "ALL" ? "الكل" : st}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="بحث في سجل العمليات..."
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] overflow-hidden shadow-xs dark:shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-[#1e3a5f]">
                  <tr>
                    <th className="px-5 py-4">معرف العملية</th>
                    <th className="px-5 py-4">نوع الإجراء</th>
                    <th className="px-5 py-4">المنفّذ</th>
                    <th className="px-5 py-4">الهدف / المعاملة</th>
                    <th className="px-5 py-4">تفاصيل القيد</th>
                    <th className="px-5 py-4">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e3a5f]/60 text-slate-800 dark:text-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-[#13253a]/40 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-amber-600 dark:text-[#f3e5ab]">
                        {log.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        {log.action}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-cyan-600 dark:text-[#06b6d4]">
                        {log.admin}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300">
                        {log.target}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.details}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-[11px] font-mono">
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rates */}
      {activeTab === "rates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>أسعار الصرف المعتمدة تلقائياً في حساب أسعار المنتجات والإيداعات</span>
            <button
              type="button"
              onClick={fetchRates}
              className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الأسعار</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates.map((r) => (
              <div
                key={r.key}
                className="p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                    <Coins className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#070e17] text-slate-500">
                    {r.key}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{r.name || r.key}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">القيمة المقابلة للدولار الواحد ($1.00 USD)</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="number"
                    step="any"
                    value={editableValues[r.key] || ""}
                    onChange={(e) =>
                      setEditableValues({ ...editableValues, [r.key]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] font-mono font-bold text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveRate(r.key)}
                    disabled={savingKeys[r.key]}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    {savingKeys[r.key] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>حفظ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Extensible Providers & Player Validation Engine */}
      {activeTab === "providers" && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  محرك بوابات الشحن الخارجية المباشرة (Top-Up Providers Hub)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-[#06b6d4] border border-cyan-500/30 font-bold">
                  {providers.length} بوابات نشطة
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                منظومة معيارية ذكية لإدارة الربط مع بوابات B2B المباشرة وتدقيق معرّفات اللاعبين وفحص الأرصدة.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchProviders}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث الأرصدة والحالة</span>
            </button>
          </div>

          {/* Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.name}</h4>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">{p.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.status === "ONLINE"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-slate-500 dark:text-slate-400">حالة المفاتيح والربط:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-sans ${
                        p.isConfigured
                          ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30"
                          : "bg-amber-500/15 text-amber-700 dark:text-[#f3e5ab] border border-amber-500/30"
                      }`}
                    >
                      {p.isConfigured ? "مفاتيح B2B رسمية Active" : "محاكاة آمنة Sandbox Sim"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-slate-500 dark:text-slate-400">زمن الاستجابة (Latency):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.latencyMs}ms</span>
                  </div>
                  {p.message && (
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-slate-500 dark:text-slate-400">الحالة التشغيلية:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-sans text-[11px] truncate max-w-[200px]">
                        {p.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">رصيد المزود المتوفر:</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                      ${p.balance.toFixed(2)} {p.currency}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePingProvider(p.id)}
                    disabled={isPinging === p.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Activity className={`w-3.5 h-3.5 text-cyan-500 ${isPinging === p.id ? "animate-spin" : ""}`} />
                    <span>فحص الاتصال (Ping)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Player ID Validation Testing Tool */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-[#f3e5ab] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  أداة فحص وتدقيق معرّف اللاعب الحية (Live Player ID Validation Tool)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  اختبار استعلام الحسابات واسترجاع اسم اللاعب من خوادم الألعاب عبر المزود المختار في الوقت الفعلي
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اللعبة المستهدفة</label>
                <select
                  value={testGame}
                  onChange={(e) => setTestGame(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
                >
                  <option value="PUBG_MOBILE">PUBG Mobile (ببجي موبايل)</option>
                  <option value="FREEFIRE">Free Fire (فري فاير)</option>
                  <option value="MLBB">Mobile Legends (موبايل ليجندز)</option>
                  <option value="GENSHIN">Genshin Impact (قينشن إمباكت)</option>
                  <option value="CODM">Call of Duty Mobile (كول أوف ديوتي)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">معرّف اللاعب (Player ID) *</label>
                <input
                  type="text"
                  dir="ltr"
                  value={testPlayerId}
                  onChange={(e) => setTestPlayerId(e.target.value)}
                  placeholder="مثال: 512345678"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم السيرفر (Zone ID) {testGame === "MLBB" ? "*" : "(اختياري)"}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={testZoneId}
                  onChange={(e) => setTestZoneId(e.target.value)}
                  placeholder={testGame === "MLBB" ? "مطلوب لـ MLBB: 2026" : "اختياري"}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البوابة المنفذة</label>
                <select
                  value={testProviderId}
                  onChange={(e) => setTestProviderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
                >
                  <option value="auto">تلقائي حسب توجيه اللعبة (Smart Routing)</option>
                  <option value="smile_one">Smile One B2B Gateway</option>
                  <option value="razer_b2b">Razer Gold B2B Direct</option>
                  <option value="custom_server">Custom B2B Reseller Server</option>
                  <option value="mock_provider">TSUNAMI Sandbox Gateway</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestPlayer}
                disabled={isValidatingPlayer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isValidatingPlayer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>فحص المعرّف واسترجاع اسم اللاعب</span>
              </button>

              {playerTestResult && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
                    playerTestResult.valid
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  {playerTestResult.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>اسم اللاعب المعتمد:</span>
                      <strong className="font-mono text-sm underline">{playerTestResult.nickname}</strong>
                      <span className="text-[10px] font-mono text-slate-400">({playerTestResult.providerId})</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>{playerTestResult.errorMessage || "فشل التحقق من الحساب"}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === "security" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                إجراءات الحماية والتحصين المتقدم (Security Hardening)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إعدادات الأمان النشطة في لوحة الجذر العليا لحماية البيانات والعمليات المالية.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">التخفي والعزل التام</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  نشط
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                أي زيارة بدون توكن جذر موقّع برمز HMAC تعيد 404 أو تحول مباشرة لواجهة التحقق المعزولة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">محدد المعدل ومكافحة التخمين</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  نشط
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                تجميد تلقائي لعنوان IP لمدة 15 دقيقة عند 5 محاولات دخول فاشلة متتالية لمنع هجمات القوة العمياء.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">القفل المحاسبي المؤمّن</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  نشط
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                أي حركة إيداع أو تعديل رصيد تتم عبر معاملة Prisma Transaction ذرية لضمان عدم ازدواجية القيود.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
