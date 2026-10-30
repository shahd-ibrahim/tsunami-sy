import { prisma } from "./prisma";
import { setMemoryUserVerified } from "./auth";
import { persistentStore } from "./persistent-store";

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  currency: string;
  minDeposit: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentChannelItem {
  id: string;
  type: string;
  title: string;
  accountNumber: string;
  recipientName?: string | null;
  qrCodeUrl?: string | null;
  instructions?: string | null;
  isActive: boolean;
  updatedAt: string;
}

export interface AgentItem {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  phone: string;
  whatsappUrl?: string | null;
  image?: string | null;
  isActive: boolean;
  orderIndex?: number;
  createdAt: string;
  updatedAt?: string;
  // Optional / backward-compatible fields:
  agentCode?: string;
  country?: string;
  whatsapp?: string;
  telegram?: string | null;
  discountRate?: number;
}

export interface StaffMemberItem {
  id: string;
  email: string;
  fullName: string;
  role: "ROOT_ADMIN" | "FINANCE_OFFICER" | "SUPPORT_AGENT";
  permissions: string[];
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";
  createdAt: string;
}

export interface PlatformRateItem {
  id: string;
  key: string;
  name: string;
  rate: number;
  category: "CURRENCY" | "APP_RATE";
  updatedAt: string;
}

export interface DynamicProductItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  iconUrl: string;
  bannerUrl?: string;
  categoryId: string;
  categoryName: string;
  unitType: string; // e.g. "Coins", "Diamonds", "UC", "Voucher", "SYP"
  unitPriceUser: number;
  unitPriceReseller: number;
  requiresUid: boolean;
  uidLabel: string;
  validationApiUrl?: string;
  isActive: boolean;
  description?: string;
  minQuantity?: number;
  stepQuantity?: number;
  presetAmounts?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface DynamicUserItem {
  id: string;
  numericId: number;
  name: string;
  email: string;
  phone?: string;
  countryCode?: string;
  countryName?: string;
  walletBalance: number;
  role: "USER" | "RESELLER" | "AGENT";
  isVerified: boolean;
  kycStatus: "NOT_SUBMITTED" | "PENDING_BOT_REVIEW" | "AUTO_VERIFIED" | "MANUAL_REVIEW" | "REJECTED";
  isFrozen: boolean;
  commissionRate?: number;
  createdAt: string;
}

