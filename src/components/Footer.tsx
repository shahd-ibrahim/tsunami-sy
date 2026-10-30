import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Clock,
  Headphones,
  Server,
  Lock,
  HelpCircle,
  ArrowUpRight,
  Mail,
  CheckCircle2,
  Wallet,
  Sparkles,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#1e3a5f] bg-slate-50 dark:bg-[#070e17] transition-colors duration-200 mt-auto">
      {/* 1. Value Feature Bar */}
      <div className="border-b border-slate-200 dark:border-[#1e3a5f]/60 bg-white dark:bg-[#0d1b2a]/60">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a8b5]/15 border border-[#00a8b5]/30 flex items-center justify-center text-[#06b6d4] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">شحن فوري وتلقائي</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">معالجة فورية خلال أقل من 30 ثانية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">أمان وحماية ذرية</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">محفظة مشفرة وقيود غير قابلة للتلاعب</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">ربط مباشر وسريع</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">اتصال مباشر مع خوادم الألعاب الرسمية</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">دعم محلي سوري 24/7</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">شام كاش، الهرم، والتحويلات البنكية</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Links & Info */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-right">
        {/* Brand & Platform Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] overflow-hidden shadow-sm shrink-0">
              <div className="w-full h-full rounded-[9px] bg-[#070e17] flex items-center justify-center p-1">
                <Image
                  src="/images/logo.png"
                  alt="TSUNAMI Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-slate-900 dark:text-slate-100">
                منصة تسونامي | TSUNAMI
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                tsunami-sy.com
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            المنصة الرقمية الأولى في سوريا والشرق الأوسط لشحن كوينز وماسات الألعاب الرقمية وتطبيقات البث المباشر (سول ستار، سول شيل، ببجي، فري فاير) بأعلى معايير السرعة والأمان المالي.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>تشفير معاملات آمن 100%</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-cyan-500" />
              <span>شحن آلي فوري</span>
            </span>
          </div>
        </div>

        {/* Column 1: Services & Shopping */}
        <div className="space-y-3">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-amber-500" />
            <span>الخدمات والشحن السريع</span>
          </h5>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <li>
              <Link href="/" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                المتجر وقائمة الألعاب
              </Link>
            </li>
            <li>
              <Link href="/deposit" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors flex items-center gap-1.5 py-0.5">
                <span>شحن المحفظة (شام كاش)</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">الأولى</span>
              </Link>
            </li>
            <li>
              <Link href="/wallet?tab=ledger" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                محفظتي وسجل القيود المالية
              </Link>
            </li>
            <li>
              <Link href="/wallet?tab=orders" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                متابعة الفواتير وحالات الطلبات
              </Link>
            </li>
            <li>
              <Link href="/agents" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                شبكة الوكلاء ومراكز التوزيع
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Legal & User Guide */}
        <div className="space-y-3">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>السياسات القانونية والمساعدة</span>
          </h5>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <li>
              <Link href="/terms" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                شروط الاستخدام والخدمة
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                سياسة الخصوصية وحماية البيانات
              </Link>
            </li>
            <li>
              <Link href="/guide" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors flex items-center gap-1.5 py-0.5 font-bold text-slate-900 dark:text-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>دليل المستخدم التفاعلي</span>
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                إجراءات توثيق الهوية (KYC)
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber-600 dark:hover:text-[#06b6d4] transition-colors block py-0.5">
                من نحن (عن تسونامي ورؤيتنا)
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Direct Support */}
        <div className="space-y-3">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-emerald-500" />
            <span>الدعم الفني المباشر</span>
          </h5>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            فريق خدمة العملاء متواجد على مدار الساعة لمساعدتك في عمليات الإيداع وتأكيد الحوالات وحل أي استفسار.
          </p>
          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/963911223344"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                خدمة العملاء عبر واتساب
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            </a>

            <a
              href="https://t.me/tsunami_sy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                قناة وإعلانات تيليجرام
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-500" />
            </a>

            <a
              href="mailto:support@tsunami-sy.com"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                support@tsunami-sy.com
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Accepted Payment Channels Ribbon */}
      <div className="border-t border-slate-200/80 dark:border-[#1e3a5f]/40 py-4 bg-slate-100/60 dark:bg-[#060c14]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <span>طرق الدفع والشحن المعتمدة:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-semibold text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] text-amber-600 dark:text-amber-400 font-bold">
              شام كاش (Sham Cash)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
              سيريتل كاش (Syriatel Cash)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
              الهرم للحوالات
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
              فؤاد للصرافة
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] text-emerald-600 dark:text-emerald-400 font-bold">
              USDT (TRC20)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
              Ziraat Bank
            </span>
          </div>
        </div>
      </div>

      {/* 4. Copyright & Developer Credits Bar */}
      <div className="border-t border-slate-200 dark:border-[#1e3a5f]/60 py-5 bg-white dark:bg-[#050a10]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right pb-20 lg:pb-0">
          <div className="space-y-0.5">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              جميع الحقوق محفوظة © 2026 لمنصة <strong className="text-amber-600 dark:text-[#d4af37]">تسونامي TSUNAMI</strong> (tsunami-sy.com) • All rights reserved
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              بوابة شحن الألعاب والتطبيقات الرقمية المعتمدة | رخصة تجارية رقم #TS-2026
            </p>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span>برمجة وتطوير:</span>
            <a
              href="https://shayasoft.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors flex items-center gap-1"
            >
              <span>شايا سوفت | SHAYA SOFT</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
