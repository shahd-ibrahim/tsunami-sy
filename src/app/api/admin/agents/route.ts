import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { verifySessionToken } from "@/lib/auth";
import { persistentStore, PersistentAgent } from "@/lib/persistent-store";
import { prisma } from "@/lib/prisma";

async function isSuperAdmin(req: NextRequest): Promise<boolean> {
  try {
    const rootToken = req.cookies.get(ROOT_COOKIE_NAME)?.value;
    if (rootToken) {
      const payload = await verifyRootToken(rootToken);
      if (payload?.isRoot) return true;
    }

    const sessionToken =
      req.cookies.get("next-auth.session-token")?.value ||
      req.cookies.get("tsunami_session")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload?.role === "SUPER_ADMIN" || payload?.role === "ADMIN") return true;
    }

    // In local development, permit access if no rootToken is set
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
  } catch {
    if (process.env.NODE_ENV !== "production") return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive =
      searchParams.get("onlyActive") === "true" ||
      searchParams.get("activeOnly") === "true";

    // 1. Fetch from persistentStore
    let agents = persistentStore.getAgents(onlyActive);

    // 2. Fallback to Prisma if database is connected
    try {
      const dbAgents = await (prisma as any).agent.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { orderIndex: "asc" },
      });
      if (dbAgents && dbAgents.length > 0) {
        agents = dbAgents.map((a: any) => ({
          id: a.id,
          name: a.name,
          city: a.city,
          address: a.address,
          phone: a.phone,
          whatsappUrl: a.whatsappUrl,
          image: a.image,
          isActive: a.isActive,
          orderIndex: a.orderIndex,
          createdAt: a.createdAt.toISOString ? a.createdAt.toISOString() : a.createdAt,
          updatedAt: a.updatedAt.toISOString ? a.updatedAt.toISOString() : a.updatedAt,
        }));
      }
    } catch {
      // Prisma offline, persistentStore already used
    }

    return NextResponse.json({ success: true, agents });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isSuperAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "غير مصرح: إدارة الوكلاء محصورة بالإدارة العليا (SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, city, phone, whatsappUrl, address, image, isActive = true, orderIndex = 0 } = body;

    if (!name?.trim() || !city?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: "الاسم، المدينة، ورقم الهاتف حقول مطلوبة" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanWhatsapp = whatsappUrl?.trim() || (cleanPhone ? `https://wa.me/${cleanPhone.replace(/[^0-9]/g, "")}` : null);
    const now = new Date().toISOString();

    const newAgent: PersistentAgent = {
      id: `agent-${Date.now()}-${uuidv4().substring(0, 4)}`,
      name: name.trim(),
      city: city.trim(),
      address: address?.trim() || null,
      phone: cleanPhone,
      whatsappUrl: cleanWhatsapp,
      image: image?.trim() || "/images/logo.png",
      isActive: Boolean(isActive),
      orderIndex: Number(orderIndex) || 0,
      createdAt: now,
      updatedAt: now,
    };

    persistentStore.saveAgent(newAgent);

    try {
      await (prisma as any).agent.create({
        data: {
          id: newAgent.id,
          name: newAgent.name,
          city: newAgent.city,
          address: newAgent.address,
          phone: newAgent.phone,
          whatsappUrl: newAgent.whatsappUrl,
          image: newAgent.image,
          isActive: newAgent.isActive,
          orderIndex: newAgent.orderIndex,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `تمت إضافة الوكيل (${newAgent.name}) بنجاح`,
      agent: newAgent,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await isSuperAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "غير مصرح: إدارة الوكلاء محصورة بالإدارة العليا (SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, name, city, phone, whatsappUrl, address, image, isActive, orderIndex } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الوكيل مطلوب" }, { status: 400 });
    }

    const existing = persistentStore.getAgentById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "الوكيل غير موجود" }, { status: 404 });
    }

    const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const updatedWhatsapp =
      whatsappUrl !== undefined
        ? whatsappUrl.trim()
        : phone !== undefined
        ? `https://wa.me/${updatedPhone.replace(/[^0-9]/g, "")}`
        : existing.whatsappUrl;

    const updatedAgent: PersistentAgent = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      city: city !== undefined ? city.trim() : existing.city,
      phone: updatedPhone,
      whatsappUrl: updatedWhatsapp,
      address: address !== undefined ? address?.trim() || null : existing.address,
      image: image !== undefined ? image?.trim() || "/images/logo.png" : existing.image,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      orderIndex: orderIndex !== undefined ? Number(orderIndex) || 0 : existing.orderIndex,
      updatedAt: new Date().toISOString(),
    };

    persistentStore.saveAgent(updatedAgent);

    try {
      await (prisma as any).agent.update({
        where: { id },
        data: {
          name: updatedAgent.name,
          city: updatedAgent.city,
          phone: updatedAgent.phone,
          whatsappUrl: updatedAgent.whatsappUrl,
          address: updatedAgent.address,
          image: updatedAgent.image,
          isActive: updatedAgent.isActive,
          orderIndex: updatedAgent.orderIndex,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `تم تحديث بيانات الوكيل (${updatedAgent.name}) بنجاح`,
      agent: updatedAgent,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export const PUT = PATCH;

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isSuperAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "غير مصرح: إدارة الوكلاء محصورة بالإدارة العليا (SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الوكيل مطلوب" }, { status: 400 });
    }

    const deleted = persistentStore.deleteAgent(id);

    try {
      await (prisma as any).agent.delete({
        where: { id },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: deleted ? "تم حذف الوكيل بنجاح" : "تم حذف الوكيل من قاعدة البيانات",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
