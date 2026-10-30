"use client";

import { useState } from "react";
import { CatalogProduct } from "@/lib/catalog";
import { useUserRole } from "./UserRoleContext";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Calculator,
  Plus,
  Minus,
  Wallet,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import KycRequiredModal from "./ui/KycRequiredModal";

interface ProductModalProps {
  product: CatalogProduct | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { role, userId, walletBalance, updateBalanceLocally, refreshWallet, currentUser, isVerified } = useUserRole();

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

  // Order Submission State
  const [showKycModal, setShowKycModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<any>(null);

  if (!product) return null;

  const effectiveRate = role === "RESELLER"
    ? (product.unitPriceReseller || product.unitPriceUser || 0.001)
    : (product.unitPriceUser || 0.001);

  const coinsPerUsd = effectiveRate > 0 ? Math.round(1 / effectiveRate) : 1000;
  const currentPrice = Number((quantity * effectiveRate).toFixed(2));
  const sypPrice = Math.round(currentPrice * 15000);
  const isQuantityValid = quantity >= minQty;
  const hasSufficientBalance = walletBalance >= currentPrice;

  const handleInputChange = (val: string) => {
    // Only numbers
    const clean = val.replace(/\D/g, "");
    setQuantityInput(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      setQuantity(num);
    } else {
      setQuantity(0);
    }
    setOrderError(null);
  };

  const handleStep = (delta: number) => {
    const next = Math.max(minQty, (quantity || 0) + delta);
    setQuantity(next);
    setQuantityInput(String(next));
    setOrderError(null);
  };

  const handleSelectPreset = (amount: number) => {
    setQuantity(amount);
    setQuantityInput(String(amount));
    setOrderError(null);
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
    setOrderError(null);
    toast.success(`تم تحديد كامل الرصيد المتاح: ${maxCoins.toLocaleString()} ${product.currencyName || "وحدة"}`);
  };

  // Handle Nickname Verification
  const handleValidatePlayer = async () => {
    if (!playerId.trim()) {
      setValidationError("يرجى إدخال معرّف اللاعب (UID) أولاً.");
      toast.error("يرجى إدخال معرّف اللاعب أولاً");
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
        toast.success(`تم التحقق من الحساب بنجاح: ${data.nickname}`);
      } else {
        const err = data.errorMessage || "لم يتم العثور على اللاعب في خوادم اللعبة.";
        setValidationError(err);
        toast.error(err);
      }
    } catch {
      setValidationError("حدث خطأ أثناء الاتصال بسيرفر التحقق.");
      toast.error("خطأ في الاتصال بالشبكة");
    } finally {
      setIsValidating(false);
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (currentUser && !isVerified) {
      setShowKycModal(true);
      return;
    }
    if (product.requiresPlayerId && !playerId.trim()) {
      setOrderError("يرجى إدخال معرّف اللاعب / رقم الحساب.");
      toast.error("يرجى إدخال معرّف اللاعب");
      return;
    }
    if (!isQuantityValid) {
      setOrderError(`الحد الأدنى للكمية المطلوبة هو ${minQty.toLocaleString()} ${product.currencyName || "وحدة"}.`);
      toast.error("الكمية أقل من الحد الأدنى المسموح به");
      return;
    }
    if (!hasSufficientBalance) {
      setOrderError(
        `رصيدك غير كافٍ. المطلوب $${currentPrice.toFixed(2)} والمتاح بمحفظتك $${walletBalance.toFixed(2)}. يرجى شحن الرصيد.`
      );
      toast.error("رصيد المحفظة غير كافٍ لتنفيذ العملية");
      return;
    }

    setIsOrdering(true);
    setOrderError(null);

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
        throw new Error(data.error || "فشل تنفيذ الطلب");
      }

      setOrderResult(data);
      if (data.balanceRemaining !== undefined) {
        updateBalanceLocally(data.balanceRemaining);
      }
      refreshWallet();
      toast.success(`تم إرسال الطلب ${data.orderNumber} للطابور وخصم الرصيد بنجاح!`);
    } catch (err: any) {
      setOrderError(err.message || "حدث خطأ أثناء معالجة الطلب.");
      toast.error(err.message || "فشل تنفيذ عملية الشحن");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl shadow-2xl p-5 sm:p-7 my-6 text-slate-900 dark:text-slate-100 text-right transition-colors duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="relative w-13 h-13 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#070e17] border border-amber-500/40 dark:border-[#d4af37]/60 p-0.5 shadow-sm dark:shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0">
            <img
              src={product.imageUrl || product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-[12px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{product.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#13253a] text-cyan-700 dark:text-[#06b6d4] border border-cyan-300 dark:border-[#06b6d4]/30 font-mono">
                {product.gameCode}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{product.description}</p>
          </div>
        </div>

        {/* Success Screen if Order Placed */}
        {orderResult ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">تم إرسال الطلب إلى طابور المعالجة!</h3>
              <p className="text-xs text-slate-300 mt-1">
                طلبك قيد التنفيذ الآن بشكل فوري عبر طابور المعالجة السريع BullMQ.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-[#070e17] border border-[#1e3a5f] rounded-2xl p-4 text-right space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1e3a5f]/60">
                <span className="text-slate-400">رقم الطلب:</span>
                <span className="font-mono font-bold text-[#f3e5ab]">{orderResult.orderNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1e3a5f]/60">
                <span className="text-slate-400">معرّف الحساب / UID:</span>
                <span className="font-mono font-bold text-white">{orderResult.targetId}</span>
              </div>
              {orderResult.playerNickname && (
                <div className="flex justify-between py-1 border-b border-[#1e3a5f]/60">
                  <span className="text-slate-400">اسم اللاعب المعتمد:</span>
                  <span className="font-bold text-[#06b6d4]">{orderResult.playerNickname}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#1e3a5f]/60">
                <span className="text-slate-400">الكمية المشحونة:</span>
                <span className="font-bold text-white">{orderResult.packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1e3a5f]/60">
                <span className="text-slate-400">المبلغ المخصوم:</span>
                <span className="font-black text-[#d4af37] font-mono">${Number(orderResult.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">رصيد محفظتك المتبقي:</span>
                <span className="font-black text-emerald-400 font-mono">${Number(orderResult.balanceRemaining).toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setOrderResult(null);
                  setPlayerId("");
                  setVerifiedNickname(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 border border-[#1e3a5f] transition-all"
              >
                إغلاق ومتابعة التسوق
              </button>
            </div>
          </div>
        ) : (
          /* Normal Order Form */
          <div className="space-y-5">
            {/* Step 1: Player ID Verification */}
            {product.requiresPlayerId && (
              <div className="bg-slate-50 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 dark:bg-[#06b6d4]/20 text-cyan-700 dark:text-[#06b6d4] flex items-center justify-center text-[10px] font-black">
                      1
                    </span>
                    بيانات حساب اللاعب
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{product.playerIdHelp}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className={product.requiresZoneId ? "sm:col-span-2" : "sm:col-span-2"}>
                    <input
                      type="text"
                      value={playerId}
                      onChange={(e) => {
                        setPlayerId(e.target.value);
                        setVerifiedNickname(null);
                        setValidationError(null);
                      }}
                      placeholder={product.playerIdPlaceholder}
                      className="w-full bg-white dark:bg-[#0d1b2a] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#06b6d4] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {product.requiresZoneId && (
                    <div>
                      <input
                        type="text"
                        value={zoneId}
                        onChange={(e) => {
                          setZoneId(e.target.value);
                          setVerifiedNickname(null);
                        }}
                        placeholder="معرّف السيرفر (Zone ID)"
                        className="w-full bg-white dark:bg-[#0d1b2a] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#06b6d4] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleValidatePlayer}
                    disabled={isValidating || !playerId.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] text-cyan-700 dark:text-[#06b6d4] border border-cyan-300 dark:border-[#06b6d4]/40 hover:border-cyan-500 dark:hover:border-[#06b6d4] transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جارٍ التحقق...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>التحقق من الاسم</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Nickname Verification Output */}
                {verifiedNickname && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>اسم اللاعب المعتمد: <strong className="text-slate-900 dark:text-white text-sm mr-1">{verifiedNickname}</strong></span>
                  </div>
                )}

                {validationError && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Flexible Dynamic Amount Calculator */}
            <div className="bg-slate-50 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f] rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-700 dark:text-[#d4af37] flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  حاسبة الشحن المباشر (تحديد الكمية المرنة)
                </label>

                <div className="flex items-center gap-2">
                  {role === "RESELLER" ? (
                    <span className="text-[10px] font-bold text-cyan-800 dark:text-[#06b6d4] bg-cyan-100 dark:bg-[#06b6d4]/10 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-[#06b6d4]/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      سعر موزع مخفض
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-[#13253a] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#1e3a5f]">
                      1 USD ≈ {coinsPerUsd.toLocaleString()} {product.currencyName || "وحدة"}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Input with Plus/Minus */}
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                  أدخل كمية {product.currencyName || "الرصيد"} المطلوبة (الحد الأدنى: {minQty.toLocaleString()}):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quantityInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={`مثال: ${minQty.toLocaleString()}...`}
                    className="w-full bg-white dark:bg-[#0d1b2a] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] rounded-xl px-4 py-3 pl-24 text-base sm:text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                  />
                  <div className="absolute left-2 flex items-center gap-1 bg-slate-100 dark:bg-[#13253a] rounded-lg p-1 border border-slate-200 dark:border-[#1e3a5f]">
                    <button
                      type="button"
                      onClick={() => handleStep(-stepQty)}
                      className="w-7 h-7 rounded bg-white hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      title={`خصم ${stepQty}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStep(stepQty)}
                      className="w-7 h-7 rounded bg-white hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#1e3a5f] text-amber-700 dark:text-[#d4af37] hover:text-amber-600 dark:hover:text-[#f3e5ab] flex items-center justify-center transition-colors shadow-xs"
                      title={`زيادة ${stepQty}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {!isQuantityValid && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    الحد الأدنى للشحن هو {minQty.toLocaleString()} {product.currencyName || "وحدة"}.
                  </p>
                )}
              </div>

              {/* Quick Preset Chips */}
              <div>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                  أزرار الكميات السريعة:
                </span>
                <div className="flex flex-wrap gap-2">
                  {presets.map((amount) => {
                    const isSelected = quantity === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleSelectPreset(amount)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                          isSelected
                            ? "bg-amber-100 dark:bg-gradient-to-r dark:from-[#d4af37]/20 dark:to-[#aa820a]/20 border-amber-500 dark:border-[#d4af37] text-amber-900 dark:text-[#f3e5ab] shadow-xs"
                            : "bg-white dark:bg-[#0d1b2a] border-slate-300 dark:border-[#1e3a5f] text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                        }`}
                      >
                        +{amount.toLocaleString()}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleMaxBalance}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-cyan-300 dark:border-[#06b6d4]/40 bg-cyan-50 dark:bg-[#06b6d4]/10 hover:bg-cyan-100 dark:hover:bg-[#06b6d4]/20 text-cyan-800 dark:text-[#06b6d4] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-600 dark:text-[#06b6d4]" />
                    <span>كامل الرصيد المتاح</span>
                  </button>
                </div>
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-slate-100 dark:bg-gradient-to-r dark:from-[#0d1b2a] dark:via-[#102235] dark:to-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-xl p-3.5 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                    المبلغ الإجمالي بالدولار:
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-[#d4af37] font-mono">
                    ${currentPrice.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                    ≈ {sypPrice.toLocaleString()} ليرة سورية
                  </span>
                </div>

                <div className="border-r border-slate-200 dark:border-[#1e3a5f] pr-3">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">
                    سعر الوحدة المطبق:
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {effectiveRate} USD لكل 1 {product.currencyName?.split("/")[0]?.trim() || "وحدة"}
                  </div>
                  {role === "RESELLER" && (
                    <span className="text-[10px] text-cyan-700 dark:text-[#06b6d4] font-semibold block mt-0.5">
                      ✓ خصم الموزع نشط
                    </span>
                  )}
                </div>
              </div>

              {/* Live Wallet Verification Status */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
                  <span className="text-slate-600 dark:text-slate-300">رصيدك المتاح:</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">${walletBalance.toFixed(2)}</span>
                </div>

                {hasSufficientBalance ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    كافٍ (المتبقي: ${(walletBalance - currentPrice).toFixed(2)})
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      غير كافٍ (ينقص ${(currentPrice - walletBalance).toFixed(2)})
                    </span>
                    <Link
                      href="/deposit"
                      className="text-[10px] font-bold text-amber-700 dark:text-[#d4af37] underline hover:text-amber-800 dark:hover:text-[#f3e5ab]"
                    >
                      شحن الآن
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Checkout Action Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-[#1e3a5f] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">المبلغ المطلوب</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-[#d4af37] font-mono">
                    ${currentPrice.toFixed(2)}
                  </div>
                </div>

                <div className="text-left sm:text-right border-r border-slate-200 dark:border-[#1e3a5f] pr-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">الكمية</span>
                  <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                    {quantity.toLocaleString()} {product.currencyName?.split("/")[0]?.trim()}
                  </div>
                </div>
              </div>

              {orderError && (
                <p className="text-xs text-red-400 font-bold">{orderError}</p>
              )}

              <button
                type="button"
                onClick={currentUser && !isVerified ? () => setShowKycModal(true) : handlePlaceOrder}
                disabled={currentUser && !isVerified ? false : (isOrdering || !isQuantityValid || !hasSufficientBalance)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-md ${
                  currentUser && !isVerified
                    ? "bg-gradient-to-l from-amber-600 to-amber-700 text-white cursor-pointer"
                    : "bg-gradient-to-l from-[#d4af37] via-[#e5c05b] to-[#aa820a] hover:from-[#f3e5ab] hover:to-[#d4af37] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {currentUser && !isVerified ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-200" />
                    <span>شحن فوري (يتطلب توثيق KYC)</span>
                  </>
                ) : isOrdering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ قفل الرصيد والتنفيذ...</span>
                  </>
                ) : (
                  <>
                    <span>شحن فوري الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KYC Restriction Modal */}
      <KycRequiredModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        actionName="تنفيذ عمليات الشحن"
      />
    </div>
  );
}
