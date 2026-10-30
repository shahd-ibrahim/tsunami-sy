"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  Plus,
  RefreshCw,
  Check,
  X,
  Loader2,
  Trash2,
  Edit3,
  ExternalLink,
  Power,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { UniversalActionToolbar } from "@/components/admin/UniversalActionToolbar";

interface AboutContent {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  visionTitle: string;
  visionText: string;
  coreValues: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    isActive: boolean;
  }[];
  promoBanners: {
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
    link?: string;
    isActive: boolean;
  }[];
  updatedAt: string;
}

export default function RootAdminAboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTexts, setIsSavingTexts] = useState(false);

  // Form states for texts
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [visionTitle, setVisionTitle] = useState("");
  const [visionText, setVisionText] = useState("");

  // Modal states for Promo Banner
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    badge: "عرض خاص",
    link: "/deposit",
  });
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/about");
      const data = await res.json();
      if (data.success && data.about) {
        setContent(data.about);
        setHeroBadge(data.about.heroBadge || "");
        setHeroTitle(data.about.heroTitle || "");
        setHeroSubtitle(data.about.heroSubtitle || "");
        setVisionTitle(data.about.visionTitle || "");
        setVisionText(data.about.visionText || "");
      }
    } catch {
      toast.error("فشل جلب محتوى قسم من نحن");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSaveMainTexts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTexts(true);

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroBadge,
          heroTitle,
          heroSubtitle,
          visionTitle,
          visionText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("تم تحديث النصوص الترويجية والرؤية بنجاح");
      await fetchContent();
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ النصوص");
    } finally {
      setIsSavingTexts(false);
    }
  };

  const handleToggleValue = async (valId: string) => {
    try {
      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_VALUE", id: valId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent(data.about);
      toast.success("تم تحديث حالة تفعيل القيمة بالواجهة");
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير الحالة");
    }
  };

  const handleToggleBanner = async (banId: string) => {
    try {
      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_BANNER", id: banId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent(data.about);
      toast.success("تم تحديث حالة ظهور البانر");
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير الحالة");
    }
  };

  const handleDeleteBanner = async (banId: string) => {
    try {
      const res = await fetch(`/api/admin/about?id=${banId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent(data.about);
      toast.success("تم حذف البانر بنجاح");
    } catch (err: any) {
      toast.error(err.message || "فشل حذف البانر");
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBanner(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("تمت إضافة البانر الترويجي بنجاح");
      setShowBannerModal(false);
      setBannerForm({ title: "", subtitle: "", badge: "عرض خاص", link: "/deposit" });
      await fetchContent();
    } catch (err: any) {
      toast.error(err.message || "فشل إضافة البانر");
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  if (isLoading || !content) {
    return (
      <div className="py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400 mb-2" />
        <span>جاري تحميل بيانات المحتوى...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              إدارة محتوى 'من نحن' والرؤية والبانرات
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold">
              محتوى ديناميكي حي
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            التحكم الشامل في نصوص الرؤية والرسالة، القيم الأساسية، وبانرات العروض الترويجية في المتجر
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContent}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          title="تحديث البيانات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Main Hero & Vision Texts Form */}
      <form onSubmit={handleSaveMainTexts} className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>نصوص الواجهة الرئيسية والواجهة التعريفية</span>
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Live Sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الشارة الترويجية (Badge)</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">العنوان الرئيسي للمنصة</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الوصف التعريفي (Subtitle)</label>
          <textarea
            rows={2}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none resize-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-[#1e3a5f]/60">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">نص الرؤية الاستراتيجية (Vision)</label>
          <textarea
            rows={3}
            value={visionText}
            onChange={(e) => setVisionText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none resize-none focus:border-amber-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingTexts}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isSavingTexts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ وتطبيق النصوص الحية</span>
          </button>
        </div>
      </form>

      {/* 2. Promo Banners with CRUD & Active Switch */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500 dark:text-[#d4af37]" />
              <span>البانرات الترويجية والعروض الحية (Promo Banners)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">البانرات المعروضة أعلى الصفحة الرئيسية وصفحة الإيداع</p>
          </div>

          <button
            type="button"
            onClick={() => setShowBannerModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة بانر جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.promoBanners.map((banner) => (
            <div
              key={banner.id}
              className={`p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border transition-all flex flex-col justify-between space-y-3 ${
                banner.isActive
                  ? "border-slate-200 dark:border-[#1e3a5f] hover:border-amber-500/50"
                  : "border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {banner.badge || "إعلان"}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleBanner(banner.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        banner.isActive
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{banner.isActive ? "ظاهر" : "مخفي"}</span>
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="حذف البانر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">{banner.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{banner.subtitle}</p>
              </div>

              {banner.link && (
                <div className="pt-2 border-t border-slate-200 dark:border-[#1e3a5f]/40 text-[10px] text-cyan-600 dark:text-[#06b6d4] font-mono flex items-center justify-between">
                  <span>الرابط: {banner.link}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Core Values Grid with Active Toggle */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] shadow-sm space-y-4">
        <div className="border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>المميزات والقيم الأساسية (Core Values)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">البطاقات المعروضة في صفحة 'من نحن' وصفحة الدليل</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.coreValues.map((val) => (
            <div
              key={val.id}
              className={`p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border flex items-start justify-between gap-3 ${
                val.isActive ? "border-slate-200 dark:border-[#1e3a5f]" : "border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">{val.title}</h3>
                  {!val.isActive && (
                    <span className="text-[9px] font-bold px-1.5 rounded bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300">
                      معطل
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{val.description}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggleValue(val.id)}
                className={`p-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  val.isActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500 border border-slate-300 dark:border-slate-700"
                }`}
                title={val.isActive ? "تعطيل الميزة" : "تفعيل الميزة"}
              >
                <Power className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-amber-500/40 rounded-3xl p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">إضافة بانر ترويجي جديد</h3>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">عنوان البانر *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="خصم حصري على شدات ببجي..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الوصف أو التفاصيل *</label>
                <textarea
                  rows={2}
                  required
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="تسليم فوري ومباشر لجميع الحسابات..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none resize-none focus:border-amber-500 placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">شارة البانر</label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="عرض خاص / فوري"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رابط التوجيه</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                    placeholder="/deposit أو /product/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-amber-500 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#13253a] hover:bg-slate-200 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBanner}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>إضافة البانر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
