import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/order-service";
import { depositActionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = depositActionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    const { depositId, action, adminUserId, note } = parsed.data;

    // Extract root admin operator if logged in
    const rootToken = req.cookies.get("tsunami_root_token")?.value;
    let operatorName = "المشرف العام (Root Super-Admin)";
    let operatorAvatar = "/images/logo.png";
    let effectiveAdminId = adminUserId || "root-super-admin-01";

    if (rootToken) {
      try {
        const { verifyRootToken } = await import("@/lib/root-admin-auth");
        const rootAdmin = await verifyRootToken(rootToken);
        if (rootAdmin) {
          operatorName = rootAdmin.fullName || operatorName;
          operatorAvatar = (rootAdmin as any).avatar || operatorAvatar;
          effectiveAdminId = rootAdmin.id || effectiveAdminId;
        }
      } catch {}
    }

    if (action === "APPROVE") {
      const result = await OrderService.approveDeposit(depositId, effectiveAdminId, note || "", operatorName, operatorAvatar);
      return NextResponse.json(result);
    } else {
      const result = await OrderService.rejectDeposit(depositId, effectiveAdminId, note || "Rejected by administrator");
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
