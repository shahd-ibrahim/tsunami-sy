import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Server,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "سياسة الخصوصية وأمان البيانات | منصة تسونامي TSUNAMI",
  description:
    "تعرف على سياسة الخصوصية المعتمدة في منصة تسونامي، وكيفية حماية بياناتك الشخصية ومحفظتك الرقمية ووثائق التوثيق (KYC) بأعلى معايير التشفير.",
};

export default function PrivacyPolicyPage() {
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
          آخر تحديث: أكتوبر 2026
        </span>
      </div>

      {/* Hero Header */}
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-[#d4af37]">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>معايير أمان معتمدة وتشفير شامل</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            سياسة الخصوصية وأمان البيانات (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
            في منصة <strong>تسونامي (TSUNAMI)</strong>، نضع حماية بياناتك وسلامة محفظتك الرقمية على رأس أولوياتنا. توضح هذه الاتفاقية بشفافية كيفية جمع واستخدام وحماية معلوماتك الشخصية وسجلاتك المالية.
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-[#1e3a5f]">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <Lock className="w-5 h-5 mx-auto text-amber-600 dark:text-[#d4af37] mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">تشفير BCrypt و JWT</span>
            <span className="text-[9px] text-slate-500 block">حماية كلمات المرور</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <Server className="w-5 h-5 mx-auto text-sky-600 dark:text-[#06b6d4] mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">قيود محاسبية ذرية</span>
            <span className="text-[9px] text-slate-500 block">عدم ضياع أي سنت</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <UserCheck className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">سرية وثائق الهوية</span>
            <span className="text-[9px] text-slate-500 block">امتثال أمني صارم</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-center">
            <Eye className="w-5 h-5 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">انعدام التتبع التجاري</span>
            <span className="text-[9px] text-slate-500 block">لا نبيع بياناتك مطلقاً</span>
          </div>
        </div>
      </div>

      {/* Main Privacy Clauses */}
      <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Clause 1: Data Collection */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 dark:text-[#d4af37] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>البيانات التي نقوم بجمعها (Data Collection)</span>
          </h2>
          <p>
            نقوم بجمع الحد الأدنى من البيانات الضرورية لتشغيل حسابك وتقديم خدمات الشحن الرقمي بفاعلية:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>بيانات الحساب الأساسية:</strong> البريد الإلكتروني، الاسم الشخصي، رقم الهاتف، والدولة المقيم بها.
            </li>
            <li>
              <strong>المعرّف الرقمي الموحد (#1004):</strong> معرّف فريد يُنشأ تلقائياً لكل مستخدم لتسهيل الإيداع اليدوي والتواصل مع فريق الدعم دون الحاجة لكشف البريد الإلكتروني.
            </li>
            <li>
              <strong>بيانات العمليات والطلبات:</strong> رقم اللاعب (Player ID / UID)، اسم الحساب داخل اللعبة أو تطبيق المحادثة، والمبالغ المشحونة لضمان وصول الرصيد للشخص المستهدف بدقة.
            </li>
            <li>
              <strong>معلومات الأمان التقنية:</strong> عنوان بروتوكول الإنترنت (IP Address)، نوع المتصفح، وسجلات توقيت تسجيل الدخول لمكافحة محاولات الدخول غير المصرح بها والاحتيال.
            </li>
          </ul>
        </section>

        {/* Clause 2: Security & Ledger */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-700 dark:text-[#06b6d4] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>أمان المحفظة وسجل الحركات المحاسبية (Financial & Ledger Security)</span>
          </h2>
          <p>
            تعتمد منصة تسونامي بنية محاسبية متطورة شبيهة بالأنظمة البنكية (Atomic Double-Entry Ledger) لحماية أموالك:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>تشفير الحركات المالية:</strong> ترتبط كل عملية إيداع أو شراء بقيد غير قابل للتعديل يتضمن الرصيد قبل الحركة، الرصيد بعدها، ورقم المرجع الفريد.
            </li>
            <li>
              <strong>حماية إيصالات الدفع:</strong> يتم حفظ صور إشعارات التحويل (شام كاش، الهرم، أو التحويلات البنكية) على سيرفرات مشفرة وتُستخدم فقط للتحقق من وصول المبلغ وإضافته لمحفظتك.
            </li>
            <li>
              <strong>كلمات المرور:</strong> تُشفر كلمات المرور باستخدام خوارزمية <code>BCrypt</code> بتمليح عشوائي قوي (Salting)، ولا يمكن لأي موظف أو مشرف الاطلاع على كلمة مرورك الأصلية.
            </li>
          </ul>
        </section>

        {/* Clause 3: KYC Verification */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>إجراءات توثيق الهوية (KYC Verification Protocols)</span>
          </h2>
          <p>
            تتيح منصة تسونامي للعملاء والموزعين رفع وثائق إثبات الهوية (البطاقة الشخصية أو جواز السفر) لرفع حدود الإيداع وتفعيل أسعار الموزعين:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>الغرض الحصري:</strong> تُجمع بيانات الهوية فقط للتحقق من هوية صاحب الحساب ومنع استخدام المنصة في أنشطة مشبوهة أو غسيل أموال.
            </li>
            <li>
              <strong>المعالجة والذكاء الاصطناعي:</strong> تتم مطابقة الاسم والرقم الوطني آلياً عبر محرك التعرف الضوئي (OCR)، مع مراجعة بشرية مقيدة بمشرفي الأمان فقط.
            </li>
            <li>
              <strong>السرية التامة:</strong> لا تتم مشاركة مستندات الهوية مع أي جهات تسويقية أو تجارية خارجية تحت أي ظرف كان.
            </li>
          </ul>
        </section>

        {/* Clause 4: Cookies & Storage */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>ملفات تعريف الارتباط وتخزين الجلسات (Cookies & Session Storage)</span>
          </h2>
          <p>
            نستخدم ملفات تعريف الارتباط الأساسية فقط لضمان عمل الموقع بكفاءة:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>كوكيز المصادقة (Session Token):</strong> ملفات مشفرة ومحمية بخاصية <code>HttpOnly</code> لحفظ حالة تسجيل الدخول ومنع هجمات Cross-Site Scripting (XSS).
            </li>
            <li>
              <strong>تفضيلات الواجهة:</strong> حفظ الوضع اللوني المفضل لديك (الوضع الداكن أو الوضع الفاتح) لضمان تجربة تصفح مريحة.
            </li>
          </ul>
        </section>

        {/* Clause 5: User Rights */}
        <section className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-sm space-y-3 transition-colors">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>حقوق المستخدم والتحكم في البيانات (Your Rights)</span>
          </h2>
          <p>
            تمنحك منصة تسونامي التحكم الكامل في معلوماتك الشخصية:
          </p>
          <ul className="list-disc list-inside space-y-2 mr-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>حق الوصول والتعديل:</strong> يمكنك مراجعة وتعديل رقم هاتفك، دولتك، وكلمة مرورك في أي وقت عبر صفحة <Link href="/profile" className="text-amber-600 dark:text-[#d4af37] font-bold underline">الملف الشخصي</Link>.
            </li>
            <li>
              <strong>تجميد أو إغلاق الحساب:</strong> يحق لك طلب إغلاق حسابك نهائياً وحذف السجلات الشخصية بعد تسوية أي أرصدة قائمة عبر التواصل مع الدعم الفني.
            </li>
          </ul>
        </section>

        {/* Contact Support Box */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">هل لديك استفسار حول خصوصية بياناتك؟</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              فريق حماية البيانات وأمن المعلومات متواجد لمساعدتك والإجابة على أي تساؤل.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/963911223344"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
            >
              واتساب الدعم
            </a>
            <Link
              href="/guide"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] border border-slate-300 dark:border-[#1e3a5f] text-slate-800 dark:text-slate-200 text-xs font-bold transition-all whitespace-nowrap"
            >
              دليل الاستخدام
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
