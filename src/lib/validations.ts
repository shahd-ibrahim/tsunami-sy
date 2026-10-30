import { z } from "zod";

export const validatePlayerSchema = z.object({
  gameCode: z.string().min(1, "Game code is required"),
  playerId: z.string().min(3, "Player ID must be at least 3 characters").max(32, "Player ID too long"),
  zoneId: z.string().optional(),
});

export const placeOrderSchema = z.object({
  userId: z.string().default("user-demo-id"),
  userRole: z.enum(["USER", "RESELLER", "ADMIN"]).default("USER"),
  productId: z.string().min(1, "Product ID is required"),
  packageId: z.string().optional().default("custom"),
  customQuantity: z.number().positive().optional(),
  targetId: z.string().min(1, "Target ID is required"),
  targetZoneId: z.string().optional(),
  playerNickname: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export const depositSlipSchema = z.object({
  userId: z.string().default("user-demo-id"),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().default("USD"),
  method: z.string().min(1, "Payment method is required"),
  senderName: z.string().optional(),
  senderAccountOrPhone: z.string().optional(),
  transferReference: z.string().optional(),
  receiptImageUrl: z.string().min(1, "Receipt image URL is required"),
});

export const depositActionSchema = z.object({
  depositId: z.string().min(1, "Deposit ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
  adminUserId: z.string().default("admin-demo-id"),
  note: z.string().optional(),
});

export const orderRetrySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const forceRefundSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  adminUserId: z.string().default("admin-demo-id"),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
});

export const pingProviderSchema = z.object({
  providerCode: z.string().min(1, "Provider code is required"),
});
