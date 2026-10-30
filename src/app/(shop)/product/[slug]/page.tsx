"use client";

import { use, useState } from "react";
import { PRODUCTS } from "@/lib/catalog";
import { useUserRole } from "@/components/UserRoleContext";
import { useRouter } from "next/navigation";
import {
  Zap,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Wallet,
  Sparkles,
  Info,
  Layers,
  ArrowLeft,
  UserCheck,
  Plus,
  Minus,
  Calculator,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import KycRequiredModal from "@/components/ui/KycRequiredModal";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { role, userId, walletBalance, updateBalanceLocally, refreshWallet, currentUser, isVerified } = useUserRole();

  const product = PRODUCTS.find((p) => p.slug === slug);

  const minQty = product?.minQuantity || 500;
  const stepQty = product?.stepQuantity || 100;
  const presets = product?.presetAmounts && product.presetAmounts.length > 0
    ? product.presetAmounts
    : [500, 1000, 2500, 5000, 10000, 25000, 50000];

  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quantity, setQuantity] = useState<number>(minQty);
  const [quantityInput, setQuantityInput] = useState<string>(String(minQty));

  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [verifiedNickname, setVerifiedNickname] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-black text-white mb-2">الخدمة غير موجودة</h1>
        <p className="text-xs text-slate-400 mb-6">تعذر العثور على خدمة الشحن المطلوبة في دليل المنتجات.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13253a] text-[#06b6d4] text-xs font-bold border border-[#1e3a5f]"
        >
          <ArrowRight className="w-4 h-4" /> العودة إلى المتجر
        </Link>
      </div>
    );
  }

  const effectiveRate = role === "RESELLER"
    ? (product.unitPriceReseller || product.unitPriceUser || 0.001)
    : (product.unitPriceUser || 0.001);

  const coinsPerUsd = effectiveRate > 0 ? Math.round(1 / effectiveRate) : 1000;
  const unitPrice = Number((quantity * effectiveRate).toFixed(2));
  const sypPrice = Math.round(unitPrice * 15000);
  const isQuantityValid = quantity >= minQty;
  const hasSufficientFunds = walletBalance >= unitPrice;

  const handleInputChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setQuantityInput(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      setQuantity(num);
    } else {
      setQuantity(0);
    }
  };

  const handleStep = (delta: number) => {
    const next = Math.max(minQty, (quantity || 0) + delta);
    setQuantity(next);
    setQuantityInput(String(next));
  };

  const handleSelectPreset = (amount: number) => {
    setQuantity(amount);
    setQuantityInput(String(amount));
  };

  const handleMaxBalance = () => {
    if (walletBalance <= 0) {
      toast.info("رصيدك الحالي $0.00. يرجى شحن الرصيد أولاً.");
      return;
    }
    const maxCoins = Math.floor(walletBalance / effectiveRate);
    if (maxCoins < minQty) {
      toast.error(`رصيدك الحالي ($${walletBalance.toFixed(2)}) لا يكفي للحد الأدنى المطلوب (${minQty.toLocaleString()} وحدة)`);
      return;
    }
    setQuantity(maxCoins);
    setQuantityInput(String(maxCoins));
    toast.success(`تم احتساب كامل الرصيد المتاح: ${maxCoins.toLocaleString()} ${product.currencyName || "وحدة"}`);
  };

  const handleValidateUID = async () => {
    if (!playerId.trim()) {
      toast.error("يرجى إدخال معرّف الحساب (UID) أولاً");
      setValidationError("معرّف الحساب لا يمكن أن يكون فارغاً.");
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setVerifiedNickname(null);

    try {
      const res = await fetch("/api/validate-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameCode: product.gameCode,
          playerId: playerId.trim(),
          zoneId: zoneId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.valid) {
        setVerifiedNickname(data.nickname || "لاعب معتمد");
        toast.success(`تم التحقق من الحساب: ${data.nickname || "صحيح"}`);
      } else {
        const msg = data.errorMessage || "لم يتم العثور على اللاعب في السيرفر الرسمي.";
        setValidationError(msg);
        toast.error(msg);
      }
    } catch {
      setValidationError("تعذر الاتصال بخادم التحقق من اللعبة.");
      toast.error("خطأ في الاتصال بالشبكة");
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteOrder = async () => {
    if (currentUser && !isVerified) {
      setShowCheckoutModal(false);
      setShowKycModal(true);
      return;
    }
    if (product.requiresPlayerId && !playerId.trim()) {
      toast.error("يرجى إدخال معرّف الحساب (UID)");
      return;
    }
    if (!isQuantityValid) {
      toast.error(`الحد الأدنى للطلب هو ${minQty.toLocaleString()} ${product.currencyName || "وحدة"}`);
      return;
    }
    if (!hasSufficientFunds) {
      toast.error("رصيد المحفظة غير كافٍ. يرجى إيداع رصيد أولاً.");
      return;
    }

    setIsOrdering(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userRole: role,
          productId: product.id,
          packageId: "custom",
          customQuantity: quantity,
          targetId: playerId.trim() || "شراء_مباشر",
          targetZoneId: zoneId.trim() || undefined,
          playerNickname: verifiedNickname || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تم رفض عملية الشحن");
      }

      setOrderSuccess(data);
      if (data.balanceRemaining !== undefined) {
        updateBalanceLocally(data.balanceRemaining);
      }
      refreshWallet();
      toast.success(`تم شحن الطلب ${data.orderNumber} بنجاح عبر السيرفر!`);
    } catch (err: any) {
      toast.error(err.message || "فشل تنفيذ عملية الشحن");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-300">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">الرئيسية</Link>
        <span>/</span>
        <span className="text-sky-600 dark:text-[#06b6d4]">{product.categoryName}</span>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-200 font-bold">{product.name}</span>
      </nav>

      {/* Product Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-slate-900 via-[#0d1b2a] to-[#070e17] border border-amber-500/30 dark:border-[#1e3a5f] p-6 sm:p-8 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-[#070e17] border-2 border-amber-400/80 p-1 shadow-[0_0_25px_rgba(212,175,55,0.4)] shrink-0 flex items-center justify-center">
              {(product.imageUrl || product.image) && !imageError ? (
                <img
                  src={product.imageUrl || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[20px]"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-amber-500/20 via-[#0d1b2a] to-cyan-500/20 flex flex-col items-center justify-center text-amber-300">
                  <Shield className="w-9 h-9 mb-0.5 text-amber-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 font-mono">
                    {product.gameCode || "TSUNAMI"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1e3a5f] text-[#06b6d4] border border-[#06b6d4]/30">
                  {product.categoryName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-[#f3e5ab] border border-amber-400/40">
                  شحن سيرفر رسمي
                </span>
                {product.website && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070e17] text-slate-300 border border-[#1e3a5f]">
                    {product.website}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">{product.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="bg-[#070e17]/80 border border-[#1e3a5f] rounded-2xl p-4 md:max-w-xs text-xs space-y-1.5 shadow-md">
            <div className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Info className="w-4 h-4 text-[#06b6d4]" /> تعليمات الشحن المرن:
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              1. أدخل معرّف الحساب (UID) الخاص بك بدقة.<br />
              2. حدد الكمية المرنة المطلوبة بواسطة الحاسبة.<br />
              3. اضغط على زر شحن فوري لتنفيذ الطلب بلحظات.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Player Credentials & Flexible Calculator */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Player Credentials */}
          {product.requiresPlayerId && (
            <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 dark:bg-[#06b6d4]/20 dark:text-[#06b6d4] flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  معرّف الحساب / Player ID
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{product.playerIdHelp}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className={product.requiresZoneId ? "sm:col-span-5" : "sm:col-span-8"}>
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      setVerifiedNickname(null);
                      setValidationError(null);
                    }}
                    placeholder={product.playerIdPlaceholder}
                    className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-sky-500 dark:focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                {product.requiresZoneId && (
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={zoneId}
                      onChange={(e) => {
                        setZoneId(e.target.value);
                        setVerifiedNickname(null);
                      }}
                      placeholder="معرّف السيرفر (Zone ID)"
                      className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-sky-500 dark:focus:border-[#06b6d4] rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="sm:col-span-4">
                  <button
                    type="button"
                    onClick={handleValidateUID}
                    disabled={isValidating || !playerId.trim()}
                    className="w-full h-full min-h-[46px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-sky-700 dark:text-[#06b6d4] border border-sky-300 dark:border-[#06b6d4]/40 hover:border-sky-400 dark:hover:border-[#06b6d4] transition-all disabled:opacity-50"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارٍ التحقق...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>التحقق من الاسم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Verified Nickname Banner */}
              {verifiedNickname && (
                <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    تم التحقق من الحساب باللعبة: <strong className="text-slate-900 dark:text-white text-sm mr-1">{verifiedNickname}</strong>
                  </span>
                </div>
              )}

              {validationError && (
                <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 text-red-700 border border-red-300 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Flexible Dynamic Amount Calculator */}
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-xl space-y-6 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 dark:bg-[#d4af37]/20 dark:text-[#d4af37] flex items-center justify-center text-xs font-black">
                  2
                </span>
                حاسبة الشحن المباشر (تحديد الكمية المرنة)
              </h3>
              {role === "RESELLER" ? (
                <span className="text-[11px] font-bold text-sky-700 dark:text-[#06b6d4] bg-sky-100 dark:bg-[#06b6d4]/10 px-3 py-1 rounded-full border border-sky-300 dark:border-[#06b6d4]/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  أسعار الموزعين المعتمدة مفعلة
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#070e17] px-3 py-1 rounded-full border border-slate-300 dark:border-[#1e3a5f]">
                  1 USD ≈ {coinsPerUsd.toLocaleString()} {product.currencyName || "وحدة"}
                </span>
              )}
            </div>

            {/* Custom Amount Input with +/- Buttons */}
            <div>
              <label className="block text-xs text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                أدخل كمية {product.currencyName || "الرصيد"} المطلوبة (الحد الأدنى: {minQty.toLocaleString()}):
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={quantityInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`أدخل كمية ${product.currencyName || "الرصيد"} المطلوبة...`}
                  className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 rounded-2xl px-5 py-4 pl-28 text-xl sm:text-2xl font-black text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors font-mono"
                />
                <div className="absolute left-3 flex items-center gap-1.5 bg-white dark:bg-[#13253a] rounded-xl p-1.5 border border-slate-300 dark:border-[#1e3a5f]">
                  <button
                    type="button"
                    onClick={() => handleStep(-stepQty)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                    title={`خصم ${stepQty}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(stepQty)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#1e3a5f] text-amber-700 dark:text-[#d4af37] hover:text-amber-800 dark:hover:text-[#f3e5ab] flex items-center justify-center transition-colors"
                    title={`إضافة ${stepQty}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {!isQuantityValid && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  الحد الأدنى للكمية المسموح بشحنها هو {minQty.toLocaleString()} {product.currencyName || "وحدة"}.
                </p>
              )}
            </div>

            {/* Quick Add Presets */}
            <div>
              <span className="block text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 font-bold">
                أزرار التحديد السريع للكمية:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {presets.map((amount) => {
                  const isSelected = quantity === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleSelectPreset(amount)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-mono transition-all border ${
                        isSelected
                          ? "bg-amber-100 dark:bg-gradient-to-r dark:from-[#d4af37]/25 dark:to-[#aa820a]/25 border-amber-500 text-amber-900 dark:text-[#f3e5ab] shadow-sm"
                          : "bg-slate-100 dark:bg-[#070e17] border-slate-300 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      +{amount.toLocaleString()}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleMaxBalance}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border border-sky-300 dark:border-[#06b6d4]/40 bg-sky-50 dark:bg-[#06b6d4]/10 hover:bg-sky-100 dark:hover:bg-[#06b6d4]/20 text-sky-700 dark:text-[#06b6d4] flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-sky-600 dark:text-[#06b6d4]" />
                  <span>كامل الرصيد المتاح</span>
                </button>
              </div>
            </div>

            {/* Dynamic Calculation Output Card */}
            <div className="bg-slate-50 dark:bg-gradient-to-r dark:from-[#070e17] dark:via-[#102235] dark:to-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  المبلغ الإجمالي المخصوم:
                </span>
                <div className="text-3xl font-black text-amber-600 dark:text-[#d4af37] font-mono">
                  ${unitPrice.toFixed(2)} USD
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono mt-1">
                  ≈ {sypPrice.toLocaleString()} ليرة سورية
                </span>
              </div>

              <div className="sm:border-r sm:border-slate-200 dark:sm:border-[#1e3a5f] sm:pr-4 flex flex-col justify-center">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold block mb-1">
                  سعر الصرف المعتمد:
                </span>
                <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {effectiveRate} USD لكل 1 {product.currencyName?.split("/")[0]?.trim() || "وحدة"}
                </div>
                {role === "RESELLER" && (
                  <span className="text-xs text-sky-700 dark:text-[#06b6d4] font-bold block mt-1">
                    ✓ تم تطبيق خصم الموزع الحصري
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & One-Click Checkout */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-7 shadow-lg dark:shadow-2xl space-y-6 transition-colors">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-[#d4af37]" />
              ملخص تفاصيل الشحن
            </h3>

            {/* Selected Breakdown */}
            <div className="bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 text-xs space-y-3">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                <span className="text-slate-500 dark:text-slate-400">الخدمة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                <span className="text-slate-500 dark:text-slate-400">الكمية المطلوبة:</span>
                <span className="font-bold text-amber-800 dark:text-[#f3e5ab] font-mono">
                  {quantity.toLocaleString()} {product.currencyName?.split("/")[0]?.trim() || "وحدة"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                <span className="text-slate-500 dark:text-slate-400">معرّف الحساب / UID:</span>
                <span className="font-mono text-slate-900 dark:text-white">{playerId || "لم يُدخل بعد"}</span>
              </div>
              {verifiedNickname && (
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                  <span className="text-slate-500 dark:text-slate-400">اسم اللاعب:</span>
                  <span className="font-bold text-sky-700 dark:text-[#06b6d4]">{verifiedNickname}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                <span className="text-slate-500 dark:text-slate-400">المبلغ المطلوب:</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">رصيدك المتاح:</span>
                <span className={`font-black font-mono ${hasSufficientFunds ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  ${walletBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Final Price Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-gradient-to-l dark:from-[#13253a] dark:to-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">المبلغ المطلوب للخصم</span>
                <div className="text-2xl font-black text-amber-600 dark:text-[#d4af37] font-mono">
                  ${unitPrice.toFixed(2)}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/30">
                بدون عمولة إضافية
              </span>
            </div>

            {/* Direct Order Button */}
            <button
              type="button"
              onClick={() => {
                if (currentUser && !isVerified) {
                  setShowKycModal(true);
                  return;
                }
                setShowCheckoutModal(true);
              }}
              disabled={
                currentUser && !isVerified
                  ? false
                  : !isQuantityValid || (product.requiresPlayerId && !playerId.trim()) || !hasSufficientFunds
              }
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-md ${
                currentUser && !isVerified
                  ? "bg-gradient-to-l from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 cursor-pointer"
                  : "bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {currentUser && !isVerified ? (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>متابعة الشحن (يتطلب توثيق KYC)</span>
                </>
              ) : (
                <>
                  <span>متابعة الشحن الفوري</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>

            {currentUser && !isVerified && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-2 text-right">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    حسابك في وضع العرض فقط (يتطلب توثيق KYC للشحن)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKycModal(true)}
                  className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
                >
                  توثيق الآن
                </button>
              </div>
            )}

            {!hasSufficientFunds && (!currentUser || isVerified) && (
              <div className="text-center bg-rose-50 dark:bg-[#070e17] border border-rose-300 dark:border-rose-500/30 rounded-2xl p-3">
                <p className="text-[11px] text-rose-700 dark:text-rose-400 mb-1.5 font-bold">
                  رصيد محفظتك (${walletBalance.toFixed(2)}) غير كافٍ لتنفيذ هذه العملية.
                </p>
                <Link
                  href="/deposit"
                  className="text-xs font-bold text-amber-700 dark:text-[#d4af37] hover:underline flex items-center justify-center gap-1"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  إيداع وشحن المحفظة الآن &larr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* One-Click Checkout Modal Confirmation */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 text-right">
            {orderSuccess ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">تم إرسال الطلب للسيرفر بنجاح!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  تم خصم الرصيد ذرياً وجارٍ شحن الحساب عبر مزود اللعبة مباشرة.
                </p>

                <div className="bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 text-right text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">رقم الطلب:</span>
                    <span className="font-mono font-bold text-amber-800 dark:text-[#f3e5ab]">{orderSuccess.orderNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">معرّف الحساب / UID:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{orderSuccess.targetId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">الكمية المشحونة:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{orderSuccess.packageName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">المبلغ المخصوم:</span>
                    <span className="font-black text-amber-600 dark:text-[#d4af37] font-mono">${Number(orderSuccess.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">رصيدك المتبقي:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">${Number(orderSuccess.balanceRemaining).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderSuccess(null);
                      router.push("/orders");
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-sky-700 dark:text-[#06b6d4] border border-sky-300 dark:border-[#06b6d4]/40 transition-colors"
                  >
                    عرض سجل الطلبات
                  </button>
                  <button
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setOrderSuccess(null);
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1e3a5f] text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-[#1e3a5f] transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-[#d4af37]/20 border border-amber-300 dark:border-[#d4af37]/40 flex items-center justify-center text-amber-800 dark:text-[#d4af37]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد عملية الشحن الفوري</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">خصم مباشر وآمن من رصيد المحفظة</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">الخدمة:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{product.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">الكمية:</span>
                    <span className="font-bold text-amber-800 dark:text-[#f3e5ab] font-mono">
                      {quantity.toLocaleString()} {product.currencyName?.split("/")[0]?.trim()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                    <span className="text-slate-500 dark:text-slate-400">معرّف الحساب / UID:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{playerId}</span>
                  </div>
                  {verifiedNickname && (
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-[#1e3a5f]/60">
                      <span className="text-slate-500 dark:text-slate-400">اسم اللاعب:</span>
                      <span className="font-bold text-sky-700 dark:text-[#06b6d4]">{verifiedNickname}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">المبلغ الإجمالي للخصم:</span>
                    <span className="font-black text-xl text-amber-600 dark:text-[#d4af37] font-mono">${unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    إلغاء
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteOrder}
                    disabled={isOrdering}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all disabled:opacity-50"
                  >
                    {isOrdering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جارٍ التنفيذ...</span>
                      </>
                    ) : (
                      <>
                        <span>تأكيد وخصم الرصيد</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KYC Restriction Modal */}
      <KycRequiredModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        actionName="تنفيذ عمليات الشحن"
      />
    </div>
  );
}
