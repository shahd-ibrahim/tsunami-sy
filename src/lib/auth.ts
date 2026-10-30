import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import { WalletService } from "./wallet-service";
import { persistentStore, PersistentUser } from "./persistent-store";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tsunami_super_secret_jwt_encryption_key_2026_syria"
);

export const COOKIE_NAME = "next-auth.session-token";
export const LEGACY_COOKIE_NAME = "tsunami_session";

// NextAuth / Persistent JWT Session Configuration
export const authConfig = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days persistence
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
};

// 1. Zod Validation Schemas
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "يجب أن يتكون الاسم من حرفين على الأقل")
    .max(50, "الاسم طويل جداً"),
  username: z
    .string()
    .min(3, "يجب أن يكون اسم المستخدم 3 أحرف على الأقل")
    .regex(/^[a-zA-Z0-9_.]+$/, "يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("يرجى إدخال بريد إلكتروني صالح (مثال: user@example.com)"),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن لا تقل عن 8 خانات")
    .regex(/[A-Za-z]/, "يجب أن تحتوي كلمة المرور على أحرف باللغة الإنجليزية")
    .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على أرقام على الأقل"),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  countryName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "يرجى إدخال البريد الإلكتروني أو اسم المستخدم"),
  password: z
    .string()
    .min(1, "يرجى كتابة كلمة المرور"),
});

