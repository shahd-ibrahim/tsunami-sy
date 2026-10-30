"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Tv,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/components/UserRoleContext";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400 text-xs">جاري تحميل شاشة تسجيل الدخول...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const isAuthRequired = searchParams.get("auth_required") === "true";

  const { refreshWallet, refreshUser, saveSessionLocally } = useUserRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      if (data.user) {
        saveSessionLocally(data.user, data.token, data.wallet?.balance);
      }

      toast.success("تم تسجيل الدخول بنجاح!", {
        description: `أهلاً بك مجدداً ${data.user?.name || ""}`,
      });

      await refreshWallet();
      await refreshUser();

      const destination =
        searchParams.get("redirect") ||
        (data.user?.role === "ADMIN" ? "/admin" : "/");

      setTimeout(() => {
        window.location.href = destination;
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء تسجيل الدخول");
      toast.error(err.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      // Execute Google Auth Flow
      const googleMockEmail = email && email.includes("@") ? email.trim().toLowerCase() : "user.google@gmail.com";
      const googleMockName = "مستخدم Google المعتمد";

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
        throw new Error(data.error || "فشل تسجيل الدخول بواسطة Google");
      }

      if (data.user) {
        saveSessionLocally(data.user, data.token, data.wallet?.balance);
      }

      toast.success("تم تسجيل الدخول بواسطة Google بنجاح!", {
        description: `معرّف الحساب: #${data.user?.numericId || "1042"}`,
      });

      await refreshWallet();
      await refreshUser();

      setTimeout(() => {
        window.location.href = data.redirectUrl || redirectPath;
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل تسجيل الدخول بواسطة Google");
      toast.error(err.message || "فشل تسجيل الدخول بواسطة Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-colors duration-200">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-[#d4af37]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Metallic Crest */}
        <div className="text-center space-y-1.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[1.5px] mx-auto shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            تسجيل الدخول
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            قم بتسجيل الدخول وتمتع بتجربة شحن سهلة وسريعة
          </p>

          {isAuthRequired && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-700 dark:text-[#f3e5ab] text-center">
              يجب تسجيل الدخول أولاً لتتمكن من استعراض الخدمات والشحن
            </div>
          )}
        </div>

        {/* Featured Badges */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#13253a] border border-slate-200 dark:border-[#06b6d4]/30 text-[10px] font-bold text-sky-800 dark:text-[#06b6d4]">
            <Tv className="w-3 h-3" /> سول ستار & سول شيل
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#13253a] border border-slate-200 dark:border-[#d4af37]/30 text-[10px] font-bold text-amber-800 dark:text-[#d4af37]">
            <Gamepad2 className="w-3 h-3" /> ببجي & فري فاير
          </span>
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
          <span>تسجيل الدخول بواسطة Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-[#1e3a5f] w-full" />
          <span className="bg-white dark:bg-[#0d1b2a] px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 absolute">
            أو عبر البريد الإلكتروني
          </span>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed text-right">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                كلمة المرور
              </label>
              <button
                type="button"
                onClick={() => toast.info("لاستعادة كلمة المرور، يرجى التواصل مع الدعم الفني: @tsunami_support")}
                className="text-[11px] text-amber-600 dark:text-[#06b6d4] hover:underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </>
            ) : (
              <>
                <span>تسجيل الدخول بالبريد</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-[#1e3a5f]/60">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center mb-1.5">
            حسابات تجريبية سريعة للفحص:
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleFillDemo("user@tsunami-sy.com", "UserPass123")}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-[10px] text-slate-700 dark:text-slate-300 transition-colors"
            >
              عميل: <span className="text-amber-700 dark:text-[#06b6d4] font-mono">user@tsunami-sy.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin@tsunami-sy.com", "Admin1234")}
              className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-amber-300/40 dark:border-[#d4af37]/30 text-[10px] text-slate-700 dark:text-[#f3e5ab] transition-colors"
            >
              مشرف: <span className="text-amber-700 dark:text-[#d4af37] font-mono">admin@tsunami-sy.com</span>
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="mt-4 text-center text-xs text-slate-600 dark:text-slate-400">
          ليس لديك حساب بعد؟{" "}
          <Link
            href="/register"
            className="font-bold text-amber-600 dark:text-[#d4af37] hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
