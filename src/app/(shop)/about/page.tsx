import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Tag,
} from "lucide-react";
import { getAboutContent } from "@/lib/dynamic-hub";

export const metadata = {
  title: "من نحن | منصة تسونامي الرقمية (TSUNAMI)",
  description:
    "بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية الفورية بأعلى معايير الأمان والسرعة.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getAboutContent();
  const activeValues = content.coreValues?.filter((v) => v.isActive) || [];
  const activeBanners = content.promoBanners?.filter((b) => b.isActive) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 text-right space-y-12">
      {/* Hero Brand Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0d1b2a] to-[#070e17] border border-slate-200 dark:border-[#1e3a5f] p-8 sm:p-12 shadow-2xl text-center">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Circular Arabic Calligraphy Logo Frame */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-500/40 shadow-xl shadow-amber-500/10 bg-gradient-to-br from-amber-500/20 via-slate-900/80 to-[#070e17] p-3 flex items-center justify-center">
            <Image
              src="/images/logo-arabic.png"
              alt="شعار تسونامي بالعربية"
              width={120}
              height={120}
              priority
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {content.heroBadge || "المنصة الرقمية المعتمدة"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {content.heroTitle || "منصة تسونامي الرقمية (TSUNAMI)"}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
              {content.heroSubtitle || "بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية الفورية بأعلى معايير الأمان والسرعة."}
            </p>
          </div>
        </div>
      </div>

      {/* Promo Banners (if any active) */}
      {activeBanners.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Tag className="w-4 h-4" />
            <span>العروض والبانرات الترويجية الحالية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBanners.map((banner) => (
              <div
                key={banner.id}
                className="p-5 rounded-2xl bg-gradient-to-l from-amber-500/15 via-[#0d1b2a] to-[#070e17] border border-amber-500/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  {banner.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#f3e5ab] border border-amber-500/40 inline-block mb-2">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-base font-black text-white">{banner.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{banner.subtitle}</p>
                </div>
                {banner.link && (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06b6d4] hover:text-white transition-colors"
                  >
                    <span>استكشف المزيد</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vision & Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vision Card */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {content.visionTitle || "رؤيتنا"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {content.visionText || "أن نكون المنصة الأكثر موثوقية والأوسع انتشاراً في سوريا والشرق الأوسط، من خلال تقديم بنية دفع وشحن رقمي متكاملة تجمع بين السرعة الفائقة، الأسعار المنافسة، وتوفير كافة حلول التحويل المحلي وعلى رأسها شام كاش (Sham Cash)."}
          </p>
        </div>

        {/* Core Values Card */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#06b6d4]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">القيم الأساسية</h2>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5">
            {activeValues.map((val) => (
              <li key={val.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white">{val.title}: </strong>
                  <span>{val.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">أسرع معالجة طلبات</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">تنفيذ طلبات شحن الألعاب وبرامج البث خلال 30 ثانية أو أقل.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">شبكة وكلاء وموزعين</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">مراكز معتمدة في دمشق، حلب، حمص، إسطنبول، وبغداد.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-[#06b6d4] flex items-center justify-center mx-auto">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">أمان وموثوقية</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">قيود محاسبية مشفرة ونظام تدقيق مالي يضمن حقوق العملاء.</p>
        </div>
      </div>

      {/* Accreditation Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <span className="text-xs font-bold text-amber-500 block uppercase tracking-wider">
            اعتماد التطوير والتشغيل
          </span>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            تم بناء المنظمة وتطوير أنظمتها وتشغيل بنيتها السحابية بواسطة:
          </p>
        </div>

        <a
          href="https://shayasoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 shrink-0"
        >
          <span>شايا سوفت | SHAYA SOFT</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Navigation Return Button */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors border border-slate-200 dark:border-[#1e3a5f]"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمتجر الرئيسي</span>
        </Link>
      </div>
    </div>
  );
}
