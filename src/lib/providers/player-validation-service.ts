import { providerEngine } from "./provider-engine";

export interface GameValidationRule {
  gameCode: string;
  name: string;
  pattern: RegExp;
  minLen: number;
  maxLen: number;
  requiresZone: boolean;
  zonePattern?: RegExp;
  hintAr: string;
}

const GAME_RULES: Record<string, GameValidationRule> = {
  PUBG_MOBILE: {
    gameCode: "PUBG_MOBILE",
    name: "PUBG Mobile",
    pattern: /^\d{8,12}$/,
    minLen: 8,
    maxLen: 12,
    requiresZone: false,
    hintAr: "معرّف ببجي يتكون من 8 إلى 12 رقماً",
  },
  FREEFIRE: {
    gameCode: "FREEFIRE",
    name: "Free Fire",
    pattern: /^\d{8,11}$/,
    minLen: 8,
    maxLen: 11,
    requiresZone: false,
    hintAr: "معرّف فري فاير يتكون من 8 إلى 11 رقماً",
  },
  MLBB: {
    gameCode: "MLBB",
    name: "Mobile Legends",
    pattern: /^\d{6,12}$/,
    minLen: 6,
    maxLen: 12,
    requiresZone: true,
    zonePattern: /^\d{4,6}$/,
    hintAr: "يتطلب رقم الحساب (User ID) مع رقم السيرفر (Zone ID)",
  },
  CODM: {
    gameCode: "CODM",
    name: "Call of Duty Mobile",
    pattern: /^[a-zA-Z0-9_\-]{6,20}$/,
    minLen: 6,
    maxLen: 20,
    requiresZone: false,
    hintAr: "معرّف كول أوف ديوتي (Player ID)",
  },
  GENSHIN: {
    gameCode: "GENSHIN",
    name: "Genshin Impact",
    pattern: /^\d{9,10}$/,
    minLen: 9,
    maxLen: 10,
    requiresZone: true,
    hintAr: "معرّف قينشن إمباكت والسيرفر التابع له",
  },
};

interface CacheEntry {
  playerName: string;
  timestamp: number;
  providerId: string;
}

export class PlayerValidationService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  private getCacheKey(gameCode: string, playerId: string, zoneId?: string): string {
    return `${gameCode.toUpperCase()}:${playerId.trim()}:${(zoneId || "").trim()}`;
  }

  public getRule(gameCode: string): GameValidationRule | undefined {
    return GAME_RULES[gameCode.toUpperCase()];
  }

  public isZoneRequired(gameCode: string): boolean {
    const rule = this.getRule(gameCode);
    return rule ? rule.requiresZone : false;
  }

  /**
   * Performs format verification, cache lookup, and provider gateway inquiry
   */
  public async validatePlayer(
    gameCode: string,
    playerId: string,
    zoneId?: string,
    preferredProviderId?: string
  ): Promise<{
    valid: boolean;
    nickname?: string;
    errorMessage?: string;
    zoneRequired?: boolean;
    providerId?: string;
    cached?: boolean;
  }> {
    const cleanId = (playerId || "").trim();
    const cleanZone = (zoneId || "").trim();
    const upperGame = (gameCode || "").toUpperCase();

    if (!cleanId) {
      return {
        valid: false,
        errorMessage: "يرجى إدخال معرّف اللاعب (Player ID)",
      };
    }

    const rule = this.getRule(upperGame);

    // 1. Validate zone if mandatory
    if (rule?.requiresZone && !cleanZone) {
      return {
        valid: false,
        zoneRequired: true,
        errorMessage: `هذه اللعبة (${rule.name}) تتطلب إدخال رقم السيرفر / Zone ID بجانب رقم المعرّف`,
      };
    }

    if (rule?.zonePattern && cleanZone && !rule.zonePattern.test(cleanZone)) {
      return {
        valid: false,
        zoneRequired: true,
        errorMessage: "صيغة رقم السيرفر (Zone ID) غير صحيحة",
      };
    }

    // 2. Syntax pre-validation
    if (rule && !rule.pattern.test(cleanId)) {
      return {
        valid: false,
        errorMessage: `صيغة معرّف اللاعب غير صحيحة. ${rule.hintAr}`,
      };
    }

    // 3. Cache lookup
    const cacheKey = this.getCacheKey(upperGame, cleanId, cleanZone);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return {
        valid: true,
        nickname: cached.playerName,
        providerId: cached.providerId,
        cached: true,
        zoneRequired: rule?.requiresZone,
      };
    }

    // 4. Inquire via Provider Engine
    const result = await providerEngine.checkPlayerId(cleanId, upperGame, cleanZone, preferredProviderId);

    if (result.success && result.playerName) {
      this.cache.set(cacheKey, {
        playerName: result.playerName,
        timestamp: Date.now(),
        providerId: result.providerId,
      });

      return {
        valid: true,
        nickname: result.playerName,
        providerId: result.providerId,
        cached: false,
        zoneRequired: rule?.requiresZone,
      };
    }

    return {
      valid: false,
      errorMessage: result.error || "لم يتم العثور على اللاعب في خوادم اللعبة",
      providerId: result.providerId,
      zoneRequired: rule?.requiresZone,
    };
  }
}

// Singleton global service
const globalForValidationService = globalThis as unknown as {
  playerValidationService?: PlayerValidationService;
};

export const playerValidationService =
  globalForValidationService.playerValidationService ?? new PlayerValidationService();
globalForValidationService.playerValidationService = playerValidationService;
