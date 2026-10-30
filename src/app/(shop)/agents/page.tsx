"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  Phone,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Search,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

export interface PublicAgent {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  phone: string;
  whatsappUrl?: string | null;
  image?: string | null;
  isActive: boolean;
  orderIndex: number;
}

export default function AgentsPage() {
  const [agentsList, setAgentsList] = useState<PublicAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAgents = async () => {
    try {
      const res = await fetch("/api/admin/agents?onlyActive=true", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        // Strictly filter by isActive === true and sort by orderIndex
        const activeOnly = data.agents
          .filter((ag: any) => ag.isActive === true)
          .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setAgentsList(activeOnly);
      }
    } catch {
      toast.error("تعذر تحميل قائمة الوكلاء المحدثة، يرجى إعادة المحاولة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Compute unique cities for filter chips
  const cities = useMemo(() => {
    const set = new Set<string>();
    agentsList.forEach((ag) => {
      if (ag.city && ag.city.trim()) {
        set.add(ag.city.trim());
      }
    });
    return ["ALL", ...Array.from(set)];
  }, [agentsList]);

  // Filter agents by city and search query
  const filteredAgents = useMemo(() => {
    return agentsList.filter((ag) => {
      // Must be active
      if (!ag.isActive) return false;

      // City filter
      if (selectedCity !== "ALL" && ag.city !== selectedCity) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        ag.name.toLowerCase().includes(q) ||
        ag.city.toLowerCase().includes(q) ||
        (ag.address && ag.address.toLowerCase().includes(q)) ||
        ag.phone.includes(q)
      );
    });
  }, [agentsList, selectedCity, searchQuery]);

  // WhatsApp link resolver
  const getWhatsAppUrl = (agent: PublicAgent) => {
    if (agent.whatsappUrl && agent.whatsappUrl.trim().startsWith("http")) {
      return agent.whatsappUrl.trim();
    }
    const cleanNumber = agent.phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    toast.success("تم نسخ رقم الهاتف بنجاح", { description: phone });
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-7 text-right transition-colors duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1b2a] to-[#13253a] border border-amber-500/20 shadow-xl text-white">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                شبكة الموزعين ونقاط الشحن المعتمدة 🇸🇾
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                تسليم فوري وكاش باليد
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              وكلاؤنا ومراكز الدفع المعتمدة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              يمكنك شحن رصيدك، تسليم الكاش باليد، أو استلام الأرباح عبر شبكة وكلائنا ومكاتبنا المعتمدة في مختلف المحافظات السورية والدول المجاورة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/deposit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg transition-all"
            >
              <span>بوابة الإيداع المباشر</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search and City Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وكيل بالاسم، المحافظة، أو العنوان..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none shadow-xs transition-colors"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            متاح حالياً:{" "}
            <span className="text-amber-600 dark:text-amber-400 font-mono font-black">
              {filteredAgents.length}
            </span>{" "}
            وكيل معتمد
          </div>
        </div>

        {/* City Filter Chips */}
        {cities.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCity === city
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500 shadow-xs"
                    : "bg-white dark:bg-[#0d1b2a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#1e3a5f] hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {city === "ALL" ? "كافة المحافظات والمناطق" : city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Agents Cards Display */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin mx-auto text-amber-500" />
          <p className="text-xs font-bold">جاري تحميل مراكز وشبكة الوكلاء المعتمدة...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-8 space-y-4 shadow-sm">
          <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              لا يوجد وكيل معتمد في هذه المنطقة حالياً
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              يمكنك استخدام وسائل الدفع الرقمية المباشرة (شام كاش، سيريتل كاش، USDT) أو التواصل مع الدعم الفني لمساعدتك.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCity("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              عرض كافة المحافظات
            </button>
            <Link
              href="/deposit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
            >
              وسائل الدفع الإلكترونية
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => {
            const waUrl = getWhatsAppUrl(agent);

            return (
              <div
                key={agent.id}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] hover:border-amber-500/60 dark:hover:border-amber-500/40 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar + Name + Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-sky-500/15 border border-amber-500/30 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-base shrink-0 overflow-hidden shadow-xs">
                        {agent.image && agent.image.startsWith("/") ? (
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span>{agent.name.trim().charAt(0) || "و"}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {agent.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {agent.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Official Verified Badge */}
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>معتمد</span>
                    </span>
                  </div>

                  {/* Location & Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#1e3a5f]/60 space-y-2 text-xs">
                    {agent.address && (
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{agent.address}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-[#1e3a5f]/40">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-mono text-xs" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{agent.phone}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyPhone(agent.phone)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="نسخ رقم الهاتف"
                      >
                        {copiedPhone === agent.phone ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ الرقم</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Action Button */}
                <div className="pt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer group-hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white/20" />
                    <span>محادثة واتساب فورية</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Safety Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            تنبيه أمني: تعامل حصراً مع أرقام الوكلاء المذكورة في هذه الصفحة الرسمية ولا تقم بتحويل أي مبالغ لأي شخص يدعي أنه وكيل خارج هذا الدليل.
          </span>
        </div>
        <Link
          href="/support"
          className="text-amber-600 dark:text-amber-400 font-bold hover:underline shrink-0"
        >
          مركز المساعدة والدعم
        </Link>
      </div>
    </div>
  );
}
