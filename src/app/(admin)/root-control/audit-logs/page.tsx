"use client";

import { useState } from "react";
import {
  ClipboardList,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

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

export default function RootAuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      searchQuery === "" ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <ClipboardList className="w-4 h-4 text-[#d4af37]" /> سجل الحماية والرقابة المحاسبية
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            سجل العمليات والتدقيق الإداري (Audit Logs)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            توثيق كامل لكافة الإجراءات المالية، اعتمادات الإيداع، واسترجاعات الرصيد مع البصمة الزمنية
          </p>
        </div>

        <button
          onClick={() => toast.success("تم تحديث سجل التدقيق")}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#06b6d4]" />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في سجلات التدقيق..."
            className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070e17] text-slate-400 font-semibold border-b border-[#1e3a5f]">
              <tr>
                <th className="px-6 py-4">رقم القيد</th>
                <th className="px-6 py-4">الإجراء الإداري</th>
                <th className="px-6 py-4">المنفذ</th>
                <th className="px-6 py-4">الهدف / المعاملة</th>
                <th className="px-6 py-4">التفاصيل المحاسبية</th>
                <th className="px-6 py-4">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a5f]/60 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#13253a]/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#f3e5ab]">
                    {log.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                    {log.admin}
                  </td>
                  <td className="px-6 py-4 font-mono text-[#06b6d4]">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
