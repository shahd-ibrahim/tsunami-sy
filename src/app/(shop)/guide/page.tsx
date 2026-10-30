"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  UserPlus,
  Wallet,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Copy,
  Plus,
  Gamepad2,
  Tv,
  Coins,
  Clock,
  Sparkles,
  Bot,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface GuideStep {
  stepNumber: string;
  title: string;
  shortDesc: string;
  icon: any;
  color: string;
  badge: string;
  actionLink?: { href: string; label: string };
  details: {
    heading: string;
    description: string;
    tips: string[];
    mockPreview?: string;
  };
}

const GUIDE_STEPS: GuideStep[] = [
  {
    stepNumber: "01",
    title: "إنشاء الحساب والحصول على المعرّف الرقمي (#1004)",
    shortDesc: "تسجيل فوري بضغطة زر واحدة عبر Google أو البريد الإلكتروني، وتوليد معرّفك الرقمي الفريد.",
    icon: UserPlus,
    color: "from-sky-500 to-blue-600",
    badge: "الخطوة الأولى",
    actionLink: { href: "/register", label: "إنشاء حساب الآن" },
    details: {
      heading: "كيف تبدأ رحلتك في تسونامي؟",
      description:
        "بمجرد دخولك للمنصة، يمكنك التسجيل فورياً باستخدام حساب Google بنقرة واحدة، أو عبر كتابة بريدك الإلكتروني وكلمة مرور قوية.",
      tips: [
        "يتم إنشاء محفظة إلكترونية رقمية آمنة فور إنشاء حسابك.",
        "ستحصل تلقائياً على معرّف حساب رقمي رباعي (مثل #1004) يظهر بجانب اسمك.",
        "احتفظ بمعرّفك الرقمي دائماً، فهو يتيح لك شحن محفظتك نقداً عبر وكلائنا المعتمدين دون الحاجة لكشف بريدك الشخصي.",
      ],
    },
  },
  {
    stepNumber: "02",
    title: "شحن رصيد المحفظة (طريقة شام كاش الأولى)",
    shortDesc: "إيداع الرصيد بالدولار عبر شام كاش، الحوالات المحلية، الحسابات البنكية، أو العملات الرقمية USDT.",
    icon: Wallet,
    color: "from-amber-500 to-orange-600",
    badge: "الخيار الأول المعتمد",
    actionLink: { href: "/deposit", label: "الانتقال لبوابة الإيداع" },
    details: {
      heading: "طريقة شحن الرصيد المعتمدة والآمنة:",
      description:
        "توجه إلى صفحة 'إيداع وشحن الرصيد'. تعتبر خدمة شام كاش (Sham Cash) الخيار الأسرع والأول داخل سوريا لشحن الرصيد بلحظات معدودة.",
      tips: [
        "انسخ رقم حساب شام كاش المعتمد الظاهر في بوابة الإيداع: SHAM-99201458.",
        "قم بتحويل المبلغ المطلوب من تطبيق شام كاش، واكتب اسمك ورقم هاتفك في ملاحظات الحوالة.",
        "أدخل رقم إشعار التحويل وأرفق صورة الإيصال في نموذج الإيداع وانقر 'تأكيد الإيداع'.",
        "يقوم موظف الصندوق باعتماد الرصيد ومطابقته فورياً لتظهر القيمة مباشرة في رصيدك المتاح.",
      ],
    },
  },
  {
    stepNumber: "03",
    title: "شحن الألعاب وتطبيقات الدردشة (بحرية تامة دون قيود)",
    shortDesc: "أدخل الـ UID وتحقق من الاسم المستعار، واختر أي كمية كوينز أو شدات تناسب ميزانيتك.",
    icon: Gamepad2,
    color: "from-emerald-500 to-teal-600",
    badge: "شحن ذكي وفوري",
    actionLink: { href: "/", label: "تصفح قائمة الألعاب" },
    details: {
      heading: "حرية شحن غير مسبوقة وسرعة خيالية:",
      description:
        "اختر لعبتك أو تطبيقك المفضل (مثل SoulStar, SoulChill, PUBG Mobile, Poppo Live). تتيح لك تسونامي كتابة أي كمية تريدها بدقة، أو اختيار الباقات الجاهزة.",
      tips: [
        "أدخل معرّف اللاعب (Player ID / UID) الخاص بحسابك في اللعبة.",
        "سيقوم محرك الفحص الذكي بإظهار اسمك المستعار (Player Nickname) تلقائياً للتأكد قبل الدفع.",
        "اختر الكمية التي تريدها وسيقوم النظام باحتساب السعر فورياً بالدولار والليرة.",
        "انقر على 'شحن فوري' وسيتم إرسال الرصيد لحسابك في السيرفر خلال أقل من 30 ثانية.",
      ],
    },
  },
  {
    stepNumber: "04",
    title: "متابعة الطلبات وتوثيق الحساب (KYC)",
    shortDesc: "استعراض سجل الفواتير لحظياً، ورفع وثائق الهوية للحصول على شارة الحساب الموثوق وأسعار الموزعين.",
    icon: ShieldCheck,
    color: "from-purple-500 to-indigo-600",
    badge: "صلاحيات VIP",
    actionLink: { href: "/profile", label: "توثيق حسابك في الملف الشخصي" },
    details: {
      heading: "الأمان العالي والارتقاء إلى فئة الموزعين:",
      description:
        "يمكنك متابعة حالة كل عملية شحن من صفحة 'محفظتي وسجل الحركات'. كما يمكنك فتح آفاق أوسع عبر توثيق هويتك الوطنية.",
      tips: [
        "سجل الطلبات يوضح حالة كل طلب (مكتمل ومسلّم ✅، قيد المعالجة ⏳، أو فاشل ومسترجع ❌).",
        "من صفحة الملف الشخصي، انقر على 'بدء رفع مستندات التوثيق (KYC)' وارفع صورة بطاقتك الشخصية.",
        "يتم فحص الهوية بالذكاء الاصطناعي وبوت المشرفين على تيليجرام لترقية حسابك فورياً.",
        "الحسابات الموثقة تحصل على حدود إيداع غير محدودة وأسعار جملة مخفضة للموزعين.",
      ],
    },
  },
];

