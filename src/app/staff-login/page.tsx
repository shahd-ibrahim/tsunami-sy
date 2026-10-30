"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("يرجى إدخال بيانات الدخول المشفرة الخاصة بالوكيل أو المشرف.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول لبوابة الإدارة");
      }

      toast.success("تم التحقق من الصلاحيات بنجاح", {
        description: `مرحباً ${data.user?.fullName} (${data.user?.role})`,
      });

      setTimeout(() => {
        window.location.href = "/root-admin";
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل الدخول إلى البوابة الآمنة");
      toast.error(err.message || "بيانات المشرف غير صالحة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#04080e] flex items-center justify-center p-4 text-right text-slate-100 font-sans selection:bg-[#06b6d4]/30">
      {/* Background technical grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f15_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0a1420] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden">
        {/* Subtle cyan glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00a8b5]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Security Crest */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#1e3a5f] p-[2px] mx-auto shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <div className="w-full h-full rounded-[14px] bg-[#070e17] flex items-center justify-center text-[#06b6d4]">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13253a] border border-[#00a8b5]/40 text-[#00a8b5] text-[10px] font-mono font-bold tracking-wider">
            <span>ISOLATED STAFF & AGENT GATEWAY</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white">
            بوابة الإدارة والوكلاء المعتمدين
          </h1>
          <p className="text-xs text-slate-400">
            تسجيل دخول آمن مخصص لمشرفي النظام ومسؤولي العمليات المالية
          </p>
        </div>

        {/* Notice Badge */}
        <div className="mb-5 p-3 rounded-xl bg-[#13253a]/80 border border-[#1e3a5f] flex items-start gap-2.5 text-[11px] text-slate-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>هذا المدخل مخصص حصراً للموظفين والوكلاء. يتم تشفير الجلسة عبر رمز حماية مستقل تماماً عن واجهة العملاء.</span>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              البريد الإلكتروني المهني
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@tsunami-sy.com"
                className="w-full bg-[#050c14] border border-[#1e3a5f] focus:border-[#00a8b5] focus:ring-1 focus:ring-[#00a8b5] text-white text-xs rounded-xl px-3.5 py-3 pr-10 outline-none transition-all placeholder:text-slate-500 text-left font-mono"
                dir="ltr"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رمز المرور السري
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#050c14] border border-[#1e3a5f] focus:border-[#00a8b5] focus:ring-1 focus:ring-[#00a8b5] text-white text-xs rounded-xl px-3.5 py-3 pr-10 outline-none transition-all placeholder:text-slate-500 text-left font-mono"
                dir="ltr"
              />
              <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-[#00a8b5] to-[#0891b2] hover:from-[#06b6d4] hover:to-[#00a8b5] text-slate-950 shadow-[0_0_20px_rgba(0,168,181,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق من التشفير...</span>
              </>
            ) : (
              <>
                <span>دخول لوحة التحكم والعمليات</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Staff Accounts for Verification */}
        <div className="mt-6 pt-4 border-t border-[#1e3a5f]/60">
          <p className="text-[10px] font-bold text-slate-400 text-center mb-2">
            حسابات المشرفين والوكلاء المعتمدة للفحص:
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <button
              type="button"
              onClick={() => handleDemoFill("admin@tsunami-sy.com", "Admin1234")}
              className="p-2 rounded-lg bg-[#050c14] hover:bg-[#13253a] border border-[#1e3a5f] text-[10px] text-slate-300 transition-colors"
            >
              مشرف عام: <span className="text-[#06b6d4] font-mono">admin@tsunami-sy.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("agent@tsunami-sy.com", "Agent1234")}
              className="p-2 rounded-lg bg-[#050c14] hover:bg-[#13253a] border border-[#1e3a5f] text-[10px] text-slate-300 transition-colors"
            >
              وكيل معتمد: <span className="text-[#00a8b5] font-mono">agent@tsunami-sy.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
