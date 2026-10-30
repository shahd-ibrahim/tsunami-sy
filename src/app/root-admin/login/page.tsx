"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Fingerprint,
  Loader2,
  Sparkles,
  AlertTriangle,
  Cpu,
  Terminal,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

export default function RootAdminLoginPage() {
  const { theme, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [masterPin, setMasterPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic particle & light wave canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }[] = [];

    const colors = ["#d4af37", "#06b6d4", "#f3e5ab", "#38bdf8"];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle cyan/gold wave ripples
      waveOffset += 0.015;
      ctx.beginPath();
      ctx.strokeStyle = theme === "dark" ? "rgba(6, 182, 212, 0.06)" : "rgba(6, 182, 212, 0.12)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 15) {
        const y = height * 0.5 + Math.sin(x * 0.003 + waveOffset) * 60 + Math.cos(x * 0.006 - waveOffset) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = theme === "dark" ? "rgba(212, 175, 55, 0.05)" : "rgba(212, 175, 55, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 15) {
        const y = height * 0.55 + Math.cos(x * 0.004 + waveOffset) * 50;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutTime || lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (lockoutTime && lockoutTime > 0) {
      toast.error(`الولوج محظور مؤقتًا. يرجى الانتظار ${lockoutTime} ثانية.`);
      return;
    }

    if (!identifier.trim() || !password.trim() || !masterPin.trim()) {
      setErrorMessage("يرجى إدخال كافة المفاتيح وبيانات المصادقة.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/root-admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          masterPin: masterPin.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "فشل التحقق من صحة مفاتيح الولوج");
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        if (data.lockoutTime) {
          setLockoutTime(data.lockoutTime);
        }
        toast.error(data.error || "فشل تسجيل الدخول كمسؤول أعلى");
        return;
      }

      toast.success("تم تأكيد الاعتماد وفك تشفير الجلسة بنجاح. جاري التحويل...");
      setTimeout(() => {
        window.location.href = "/root-admin";
      }, 600);
    } catch {
      setErrorMessage("حدث خطأ أثناء الاتصال بالخادم العسكري المباشر");
      toast.error("فشل الاتصال بالخادم المباشر");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillDemo = () => {
    setIdentifier("ROOT_SUPER_ADMIN");
    setPassword("Admin1234");
    setMasterPin("992026");
    setErrorMessage(null);
    toast.info("تم ملء مفاتيح الجذر التجريبية بنجاح");
  };

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-[#050b14] flex items-center justify-center p-4 sm:p-6 text-right text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20 dark:selection:bg-[#d4af37]/30 overflow-hidden transition-colors duration-300">
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70 dark:opacity-80"
      />

      {/* Floating Theme Toggle in Corner */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white dark:bg-[#0d1b2a]/90 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-amber-400 flex items-center justify-center shadow-md transition-all cursor-pointer backdrop-blur-md"
          title={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      {/* Deep luxury ambient back-glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-amber-500/10 dark:via-[#d4af37]/15 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Main Glassmorphic Fortress Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-[#070e17]/90 backdrop-blur-2xl border border-slate-200 dark:border-[#d4af37]/30 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-[0_20px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.15)] animate-in fade-in zoom-in-95 duration-500 transition-colors">
        {/* Top Edge Cyan/Gold Neon Line */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500 dark:via-[#d4af37] to-transparent shadow-[0_0_15px_#d4af37]" />

        {/* Centerpiece: Glowing TSUNAMI Wave Logo with Luxury Pulse */}
        <div className="text-center space-y-3 mb-8">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
            {/* Ambient Multi-layer Back-glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 via-amber-500 to-[#f3e5ab] blur-xl opacity-30 dark:opacity-40 animate-pulse pointer-events-none" />
            <div className="relative w-full h-full rounded-full border-2 border-amber-500/60 shadow-[0_0_30px_rgba(212,175,55,0.3)] p-1 bg-slate-50 dark:bg-[#050b14]/90 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI Wave Mark"
                width={120}
                height={120}
                priority
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 dark:bg-gradient-to-r dark:from-[#d4af37]/15 dark:to-[#06b6d4]/15 border border-amber-500/30 dark:border-[#d4af37]/40 text-amber-800 dark:text-[#f3e5ab] text-[11px] font-mono font-bold tracking-wider shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-[#06b6d4]" />
            <span>ROOT SUPER-ADMIN FORTRESS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            بوابة الإدارة العليا المعزولة
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            التحكم الشامل بكتالوج الألعاب، الحسابات، بوابات الدفع، والوكلاء المعتمدين
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0d1b2a]/90 border border-slate-200 dark:border-[#1e3a5f] flex items-start gap-3 text-[11px] text-slate-700 dark:text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-600 dark:text-[#06b6d4] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-cyan-700 dark:text-[#06b6d4]">نظام رقابة عسكرية مشفر (Military-Grade Isolation)</span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              تتم مراقبة كافة المحاولات برمجياً. يُقفل الحساب تلقائياً عند تجاوز 5 محاولات خاطئة خلال 15 دقيقة.
            </p>
          </div>
        </div>

        {/* Error / Lockout Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-start gap-3 animate-in shake duration-300">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{errorMessage}</p>
              {lockoutTime && lockoutTime > 0 && (
                <div className="text-[11px] text-rose-600 dark:text-rose-200 font-mono">
                  الوقت المتبقي لفك الحظر: {Math.floor(lockoutTime / 60)} دقيقة و {lockoutTime % 60} ثانية
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Super Admin Key */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              معرّف الجذر / Super Admin Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
              </div>
              <input
                type="text"
                dir="ltr"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ROOT_SUPER_ADMIN أو admin@tsunami-sy.com"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-[#04080e] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* 2. Master Password with Toggle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              كلمة المرور الرئيسية (Master Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-cyan-600 dark:text-[#06b6d4]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pr-10 pl-11 py-3 rounded-xl bg-slate-50 dark:bg-[#04080e] border border-slate-300 dark:border-[#1e3a5f] focus:border-cyan-500 dark:focus:border-[#06b6d4] focus:ring-1 focus:ring-cyan-500 text-slate-900 dark:text-white text-xs font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. 2FA Master Security PIN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                رمز التحقق المزدوج 2FA / Master PIN
              </label>
              <span className="text-[10px] text-cyan-700 dark:text-[#06b6d4] font-mono font-bold">6 أرقام سرية</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-amber-500" />
              </div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                dir="ltr"
                value={masterPin}
                onChange={(e) => setMasterPin(e.target.value.replace(/\D/g, ""))}
                placeholder="992026"
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-[#04080e] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white text-center tracking-[0.5em] text-sm font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || Boolean(lockoutTime && lockoutTime > 0)}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري مطابقة المفاتيح والتحقق من التشفير...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-slate-950" />
                <span>الولوج إلى لوحة الجذر (Root Access)</span>
              </>
            )}
          </button>
        </form>

        {/* Demo / Rapid Testing Helper Pill */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#1e3a5f]/60 text-center">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1b2a] dark:hover:bg-[#13253a] border border-amber-500/30 text-[11px] text-amber-800 dark:text-[#f3e5ab] font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>ملء تلقائي للمفاتيح المعتمدة (ROOT_SUPER_ADMIN | PIN: 992026)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
