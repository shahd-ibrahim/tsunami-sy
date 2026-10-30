export interface OrderPayload {
  orderNumber: string;
  gameCode: string;
  targetId: string; // Player ID / User ID
  targetZoneId?: string; // Server ID (e.g. for MLBB / FreeFire)
  packageCode: string; // SKU or Foreign Provider Code
  quantity?: number;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderOrderResult {
  success: boolean;
  providerTxId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  rawResponse: Record<string, unknown>;
  errorMessage?: string;
  errorCode?: string;
  balanceRemaining?: number;
}

export interface OrderStatusResult {
  providerTxId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  rawResponse: Record<string, unknown>;
  errorMessage?: string;
}

export interface PlayerValidationResult {
  valid: boolean;
  nickname?: string;
  zoneRequired?: boolean;
  errorMessage?: string;
}

export interface TopUpProviderAdapter {
  name: string;
  code: string;

  /**
   * Validates a player ID and optional server zone ID against the game API
   */
  validatePlayer(gameCode: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult>;

  /**
   * Submits top-up order to the external provider API
   */
  createOrder(payload: OrderPayload): Promise<ProviderOrderResult>;

  /**
   * Checks real-time order status from the external provider
   */
  checkOrderStatus(providerTxId: string): Promise<OrderStatusResult>;
}
