import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Scale,
  RefreshCw,
  Ban,
  Gamepad2,
  CreditCard,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "شروط الاستخدام والاتفاقية القانونية | منصة تسونامي TSUNAMI",
  description:
    "شروط وأحكام استخدام منصة تسونامي للشحن الرقمي والألعاب، وسياسات الإيداع، مسؤولية بيانات اللاعبين UID، وحظر الأنشطة المشبوهة.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-right transition-colors duration-200">
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
          وثيقة سارية: 2026
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-700 dark:text-[#06b6d4]">
          <Scale className="w-7 h-7" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>اتفاقية تقديم الخدمات والتجارة الرقمية المعتمدة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            شروط وأحكام الاستخدام (Terms of Service)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
            مرحباً بك في منصة <strong>تسونامي (tsunami-sy.com)</strong>. يُعد استخدامك للموقع، إنشاء المحفظة، أو تنفيذ أي عملية شحن إقراراً منك بالموافقة الكاملة على الشروط والبنود القانونية الواردة أدناه.
          </p>
        </div>

        {/* Quick Highlights Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <Gamepad2 className="w-5 h-5 mx-auto text-amber-600 dark:text-[#d4af37] mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">شحن رقمي وسيط</span>
            <span className="text-[9px] text-slate-500 block">ألعاب وتطبيقات معتمدة</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <CreditCard className="w-5 h-5 mx-auto text-sky-600 dark:text-[#06b6d4] mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">شام كاش وبنوك</span>
            <span className="text-[9px] text-slate-500 block">إيداع موثق ومطابق</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <UserCheck className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">دقة معرّف اللاعب</span>
            <span className="text-[9px] text-slate-500 block">فحص الاسم المستعار</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <Ban className="w-5 h-5 mx-auto text-rose-600 dark:text-rose-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">حظر التزوير</span>
            <span className="text-[9px] text-slate-500 block">تجميد فوري للمخالفين</span>
          </div>
        </div>
      </div>

      {/* Main Legal Clauses */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Clause 1: Nature of Services */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-[#d4af37] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>طبيعة الخدمات المقدمة (Nature of Services)</span>
          </h2>
          <p>
            منصة <strong>تسونامي (TSUNAMI)</strong> هي منصة تجارة رقمية ووسيط إلكتروني متخصص في تزويد المستخدمين والموزعين بخدمات شحن الألعاب عبر الإنترنت، كوينز وماسات تطبيقات البث والتواصل الصوتي (مثل SoulStar, SoulChill, Poppo Live, PUBG Mobile)، والبطاقات الرقمية.
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              المنصة ليست ناشراً للألعاب ولا مطوراً للتطبيقات الخارجية، بل تعمل كوسيط شحن وتوزيع رسمي عبر واجهات الربط المباشرة (Direct Distributor APIs).
            </li>
            <li>
              تخضع المنتجات لأسعار الصرف المتغيرة للعملات ولشروط الناشرين الرسميين لكل تطبيق.
            </li>
          </ul>
        </section>

        {/* Clause 2: Deposit Policy */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-700 dark:text-[#06b6d4] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>سياسة الإيداع والرصيد (Deposit & Wallet Balance Policy)</span>
          </h2>
          <p>
            تعتمد المنصة بوابة <Link href="/deposit" className="text-amber-600 dark:text-[#d4af37] font-bold underline">الإيداع الموحدة</Link> لشحن رصيد المحفظة عبر وسائل الدفع المعتمدة (شام كاش، شركة الهرم، الحسابات البنكية التركية والسورية، والعملات الرقمية USDT):
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>صحة إشعار الدفع:</strong> يلتزم العميل برفع صورة واضحة لإشعار التحويل البنكي أو الكاش متضمنة رقم العملية (Reference Number) واسم المحوّل والمبلغ المطابق تماماً.
            </li>
            <li>
              <strong>إيداع شام كاش (#1):</strong> التحويل عبر شام كاش يتطلب كتابة اسم العميل ورقم هاتفه في وصف الحوالة لتسريع المطابقة والاعتماد الآلي.
            </li>
            <li>
              <strong>طبيعة الرصيد:</strong> الرصيد المودع في المحفظة مخصص حصرياً لتنفيذ المشتريات والطلبات الرقمية داخل المتجر، ولا يُعتبر حساباً بنكياً ادخارياً.
            </li>
          </ul>
        </section>

        {/* Clause 3: Player ID / UID Accuracy */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>دقة بيانات الشحن ومسؤولية معرّف اللاعب (Player ID / UID Responsibility)</span>
          </h2>
          <p>
            نظراً لأن أنظمة الشحن تعمل آلياً وفورياً عبر السيرفرات الرسمية، يُعد العميل المسؤول الأول والأخير عن صحة البيانات المدخلة:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>التحقق الذكي من الاسم المستعار:</strong> توفر المنصة ميزة التحقق من الاسم المستعار (Player Nickname Check) قبل خصم الرصيد. يجب على العميل التأكد من ظهور اسمه الصحيح قبل النقر على تأكيد الشراء.
            </li>
            <li>
              <strong>الأخطاء في الـ UID:</strong> في حال إدخال معرّف خاطئ وتم تنفيذ الشحن وتسليمه بنجاح من قِبل خادم اللعبة أو التطبيق الخارجي، <strong>لا يمكن للمنصة إلغاء العملية أو استرداد الرصيد مطلقاً</strong> لعدم إمكانية سحب الكوينز أو الشدات بعد استلامها داخل حساب اللعبة.
            </li>
          </ul>
        </section>

        {/* Clause 4: Fraud & Abuse */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>مكافحة الاحتيال وتجميد الحسابات المخالفة (Fraud Prevention & Account Freezing)</span>
          </h2>
          <p>
            تطبق منصة تسونامي سياسة صارمة وخالية من التهاون تجاه أي سلوك احتيالي لحماية المنظومة وجميع العملاء:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>الإيصالات المزورة:</strong> محاولة رفع إيصالات تحويل غير حقيقية أو معدلة ببرامج التصميم أو مكررة تؤدي فورياً إلى <strong>تجميد الحساب وحظر الـ IP وإلغاء أي رصيد قائم</strong> دون إنذار سابق.
            </li>
            <li>
              <strong>توثيق الهوية الإلزامي (KYC):</strong> تحتفظ إدارة المنصة بحق طلب توثيق الهوية الشخصية لأي حساب تظهر عليه حركات مالية غير اعتيادية أو طلبات بمبالغ كبيرة قبل تنفيذها.
            </li>
          </ul>
        </section>

        {/* Clause 5: Refund Policy */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>سياسة الإلغاء والاسترداد (Refund & Cancellation Policy)</span>
          </h2>
          <p>
            تخضع السلع الرقمية لمعايير استهلاك فورية تختلف عن السلع الملموسة:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>الطلبات المكتملة (COMPLETED):</strong> لا يُقبل استرجاع أو استبدال أي طلب تم تنفيذه وتسليمه بنجاح.
            </li>
            <li>
              <strong>الطلبات الفاشلة (FAILED):</strong> في حال حدوث عطل فني في خادم اللعبة أو رفض المزود الخارجي للعملية، <strong>يقوم النظام تلقائياً بإعادة كامل المبلغ لمحفظتك</strong> فوراً لتتمكن من إعادة المحاولة.
            </li>
            <li>
              <strong>الطلبات المعلقة في الطابور (PENDING):</strong> يمكن إلغاء الطلب واسترجاع الرصيد فقط في حال لم يبدأ السيرفر بمعالجته بعد، وذلك بالتواصل مع المشرف المسؤول.
            </li>
          </ul>
        </section>

        {/* Footer Navigation CTA */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">هل تحتاج لتوضيح إضافي حول الشروط؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              يمكنك الاطلاع على دليل الاستخدام التفاعلي أو مراسلة الدعم الفني مباشرة.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/guide"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all whitespace-nowrap"
            >
              دليل المستخدم التفاعلي
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] border border-slate-300 dark:border-[#1e3a5f] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all whitespace-nowrap"
            >
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
