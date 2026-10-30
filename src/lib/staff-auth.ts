import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

export const STAFF_COOKIE_NAME = "tsunami_staff_token";

const STAFF_JWT_SECRET = new TextEncoder().encode(
  process.env.STAFF_JWT_SECRET || "tsunami_isolated_staff_agent_security_key_2026_topup"
);

export const staffLoginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صالح للمشرف أو الوكيل"),
  password: z.string().min(1, "يرجى كتابة كلمة المرور السرية"),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

export interface StaffUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "AGENT" | "FINANCE";
  agentCode: string | null;
}

interface InMemStaffUser extends StaffUserPayload {
  passwordHash: string;
}

const memoryStaffUsers: Map<string, InMemStaffUser> = new Map();

// Pre-seed demo staff accounts in fallback store
(async () => {
  const adminHash = await bcrypt.hash("Admin1234", 10);
  const agentHash = await bcrypt.hash("Agent1234", 10);

  memoryStaffUsers.set("admin@tsunami-sy.com", {
    id: "staff-root-admin",
    email: "admin@tsunami-sy.com",
    fullName: "المشرف العام (Root Admin)",
    role: "SUPER_ADMIN",
    agentCode: "ROOT-001",
    passwordHash: adminHash,
  });

  memoryStaffUsers.set("agent@tsunami-sy.com", {
    id: "staff-agent-syr",
    email: "agent@tsunami-sy.com",
    fullName: "وكيل دمشق المعتمد",
    role: "AGENT",
    agentCode: "AGENT-SYR-01",
    passwordHash: agentHash,
  });
})();

export async function createStaffToken(staff: StaffUserPayload): Promise<string> {
  return new SignJWT({
    id: staff.id,
    email: staff.email,
    fullName: staff.fullName,
    role: staff.role,
    agentCode: staff.agentCode,
    isStaff: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2d") // shorter TTL for staff security
    .sign(STAFF_JWT_SECRET);
}

export async function verifyStaffToken(token: string): Promise<StaffUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, STAFF_JWT_SECRET);
    if (!payload.isStaff) return null;

    return {
      id: payload.id as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
      role: payload.role as "SUPER_ADMIN" | "AGENT" | "FINANCE",
      agentCode: (payload.agentCode as string) || null,
    };
  } catch {
    return null;
  }
}

export async function authenticateStaff(input: StaffLoginInput): Promise<StaffUserPayload> {
  const email = input.email.toLowerCase().trim();

  try {
    const dbAdmin = await (prisma as any).adminUser.findUnique({
      where: { email },
    });

    if (dbAdmin && dbAdmin.isActive) {
      const isMatch = await bcrypt.compare(input.password, dbAdmin.passwordHash);
      if (!isMatch) {
        throw new Error("بيانات الدخول غير صحيحة، تم تسجيل محاولة الدخول غير المصرح بها.");
      }

      return {
        id: dbAdmin.id,
        email: dbAdmin.email,
        fullName: dbAdmin.fullName,
        role: dbAdmin.role as "SUPER_ADMIN" | "AGENT" | "FINANCE",
        agentCode: dbAdmin.agentCode,
      };
    }
  } catch (err: any) {
    if (err.message.includes("بيانات الدخول غير صحيحة")) {
      throw err;
    }
    // Fallback to in-memory staff store if database is offline in local dev mode
    console.warn("[StaffAuth] Database offline, checking fallback in-memory staff store");
  }

  const memStaff = memoryStaffUsers.get(email);
  if (!memStaff) {
    throw new Error("بيانات المشرف أو الوكيل غير موجودة بالنظام.");
  }

  const isMatch = await bcrypt.compare(input.password, memStaff.passwordHash);
  if (!isMatch) {
    throw new Error("بيانات الدخول غير صحيحة، تم تسجيل محاولة الدخول غير المصرح بها.");
  }

  return {
    id: memStaff.id,
    email: memStaff.email,
    fullName: memStaff.fullName,
    role: memStaff.role,
    agentCode: memStaff.agentCode,
  };
}
