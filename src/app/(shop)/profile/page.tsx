"use client";

import { useState } from "react";
import { useUserRole } from "@/components/UserRoleContext";
import Link from "next/link";
import {
  User,
  Copy,
  Check,
  Wallet,
  Plus,
  Mail,
  Phone,
  Globe,
  Lock,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ArrowRight,
  ClipboardList,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Bot,
  Camera,
  Clock,
  X,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import UsernameInput from "@/components/ui/UsernameInput";
import PageLoader from "@/components/ui/PageLoader";
import KycUploadCard from "@/components/ui/KycUploadCard";

export default function ProfilePage() {
  const {
    currentUser,
    userId,
    numericId,
    userName,
    userEmail,
    role,
    walletBalance,
    logout,
    refreshUser,
    saveSessionLocally,
    isAuthLoading,
    isInitialized,
  } = useUserRole();

  const [copied, setCopied] = useState(false);

  // Edit Profile State (Legal Name, Username, Phone, Country)
  const isVerified = Boolean(currentUser?.isVerified);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(currentUser?.name || "");
  const [usernameInput, setUsernameInput] = useState(currentUser?.username || "");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || "");
  const [countryInput, setCountryInput] = useState(currentUser?.countryName || "سوريا");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // KYC Identity Verification Modal & Form State
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycFullName, setKycFullName] = useState(currentUser?.name || userName || "");
  const [kycIdNumber, setKycIdNumber] = useState("");
  const [kycFrontFile, setKycFrontFile] = useState<File | null>(null);
  const [kycBackFile, setKycBackFile] = useState<File | null>(null);
  const [kycSelfieFile, setKycSelfieFile] = useState<File | null>(null);
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycStatusState, setKycStatusState] = useState<string>(
    currentUser?.kycStatus || (currentUser?.isVerified ? "AUTO_VERIFIED" : "NOT_SUBMITTED")
  );
  const [kycBotFeedback, setKycBotFeedback] = useState<string | null>(null);

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kycFullName.trim()) {
      toast.error("يرجى إدخال الاسم الكامل كما هو مدون بالهوية");
      return;
    }

    if (!kycIdNumber.trim() || kycIdNumber.trim().length < 8) {
      toast.error("يرجى إدخال رقم وطني صحيح (8 أرقام على الأقل)");
      return;
    }

    if (!kycFrontFile) {
      toast.error("يرجى رفع صورة وجه الهوية الأمامي");
      return;
    }

    if (!kycSelfieFile) {
      toast.error("يرجى رفع صورة السيلفي مع الهوية");
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId || "user-1004");
      formData.append("userName", (kycFullName || userName || "").trim());
      formData.append("idNumber", kycIdNumber.trim());
      formData.append("phone", (phoneInput || currentUser?.phone || "").trim());
      formData.append("idCardFront", kycFrontFile);
      if (kycBackFile) {
        formData.append("idCardBack", kycBackFile);
      }
      if (kycSelfieFile) {
        formData.append("selfie", kycSelfieFile);
      }

      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setKycStatusState(data.kyc.status);
        setKycBotFeedback(data.kyc.botNotes);
        setKycFrontFile(null);
        setKycBackFile(null);
        setKycSelfieFile(null);
        setShowKycModal(false);
        await refreshUser();
      } else {
        toast.error(data.error || "فشل إرسال طلب التوثيق");
      }
    } catch {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const handleCopyId = () => {
    const textToCopy = `#${numericId}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("تم نسخ معرّف الحساب بنجاح", { description: textToCopy });
    setTimeout(() => setCopied(false), 2000);
  };

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      toast.error("يرجى اختيار صورة بصيغة PNG أو JPG أو WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت");
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Image = reader.result as string;
        const res = await fetch("/api/auth/update-profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل رفع الصورة");

        if (data.user) {
          saveSessionLocally(data.user, data.token);
        }

        toast.success("تم تحديث الصورة الشخصية بنجاح!");
        await refreshUser();
      } catch (err: any) {
        toast.error(err.message || "حدث خطأ أثناء رفع الصورة");
      } finally {
        setIsUploadingAvatar(false);
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setIsUploadingAvatar(false);
      toast.error("فشل قراءة ملف الصورة");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameInput.trim() && !isUsernameValid) {
      toast.error("يرجى اختيار اسم مستخدم متاح وصالح");
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isVerified ? {} : { name: fullNameInput.trim() }),
          username: usernameInput.trim().toLowerCase() || null,
          phone: phoneInput.trim(),
          countryName: countryInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تحديث البيانات");

      if (data.user) {
        saveSessionLocally(data.user, data.token);
      }

      toast.success("تم تحديث البيانات الشخصية بنجاح");
      setIsEditingProfile(false);
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("كلمة المرور الجديدة يجب أن تكون 8 خانات على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تغيير كلمة المرور");

      toast.success("تم تغيير كلمة المرور بنجاح");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "حدث خطأ");
      toast.error(err.message || "فشل تغيير كلمة المرور");
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isAuthLoading || !isInitialized) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <PageLoader size="page" label="جاري مزامنة بيانات الحساب..." sublabel="يرجى الانتظار ثوانٍ معدودة" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center transition-colors duration-200">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-slate-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">يرجى تسجيل الدخول</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
          يجب تسجيل الدخول لعرض الملف الشخصي وبطاقة الهوية الرقمية.
        </p>
        <Link
          href="/login?redirect=/profile"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md"
        >
          <span>تسجيل الدخول الآن</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isGoogleUser = currentUser.authProvider === "GOOGLE";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 text-right transition-colors duration-200">
      {/* 1. Header & Identity Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            {/* User Avatar with Edit / Camera Upload Button */}
            <div className="relative group shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#00a8b5] to-[#d4af37] p-[2px] shadow-md">
                <div className="w-full h-full rounded-[14px] bg-slate-900 dark:bg-[#070e17] flex items-center justify-center text-2xl font-black text-[#d4af37] overflow-hidden">
                  {currentUser.image ? (
                    <img
                      src={currentUser.image}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userName.charAt(0) || "U"
                  )}
                </div>
              </div>

              {/* Upload Overlay Button */}
              <label
                htmlFor="avatar-upload-input"
                className="absolute -bottom-1 -left-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-lg cursor-pointer border-2 border-white dark:border-[#0d1b2a] transition-all transform hover:scale-110 active:scale-95"
                title="تغيير الصورة الشخصية (PNG, JPG, WEBP)"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={isUploadingAvatar}
                onChange={handleAvatarUpload}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {currentUser.username || userName}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-[#13253a] dark:text-[#06b6d4] border border-amber-300 dark:border-[#06b6d4]/30">
                  {role === "RESELLER" ? "موزع معتمد" : "عميل موثق"}
                </span>
              </div>
              {currentUser.username && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  الاسم القانوني: <span className="font-bold text-slate-700 dark:text-slate-300">{userName}</span>
                </p>
              )}

              {/* 4-Digit Numeric ID Pill with Copy Button */}
              <div className="flex items-center gap-2 mt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#d4af37]/40 text-xs font-mono font-bold text-slate-800 dark:text-[#f3e5ab]">
                  <span className="text-slate-400 font-sans text-[10px]">المعرّف:</span>
                  <span className="text-amber-700 dark:text-[#d4af37] font-black">#{numericId}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded-md bg-slate-50 dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                  title="نسخ المعرف"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">تم</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">نسخ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Balance Pill with Direct Deposit */}
          <div className="w-full sm:w-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between sm:justify-start gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                الرصيد المتاح
              </span>
              <span className="text-xl font-black text-amber-600 dark:text-[#d4af37] font-mono">
                ${walletBalance.toFixed(2)}
              </span>
            </div>

            <Link
              href="/deposit"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-xs transition-all transform hover:scale-[1.02] whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إيداع رصيد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Compact 2-Column Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Personal Information & Quick Actions */}
        <div className="space-y-5">
          {/* Card: البيانات الشخصية */}
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600 dark:text-[#06b6d4]" />
                البيانات الشخصية
              </h3>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setFullNameInput(currentUser.name || "");
                    setUsernameInput(currentUser.username || "");
                    setPhoneInput(currentUser.phone || "");
                    setCountryInput(currentUser.countryName || "سوريا");
                    setIsEditingProfile(true);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-[#06b6d4] dark:hover:text-[#38bdf8] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 pt-1">
                {/* 1. Full Legal Name (Locked if Verified) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>الاسم الكامل / الاسم القانوني</span>
                      {isVerified && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                    </label>
                    {isVerified ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>مقفل بالهوية (KYC)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">قابل للتعديل قبل التوثيق</span>
                    )}
                  </div>

                  {isVerified ? (
                    <div>
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={fullNameInput}
                        className="w-full bg-slate-100 dark:bg-[#070e17]/80 border border-slate-300 dark:border-[#1e3a5f]/60 text-slate-500 dark:text-slate-400 text-xs rounded-xl px-3 py-2 outline-none font-medium text-right cursor-not-allowed select-none"
                        title="تم قفل الاسم لمطابقته مع وثيقة الهوية الموثقة"
                      />
                      <p className="text-[10.5px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3 shrink-0" />
                        <span>تم قفل الاسم لمطابقته مع وثيقة الهوية الموثقة</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        required
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder="الاسم الكامل كما في الهوية"
                        className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-medium text-right"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        يمكنك تعديل اسمك القانوني بحرية قبل تقديم طلب التوثيق الرسمي.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Username (Always Editable with 400ms Real-Time Debounce) */}
                <UsernameInput
                  value={usernameInput}
                  onChange={setUsernameInput}
                  currentUserId={currentUser?.id}
                  initialUsername={currentUser?.username || null}
                  onValidityChange={(valid, checking) => setIsUsernameValid(valid && !checking)}
                  placeholder="tsunami_pro"
                  label="اسم المستخدم / اللقب (Username)"
                  id="profile-username-input"
                />

                {/* 3. Country & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الدولة
                    </label>
                    <input
                      type="text"
                      required
                      value={countryInput}
                      onChange={(e) => setCountryInput(e.target.value)}
                      placeholder="سوريا، تركيا..."
                      className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-medium text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+9639XXXXXXXX"
                      className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] focus:border-amber-500 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-200 dark:border-[#1e3a5f]">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile || !isUsernameValid}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>حفظ التعديلات</span>}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2.5 text-xs">
                {/* Legal Name & Username Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-slate-400 block">الاسم القانوني الكامل</span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-500/30">
                          <Lock className="w-2.5 h-2.5 text-amber-500" />
                          موثق
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400">غير موثق</span>
                      )}
                    </div>
                    <span className="text-slate-900 dark:text-slate-200 text-xs font-bold block truncate">
                      {currentUser.name}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block mb-0.5">اسم المستخدم / اللقب</span>
                    <span className="text-slate-900 dark:text-slate-200 text-xs font-bold block truncate">
                      {currentUser.username ? `@${currentUser.username}` : "لم يُحدد بعد"}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">البريد الإلكتروني</span>
                      <span className="font-mono text-slate-900 dark:text-slate-200 text-xs font-bold">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                  {isGoogleUser && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                      Google
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Phone */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">رقم الهاتف</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200 text-xs font-bold block mt-0.5 truncate" dir="ltr">
                      {currentUser.phone || "لم يُحدد"}
                    </span>
                  </div>

                  {/* Country */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                    <span className="text-[10px] text-slate-400 block">الدولة</span>
                    <span className="text-slate-900 dark:text-slate-200 text-xs font-bold block mt-0.5 truncate">
                      {currentUser.countryName || "سوريا"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: إجراءات الحساب وسجل الطلبات */}
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">روابط وسجلات الحساب</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/wallet?tab=orders"
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>سجل الطلبات</span>
                <ClipboardList className="w-4 h-4 text-cyan-600 dark:text-[#06b6d4]" />
              </Link>
              <Link
                href="/wallet?tab=ledger"
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] hover:bg-slate-100 dark:hover:bg-[#13253a] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
              >
                <span>حركات المحفظة</span>
                <Wallet className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>
        </div>

        {/* Column 2: Security & KYC Verification */}
        <div className="space-y-5">
          {/* Card: توثيق الهوية الوطنية (KYC) */}
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                توثيق الهوية الوطنية (KYC)
              </h3>

              {kycStatusState === "AUTO_VERIFIED" || currentUser?.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  موثق رسمياً
                </span>
              ) : kycStatusState === "MANUAL_REVIEW" || kycStatusState === "PENDING_BOT_REVIEW" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  <Clock className="w-3 h-3" />
                  قيد التدقيق
                </span>
              ) : kycStatusState === "REJECTED" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold">
                  <AlertCircle className="w-3 h-3" />
                  مرفوض
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#070e17] text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-[#1e3a5f] text-[11px] font-bold">
                  غير موثق
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              توثيق الحساب يرفع حدود الإيداع ويمنحك أسعار الموزعين الحصرية عبر التحقق الذكي بالذكاء الاصطناعي وبوت المشرفين.
            </p>

            {kycBotFeedback && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {kycBotFeedback}
              </div>
            )}

            {kycStatusState === "AUTO_VERIFIED" || currentUser?.isVerified ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تم اعتماد وثائق الهوية وتفعيل كافة صلاحيات الحساب الموثوق.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowKycModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>
                  {kycStatusState === "REJECTED" ? "إعادة رفع وثائق الهوية" : "بدء رفع مستندات التوثيق (KYC)"}
                </span>
              </button>
            )}
          </div>

          {/* Card: الأمان وكلمة المرور */}
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-[#d4af37]" />
              الأمان وكلمة المرور
            </h3>

            {isGoogleUser ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f] text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                حسابك محمي بتسجيل الدخول الآمن من Google. لا تحتاج إلى كلمة مرور منفصلة.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#1e3a5f]">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">كلمة المرور</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      تشفير كامل عبر خوارزمية BCrypt
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#13253a] hover:bg-slate-100 dark:hover:bg-[#1e3a5f] border border-slate-200 dark:border-[#1e3a5f] text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs"
                  >
                    تغيير كلمة المرور
                  </button>
                </div>

                {showPasswordModal && (
                  <form onSubmit={handleChangePassword} className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-[#1e3a5f]">
                    {passwordError && (
                      <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          الجديدة
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="8 خانات"
                          className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          تأكيدها
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="أعد إدخالها"
                          className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2 outline-none font-mono text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPass}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs"
                      >
                        {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>حفظ</span>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          KYC IDENTITY VERIFICATION MODAL
         ======================================================== */}
      {showKycModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0d1b2a] border border-slate-200 dark:border-[#1e3a5f] w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-[#d4af37]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">توثيق الهوية الوطنية (KYC)</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">إشعار فوري لمجموعة المشرفين عبر تيليجرام</p>
                </div>
              </div>
              <button
                onClick={() => setShowKycModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل (كما هو مدون في البطاقة الشخصية) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  placeholder="الاسم الثلاثي أو الرباعي"
                  className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs rounded-xl p-2.5 outline-none font-medium text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الرقم الوطني / رقم الهوية الرسمية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kycIdNumber}
                  onChange={(e) => setKycIdNumber(e.target.value)}
                  placeholder="مثال: 01020304050"
                  className="w-full bg-slate-50 dark:bg-[#070e17] border border-slate-300 dark:border-[#1e3a5f] text-slate-900 dark:text-white text-xs font-mono rounded-xl p-2.5 outline-none text-right"
                />
              </div>

              {/* Real Interactive Document Upload Dropzones */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    مستندات إثبات الشخصية
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    PNG, JPG حتى 5MB لكل صورة
                  </span>
                </div>

                <div className="space-y-2.5">
                  <KycUploadCard
                    label="وجه الهوية الأمامي (Front ID)"
                    required
                    subLabel="بطاقة الهوية أو جواز السفر أو رخصة القيادة"
                    file={kycFrontFile}
                    onChange={setKycFrontFile}
                    disabled={isSubmittingKyc}
                  />

                  <KycUploadCard
                    label="الوجه الخلفي للهوية (Back ID)"
                    subLabel="مطلوب للبطاقات الوطنية ورخص القيادة"
                    file={kycBackFile}
                    onChange={setKycBackFile}
                    disabled={isSubmittingKyc}
                  />

                  <KycUploadCard
                    label="صورة السيلفي مع الهوية (Selfie with ID)"
                    required
                    subLabel="صورة سيلفي واضحة لوجهك حاملاً وثيقة الهوية"
                    file={kycSelfieFile}
                    onChange={setKycSelfieFile}
                    disabled={isSubmittingKyc}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1e3a5f]">
                <button
                  type="button"
                  onClick={() => setShowKycModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmittingKyc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والتحقق...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      <span>إرسال المستندات للتحقق</span>
                    </>
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
