"use client";

import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, Trash2, RefreshCw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface KycUploadCardProps {
  label: string;
  required?: boolean;
  subLabel?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function KycUploadCard({
  label,
  required = false,
  subLabel,
  file,
  onChange,
  disabled = false,
}: KycUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      toast.error("صيغة غير مدعومة", {
        description: "يرجى اختيار صورة بصيغة PNG أو JPG أو WEBP",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً", {
        description: "الحد الأقصى المسموح به هو 5 ميجابايت",
      });
      return;
    }

    onChange(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
    // reset input so the same file could be selected again if cleared
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleTriggerPicker = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        // Empty State: Dashed dropzone
        <div
          onClick={handleTriggerPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-3.5 sm:p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
              : "border-slate-300 dark:border-[#1e3a5f] bg-slate-50/60 dark:bg-[#070e17]/50 hover:border-amber-500/80 dark:hover:border-amber-500/80 hover:bg-amber-500/[0.03]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#122339] border border-slate-200 dark:border-[#1e3a5f]/80 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
            <UploadCloud className="w-5 h-5 text-amber-500" />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
              <span>{label}</span>
              {required ? (
                <span className="text-rose-500 text-sm font-black">*</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
              )}
            </div>
            {subLabel && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{subLabel}</p>
            )}
          </div>

          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            اضغط لرفع الصورة أو اسحبها هنا
          </p>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            PNG, JPG حتى 5MB
          </span>
        </div>
      ) : (
        // Selected State: Preview Thumbnail + Info + Actions
        <div className="border border-slate-200 dark:border-[#1e3a5f] bg-slate-50/80 dark:bg-[#070e17]/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={label}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-slate-200 dark:border-[#1e3a5f] shadow-inner shrink-0 bg-slate-200 dark:bg-slate-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
            )}

            <div className="min-w-0 text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <span className="truncate">{label}</span>
                {required && <span className="text-rose-500 text-xs">*</span>}
              </div>

              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[220px] mt-0.5" dir="ltr">
                {file.name}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>جاهز ({formatFileSize(file.size)})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#122339] border border-slate-200 dark:border-[#1e3a5f] hover:bg-slate-100 dark:hover:bg-[#1a3353] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>تغيير</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>إزالة</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
