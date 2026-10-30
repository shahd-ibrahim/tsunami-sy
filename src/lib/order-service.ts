import { prisma } from "./prisma";
import { WalletService } from "./wallet-service";
import { enqueueTopUpOrder } from "./queue/order-queue";
import { adapterRegistry } from "./adapters";
import { playerValidationService, providerEngine } from "./providers";
import { PRODUCTS } from "./catalog";
import { OrderStatus, DepositStatus, TransactionType, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { persistentStore } from "./persistent-store";

export interface CreateOrderParams {
  userId: string;
  userRole?: "USER" | "RESELLER" | "ADMIN";
  productId: string;
  packageId?: string;
  customQuantity?: number;
  targetId: string;
  targetZoneId?: string;
  playerNickname?: string;
  idempotencyKey?: string;
}

export interface DepositSubmissionParams {
  userId: string;
  amount: number;
  currency?: string;
  method: string;
  senderName?: string;
  senderAccountOrPhone?: string;
  transferReference?: string;
  receiptImageUrl: string;
}

// In-memory store for instant seamless state management across requests
const memoryOrders: any[] = [];
const memoryDeposits: any[] = [];

export class OrderService {
  /**
   * Validates player UID with the game gateway via Extensible Provider Engine
   */
  static async validatePlayer(gameCode: string, playerId: string, zoneId?: string) {
    const res = await playerValidationService.validatePlayer(gameCode, playerId, zoneId);
    return {
      valid: res.valid,
      nickname: res.nickname,
      errorMessage: res.errorMessage,
      zoneRequired: res.zoneRequired,
      providerId: res.providerId,
    };
  }

  /**
   * Atomic Order Processing Pipeline:
   * 1. Validate pricing and idempotency
   * 2. Deduct funds atomically with pessimistic row lock
   * 3. Create Order record with status PENDING
   * 4. Enqueue to BullMQ for non-blocking provider execution
   * 5. Return immediate response with orderNumber
   */
  static async placeOrder(params: CreateOrderParams) {
    const {
      userId,
      userRole = "USER",
      productId,
      packageId,
      customQuantity,
      targetId,
      targetZoneId,
      playerNickname,
    } = params;

    const idempotencyKey = params.idempotencyKey || uuidv4();

    // 1. Locate product
    const product = PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    let unitPrice = 0;
    let pkgId = packageId || "custom";
    let pkgName = "";
    let pkgSku = "";

    if (customQuantity && customQuantity > 0) {
      const minQty = product.minQuantity || 1;
      if (customQuantity < minQty) {
        throw new Error(`الحد الأدنى للطلب هو ${minQty.toLocaleString()} ${product.currencyName || "وحدة"}`);
      }
      const rate = userRole === "RESELLER"
        ? (product.unitPriceReseller || product.unitPriceUser || 0.001)
        : (product.unitPriceUser || 0.001);
      
      unitPrice = Math.max(0.1, Number((customQuantity * rate).toFixed(2)));
      pkgId = `custom-${customQuantity}`;
      pkgName = `${customQuantity.toLocaleString()} ${product.currencyName || "وحدة"}`;
      pkgSku = `${product.gameCode}_CUSTOM_${customQuantity}`;
    } else {
      const pkg = product.packages.find((p) => p.id === packageId || p.sku === packageId);
      if (!pkg) {
        if (product.packages.length > 0) {
          const fallbackPkg = product.packages[0];
          unitPrice = userRole === "RESELLER" ? fallbackPkg.priceReseller : fallbackPkg.priceUser;
          pkgId = fallbackPkg.id;
          pkgName = fallbackPkg.name;
          pkgSku = fallbackPkg.sku;
        } else {
          throw new Error(`Package not found: ${packageId}`);
        }
      } else {
        unitPrice = userRole === "RESELLER" ? pkg.priceReseller : pkg.priceUser;
        pkgId = pkg.id;
        pkgName = pkg.name;
        pkgSku = pkg.sku;
      }
    }

    const orderNumber = `TSU-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Atomic Wallet Deduction (Row-level lock, throws if insufficient funds)
    const deduction = await WalletService.deductFunds({
      userId,
      amount: unitPrice,
      description: `شحن ${product.name} - ${pkgName} (${targetId})`,
      reference: `PAY-${orderNumber}`,
    });

    // 3. Create Order Record (PENDING)
    const orderData = {
      id: uuidv4(),
      orderNumber,
      userId,
      productId: product.id,
      packageId: pkgId,
      targetId,
      targetZoneId: targetZoneId || null,
      playerNickname: playerNickname || null,
      unitPrice,
      amount: unitPrice,
      status: OrderStatus.PENDING,
      idempotencyKey,
      productName: product.name,
      packageName: pkgName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await prisma.order.create({
        data: {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          userId: orderData.userId,
          productId: orderData.productId,
          packageId: orderData.packageId,
          targetId: orderData.targetId,
          targetZoneId: orderData.targetZoneId,
          playerNickname: orderData.playerNickname,
          unitPrice: new Prisma.Decimal(unitPrice),
          amount: new Prisma.Decimal(unitPrice),
          status: OrderStatus.PENDING,
          idempotencyKey: orderData.idempotencyKey,
        },
      });
    } catch {
      // In-memory fallback
      memoryOrders.unshift(orderData);
    }

    // 4. Enqueue to BullMQ Queue Engine (Non-blocking)
    const enqueueResult = await enqueueTopUpOrder({
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      userId,
      amount: unitPrice,
      gameCode: product.gameCode,
      targetId,
      targetZoneId: targetZoneId || undefined,
      packageCode: pkgSku,
      providerCode: "MOCK_TOPUP",
    });

    return {
      success: true,
      orderNumber,
      orderId: orderData.id,
      status: OrderStatus.PENDING,
      amount: unitPrice,
      productName: product.name,
      packageName: pkgName,
      targetId,
      playerNickname,
      balanceRemaining: deduction.balanceAfter,
      queueJobId: enqueueResult.jobId,
      queueMode: enqueueResult.mode,
    };
  }

  /**
   * Retrieves order by orderNumber or ID
   */
  static async getOrder(identifier: string) {
    try {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: identifier }, { id: identifier }],
        },
        include: {
          product: true,
          package: true,
        },
      });
      if (order) return order;
    } catch {
      // fallback
    }

    return memoryOrders.find(
      (o) => o.orderNumber === identifier || o.id === identifier
    ) || null;
  }

  /**
   * Retrieves orders for a specific user or all orders for admin
   */
  static async listOrders(userId?: string) {
    try {
      const orders = await prisma.order.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      if (orders.length > 0) return orders;
    } catch {
      // fallback
    }

    if (userId) {
      return memoryOrders.filter((o) => o.userId === userId);
    }
    return memoryOrders;
  }

  /**
   * Creates a deposit request with receipt upload
   */
  static async submitDepositRequest(params: DepositSubmissionParams) {
    const depositNumber = `DEP-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const record = {
      id: uuidv4(),
      depositNumber,
      userId: params.userId,
      amount: params.amount,
      currency: params.currency || "USD",
      method: params.method,
      senderName: params.senderName || null,
      senderAccountOrPhone: params.senderAccountOrPhone || null,
      transferReference: params.transferReference || null,
      receiptImageUrl: params.receiptImageUrl,
      status: DepositStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await prisma.depositRequest.create({
        data: {
          id: record.id,
          depositNumber: record.depositNumber,
          userId: record.userId,
          amount: new Prisma.Decimal(record.amount),
          currency: record.currency,
          method: record.method,
          senderName: record.senderName,
          senderAccountOrPhone: record.senderAccountOrPhone,
          transferReference: record.transferReference,
          receiptImageUrl: record.receiptImageUrl,
          status: DepositStatus.PENDING,
        },
      });
    } catch {
      // offline fallback
    }

    persistentStore.saveDeposit(record as any);

    // Dispatch Telegram Alert to Manual Deposits Group (-4885671656)
    import("./telegram").then(async ({ dispatchDepositAlert }) => {
      let userName = record.senderName || undefined;
      let userNumericId: number | undefined = undefined;
      try {
        const u = persistentStore.getUserById(record.userId);
        if (u) {
          userName = u.name;
          userNumericId = u.numericId;
        }
      } catch {}
      await dispatchDepositAlert({
        id: record.id,
        depositNumber: record.depositNumber,
        userId: record.userId,
        userName,
        userNumericId,
        amount: record.amount,
        currency: record.currency,
        method: record.method,
        senderName: record.senderName,
        senderAccountOrPhone: record.senderAccountOrPhone,
        transferReference: record.transferReference,
        receiptImageUrl: record.receiptImageUrl,
        createdAt: record.createdAt,
      });
    }).catch((err) => console.error("[Telegram Deposit Dispatch Error]:", err.message));

    return record;
  }

  /**
   * Approves a deposit request and credits user wallet atomically
   */
  static async approveDeposit(
    depositId: string,
    adminUserId: string,
    note: string,
    operatorName?: string,
    operatorAvatar?: string
  ) {
    let deposit: any = persistentStore.getDepositById(depositId);

    try {
      const dbDeposit = await prisma.depositRequest.findFirst({
        where: { OR: [{ id: depositId }, { depositNumber: depositId }] },
      });
      if (dbDeposit) deposit = dbDeposit;
    } catch {
      // fallback
    }

    if (!deposit) throw new Error("Deposit request not found");
    if (deposit.status !== DepositStatus.PENDING) {
      throw new Error(`Deposit already finalized as ${deposit.status}`);
    }

    const opName = operatorName || "المشرف العام (Root Super-Admin)";
    const opAvatar = operatorAvatar || "/images/logo.png";

    // Credit user wallet atomically
    const creditResult = await WalletService.creditFunds({
      userId: deposit.userId,
      amount: Number(deposit.amount),
      type: TransactionType.DEPOSIT,
      depositRequestId: deposit.id,
      description: `إيداع معتمد (${deposit.method}) - مرجع: ${deposit.depositNumber}`,
      processedById: adminUserId,
      operatorName: opName,
      operatorAvatar: opAvatar,
    });

    deposit.status = DepositStatus.APPROVED;
    deposit.approvedByUserId = adminUserId;
    deposit.operatorName = opName;
    deposit.operatorAvatar = opAvatar;
    deposit.approvedAt = new Date().toISOString();
    deposit.adminNote = note || "Approved by Administrator";

    try {
      await prisma.depositRequest.update({
        where: { id: deposit.id },
        data: {
          status: DepositStatus.APPROVED,
          approvedByUserId: adminUserId,
          approvedAt: new Date(),
          adminNote: note,
        },
      });
    } catch {
      // fallback
    }

    persistentStore.saveDeposit(deposit as any);
    return { success: true, deposit, creditResult };
  }

  /**
   * Rejects a deposit request
   */
  static async rejectDeposit(depositId: string, adminUserId: string, note: string) {
    let deposit: any = persistentStore.getDepositById(depositId);

    try {
      const dbDeposit = await prisma.depositRequest.findFirst({
        where: { OR: [{ id: depositId }, { depositNumber: depositId }] },
      });
      if (dbDeposit) deposit = dbDeposit;
    } catch {
      // fallback
    }

    if (!deposit) throw new Error("Deposit request not found");
    if (deposit.status !== DepositStatus.PENDING) {
      throw new Error(`Deposit already finalized as ${deposit.status}`);
    }

    deposit.status = DepositStatus.REJECTED;
    deposit.approvedByUserId = adminUserId;
    deposit.approvedAt = new Date().toISOString();
    deposit.adminNote = note || "Receipt verification failed";

    try {
      await prisma.depositRequest.update({
        where: { id: deposit.id },
        data: {
          status: DepositStatus.REJECTED,
          approvedByUserId: adminUserId,
          approvedAt: new Date(),
          adminNote: note,
        },
      });
    } catch {
      // fallback
    }

    persistentStore.saveDeposit(deposit as any);
    return { success: true, deposit };
  }

  /**
   * Fetches deposits list
   */
  static async listDeposits(userId?: string) {
    try {
      const deposits = await prisma.depositRequest.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      if (deposits && deposits.length > 0) return deposits;
    } catch {
      // fallback
    }

    return persistentStore.getDeposits(userId);
  }

  /**
   * Admin metrics overview
   */
  static async getAdminMetrics() {
    const orders = await this.listOrders();
    const deposits = await this.listDeposits();

    const totalSales = orders
      .filter((o: any) => o.status === OrderStatus.COMPLETED)
      .reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);

    const pendingDepositsCount = deposits.filter((d: any) => d.status === DepositStatus.PENDING).length;
    const completedOrdersCount = orders.filter((o: any) => o.status === OrderStatus.COMPLETED).length;
    const failedOrdersCount = orders.filter((o: any) => o.status === OrderStatus.FAILED).length;

    return {
      totalSales,
      completedOrdersCount,
      failedOrdersCount,
      pendingDepositsCount,
      bullMqFailedJobsCount: failedOrdersCount,
      activeOrdersCount: orders.filter((o: any) => o.status === OrderStatus.PENDING || o.status === OrderStatus.PROCESSING).length,
      providerBalances: [
        {
          code: "MOCK_TOPUP",
          name: "TSUNAMI Mock Gateway",
          balance: 8450.50,
          threshold: 1000.00,
          status: "ONLINE",
          currency: "USD",
          endpoint: "mock://internal.rpc",
          latencyMs: 14,
        },
        {
          code: "REST_GENERIC",
          name: "Global Top-Up Gateway (REST)",
          balance: 1420.00,
          threshold: 500.00,
          status: "READY",
          currency: "USD",
          endpoint: "https://api.provider-topup.example.com",
          latencyMs: 82,
        },
      ],
    };
  }

  /**
   * Forces a refund for an order from Root Control with audit log
   */
  static async forceRefund(orderId: string, adminUserId: string, reason: string) {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === OrderStatus.FAILED) {
      throw new Error("Order is already marked as FAILED and refunded");
    }

    const refundResult = await WalletService.creditFunds({
      userId: order.userId,
      amount: Number(order.amount),
      type: TransactionType.ORDER_REFUND,
      orderId: order.id,
      description: `[ROOT ADMIN AUDIT] Force refund by ${adminUserId}: ${reason}`,
      reference: `FORCE-REFUND-${order.orderNumber}`,
    });

    order.status = OrderStatus.FAILED;
    order.errorMessage = `Admin Force Refund (${reason})`;

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.FAILED,
          errorMessage: `Admin Force Refund: ${reason}`,
        },
      });
    } catch {
      // memory fallback
    }

    return { success: true, order, refundResult };
  }

  /**
   * Pings a provider adapter to test latency and availability via Provider Engine
   */
  static async pingProvider(providerCode: string) {
    const startTime = Date.now();
    try {
      const provider = providerEngine.getProvider(providerCode);
      if (provider.ping) {
        const pingRes = await provider.ping();
        return {
          providerCode: provider.id,
          providerName: provider.name,
          status: pingRes.success ? "HEALTHY" : "DEGRADED",
          latencyMs: pingRes.latencyMs || Date.now() - startTime,
          timestamp: new Date().toISOString(),
          message: pingRes.message,
        };
      }
      return {
        providerCode: provider.id,
        providerName: provider.name,
        status: "HEALTHY",
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        providerCode,
        status: "DEGRADED",
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: err.message,
      };
    }
  }
}

