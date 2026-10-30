import { NextRequest, NextResponse } from "next/server";
import { verifyRootToken, ROOT_COOKIE_NAME } from "@/lib/root-admin-auth";
import { verifySessionToken } from "@/lib/auth";
import { persistentStore } from "@/lib/persistent-store";
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

    if (process.env.NODE_ENV !== "production") {
      return true;
    }
  } catch {
    if (process.env.NODE_ENV !== "production") return true;
  }

  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = persistentStore.getAgentById(id);
    if (!agent) {
      return NextResponse.json({ success: false, error: "الوكيل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true, agent });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isSuperAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "غير مصرح: إدارة الوكلاء محصورة بالإدارة العليا (SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = persistentStore.getAgentById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "الوكيل غير موجود" }, { status: 404 });
    }

    const body = await req.json();
    const { name, city, phone, whatsappUrl, address, image, isActive, orderIndex } = body;

    const updatedPhone = phone !== undefined ? phone.trim() : existing.phone;
    const updatedWhatsapp =
      whatsappUrl !== undefined
        ? whatsappUrl.trim()
        : phone !== undefined
        ? `https://wa.me/${updatedPhone.replace(/[^0-9]/g, "")}`
        : existing.whatsappUrl;

    const updated = {
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

    persistentStore.saveAgent(updated);

    try {
      await (prisma as any).agent.update({
        where: { id },
        data: {
          name: updated.name,
          city: updated.city,
          phone: updated.phone,
          whatsappUrl: updated.whatsappUrl,
          address: updated.address,
          image: updated.image,
          isActive: updated.isActive,
          orderIndex: updated.orderIndex,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: "تم تحديث الوكيل بنجاح", agent: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isSuperAdmin(req))) {
      return NextResponse.json(
        { success: false, error: "غير مصرح: إدارة الوكلاء محصورة بالإدارة العليا (SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const { id } = await params;
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
