"use client";

import React from "react";
import Image from "next/image";

export interface TsunamiLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen" | "page";
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function TsunamiLoader({
  size = "md",
  label = "جاري التحميل...",
  sublabel,
  className = "",
}: TsunamiLoaderProps) {
  const sizeMap = {
    sm: {
      box: "w-12 h-12",
      imageSize: 32,
      inner: "p-1.5 rounded-xl",
      border: "p-[1.5px] rounded-xl",
      text: "text-[11px]",
    },
    md: {
      box: "w-16 h-16 sm:w-20 sm:h-20",
      imageSize: 48,
      inner: "p-2 rounded-2xl",
      border: "p-[2px] rounded-2xl",
      text: "text-xs sm:text-sm",
    },
    lg: {
      box: "w-24 h-24 sm:w-28 sm:h-28",
      imageSize: 72,
      inner: "p-3 rounded-3xl",
      border: "p-[2.5px] rounded-3xl",
      text: "text-sm sm:text-base",
    },
    page: {
      box: "w-20 h-20 sm:w-24 sm:h-24",
      imageSize: 64,
      inner: "p-2.5 rounded-2xl",
      border: "p-[2px] rounded-2xl",
      text: "text-xs sm:text-sm",
    },
    fullscreen: {
      box: "w-20 h-20 sm:w-24 sm:h-24",
      imageSize: 64,
      inner: "p-2.5 rounded-2xl",
      border: "p-[2px] rounded-2xl",
      text: "text-xs sm:text-sm",
    },
  };

  const config = sizeMap[size] || sizeMap.md;

  const containerClasses =
    size === "fullscreen"
      ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070e17] select-none transition-opacity duration-200"
      : size === "page"
      ? `w-full min-h-[55vh] flex flex-col items-center justify-center select-none py-12 ${className}`
      : `flex flex-col items-center justify-center p-6 select-none ${className}`;

  return (
    <div
      className={containerClasses}
      role="status"
      aria-label={label}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Steady Golden/Cyan Glow behind logo (no blur filter, crystal clear) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/10 via-amber-500/10 to-transparent pointer-events-none" />

        {/* Steady subtle accent rings */}
        <div className="absolute -inset-2 rounded-full border border-amber-500/20 pointer-events-none opacity-60" />
        <div className="absolute -inset-4 rounded-full border border-cyan-500/15 pointer-events-none opacity-40" />

        {/* The Wave Emblem Container */}
        <div
          className={`relative ${config.box} ${config.border} bg-gradient-to-tr from-[#06b6d4] via-[#d4af37] to-[#0f3460] shadow-lg shadow-cyan-500/10 flex items-center justify-center overflow-hidden`}
          style={{ willChange: "transform", transform: "translateZ(0)" }}
        >
          {/* Inner dark ocean frame */}
          <div
            className={`w-full h-full bg-[#070e17] ${config.inner} flex items-center justify-center relative overflow-hidden`}
          >
            {/* Shimmer Light Sweep Effect across emblem */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-[#d4af37]/15 to-transparent pointer-events-none" />

            {/* Official TSUNAMI Wave Mark */}
            <div className="relative w-full h-full flex items-center justify-center animate-[wave-breathe_3s_ease-in-out_infinite]">
              <Image
                src="/images/logo.png"
                alt="TSUNAMI"
                width={config.imageSize}
                height={config.imageSize}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.25)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography & Animated Wave Indicator */}
      {label && (
        <div className="mt-4 text-center flex flex-col items-center gap-1.5 select-none">
          <div className="flex items-center gap-1">
            <span
              className={`${config.text} font-black text-slate-800 dark:text-[#f3e5ab] tracking-wide leading-tight`}
            >
              {label}
            </span>
            {/* Subtle animated ocean dots */}
            <span className="flex items-center gap-0.5 text-amber-500 dark:text-[#d4af37]">
              <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
              <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
              <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce" />
            </span>
          </div>

          {sublabel && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
              {sublabel}
            </p>
          )}

          {/* Mini Gold-Cyan Wave Lightbar Indicator */}
          <div className="w-16 h-0.5 rounded-full bg-slate-200 dark:bg-[#13253a] overflow-hidden mt-1.5">
            <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-cyan-500 rounded-full animate-[wave-bar_1.8s_ease-in-out_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
}

export { TsunamiLoader as PageLoader };
