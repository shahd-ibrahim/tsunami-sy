"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, X, Lock } from "lucide-react";

interface KycRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionName?: string;
  actionText?: string;
  actionHref?: string;
}

export default function KycRequiredModal({
  isOpen,
  onClose,
  title = "يتطلب توثيق الهوية أولاً (KYC)",
  message,
  actionName,
  actionText = "توثيق الحساب الآن",
  actionHref = "/profile",
}: KycRequiredModalProps) {
  if (!isOpen) return null;

  const displayMessage =
    message ||
    (actionName
      ? `يتطلب ${actionName} توثيق هويتك أولاً لحماية حسابك وضمان أمان أموالك.`
      : "يتطلب شحن المحفظة وتنفيذ المعاملات توثيق هويتك أولاً لحماية حسابك وضمان أمان أموالك.");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative bg-white dark:bg-[#0d1b2a] border border-amber-400/40 dark:border-[#d4af37]/40 w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-5 text-right z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-[#d4af37] shadow-inner shrink-0">
            <Lock className="w-6 h-6 text-amber-600 dark:text-[#d4af37]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/30 mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-[#d4af37]" />
              <span>حساب بانتظار التوثيق</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Informative Explanation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{displayMessage}</p>
          <div className="pt-2 border-t border-slate-200 dark:border-[#1e3a5f]/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🛡️</span>
            <span>التحقق فوري عبر روبوت الذكاء الاصطناعي وبإمكانك إتمام التوثيق خلال دقيقة واحدة.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <Link
            href={actionHref}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all transform hover:scale-[1.01]"
          >
            <span>{actionText}</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] transition-colors"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
