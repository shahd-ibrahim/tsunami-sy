import crypto from "crypto";
import {
  TopUpProviderAdapter,
  OrderPayload,
  ProviderOrderResult,
  OrderStatusResult,
  PlayerValidationResult,
} from "./types";

export interface GenericRestAdapterConfig {
  name: string;
  code: string;
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  timeoutMs?: number;
}

export class GenericRestTopUpAdapter implements TopUpProviderAdapter {
  name: string;
  code: string;
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private timeoutMs: number;

  constructor(config: GenericRestAdapterConfig) {
    this.name = config.name;
    this.code = config.code;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.timeoutMs = config.timeoutMs || 10000;
  }

  /**
   * Generates HMAC-SHA256 signature for API requests and callbacks
   */
  public generateHmacSignature(payload: string, timestamp: number): string {
    const dataToSign = `${this.apiKey}:${timestamp}:${payload}`;
    return crypto.createHmac("sha256", this.apiSecret).update(dataToSign).digest("hex");
  }

  /**
   * Verifies an incoming webhook HMAC signature
   */
  public verifySignature(rawBody: string, signature: string, timestamp: number): boolean {
    const expected = this.generateHmacSignature(rawBody, timestamp);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  private getAuthHeaders(bodyString: string = ""): HeadersInit {
    const timestamp = Date.now();
    const signature = this.generateHmacSignature(bodyString, timestamp);

    return {
      "Content-Type": "application/json",
      "X-Api-Key": this.apiKey,
      "X-Timestamp": timestamp.toString(),
      "X-Signature": signature,
      "User-Agent": "TSUNAMI-TopUp-Platform/1.0",
    };
  }

  async validatePlayer(gameCode: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    try {
      const url = new URL(`${this.baseUrl}/api/v1/player/validate`);
      url.searchParams.set("game", gameCode);
      url.searchParams.set("player_id", playerId);
      if (zoneId) url.searchParams.set("zone_id", zoneId);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(""),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        return {
          valid: false,
          errorMessage: `Player validation failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        valid: Boolean(data.valid),
        nickname: data.nickname || data.username,
        zoneRequired: Boolean(data.zone_required),
      };
    } catch (err: any) {
      console.error(`[${this.code}] validatePlayer error:`, err.message);
      return {
        valid: false,
        errorMessage: err.name === "AbortError" ? "Validation timed out" : err.message,
      };
    }
  }

  async createOrder(payload: OrderPayload): Promise<ProviderOrderResult> {
    const requestBody = JSON.stringify({
      order_reference: payload.orderNumber,
      game_code: payload.gameCode,
      target_id: payload.targetId,
      zone_id: payload.targetZoneId,
      package_sku: payload.packageCode,
      callback_url: payload.callbackUrl,
      metadata: payload.metadata,
    });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.baseUrl}/api/v1/orders/topup`, {
        method: "POST",
        headers: this.getAuthHeaders(requestBody),
        body: requestBody,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          providerTxId: responseData.provider_tx_id || `ERR-${Date.now()}`,
          status: "FAILED",
          errorMessage: responseData.message || `Provider returned HTTP ${response.status}`,
          errorCode: responseData.error_code || "HTTP_ERROR",
          rawResponse: responseData,
        };
      }

      return {
        success: responseData.status === "SUCCESS" || responseData.status === "COMPLETED",
        providerTxId: responseData.provider_tx_id || responseData.transaction_id,
        status: responseData.status === "COMPLETED" ? "COMPLETED" : "PROCESSING",
        balanceRemaining: responseData.balance_remaining,
        rawResponse: responseData,
      };
    } catch (err: any) {
      console.error(`[${this.code}] createOrder network error:`, err.message);
      throw err; // Let caller decide retry or failure
    }
  }

  async checkOrderStatus(providerTxId: string): Promise<OrderStatusResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders/status/${providerTxId}`, {
        method: "GET",
        headers: this.getAuthHeaders(""),
      });

      const data = await response.json();
      return {
        providerTxId,
        status: data.status || "PROCESSING",
        errorMessage: data.error_message,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        providerTxId,
        status: "PROCESSING",
        errorMessage: err.message,
        rawResponse: { error: err.message },
      };
    }
  }
}
