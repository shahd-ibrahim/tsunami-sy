import {
  TopUpProviderAdapter,
  OrderPayload,
  ProviderOrderResult,
  OrderStatusResult,
  PlayerValidationResult,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export class MockTopUpAdapter implements TopUpProviderAdapter {
  name = "TSUNAMI Mock Gaming Gateway";
  code = "MOCK_TOPUP";

  private mockNicknames: Record<string, string> = {
    "512345678": "Tsunami_Striker★",
    "588492019": "Valkyrie_Ghost",
    "591823746": "Apex_ShadowSY",
    "100200300": "Desert_Eagle_SY",
    "999888777": "Neon_Phoenix",
    "888777666": "SoulStar_Host_VIP★",
    "777888999": "SoulChill_Voice_King",
  };

  async validatePlayer(gameCode: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    // Simulate real API latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Special trigger for testing validation failures
    if (playerId === "000000000" || playerId.toLowerCase() === "invalid") {
      return {
        valid: false,
        errorMessage: "Player ID not found on official game server. Please verify your UID.",
      };
    }

    if (playerId.length < 5) {
      return {
        valid: false,
        errorMessage: "Player ID must be at least 5 digits.",
      };
    }

    let defaultNickname = `Player_${playerId.slice(-4)}_${gameCode.toUpperCase()}`;
    if (gameCode.toUpperCase() === "SOULSTAR") {
      defaultNickname = `SoulStar_VIP_${playerId.slice(-4)}`;
    } else if (gameCode.toUpperCase() === "SOULCHILL") {
      defaultNickname = `SoulChill_Host_${playerId.slice(-4)}`;
    }

    const nickname = this.mockNicknames[playerId] || defaultNickname;

    return {
      valid: true,
      nickname,
      zoneRequired: gameCode.toUpperCase() === "MLBB" && !zoneId,
    };
  }

  async createOrder(payload: OrderPayload): Promise<ProviderOrderResult> {
    // Simulate provider API response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Special trigger for testing permanent provider failure and automatic wallet refund
    if (payload.targetId === "666666666" || payload.packageCode.includes("FAIL_TEST")) {
      return {
        success: false,
        providerTxId: `MOCK-ERR-${uuidv4().substring(0, 8)}`,
        status: "FAILED",
        errorCode: "PROVIDER_REGION_BLOCKED",
        errorMessage: "Provider returned: Game account is restricted to local server region.",
        rawResponse: {
          error_code: 403,
          message: "Account region mismatch",
          timestamp: Date.now(),
        },
      };
    }

    const providerTxId = `MOCK-TX-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    return {
      success: true,
      providerTxId,
      status: "COMPLETED",
      balanceRemaining: 8450.5,
      rawResponse: {
        code: 200,
        status: "SUCCESS",
        reference: payload.orderNumber,
        provider_transaction_id: providerTxId,
        target_uid: payload.targetId,
        game_code: payload.gameCode,
        sku: payload.packageCode,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async checkOrderStatus(providerTxId: string): Promise<OrderStatusResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      providerTxId,
      status: "COMPLETED",
      rawResponse: {
        code: 200,
        status: "DELIVERED",
        provider_transaction_id: providerTxId,
        verified_at: new Date().toISOString(),
      },
    };
  }
}
