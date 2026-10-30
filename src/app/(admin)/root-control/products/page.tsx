"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Tag,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  DollarSign,
  Layers,
  ArrowUpDown,
  Sparkles,
  Loader2,
  Gamepad2,
  Tv,
  CreditCard,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { DynamicProductItem } from "@/lib/dynamic-hub";

export default function RootProductsPricingPage() {
  const [products, setProducts] = useState<DynamicProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    slug: "",
    categoryId: "chat",
    iconUrl: "/images/soulstar_icon.jpg",
    bannerUrl: "",
    unitType: "Coins",
    unitPriceUser: 0.001,
    unitPriceReseller: 0.0009,
    requiresUid: true,
    uidLabel: "معرف الحساب / Player ID",
    validationApiUrl: "",
    description: "",
  });

  const CATEGORIES = [
    { id: "ALL", name: "جميع التطبيقات والخدمات" },
    { id: "chat", name: "تطبيقات الدردشة والبث", icon: Tv },
    { id: "gaming", name: "شحن الألعاب", icon: Gamepad2 },
    { id: "cards", name: "بطاقات رقمية", icon: CreditCard },
    { id: "telecom", name: "اتصالات وكاش محلي", icon: Smartphone },
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      toast.error("فشل تحميل قائمة المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      nameAr: "",
      nameEn: "",
      slug: "",
      categoryId: "chat",
      iconUrl: "/images/soulstar_icon.jpg",
      bannerUrl: "",
      unitType: "Coins",
      unitPriceUser: 0.001,
      unitPriceReseller: 0.0009,
      requiresUid: true,
      uidLabel: "معرف الحساب / Player ID",
      validationApiUrl: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: DynamicProductItem) => {
    setIsEditing(true);
    setEditingId(p.id);
    setFormData({
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: p.slug,
      categoryId: p.categoryId,
      iconUrl: p.iconUrl,
      bannerUrl: p.bannerUrl || "",
      unitType: p.unitType,
      unitPriceUser: p.unitPriceUser,
      unitPriceReseller: p.unitPriceReseller,
      requiresUid: p.requiresUid,
      uidLabel: p.uidLabel,
      validationApiUrl: p.validationApiUrl || "",
      description: p.description || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          !currentStatus ? "تم تفعيل المنتج وإظهاره على المتجر" : "تم إخفاء المنتج من المتجر"
        );
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isActive: !currentStatus } : item))
        );
      } else {
        toast.error(data.error || "فشل تحديث الحالة");
      }
    } catch {
      toast.error("حدث خطأ أثناء تحديث حالة المنتج");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}" نهائياً من الكتالوج؟`)) return;

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`تم حذف "${name}" بنجاح`);
        setProducts((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(data.error || "فشل حذف المنتج");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? { id: editingId, ...formData } : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditing ? "تم تحديث المنتج بنجاح" : "تمت إضافة التطبيق الجديد بنجاح!");
        setIsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "فشلت العملية");
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#f3e5ab] text-xs font-bold mb-2 border border-[#d4af37]/30">
            <Tag className="w-4 h-4 text-[#d4af37]" /> المحرك الديناميكي لإدارة الكتالوج
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            كتالوج التطبيقات، الألعاب والأسعار اللحظية
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إضافة ألعاب وتطبيقات جديدة مباشرة، التحكم بأسعار الوحدات للعميل والموزع، والتحكم بالظهور الفوري على المتجر
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-[#070e17] border border-[#1e3a5f] hover:border-[#d4af37] text-slate-300 hover:text-white transition-colors"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e5c05b] hover:to-[#d4af37] text-slate-950 text-xs font-black shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تطبيق / لعبة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-gradient-to-r from-[#d4af37] to-[#aa820a] text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "bg-[#070e17] text-slate-300 border border-[#1e3a5f] hover:border-slate-500"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الرمز slug..."
            className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <span className="text-xs text-slate-400">جاري مزامنة كتالوج المنتجات...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl p-12 text-center text-slate-400">
          لم يتم العثور على أي منتجات مطابقة للبحث أو التصنيف.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-[#0d1b2a] border rounded-3xl p-6 shadow-xl space-y-4 transition-all flex flex-col justify-between ${
                product.isActive ? "border-[#1e3a5f] hover:border-[#d4af37]" : "border-rose-900/40 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-[#1e3a5f]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#1e3a5f] bg-[#070e17] shrink-0">
                      <Image
                        src={product.iconUrl || "/images/pubg_icon.jpg"}
                        alt={product.nameAr}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{product.nameAr}</h3>
                      <span className="text-[11px] font-mono text-[#06b6d4] block">
                        {product.nameEn} ({product.slug})
                      </span>
                    </div>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => handleToggleActive(product.id, product.isActive)}
                    className="p-1 text-slate-300 hover:text-white transition-colors"
                    title={product.isActive ? "إيقاف المنتج" : "تفعيل المنتج"}
                  >
                    {product.isActive ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-500" />
                    )}
                  </button>
                </div>

                {/* Rates & Configuration Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-[#070e17] border border-[#1e3a5f] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">نوع الوحدة:</span>
                      <span className="font-bold text-[#f3e5ab]">{product.unitType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">سعر العميل العادي:</span>
                      <span className="font-mono text-white font-bold">
                        ${product.unitPriceUser} / لكل وحدة
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">سعر الموزع VIP:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ${product.unitPriceReseller} / لكل وحدة
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#1e3a5f]/60 pt-2">
                      <span className="text-slate-400">التحقق بالآيدي:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.requiresUid
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {product.requiresUid ? product.uidLabel : "غير مطلوب"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-[#1e3a5f]">
                <button
                  onClick={() => handleDeleteProduct(product.id, product.nameAr)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all"
                  title="حذف المنتج"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEditModal(product)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-200 text-xs font-bold border border-[#1e3a5f] transition-all"
                >
                  <Edit className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>تعديل المنتج والأسعار</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0d1b2a] border border-[#1e3a5f] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-[#070e17] text-slate-400 hover:text-white border border-[#1e3a5f]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                {isEditing ? "تعديل بيانات المنتج والأسعار" : "إضافة تطبيق أو لعبة جديدة للكتالوج"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                تظهر التغييرات على الفور في واجهة متجر تسونامي وتتاح للعملاء والموزعين
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الاسم بالعربية <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: بيجو لايف - Bigo Live"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    الاسم بالإنجليزية <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Bigo Live"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المعرّف البرمجي الفريد (Slug) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                    }
                    placeholder="bigo-live"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white font-mono rounded-xl p-3 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none"
                  >
                    <option value="chat">تطبيقات الدردشة والبث الصوتي</option>
                    <option value="gaming">شحن الألعاب</option>
                    <option value="cards">بطاقات رقمية</option>
                    <option value="telecom">اتصالات وكاش محلي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    نوع الوحدة (Unit Type)
                  </label>
                  <input
                    type="text"
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    placeholder="Coins / Diamonds / UC / Voucher"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    سعر الوحدة للمستخدم ($)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    min="0"
                    required
                    value={formData.unitPriceUser}
                    onChange={(e) => setFormData({ ...formData, unitPriceUser: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white font-mono rounded-xl p-3 outline-none"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    سعر الوحدة للموزع VIP ($)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    min="0"
                    required
                    value={formData.unitPriceReseller}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPriceReseller: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white font-mono rounded-xl p-3 outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رابط أيقونة التطبيق (Icon URL)
                </label>
                <input
                  type="text"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="/images/soulstar_icon.jpg أو رابط مباشر"
                  className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    تسمية حقل المعرف (UID Label)
                  </label>
                  <input
                    type="text"
                    value={formData.uidLabel}
                    onChange={(e) => setFormData({ ...formData, uidLabel: e.target.value })}
                    placeholder="مثال: معرف اللاعب (Player ID)"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    رابط API التحقق من الآيدي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.validationApiUrl}
                    onChange={(e) => setFormData({ ...formData, validationApiUrl: e.target.value })}
                    placeholder="https://api.game.com/v1/verify"
                    className="w-full bg-[#070e17] border border-[#1e3a5f] focus:border-[#d4af37] text-xs text-white rounded-xl p-3 outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqUid"
                  checked={formData.requiresUid}
                  onChange={(e) => setFormData({ ...formData, requiresUid: e.target.checked })}
                  className="w-4 h-4 rounded text-[#d4af37] focus:ring-0"
                />
                <label htmlFor="reqUid" className="text-xs font-bold text-slate-300 cursor-pointer">
                  تفعيل التحقق وإلزامية إدخال معرف اللاعب قبل الشحن
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa820a] hover:from-[#e5c05b] hover:to-[#d4af37] text-slate-950 text-xs font-black shadow-lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{isEditing ? "حفظ التعديلات" : "إضافة المنتج الآن"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
