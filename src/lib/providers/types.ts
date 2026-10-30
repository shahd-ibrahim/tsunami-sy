/**
 * Provider Adapter Architecture Types
 * TSUNAMI Digital Platform - Extensible B2B Top-Up Provider Interface
 */

export interface TopUpExecutionPayload {
  playerId: string;
  packageCode: string;
  orderId: string;
  zoneId?: string;
  gameCode?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface TopUpExecutionResult {
  success: boolean;
  externalTxId?: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  rawResponse?: any;
  error?: string;
  balanceRemaining?: number;
}

export interface PlayerCheckResult {
  success: boolean;
  playerName?: string;
  error?: string;
  zoneRequired?: boolean;
}

export interface ProviderBalance {
  balance: number;
  currency: string;
}

export interface TopUpProvider {
  /**
   * Unique provider identifier (e.g. "smile_one", "razer_b2b", "custom_server", "mock_provider")
   */
  id: string;

  /**
   * Human readable provider name
   */
  name: string;

  /**
   * Inquires user profile/nickname from the game gateway or B2B partner
   */
  checkPlayerId: (
    playerId: string,
    gameCode: string,
    zoneId?: string
  ) => Promise<{ success: boolean; playerName?: string; error?: string }>;

  /**
   * Dispatches direct top-up order to the external provider
   */
  executeTopUp: (payload: {
    playerId: string;
    packageCode: string;
    orderId: string;
    zoneId?: string;
    gameCode?: string;
    callbackUrl?: string;
  }) => Promise<{
    success: boolean;
    externalTxId?: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
    rawResponse?: any;
    error?: string;
  }>;

  /**
   * Retrieves current partner balance or API credits
   */
  getBalance: () => Promise<{ balance: number; currency: string }>;

  /**
   * Optional health check and latency ping
   */
  ping?: () => Promise<{ success: boolean; latencyMs?: number; message?: string }>;

  /**
   * Indicates if real credentials/keys are configured in environment
   */
  isConfigured?: () => boolean;
}
