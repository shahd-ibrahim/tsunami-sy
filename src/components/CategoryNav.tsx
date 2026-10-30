"use client";

import { CATEGORIES } from "@/lib/catalog";
import { Gamepad2, Tv, CreditCard, Smartphone, LayoutGrid } from "lucide-react";

interface CategoryNavProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryNav({
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Gamepad2":
        return <Gamepad2 className="w-4 h-4" />;
      case "Tv":
        return <Tv className="w-4 h-4" />;
      case "CreditCard":
        return <CreditCard className="w-4 h-4" />;
      case "Smartphone":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full mb-10">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black tracking-wide transition-all whitespace-nowrap ${
            selectedCategoryId === "all"
              ? "bg-gradient-to-l from-[#06b6d4] to-[#00a8b5] text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              : "bg-[#0d1b2a] text-slate-300 border border-[#1e3a5f] hover:border-[#00a8b5]/50 hover:bg-[#13253a]"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>جميع الخدمات</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs font-black tracking-wide transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-l from-[#d4af37] to-[#aa820a] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                  : "bg-[#0d1b2a] text-slate-300 border border-[#1e3a5f] hover:border-[#d4af37]/50 hover:bg-[#13253a]"
              }`}
            >
              {getIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