export const completeProfileSchema = z.object({
  name: z.string().min(2, "يجب أن يتكون اسم المستخدم من حرفين على الأقل").optional(),
  username: z
    .string()
    .min(3, "يجب أن يكون اسم المستخدم 3 أحرف على الأقل")
    .regex(/^[a-zA-Z0-9_.]+$/, "يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)")
    .optional()
    .or(z.literal("")),
  countryCode: z.string().min(1, "يرجى اختيار الدولة"),
  countryName: z.string().min(1, "يرجى اختيار الدولة"),
  phone: z.string().min(6, "يرجى إدخال رقم هاتف صالح"),
  preferredCurrency: z.enum(["USD", "TRY", "SYP"]).default("USD"),
  referralCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUserPayload {
  id: string;
  numericId: number;
  email: string;
  name: string;
  username?: string | null;
  image?: string | null;
  role: "USER" | "RESELLER" | "ADMIN" | "SUPER_ADMIN";
  phone?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  preferredCurrency?: "USD" | "TRY" | "SYP" | null;
  referralCode?: string | null;
  authProvider: "EMAIL" | "GOOGLE";
  isVerified?: boolean;
  kycStatus?: string;
}

// Persistent resilient fallback for offline dev/demo backed by globalThis
interface InMemUser extends AuthUserPayload {
  passwordHash?: string | null;
  createdAt: string;
}

const globalForAuth = globalThis as unknown as {
  memoryUsers?: Map<string, InMemUser>;
  nextNumericId?: number;
};

export const memoryUsers = globalForAuth.memoryUsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUsers = memoryUsers;

let nextNumericId = globalForAuth.nextNumericId ?? 1004;
globalForAuth.nextNumericId = nextNumericId;

// Seed demo users if empty
if (memoryUsers.size === 0) {
  const adminHash = bcrypt.hashSync("Admin1234", 10);
  const vipHash = bcrypt.hashSync("VipPass123", 10);
  const userHash = bcrypt.hashSync("UserPass123", 10);

  memoryUsers.set("admin@tsunami-sy.com", {
    id: "admin-root",
    numericId: 1001,
    email: "admin@tsunami-sy.com",
    name: "المشرف العام (Root Admin)",
    username: "admin_root",
    image: null,
    role: "ADMIN",
    phone: "+963912345678",
    countryCode: "+963",
    countryName: "سوريا",
    authProvider: "EMAIL",
    isVerified: true,
    kycStatus: "APPROVED",
    passwordHash: adminHash,
    createdAt: new Date().toISOString(),
  });

  memoryUsers.set("vip@tsunami-sy.com", {
    id: "user-vip-1",
    numericId: 1002,
    email: "vip@tsunami-sy.com",
    name: "موزع دمشق المعتمد (VIP)",
    username: "vip_damascus",
    image: null,
    role: "RESELLER",
    phone: "+963998765432",
    countryCode: "+963",
    countryName: "سوريا",
    authProvider: "EMAIL",
    isVerified: true,
    kycStatus: "APPROVED",
    passwordHash: vipHash,
    createdAt: new Date().toISOString(),
  });

  memoryUsers.set("user@tsunami-sy.com", {
    id: "user-regular-1",
    numericId: 1003,
    email: "user@tsunami-sy.com",
    name: "أحمد السوري",
    username: "ahmed_sy",
    image: null,
    role: "USER",
    phone: "+963933112233",
    countryCode: "+963",
    countryName: "سوريا",
    authProvider: "EMAIL",
    isVerified: false,
    kycStatus: "NOT_SUBMITTED",
    passwordHash: userHash,
    createdAt: new Date().toISOString(),
  });
}

// 2. Password Hashing & Verification
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 3. JWT Token Generation & Verification
export async function createSessionToken(user: AuthUserPayload): Promise<string> {
  return new SignJWT({
    id: user.id,
    numericId: user.numericId,
    email: user.email,
    name: user.name,
    username: user.username || null,
    image: user.image || null,
    role: user.role,
    phone: user.phone || null,
    countryCode: user.countryCode || null,
    countryName: user.countryName || null,
    preferredCurrency: user.preferredCurrency || "USD",
    referralCode: user.referralCode || null,
    authProvider: user.authProvider || "EMAIL",
    isVerified: Boolean(user.isVerified),
    kycStatus: user.kycStatus || "NOT_SUBMITTED",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      numericId: Number(payload.numericId) || 1001,
      email: payload.email as string,
      name: payload.name as string,
      username: (payload.username as string) || null,
      image: (payload.image as string) || null,
      role: (payload.role as "USER" | "RESELLER" | "ADMIN") || "USER",
      phone: (payload.phone as string) || null,
      countryCode: (payload.countryCode as string) || null,
      countryName: (payload.countryName as string) || null,
      preferredCurrency: (payload.preferredCurrency as "USD" | "TRY" | "SYP") || "USD",
      referralCode: (payload.referralCode as string) || null,
      authProvider: (payload.authProvider as "EMAIL" | "GOOGLE") || "EMAIL",
      isVerified: Boolean(payload.isVerified),
      kycStatus: (payload.kycStatus as string) || "NOT_SUBMITTED",
    };
  } catch {
    return null;
  }
}

// 4. User Registration with Prisma Transaction & Resilient Lifecycle
export async function registerUser(validatedData: RegisterInput): Promise<{
  user: AuthUserPayload;
  initialBalance: number;
}> {
  const email = validatedData.email.toLowerCase().trim();
  const passwordHash = await hashPassword(validatedData.password);

  let usernameToSave: string | null = null;
  if (validatedData.username && validatedData.username.trim()) {
    const norm = validatedData.username.trim().toLowerCase();
    if (norm.length < 3) {
      throw new Error("يجب أن يكون اسم المستخدم 3 أحرف على الأقل");
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(norm)) {
      throw new Error("يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)");
    }
    const taken = await isUsernameTaken(norm);
    if (taken) {
      throw new Error("اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر");
    }
    usernameToSave = norm;
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email },
      });
      if (existing) {
        throw new Error("البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول");
      }

      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: validatedData.name.trim(),
          username: usernameToSave,
          role: "USER",
          phone: validatedData.phone || null,
          countryCode: validatedData.countryCode || null,
          countryName: validatedData.countryName || null,
          authProvider: "EMAIL",
        },
      });

      await tx.wallet.create({
        data: {
          userId: createdUser.id,
          balance: 0.0,
          currency: "USD",
        },
      });

      return createdUser;
    });

    const userPayload: AuthUserPayload = {
      id: user.id,
      numericId: user.numericId,
      email: user.email,
      name: user.name,
      username: user.username,
      image: null,
      role: user.role as "USER" | "RESELLER" | "ADMIN",
      phone: user.phone,
      countryCode: user.countryCode,
      countryName: user.countryName,
      preferredCurrency: "USD",
      referralCode: null,
      authProvider: "EMAIL",
      isVerified: false,
      kycStatus: "NOT_SUBMITTED",
    };

    persistentStore.saveUser({
      ...userPayload,
      passwordHash,
      isFrozen: false,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.createdAt.toISOString(),
    });

    return { user: userPayload, initialBalance: 0.0 };
  } catch (err: any) {
    if (
      err.message?.includes("البريد الإلكتروني مسجل مسبقاً") ||
      err.message?.includes("اسم المستخدم مأخوذ بالفعل") ||
      err.message?.includes("اسم المستخدم")
    ) {
      throw err;
    }

    console.warn("[AuthService] PostgreSQL offline, executing resilient in-memory registration transaction");

    const existing = persistentStore.getUserByEmail(email);
    if (existing) {
      throw new Error("البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول");
    }

    const userId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const numId = persistentStore.getNextNumericId();
    const userPayload: AuthUserPayload = {
      id: userId,
      numericId: numId,
      email,
      name: validatedData.name.trim(),
      username: usernameToSave,
      image: null,
      role: "USER",
      phone: validatedData.phone || null,
      countryCode: validatedData.countryCode || null,
      countryName: validatedData.countryName || null,
      preferredCurrency: "USD",
      referralCode: null,
      authProvider: "EMAIL",
      isVerified: false,
      kycStatus: "NOT_SUBMITTED",
    };

    persistentStore.saveUser({
      ...userPayload,
      passwordHash,
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    persistentStore.getWallet(userId);

    return { user: userPayload, initialBalance: 0.0 };
  }
}

// 5. User Authentication / Login (Supports Email OR Username)
export async function authenticateUser(input: LoginInput): Promise<AuthUserPayload> {
  const identifier = (input.email || "").toLowerCase().trim();

  try {
    const fetchDb = async () => {
      try {
        const found = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier, mode: "insensitive" } },
              { username: { equals: identifier, mode: "insensitive" } },
            ],
          },
        });
        if (found) return found;
        return await prisma.user.findUnique({
          where: { email: identifier },
        });
      } catch {
        return null;
      }
    };

    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const dbUser = await Promise.race([fetchDb(), timeout]);

    if (dbUser) {
      if (!dbUser.passwordHash) {
        throw new Error("تم إنشاء هذا الحساب بواسطة Google، يرجى تسجيل الدخول عبر زر Google");
      }
      const isMatch = await comparePassword(input.password, dbUser.passwordHash);
      if (!isMatch) {
        throw new Error("كلمة المرور أو البريد الإلكتروني غير صحيح");
      }

      const payload: AuthUserPayload = {
        id: dbUser.id,
        numericId: dbUser.numericId,
        email: dbUser.email,
        name: dbUser.name,
        username: dbUser.username,
        image: dbUser.image,
        role: dbUser.role as "USER" | "RESELLER" | "ADMIN",
        phone: dbUser.phone,
        countryCode: dbUser.countryCode,
        countryName: dbUser.countryName,
        preferredCurrency: (dbUser.preferredCurrency as "USD" | "TRY" | "SYP") || "USD",
        referralCode: dbUser.referralCode,
        authProvider: (dbUser.authProvider as "EMAIL" | "GOOGLE") || "EMAIL",
        isVerified: Boolean(dbUser.isVerified),
        kycStatus: dbUser.kycStatus || "NOT_SUBMITTED",
      };

      persistentStore.saveUser({
        ...payload,
        passwordHash: dbUser.passwordHash,
        isFrozen: dbUser.isFrozen,
        createdAt: dbUser.createdAt.toISOString(),
        updatedAt: dbUser.updatedAt.toISOString(),
      });

      return payload;
    }
  } catch (err: any) {
    if (
      err.message === "كلمة المرور أو البريد الإلكتروني غير صحيح" ||
      err.message?.includes("بواسطة Google")
    ) {
      throw err;
    }
    console.warn("[AuthService] Database search fallback to persistent store:", err?.message);
  }

  // Check fallback persistent store by email OR username
  const memUser = persistentStore.getUserByEmail(identifier) || persistentStore.getUserByUsername(identifier);

  if (!memUser) {
    throw new Error("البريد الإلكتروني غير مسجل، يرجى إنشاء حساب جديد أولاً");
  }

  if (!memUser.passwordHash) {
    throw new Error("تم إنشاء هذا الحساب بواسطة Google، يرجى تسجيل الدخول عبر زر Google");
  }

  const isMatch = await comparePassword(input.password, memUser.passwordHash);
  if (!isMatch) {
    throw new Error("كلمة المرور أو البريد الإلكتروني غير صحيح");
  }

  return {
    id: memUser.id,
    numericId: memUser.numericId,
    email: memUser.email,
    name: memUser.name,
    username: memUser.username || null,
    image: memUser.image || null,
    role: memUser.role,
    phone: memUser.phone || null,
    countryCode: memUser.countryCode || null,
    countryName: memUser.countryName || null,
    preferredCurrency: memUser.preferredCurrency || "USD",
    referralCode: memUser.referralCode || null,
    authProvider: memUser.authProvider,
    isVerified: Boolean(memUser.isVerified),
    kycStatus: memUser.kycStatus || "NOT_SUBMITTED",
  };
}

