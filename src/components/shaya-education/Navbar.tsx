"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  Users,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tv,
} from "lucide-react";

interface NavItem {
  labelAr: string;
  labelEn: string;
  href: string;
  badge?: {
    ar: string;
    en: string;
    isHot?: boolean;
  };
}

const NAV_ITEMS: NavItem[] = [
  {
    labelAr: "الرئيسية",
    labelEn: "Home",
    href: "#home",
  },
  {
    labelAr: "تصفح الدورات والمناهج",
    labelEn: "Browse Courses",
    href: "#courses",
  },
  {
    labelAr: "بنك الأسئلة والاختبارات",
    labelEn: "Exam & Quiz Bank",
    href: "#quizzes",
    badge: { ar: "محاكي ذكي", en: "AI Mock", isHot: true },
  },
  {
    labelAr: "نخبة المعلمين والمراكز",
    labelEn: "Top Instructors",
    href: "#instructors",
  },
  {
    labelAr: "انضم كمعلّم / استأجر منصتك",
    labelEn: "Teach on Shaya / LMS SaaS",
    href: "#teach",
    badge: { ar: "بوابة المعلم", en: "LMS Pro" },
  },
];

const SEARCH_SUGGESTIONS = [
  { ar: "اختبار القدرات العامة (محوسب)", en: "GAT Aptitude Test" },
  { ar: "التحصيلي العلمي (رياضيات وفيزياء)", en: "Tahsili Scientific" },
  { ar: "اللغة الإنجليزية الشاملة (IELTS / TOEFL)", en: "Comprehensive English (IELTS)" },
  { ar: "تطوير تطبيقات الويب (Next.js & React)", en: "Full-Stack Web Development" },
  { ar: "التسويق الرقمي والتجارة الإلكترونية", en: "Digital Marketing & E-Commerce" },
];

