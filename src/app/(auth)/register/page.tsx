"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/components/UserRoleContext";
import UsernameInput from "@/components/ui/UsernameInput";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshWallet, refreshUser, saveSessionLocally } = useUserRole();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time password validations
  const hasMinLength = password.length >= 8;
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetters && hasNumbers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("يرجى إدخال اسمك الكامل.");
      return;
    }

    if (!isUsernameValid) {
      setErrorMessage("يرجى اختيار اسم مستخدم صالح ومتاح.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("يرجى التأكد من استيفاء شروط كلمة المرور (8 خانات، أحرف وأرقام).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase() || undefined,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب");
      }

      if (data.user) {
        saveSessionLocally(data.user, data.token, data.wallet?.balance || 0);
      }

      toast.success("تم إنشاء الحساب والمحفظة بنجاح!", {
        description: `معرّف حسابك: #${data.user?.numericId || "1042"}`,
      });

      await refreshWallet();
      await refreshUser();

      setTimeout(() => {
        window.location.href = "/complete-profile";
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء إنشاء الحساب");
      toast.error(err.message || "فشل إنشاء الحساب");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const googleMockEmail = email && email.includes("@") ? email.trim().toLowerCase() : "new.google.user@gmail.com";
      const googleMockName = name.trim() || "مستخدم Google الجديد";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleMockEmail,
          name: googleMockName,
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل التسجيل بواسطة Google");
      }

      if (data.user) {
        saveSessionLocally(data.user, data.token, data.wallet?.balance || 0);
      }

      toast.success("تم التسجيل عبر Google بنجاح!", {
        description: `معرّف الحساب: #${data.user?.numericId || "1042"}`,
      });

      await refreshWallet();
      await refreshUser();

      setTimeout(() => {
        window.location.href = data.redirectUrl || "/complete-profile";
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل التسجيل عبر Google");
      toast.error(err.message || "فشل التسجيل عبر Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-colors duration-200">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-[#06b6d4]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Metallic Crest */}
        <div className="text-center space-y-1.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] mx-auto shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            إنشاء حساب جديد
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            انضم إلى منصة تسونامي واحصل على محفظة ومعرّف رقمي فوري
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300">
            <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
            <span>محفظة فورية مجانية ($0.00)</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-[#06b6d4]" />
            <span>معرّف رقمي (#1004)</span>
          </div>
        </div>

        {/* Official Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-800 dark:text-slate-100 shadow-xs border border-slate-300 dark:border-[#1e3a5f] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-700 dark:text-slate-300" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>التسجيل السريع بواسطة Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-3.5 flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-[#1e3a5f] w-full" />
          <span className="bg-white dark:bg-[#0d1b2a] px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 absolute">
            أو عبر البريد الإلكتروني
          </span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed text-right">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              الاسم الكامل / الاسم القانوني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد المحمد"
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pr-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-right"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Real-time Unique Username Input with 400ms Debounce */}
          <UsernameInput
            value={username}
            onChange={setUsername}
            onValidityChange={(valid, checking) => setIsUsernameValid(valid && !checking)}
            placeholder="tsunami_user"
            label="اسم المستخدم / اللقب (Username)"
            id="register-username-input"
          />

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pr-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-left"
                dir="ltr"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pr-10 pl-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-left"
                dir="ltr"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirement Indicators */}
            <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={hasMinLength ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                  8 خانات على الأقل
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLetters ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={hasLetters ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                  تحتوي على أحرف باللغة الإنجليزية
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNumbers ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={hasNumbers ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-500 dark:text-slate-400"}>
                  تحتوي على أرقام
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid || !isUsernameValid}
            className="w-full mt-1 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري إنشاء الحساب والمحفظة...</span>
              </>
            ) : (
              <>
                <span>إنشاء الحساب ومتابعة</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-3.5 text-center text-xs text-slate-600 dark:text-slate-400">
          لديك حساب بالفعل؟{" "}
          <Link
            href="/login"
            className="font-bold text-amber-600 dark:text-[#d4af37] hover:underline"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