// 6. Google OAuth Flow (Find or Create User)
export async function loginOrRegisterGoogle(profile: {
  email: string;
  name: string;
  googleId?: string;
  avatarUrl?: string;
  image?: string;
  picture?: string;
}): Promise<{
  user: AuthUserPayload;
  needsProfileCompletion: boolean;
}> {
  const email = profile.email.toLowerCase().trim();
  const avatar = profile.image || profile.picture || profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
  const fullName = profile.name.trim() || "Google User";

  try {
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!dbUser) {
      // Create new Google user
      dbUser = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email,
            name: fullName,
            image: avatar,
            authProvider: "GOOGLE",
            role: "USER",
          },
        });

        await tx.wallet.create({
          data: {
            userId: created.id,
            balance: 0.0,
            currency: "USD",
          },
        });

        return created;
      });
    } else {
      // Update image and name (if not verified)
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          ...(avatar ? { image: avatar } : {}),
          ...(!dbUser.isVerified && fullName ? { name: fullName } : {}),
        },
      });
    }

    const userPayload: AuthUserPayload = {
      id: dbUser.id,
      numericId: dbUser.numericId,
      email: dbUser.email,
      name: dbUser.name,
      username: dbUser.username,
      image: dbUser.image || avatar,
      role: dbUser.role as "USER" | "RESELLER" | "ADMIN",
      phone: dbUser.phone,
      countryCode: dbUser.countryCode,
      countryName: dbUser.countryName,
      authProvider: (dbUser.authProvider as "EMAIL" | "GOOGLE") || "GOOGLE",
      isVerified: dbUser.isVerified,
      kycStatus: dbUser.kycStatus,
    };

    persistentStore.saveUser({
      ...userPayload,
      isFrozen: false,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    });

    const needsProfileCompletion = !dbUser.phone || !dbUser.countryCode;

    return { user: userPayload, needsProfileCompletion };
  } catch (err: any) {
    console.warn("[AuthService] PostgreSQL offline, running Google login via persistent store", err.message);

    let memUser = persistentStore.getUserByEmail(email);
    if (!memUser) {
      const userId = `usr-g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const numId = persistentStore.getNextNumericId();
      memUser = {
        id: userId,
        numericId: numId,
        email,
        name: fullName,
        username: null,
        image: avatar,
        role: "USER",
        phone: null,
        countryCode: null,
        countryName: null,
        preferredCurrency: "USD",
        referralCode: null,
        authProvider: "GOOGLE",
        isVerified: false,
        kycStatus: "NOT_SUBMITTED",
        isFrozen: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persistentStore.saveUser(memUser);
      persistentStore.getWallet(userId);
    } else {
      if (avatar) memUser.image = avatar;
      if (fullName && !memUser.isVerified) memUser.name = fullName;
      persistentStore.saveUser(memUser);
    }

    const needsProfileCompletion = !memUser.phone || !memUser.countryCode;
    return {
      user: {
        id: memUser.id,
        numericId: memUser.numericId,
        email: memUser.email,
        name: memUser.name,
        username: memUser.username || null,
        image: memUser.image || avatar,
        role: memUser.role,
        phone: memUser.phone || null,
        countryCode: memUser.countryCode || null,
        countryName: memUser.countryName || null,
        preferredCurrency: memUser.preferredCurrency || "USD",
        referralCode: memUser.referralCode || null,
        authProvider: memUser.authProvider,
        isVerified: Boolean(memUser.isVerified),
        kycStatus: memUser.kycStatus || "NOT_SUBMITTED",
      },
      needsProfileCompletion,
    };
  }
}

// 7. Complete Profile Onboarding
export async function completeUserProfile(
  userId: string,
  data: {
    name?: string;
    username?: string | null;
    phone: string;
    countryCode: string;
    countryName: string;
    preferredCurrency?: "USD" | "TRY" | "SYP";
    referralCode?: string;
  }
): Promise<AuthUserPayload> {
  let usernameToSave: string | undefined = undefined;
  if (data.username !== undefined) {
    if (data.username && data.username.trim()) {
      const norm = data.username.trim().toLowerCase();
      if (norm.length < 3) {
        throw new Error("يجب أن يكون اسم المستخدم 3 أحرف على الأقل");
      }
      if (!/^[a-zA-Z0-9_.]+$/.test(norm)) {
        throw new Error("يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)");
      }
      const taken = await isUsernameTaken(norm, userId);
      if (taken) {
        throw new Error("اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر");
      }
      usernameToSave = norm;
    } else {
      usernameToSave = undefined;
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name?.trim() ? { name: data.name.trim() } : {}),
        ...(usernameToSave !== undefined ? { username: usernameToSave } : {}),
        phone: data.phone.trim(),
        countryCode: data.countryCode.trim(),
        countryName: data.countryName.trim(),
        ...(data.preferredCurrency ? { preferredCurrency: data.preferredCurrency } : {}),
        ...(data.referralCode ? { referralCode: data.referralCode.trim() } : {}),
      },
    });

    const payload: AuthUserPayload = {
      id: updated.id,
      numericId: updated.numericId,
      email: updated.email,
      name: updated.name,
      username: updated.username,
      image: updated.image,
      role: updated.role as "USER" | "RESELLER" | "ADMIN",
      phone: updated.phone,
      countryCode: updated.countryCode,
      countryName: updated.countryName,
      preferredCurrency: (updated.preferredCurrency as "USD" | "TRY" | "SYP") || "USD",
      referralCode: updated.referralCode,
      authProvider: (updated.authProvider as "EMAIL" | "GOOGLE") || "EMAIL",
      isVerified: Boolean(updated.isVerified),
      kycStatus: updated.kycStatus || "NOT_SUBMITTED",
    };

    const existingMem = persistentStore.getUserById(updated.id);
    persistentStore.saveUser({
      ...payload,
      passwordHash: existingMem?.passwordHash,
      isFrozen: existingMem?.isFrozen,
      createdAt: existingMem?.createdAt || updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });

    return payload;
  } catch (err: any) {
    if (err.message?.includes("اسم المستخدم مأخوذ بالفعل") || err.message?.includes("اسم المستخدم")) {
      throw err;
    }

    console.warn("[AuthService] PostgreSQL offline, completing profile via persistent store");

    const u = persistentStore.getUserById(userId);
    if (!u) {
      throw new Error("المستخدم غير موجود");
    }

    if (data.name?.trim()) {
      u.name = data.name.trim();
    }
    if (usernameToSave !== undefined) {
      u.username = usernameToSave;
    }
    u.phone = data.phone.trim();
    u.countryCode = data.countryCode.trim();
    u.countryName = data.countryName.trim();
    u.preferredCurrency = data.preferredCurrency || "USD";
    u.referralCode = data.referralCode?.trim() || null;
    persistentStore.saveUser(u);

    return {
      id: u.id,
      numericId: u.numericId,
      email: u.email,
      name: u.name,
      username: u.username || null,
      image: u.image || null,
      role: u.role,
      phone: u.phone,
      countryCode: u.countryCode,
      countryName: u.countryName,
      preferredCurrency: u.preferredCurrency || "USD",
      referralCode: u.referralCode || null,
      authProvider: u.authProvider,
      isVerified: Boolean(u.isVerified),
      kycStatus: u.kycStatus || "NOT_SUBMITTED",
    };
  }
}

// 7.5. Get User by ID (DB or Resilient Persistent Fallback)
export async function getUserById(userId: string): Promise<AuthUserPayload | null> {
  try {
    const fetchUser = async () => {
      try {
        return await prisma.user.findUnique({ where: { id: userId } });
      } catch {
        return null;
      }
    };
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );
    const u = await Promise.race([fetchUser(), timeout]);
    if (u) {
      const payload: AuthUserPayload = {
        id: u.id,
        numericId: u.numericId,
        email: u.email,
        name: u.name,
        username: u.username,
        image: u.image,
        role: u.role as "USER" | "RESELLER" | "ADMIN",
        phone: u.phone,
        countryCode: u.countryCode,
        countryName: u.countryName,
        preferredCurrency: u.preferredCurrency as "USD" | "TRY" | "SYP" | null,
        referralCode: u.referralCode,
        authProvider: (u.authProvider as "EMAIL" | "GOOGLE") || "EMAIL",
        isVerified: Boolean(u.isVerified),
        kycStatus: u.kycStatus,
      };

      persistentStore.saveUser({
        ...payload,
        passwordHash: u.passwordHash,
        isFrozen: u.isFrozen,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      });

      return payload;
    }
  } catch {
    // PostgreSQL offline fallback
  }

  const mem = persistentStore.getUserById(userId);
  if (mem) {
    return {
      id: mem.id,
      numericId: mem.numericId,
      email: mem.email,
      name: mem.name,
      username: mem.username || null,
      image: mem.image || null,
      role: mem.role,
      phone: mem.phone || null,
      countryCode: mem.countryCode || null,
      countryName: mem.countryName || null,
      preferredCurrency: mem.preferredCurrency || "USD",
      referralCode: mem.referralCode || null,
      authProvider: mem.authProvider,
      isVerified: Boolean(mem.isVerified),
      kycStatus: mem.kycStatus || "NOT_SUBMITTED",
    };
  }
  return null;
}

export function setMemoryUserVerified(userId: string, isVerified: boolean, kycStatus: string) {
  const u = persistentStore.getUserById(userId);
  if (u) {
    u.isVerified = isVerified;
    u.kycStatus = kycStatus;
    persistentStore.saveUser(u);
  }
}

// 7.8. Check Username Uniqueness across DB and Persistent Store
export async function isUsernameTaken(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  try {
    const existing = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalized,
          mode: "insensitive",
        },
        NOT: excludeUserId ? { id: excludeUserId } : undefined,
      },
      select: { id: true },
    });
    if (existing) return true;
  } catch {
    // In-memory fallback if PostgreSQL is offline
  }

  const mem = persistentStore.getUserByUsername(normalized);
  if (mem) {
    if (excludeUserId && mem.id === excludeUserId) return false;
    return true;
  }

  return false;
}

// 8. Update User Profile Info (from /profile) with Strict KYC Legal Name Lock & Avatar Sync
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    username?: string | null;
    image?: string;
    phone?: string;
    countryCode?: string;
    countryName?: string;
  }
): Promise<AuthUserPayload> {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new Error("المستخدم غير موجود");
  }

  // Strict KYC Name Locking:
  // If user is verified, legal name CANNOT be changed!
  if (existingUser.isVerified && data.name && data.name.trim() !== existingUser.name.trim()) {
    throw new Error("تم قفل الاسم القانوني لمطابقته مع وثيقة الهوية الموثقة (KYC)، يمكنك تعديل اسم المستخدم فقط");
  }

  const nameToSave = existingUser.isVerified
    ? existingUser.name
    : data.name !== undefined && data.name.trim()
    ? data.name.trim()
    : existingUser.name;

  let usernameToSave: string | null = existingUser.username || null;
  if (data.username !== undefined) {
    const trimmed = data.username ? data.username.trim().toLowerCase() : "";
    if (trimmed) {
      if (trimmed.length < 3) {
        throw new Error("يجب أن يكون اسم المستخدم 3 أحرف على الأقل");
      }
      const validRegex = /^[a-zA-Z0-9_.]+$/;
      if (!validRegex.test(trimmed)) {
        throw new Error("يسمح فقط بالأحرف الإنجليزية، الأرقام، (_) و (.)");
      }
      const taken = await isUsernameTaken(trimmed, userId);
      if (taken) {
        throw new Error("اسم المستخدم مأخوذ بالفعل، يرجى اختيار اسم آخر");
      }
      usernameToSave = trimmed;
    } else {
      usernameToSave = null;
    }
  }

  const imageToSave = data.image !== undefined ? data.image : existingUser.image;
  const phoneToSave =
    data.phone !== undefined ? data.phone.trim() : existingUser.phone;
  const countryCodeToSave =
    data.countryCode !== undefined
      ? data.countryCode.trim()
      : existingUser.countryCode;
  const countryNameToSave =
    data.countryName !== undefined
      ? data.countryName.trim()
      : existingUser.countryName;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: nameToSave,
        username: usernameToSave,
        image: imageToSave,
        phone: phoneToSave,
        countryCode: countryCodeToSave,
        countryName: countryNameToSave,
      },
    });

    const payload: AuthUserPayload = {
      id: updated.id,
      numericId: updated.numericId,
      email: updated.email,
      name: updated.name,
      username: updated.username,
      image: updated.image,
      role: updated.role as "USER" | "RESELLER" | "ADMIN",
      phone: updated.phone,
      countryCode: updated.countryCode,
      countryName: updated.countryName,
      preferredCurrency: updated.preferredCurrency as "USD" | "TRY" | "SYP" | null,
      referralCode: updated.referralCode,
      authProvider: (updated.authProvider as "EMAIL" | "GOOGLE") || "EMAIL",
      isVerified: Boolean(updated.isVerified),
      kycStatus: updated.kycStatus,
    };

    const existingMem = persistentStore.getUserById(updated.id);
    persistentStore.saveUser({
      ...payload,
      passwordHash: existingMem?.passwordHash,
      isFrozen: existingMem?.isFrozen,
      createdAt: existingMem?.createdAt || updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });

    return payload;
  } catch (err: any) {
    if (err.message?.includes("تم قفل الاسم القانوني")) {
      throw err;
    }

    const u = persistentStore.getUserById(userId);
    if (!u) {
      throw new Error("المستخدم غير موجود");
    }

    u.name = nameToSave;
    u.username = usernameToSave;
    if (imageToSave !== undefined) u.image = imageToSave;
    if (phoneToSave !== undefined) u.phone = phoneToSave;
    if (countryCodeToSave !== undefined) u.countryCode = countryCodeToSave;
    if (countryNameToSave !== undefined) u.countryName = countryNameToSave;
    persistentStore.saveUser(u);

    return {
      id: u.id,
      numericId: u.numericId,
      email: u.email,
      name: u.name,
      username: u.username || null,
      image: u.image || null,
      role: u.role,
      phone: u.phone,
      countryCode: u.countryCode,
      countryName: u.countryName,
      preferredCurrency: u.preferredCurrency || "USD",
      referralCode: u.referralCode || null,
      authProvider: u.authProvider,
      isVerified: Boolean(u.isVerified),
      kycStatus: u.kycStatus || "NOT_SUBMITTED",
    };
  }
}

// 9. Change Password (for email-registered users)
export async function changeUserPassword(
  userId: string,
  oldPass: string,
  newPass: string
): Promise<boolean> {
  if (newPass.length < 8) {
    throw new Error("كلمة المرور الجديدة يجب ألا تقل عن 8 خانات");
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("المستخدم غير موجود");
    if (!user.passwordHash) {
      throw new Error("حسابك مسجل عبر Google ولا يمتلك كلمة مرور");
    }

    const match = await comparePassword(oldPass, user.passwordHash);
    if (!match) throw new Error("كلمة المرور الحالية غير صحيحة");

    const newHash = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    const mem = persistentStore.getUserById(userId);
    if (mem) {
      mem.passwordHash = newHash;
      persistentStore.saveUser(mem);
    }

    return true;
  } catch (err: any) {
    if (err.message.includes("غير صحيحة") || err.message.includes("Google") || err.message.includes("8 خانات")) {
      throw err;
    }

    const u = persistentStore.getUserById(userId);
    if (!u) {
      throw new Error("المستخدم غير موجود");
    }

    if (!u.passwordHash) {
      throw new Error("حسابك مسجل عبر Google ولا يمتلك كلمة مرور");
    }
    const match = await comparePassword(oldPass, u.passwordHash);
    if (!match) throw new Error("كلمة المرور الحالية غير صحيحة");
    u.passwordHash = await hashPassword(newPass);
    persistentStore.saveUser(u);
    return true;
  }
}