export function ShayaEducationNavbar() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  const isRtl = lang === "ar";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = nextLang;
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 font-sans" dir={isRtl ? "rtl" : "ltr"}>
      {/* 1. Top Ticker Banner */}
      {bannerVisible && (
        <div className="bg-gradient-to-r from-[#0066FF] via-[#0052CC] to-[#06B6D4] text-white text-xs py-2 px-4 shadow-sm relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-center sm:text-start">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                {isRtl ? "فرصة المعلمين والمراكز" : "For Tutors & Centers"}
              </span>
              <p className="font-medium text-xs truncate max-w-xl sm:max-w-none">
                {isRtl
                  ? "هل أنت معلّم أو مدرّب؟ افتح أكاديميتك الرقمية واستقبل طلابك مع شايا التعليمية | ابدأ التدريس اليوم واكسب دخلاً مستداماً"
                  : "Are you a tutor or academy? Launch your turnkey branded digital LMS and reach thousands of learners today."}
              </p>
              <a
                href="#teach"
                className="hidden md:inline-flex items-center gap-1 underline font-black text-amber-300 hover:text-white transition-colors"
              >
                <span>{isRtl ? "استأجر منصتك الآن" : "Start Teaching Now"}</span>
                <ArrowRight className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} />
              </a>
            </div>

            <button
              onClick={() => setBannerVisible(false)}
              className="text-white/70 hover:text-white p-1 rounded-md transition-colors shrink-0"
              title={isRtl ? "إغلاق الإشعار" : "Dismiss"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Glassmorphic Navbar */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          isScrolled
            ? "bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-slate-200 dark:border-[#1F2937] shadow-lg shadow-black/5"
            : "bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-slate-200/60 dark:border-[#1F2937]/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Shaya Soft Badge */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0066FF] via-[#0052CC] to-[#06B6D4] p-[2px] shadow-[0_0_20px_rgba(0,102,255,0.35)] group-hover:shadow-[0_0_25px_rgba(0,102,255,0.55)] transition-all transform group-hover:scale-105">
              <div className="w-full h-full rounded-[14px] bg-[#0B0F19] flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6 text-[#38BDF8]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  {isRtl ? "شايا التعليمية" : "Shaya Education"}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isRtl ? "إحدى منصات منظومة" : "Powered by"}
                </span>
                <span className="text-[10px] font-black text-[#0066FF] dark:text-[#38BDF8] tracking-wider font-mono">
                  SHAYA SOFT
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar with Autocomplete Dropdown */}
          <div className="hidden xl:block relative flex-1 max-w-xs">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={isRtl ? "ابحث عن مادة، دورة، مدرب..." : "Search courses, tutors, exams..."}
                className={`w-full bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] focus:border-[#0066FF] text-slate-900 dark:text-white text-xs rounded-xl py-2.5 outline-none transition-all ${
                  isRtl ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left"
                }`}
              />
            </div>

            {searchFocused && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-2.5 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-bold text-slate-400 block px-2 mb-1.5">
                  {isRtl ? "الأكثر بحثاً اليوم:" : "Trending Searches:"}
                </span>
                {SEARCH_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(isRtl ? item.ar : item.en)}
                    className="w-full text-start px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span>{isRtl ? item.ar : item.en}</span>
                    <ArrowRight className={`w-3 h-3 text-slate-400 ${isRtl ? "rotate-180" : ""}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#0066FF] dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#111827] transition-all relative group"
              >
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
                {item.badge && (
                  <span
                    className={`ml-1.5 mr-1.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                      item.badge.isHot
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38BDF8] border-[#0066FF]/30"
                    }`}
                  >
                    {isRtl ? item.badge.ar : item.badge.en}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Action Tools: Lang, Theme & Auth CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
              title={isRtl ? "Switch to English" : "التبديل إلى العربية"}
            >
              <Globe className="w-4 h-4 text-[#0066FF] dark:text-[#38BDF8]" />
              <span className="font-mono">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-[#1F2937] border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300 transition-colors"
              title={isRtl ? "تبديل المظهر" : "Toggle Theme"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Instructor Special Portal Button */}
            <a
              href="#teach"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#0066FF] dark:text-[#38BDF8] bg-[#0066FF]/10 dark:bg-[#0066FF]/15 border border-[#0066FF]/30 hover:bg-[#0066FF]/20 transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isRtl ? "انضم كمعلم" : "Teach on Shaya"}</span>
            </a>

            {/* Login & Sign Up Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111827] transition-colors"
              >
                {isRtl ? "دخول" : "Log In"}
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-l from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] text-white shadow-md shadow-[#0066FF]/25 hover:shadow-lg hover:shadow-[#0066FF]/40 transition-all transform hover:scale-[1.02]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isRtl ? "حساب جديد" : "Sign Up"}</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-[#1F2937] bg-white dark:bg-[#0B0F19] px-4 py-5 space-y-4 animate-in slide-in-from-top-4">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? "right-3.5" : "left-3.5"}`} />
              <input
                type="text"
                placeholder={isRtl ? "ابحث عن دورة أو مادة أو أستاذ..." : "Search courses, topics..."}
                className={`w-full bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white text-xs rounded-xl py-2.5 outline-none ${
                  isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
                }`}
              />
            </div>

            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111827]"
                >
                  <span>{isRtl ? item.labelAr : item.labelEn}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38BDF8]">
                      {isRtl ? item.badge.ar : item.badge.en}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#1F2937] flex flex-col gap-2">
              <a
                href="#teach"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38BDF8] border border-[#0066FF]/30"
              >
                {isRtl ? "انضم كمعلم / استأجر منصتك" : "Become an Instructor"}
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-[#111827] text-slate-800 dark:text-white border border-slate-200 dark:border-[#1F2937]"
                >
                  {isRtl ? "تسجيل الدخول" : "Log In"}
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl text-xs font-black text-center bg-[#0066FF] text-white shadow-md"
                >
                  {isRtl ? "حساب جديد" : "Sign Up"}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
