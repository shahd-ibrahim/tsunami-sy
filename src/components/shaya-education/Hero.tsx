"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Video,
  Play,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Star,
  Award,
  Zap,
  Lock,
  Layers,
  ChevronLeft,
} from "lucide-react";

interface HeroProps {
  lang?: "ar" | "en";
}

export function ShayaEducationHero({ lang = "ar" }: HeroProps) {
  const isRtl = lang === "ar";
  const [activeTab, setActiveTab] = useState<"student" | "instructor">("student");

  const popularTags = isRtl
    ? [
        { label: "اختبار القدرات العامة", href: "#courses?cat=gat" },
        { label: "التحصيلي العلمي", href: "#courses?cat=tahsili" },
        { label: "اللغة الإنجليزية (IELTS)", href: "#courses?cat=ielts" },
        { label: "البرمجة والذكاء الاصطناعي", href: "#courses?cat=ai" },
        { label: "إدارة الأعمال والتسويق", href: "#courses?cat=business" },
      ]
    : [
        { label: "GAT Aptitude", href: "#courses?cat=gat" },
        { label: "Tahsili Sciences", href: "#courses?cat=tahsili" },
        { label: "IELTS / TOEFL Prep", href: "#courses?cat=ielts" },
        { label: "AI & Full-Stack", href: "#courses?cat=ai" },
        { label: "Business & Growth", href: "#courses?cat=business" },
      ];

  const stats = isRtl
    ? [
        { value: "+50,000", label: "طالب وطالبة مسجلين", icon: Users, color: "text-[#0066FF]" },
        { value: "+1,200", label: "دورة ومادة دراسية وبنك أسئلة", icon: BookOpen, color: "text-[#06B6D4]" },
        { value: "+350", label: "معلّم وأكاديمية تدريب معتمدة", icon: GraduationCap, color: "text-[#F59E0B]" },
        { value: "99.9%", label: "جاهزية واستقرار البث السحابي", icon: Zap, color: "text-emerald-500" },
      ]
    : [
        { value: "+50,000", label: "Active Enrolled Students", icon: Users, color: "text-[#0066FF]" },
        { value: "+1,200", label: "Courses & Exam Banks", icon: BookOpen, color: "text-[#06B6D4]" },
        { value: "+350", label: "Verified Tutors & Centers", icon: GraduationCap, color: "text-[#F59E0B]" },
        { value: "99.9%", label: "Cloud Uptime & Low Latency", icon: Zap, color: "text-emerald-500" },
      ];

  return (
    <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-[#0B0F19] transition-colors duration-300">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#0066FF]/10 dark:bg-[#0066FF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-[#06B6D4]/10 dark:bg-[#06B6D4]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Segmented Persona Pill Switcher */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center p-1.5 rounded-full bg-slate-200/80 dark:bg-[#111827] border border-slate-300/80 dark:border-[#1F2937] shadow-inner text-xs font-bold">
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isRtl ? "أنا طالب / متعلّم" : "I am a Student"}</span>
            </button>
            <button
              onClick={() => setActiveTab("instructor")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === "instructor"
                  ? "bg-gradient-to-r from-[#0066FF] to-[#06B6D4] text-white shadow-md shadow-[#0066FF]/30"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isRtl ? "أنا معلّم / مركز تدريبي" : "I am a Tutor / Academy"}</span>
            </button>
          </div>
        </div>

        {/* Hero Grid: Text & Media */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Right Column (RTL) / Left Column (LTR): Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            {/* Trust Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0066FF]/10 dark:bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#0066FF] dark:text-[#38BDF8] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isRtl
                  ? "منظومة تعليمية متكاملة لجميع المراحل والتخصصات"
                  : "End-to-End Educational Marketplace & Turnkey LMS"}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.2]">
              {isRtl ? (
                <>
                  منصة شايا التعليمية —{" "}
                  <span className="bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] bg-clip-text text-transparent">
                    بوابتك لاكتساب المهارات
                  </span>{" "}
                  أو إطلاق أكاديميتك الخاصة.
                </>
              ) : (
                <>
                  Shaya Education —{" "}
                  <span className="bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] bg-clip-text text-transparent">
                    Master In-Demand Skills
                  </span>{" "}
                  or Launch Your Branded Academy.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {isRtl
                ? "المنصة التعليمية الذكية التي تجمع نخبة الأساتذة والمدربين في المناهج المدرسية، اللغات، العلوم، وتكنولوجيا المعلومات مع مئات آلاف الطلاب في بيئة تفاعلية عالية الأداء مع اختبارات ذكية وبث مشفر."
                : "The open SaaS LMS connecting vetted school teachers, university professors, and corporate trainers with learners across academic curricula, languages, and technical disciplines."}
            </p>

            {/* Dual Call-to-Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-black shadow-xl shadow-[#0066FF]/30 hover:shadow-2xl hover:shadow-[#0066FF]/50 transition-all transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isRtl ? "استكشف الدورات والمناهج" : "Explore Courses & Curricula"}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
              </a>

              <a
                href="#teach"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-900 dark:text-white border-2 border-slate-300 dark:border-[#1F2937] hover:border-[#0066FF] dark:hover:border-[#0066FF] text-sm font-bold shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isRtl ? "ابدأ التدريس وأنشئ دورتك" : "Teach on Shaya / Rent LMS"}</span>
              </a>
            </div>

            {/* Popular Topics Quick Strip */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                {isRtl ? "التصنيفات الرائجة في المنصة:" : "Popular disciplines:"}
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5">
                {popularTags.map((tag, idx) => (
                  <a
                    key={idx}
                    href={tag.href}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#111827] hover:bg-[#0066FF]/10 dark:hover:bg-[#0066FF]/20 text-slate-700 dark:text-slate-300 hover:text-[#0066FF] dark:hover:text-[#38BDF8] border border-slate-200 dark:border-[#1F2937] hover:border-[#0066FF]/40 transition-colors"
                  >
                    {tag.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column (RTL) / Right Column (LTR): Interactive Platform Simulation Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating Instructor Revenue Badge */}
              <div className="absolute -top-6 -right-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#111827]/95 border border-slate-200 dark:border-[#1F2937] shadow-xl backdrop-blur-md animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isRtl ? "أرباح المعلم هذا الشهر" : "Instructor Revenue"}
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {isRtl ? "18,450 ر.س" : "$4,920 USD"}
                  </span>
                </div>
              </div>

              {/* Main Interactive Classroom Showcase Card */}
              <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] shadow-2xl transition-all duration-300">
                {/* Classroom Video Header Bar */}
                <div className="p-3.5 bg-slate-100 dark:bg-[#0B0F19] border-b border-slate-200 dark:border-[#1F2937] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#0066FF]" />
                      {isRtl ? "بث مباشر تفاعلي: مراجعة القدرات" : "Live Class: GAT Mock Exam Review"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    LIVE
                  </span>
                </div>

                {/* Simulated Protected Video Screen with Dynamic Watermark */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-90" />

                  {/* Dynamic DRM Watermark simulation to prevent piracy */}
                  <div className="absolute top-4 left-4 z-10 opacity-30 select-none pointer-events-none text-[9px] font-mono text-cyan-400 bg-black/40 px-2 py-0.5 rounded">
                    SHAYA-DRM-PROTECTED // USER#88210
                  </div>

                  {/* Center Play Button */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-[#0066FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,102,255,0.6)] group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-7 h-7 fill-white translate-x-0.5" />
                  </div>

                  {/* Bottom Video Progress overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span>14:32 / 48:00</span>
                    <span className="text-[#38BDF8] font-bold">1080p FHD 60FPS</span>
                  </div>
                </div>

                {/* Classroom Chat & Instructor Details */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#06B6D4] p-[1.5px] shrink-0">
                        <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-xs font-black text-white">
                          ع.ش
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          {isRtl ? "أ. عبد الرحمن الشهري" : "Prof. Abdulrahman Al-Shehri"}
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF]" />
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isRtl ? "كبير مدربي القدرات والتحصيلي" : "Senior Quantitative Tutor"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>4.9</span>
                    </div>
                  </div>

                  {/* Simulated Automated Quiz Trigger */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1F2937] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          {isRtl ? "اختبار قصير لحظي (3 أسئلة)" : "Instant In-Class Quiz"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isRtl ? "تصحيح فوري وتقييم مباشر" : "Automated Live Grading"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-[#0066FF] text-white text-[11px] font-bold shadow-xs hover:bg-[#0052CC] transition-colors"
                    >
                      {isRtl ? "ابدأ الحل" : "Take Quiz"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Trust Badge */}
              <div className="absolute -bottom-6 -left-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-[#111827]/95 border border-slate-200 dark:border-[#1F2937] shadow-xl backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 border border-[#0066FF]/30 flex items-center justify-center text-[#0066FF]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {isRtl ? "حماية DRM ضد القرصنة" : "Anti-Piracy DRM"}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    {isRtl ? "منع تحميل وتسجيل الشاشة" : "Screen-capture proof"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Platform Live Stats Bar */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#1F2937] flex items-center justify-center shrink-0">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight block">
                    {item.value}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
