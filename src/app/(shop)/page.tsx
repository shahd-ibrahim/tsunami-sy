"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Lock,
  LogIn,
  UserPlus,
  X,
  Zap,
  Gamepad2,
  Tv,
  CreditCard,
  Smartphone,
  Coins,
  ShieldCheck,
  Plus,
  Loader2,
  Mail,
  ArrowLeft,
  KeyRound,
  Layers,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { PRODUCTS, CatalogProduct } from "@/lib/catalog";
import { ProductModal } from "@/components/ProductModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { CustomerDrawer } from "@/components/CustomerDrawer";
import { useUserRole } from "@/components/UserRoleContext";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

interface AppItem {
  id: string;
  name: string;
  slug?: string;
  categoryId: string; // 'chat', 'gaming', 'cards', 'telecom', 'subs'
  image?: string;
  icon?: any;
  badge: string;
  subText: string;
  catalogProductSlug?: string;
}

function AppIconDisplay({
  image,
  name,
  fallbackIcon: IconComponent,
}: {
  image?: string;
  name: string;
  fallbackIcon?: any;
}) {
  const [hasError, setHasError] = useState(false);

  if (image && !hasError) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-200"
        sizes="(max-width: 640px) 56px, 64px"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-amber-600 dark:text-[#d4af37] bg-gradient-to-br from-amber-500/10 via-slate-100 to-cyan-500/10 dark:from-[#13253a] dark:via-[#070e17] dark:to-[#0d1b2a]">
      {IconComponent ? (
        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
      ) : (
        <Zap className="w-6 h-6" />
      )}
    </div>
  );
}

