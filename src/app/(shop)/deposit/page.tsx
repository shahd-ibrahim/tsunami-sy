"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUserRole } from "@/components/UserRoleContext";
import {
  Wallet,
  Plus,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Building2,
  Tv,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  category: "local" | "crypto" | "bank" | "salary";
  badge: string;
  badgeColor?: string;
  icon: any;
  targetAccountTitle: string;
  targetAccount: string;
  recipientName?: string;
  network?: string;
  instructions: string[];
  suggestedCurrencies: string[];
  qrCodeUrl?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  // 1. Local Cash & Transfers (شام كاش في الصدارة)
  {
    id: "sham-cash",
    name: "شام كاش (Sham Cash)",
    category: "local",
    badge: "فوري (#1)",
    badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40",
    icon: Smartphone,
    targetAccountTitle: "حساب منصة تسونامي (شام كاش)",
    targetAccount: "SHAM-99201458",
    recipientName: "حساب منصة تسونامي (شام كاش)",
    instructions: [
      "حوّل المبلغ ثم أدخل تفاصيل الإشعار لتأكيد رصيدك",
    ],
    suggestedCurrencies: ["SYP", "USD"],
  },
  {
    id: "alharam-exchange",
    name: "شركة الهرم للحوالات (Al-Haram)",
    category: "local",
    badge: "كافة المحافظات",
    badgeColor: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
    icon: Building2,
    targetAccountTitle: "بيانات المستلم في الهرم",
    targetAccount: "دمشق - فرع الميدان / أحمد المحمد",
    recipientName: "أحمد المحمد (هاتف: 0911223344)",
    instructions: [
      "توجه لأقرب فرع لشركة الهرم وأرسل الحوالة بالاسم والرقم الموضحين.",
      "احرص على أخذ إيصال الإرسال متضمناً رقم الحوالة المكون من 7-9 أرقام.",
      "أدخل رقم الحوالة وصورة الإشعار هنا وسيتم إيداع الرصيد فوراً.",
    ],
    suggestedCurrencies: ["SYP", "USD"],
  },
  {
    id: "hand-delivery",
    name: "تسليم باليد / مكاتب معتمدة",
    category: "local",
    badge: "كاش مباشر",
    icon: ShieldCheck,
    targetAccountTitle: "المكتب الرئيسي والمراكز",
    targetAccount: "دمشق - الميدان / حلب - الجميلية",
    recipientName: "مراكز تسونامي المعتمدة",
    instructions: [
      "يمكنك التوجه مباشرة إلى أي من مراكز وكلائنا المعتمدين لتسليم الكاش باليد.",
      "أظهر معرّف حسابك الرقمي (#1042) لمسؤول الصندوق ليتم الإيداع بلحظات.",
      "أو تواصل مع الوكيل المباشر عبر صفحة الوكلاء.",
    ],
    suggestedCurrencies: ["USD", "SYP", "TRY"],
  },

  // 2. Crypto (USDT)
  {
    id: "usdt-trc20",
    name: "USDT (شبكة TRC-20)",
    category: "crypto",
    badge: "الأكثر استخداماً",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: QrCode,
    targetAccountTitle: "عنوان محفظة USDT (TRC-20)",
    targetAccount: "TJY7zV8Z4xN2m9B8qW3kF1vL6pT0sR5aBc",
    network: "TRON (TRC-20)",
    instructions: [
      "أرسل عملة USDT فقط عبر شبكة TRON (TRC20) إلى العنوان المحدد.",
      "إرسال أي عملة أخرى أو استخدام شبكة مختلفة قد يؤدي لفقدان الأموال.",
      "أدخل هاش العملية (TxID) وصورة التحويل لتأكيد الشحن فورياً.",
    ],
    suggestedCurrencies: ["USD"],
  },
  {
    id: "usdt-bep20",
    name: "USDT (شبكة BEP-20)",
    category: "crypto",
    badge: "رسوم منخفضة",
    icon: QrCode,
    targetAccountTitle: "عنوان محفظة USDT (BEP-20)",
    targetAccount: "0x71C836e2fC54D1217eF186D9B4A091aD16584c31",
    network: "Binance Smart Chain (BSC / BEP-20)",
    instructions: [
      "أرسل عملة USDT عبر شبكة BSC (BEP-20) فقط.",
      "التحويل سريع ورسوم الشبكة أقل من نصف دولار.",
      "أرفق رقم العملية TxHash ليتم المطابقة التلقائية.",
    ],
    suggestedCurrencies: ["USD"],
  },

  // 3. Bank Transfers
  {
    id: "ziraat-bank",
    name: "بنك زراعات التركي (Ziraat Bankası)",
    category: "bank",
    badge: "تحويل فوري (FAST)",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: Building2,
    targetAccountTitle: "رقم الآيبان (IBAN)",
    targetAccount: "TR42 0001 0090 1234 5678 5001",
    recipientName: "TSUNAMI TICARET LTD",
    instructions: [
      "قم بالتحويل عبر تطبيق Ziraat Mobil باستخدام خاصية FAST.",
      "اكتب في خانة التوضيح (Açıklama) معرّف حسابك.",
      "أرفق إشعار الديكونت (Dekont) لإيداع الرصيد.",
    ],
    suggestedCurrencies: ["TRY", "USD"],
  },
  {
    id: "vakif-bank",
    name: "بنك واكف (VakıfBank)",
    category: "bank",
    badge: "تركيا",
    icon: Building2,
    targetAccountTitle: "رقم الآيبان (IBAN)",
    targetAccount: "TR89 0001 5001 5800 7300 1234 99",
    recipientName: "TSUNAMI DIJITAL HIZMETLER",
    instructions: [
      "التحويل متاح على مدار 24 ساعة عبر ميزة Kolay Adres أو IBAN.",
      "أدخل كود الحساب في الشرح وأرفق الإيصال.",
    ],
    suggestedCurrencies: ["TRY", "USD"],
  },
  {
    id: "papara",
    name: "تطبيق بابارا (Papara)",
    category: "bank",
    badge: "لحظي مجاني",
    icon: Smartphone,
    targetAccountTitle: "رقم حساب Papara No",
    targetAccount: "1928374650",
    recipientName: "Tsunami Store",
    instructions: [
      "أرسل المبلغ من حساب بابارا الخاص بك إلى الرقم أعلاه.",
      "اكتب معرّف حسابك في خانة الملاحظات وأرسل إشعار التحويل.",
    ],
    suggestedCurrencies: ["TRY"],
  },
  {
    id: "baraka-bank",
    name: "بنك البركة وسوريا الدولي",
    category: "bank",
    badge: "بنوك سورية",
    icon: Building2,
    targetAccountTitle: "رقم الحساب البنكي السوري",
    targetAccount: "0102-394857-001",
    recipientName: "شركة تسونامي للخدمات البرمجية",
    instructions: [
      "تحويل بنكي مباشر داخل سوريا أو عبر تطبيق بنك البركة.",
      "أرفق إشعار التحويل البنكي الرسمي.",
    ],
    suggestedCurrencies: ["SYP", "USD"],
  },

  // 4. App Salaries & Payouts (تفريغ رواتب برامج الدردشة)
  {
    id: "soulstar-salary",
    name: "تفريغ راتب سول ستار (SoulStar)",
    category: "salary",
    badge: "أعلى سعر صرف",
    badgeColor: "bg-gradient-to-r from-[#d4af37]/20 to-[#aa820a]/20 text-[#f3e5ab] border-[#d4af37]/40",
    icon: Tv,
    targetAccountTitle: "معرّف وكالة الشحن (Agency ID)",
    targetAccount: "SOULSTAR_AGENCY_9921",
    recipientName: "وكالة TSUNAMI المعتمدة",
    instructions: [
      "قم بتحويل الكوينز أو سحب راتب الوكالة إلى حساب الوكالة أعلاه داخل تطبيق SoulStar.",
      "أدخل معرّف حسابك (UID) والكمية المحولة في النموذج.",
      "يتم صرف الراتب فورياً وإيداع الرصيد بالدولار داخل محفظتك.",
    ],
    suggestedCurrencies: ["USD"],
  },
  {
    id: "soulchill-salary",
    name: "تفريغ راتب سول شيل (SoulChill)",
    category: "salary",
    badge: "تسليم فوري",
    badgeColor: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30",
    icon: Tv,
    targetAccountTitle: "معرّف وكيل سول شيل الرسمي",
    targetAccount: "SOULCHILL_VIP_7710",
    recipientName: "Tsunami Guild Official",
    instructions: [
      "حول الماسات أو أرباح الغرف لحساب الوكالة الرسمي داخل SoulChill.",
      "التقط لقطة شاشة من سجل التحويلات وأرفقها لتأكيد استلام الراتب فوراً.",
    ],
    suggestedCurrencies: ["USD"],
  },
  {
    id: "poppo-salary",
    name: "تفريغ نقاط بوبو لايف (Poppo Live)",
    category: "salary",
    badge: "كاش آوت فوري",
    icon: Tv,
    targetAccountTitle: "معرّف وكيل Poppo النقدي",
    targetAccount: "POPPO_AGENT_33190",
    recipientName: "Tsunami Live Agency",
    instructions: [
      "أرسل طلب السحب عبر معرّف الوكالة أو حول النقاط بالاتفاق.",
      "سيتم تحويل القيمة فوراً إلى رصيد محفظتك الرقمية.",
    ],
    suggestedCurrencies: ["USD"],
  },
];

