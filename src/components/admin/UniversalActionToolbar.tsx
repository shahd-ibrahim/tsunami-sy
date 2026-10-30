"use client";

import React, { useState } from "react";
import { Edit3, Trash2, Power, AlertTriangle, Loader2 } from "lucide-react";

interface UniversalActionToolbarProps {
  isActive: boolean;
  onToggleActive: () => Promise<void> | void;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  entityName?: string;
  isCompact?: boolean;
}

export function UniversalActionToolbar({
  isActive,
  onToggleActive,
  onEdit,
  onDelete,
  entityName = "هذا السجل",
  isCompact = false,
}: UniversalActionToolbarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleActive();
    } finally {
      setIsToggling(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${isCompact ? "p-1" : "p-1.5"} rounded-xl bg-slate-100/90 dark:bg-[#070e17]/80 border border-slate-200 dark:border-[#1e3a5f]/80 shadow-xs transition-colors`}>
        {/* 1. Toggle Switch (Active / Disabled) */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          title={isActive ? "تعطيل (إخفاء فوري من الواجهة)" : "تفعيل (إظهار فوري في الواجهة)"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Power className={`w-3 h-3 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`} />
          )}
          <span className="text-[11px] font-mono font-bold">
            {isActive ? "نشط" : "معطل"}
          </span>
        </button>

        {/* 2. Edit Action */}
        <button
          type="button"
          onClick={onEdit}
          title="تعديل البيانات"
          className="p-1.5 rounded-lg bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-[#1e3a5f] transition-colors cursor-pointer shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* 3. Delete Action */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          title="حذف نهائي"
          className="p-1.5 rounded-lg bg-white dark:bg-[#13253a] hover:bg-rose-500/15 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-[#1e3a5f] hover:border-rose-500/30 transition-colors cursor-pointer shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Double Confirmation Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d1b2a] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-right space-y-4 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">تأكيد الحذف النهائي</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                هل أنت متأكد من رغبتك في حذف <strong className="text-rose-600 dark:text-rose-400">{entityName}</strong>؟
              </p>
              <p className="text-[11px] text-slate-500">
                هذا الإجراء لا يمكن التراجع عنه وسيتم إزالة السجل من قاعدة البيانات.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>نعم، حذف نهائي</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#13253a] dark:hover:bg-[#1e3a5f] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors border border-slate-200 dark:border-[#1e3a5f] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