const FAQS = [
  {
    q: "كم يستغرق وصول الرصيد بعد إرسال إشعار شام كاش؟",
    a: "يتم تدقيق واعتماد إشعارات شام كاش تلقائياً أو عبر موظف الصندوق في غضون 2 إلى 5 دقائق كحد أقصى على مدار الساعة.",
  },
  {
    q: "ماذا يحدث إذا كتبت معرّف لاعب (UID) خاطئ؟",
    a: "توفر المنصة فحصاً للاسم المستعار قبل الشحن. إذا قمت بتأكيد الشحن إلى معرّف خاطئ وتم تسليمه من سيرفر اللعبة، لا يمكن استرجاعه. لذا احرص دائماً على مطابقة الاسم المستعار الظاهر قبل الضغط على تأكيد.",
  },
  {
    q: "ما هي شارة الحساب الموثوق (KYC) وما فائدتها؟",
    a: "توثيق الهوية يضمن حماية حسابك من السرقة، ويتيح لك تحويل حسابك إلى فئة 'موزع VIP' لشراء الكوينز والشدات بأسعار الجملة المخفضة وإجراء إيداعات بمبالغ كبرى.",
  },
  {
    q: "هل يمكنني الدفع نقداً باليد دون تطبيقات بنكية؟",
    a: "نعم بكل تأكيد! تملك منصة تسونامي شبكة واسعة من الوكلاء المعتمدين والمكاتب في دمشق، حلب، وكافة المحافظات السورية. يمكنك التوجه للوكيل وإعطاؤه معرّفك الرقمي (#1004) لتسليم الكاش وشحن محفظتك فوراً.",
  },
];

export default function GuideHelpPage() {
  const [openStepIndex, setOpenStepIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleStep = (index: number) => {
    setOpenStepIndex(openStepIndex === index ? null : index);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-right transition-colors duration-200">
      {/* Breadcrumb / Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-[#d4af37] transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمتجر الرئيسي</span>
        </Link>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-[#13253a] px-3 py-1 rounded-full border border-slate-200 dark:border-[#1e3a5f]">
          دليل الترحيب والتشغيل الموحد
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#d4af37] p-[1.5px] shadow-sm flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-[#070e17] flex items-center justify-center text-amber-400">
            <HelpCircle className="w-6 h-6" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-sky-700 dark:text-[#06b6d4] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ابدأ في أقل من دقيقتين</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            دليل المستخدم ومركز المساعدة (User Guide & Onboarding)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
            دليلك التفاعلي الشامل لتعلم كيفية شحن محفظتك عبر <strong>شام كاش</strong>، شحن ألعابك وتطبيقاتك بلمح البصر، وتوثيق حسابك للاستفادة من أسعار الجملة.
          </p>
        </div>
      </div>

      {/* Step by Step Interactive Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>خطوات الاستخدام الـ 4 الأساسية</span>
          </h2>
          <span className="text-xs text-slate-500">انقر على أي خطوة للتفاصيل</span>
        </div>

        <div className="space-y-3">
          {GUIDE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isOpen = openStepIndex === idx;

            return (
              <div
                key={step.stepNumber}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white dark:bg-[#0d1b2a] border-amber-500/50 dark:border-[#d4af37]/60 shadow-md"
                    : "bg-white dark:bg-[#0d1b2a] border-slate-200 dark:border-[#1e3a5f] hover:border-slate-300 dark:hover:border-[#1e3a5f]/90"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-center shrink-0">
                      <span className="font-mono font-black text-amber-600 dark:text-[#d4af37] text-sm">
                        {step.stepNumber}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {step.title}
                        </span>
                        <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1e3a5f]">
                          {step.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {step.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#070e17] flex items-center justify-center text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isOpen && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-[#1e3a5f]/60 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {step.details.heading}
                    </h3>
                    <p>{step.details.description}</p>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2">
                      <span className="text-xs font-bold text-amber-700 dark:text-[#d4af37] block">
                        نصائح وإرشادات هامة:
                      </span>
                      <ul className="space-y-1.5 mr-2">
                        {step.details.tips.map((tip, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {step.actionLink && (
                      <div className="pt-2 flex justify-end">
                        <Link
                          href={step.actionLink.href}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
                        >
                          <span>{step.actionLink.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-500" />
          <span>الأسئلة الشائعة حول الشحن والخدمات</span>
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isFaqOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-[#1e3a5f] bg-white dark:bg-[#0d1b2a] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-right cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#070e17] flex items-center justify-center text-slate-400 shrink-0 mr-3">
                    {isFaqOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isFaqOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-[#1e3a5f]/60 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Need More Assistance Banner */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">هل تواجه أي صعوبة أو تحتاج لمساعدة فورية؟</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            فريق خدمة العملاء متصل وجاهز للرد على استفسارك ومساعدتك في تنفيذ طلبك خطوة بخطوة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/963911223344"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
          >
            تحدث مع خدمة العملاء
          </a>
          <Link
            href="/terms"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] border border-slate-300 dark:border-[#1e3a5f] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all whitespace-nowrap"
          >
            شروط الاستخدام
          </Link>
        </div>
      </div>
    </div>
  );
}