export default function DepositPortalPage() {
  const { currentUser, isVerified, numericId, walletBalance, refreshWallet } = useUserRole();

  const [methodsList, setMethodsList] = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [activeTab, setActiveTab] = useState<"local" | "crypto" | "bank" | "salary">("local");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(PAYMENT_METHODS[0]);
  const [copiedText, setCopiedText] = useState(false);

  // Dynamic Fetch of Bank Accounts and Channels
  useEffect(() => {
    async function loadDynamicDepositOptions() {
      try {
        const [banksRes, channelsRes] = await Promise.all([
          fetch("/api/admin/banks?activeOnly=true"),
          fetch("/api/admin/payment-channels?activeOnly=true"),
        ]);

        const [banksData, channelsData] = await Promise.all([
          banksRes.json(),
          channelsRes.json(),
        ]);

        let dynamicBanks: PaymentMethod[] = [];
        if (banksData.success && banksData.banks && banksData.banks.length > 0) {
          dynamicBanks = banksData.banks.map((b: any) => ({
            id: `dyn-bank-${b.id}`,
            name: `${b.bankName} (${b.currency})`,
            category: "bank" as const,
            badge: b.currency === "TRY" ? "تحويل فوري (FAST)" : "إيداع بنكي معتمد",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            icon: Building2,
            targetAccountTitle: `رقم الآيبان الدولي (${b.currency})`,
            targetAccount: b.iban,
            recipientName: b.accountHolder,
            instructions: [
              `قم بالتحويل البنكي إلى الآيبان الموضح لصالح ${b.accountHolder}.`,
              b.notes || "اكتب معرّف حسابك الرقمي في خانة الشرح أو التوضيح (Açıklama).",
              `الحد الأدنى للإيداع هو ${b.minDeposit} ${b.currency}.`,
            ],
            suggestedCurrencies: [b.currency, "USD"],
          }));
        }

        let dynamicChannels: PaymentMethod[] = [];
        if (channelsData.success && channelsData.channels && channelsData.channels.length > 0) {
          dynamicChannels = channelsData.channels.map((c: any) => {
            const isCrypto = c.type.includes("USDT") || c.type.includes("CRYPTO");
            const isShamCash = c.type.includes("SHAM") || c.title.includes("شام كاش");
            return {
              id: `dyn-ch-${c.id}`,
              name: isShamCash ? "شام كاش (Sham Cash)" : c.title,
              category: (isCrypto ? "crypto" : "local") as "crypto" | "local",
              badge: isShamCash
                ? "فوري (#1)"
                : (isCrypto ? "تشفير فوري" : "0% عمولة"),
              badgeColor: isShamCash
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400/40"
                : (isCrypto
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"),
              icon: isCrypto ? QrCode : Smartphone,
              targetAccountTitle: isShamCash
                ? "حساب منصة تسونامي (شام كاش)"
                : (isCrypto ? "عنوان المحفظة الرقمية" : "رقم المحفظة / المستلم"),
              targetAccount: c.accountNumber,
              recipientName: c.recipientName || (isShamCash ? "حساب منصة تسونامي (شام كاش)" : undefined),
              instructions: [
                c.instructions || "حوّل المبلغ ثم أدخل تفاصيل الإشعار لتأكيد رصيدك",
              ],
              suggestedCurrencies: isCrypto ? ["USD"] : ["SYP", "USD"],
            };
          });
        }

        if (dynamicBanks.length > 0 || dynamicChannels.length > 0) {
          // Combine dynamic methods with salary methods
          const salaries = PAYMENT_METHODS.filter((m) => m.category === "salary");
          const customLocals = dynamicChannels.filter((c) => c.category === "local");
          const customCryptos = dynamicChannels.filter((c) => c.category === "crypto");

          setMethodsList([
            ...(customLocals.length > 0 ? customLocals : PAYMENT_METHODS.filter((m) => m.category === "local")),
            ...(customCryptos.length > 0 ? customCryptos : PAYMENT_METHODS.filter((m) => m.category === "crypto")),
            ...(dynamicBanks.length > 0 ? dynamicBanks : PAYMENT_METHODS.filter((m) => m.category === "bank")),
            ...salaries,
          ]);
        }
      } catch {
        // Fallback to static list
      }
    }

    loadDynamicDepositOptions();
  }, []);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [transferRef, setTransferRef] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<any>(null);

  const tabs = [
    { id: "local", name: "محافظ وحوالات محلية", icon: Smartphone },
    { id: "crypto", name: "عملات رقمية (USDT)", icon: QrCode },
    { id: "bank", name: "حسابات بنكية (تركيا وسوريا)", icon: Building2 },
    { id: "salary", name: "رواتب وتفريغ برامج الدردشة", icon: Tv },
  ];

  const filteredMethods = methodsList.filter((m) => m.category === activeTab);

  const handleCopyTarget = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success("تم نسخ الحساب بنجاح", { description: text });
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setDepositAmount("");
    setSenderName(currentUser?.name || "");
    setSenderPhone(currentUser?.phone || "");
    setTransferRef("");
    setReceiptImage(null);
    setDepositSuccess(null);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser && !isVerified) {
      toast.error("يتطلب شحن المحفظة توثيق هويتك أولاً (KYC)");
      return;
    }

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("يرجى إدخال مبلغ إيداع صحيح أكبر من صفر");
      return;
    }

    if (!receiptImage) {
      toast.error("يرجى إرفاق صورة إشعار التحويل أو لقطة الشاشة");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          currency: "USD",
          method: selectedMethod?.name || "تحويل إلكتروني",
          senderName: senderName.trim() || undefined,
          senderAccountOrPhone: senderPhone.trim() || undefined,
          transferReference: transferRef.trim() || undefined,
          receiptImageUrl: receiptImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل إرسال طلب الإيداع");
      }

      setDepositSuccess(data.deposit || { amount: amt, method: selectedMethod?.name });
      await refreshWallet();
      toast.success("تم إرسال طلب الإيداع بنجاح للمراجعة الفورية!");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إرسال الإيداع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 text-right">
      {/* Top Banner: Current Balance & Identity */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#13253a] via-[#0d1b2a] to-[#070e17] border border-[#1e3a5f] p-6 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#13253a] text-[#06b6d4] border border-[#06b6d4]/30 font-mono">
              بوابة الدفع والشحن المباشر
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/30">
              معالجة فورية 24/7
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">إيداع وشحن الرصيد</h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            اختر وسيلة الدفع المناسبة لك لشحن محفظتك، مع إمكانية تفريغ رواتب تطبيقات الدردشة مباشرة.
          </p>
        </div>

        {/* Live Wallet Pill */}
        <div className="p-4 rounded-2xl bg-[#070e17] border border-[#1e3a5f] flex items-center gap-4 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              رصيدك الحالي
            </span>
            <span className="text-2xl font-black text-[#d4af37] font-mono">
              ${walletBalance.toFixed(2)}
            </span>
          </div>
          <div className="border-r border-[#1e3a5f] pr-3 text-left">
            <span className="text-[10px] text-slate-400 block">المعرف الرقمي</span>
            <span className="text-xs font-mono font-black text-[#06b6d4]">#{numericId}</span>
          </div>
        </div>
      </div>

      {/* KYC Warning & Operational Gate for Unverified Users */}
      {currentUser && !isVerified && (
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-l from-amber-500/15 via-[#0d1b2a] to-[#070e17] border-2 border-amber-500/50 shadow-2xl space-y-4 text-right">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-inner shrink-0">
                <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>تنبيه: حسابك مقيد بانتظار توثيق الهوية</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  يتطلب إيداع الرصيد وشحن المحفظة توثيق هويتك أولاً (KYC)
                </h2>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg transition-all transform hover:scale-[1.02] shrink-0"
            >
              <span>توثيق الحساب الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            لحماية أموالك ومنع الاحتيال المالي، لا يُسمح للحسابات غير الموثقة بتقديم طلبات إيداع أو شحن رصيد. يمكنك رفع وثيقة الهوية (كملك، إقامة، جواز سفر أو رخصة قيادة) عبر صفحة الملف الشخصي ليتم تدقيقها فورياً وتفعيل ميزات الشحن كاملة.
          </p>
        </div>
      )}

      {/* Categorized Tabs Header */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-100 dark:bg-gradient-to-l dark:from-[#13253a] dark:to-[#070e17] text-amber-900 dark:text-[#f3e5ab] border border-amber-300 dark:border-[#d4af37]/50 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13253a]/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-700 dark:text-[#d4af37]" : "text-slate-400"}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Methods Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => handleOpenMethod(method)}
              className="group p-5 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] hover:border-amber-400 dark:hover:border-[#d4af37]/60 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] group-hover:border-amber-400 dark:group-hover:border-[#d4af37]/40 flex items-center justify-center text-amber-700 dark:text-[#d4af37] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      method.badgeColor || "bg-slate-100 dark:bg-[#13253a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1e3a5f]"
                    }`}
                  >
                    {method.badge}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#f3e5ab] transition-colors">
                  {method.name}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {method.instructions[0]}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-[#06b6d4] group-hover:text-amber-700 dark:group-hover:text-white transition-colors">
                <span>تقديم إشعار الإيداع</span>
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Link to Local Agents */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-[#06b6d4]/10 border border-cyan-200 dark:border-[#06b6d4]/30 flex items-center justify-center text-cyan-700 dark:text-[#06b6d4] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">هل تفضل التسليم باليد أو الدفع كاش في منطقتك؟</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">تفضل بالاطلاع على قائمة وكلائنا ومكاتبنا المعتمدة في سوريا، تركيا، العراق، ولبنان.</span>
          </div>
        </div>

        <Link
          href="/agents"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-cyan-800 dark:text-[#06b6d4] border border-cyan-300 dark:border-[#06b6d4]/40 font-bold transition-colors whitespace-nowrap"
        >
          <span>دليل الوكلاء المعتمدين</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ========================================================
          DEPOSIT ACTION MODAL / BOTTOM SHEET
         ======================================================== */}
      {selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto text-right">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl shadow-2xl p-5 sm:p-6 my-auto text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMethod(null)}
              className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {depositSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">تم استلام طلب الإيداع بنجاح!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  تم تسجيل إشعار الدفع وسيتم تأكيد التحويل وإضافة الرصيد لمحفظتك خلال دقائق معدودة.
                </p>

                <div className="bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 text-xs space-y-2 text-right max-w-xs mx-auto">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">وسيلة الدفع:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedMethod.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">المبلغ المطلوب:</span>
                    <span className="font-black text-amber-600 dark:text-[#d4af37] font-mono">${depositAmount} USD</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">حالة الطلب:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">قيد المراجعة الفورية</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-200"
                  >
                    إغلاق ومتابعة
                  </button>
                  <Link
                    href="/wallet?tab=deposits"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black shadow-md"
                  >
                    متابعة سجل الإيداعات
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Clean & Concise Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {selectedMethod.id === "sham-cash" || selectedMethod.name.includes("شام كاش")
                        ? "إيداع عبر شام كاش"
                        : (selectedMethod.name.startsWith("إيداع")
                          ? selectedMethod.name
                          : `إيداع عبر ${selectedMethod.name.replace(/\(.*?\)/g, "").trim()}`)}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {selectedMethod.id === "sham-cash" || selectedMethod.name.includes("شام كاش")
                        ? "فوري (#1)"
                        : selectedMethod.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    حوّل المبلغ ثم أدخل تفاصيل الإشعار لتأكيد رصيدك
                  </p>
                </div>

                {/* 2. Compact Receiver Account Card (1-Click Copy) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white">
                  <div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      {selectedMethod.id === "sham-cash" || selectedMethod.name.includes("شام كاش")
                        ? "حساب منصة تسونامي (شام كاش)"
                        : (selectedMethod.recipientName
                          ? `${selectedMethod.recipientName} (${selectedMethod.targetAccountTitle})`
                          : selectedMethod.targetAccountTitle)}
                    </div>
                    <div className="text-base font-bold font-mono tracking-wider" dir="ltr">
                      {selectedMethod.targetAccount}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMethod.targetAccount);
                      toast.success("تم نسخ الحساب بنجاح");
                      setCopiedText(true);
                      setTimeout(() => setCopiedText(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الحساب</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Streamlined Deposit Form */}
                <form onSubmit={handleSubmitDeposit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        المبلغ المحول ($ USD) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="50.00"
                        className="w-full bg-white dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم المرسل / صاحب الحساب
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="اسم المحوّل..."
                        className="w-full bg-white dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none text-right font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الهاتف / الحساب
                      </label>
                      <input
                        type="text"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="09XXXXXXXX"
                        className="w-full bg-white dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم العملية / الإشعار / TxID *
                      </label>
                      <input
                        type="text"
                        required
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="رقم مرجع الحوالة..."
                        className="w-full bg-white dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Compact Horizontal Screenshot Dropzone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      صورة إشعار التحويل / الإيصال
                    </label>
                    <label className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-[#1e3a5f] hover:border-amber-500 dark:hover:border-[#d4af37] bg-slate-50 dark:bg-[#070e17] cursor-pointer transition-colors">
                      {receiptImage ? (
                        <div className="flex items-center gap-2.5">
                          <img
                            src={receiptImage}
                            alt="إيصال التحويل"
                            className="w-8 h-8 object-cover rounded-lg border border-slate-300 dark:border-[#1e3a5f]"
                          />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ تم إرفاق صورة الإيصال بنجاح
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Upload className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-medium">رفع صورة الإشعار (PNG, JPG بحد أقصى 5MB)</span>
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                        {receiptImage ? "تغيير" : "استعراض"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Submit Button */}
                  {currentUser && !isVerified ? (
                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                      >
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>يتطلب إرسال الإشعار توثيق الهوية أولاً (KYC)</span>
                      </button>
                      <Link
                        href="/profile"
                        className="w-full py-1 text-xs font-bold text-center text-amber-600 dark:text-amber-400 hover:underline block"
                      >
                        انقر هنا للتوجه إلى صفحة توثيق الهوية ←
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري إرسال الطلب...</span>
                          </>
                        ) : (
                          <>
                            <span>تأكيد وإرسال إشعار الإيداع</span>
                            <ArrowLeft className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
