"use client";

import { useState } from "react";
import { CatalogProduct } from "@/lib/catalog";
import { useUserRole } from "./UserRoleContext";
import { Zap, Shield, ArrowLeft, UserCheck, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  product: CatalogProduct;
  onSelect: (product: CatalogProduct) => void;
  onRequireAuth?: () => void;
}

export function ProductCard({ product, onSelect, onRequireAuth }: ProductCardProps) {
  const { role, currentUser } = useUserRole();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const lowestUserPrice = Math.min(...product.packages.map((p) => p.priceUser));
  const lowestResellerPrice = Math.min(...product.packages.map((p) => p.priceReseller));
  const activeLowestPrice = role === "RESELLER" ? lowestResellerPrice : lowestUserPrice;

  const displayImage = product.imageUrl || product.image;

  const handleCardClick = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        router.push(`/login?redirect=/product/${product.slug}`);
      }
      return;
    }
    onSelect(product);
  };

  return (
    <div className="group relative rounded-3xl bg-[#0d1b2a]/90 border border-[#1e3a5f] hover:border-[#d4af37] p-5.5 cursor-pointer transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_25px_rgba(212,175,55,0.25)] hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden text-right">
      {/* Decorative Metallic Corner Accent */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#d4af37]/15 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Top Tag & Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#13253a] border border-[#1e3a5f] text-[#06b6d4]">
            {product.categoryName}
          </span>
          {product.requiresPlayerId ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#f3e5ab] bg-[#d4af37]/10 px-2 py-0.5 rounded-md border border-[#d4af37]/30">
              <UserCheck className="w-3 h-3 text-[#d4af37]" /> شحن بالمعرّف UID
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <Shield className="w-3 h-3" /> تسليم فوري
            </span>
          )}
        </div>

        {/* Product Visual & Header with Real Image */}
        <div
          onClick={handleCardClick}
          className="flex items-center gap-4 mb-4"
        >
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#070e17] border border-[#1e3a5f] group-hover:border-[#d4af37] p-0.5 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.35)] transition-all shrink-0 flex items-center justify-center">
            {displayImage && !imageError ? (
              <img
                src={displayImage}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-amber-500/20 via-[#0d1b2a] to-cyan-500/20 flex flex-col items-center justify-center text-amber-300 group-hover:text-amber-200">
                <Zap className="w-6 h-6 mb-0.5 text-amber-400" />
                <span className="text-[8px] font-black uppercase tracking-wider text-slate-300 font-mono">
                  {product.gameCode || "TSUNAMI"}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-black text-white group-hover:text-[#f3e5ab] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          </div>
        </div>

        {/* Packages Badge Pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.packages.slice(0, 3).map((pkg) => (
            <span
              key={pkg.id}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#13253a] text-slate-300 border border-[#1e3a5f]/80"
            >
              {pkg.name}
            </span>
          ))}
          {product.packages.length > 3 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1e3a5f] text-[#06b6d4]">
              +{product.packages.length - 3} باقات أخرى
            </span>
          )}
        </div>
      </div>

      {/* Footer Price & Actions (Gated if unauthenticated) */}
      <div className="pt-4 border-t border-[#1e3a5f]/60 flex items-center justify-between">
        {currentUser ? (
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {role === "RESELLER" ? "سعر الجملة يبدأ من" : "الأسعار تبدأ من"}
            </span>
            <div className="text-lg font-black text-[#f3e5ab] font-mono">
              ${activeLowestPrice.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37]">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[11px]">سجّل الدخول لعرض الأسعار</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Link
                href={`/product/${product.slug}`}
                className="p-2 rounded-xl bg-[#13253a] hover:bg-[#1e3a5f] text-slate-300 hover:text-white border border-[#1e3a5f] transition-colors"
                title="فتح صفحة الخدمة المخصصة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => onSelect(product)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#13253a] group-hover:bg-gradient-to-l group-hover:from-[#d4af37] group-hover:to-[#aa820a] text-white group-hover:text-slate-950 border border-[#1e3a5f] group-hover:border-transparent transition-all shadow-sm"
              >
                <span>شحن فوري</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleCardClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-l from-[#d4af37] to-[#aa820a] hover:from-[#f3e5ab] hover:to-[#d4af37] text-slate-950 shadow-md transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
