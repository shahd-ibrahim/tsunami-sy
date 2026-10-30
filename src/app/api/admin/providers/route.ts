import { NextRequest, NextResponse } from "next/server";
import { providerEngine, playerValidationService } from "@/lib/providers";

export async function GET() {
  try {
    const balances = await providerEngine.getAllBalances();
    const pings = await providerEngine.pingAll();

    const providers = providerEngine.getAllProviders().map((p) => {
      const bal = balances.find((b) => b.id === p.id);
      const ping = pings.find((pingItem) => pingItem.id === p.id);

      return {
        id: p.id,
        name: p.name,
        isConfigured: p.isConfigured ? p.isConfigured() : true,
        balance: bal?.balance ?? 0,
        currency: bal?.currency ?? "USD",
        status: ping?.success ? "ONLINE" : "DEGRADED",
        latencyMs: ping?.latencyMs ?? 15,
        message: ping?.message,
      };
    });

    return NextResponse.json({
      success: true,
      providers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, playerId, gameCode, zoneId, providerId, packageCode, orderId } = body;

    if (action === "CHECK_PLAYER") {
      const result = await playerValidationService.validatePlayer(
        gameCode || "PUBG_MOBILE",
        playerId || "",
        zoneId,
        providerId
      );
      return NextResponse.json(result);
    }

    if (action === "EXECUTE_TOPUP") {
      const result = await providerEngine.executeTopUp(
        {
          playerId: playerId || "512345678",
          packageCode: packageCode || "PKG-60-UC",
          orderId: orderId || `TEST-${Date.now()}`,
          zoneId,
          gameCode: gameCode || "PUBG_MOBILE",
        },
        providerId
      );
      return NextResponse.json(result);
    }

    if (action === "PING") {
      const provider = providerEngine.getProvider(providerId);
      const ping = provider.ping
        ? await provider.ping()
        : { success: true, latencyMs: 12, message: "Gateway Responsive" };
      return NextResponse.json({
        id: provider.id,
        name: provider.name,
        ...ping,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