export default function MobileFirstStorefront() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, numericId, userName, userEmail, walletBalance, refreshWallet, refreshUser } = useUserRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [activeProduct, setActiveProduct] = useState<CatalogProduct | null>(null);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [dynamicProducts, setDynamicProducts] = useState<any[]>([]);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setDynamicProducts(data.products);
        }
      })
      .catch(() => {});
  }, []);

  // In-modal Auth State (Instant Bottom-Sheet Login)
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Categories for the horizontal pill slider
  const CATEGORIES = [
    { id: "all", label: "الكل" },
    { id: "chat", label: "دردشة وبث" },
    { id: "gaming", label: "ألعاب" },
    { id: "cards", label: "بطاقات رقمية" },
    { id: "telecom", label: "أرصدة وكاش" },
  ];

  // Comprehensive clean list of apps
  const APPS_LIST: AppItem[] = [
    {
      id: "app-soulstar",
      name: "سول ستار",
      slug: "soulstar",
      catalogProductSlug: "soulstar",
      categoryId: "chat",
      image: "https://play-lh.googleusercontent.com/c1KAJZGCXdpnHBFSj4QpxhIwqNSeT66nI4szWIn1oLGhuRqCtVIToj0d632Eghns1KYJtv3ZNcjNZLTdgZZckw=s256",
      badge: "كوينز",
      subText: "شحن كوينز رسمي",
    },
    {
      id: "app-soulchill",
      name: "سول شيل",
      slug: "soulchill",
      catalogProductSlug: "soulchill",
      categoryId: "chat",
      image: "https://play-lh.googleusercontent.com/2CzmrbC4IbSEWQ_Vr_slE_B7CGHoyr7xkRSNzNDsh__i-3DTJ-xXgbQBDXe-7cUphjtrEKu_8x0SDJzSnXK4oQ=s256",
      badge: "ماسات",
      subText: "شحن ماسات فوري",
    },
    {
      id: "app-pubg",
      name: "ببجي موبايل",
      slug: "pubg-mobile",
      catalogProductSlug: "pubg-mobile",
      categoryId: "gaming",
      image: "https://play-lh.googleusercontent.com/Se7jR6A5R0Mk9ClaIguf46yi2K3k32JsqKb3gAtrktIh3JwnFfxrQRmG9GLvdMpbxbMrReUOxzDkStxGxNo-5Q=s256",
      badge: "شدات UC",
      subText: "تسليم فوري بالمعرّف",
    },
    {
      id: "app-freefire",
      name: "فري فاير",
      slug: "free-fire",
      catalogProductSlug: "free-fire",
      categoryId: "gaming",
      image: "https://play-lh.googleusercontent.com/cK-U0_B9GrnSy26SNISDuvU_hL4VggyqJ1J5V2oiuyVEfiGo7fzegdBjk0ejXPg3PKK5sPwumdLBbWv8KkBKLQ=s256",
      badge: "جواهر",
      subText: "شحن مباشر للحساب",
    },
    {
      id: "app-yallaludo",
      name: "يلا لودو",
      slug: "yalla-ludo",
      categoryId: "gaming",
      image: "https://play-lh.googleusercontent.com/_B8WTUQVNhy4frnK0ekTvxNUpYDL-HYfeJvM8jo7Zw58N-RoAWD2gC4ksVp5KDNdtiYDGBMo3DVBo8bcBkxBLw=s256",
      badge: "دايموند",
      subText: "ماسات وذهب",
    },
    {
      id: "app-sham-cash",
      name: "شام كاش (Sham Cash)",
      slug: "sham-cash",
      catalogProductSlug: "sham-cash",
      categoryId: "telecom",
      image: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
      badge: "الخيار الأول #1",
      subText: "حوالات وكاش فوري",
    },
    {
      id: "app-discord",
      name: "ديسكورد نيترو",
      slug: "discord-nitro",
      catalogProductSlug: "discord-nitro",
      categoryId: "chat",
      image: "https://play-lh.googleusercontent.com/w2DdjDHGSj3DQElQQM0_J3PsNsALS-WD3CBeH0aXOYceR-F3aT02gFonhoFzz-Tc9ec8Dx9cLqh48-tzIFcP=s256",
      badge: "اشتراك",
      subText: "نيترو جيمنج",
    },
    {
      id: "app-shahid",
      name: "شاهد VIP",
      slug: "shahid-vip",
      catalogProductSlug: "shahid-vip",
      categoryId: "subs",
      image: "https://play-lh.googleusercontent.com/OX_8Lxi6zQdeob7G9t45jHK889TOrfULfn4vf6MP6a3lx4U26naAbim14BIIKOmt1_5AbUpqgCFqldWzpp-LMro=s256",
      badge: "بث VIP",
      subText: "باقات شهرية وسنوية",
    },
    {
      id: "app-googleplay",
      name: "جوجل بلاي",
      slug: "google-play-card",
      catalogProductSlug: "google-play-card",
      categoryId: "cards",
      image: "https://cdn-icons-png.flaticon.com/512/888/888857.png",
      badge: "متجر Play",
      subText: "بطاقات رصيد رقمية",
    },
    {
      id: "app-playstation",
      name: "بلايستيشن",
      slug: "playstation-network",
      catalogProductSlug: "playstation-network",
      categoryId: "cards",
      image: "https://cdn-icons-png.flaticon.com/512/588/588328.png",
      badge: "PSN ستور",
      subText: "حسابات وبطاقات",
    },
    {
      id: "app-usdt",
      name: "تيذر USDT",
      slug: "usdt-trc20",
      catalogProductSlug: "usdt-trc20",
      categoryId: "telecom",
      image: "https://cdn-icons-png.flaticon.com/512/12114/12114250.png",
      badge: "TRC20",
      subText: "إيداع رقمي دولي",
    },
  ];

  // Dynamic Combined Apps List with Real-Time Active/Disabled Status
  const allApps = useMemo(() => {
    // Slugs explicitly set to inactive in Root Admin
    const disabledSlugs = new Set(
      dynamicProducts.filter((dp) => dp.isActive === false).map((dp) => dp.slug)
    );

    // Active base apps (excluding any disabled in root)
    const activeBaseApps = APPS_LIST.filter(
      (a) => !disabledSlugs.has(a.slug || a.catalogProductSlug || "")
    );

    const baseSlugs = new Set(activeBaseApps.map((a) => a.slug || a.catalogProductSlug));

    // Dynamic products added by root admin that are active
    const dynamicMapped: AppItem[] = dynamicProducts
      .filter((dp) => dp.isActive !== false && !baseSlugs.has(dp.slug))
      .map((dp) => ({
        id: dp.id,
        name: dp.nameAr,
        slug: dp.slug,
        catalogProductSlug: dp.slug,
        categoryId: dp.categoryId,
        image: dp.iconUrl || "/images/pubg_icon.jpg",
        badge: dp.unitType || "شحن فوري",
        subText: dp.description || "خدمة شحن معتمدة",
      }));

    return [...activeBaseApps, ...dynamicMapped];
  }, [dynamicProducts]);

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchesCat = activeCategory === "all" || app.categoryId === activeCategory;
      const matchesSearch =
        searchQuery === "" ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.subText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [allApps, activeCategory, searchQuery]);

  // Handle Tapping an App
  const handleAppTap = (app: AppItem) => {
    if (!currentUser) {
      setSelectedApp(app);
      setAuthError(null);
      setShowAuthSheet(true);
      return;
    }

    // Authenticated user
    openRechargeForApp(app);
  };

  const openRechargeForApp = (app: AppItem) => {
    if (app.catalogProductSlug) {
      const prod = PRODUCTS.find((p) => p.slug === app.catalogProductSlug);
      if (prod) {
        setActiveProduct(prod);
        return;
      }

      // Check dynamic products added by Admin
      const dyn = dynamicProducts.find((p) => p.slug === app.catalogProductSlug);
      if (dyn) {
        const dynamicCatalogProd: CatalogProduct = {
          id: dyn.id,
          name: dyn.nameAr,
          slug: dyn.slug,
          categoryId: dyn.categoryId,
          categoryName: dyn.categoryName || "شحن مباشر",
          image: dyn.iconUrl || "/images/pubg_icon.jpg",
          gameCode: dyn.slug.toUpperCase(),
          requiresPlayerId: dyn.requiresUid,
          playerIdPlaceholder: dyn.uidLabel || "معرف الحساب / Player ID",
          playerIdHelp: "أدخل معرّف الحساب الصحيح لإتمام الشحن الفوري.",
          description: dyn.description || `خدمة شحن ${dyn.nameAr} الفورية`,
          currencyName: dyn.unitType || "وحدات",
          unitPriceUser: dyn.unitPriceUser,
          unitPriceReseller: dyn.unitPriceReseller,
          minQuantity: dyn.minQuantity || 100,
          stepQuantity: dyn.stepQuantity || 100,
          presetAmounts: dyn.presetAmounts || [100, 500, 1000, 5000],
          packages: [
            {
              id: `pkg-${dyn.slug}-1`,
              name: `100 ${dyn.unitType}`,
              sku: `${dyn.slug.toUpperCase()}_100`,
              priceUser: Number((dyn.unitPriceUser * 100).toFixed(2)),
              priceReseller: Number((dyn.unitPriceReseller * 100).toFixed(2)),
              costPrice: Number((dyn.unitPriceReseller * 100 * 0.95).toFixed(2)),
              bonus: "تسليم فوري",
            },
            {
              id: `pkg-${dyn.slug}-2`,
              name: `500 ${dyn.unitType}`,
              sku: `${dyn.slug.toUpperCase()}_500`,
              priceUser: Number((dyn.unitPriceUser * 500).toFixed(2)),
              priceReseller: Number((dyn.unitPriceReseller * 500).toFixed(2)),
              costPrice: Number((dyn.unitPriceReseller * 500 * 0.95).toFixed(2)),
              bonus: "الأكثر طلباً",
              popular: true,
            },
          ],
        };
        setActiveProduct(dynamicCatalogProd);
        return;
      }
    }
    toast.info(`جاري تجهيز باقات شحن ${app.name}...`);
  };

  // Instant In-Modal Login Execution
  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAuthError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الدخول");
      }

      toast.success("تم تسجيل الدخول بنجاح!");
      await refreshWallet();
      setShowAuthSheet(false);

      // Open the selected app directly
      if (selectedApp) {
        openRechargeForApp(selectedApp);
      }
    } catch (err: any) {
      setAuthError(err.message || "فشل التحقق من البيانات");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleModalLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail && loginEmail.includes("@") ? loginEmail.trim().toLowerCase() : "user.google@gmail.com",
          name: "مستخدم Google المعتمد",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تسجيل الدخول بواسطة Google");

      toast.success("تم تسجيل الدخول بواسطة Google بنجاح!");
      await refreshWallet();
      await refreshUser();
      setShowAuthSheet(false);

      if (data.needsProfileCompletion) {
        window.location.href = "/complete-profile";
      } else if (selectedApp) {
        openRechargeForApp(selectedApp);
      }
    } catch (err: any) {
      setAuthError(err.message || "فشل تسجيل الدخول بواسطة Google");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="space-y-4 text-right font-sans antialiased transition-colors duration-200 pb-20 sm:pb-24 lg:pb-8">
      {/* 2. Search & Quick Actions */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن تطبيق أو لعبة (SoulStar, SoulChill, PUBG...)..."
            className="w-full h-10 text-xs px-3 pr-9 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/60 focus:border-amber-500 dark:focus:border-[#d4af37] text-slate-900 dark:text-white rounded-xl outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Deposit Button visible on desktop / tablet */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/deposit"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-sm transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>شحن المحفظة</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          CATEGORY FILTER TABS (البحث والتصنيفات)
         ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 w-full">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-3 py-1.5 whitespace-nowrap rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs scale-[1.02]"
                  : "bg-white dark:bg-[#0d1b2a] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-[#1e3a5f]/80 hover:bg-slate-100 dark:hover:bg-[#13253a]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          COMPACT MOBILE APP GRID (3 أعمدة بدلاً من البطاقات الضخمة)
         ======================================================== */}
      <div className="pt-1">
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 px-1 py-2">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <div
                  key={app.id}
                  onClick={() => handleAppTap(app)}
                  className="group flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f]/60 hover:border-amber-500/50 active:scale-95 transition-all text-center cursor-pointer shadow-xs"
                >
                  {/* App Icon: strictly constrained to w-14 h-14 sm:w-16 sm:h-16 rounded-2xl */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] shadow-md mb-1.5 shrink-0 flex items-center justify-center group-hover:border-amber-400 dark:group-hover:border-amber-400/60 transition-colors">
                    <AppIconDisplay
                      image={app.image}
                      name={app.name}
                      fallbackIcon={IconComponent}
                    />
                  </div>

                  {/* App Title */}
                  <h3 className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
                    {app.name}
                  </h3>

                  {/* Sub-tag */}
                  <p className="text-[9px] text-amber-600 dark:text-amber-400/80 truncate w-full mt-0.5">
                    {app.subText || app.badge}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <Zap className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
            <p className="text-xs">لم نتمكن من العثور على أي نتائج مطابقة لبحثك</p>
          </div>
        )}
      </div>

      {/* ========================================================
          SEO CONTENT BLOCK (تعزيز الظهور في محركات البحث وبناء الثقة)
         ======================================================== */}
      <section
        id="about"
        className="mt-8 pt-6 border-t border-slate-200 dark:border-[#1e3a5f]/80 space-y-5"
      >
        {/* Main Title H2 */}
        <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Premium Circular Arabic Calligraphy Logo Frame */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-500/40 shadow-xl shadow-amber-500/10 bg-gradient-to-br from-amber-500/15 via-slate-900/60 to-[#070e17] p-2 flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo-arabic.png"
                  alt="منصة تسونامي الرقمية"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/10 dark:bg-[#d4af37]/15 text-amber-800 dark:text-[#f3e5ab] text-xs font-bold mb-1 border border-amber-500/20 dark:border-[#d4af37]/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#d4af37]" />
                  من نحن - About TSUNAMI
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                  منصة تسونامي الرقمية (TSUNAMI)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/about"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors"
              >
                <span>صفحة من نحن الكاملة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsSeoExpanded(!isSeoExpanded)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#070e17] dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>{isSeoExpanded ? "عرض أقل" : "تفاصيل المنصة"}</span>
                {isSeoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17]/70 border border-slate-200 dark:border-[#1e3a5f]/60 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <p className="leading-relaxed">
              <strong>الرؤية:</strong> بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية الفورية بأعلى معايير الأمان والسرعة.
            </p>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>القيم الأساسية:</strong> تنفيذ آلي فوري، أسعار منافسة للمستخدمين والوكلاء، ودعم فني متواصل على مدار الساعة مع دعم حصري لوسائل الدفع المحلية وفي مقدمتها <strong>شام كاش</strong>.
            </p>
          </div>

          {/* 4 Pillars of Trust */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
              <span className="text-amber-500 text-base">⚡</span>
              <strong className="text-xs font-black text-slate-900 dark:text-white block">تنفيذ آلي فوري</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ربط مباشر مع واجهات الألعاب لتنفيذ الطلب خلال ثوانٍ بمجرد إدخال معرّف اللاعب (Player ID).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
              <span className="text-emerald-500 text-base">🔒</span>
              <strong className="text-xs font-black text-slate-900 dark:text-white block">محفظة مشفرة وتوثيق KYC</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                حماية الحسابات بنظام التحقق الذكي بالذكاء الاصطناعي وتشفير المعاملات المالية بالكامل.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
              <span className="text-cyan-500 text-base">💎</span>
              <strong className="text-xs font-black text-slate-900 dark:text-white block">أسعار الجملة والوكلاء</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                هوامش ربحية مجزية وحسومات خاصة لأصحاب المكاتب والوكلاء ومتاجر الألعاب المعتمدة.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 space-y-1">
              <span className="text-amber-500 text-base">💳</span>
              <strong className="text-xs font-black text-slate-900 dark:text-white block">شام كاش وبنوك محلية</strong>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                إيداع عبر شام كاش (الخيار الأول #1)، شركة الهرم، الحسابات البنكية التركية، وتيذر USDT الرقمي.
              </p>
            </div>
          </div>

          {/* Expandable Deep SEO Content */}
          {isSeoExpanded && (
            <div className="pt-4 border-t border-slate-200 dark:border-[#1e3a5f]/60 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                أبرز خدمات الشحن المتاحة على منصة تسونامي:
              </h3>
              <ul className="space-y-2 pr-4 list-disc list-outside">
                <li>
                  <strong>شحن كوينز سول ستار (SoulStar Coins):</strong> الشحن المعتمد لتطبيق SoulStar الصوتي بأسعار منافسة وتسليم فوري للحسابات لدعم الغرف وإرسال الهدايا.
                </li>
                <li>
                  <strong>الشحن الرسمي لبرنامج سول شيل (SoulChill Diamonds):</strong> باقات ماسات وكوينز سول شيل الحصرية للشحن المباشر عبر الآيدي مع أفضل أسعار الصرف.
                </li>
                <li>
                  <strong>شحن شدات ببجي موبايل (PUBG UC) وجواهر فري فاير (Free Fire):</strong> شحن الألعاب التنافسية العالمية بضغطة زر مع تأكيد فوري للاعب.
                </li>
                <li>
                  <strong>تحويلات شام كاش والبطاقات الرقمية:</strong> شحن فوري لحسابات ومحافظ شام كاش، وبطاقات جوجل بلاي وآيتونز وبلايستيشن داخل سوريا وخارجها.
                </li>
                <li>
                  <strong>شبكة الوكلاء والمكاتب:</strong> فروع معتمدة في دمشق، حلب، حمص، إسطنبول، وبغداد لتسهيل عمليات الدفع النقدي والإيداع المباشر.
                </li>
              </ul>

              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-[#d4af37]/10 border border-amber-500/20 dark:border-[#d4af37]/30 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>
                  اعتماد التطوير: تطوير وتشغيل بواسطة وكالة{" "}
                  <a
                    href="https://shayasoft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-500 hover:text-amber-400 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    شايا سوفت | SHAYA SOFT
                  </a>
                </span>
                <span className="font-mono text-slate-500" dir="ltr">tsunami-sy.com</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Anchor for Services Link in Header */}
      <div id="services" />

      {/* ========================================================
          MANDATORY AUTH WALL: SMOOTH BOTTOM-SHEET / MODAL
          With Immediate Email + Password inputs right inside!
         ======================================================== */}
      {showAuthSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all">
          <div className="w-full max-w-md bg-white dark:bg-[#0d1b2a] border-t sm:border border-slate-200 dark:border-[#d4af37]/50 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100 relative max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Top Close Button */}
            <button
              onClick={() => setShowAuthSheet(false)}
              className="absolute top-4 left-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 mb-5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-[#d4af37]/15 border border-amber-500/30 dark:border-[#d4af37]/40 flex items-center justify-center text-amber-700 dark:text-[#d4af37] mx-auto shadow-md">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                يرجى تسجيل الدخول لمتابعة الشحن
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {selectedApp
                  ? `قم بتسجيل الدخول الفوري لشحن ${selectedApp.name} واستعراض الباقات المخصصة`
                  : "سجّل الدخول للوصول إلى محفظتك وتنفيذ عمليات الشحن اللحظية"}
              </p>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold leading-relaxed text-right">
                {authError}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleModalLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-900 shadow-sm border border-slate-300 transition-all mb-3 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>تسجيل الدخول السريع بواسطة Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-[#1e3a5f] w-full" />
              <span className="bg-white dark:bg-[#0d1b2a] px-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 absolute">
                أو بالبريد الإلكتروني
              </span>
            </div>

            {/* Immediate In-Modal Login Form */}
            <form onSubmit={handleModalLogin} className="space-y-3.5 text-right">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pr-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-left font-mono"
                    dir="ltr"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37] focus:ring-1 focus:ring-amber-500 dark:focus:ring-[#d4af37] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pr-10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-left font-mono"
                    dir="ltr"
                  />
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول ومتابعة الشحن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Link to Register */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#1e3a5f]/60 text-center text-xs text-slate-500 dark:text-slate-400">
              ليس لديك حساب بعد؟{" "}
              <Link
                href="/register"
                onClick={() => setShowAuthSheet(false)}
                className="font-bold text-amber-700 dark:text-[#d4af37] hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PRODUCT RECHARGE MODAL (WHEN AUTHENTICATED)
         ======================================================== */}
      {activeProduct && (
        <ProductModal
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </div>
  );
}
