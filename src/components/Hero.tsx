"use client";

import { Flame, Search, Sparkles } from "lucide-react";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (slug: string) => void;
}

export function Hero({ searchQuery, setSearchQuery, onSelectProduct }: HeroProps) {
  return (
    <div className="relative overflow-hidden pt-10 pb-16 text-center">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.18)_0%,rgba(212,175,55,0.08)_40%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#00a8b5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#d4af37]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d1b2a]/90 border border-[#1e3a5f] shadow-[0_0_20px_rgba(6,182,212,0.2)] mb-6">
          <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
          <span className="text-xs font-black tracking-wide uppercase bg-gradient-to-r from-[#f3e5ab] to-[#d4af37] bg-clip-text text-transparent">
            بوابة شحن الألعاب والخدمات الرقمية الأولى في سوريا
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]"></span>
          <span className="text-[11px] font-bold text-slate-400 font-mono">
            tsunami-sy.com
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          شحن فوري ومباشر <br />
          <span className="bg-gradient-to-l from-[#06b6d4] via-[#00a8b5] to-[#f3e5ab] bg-clip-text text-transparent">
            للألعاب والبطاقات الرقمية
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-8 leading-relaxed font-medium">
          شحن شدات ببجي، جواهر فري فاير، ديسكورد نيترو، وتحويلات شام كاش الفورية مع تسوية مالية دقيقة ونظام أرتال غير متزامن فائق السرعة.
        </p>

        {/* Interactive Search Bar */}
        <div className="max-w-xl mx-auto relative mb-8">
          <div className="relative flex items-center bg-[#0d1b2a] border border-[#1e3a5f] focus-within:border-[#06b6d4] rounded-2xl shadow-2xl p-1.5 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-3 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن لعبتك أو بطاقتك المفضلة (مثل: ببجي، فري فاير، شام كاش)..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none py-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        {/* Popular Game Quick Pills in Arabic */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> الأكثر طلباً:
          </span>
          {[
            { name: "شدات ببجي موبايل", slug: "pubg-mobile", badge: "رويال باس" },
            { name: "فري فاير", slug: "free-fire", badge: "شحن UID فوري" },
            { name: "موبايل ليجندز", slug: "mobile-legends", badge: "ماسات" },
            { name: "ديسكورد نيترو", slug: "discord-nitro", badge: "تسليم كود" },
            { name: "شام كاش", slug: "sham-cash", badge: "الخيار الأول #1" },
          ].map((item) => (
            <button
              key={item.slug}
              onClick={() => onSelectProduct(item.slug)}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1b2a]/90 hover:bg-[#13253a] border border-[#1e3a5f] hover:border-[#d4af37]/60 text-xs font-bold text-slate-200 transition-all shadow-sm"
            >
              <span>{item.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e3a5f] group-hover:bg-[#d4af37]/20 text-[#06b6d4] group-hover:text-[#f3e5ab] font-bold">
                {item.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
