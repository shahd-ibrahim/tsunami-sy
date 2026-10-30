import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface PersistentUser {
  id: string;
  numericId: number;
  email: string;
  passwordHash?: string | null;
  name: string;
  username?: string | null;
  image?: string | null;
  role: "USER" | "RESELLER" | "ADMIN" | "SUPER_ADMIN";
  phone?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  preferredCurrency?: "USD" | "TRY" | "SYP" | null;
  referralCode?: string | null;
  authProvider: "EMAIL" | "GOOGLE";
  isActive?: boolean;
  isVerified?: boolean;
  kycStatus?: string;
  isFrozen?: boolean;
  rootCommissionRate?: number;
  totalVolumeHandled?: number;
  adminEarnings?: number;
  rootEarningsFromAdmin?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersistentWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isFrozen: boolean;
  version: number;
  updatedAt: string;
}

export interface PersistentTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: string; // DEPOSIT, ORDER_PAYMENT, ORDER_REFUND, MANUAL_ADJUST
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string | null;
  depositRequestId?: string | null;
  description: string;
  reference: string;
  processedById?: string | null;
  operatorName?: string | null;
  operatorAvatar?: string | null;
  costPrice?: number;
  sellingPrice?: number;
  grossProfit?: number;
  processedByAdminId?: string | null;
  rootCutAmount?: number;
  adminCutAmount?: number;
  createdAt: string;
}

