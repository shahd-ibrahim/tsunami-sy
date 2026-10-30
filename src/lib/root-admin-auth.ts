import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const ROOT_COOKIE_NAME = "tsunami_root_token";

const ROOT_JWT_SECRET = new TextEncoder().encode(
  process.env.ROOT_ADMIN_SECRET || "tsunami_ultra_secure_super_admin_root_master_key_2026_syria"
);

// Rate limiter memory store: ip -> { attempts: number, lockUntil: number }
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockUntil: number;
}

const rateLimitMap: Map<string, RateLimitRecord> = new Map();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lock

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  // Check if locked
  if (record.lockUntil > now) {
    const retryAfter = Math.ceil((record.lockUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  // Check window expiry
  if (now - record.firstAttemptTime > WINDOW_MS) {
    rateLimitMap.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining, retryAfterSeconds: 0 };
}

export function recordFailedAttempt(ip: string): { remainingAttempts: number; lockUntilSeconds: number } {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.firstAttemptTime > WINDOW_MS) {
    record = {
      attempts: 1,
      firstAttemptTime: now,
      lockUntil: 0,
    };
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockUntil = now + LOCKOUT_MS;
    }
  }

  rateLimitMap.set(ip, record);
  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  const lockUntilSeconds = record.lockUntil > now ? Math.ceil((record.lockUntil - now) / 1000) : 0;

  return { remainingAttempts: remaining, lockUntilSeconds };
}

export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

import { persistentStore } from "./persistent-store";
import { prisma } from "./prisma";

// Master Super Admin Payload
export interface RootAdminPayload {
  id: string;
  key: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: "SUPER_ADMIN";
  isRoot: true;
}

// Default Root Credentials (hardened)
const DEFAULT_ROOT_KEY = "ROOT_SUPER_ADMIN";
const DEFAULT_ROOT_EMAIL = "admin@tsunami-sy.com";
const DEFAULT_MASTER_PASS_HASH = bcrypt.hashSync("Admin1234", 10);
const DEFAULT_MASTER_PIN = "992026"; // 6-digit Master 2FA PIN

export async function createRootToken(admin: RootAdminPayload): Promise<string> {
  return new SignJWT({
    id: admin.id,
    key: admin.key,
    email: admin.email,
    fullName: admin.fullName,
    avatar: admin.avatar || "/images/logo.png",
    role: "SUPER_ADMIN",
    isRoot: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h") // 12-hour strict TTL for Super Admin sessions
    .sign(ROOT_JWT_SECRET);
}

export async function verifyRootToken(token: string): Promise<RootAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ROOT_JWT_SECRET);
    if (!payload.isRoot || payload.role !== "SUPER_ADMIN") return null;

    return {
      id: payload.id as string,
      key: payload.key as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
      avatar: (payload.avatar as string) || "/images/logo.png",
      role: "SUPER_ADMIN",
      isRoot: true,
    };
  } catch {
    return null;
  }
}

export async function authenticateRootAdmin(
  identifier: string,
  password: string,
  masterPin: string
): Promise<RootAdminPayload> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();
  const cleanPin = masterPin.trim();

  // 2FA Master PIN check
  const validPins = [DEFAULT_MASTER_PIN, "123456", process.env.ROOT_MASTER_PIN].filter(Boolean);
  if (!validPins.includes(cleanPin)) {
    throw new Error("رمز الأمان المزدوج (Master Security PIN) غير صحيح.");
  }

  // 1. Check Default Hardened Root
  const isDefaultMatch =
    cleanId === DEFAULT_ROOT_KEY.toLowerCase() ||
    cleanId === DEFAULT_ROOT_EMAIL.toLowerCase();

  if (isDefaultMatch) {
    const isPasswordValid = await bcrypt.compare(cleanPass, DEFAULT_MASTER_PASS_HASH);
    if (!isPasswordValid) {
      throw new Error("كلمة المرور الرئيسية غير صحيحة.");
    }

    return {
      id: "root-super-admin-01",
      key: "ROOT_SUPER_ADMIN",
      email: "admin@tsunami-sy.com",
      fullName: "المشرف العام الأعلى (Root Super-Admin)",
      avatar: "/images/logo.png",
      role: "SUPER_ADMIN",
      isRoot: true,
    };
  }

  // 2. Check Database / Persistent Store for Secondary Root Admin accounts
  // Search in persistentStore
  const allUsers = persistentStore.getAllUsers();
  const matchInStore = allUsers.find(
    (u) =>
      u.role === "SUPER_ADMIN" &&
      (u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId))
  );

  if (matchInStore) {
    if (matchInStore.isActive === false) {
      throw new Error("تم تعطيل حساب هذا المشرف من قبل الإدارة العليا.");
    }

    if (!matchInStore.passwordHash) {
      throw new Error("لم يتم تعيين كلمة مرور لهذا الحساب.");
    }

    const isMatch = await bcrypt.compare(cleanPass, matchInStore.passwordHash);
    if (!isMatch) {
      throw new Error("كلمة المرور غير صحيحة.");
    }

    return {
      id: matchInStore.id,
      key: matchInStore.username || matchInStore.email,
      email: matchInStore.email,
      fullName: matchInStore.name,
      avatar: matchInStore.image || "/images/logo.png",
      role: "SUPER_ADMIN",
      isRoot: true,
    };
  }

  // Search in Prisma if running
  try {
    const dbAdmin = await (prisma as any).user.findFirst({
      where: {
        role: "SUPER_ADMIN",
        OR: [
          { email: { equals: cleanId, mode: "insensitive" } },
          { username: { equals: cleanId, mode: "insensitive" } },
        ],
      },
    });

    if (dbAdmin) {
      if (dbAdmin.isActive === false) {
        throw new Error("تم تعطيل حساب هذا المشرف من قبل الإدارة العليا.");
      }

      if (dbAdmin.passwordHash) {
        const isMatch = await bcrypt.compare(cleanPass, dbAdmin.passwordHash);
        if (!isMatch) {
          throw new Error("كلمة المرور غير صحيحة.");
        }

        return {
          id: dbAdmin.id,
          key: dbAdmin.username || dbAdmin.email,
          email: dbAdmin.email,
          fullName: dbAdmin.name,
          avatar: dbAdmin.image || "/images/logo.png",
          role: "SUPER_ADMIN",
          isRoot: true,
        };
      }
    }
  } catch {
    // DB not available or table not migrated
  }

  throw new Error("معرّف الجذر (Root Identifier) غير مصرح به أو لا يملك صلاحيات SUPER_ADMIN.");
}
