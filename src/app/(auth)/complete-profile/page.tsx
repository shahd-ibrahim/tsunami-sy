"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Globe,
  Phone,
  ArrowLeft,
  Loader2,
  Sparkles,
  Coins,
  Ticket,
  AlertCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/components/UserRoleContext";

import UsernameInput from "@/components/ui/UsernameInput";

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  sample: string;
}

const COUNTRIES: CountryOption[] = [
  { code: "SY", name: "سوريا", flag: "🇸🇾", dialCode: "+963", sample: "933123456" },
  { code: "TR", name: "تركيا", flag: "🇹🇷", dialCode: "+90", sample: "5551234567" },
  { code: "IQ", name: "العراق", flag: "🇮🇶", dialCode: "+964", sample: "7701234567" },
  { code: "LB", name: "لبنان", flag: "🇱🇧", dialCode: "+961", sample: "70123456" },
  { code: "AE", name: "الإمارات", flag: "🇦🇪", dialCode: "+971", sample: "501234567" },
  { code: "SA", name: "السعودية", flag: "🇸🇦", dialCode: "+966", sample: "501234567" },
  { code: "JO", name: "الأردن", flag: "🇯🇴", dialCode: "+962", sample: "791234567" },
  { code: "EG", name: "مصر", flag: "🇪🇬", dialCode: "+20", sample: "1012345678" },
  { code: "DE", name: "ألمانيا", flag: "🇩🇪", dialCode: "+49", sample: "1512345678" },
  { code: "SE", name: "السويد", flag: "🇸🇪", dialCode: "+46", sample: "701234567" },
];

const CURRENCIES = [
  { code: "USD", name: "الدولار الأمريكي", symbol: "$" },
  { code: "TRY", name: "الليرة التركية", symbol: "₺" },
  { code: "SYP", name: "الليرة السورية", symbol: "ل.س" },
];

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400 text-xs">جاري تحميل شاشة إكمال البيانات...</div>}>
      <CompleteProfileForm />
    </Suspense>
  );
}

function CompleteProfileForm() {
  const router = useRouter();
  const { currentUser, refreshUser, saveSessionLocally } = useUserRole();

  const [username, setUsername] = useState(currentUser?.username || "");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<"USD" | "TRY" | "SYP">("USD");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.username && !username) {
      setUsername(currentUser.username);
    }
    if (currentUser?.phone) {
      const matched = COUNTRIES.find((c) => currentUser.phone?.startsWith(c.dialCode));
      if (matched) {
        setSelectedCountry(matched);
        setPhoneLocal(currentUser.phone.replace(matched.dialCode, ""));
      } else {
        setPhoneLocal(currentUser.phone);
      }
    }
  }, [currentUser, username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (username.trim() && !isUsernameValid) {
      setErrorMessage("يرجى اختيار اسم مستخدم متاح وصالح.");
      return;
    }

    const cleanNumber = phoneLocal.trim().replace(/\D/g, "");
    if (!cleanNumber || cleanNumber.length < 6) {
      setErrorMessage("يرجى إدخال رقم هاتف صالح لا يقل عن 6 أرقام.");
      return;
    }

    const fullPhone = `${selectedCountry.dialCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser?.name || username.trim(),
          username: username.trim().toLowerCase() || undefined,
          countryCode: selectedCountry.dialCode,
          countryName: selectedCountry.name,
          phone: fullPhone,
          preferredCurrency,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل حفظ البيانات");
      }

      if (data.user) {
        saveSessionLocally(data.user, data.token);
      }

      toast.success("تم إكمال بيانات حسابك بنجاح!", {
        description: `معرّف حسابك الدائم: #${data.user?.numericId || "1042"}`,
      });

      await refreshUser();

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ البيانات");
      toast.error(err.message || "فشل إكمال الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-right transition-colors duration-200">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-[#06b6d4]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Heading */}
        <div className="text-center space-y-1.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] mx-auto shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#06b6d4]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            إتمام بيانات الحساب
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            خطوة سريعة لتأكيد بلدك ورقم هاتفك وتفعيل المحفظة
          </p>

          {currentUser?.name && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
              <span>مرحباً، <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong></span>
              <span className="font-mono text-sky-700 dark:text-[#06b6d4] text-[11px]">
                (#{currentUser.numericId || "1042"})
              </span>
            </div>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 1. Username Field with 400ms Real-Time Debounce */}
          <UsernameInput
            value={username}
            onChange={setUsername}
            currentUserId={currentUser?.id}
            initialUsername={currentUser?.username || null}
            onValidityChange={(valid, checking) => setIsUsernameValid(valid && !checking)}
            placeholder="tsunami_user"
            label="اسم المستخدم / اللقب (Username)"
            id="complete-profile-username"
          />

          {/* 2. Country Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              الدولة / الدولة المقيم بها
            </label>
            <div className="relative">
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const found = COUNTRIES.find((c) => c.code === e.target.value);
                  if (found) setSelectedCountry(found);
                }}
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer appearance-none text-right font-medium"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code} className="bg-white dark:bg-[#0d1b2a] text-slate-900 dark:text-white py-1">
                    {country.flag} {country.name} ({country.dialCode})
                  </option>
                ))}
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                {selectedCountry.flag}
              </div>
            </div>
          </div>

          {/* 3. Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              رقم الهاتف / الواتساب
            </label>
            <div className="relative flex items-center">
              <div
                dir="ltr"
                className="absolute left-0 top-0 bottom-0 px-3 bg-slate-100 dark:bg-[#13253a] border-r border-slate-300 dark:border-[#1e3a5f] rounded-l-xl flex items-center gap-1.5 font-mono text-xs font-bold text-sky-700 dark:text-[#06b6d4]"
              >
                <span>{selectedCountry.dialCode}</span>
              </div>
              <input
                type="tel"
                required
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                placeholder={selectedCountry.sample}
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pl-20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-left"
                dir="ltr"
              />
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* 4. Preferred Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              العملة المفضلة لعرض الأسعار
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map((curr) => {
                const isSelected = preferredCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setPreferredCurrency(curr.code as any)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? "bg-amber-100 dark:bg-[#13253a] border-amber-400 dark:border-[#d4af37] text-amber-900 dark:text-[#f3e5ab] shadow-xs"
                        : "bg-slate-50 dark:bg-[#070e17] border-slate-200 dark:border-[#1e3a5f] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-black font-mono">{curr.symbol}</span>
                    <span className="text-[10px] truncate">{curr.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Referral / Agent Code (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
              <span>كود الوكيل / الإحالة</span>
              <span className="text-[10px] text-slate-400 font-normal">اختياري</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="مثال: AGENT-963 أو كود الصديق..."
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2 pr-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-right"
              />
              <Ticket className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isUsernameValid}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span>حفظ البيانات ومتابعة للمتجر</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