export interface PersistentDeposit {
  id: string;
  depositNumber: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  senderName?: string | null;
  senderAccountOrPhone?: string | null;
  transferReference?: string | null;
  receiptImageUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedByUserId?: string | null;
  operatorName?: string | null;
  operatorAvatar?: string | null;
  approvedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersistentAgent {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  phone: string;
  whatsappUrl?: string | null;
  image?: string | null;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface PersistentDbSchema {
  users: Record<string, PersistentUser>; // keyed by email (lowercase)
  wallets: Record<string, PersistentWallet>; // keyed by userId
  transactions: PersistentTransaction[];
  deposits: PersistentDeposit[];
  agents: Record<string, PersistentAgent>;
  nextNumericId: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "tsunami-db.json");

declare global {
  // eslint-disable-next-line no-var
  var __tsunamiPersistentStore: PersistentStore | undefined;
}

class PersistentStore {
  private data: PersistentDbSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): PersistentDbSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.users === "object") {
          return {
            users: parsed.users || {},
            wallets: parsed.wallets || {},
            transactions: parsed.transactions || [],
            deposits: parsed.deposits || [],
            agents: parsed.agents || this.getDefaultAgents(),
            nextNumericId: parsed.nextNumericId || 1004,
          };
        }
      }
    } catch (e) {
      console.warn("[PersistentStore] Warning loading DB file:", e);
    }

    return this.createInitialSeed();
  }

  private createInitialSeed(): PersistentDbSchema {
    const adminHash = bcrypt.hashSync("Admin1234", 10);
    const vipHash = bcrypt.hashSync("VipPass123", 10);
    const userHash = bcrypt.hashSync("UserPass123", 10);
    const now = new Date().toISOString();

    const seedUsers: Record<string, PersistentUser> = {
      "admin@tsunami-sy.com": {
        id: "admin-root",
        numericId: 1001,
        email: "admin@tsunami-sy.com",
        passwordHash: adminHash,
        name: "المشرف العام (Root Admin)",
        username: "admin_root",
        image: null,
        role: "ADMIN",
        phone: "+963912345678",
        countryCode: "+963",
        countryName: "سوريا",
        preferredCurrency: "USD",
        authProvider: "EMAIL",
        isVerified: true,
        kycStatus: "APPROVED",
        isFrozen: false,
        createdAt: now,
        updatedAt: now,
      },
      "vip@tsunami-sy.com": {
        id: "user-vip-1",
        numericId: 1002,
        email: "vip@tsunami-sy.com",
        passwordHash: vipHash,
        name: "موزع دمشق المعتمد (VIP)",
        username: "vip_damascus",
        image: null,
        role: "RESELLER",
        phone: "+963998765432",
        countryCode: "+963",
        countryName: "سوريا",
        preferredCurrency: "USD",
        authProvider: "EMAIL",
        isVerified: true,
        kycStatus: "APPROVED",
        isFrozen: false,
        createdAt: now,
        updatedAt: now,
      },
      "user@tsunami-sy.com": {
        id: "user-regular-1",
        numericId: 1003,
        email: "user@tsunami-sy.com",
        passwordHash: userHash,
        name: "أحمد السوري",
        username: "ahmed_sy",
        image: null,
        role: "USER",
        phone: "+963933112233",
        countryCode: "+963",
        countryName: "سوريا",
        preferredCurrency: "USD",
        authProvider: "EMAIL",
        isVerified: false,
        kycStatus: "NOT_SUBMITTED",
        isFrozen: false,
        createdAt: now,
        updatedAt: now,
      },
    };

    // Wallets start with real 0.00 balances - strictly NO hardcoded $250 mock balance!
    const seedWallets: Record<string, PersistentWallet> = {
      "admin-root": {
        id: "w-admin-root",
        userId: "admin-root",
        balance: 0.0,
        currency: "USD",
        isFrozen: false,
        version: 1,
        updatedAt: now,
      },
      "user-vip-1": {
        id: "w-user-vip-1",
        userId: "user-vip-1",
        balance: 0.0,
        currency: "USD",
        isFrozen: false,
        version: 1,
        updatedAt: now,
      },
      "user-regular-1": {
        id: "w-user-regular-1",
        userId: "user-regular-1",
        balance: 0.0,
        currency: "USD",
        isFrozen: false,
        version: 1,
        updatedAt: now,
      },
    };

    const initialDb: PersistentDbSchema = {
      users: seedUsers,
      wallets: seedWallets,
      transactions: [],
      deposits: [],
      agents: this.getDefaultAgents(),
      nextNumericId: 1004,
    };

    this.persistToDisk(initialDb);
    return initialDb;
  }

  private getDefaultAgents(): Record<string, PersistentAgent> {
    const now = new Date().toISOString();
    return {
      "agent-damascus-1": {
        id: "agent-damascus-1",
        name: "مركز تسونامي دمشق - المزة",
        city: "دمشق",
        address: "أوتوستراد المزة - بجانب مجمع الشام",
        phone: "+963988776655",
        whatsappUrl: "https://wa.me/963988776655",
        image: "/images/logo.png",
        isActive: true,
        orderIndex: 1,
        createdAt: now,
        updatedAt: now,
      },
      "agent-aleppo-1": {
        id: "agent-aleppo-1",
        name: "وكالة الشهباء الرقمية - حلب",
        city: "حلب",
        address: "شارع الفرقان - مفرق الجامعة",
        phone: "+963933112233",
        whatsappUrl: "https://wa.me/963933112233",
        image: "/images/logo.png",
        isActive: true,
        orderIndex: 2,
        createdAt: now,
        updatedAt: now,
      },
      "agent-homs-1": {
        id: "agent-homs-1",
        name: "موزع حمص المعتمد - الدبلان",
        city: "حمص",
        address: "شارع الدبلان التجاري",
        phone: "+963944556677",
        whatsappUrl: "https://wa.me/963944556677",
        image: "/images/logo.png",
        isActive: true,
        orderIndex: 3,
        createdAt: now,
        updatedAt: now,
      },
      "agent-latakia-1": {
        id: "agent-latakia-1",
        name: "مركز الساحل لخدمات الألعاب - اللاذقية",
        city: "اللاذقية",
        address: "شارع 8 آذار - مقابل المركز الثقافي",
        phone: "+963955667788",
        whatsappUrl: "https://wa.me/963955667788",
        image: "/images/logo.png",
        isActive: true,
        orderIndex: 4,
        createdAt: now,
        updatedAt: now,
      },
      "agent-istanbul-1": {
        id: "agent-istanbul-1",
        name: "وكالة تسونامي الدولية - إسطنبول الفاتح",
        city: "إسطنبول",
        address: "منطقة الفاتح - بالقرب من محطة المترو",
        phone: "+905523344556",
        whatsappUrl: "https://wa.me/905523344556",
        image: "/images/logo.png",
        isActive: true,
        orderIndex: 5,
        createdAt: now,
        updatedAt: now,
      },
    };
  }

  private persistToDisk(db?: PersistentDbSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const target = db || this.data;
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(target, null, 2), "utf-8");
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error("[PersistentStore] Error writing DB to disk:", e);
    }
  }

  // --- User Operations ---
  public getUserByEmail(email: string): PersistentUser | null {
    const key = email.toLowerCase().trim();
    return this.data.users[key] ? { ...this.data.users[key] } : null;
  }

  public getUserById(id: string): PersistentUser | null {
    for (const u of Object.values(this.data.users)) {
      if (u.id === id) return { ...u };
    }
    return null;
  }

  public getUserByUsername(username: string): PersistentUser | null {
    const norm = username.toLowerCase().trim();
    for (const u of Object.values(this.data.users)) {
      if (u.username && u.username.toLowerCase() === norm) {
        return { ...u };
      }
    }
    return null;
  }

  public saveUser(user: PersistentUser): void {
    const key = user.email.toLowerCase().trim();
    this.data.users[key] = {
      ...user,
      updatedAt: new Date().toISOString(),
    };
    this.persistToDisk();
  }

  public updateAdminCommission(idOrEmail: string, rootCommissionRate: number): PersistentUser | null {
    const targetRate = Math.max(0, Math.min(100, Number(rootCommissionRate) || 0));
    for (const [key, u] of Object.entries(this.data.users)) {
      if (u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()) {
        const volume = u.totalVolumeHandled || 0;
        const grossProfit = volume * 0.15; // standard average 15% margin
        const rootCut = Number(((grossProfit * targetRate) / 100).toFixed(2));
        const adminNet = Number((grossProfit - rootCut).toFixed(2));

        this.data.users[key] = {
          ...u,
          rootCommissionRate: targetRate,
          rootEarningsFromAdmin: rootCut,
          adminEarnings: adminNet,
          updatedAt: new Date().toISOString(),
        };
        this.persistToDisk();
        return { ...this.data.users[key] };
      }
    }
    return null;
  }

  public recordAdminTransaction(params: {
    adminId: string;
    sellingPrice: number;
    costPrice?: number;
  }): void {
    const { adminId, sellingPrice, costPrice = sellingPrice * 0.85 } = params;
    const grossProfit = Math.max(0, sellingPrice - costPrice);

    for (const [key, u] of Object.entries(this.data.users)) {
      if (u.id === adminId || u.email.toLowerCase() === adminId.toLowerCase()) {
        const rate = u.rootCommissionRate ?? 10.0;
        const rootCut = Number(((grossProfit * rate) / 100).toFixed(2));
        const adminNet = Number((grossProfit - rootCut).toFixed(2));

        this.data.users[key] = {
          ...u,
          totalVolumeHandled: Number(((u.totalVolumeHandled || 0) + sellingPrice).toFixed(2)),
          rootEarningsFromAdmin: Number(((u.rootEarningsFromAdmin || 0) + rootCut).toFixed(2)),
          adminEarnings: Number(((u.adminEarnings || 0) + adminNet).toFixed(2)),
          updatedAt: new Date().toISOString(),
        };
        this.persistToDisk();
        break;
      }
    }
  }

  public getAllUsers(): PersistentUser[] {
    return Object.values(this.data.users);
  }

  public deleteUser(id: string): boolean {
    for (const [key, u] of Object.entries(this.data.users)) {
      if (u.id === id) {
        delete this.data.users[key];
        this.persistToDisk();
        return true;
      }
    }
    return false;
  }

  public getNextNumericId(): number {
    const id = this.data.nextNumericId;
    this.data.nextNumericId += 1;
    this.persistToDisk();
    return id;
  }

  // --- Wallet Operations ---
  public getWallet(userId: string): PersistentWallet {
    let wallet = this.data.wallets[userId];
    if (!wallet) {
      // Wallet balance starts strictly at 0.00
      wallet = {
        id: `w-${userId}`,
        userId,
        balance: 0.0,
        currency: "USD",
        isFrozen: false,
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      this.data.wallets[userId] = wallet;
      this.persistToDisk();
    }
    return { ...wallet };
  }

  public saveWallet(wallet: PersistentWallet): void {
    this.data.wallets[wallet.userId] = {
      ...wallet,
      updatedAt: new Date().toISOString(),
    };
    this.persistToDisk();
  }

  // --- Transaction Operations ---
  public addTransaction(tx: PersistentTransaction): void {
    this.data.transactions.unshift(tx);
    this.persistToDisk();
  }

  public getTransactions(userId?: string): PersistentTransaction[] {
    if (!userId) return [...this.data.transactions];
    return this.data.transactions.filter((t) => t.userId === userId);
  }

  // --- Deposit Operations ---
  public saveDeposit(deposit: PersistentDeposit): void {
    const index = this.data.deposits.findIndex((d) => d.id === deposit.id);
    if (index >= 0) {
      this.data.deposits[index] = { ...deposit, updatedAt: new Date().toISOString() };
    } else {
      this.data.deposits.unshift({ ...deposit, updatedAt: new Date().toISOString() });
    }
    this.persistToDisk();
  }

  public getDeposits(userId?: string): PersistentDeposit[] {
    if (!userId) return [...this.data.deposits];
    return this.data.deposits.filter((d) => d.userId === userId);
  }

  public getDepositById(id: string): PersistentDeposit | null {
    const d = this.data.deposits.find((item) => item.id === id || item.depositNumber === id);
    return d ? { ...d } : null;
  }

  // --- Agent Operations ---
  public getAgents(onlyActive = false): PersistentAgent[] {
    if (!this.data.agents) {
      this.data.agents = this.getDefaultAgents();
      this.persistToDisk();
    }
    const list = Object.values(this.data.agents);
    const sorted = list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    return onlyActive ? sorted.filter((a) => a.isActive) : sorted;
  }

  public getAgentById(id: string): PersistentAgent | null {
    if (!this.data.agents) return null;
    return this.data.agents[id] ? { ...this.data.agents[id] } : null;
  }

  public saveAgent(agent: PersistentAgent): void {
    if (!this.data.agents) this.data.agents = {};
    this.data.agents[agent.id] = {
      ...agent,
      updatedAt: new Date().toISOString(),
    };
    this.persistToDisk();
  }

  public deleteAgent(id: string): boolean {
    if (!this.data.agents || !this.data.agents[id]) return false;
    delete this.data.agents[id];
    this.persistToDisk();
    return true;
  }

  public toggleAgent(id: string): PersistentAgent | null {
    if (!this.data.agents) this.data.agents = this.getDefaultAgents();
    const agent = this.data.agents[id];
    if (!agent) return null;
    agent.isActive = !agent.isActive;
    agent.updatedAt = new Date().toISOString();
    this.persistToDisk();
    return { ...agent };
  }
}

if (
  globalThis.__tsunamiPersistentStore &&
  typeof (globalThis.__tsunamiPersistentStore as any).getAgents !== "function"
) {
  globalThis.__tsunamiPersistentStore = new PersistentStore();
}

export const persistentStore =
  globalThis.__tsunamiPersistentStore || new PersistentStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__tsunamiPersistentStore = persistentStore;
}
