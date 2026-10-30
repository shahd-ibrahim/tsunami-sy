"use client";

import { useState } from "react";
import {
  Server,
  Activity,
  Zap,
  ShieldCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ProviderItem {
  code: string;
  name: string;
  status: "ONLINE" | "READY" | "DEGRADED";
  balance: number;
  threshold: number;
  currency: string;
  endpoint: string;
  authMethod: string;
  avgLatency: string;
}

const INITIAL_PROVIDERS: ProviderItem[] = [
  {
    code: "MOCK_TOPUP",
    name: "بوابة تسونامي الداخلية للألعاب (Internal Gaming Engine)",
    status: "ONLINE",
    balance: 8450.50,
    threshold: 1000.00,
    currency: "USD",
    endpoint: "mock://internal.rpc.gateway",
    authMethod: "اتصال داخلي مباشر Direct RPC",
    avgLatency: "14ms",
  },
  {
    code: "REST_GENERIC",
    name: "بوابة الشحن العالمية المباشرة (Global Top-Up REST API)",
    status: "READY",
    balance: 1420.00,
    threshold: 500.00,
    currency: "USD",
    endpoint: "https://api.provider-topup.example.com/v1",
    authMethod: "توقيع رقمي مشفر HMAC-SHA256 + مفتاح API",
    avgLatency: "78ms",
  },
];

export default function RootProviderHubPage() {
  const [providers, setProviders] = useState<ProviderItem[]>(INITIAL_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<string>("MOCK_TOPUP");
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any | null>(null);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);

    try {
      const res = await fetch("/api/admin/providers/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerCode: selectedProvider }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل اختبار الاتصال");

      setPingResult(data);
      toast.success(`تم فحص الاتصال بالمزود ${selectedProvider} بنجاح!`, {
        description: `استجابت البوابة خلال ${data.latencyMs} مللي ثانية بالحالة ${data.status}.`,
      });
    } catch (err: any) {
      toast.error(err.message || "فشل الاتصال بالمزود الخارجي");
      setPingResult({
        status: "FAILED",
        error: err.message,
      });
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <Server className="w-4 h-4 text-[#d4af37]" /> بوابات الربط البرمجي الخارجية
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            سيرفرات المزودين الخارجيين (API Providers)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مراقبة الأداء اللحظي، رصيد الموزع التراكمي، واختبار التوقيع الرقمي HMAC المباشر
          </p>
        </div>
      </div>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => {
          const isLow = p.balance < p.threshold;

          return (
            <div
              key={p.code}
              className="bg-[#0d1b2a] border border-[#1e3a5f] hover:border-[#06b6d4] rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#070e17] border border-[#1e3a5f] flex items-center justify-center text-[#06b6d4]">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070e17] text-[#06b6d4] border border-[#1e3a5f]">
                        {p.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        معدل الاستجابة: {p.avgLatency}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.status === "ONLINE"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                  }`}
                >
                  {p.status === "ONLINE" ? "متصل ومستقر" : "جاهز للربط"}
                </span>
              </div>

              {/* Endpoint & Auth Details */}
              <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-4 text-xs font-mono space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">عنوان الرابط (Endpoint):</span>
                  <span className="text-white truncate max-w-[200px]" dir="ltr">{p.endpoint}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">بروتوكول المصادقة:</span>
                  <span className="text-[#f3e5ab] font-sans">{p.authMethod}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">حد التنبيه للرصيد:</span>
                  <span className="text-slate-300 font-bold font-mono">${p.threshold.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Float Balance */}
              <div className="pt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400">
                    رصيد السحب المتوفر لدى المزود
                  </span>
                  <div className="text-2xl font-black text-[#f3e5ab]">
                    ${p.balance.toFixed(2)} {p.currency}
                  </div>
                </div>

                {isLow ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> تنبيه: الرصيد قارب على النفاد
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> الرصيد كافٍ ومثالي
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Live Test Ping Tool */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-[#06b6d4]" />
            <h3 className="text-lg font-black text-white">أداة الفحص والاتصال المباشر (Diagnostic &amp; Ping Tool)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            اختبار مباشر للاتصال والتحقق من صحة توقيع HMAC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                بوابة المزود المستهدفة
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
              >
                <option value="MOCK_TOPUP">MOCK_TOPUP (بوابة تسونامي الداخلية للألعاب)</option>
                <option value="REST_GENERIC">REST_GENERIC (بوابة الشحن العالمية المباشرة)</option>
              </select>
            </div>

            <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white mb-1">
                <Lock className="w-4 h-4 text-[#d4af37]" /> فحص الأمان والشهادات:
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                تقوم هذه الأداة بإجراء مصافحة SSL والتحقق من استلام ترويسة HMAC-SHA256 وتطابق المفاتيح السرية بدون أي انحراف زمني.
              </p>
            </div>

            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#06b6d4] to-[#00a8b5] hover:from-[#22d3ee] hover:to-[#06b6d4] text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isPinging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إرسال حزمة الفحص...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال حزمة الفحص الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Result Output Window */}
          <div className="md:col-span-7 bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-5 min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e3a5f]/60">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                  سجل الاستجابة الفوري (Probe Console)
                </span>
                {pingResult && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      pingResult.status === "HEALTHY"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    الحالة: {pingResult.status === "HEALTHY" ? "سليم ومتصل" : "فشل الاتصال"}
                  </span>
                )}
              </div>

              {pingResult ? (
                <div className="space-y-3 font-mono text-xs text-right">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-sans">رمز المزود:</span>
                    <span className="text-white font-bold">{pingResult.providerCode}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-sans">زمن الاستجابة (Latency):</span>
                    <span className="text-emerald-400 font-bold">{pingResult.latencyMs} مللي ثانية</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500 font-sans">التوقيت:</span>
                    <span className="text-slate-300" dir="ltr">{pingResult.timestamp}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#1e3a5f]/60">
                    <span className="text-[10px] text-slate-500 block mb-1 font-sans">
                      بيانات الاستجابة الخام (JSON Payload):
                    </span>
                    <div className="bg-[#0d1b2a] rounded-lg p-3 text-[11px] text-[#06b6d4] max-h-36 overflow-y-auto text-left" dir="ltr">
                      <pre>{JSON.stringify(pingResult.details || pingResult.error, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-sans">
                  اختر المزود ثم اضغط على &quot;إرسال حزمة الفحص الآن&quot; لاختبار زمن الاستجابة والتحقق من صحة التوقيع.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
