import { TopUpProviderAdapter } from "./types";
import { MockTopUpAdapter } from "./mock-adapter";
import { GenericRestTopUpAdapter } from "./generic-rest-adapter";

export * from "./types";
export * from "./mock-adapter";
export * from "./generic-rest-adapter";

class AdapterRegistry {
  private adapters: Map<string, TopUpProviderAdapter> = new Map();

  constructor() {
    // Register Default Mock Adapter for Instant Testing
    const mock = new MockTopUpAdapter();
    this.adapters.set(mock.code, mock);
    this.adapters.set("DEFAULT", mock);

    // Register Default REST Adapter (Configurable via env or DB)
    const genericRest = new GenericRestTopUpAdapter({
      name: "Global Top-Up Gateway (REST)",
      code: "REST_GENERIC",
      baseUrl: process.env.TOPUP_API_BASE_URL || "https://api.provider-topup.example.com",
      apiKey: process.env.TOPUP_API_KEY || "tsunami_test_key_abc123",
      apiSecret: process.env.TOPUP_API_SECRET || "tsunami_secret_sig_xyz987",
    });
    this.adapters.set(genericRest.code, genericRest);
  }

  getAdapter(providerCode?: string | null): TopUpProviderAdapter {
    if (!providerCode) {
      return this.adapters.get("DEFAULT")!;
    }
    return this.adapters.get(providerCode) || this.adapters.get("DEFAULT")!;
  }

  registerAdapter(adapter: TopUpProviderAdapter) {
    this.adapters.set(adapter.code, adapter);
  }
}

export const adapterRegistry = new AdapterRegistry();
