"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Gamepad2,
  Plus,
  Search,
  RefreshCw,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { UniversalActionToolbar } from "@/components/admin/UniversalActionToolbar";

interface ProductRecord {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  iconUrl: string;
  bannerUrl?: string;
  categoryId: string;
  categoryName: string;
  unitType: string;
  unitPriceUser: number;
  unitPriceReseller: number;
  requiresUid: boolean;
  uidLabel: string;
  validationApiUrl?: string;
  isActive: boolean;
  description?: string;
  minQuantity?: number;
  stepQuantity?: number;
}

export default function RootAdminCatalogPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    slug: "",
    categoryId: "gaming",
    categoryName: "شحن الألعاب",
    iconUrl: "https://play-lh.googleusercontent.com/Se7jR6A5R0Mk9ClaIguf46yi2K3k32JsqKb3gAtrktIh3JwnFfxrQRmG9GLvdMpbxbMrReUOxzDkStxGxNo-5Q=s256",
    bannerUrl: "",
    unitType: "Coins",
    unitPriceUser: 0.001,
    unitPriceReseller: 0.0009,
    requiresUid: true,
    uidLabel: "معرف الحساب (Player UID)",
    validationApiUrl: "",
    description: "",
    minQuantity: 100,
    stepQuantity: 50,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      toast.error("فشل جلب قائمة الكتالوج");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggle = async (product: ProductRecord) => {
    const nextStatus = !product.isActive;
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: nextStatus } : p))
      );
      toast.success(
        nextStatus
          ? `تم تفعيل "${product.nameAr}" (يظهر الآن في المتجر العام)`
          : `تم تعطيل "${product.nameAr}" (تم إخفاؤه فوراً من المتجر)`
      );
    } catch (err: any) {
      toast.error(err.message || "فشل تغيير حالة المنتج");
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("تم حذف المنتج نهائياً من الكتالوج");
    } catch (err: any) {
      toast.error(err.message || "فشل حذف المنتج");
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nameAr: "",
      nameEn: "",
      slug: "",
      categoryId: "gaming",
      categoryName: "شحن الألعاب",
      iconUrl: "https://play-lh.googleusercontent.com/Se7jR6A5R0Mk9ClaIguf46yi2K3k32JsqKb3gAtrktIh3JwnFfxrQRmG9GLvdMpbxbMrReUOxzDkStxGxNo-5Q=s256",
      bannerUrl: "",
      unitType: "Coins",
      unitPriceUser: 0.001,
      unitPriceReseller: 0.0009,
      requiresUid: true,
      uidLabel: "معرف الحساب (Player UID)",
      validationApiUrl: "",
      description: "",
      minQuantity: 100,
      stepQuantity: 50,
    });
    setShowAddModal(true);
  };

  const openEditModal = (prod: ProductRecord) => {
    setEditingProduct(prod);
    setFormData({
      nameAr: prod.nameAr,
      nameEn: prod.nameEn,
      slug: prod.slug,
      categoryId: prod.categoryId,
      categoryName: prod.categoryName,
      iconUrl: prod.iconUrl,
      bannerUrl: prod.bannerUrl || "",
      unitType: prod.unitType,
      unitPriceUser: prod.unitPriceUser,
      unitPriceReseller: prod.unitPriceReseller,
      requiresUid: prod.requiresUid,
      uidLabel: prod.uidLabel,
      validationApiUrl: prod.validationApiUrl || "",
      description: prod.description || "",
      minQuantity: prod.minQuantity || 100,
      stepQuantity: prod.stepQuantity || 50,
    });
    setShowAddModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // Edit PUT
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            ...formData,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        toast.success("تم تحديث بيانات التطبيق / اللعبة بنجاح");
      } else {
        // Add POST
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        toast.success("تمت إضافة التطبيق / اللعبة بنجاح للكتالوج");
      }

      setShowAddModal(false);
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "فشل حفظ بيانات المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const matchesCat = selectedCategory === "all" || prod.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      prod.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-right transition-colors duration-200">
      {/* Top Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              إدارة الكتالوج، الألعاب، وتطبيقات الدردشة
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-[#f3e5ab] border border-amber-500/30 font-bold">
              {products.length} خدمة مسجلة
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            إضافة ألعاب وتطبيقات جديدة، ضبط مسارات الـ API وأسعار الصرف، والتحكم الفوري بالظهور في الواجهة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تطبيق / لعبة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 rounded-2xl p-4 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: "all", label: "الكل" },
            { id: "chat", label: "دردشة وبث صوتي" },
            { id: "gaming", label: "ألعاب إلكترونية" },
            { id: "cards", label: "بطاقات رقمية" },
            { id: "telecom", label: "اتصالات وكاش" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-amber-500/15 text-amber-800 dark:text-[#f3e5ab] border border-amber-500/40"
                  : "bg-slate-50 dark:bg-[#0d1b2a] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1e3a5f]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المعرّف..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Products Grid with Universal Action Toolbar on each card */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
          <span>جاري تحميل الكتالوج...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-8 space-y-3 shadow-xs">
          <Gamepad2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد منتجات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">يمكنك إضافة تطبيق أو لعبة جديدة عبر الزر أعلاه.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#0d1b2a] border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                prod.isActive
                  ? "border-slate-200 dark:border-[#1e3a5f] hover:border-amber-400 dark:hover:border-[#d4af37]/50"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070e17]/80 opacity-75"
              }`}
            >
              <div className="space-y-3">
                {/* Header row with Avatar and Status Toolbar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl border border-slate-200 dark:border-[#1e3a5f] overflow-hidden bg-slate-50 dark:bg-[#070e17] shrink-0">
                      {prod.iconUrl ? (
                        <Image
                          src={prod.iconUrl}
                          alt={prod.nameAr}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-sm">
                          {prod.nameAr.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{prod.nameAr}</span>
                        {!prod.isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                            مخفي
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">/{prod.slug}</span>
                    </div>
                  </div>

                  {/* Standardized 4-Operation Toolbar */}
                  <UniversalActionToolbar
                    isActive={prod.isActive}
                    onToggleActive={() => handleToggle(prod)}
                    onEdit={() => openEditModal(prod)}
                    onDelete={() => handleDelete(prod.id)}
                    entityName={prod.nameAr}
                    isCompact
                  />
                </div>

                {/* Rates & Specifications */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]/60 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">سعر العميل</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">${prod.unitPriceUser}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-sans block">سعر الموزع VIP</span>
                    <span className="font-bold text-cyan-600 dark:text-[#06b6d4]">${prod.unitPriceReseller}</span>
                  </div>
                </div>

                {prod.description && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#1e3a5f]/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>التصنيف: {prod.categoryId}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prod.unitType}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Universal Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d1b2a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8 space-y-5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e3a5f] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingProduct ? `تعديل خدمة: ${editingProduct.nameAr}` : "إضافة تطبيق أو لعبة جديدة"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ضبط الاسم، الرابط، مسار الـ API، وسعر الصرف</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="مثال: بيجو لايف - Bigo Live"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">المعرف اللاتيني (Slug) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="bigo-live"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">التصنيف *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none"
                  >
                    <option value="gaming">ألعاب إلكترونية</option>
                    <option value="chat">دردشة وبث صوتي</option>
                    <option value="cards">بطاقات رقمية</option>
                    <option value="telecom">اتصالات وكاش</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">نوع الوحدة *</label>
                  <input
                    type="text"
                    required
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    placeholder="Diamonds / Coins / UC"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">سعر الوحدة (للعميل $) *</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={formData.unitPriceUser}
                    onChange={(e) => setFormData({ ...formData, unitPriceUser: parseFloat(e.target.value) || 0 })}
                    placeholder="0.001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-amber-600 dark:text-amber-400 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">سعر الوحدة (للموزع VIP $) *</label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={formData.unitPriceReseller}
                    onChange={(e) => setFormData({ ...formData, unitPriceReseller: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0009"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-cyan-600 dark:text-[#06b6d4] font-mono text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">رابط الأيقونة (Icon URL)</label>
                  <input
                    type="url"
                    dir="ltr"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">مسار التحقق التلقائي (API Route / Provider)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.validationApiUrl}
                  onChange={(e) => setFormData({ ...formData, validationApiUrl: e.target.value })}
                  placeholder="https://api.provider.com/v1/player/verify"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white font-mono text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الوصف التسويقي والتعليمات</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="شحن فوري ومباشر بمعرّف الحساب..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingProduct ? "حفظ التعديلات" : "إضافة للكتالوج الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
