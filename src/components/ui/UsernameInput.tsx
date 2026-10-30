"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle2, XCircle, AtSign } from "lucide-react";

export interface UsernameInputProps {
  value: string;
  onChange: (val: string) => void;
  currentUserId?: string;
  initialUsername?: string | null;
  onValidityChange?: (isValid: boolean, isChecking: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
}

export default function UsernameInput({
  value,
  onChange,
  currentUserId,
  initialUsername,
  onValidityChange,
  disabled = false,
  required = false,
  placeholder = "tsunami_user",
  label = "اسم المستخدم / اللقب (Username)",
  id = "username-input",
  className = "",
}: UsernameInputProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Normalize initial value
  const normalizedInitial = initialUsername ? initialUsername.trim().toLowerCase() : "";

  // Handle typing: automatically normalize to lowercase without whitespace
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const lower = rawVal.toLowerCase().replace(/\s+/g, "");
    onChange(lower);
  };

  useEffect(() => {
    // Clear any previous debounce timer or ongoing fetch
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = value.trim().toLowerCase();

    // 1. If empty
    if (!trimmed) {
      if (required) {
        setStatus("invalid");
        setFeedbackMessage("اسم المستخدم مطلوب");
        onValidityChange?.(false, false);
      } else {
        setStatus("idle");
        setFeedbackMessage("");
        onValidityChange?.(true, false);
      }
      return;
    }

    // 2. If identical to user's existing username
    if (normalizedInitial && trimmed === normalizedInitial) {
      setStatus("available");
      setFeedbackMessage("✅ اسم المستخدم متاح");
      onValidityChange?.(true, false);
      return;
    }

    // 3. Minimum length validation (< 3 chars)
    if (trimmed.length < 3) {
      setStatus("invalid");
      setFeedbackMessage("يجب أن يكون اسم المستخدم 3 أحرف على الأقل");
      onValidityChange?.(false, false);
      return;
    }

    // 4. Regex validation (letters, numbers, underscores, dots only)
    const validRegex = /^[a-zA-Z0-9_.]+$/;
    if (!validRegex.test(trimmed)) {
      setStatus("invalid");
      setFeedbackMessage("يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)");
      onValidityChange?.(false, false);
      return;
    }

    // 5. Valid format -> initiate 400ms debounce check
    setStatus("checking");
    setFeedbackMessage("جاري التحقق من توفر الاسم...");
    onValidityChange?.(false, true); // disable submit while checking

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const queryParams = new URLSearchParams({
          username: trimmed,
          ...(currentUserId ? { currentUserId } : {}),
        });

        const res = await fetch(`/api/user/check-username?${queryParams.toString()}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (data.available === true) {
          setStatus("available");
          setFeedbackMessage("✅ اسم المستخدم متاح");
          onValidityChange?.(true, false);
        } else {
          setStatus("taken");
          setFeedbackMessage(data.message || "❌ اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر");
          onValidityChange?.(false, false);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setStatus("invalid");
        setFeedbackMessage("فشل التحقق من اسم المستخدم، يرجى المحاولة ثانية");
        onValidityChange?.(false, false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [value, normalizedInitial, currentUserId, required]);

  // Determine border and ring styles based on status
  const getBorderClasses = () => {
    switch (status) {
      case "available":
        return "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30";
      case "taken":
      case "invalid":
        return "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30";
      case "checking":
        return "border-sky-400 dark:border-sky-500/70 focus:border-sky-500";
      default:
        return "border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 dark:focus:border-[#d4af37]";
    }
  };

  return (
    <div className={`space-y-1 text-right ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-800 dark:text-slate-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={placeholder}
          dir="ltr"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          className={`w-full bg-slate-50 dark:bg-[#070e17] text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 pl-9 pr-9 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-left border ${getBorderClasses()} disabled:opacity-50 disabled:cursor-not-allowed`}
        />

        {/* Leading At-Sign Icon (@) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <AtSign className="w-3.5 h-3.5" />
        </div>

        {/* Trailing Status Indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {status === "checking" && (
            <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
          )}
          {status === "available" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in-75 duration-200" />
          )}
          {(status === "taken" || status === "invalid") && (
            <XCircle className="w-4 h-4 text-rose-500 animate-in zoom-in-75 duration-200" />
          )}
        </div>
      </div>

      {/* Dynamic Feedback Message */}
      {feedbackMessage && (
        <div
          className={`text-[11px] font-semibold mt-1 flex items-center gap-1 transition-all ${
            status === "available"
              ? "text-emerald-600 dark:text-emerald-400"
              : status === "checking"
              ? "text-sky-600 dark:text-sky-400 animate-pulse"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
}