export interface DynamicKycItem {
  id: string;
  userId: string;
  userNumericId?: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
  idNumber?: string;
  extractedName?: string;
  matchScore?: number;
  status: "NOT_SUBMITTED" | "PENDING_BOT_REVIEW" | "AUTO_VERIFIED" | "MANUAL_REVIEW" | "REJECTED";
  botNotes?: string;
  documentType?: string;
  lastUpdateDate?: string;
  calculatedExpiryDate?: string;
  expiryDate?: string;
  isExpired?: boolean;
  validityStatus?: string;
  recommendation?: string;
  rawOcrText?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl?: string;
  link?: string;
  isActive: boolean;
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

export interface AboutContentItem {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  visionTitle: string;
  visionText: string;
  coreValues: CoreValueItem[];
  promoBanners: PromoBannerItem[];
  updatedAt: string;
}

// -------------------------------------------------------------
// In-Memory Persistent Fallback Store
// -------------------------------------------------------------
declare global {
  // eslint-disable-next-line no-var
  var __dynamicHubStore: {
    banks: Map<string, BankAccountItem>;
    channels: Map<string, PaymentChannelItem>;
    agents: Map<string, AgentItem>;
    staff: Map<string, StaffMemberItem>;
    rates: Map<string, PlatformRateItem>;
    products: Map<string, DynamicProductItem>;
    users: Map<string, DynamicUserItem>;
    kyc: Map<string, DynamicKycItem>;
    about?: AboutContentItem;
  } | undefined;
}

if (!globalThis.__dynamicHubStore) {
  const banks = new Map<string, BankAccountItem>();
  const channels = new Map<string, PaymentChannelItem>();
  const agents = new Map<string, AgentItem>();
  const staff = new Map<string, StaffMemberItem>();
  const rates = new Map<string, PlatformRateItem>();

  // Pre-seed Banks
  banks.set("bank-1", {
    id: "bank-1",
    bankName: "Ziraat Bankası",
    accountHolder: "TSUNAMI DIJITAL HIZMETLERI",
    iban: "TR120001002003004005006001",
    currency: "TRY",
    minDeposit: 100,
    notes: "يرجى كتابة رقم هاتفك أو معرّف الحساب في خانة التوضيح (Açıklama).",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  banks.set("bank-2", {
    id: "bank-2",
    bankName: "VakıfBank (حساب دولاري)",
    accountHolder: "TSUNAMI GLOBAL TRADING",
    iban: "TR880001500158007300123456",
    currency: "USD",
    minDeposit: 20,
    notes: "تحويل مباشر بالدولار بدون رسوم داخل تركيا.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  banks.set("bank-3", {
    id: "bank-3",
    bankName: "بنك البركة سورية",
    accountHolder: "مكتب تسونامي لخدمات الدفع",
    iban: "SY000000000123456789012345",
    currency: "SYP",
    minDeposit: 50000,
    notes: "إيداع نقدي في فروع دمشق، حلب، حمص، واللاذقية.",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Pre-seed Payment Channels
  channels.set("ch-0", {
    id: "ch-0",
    type: "SHAM_CASH",
    title: "شام كاش (Sham Cash) - الخيار الأول للحوالات الفورية (#1)",
    accountNumber: "SHAM-99201458",
    recipientName: "منصة تسونامي - شام كاش المعتمدة",
    qrCodeUrl: "/images/sham_cash_qr.png",
    instructions: "قم بالتحويل عبر تطبيق شام كاش المباشر إلى رقم الحساب أعلاه، واكتب اسمك ورقم هاتفك في وصف التحويل.",
    isActive: true,
    updatedAt: new Date().toISOString(),
  });

  channels.set("ch-2", {
    id: "ch-2",
    type: "AL_HARAM",
    title: "شركة الهرم للحوالات المالية",
    accountNumber: "دمشق - فرع الميدان / رقم هاتف: 0911223344",
    recipientName: "أحمد المحمد (هوية رقم: 01020304050)",
    instructions: "إرسال الحوالة بالاسم الموضح، وإدخال رقم إشعار الحوالة الصادر من الفرع.",
    isActive: true,
    updatedAt: new Date().toISOString(),
  });

  channels.set("ch-3", {
    id: "ch-3",
    type: "USDT_TRC20",
    title: "تيذر USDT (شبكة TRC20 - الأسرع والأقل عمولة)",
    accountNumber: "TXyZ9988TopUpTsunamiCryptoTRC20OfficialAddress7766",
    recipientName: "محفظة تسونامي المشفرة TRC20",
    qrCodeUrl: "/images/usdt_trc20_qr.png",
    instructions: "إرسال عملة USDT عبر شبكة TRON (TRC-20) فقط. يتم الإيداع فور الحصول على تأكيد الشبكة.",
    isActive: true,
    updatedAt: new Date().toISOString(),
  });

  channels.set("ch-4", {
    id: "ch-4",
    type: "USDT_BEP20",
    title: "تيذر USDT (شبكة BNB Smart Chain - BEP20)",
    accountNumber: "0x71C88fF1234567890abcdef1234567890TsunamiBsc",
    recipientName: "محفظة تسونامي المشفرة BEP20",
    instructions: "إرسال عبر شبكة BNB Smart Chain (BEP20).",
    isActive: true,
    updatedAt: new Date().toISOString(),
  });

  // Pre-seed Agents
  agents.set("agent-1", {
    id: "agent-1",
    name: "مكتب الميدان للشحن الفوري",
    agentCode: "AGENT-DAM-01",
    country: "سوريا 🇸🇾",
    city: "دمشق - الميدان وشارع بغداد",
    address: "دمشق، حي الميدان، الشارع الرئيسي بجانب بنك بيمو",
    phone: "+963911223344",
    whatsapp: "963911223344",
    telegram: "@tsunami_damascus",
    discountRate: 2.5,
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  agents.set("agent-2", {
    id: "agent-2",
    name: "مركز الشهباء الرقمي",
    agentCode: "AGENT-ALP-02",
    country: "سوريا 🇸🇾",
    city: "حلب - الجميلية والفرقان",
    address: "حلب، منطقة الجميلية، مجمع الشهباء، الطابق الأول",
    phone: "+963922334455",
    whatsapp: "963922334455",
    telegram: "@tsunami_aleppo",
    discountRate: 3.0,
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  agents.set("agent-3", {
    id: "agent-3",
    name: "فرع إسطنبول الفاتح المعتمد",
    agentCode: "AGENT-IST-03",
    country: "تركيا 🇹🇷",
    city: "إسطنبول - الفاتح وأكسراي",
    address: "Fatih / İstanbul, Akdeniz Caddesi No: 45",
    phone: "+905521234567",
    whatsapp: "905521234567",
    telegram: "@tsunami_turkey",
    discountRate: 4.0,
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  agents.set("agent-4", {
    id: "agent-4",
    name: "مكتب الوادي للدفع الإلكتروني",
    agentCode: "AGENT-HMS-04",
    country: "سوريا 🇸🇾",
    city: "حمص - الدبلان وكرم الشامي",
    address: "حمص، شارع الدبلان التجاري، مقابل البريد",
    phone: "+963933445566",
    whatsapp: "963933445566",
    telegram: "@tsunami_homs",
    discountRate: 2.0,
    isActive: true,
    createdAt: new Date().toISOString(),
  });

  // Pre-seed Staff
  staff.set("staff-1", {
    id: "staff-1",
    email: "admin@tsunami-sy.com",
    fullName: "المشرف العام (Root Super-Admin)",
    role: "ROOT_ADMIN",
    permissions: ["MANAGE_DEPOSITS", "MANAGE_ORDERS", "MANAGE_PRICES", "MANAGE_STAFF", "MANAGE_BANKS", "MANAGE_AGENTS"],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });

  staff.set("staff-2", {
    id: "staff-2",
    email: "finance@tsunami-sy.com",
    fullName: "مدير العمليات المالية (Finance Manager)",
    role: "FINANCE_OFFICER",
    permissions: ["MANAGE_DEPOSITS", "MANAGE_BANKS"],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });

  staff.set("staff-3", {
    id: "staff-3",
    email: "support@tsunami-sy.com",
    fullName: "مسؤول الدعم الفني ومتابعة الطلبات",
    role: "SUPPORT_AGENT",
    permissions: ["MANAGE_ORDERS"],
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  });

  staff.set("staff-4", {
    id: "staff-4",
    email: "agent.candidate@tsunami-sy.com",
    fullName: "طلب انضمام وكيل حماة",
    role: "SUPPORT_AGENT",
    permissions: [],
    status: "PENDING_APPROVAL",
    createdAt: new Date().toISOString(),
  });

  // Pre-seed Rates
  rates.set("USD_TRY", {
    id: "rate-1",
    key: "USD_TRY",
    name: "سعر صرف الدولار مقابل الليرة التركية (USD/TRY)",
    rate: 35.25,
    category: "CURRENCY",
    updatedAt: new Date().toISOString(),
  });

  rates.set("USD_SYP", {
    id: "rate-2",
    key: "USD_SYP",
    name: "سعر صرف الدولار مقابل الليرة السورية (USD/SYP)",
    rate: 15300,
    category: "CURRENCY",
    updatedAt: new Date().toISOString(),
  });

  rates.set("SOULSTAR_USER", {
    id: "rate-3",
    key: "SOULSTAR_USER",
    name: "سول ستار - كوينز العميل العادي (لكل 1 دولار)",
    rate: 1050,
    category: "APP_RATE",
    updatedAt: new Date().toISOString(),
  });

  rates.set("SOULSTAR_AGENT", {
    id: "rate-4",
    key: "SOULSTAR_AGENT",
    name: "سول ستار - كوينز الوكيل المعتمد (لكل 1 دولار)",
    rate: 1120,
    category: "APP_RATE",
    updatedAt: new Date().toISOString(),
  });

  rates.set("SOULCHILL_USER", {
    id: "rate-5",
    key: "SOULCHILL_USER",
    name: "سول شيل - ماسات العميل العادي (لكل 1 دولار)",
    rate: 980,
    category: "APP_RATE",
    updatedAt: new Date().toISOString(),
  });

  rates.set("SOULCHILL_AGENT", {
    id: "rate-6",
    key: "SOULCHILL_AGENT",
    name: "سول شيل - ماسات الوكيل المعتمد (لكل 1 دولار)",
    rate: 1040,
    category: "APP_RATE",
    updatedAt: new Date().toISOString(),
  });

  const products = new Map<string, DynamicProductItem>();
  const users = new Map<string, DynamicUserItem>();
  const kyc = new Map<string, DynamicKycItem>();

  // Pre-seed Products
  products.set("prod-soulstar", {
    id: "prod-soulstar",
    nameAr: "سول ستار",
    nameEn: "SoulStar",
    slug: "soulstar",
    categoryId: "chat",
    categoryName: "تطبيقات الدردشة والبث الصوتي",
    iconUrl: "https://play-lh.googleusercontent.com/c1KAJZGCXdpnHBFSj4QpxhIwqNSeT66nI4szWIn1oLGhuRqCtVIToj0d632Eghns1KYJtv3ZNcjNZLTdgZZckw=s256",
    bannerUrl: "/images/soulstar_banner.jpg",
    unitType: "Coins",
    unitPriceUser: 0.00095,
    unitPriceReseller: 0.00088,
    requiresUid: true,
    uidLabel: "معرف SoulStar ID",
    validationApiUrl: "https://api.soulstar.app/v1/verify",
    isActive: true,
    description: "شحن كوينز رسمي وفوري لتطبيق سول ستار عبر السيرفر المباشر.",
    minQuantity: 500,
    stepQuantity: 100,
    presetAmounts: [500, 1000, 2500, 5000, 10000, 25000],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-soulchill", {
    id: "prod-soulchill",
    nameAr: "سول شيل",
    nameEn: "SoulChill",
    slug: "soulchill",
    categoryId: "chat",
    categoryName: "تطبيقات الدردشة والبث الصوتي",
    iconUrl: "https://play-lh.googleusercontent.com/2CzmrbC4IbSEWQ_Vr_slE_B7CGHoyr7xkRSNzNDsh__i-3DTJ-xXgbQBDXe-7cUphjtrEKu_8x0SDJzSnXK4oQ=s256",
    unitType: "Diamonds",
    unitPriceUser: 0.00102,
    unitPriceReseller: 0.00094,
    requiresUid: true,
    uidLabel: "معرف SoulChill ID",
    validationApiUrl: "https://api.soulchill.com/v1/check",
    isActive: true,
    description: "شحن ماسات فوري وتفعيل مزايا الغرف الصوتية.",
    minQuantity: 500,
    stepQuantity: 100,
    presetAmounts: [500, 1000, 2500, 5000, 10000],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-pubg", {
    id: "prod-pubg",
    nameAr: "ببجي موبايل",
    nameEn: "PUBG Mobile",
    slug: "pubg-mobile",
    categoryId: "gaming",
    categoryName: "شحن الألعاب",
    iconUrl: "https://play-lh.googleusercontent.com/Se7jR6A5R0Mk9ClaIguf46yi2K3k32JsqKb3gAtrktIh3JwnFfxrQRmG9GLvdMpbxbMrReUOxzDkStxGxNo-5Q=s256",
    unitType: "UC",
    unitPriceUser: 0.0145,
    unitPriceReseller: 0.0135,
    requiresUid: true,
    uidLabel: "معرف اللاعب (Player ID)",
    validationApiUrl: "https://midasbuy.com/api/verify",
    isActive: true,
    description: "شحن شدات ببجي العالمية تسليم فوري بالآيدي.",
    minQuantity: 60,
    stepQuantity: 60,
    presetAmounts: [60, 325, 660, 1800, 3850],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-freefire", {
    id: "prod-freefire",
    nameAr: "فري فاير",
    nameEn: "Free Fire",
    slug: "free-fire",
    categoryId: "gaming",
    categoryName: "شحن الألعاب",
    iconUrl: "https://play-lh.googleusercontent.com/cK-U0_B9GrnSy26SNISDuvU_hL4VggyqJ1J5V2oiuyVEfiGo7fzegdBjk0ejXPg3PKK5sPwumdLBbWv8KkBKLQ=s256",
    unitType: "Diamonds",
    unitPriceUser: 0.0098,
    unitPriceReseller: 0.0090,
    requiresUid: true,
    uidLabel: "معرف اللاعب (Player UID)",
    validationApiUrl: "https://shop2game.com/api/verify",
    isActive: true,
    description: "جواهر جارينا فري فاير تسليم مباشر وآمن.",
    minQuantity: 100,
    stepQuantity: 100,
    presetAmounts: [100, 310, 520, 1060, 2180],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-yalla-ludo", {
    id: "prod-yalla-ludo",
    nameAr: "يلا لودو",
    nameEn: "Yalla Ludo",
    slug: "yalla-ludo",
    categoryId: "gaming",
    categoryName: "شحن الألعاب",
    iconUrl: "https://play-lh.googleusercontent.com/_B8WTUQVNhy4frnK0ekTvxNUpYDL-HYfeJvM8jo7Zw58N-RoAWD2gC4ksVp5KDNdtiYDGBMo3DVBo8bcBkxBLw=s256",
    unitType: "Diamonds",
    unitPriceUser: 0.012,
    unitPriceReseller: 0.011,
    requiresUid: true,
    uidLabel: "معرف يلا لودو ID",
    isActive: true,
    description: "شحن ماسات وذهب يلا لودو لتفعيل النرد المميز.",
    minQuantity: 100,
    stepQuantity: 50,
    presetAmounts: [100, 500, 1000, 2500, 5000],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-shahid", {
    id: "prod-shahid",
    nameAr: "شاهد VIP",
    nameEn: "Shahid VIP",
    slug: "shahid-vip",
    categoryId: "chat",
    categoryName: "تطبيقات الدردشة والبث الصوتي",
    iconUrl: "https://play-lh.googleusercontent.com/OX_8Lxi6zQdeob7G9t45jHK889TOrfULfn4vf6MP6a3lx4U26naAbim14BIIKOmt1_5AbUpqgCFqldWzpp-LMro=s256",
    unitType: "Voucher",
    unitPriceUser: 4.49,
    unitPriceReseller: 4.10,
    requiresUid: false,
    uidLabel: "رقم الجوال أو البريد",
    isActive: true,
    description: "اشتراكات شاهد VIP للأفلام والمسلسلات والرياضة.",
    minQuantity: 1,
    stepQuantity: 1,
    presetAmounts: [1, 3, 6, 12],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-sham-cash", {
    id: "prod-sham-cash",
    nameAr: "شام كاش (Sham Cash)",
    nameEn: "Sham Cash",
    slug: "sham-cash",
    categoryId: "telecom",
    categoryName: "اتصالات وكاش محلي",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/10149/10149458.png",
    unitType: "SYP",
    unitPriceUser: 0.000074,
    unitPriceReseller: 0.000070,
    requiresUid: true,
    uidLabel: "رقم حساب أو محفظة شام كاش",
    isActive: true,
    description: "الخيار الأول للحوالات الفورية وكاش المحافظ داخل سوريا.",
    minQuantity: 10000,
    stepQuantity: 5000,
    presetAmounts: [25000, 50000, 100000, 250000, 500000],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  products.set("prod-usdt-trc20", {
    id: "prod-usdt-trc20",
    nameAr: "تيذر TRC20",
    nameEn: "USDT TRC20",
    slug: "usdt-trc20",
    categoryId: "telecom",
    categoryName: "اتصالات وكاش محلي",
    iconUrl: "https://cdn-icons-png.flaticon.com/512/12114/12114250.png",
    unitType: "USDT",
    unitPriceUser: 1.02,
    unitPriceReseller: 1.01,
    requiresUid: true,
    uidLabel: "عنوان محفظة TRC20",
    isActive: true,
    description: "تحويل فوري لرصيد USDT عبر شبكة ترون.",
    minQuantity: 10,
    stepQuantity: 10,
    presetAmounts: [10, 25, 50, 100, 250],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Pre-seed Dynamic Users
  users.set("user-1001", {
    id: "user-1001",
    numericId: 1001,
    name: "المشرف العام (Root Super-Admin)",
    email: "root@tsunami-sy.com",
    phone: "+963988776655",
    countryCode: "+963",
    countryName: "سوريا",
    walletBalance: 12500.00,
    role: "USER",
    isVerified: true,
    kycStatus: "AUTO_VERIFIED",
    isFrozen: false,
    createdAt: new Date().toISOString(),
  });

  users.set("user-1002", {
    id: "user-1002",
    numericId: 1002,
    name: "أحمد السوري",
    email: "ahmad.sy@gmail.com",
    phone: "+963933112233",
    countryCode: "+963",
    countryName: "سوريا",
    walletBalance: 450.50,
    role: "RESELLER",
    isVerified: true,
    kycStatus: "AUTO_VERIFIED",
    isFrozen: false,
    commissionRate: 5.0,
    createdAt: new Date().toISOString(),
  });

  users.set("user-1003", {
    id: "user-1003",
    numericId: 1003,
    name: "محمد علي الفاتح",
    email: "mohamad.ali@hotmail.com",
    phone: "+905523344556",
    countryCode: "+90",
    countryName: "تركيا",
    walletBalance: 1280.00,
    role: "AGENT",
    isVerified: true,
    kycStatus: "AUTO_VERIFIED",
    isFrozen: false,
    commissionRate: 8.0,
    createdAt: new Date().toISOString(),
  });

  users.set("user-1004", {
    id: "user-1004",
    numericId: 1004,
    name: "خالد عمر الشامي",
    email: "khaled.omar@gmail.com",
    phone: "+963955667788",
    countryCode: "+963",
    countryName: "سوريا",
    walletBalance: 75.25,
    role: "USER",
    isVerified: false,
    kycStatus: "MANUAL_REVIEW",
    isFrozen: false,
    createdAt: new Date().toISOString(),
  });

  users.set("user-1005", {
    id: "user-1005",
    numericId: 1005,
    name: "سارة دمشقي",
    email: "sara.damascus@yahoo.com",
    phone: "+963944556677",
    countryCode: "+963",
    countryName: "سوريا",
    walletBalance: 15.00,
    role: "USER",
    isVerified: false,
    kycStatus: "PENDING_BOT_REVIEW",
    isFrozen: false,
    createdAt: new Date().toISOString(),
  });

  users.set("user-1006", {
    id: "user-1006",
    numericId: 1006,
    name: "ياسين كمال",
    email: "yassin.kamal@outlook.com",
    phone: "+9647701122334",
    countryCode: "+964",
    countryName: "العراق",
    walletBalance: 0.00,
    role: "USER",
    isVerified: false,
    kycStatus: "REJECTED",
    isFrozen: true,
    createdAt: new Date().toISOString(),
  });

  // Pre-seed Dynamic KYC Verifications
  kyc.set("kyc-1004", {
    id: "kyc-1004",
    userId: "user-1004",
    userNumericId: 1004,
    userName: "خالد عمر الشامي",
    userEmail: "khaled.omar@gmail.com",
    idCardFrontUrl: "/images/kyc_mock_front.jpg",
    idCardBackUrl: "/images/kyc_mock_back.jpg",
    selfieUrl: "/images/kyc_mock_selfie.jpg",
    idNumber: "01040506070",
    extractedName: "خالد الشامي",
    matchScore: 74.00,
    status: "MANUAL_REVIEW",
    botNotes: "⚠️ نسبة التطابق (74%) تتطلب مراجعة بشرية من المشرف العام.\n- الاسم في الحساب: 'خالد عمر الشامي'\n- الاسم المستخرج عبر OCR: 'خالد الشامي'\n- تطابق الاسم: 74%\n- بانتظار قرار المشرف.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  kyc.set("kyc-1002", {
    id: "kyc-1002",
    userId: "user-1002",
    userNumericId: 1002,
    userName: "أحمد السوري",
    userEmail: "ahmad.sy@gmail.com",
    idCardFrontUrl: "/images/kyc_mock_front.jpg",
    selfieUrl: "/images/kyc_mock_selfie.jpg",
    idNumber: "02030405060",
    extractedName: "أحمد السوري",
    matchScore: 96.00,
    status: "AUTO_VERIFIED",
    botNotes: "✅ تم التوثيق الآلي بنجاح عبر روبوت الذكاء الاصطناعي (96%).\n- الاسم مطابق 100%.\n- الهوية الوطنية مستوفية للشروط القياسية.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  globalThis.__dynamicHubStore = { banks, channels, agents, staff, rates, products, users, kyc };
}

const store = globalThis.__dynamicHubStore!;

// =============================================================
// 1. BANK ACCOUNTS CRUD
// =============================================================
export async function getBankAccounts(activeOnly = false): Promise<BankAccountItem[]> {
  try {
    const records = await (prisma as any).bankAccount.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        ...r,
        minDeposit: Number(r.minDeposit),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Database fallback
  }

  const list = Array.from(store.banks.values());
  return activeOnly ? list.filter((b) => b.isActive) : list;
}

export async function createBankAccount(data: {
  bankName: string;
  accountHolder: string;
  iban: string;
  currency: string;
  minDeposit: number;
  notes?: string;
}): Promise<BankAccountItem> {
  const id = `bank-${Date.now()}`;
  const now = new Date().toISOString();
  const item: BankAccountItem = {
    id,
    bankName: data.bankName,
    accountHolder: data.accountHolder,
    iban: data.iban.toUpperCase().replace(/\s+/g, ""),
    currency: data.currency.toUpperCase(),
    minDeposit: Number(data.minDeposit) || 10,
    notes: data.notes || null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await (prisma as any).bankAccount.create({
      data: {
        id: item.id,
        bankName: item.bankName,
        accountHolder: item.accountHolder,
        iban: item.iban,
        currency: item.currency,
        minDeposit: item.minDeposit,
        notes: item.notes,
        isActive: true,
      },
    });
  } catch {
    // Stored in memory
  }

  store.banks.set(id, item);
  return item;
}

export async function toggleBankAccount(id: string): Promise<BankAccountItem | null> {
  const existing = store.banks.get(id);
  if (!existing) return null;

  existing.isActive = !existing.isActive;
  existing.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).bankAccount.update({
      where: { id },
      data: { isActive: existing.isActive },
    });
  } catch {
    // Handled in memory
  }

  return existing;
}

export async function updateBankAccount(
  id: string,
  data: Partial<Omit<BankAccountItem, "id" | "createdAt">>
): Promise<BankAccountItem | null> {
  const existing = store.banks.get(id);
  if (!existing) return null;

  Object.assign(existing, data, { updatedAt: new Date().toISOString() });

  try {
    await (prisma as any).bankAccount.update({
      where: { id },
      data: {
        bankName: existing.bankName,
        accountHolder: existing.accountHolder,
        iban: existing.iban,
        currency: existing.currency,
        minDeposit: existing.minDeposit,
        notes: existing.notes,
        isActive: existing.isActive,
      },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function deleteBankAccount(id: string): Promise<boolean> {
  store.banks.delete(id);
  try {
    await (prisma as any).bankAccount.delete({ where: { id } });
  } catch {
    // Handled in memory
  }
  return true;
}

// =============================================================
// 2. PAYMENT CHANNELS CRUD
// =============================================================
export async function getPaymentChannels(activeOnly = false): Promise<PaymentChannelItem[]> {
  try {
    const records = await (prisma as any).paymentChannel.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        ...r,
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Fallback
  }

  const list = Array.from(store.channels.values());
  return activeOnly ? list.filter((c) => c.isActive) : list;
}

export async function createPaymentChannel(data: {
  type: string;
  title: string;
  accountNumber: string;
  recipientName?: string;
  qrCodeUrl?: string;
  instructions?: string;
}): Promise<PaymentChannelItem> {
  const id = `ch-${Date.now()}`;
  const now = new Date().toISOString();
  const item: PaymentChannelItem = {
    id,
    type: data.type,
    title: data.title,
    accountNumber: data.accountNumber,
    recipientName: data.recipientName || null,
    qrCodeUrl: data.qrCodeUrl || null,
    instructions: data.instructions || null,
    isActive: true,
    updatedAt: now,
  };

  try {
    await (prisma as any).paymentChannel.create({
      data: {
        id: item.id,
        type: item.type,
        title: item.title,
        accountNumber: item.accountNumber,
        recipientName: item.recipientName,
        qrCodeUrl: item.qrCodeUrl,
        instructions: item.instructions,
        isActive: true,
      },
    });
  } catch {
    // Memory store
  }

  store.channels.set(id, item);
  return item;
}

export async function togglePaymentChannel(id: string): Promise<PaymentChannelItem | null> {
  const existing = store.channels.get(id);
  if (!existing) return null;

  existing.isActive = !existing.isActive;
  existing.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).paymentChannel.update({
      where: { id },
      data: { isActive: existing.isActive },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function updatePaymentChannel(
  id: string,
  data: Partial<Omit<PaymentChannelItem, "id">>
): Promise<PaymentChannelItem | null> {
  const existing = store.channels.get(id);
  if (!existing) return null;

  Object.assign(existing, data, { updatedAt: new Date().toISOString() });

  try {
    await (prisma as any).paymentChannel.update({
      where: { id },
      data: {
        type: existing.type,
        title: existing.title,
        accountNumber: existing.accountNumber,
        recipientName: existing.recipientName,
        qrCodeUrl: existing.qrCodeUrl,
        instructions: existing.instructions,
        isActive: existing.isActive,
      },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function deletePaymentChannel(id: string): Promise<boolean> {
  store.channels.delete(id);
  try {
    await (prisma as any).paymentChannel.delete({ where: { id } });
  } catch {
    // Memory
  }
  return true;
}

// =============================================================
// 3. AGENTS CRUD
// =============================================================
export async function getAgents(activeOnly = false): Promise<AgentItem[]> {
  try {
    const records = await (prisma as any).agent.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        address: r.address,
        phone: r.phone,
        whatsappUrl: r.whatsappUrl || (r.phone ? `https://wa.me/${r.phone.replace(/[^0-9]/g, "")}` : null),
        image: r.image || "/images/logo.png",
        isActive: Boolean(r.isActive),
        orderIndex: Number(r.orderIndex) || 0,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        agentCode: r.agentCode || `AG-${r.id.slice(-4).toUpperCase()}`,
        country: r.country || "سوريا 🇸🇾",
        whatsapp: r.whatsappUrl || r.phone,
        discountRate: Number(r.discountRate) || 0,
      }));
    }
  } catch {
    // Database fallback to persistentStore
  }

  const pAgents = persistentStore.getAgents(activeOnly);
  return pAgents.map((pa) => ({
    id: pa.id,
    name: pa.name,
    city: pa.city,
    address: pa.address,
    phone: pa.phone,
    whatsappUrl: pa.whatsappUrl || `https://wa.me/${pa.phone.replace(/[^0-9]/g, "")}`,
    image: pa.image || "/images/logo.png",
    isActive: pa.isActive,
    orderIndex: pa.orderIndex || 0,
    createdAt: pa.createdAt,
    updatedAt: pa.updatedAt,
    agentCode: `AG-${pa.id.slice(-4).toUpperCase()}`,
    country: "سوريا 🇸🇾",
    whatsapp: pa.whatsappUrl || pa.phone,
    discountRate: 0,
  }));
}

export async function createAgent(data: {
  name: string;
  city: string;
  address?: string | null;
  phone: string;
  whatsappUrl?: string | null;
  image?: string | null;
  isActive?: boolean;
  orderIndex?: number;
  agentCode?: string;
  country?: string;
  whatsapp?: string;
  telegram?: string;
  discountRate?: number;
}): Promise<AgentItem> {
  const id = `agent-${Date.now()}`;
  const now = new Date().toISOString();
  const phoneClean = (data.phone || "").replace(/[^0-9]/g, "");
  const defaultWhatsapp = phoneClean ? `https://wa.me/${phoneClean}` : null;
  const whatsappUrl =
    data.whatsappUrl ||
    (data.whatsapp?.startsWith("http")
      ? data.whatsapp
      : data.whatsapp
      ? `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`
      : defaultWhatsapp);

  const item: AgentItem = {
    id,
    name: data.name,
    city: data.city,
    address: data.address || null,
    phone: data.phone,
    whatsappUrl: whatsappUrl,
    image: data.image || "/images/logo.png",
    isActive: data.isActive !== undefined ? data.isActive : true,
    orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : 0,
    createdAt: now,
    updatedAt: now,
    agentCode: data.agentCode || `AG-${id.slice(-4).toUpperCase()}`,
    country: data.country || "سوريا 🇸🇾",
    whatsapp: whatsappUrl || data.phone,
    telegram: data.telegram || null,
    discountRate: Number(data.discountRate) || 0,
  };

  // Persist to file-based JSON store
  persistentStore.saveAgent({
    id: item.id,
    name: item.name,
    city: item.city,
    address: item.address,
    phone: item.phone,
    whatsappUrl: item.whatsappUrl,
    image: item.image,
    isActive: item.isActive,
    orderIndex: item.orderIndex ?? 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || now,
  });

  // Sync to Prisma DB if available
  try {
    await (prisma as any).agent.create({
      data: {
        id: item.id,
        name: item.name,
        city: item.city,
        address: item.address,
        phone: item.phone,
        whatsappUrl: item.whatsappUrl,
        image: item.image,
        isActive: item.isActive,
        orderIndex: item.orderIndex ?? 0,
      },
    });
  } catch {
    // Persistent store already persisted
  }

  store.agents.set(id, item);
  return item;
}

export async function toggleAgent(id: string): Promise<AgentItem | null> {
  const pUpdated = persistentStore.toggleAgent(id);
  if (pUpdated) {
    try {
      await (prisma as any).agent.update({
        where: { id },
        data: { isActive: pUpdated.isActive },
      });
    } catch {
      // Memory / persistentStore fallback
    }

    const item: AgentItem = {
      id: pUpdated.id,
      name: pUpdated.name,
      city: pUpdated.city,
      address: pUpdated.address,
      phone: pUpdated.phone,
      whatsappUrl: pUpdated.whatsappUrl,
      image: pUpdated.image,
      isActive: pUpdated.isActive,
      orderIndex: pUpdated.orderIndex,
      createdAt: pUpdated.createdAt,
      updatedAt: pUpdated.updatedAt,
      agentCode: `AG-${pUpdated.id.slice(-4).toUpperCase()}`,
      country: "سوريا 🇸🇾",
      whatsapp: pUpdated.whatsappUrl || pUpdated.phone,
      discountRate: 0,
    };
    store.agents.set(id, item);
    return item;
  }

  const existing = store.agents.get(id);
  if (!existing) return null;
  existing.isActive = !existing.isActive;
  persistentStore.saveAgent({
    id: existing.id,
    name: existing.name,
    city: existing.city,
    address: existing.address,
    phone: existing.phone,
    whatsappUrl: existing.whatsappUrl || existing.whatsapp,
    image: existing.image || "/images/logo.png",
    isActive: existing.isActive,
    orderIndex: existing.orderIndex || 0,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  });
  return existing;
}

export async function updateAgent(
  id: string,
  data: Partial<AgentItem>
): Promise<AgentItem | null> {
  const existing = persistentStore.getAgentById(id) || store.agents.get(id);
  if (!existing) return null;

  const phoneClean = (data.phone || existing.phone || "").replace(/[^0-9]/g, "");
  const defaultWhatsapp = phoneClean ? `https://wa.me/${phoneClean}` : null;
  const whatsappUrl =
    data.whatsappUrl !== undefined
      ? data.whatsappUrl
      : data.whatsapp
      ? data.whatsapp.startsWith("http")
        ? data.whatsapp
        : `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`
      : existing.whatsappUrl || defaultWhatsapp;

  const updatedRecord = {
    id,
    name: data.name !== undefined ? data.name : existing.name,
    city: data.city !== undefined ? data.city : existing.city,
    address: data.address !== undefined ? data.address : existing.address,
    phone: data.phone !== undefined ? data.phone : existing.phone,
    whatsappUrl: whatsappUrl,
    image: data.image !== undefined ? data.image : existing.image || "/images/logo.png",
    isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    orderIndex: data.orderIndex !== undefined ? Number(data.orderIndex) : ((existing as any).orderIndex || 0),
    createdAt: (existing as any).createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  persistentStore.saveAgent(updatedRecord);

  try {
    await (prisma as any).agent.update({
      where: { id },
      data: {
        name: updatedRecord.name,
        city: updatedRecord.city,
        address: updatedRecord.address,
        phone: updatedRecord.phone,
        whatsappUrl: updatedRecord.whatsappUrl,
        image: updatedRecord.image,
        isActive: updatedRecord.isActive,
        orderIndex: updatedRecord.orderIndex,
      },
    });
  } catch {
    // Memory
  }

  const returnItem: AgentItem = {
    ...updatedRecord,
    agentCode: (existing as any).agentCode || `AG-${id.slice(-4).toUpperCase()}`,
    country: (existing as any).country || "سوريا 🇸🇾",
    whatsapp: updatedRecord.whatsappUrl || updatedRecord.phone,
    discountRate: (existing as any).discountRate || 0,
  };
  store.agents.set(id, returnItem);
  return returnItem;
}

export async function deleteAgent(id: string): Promise<boolean> {
  store.agents.delete(id);
  persistentStore.deleteAgent(id);
  try {
    await (prisma as any).agent.delete({ where: { id } });
  } catch {
    // Memory
  }
  return true;
}

// =============================================================
// 4. STAFF USERS CRUD
// =============================================================
export async function getStaffUsers(): Promise<StaffMemberItem[]> {
  try {
    const records = await (prisma as any).staffUser.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        email: r.email,
        fullName: r.fullName,
        role: r.role,
        permissions: r.permissions,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch {
    // Fallback
  }

  return Array.from(store.staff.values());
}

export async function createStaffUser(data: {
  email: string;
  fullName: string;
  role: "ROOT_ADMIN" | "FINANCE_OFFICER" | "SUPPORT_AGENT";
  permissions: string[];
}): Promise<StaffMemberItem> {
  const id = `staff-${Date.now()}`;
  const now = new Date().toISOString();
  const item: StaffMemberItem = {
    id,
    email: data.email.toLowerCase().trim(),
    fullName: data.fullName,
    role: data.role,
    permissions: data.permissions || [],
    status: "ACTIVE",
    createdAt: now,
  };

  try {
    await (prisma as any).staffUser.create({
      data: {
        id: item.id,
        email: item.email,
        fullName: item.fullName,
        passwordHash: "demo_hash_staff",
        role: item.role,
        permissions: item.permissions,
        status: item.status,
      },
    });
  } catch {
    // Memory
  }

  store.staff.set(id, item);
  return item;
}

export async function updateStaffStatus(
  id: string,
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED"
): Promise<StaffMemberItem | null> {
  const existing = store.staff.get(id);
  if (!existing) return null;

  existing.status = status;

  try {
    await (prisma as any).staffUser.update({
      where: { id },
      data: { status },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function deleteStaffUser(id: string): Promise<boolean> {
  store.staff.delete(id);
  try {
    await (prisma as any).staffUser.delete({ where: { id } });
  } catch {
    // Memory
  }
  return true;
}

// =============================================================
// 5. PLATFORM RATES CRUD
// =============================================================
export async function getPlatformRates(): Promise<PlatformRateItem[]> {
  try {
    const records = await (prisma as any).platformRate.findMany({
      orderBy: { key: "asc" },
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        ...r,
        rate: Number(r.rate),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Fallback
  }

  return Array.from(store.rates.values());
}

export async function updatePlatformRate(key: string, rate: number): Promise<PlatformRateItem | null> {
  const existing = store.rates.get(key);
  if (!existing) return null;

  existing.rate = rate;
  existing.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).platformRate.upsert({
      where: { key },
      update: { rate, updatedAt: new Date() },
      create: {
        id: existing.id,
        key: existing.key,
        name: existing.name,
        rate,
        category: existing.category,
      },
    });
  } catch {
    // Memory
  }

  return existing;
}

// =============================================================
// 6. DYNAMIC PRODUCTS & CATALOG CRUD
// =============================================================
export async function getDynamicProducts(activeOnly = false): Promise<DynamicProductItem[]> {
  try {
    const records = await (prisma as any).product.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
    if (records && records.length > 0) {
      return records.map((r: any) => ({
        id: r.id,
        nameAr: r.nameAr || r.name,
        nameEn: r.nameEn || r.slug,
        slug: r.slug,
        iconUrl: r.iconUrl || r.imageUrl || "/images/pubg_icon.jpg",
        bannerUrl: r.bannerUrl || null,
        categoryId: r.categoryId,
        categoryName: r.category?.name || "خدمات تسونامي",
        unitType: r.unitType || "Coins",
        unitPriceUser: Number(r.unitPriceUser ?? r.basePrice ?? 0.001),
        unitPriceReseller: Number(r.unitPriceReseller ?? r.basePrice ?? 0.0009),
        requiresUid: r.requiresUid ?? true,
        uidLabel: r.uidLabel || "معرف اللاعب",
        validationApiUrl: r.validationApiUrl || null,
        isActive: r.isActive ?? true,
        description: r.description || "",
        minQuantity: r.minQuantity || 100,
        stepQuantity: r.stepQuantity || 100,
        presetAmounts: [100, 500, 1000, 5000],
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Database fallback
  }

  const list = Array.from(store.products.values());
  return activeOnly ? list.filter((p) => p.isActive) : list;
}

export async function createDynamicProduct(data: {
  nameAr: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  iconUrl?: string;
  bannerUrl?: string;
  unitType: string;
  unitPriceUser: number;
  unitPriceReseller: number;
  requiresUid?: boolean;
  uidLabel?: string;
  validationApiUrl?: string;
  description?: string;
}): Promise<DynamicProductItem> {
  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();

  const newProduct: DynamicProductItem = {
    id,
    nameAr: data.nameAr.trim(),
    nameEn: data.nameEn.trim(),
    slug: data.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    categoryId: data.categoryId,
    categoryName: data.categoryName || (data.categoryId === "chat" ? "تطبيقات الدردشة والبث الصوتي" : data.categoryId === "gaming" ? "شحن الألعاب" : "بطاقات رقمية"),
    iconUrl: data.iconUrl || "/images/pubg_icon.jpg",
    bannerUrl: data.bannerUrl,
    unitType: data.unitType || "Coins",
    unitPriceUser: Number(data.unitPriceUser),
    unitPriceReseller: Number(data.unitPriceReseller),
    requiresUid: data.requiresUid ?? true,
    uidLabel: data.uidLabel || "معرف الحساب / Player ID",
    validationApiUrl: data.validationApiUrl,
    isActive: true,
    description: data.description || `خدمة شحن ${data.nameAr} الفورية`,
    minQuantity: 100,
    stepQuantity: 100,
    presetAmounts: [100, 500, 1000, 5000, 10000],
    createdAt: now,
    updatedAt: now,
  };

  store.products.set(id, newProduct);

  try {
    await (prisma as any).product.create({
      data: {
        id: newProduct.id,
        name: newProduct.nameAr,
        nameAr: newProduct.nameAr,
        nameEn: newProduct.nameEn,
        slug: newProduct.slug,
        iconUrl: newProduct.iconUrl,
        imageUrl: newProduct.iconUrl,
        categoryId: newProduct.categoryId,
        unitType: newProduct.unitType,
        unitPriceUser: newProduct.unitPriceUser,
        unitPriceReseller: newProduct.unitPriceReseller,
        requiresUid: newProduct.requiresUid,
        uidLabel: newProduct.uidLabel,
        validationApiUrl: newProduct.validationApiUrl,
        isActive: true,
        basePrice: newProduct.unitPriceUser,
        minQuantity: newProduct.minQuantity,
      },
    });
  } catch {
    // Memory
  }

  return newProduct;
}

export async function updateDynamicProduct(
  id: string,
  data: Partial<DynamicProductItem>
): Promise<DynamicProductItem | null> {
  const existing = store.products.get(id);
  if (!existing) return null;

  Object.assign(existing, data, { updatedAt: new Date().toISOString() });

  try {
    await (prisma as any).product.update({
      where: { id },
      data: {
        nameAr: existing.nameAr,
        nameEn: existing.nameEn,
        slug: existing.slug,
        iconUrl: existing.iconUrl,
        categoryId: existing.categoryId,
        unitType: existing.unitType,
        unitPriceUser: existing.unitPriceUser,
        unitPriceReseller: existing.unitPriceReseller,
        requiresUid: existing.requiresUid,
        uidLabel: existing.uidLabel,
        validationApiUrl: existing.validationApiUrl,
        isActive: existing.isActive,
      },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function toggleDynamicProduct(id: string, isActive: boolean): Promise<DynamicProductItem | null> {
  const existing = store.products.get(id);
  if (!existing) return null;

  existing.isActive = isActive;
  existing.updatedAt = new Date().toISOString();

  try {
    await (prisma as any).product.update({
      where: { id },
      data: { isActive },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function deleteDynamicProduct(id: string): Promise<boolean> {
  store.products.delete(id);
  try {
    await (prisma as any).product.delete({ where: { id } });
  } catch {
    // Memory
  }
  return true;
}

// =============================================================
// 7. USER MODERATION & MANAGEMENT
// =============================================================
export async function getDynamicUsers(): Promise<DynamicUserItem[]> {
  try {
    const records = await (prisma as any).user.findMany({
      orderBy: { numericId: "asc" },
      include: { wallet: true },
    });
    if (records && records.length > 0) {
      return records.map((u: any) => ({
        id: u.id,
        numericId: u.numericId,
        name: u.name || "مستخدم تسونامي",
        email: u.email,
        phone: u.phone || null,
        countryCode: u.countryCode || "+963",
        countryName: u.countryName || "سوريا",
        walletBalance: u.wallet ? Number(u.wallet.balance) : 0,
        role: u.role || "USER",
        isVerified: u.isVerified ?? false,
        kycStatus: u.kycStatus || "NOT_SUBMITTED",
        isFrozen: u.isFrozen ?? false,
        createdAt: u.createdAt.toISOString(),
      }));
    }
  } catch {
    // Database fallback
  }

  return Array.from(store.users.values());
}

export async function updateUserRole(
  userId: string,
  role: "USER" | "RESELLER" | "AGENT",
  commissionRate?: number
): Promise<DynamicUserItem | null> {
  const existing = store.users.get(userId);
  if (!existing) return null;

  existing.role = role;
  if (commissionRate !== undefined) {
    existing.commissionRate = commissionRate;
  }

  try {
    await (prisma as any).user.update({
      where: { id: userId },
      data: { role },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function toggleFreezeUser(userId: string, isFrozen: boolean): Promise<DynamicUserItem | null> {
  const existing = store.users.get(userId);
  if (!existing) return null;

  existing.isFrozen = isFrozen;

  try {
    await (prisma as any).user.update({
      where: { id: userId },
      data: { isFrozen },
    });
  } catch {
    // Memory
  }

  return existing;
}

export async function adjustUserBalance(
  userId: string,
  amount: number,
  note: string,
  performedBy: string,
  operatorId?: string,
  operatorAvatar?: string
): Promise<{ user: DynamicUserItem; newBalance: number }> {
  const existing = store.users.get(userId);
  if (!existing) throw new Error("المستخدم غير موجود");

  const newBalance = Math.max(0, existing.walletBalance + amount);
  existing.walletBalance = Number(newBalance.toFixed(2));

  // Sync with persistentStore wallet
  try {
    const pWallet = persistentStore.getWallet(userId);
    pWallet.balance = existing.walletBalance;
    persistentStore.saveWallet(pWallet);

    persistentStore.addTransaction({
      id: `tx-adj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      walletId: pWallet.id,
      userId: userId,
      type: amount >= 0 ? "DEPOSIT" : "ORDER_PAYMENT",
      amount: Math.abs(amount),
      balanceBefore: Math.max(0, existing.walletBalance - amount),
      balanceAfter: existing.walletBalance,
      description: `شحن وتعديل رصيد يدوي: ${note}`,
      reference: `TX-ROOT-${Date.now()}`,
      processedById: operatorId || null,
      operatorName: performedBy || "المشرف العام (Root Super-Admin)",
      operatorAvatar: operatorAvatar || "/images/logo.png",
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[adjustUserBalance] PersistentStore sync:", err);
  }

  try {
    const userWallet = await (prisma as any).wallet.findUnique({
      where: { userId },
    });
    if (userWallet) {
      await (prisma as any).wallet.update({
        where: { userId },
        data: { balance: newBalance },
      });
      await (prisma as any).transaction.create({
        data: {
          walletId: userWallet.id,
          userId: userId,
          amount: Math.abs(amount),
          type: amount >= 0 ? "DEPOSIT" : "ORDER_PAYMENT",
          balanceBefore: Math.max(0, existing.walletBalance - amount),
          balanceAfter: newBalance,
          description: `شحن وتعديل رصيد يدوي: ${note}`,
          reference: `TX-ROOT-${Date.now()}`,
          processedById: operatorId || null,
          operatorName: performedBy || "المشرف العام (Root Super-Admin)",
          operatorAvatar: operatorAvatar || "/images/logo.png",
        },
      });
    }
  } catch {
    // Memory
  }

  return { user: existing, newBalance: existing.walletBalance };
}

export async function deleteUser(userId: string): Promise<boolean> {
  store.users.delete(userId);
  try {
    await (prisma as any).user.delete({ where: { id: userId } });
  } catch {
    // Memory
  }
  return true;
}

export async function createDynamicUser(data: {
  name: string;
  email: string;
  role: "USER" | "RESELLER" | "AGENT";
  walletBalance?: number;
  phone?: string;
  countryName?: string;
  isVerified?: boolean;
}): Promise<DynamicUserItem> {
  const id = `user-${Date.now()}`;
  const numericId = 2000 + store.users.size + 1;
  const item: DynamicUserItem = {
    id,
    numericId,
    name: data.name,
    email: data.email.toLowerCase().trim(),
    phone: data.phone || "+9639" + Math.floor(10000000 + Math.random() * 90000000),
    countryCode: "+963",
    countryName: data.countryName || "سوريا",
    walletBalance: Number(data.walletBalance) || 0,
    role: data.role,
    isVerified: Boolean(data.isVerified),
    kycStatus: data.isVerified ? "AUTO_VERIFIED" : "NOT_SUBMITTED",
    isFrozen: false,
    createdAt: new Date().toISOString(),
  };

  store.users.set(id, item);

  try {
    await (prisma as any).user.create({
      data: {
        id: item.id,
        numericId: item.numericId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.role,
        isVerified: item.isVerified,
        kycStatus: item.kycStatus,
        wallet: {
          create: {
            balance: item.walletBalance,
            currency: "USD",
          },
        },
      },
    });
  } catch {
    // Memory
  }

  return item;
}

export async function overrideUserKyc(
  userId: string,
  isVerified: boolean,
  kycStatus: "NOT_SUBMITTED" | "PENDING_BOT_REVIEW" | "AUTO_VERIFIED" | "MANUAL_REVIEW" | "REJECTED"
): Promise<DynamicUserItem | null> {
  const existing = store.users.get(userId);
  if (!existing) return null;

  existing.isVerified = isVerified;
  existing.kycStatus = kycStatus;

  try {
    await (prisma as any).user.update({
      where: { id: userId },
      data: { isVerified, kycStatus },
    });
  } catch {
    // Memory
  }

  return existing;
}

// =============================================================
// 8. AUTOMATED KYC VERIFICATION & REVIEW ENGINE
// =============================================================
export async function getKycVerifications(): Promise<DynamicKycItem[]> {
  try {
    const records = await (prisma as any).kycVerification.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    if (records && records.length > 0) {
      return records.map((k: any) => ({
        id: k.id,
        userId: k.userId,
        userNumericId: k.user?.numericId,
        userName: k.user?.name,
        userEmail: k.user?.email,
        idCardFrontUrl: k.idCardFrontUrl,
        idCardBackUrl: k.idCardBackUrl,
        selfieUrl: k.selfieUrl,
        idNumber: k.idNumber,
        extractedName: k.extractedName,
        matchScore: k.matchScore ? Number(k.matchScore) : null,
        status: k.status,
        botNotes: k.botNotes,
        reviewedBy: k.reviewedBy,
        createdAt: k.createdAt.toISOString(),
        updatedAt: k.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Fallback
  }

  return Array.from(store.kyc.values());
}

export async function submitKycVerification(input: {
  userId: string;
  userName: string;
  idNumber: string;
  idCardFrontUrl: string;
  idCardBackUrl?: string;
  selfieUrl?: string;
  rawOcrText?: string;
  userPhone?: string;
}): Promise<DynamicKycItem> {
  // Find user details from memory or database
  const user = store.users.get(input.userId);
  const resolvedPhone = input.userPhone || user?.phone;

  const { analyzeKycDocument } = await import("./kyc-bot-service");
  const analysis = await analyzeKycDocument({
    userId: input.userId,
    userName: input.userName,
    idNumber: input.idNumber,
    idCardFrontUrl: input.idCardFrontUrl,
    idCardBackUrl: input.idCardBackUrl,
    selfieUrl: input.selfieUrl,
    rawOcrText: input.rawOcrText,
    userEmail: user?.email,
    userPhone: resolvedPhone,
    userNumericId: user?.numericId,
  });

  const kycId = `kyc-${Date.now()}`;
  const now = new Date().toISOString();

  const kycRecord: DynamicKycItem = {
    id: kycId,
    userId: input.userId,
    userNumericId: user?.numericId,
    userName: input.userName,
    userEmail: user?.email,
    userPhone: resolvedPhone,
    idCardFrontUrl: input.idCardFrontUrl,
    idCardBackUrl: input.idCardBackUrl,
    selfieUrl: input.selfieUrl,
    idNumber: input.idNumber,
    extractedName: analysis.extractedName,
    matchScore: analysis.matchScore,
    status: analysis.status,
    botNotes: analysis.botNotes,
    documentType: analysis.extractedFields.documentType,
    lastUpdateDate: analysis.extractedFields.lastUpdateDate,
    calculatedExpiryDate: analysis.extractedFields.calculatedExpiryDate,
    expiryDate: analysis.extractedFields.expiryDate,
    isExpired: analysis.extractedFields.isExpired,
    validityStatus: analysis.extractedFields.validityStatus,
    recommendation: analysis.validation.recommendationText,
    rawOcrText: input.rawOcrText,
    createdAt: now,
    updatedAt: now,
  };

  store.kyc.set(kycId, kycRecord);

  // Update user verification status
  if (user) {
    user.kycStatus = analysis.status;
    if (analysis.status === "AUTO_VERIFIED") {
      user.isVerified = true;
    }
  }
  setMemoryUserVerified(input.userId, analysis.status === "AUTO_VERIFIED", analysis.status);

  try {
    await (prisma as any).kycVerification.upsert({
      where: { userId: input.userId },
      update: {
        idCardFrontUrl: kycRecord.idCardFrontUrl,
        idCardBackUrl: kycRecord.idCardBackUrl,
        selfieUrl: kycRecord.selfieUrl,
        idNumber: kycRecord.idNumber,
        extractedName: kycRecord.extractedName,
        matchScore: kycRecord.matchScore,
        status: kycRecord.status,
        botNotes: kycRecord.botNotes,
      },
      create: {
        id: kycRecord.id,
        userId: kycRecord.userId,
        idCardFrontUrl: kycRecord.idCardFrontUrl,
        idCardBackUrl: kycRecord.idCardBackUrl,
        selfieUrl: kycRecord.selfieUrl,
        idNumber: kycRecord.idNumber,
        extractedName: kycRecord.extractedName,
        matchScore: kycRecord.matchScore,
        status: kycRecord.status,
        botNotes: kycRecord.botNotes,
      },
    });

    await (prisma as any).user.update({
      where: { id: input.userId },
      data: {
        kycStatus: analysis.status,
        isVerified: analysis.status === "AUTO_VERIFIED",
      },
    });
  } catch {
    // Memory
  }

  // Dispatch real-time Telegram notification to KYC Verification Group (-1004469980167)
  import("./telegram")
    .then(({ dispatchKycAlert }) =>
      dispatchKycAlert({
        id: kycRecord.id,
        userId: kycRecord.userId,
        userName: kycRecord.userName,
        userPhone: kycRecord.userPhone,
        userNumericId: kycRecord.userNumericId,
        idNumber: kycRecord.idNumber || "غير متوفر",
        idCardFrontUrl: kycRecord.idCardFrontUrl,
        idCardBackUrl: kycRecord.idCardBackUrl,
        matchScore: kycRecord.matchScore,
        status: kycRecord.status,
        botNotes: kycRecord.botNotes,
        createdAt: kycRecord.createdAt,
      })
    )
    .catch((err) => console.error("[Telegram KYC Dispatch Error]:", err));

  return kycRecord;
}

export async function reviewKycManual(
  kycIdOrUserId: string,
  decision: "APPROVE" | "REJECT",
  reviewedBy: string,
  notes?: string
): Promise<DynamicKycItem | null> {
  // Look up record by KYC ID or by User ID
  let record = store.kyc.get(kycIdOrUserId);
  if (!record) {
    record = Array.from(store.kyc.values()).find(
      (k) => k.id === kycIdOrUserId || k.userId === kycIdOrUserId
    );
  }

  const targetUserId = record?.userId || kycIdOrUserId;
  const newStatus = decision === "APPROVE" ? "AUTO_VERIFIED" : "REJECTED";
  const user = store.users.get(targetUserId);

  if (!record) {
    const now = new Date().toISOString();
    record = {
      id: `kyc-${Date.now()}`,
      userId: targetUserId,
      userNumericId: user?.numericId,
      userName: user?.name,
      userEmail: user?.email,
      userPhone: user?.phone,
      idCardFrontUrl: "/images/kyc_mock_front.jpg",
      status: newStatus,
      botNotes: `[مراجعة المشرف: ${decision === "APPROVE" ? "تمت الموافقة وتوثيق الحساب" : "تم رفض التوثيق"} بواسطة ${reviewedBy}] ${notes ? "- السبب: " + notes : ""}`,
      createdAt: now,
      updatedAt: now,
      reviewedBy,
    };
    store.kyc.set(record.id, record);
  } else {
    record.status = newStatus;
    record.reviewedBy = reviewedBy;
    record.botNotes = `${record.botNotes || ""}\n\n[مراجعة المشرف: ${decision === "APPROVE" ? "تمت الموافقة وتوثيق الحساب" : "تم رفض التوثيق"} بواسطة ${reviewedBy}] ${notes ? "- السبب: " + notes : ""}`;
    record.updatedAt = new Date().toISOString();
  }

  if (user) {
    user.kycStatus = newStatus;
    user.isVerified = decision === "APPROVE";
  }
  setMemoryUserVerified(targetUserId, decision === "APPROVE", newStatus);

  try {
    if (record) {
      await (prisma as any).kycVerification.update({
        where: { id: record.id },
        data: {
          status: newStatus,
          reviewedBy,
          botNotes: record.botNotes,
        },
      });
    } else {
      await (prisma as any).kycVerification.updateMany({
        where: { userId: targetUserId },
        data: {
          status: newStatus,
          reviewedBy,
        },
      });
    }

    await (prisma as any).user.update({
      where: { id: targetUserId },
      data: {
        kycStatus: newStatus,
        isVerified: decision === "APPROVE",
      },
    });
  } catch {
    // Memory/fallback database mode
  }

  return record;
}



// =============================================================
// 9. ABOUT US & DYNAMIC HIGHLIGHTS MANAGEMENT
// =============================================================
const defaultAboutContent: AboutContentItem = {
  heroBadge: "المنصة الرقمية المعتمدة",
  heroTitle: "منصة تسونامي الرقمية (TSUNAMI)",
  heroSubtitle:
    "بوابتك الرائدة في الشرق الأوسط لشحن اشتراكات وتطبيقات البث والألعاب الرقمية الفورية بأعلى معايير الأمان والسرعة.",
  visionTitle: "رؤيتنا",
  visionText:
    "أن نكون المنصة الأكثر موثوقية والأوسع انتشاراً في سوريا والشرق الأوسط، من خلال تقديم بنية دفع وشحن رقمي متكاملة تجمع بين السرعة الفائقة، الأسعار المنافسة، وتوفير كافة حلول التحويل المحلي وعلى رأسها شام كاش (Sham Cash).",
  coreValues: [
    {
      id: "val-1",
      title: "تنفيذ آلي فوري",
      description: "ربط خوادم مباشر وتسليم المعاملات دون أي تأخير.",
      icon: "Zap",
      isActive: true,
    },
    {
      id: "val-2",
      title: "أمان مصرفي مشفر",
      description: "حماية بيانات الحسابات ومطابقة هوية صارمة لضمان سلامة الأموال.",
      icon: "ShieldCheck",
      isActive: true,
    },
    {
      id: "val-3",
      title: "أسعار صرف منافسة",
      description: "أقل هوامش ربح في السوق لدعم صناع المحتوى واللاعبين والوكلاء.",
      icon: "Award",
      isActive: true,
    },
    {
      id: "val-4",
      title: "دعم فني على مدار الساعة",
      description: "فريق دعم حقيقي وجاهز عبر تيليجرام وواتساب للمتابعة الفورية.",
      icon: "Headphones",
      isActive: true,
    },
  ],
  promoBanners: [
    {
      id: "ban-1",
      title: "خصم حصري للموزعين والوكلاء VIP",
      subtitle: "احصل على عمولات حصرية وأسعار جملة خاصة لشحن كوينز وماسات الغرف الصوتية.",
      badge: "عرض خاص",
      link: "/agents",
      isActive: true,
    },
    {
      id: "ban-2",
      title: "شام كاش فوري (Sham Cash #1)",
      subtitle: "إيداع وشحن فوري للمحفظة عبر تطبيق شام كاش لجميع المحافظات السورية.",
      badge: "فوري ⚡",
      link: "/deposit",
      isActive: true,
    },
  ],
  updatedAt: new Date().toISOString(),
};

export async function getAboutContent(): Promise<AboutContentItem> {
  if (!store.about) {
    store.about = { ...defaultAboutContent };
  }
  return store.about;
}

export async function updateAboutContent(data: Partial<AboutContentItem>): Promise<AboutContentItem> {
  const current = await getAboutContent();
  store.about = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return store.about;
}

export async function toggleAboutValue(valueId: string): Promise<AboutContentItem> {
  const current = await getAboutContent();
  const value = current.coreValues.find((v) => v.id === valueId);
  if (value) {
    value.isActive = !value.isActive;
    current.updatedAt = new Date().toISOString();
  }
  return current;
}

export async function addPromoBanner(data: {
  title: string;
  subtitle: string;
  badge?: string;
  link?: string;
}): Promise<PromoBannerItem> {
  const current = await getAboutContent();
  const banner: PromoBannerItem = {
    id: `ban-${Date.now()}`,
    title: data.title,
    subtitle: data.subtitle,
    badge: data.badge,
    link: data.link,
    isActive: true,
  };
  current.promoBanners.unshift(banner);
  current.updatedAt = new Date().toISOString();
  return banner;
}

export async function togglePromoBanner(bannerId: string): Promise<AboutContentItem> {
  const current = await getAboutContent();
  const banner = current.promoBanners.find((b) => b.id === bannerId);
  if (banner) {
    banner.isActive = !banner.isActive;
    current.updatedAt = new Date().toISOString();
  }
  return current;
}

export async function deletePromoBanner(bannerId: string): Promise<AboutContentItem> {
  const current = await getAboutContent();
  current.promoBanners = current.promoBanners.filter((b) => b.id !== bannerId);
  current.updatedAt = new Date().toISOString();
  return current;
}

