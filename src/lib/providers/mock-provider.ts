import { TopUpProvider } from "./types";

/**
 * Mock / Sandbox Top-Up Provider Adapter
 * Provides deterministic simulation for local development, instant testing, and demo environments.
 */
export class MockProvider implements TopUpProvider {
  public readonly id = "mock_provider";
  public readonly name = "TSUNAMI Sandbox Gateway";

  private balance: number = 5000.0;
  private currency: string = "USD";

  public isConfigured(): boolean {
    return true;
  }

  public async checkPlayerId(
    playerId: string,
    gameCode: string,
    zoneId?: string
  ): Promise<{ success: boolean; playerName?: string; error?: string }> {
    const cleanId = (playerId || "").trim();

    if (!cleanId) {
      return { success: false, error: "معرّف اللاعب مطلوب" };
    }

    // Edge case testing: invalid IDs
    if (cleanId === "999999999" || cleanId === "000000" || cleanId.toLowerCase() === "invalid") {
      return { success: false, error: "لم يتم العثور على اللاعب في خوادم اللعبة (معرّف غير صحيح)" };
    }

    if (cleanId.length < 5) {
      return { success: false, error: "معرّف اللاعب يجب أن لا يقل عن 5 خانات" };
    }

    // Deterministic Syrian gamer nicknames based on game code
    const titles: Record<string, string> = {
      PUBG_MOBILE: "قناص_الشام",
      FREEFIRE: "صقر_بردى",
      MLBB: "أسطورة_سوريا",
      GENSHIN: "فارس_الفيحاء",
      CODM: "كوماندوز_حلب",
      VALORANT: "بطل_اللاذقية",
    };

    const baseName = titles[gameCode.toUpperCase()] || "اللاعب_المعتمد";
    const suffix = cleanId.slice(-3);
    const zoneTag = zoneId ? ` [${zoneId}]` : "";

    return {
      success: true,
      playerName: `${baseName}_${suffix}${zoneTag}`,
    };
  }

  public async executeTopUp(payload: {
    playerId: string;
    packageCode: string;
    orderId: string;
    zoneId?: string;
    gameCode?: string;
    callbackUrl?: string;
  }): Promise<{
    success: boolean;
    externalTxId?: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
    rawResponse?: any;
    error?: string;
  }> {
    const { playerId, packageCode, orderId, zoneId, gameCode } = payload;

    // Simulate negative test case
    if (playerId === "999999999") {
      return {
        success: false,
        status: "FAILED",
        error: "فشل تنفيذ العملية: حساب اللاعب معطل أو غير متاح للشحن",
        rawResponse: { orderId, reason: "ACCOUNT_SUSPENDED" },
      };
    }

    // Decrement simulated balance slightly
    this.balance = Math.max(0, this.balance - 1.5);

    const txId = `MOCK-TX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return {
      success: true,
      externalTxId: txId,
      status: "COMPLETED",
      rawResponse: {
        provider: "mock_provider",
        orderId,
        playerId,
        packageCode,
        zoneId,
        gameCode,
        executedAt: new Date().toISOString(),
        sandbox: true,
      },
    };
  }

  public async getBalance(): Promise<{ balance: number; currency: string }> {
    return {
      balance: Number(this.balance.toFixed(2)),
      currency: this.currency,
    };
  }

  public async ping(): Promise<{ success: boolean; latencyMs?: number; message?: string }> {
    return {
      success: true,
      latencyMs: 12,
      message: `Sandbox Engine Ready (Simulated Balance: $${this.balance.toFixed(2)} ${this.currency})`,
    };
  }
}
