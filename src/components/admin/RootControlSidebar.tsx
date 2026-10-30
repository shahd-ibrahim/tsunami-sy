"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Server,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
  ClipboardList,
  Cpu,
  Building2,
  CreditCard,
  Users,
  Coins,
  UserCheck,
} from "lucide-react";

export function RootControlSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "نظرة عامة",
      href: "/root-admin",
      icon: LayoutDashboard,
      badge: "مباشر",
    },
    {
      name: "الحسابات والآيبانات",
      href: "/root-admin/banks",
      icon: Building2,
      badge: "IBAN",
    },
    {
      name: "قنوات الدفع والكاش",
      href: "/root-admin/banks",
      icon: CreditCard,
      badge: "كاش / USDT",
    },
    {
      name: "الوكلاء والمكاتب",
      href: "/root-admin/agents",
      icon: Users,
      badge: "موزعون",
    },
    {
      name: "المشرفون والصلاحيات",
      href: "/root-admin/admins",
      icon: UserCheck,
      badge: "Root Only",
    },
    {
      name: "أسعار العملات والتطبيقات",
      href: "/root-admin/settings",
      icon: Coins,
      badge: "حي",
    },
    {
      name: "إدارة الطلبات",
      href: "/root-admin/orders",
      icon: ShoppingBag,
      badge: "BullMQ",
    },
    {
      name: "مراجعة الإيداعات البنكية",
      href: "/root-admin/deposits",
      icon: Layers,
      badge: "تسوية",
    },
    {
      name: "إدارة المستخدمين",
      href: "/root-admin/users",
      icon: Users,
      badge: "تحكم",
    },
    {
      name: "توثيق الهويات الذكي",
      href: "/root-admin/kyc",
      icon: ShieldCheck,
      badge: "AI Bot",
    },
    {
      name: "إدارة المنتجات والأسعار",
      href: "/root-admin/catalog",
      icon: Tag,
      badge: "الكتالوج",
    },
    {
      name: "سيرفرات المزودين الخارجيين",
      href: "/root-admin/settings",
      icon: Server,
      badge: "HMAC",
    },
    {
      name: "سجل العمليات والتدقيق",
      href: "/root-admin/settings",
      icon: ClipboardList,
      badge: "أمان",
    },
  ];

  return (
    <aside className="w-full md:w-72 bg-[#0d1b2a] border-b md:border-b-0 md:border-l border-[#1e3a5f] p-5 flex flex-col justify-between shrink-0 shadow-2xl">
      <div>
        {/* Brand Crest */}
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#1e3a5f]/80">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#aa820a] to-[#070e17] p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <div className="w-full h-full rounded-[14px] bg-[#070e17] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-[#f3e5ab] to-[#d4af37] bg-clip-text text-transparent font-sans">
                TSUNAMI
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest font-mono">
                ROOT
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              root-admin.gateway
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5 mb-8">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-400 tracking-wider">
            الوحدات الإدارية
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/root-admin"
                ? pathname === "/root-admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#13253a] to-[#1e3a5f] text-[#f3e5ab] border border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "text-slate-300 hover:text-white hover:bg-[#13253a]/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#d4af37]" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    isActive
                      ? "bg-[#d4af37]/20 text-[#f3e5ab]"
                      : "bg-[#070e17] text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Engine Telemetry Card */}
        <div className="bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-4 text-xs space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#06b6d4]" /> حالة المحرك والنظام
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              مستقرة ومثالية
            </span>
          </div>

          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span className="font-sans">طابور BullMQ:</span>
              <span className="text-emerald-400 font-bold">نشط (5)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="font-sans">قفل القيود المحاسبي:</span>
              <span className="text-[#f3e5ab] font-bold">مؤمّن بحصانة</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="font-sans">توقيع الويب هوك:</span>
              <span className="text-[#06b6d4] font-bold">HMAC-SHA256</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-[#1e3a5f]/80 space-y-3">
        <div className="flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span className="text-slate-300 font-bold">المشرف العام (Root)</span>
          </div>
          <span className="text-[10px] font-mono bg-[#13253a] px-2 py-0.5 rounded text-emerald-400 font-bold">
            متصل
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-[#13253a] hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-all"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>عرض المتجر</span>
          </Link>

          <button
            onClick={async () => {
              await fetch("/api/staff/logout", { method: "POST" });
              window.location.href = "/staff-login";
            }}
            className="px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all"
            title="تسجيل الخروج الآمن"
          >
            خروج
          </button>
        </div>
      </div>
    </aside>
  );
}
