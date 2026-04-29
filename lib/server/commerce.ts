import { randomBytes } from "crypto";
import { getDocument, runQuery, setDocument } from "./firebaseRest";

export type CommerceOrderStatus =
  | "created"
  | "preference_created"
  | "preference_failed"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back"
  | "amount_mismatch";

export interface CommerceConfig {
  productName: string;
  description: string;
  priceCents: number;
  currencyId: "BRL";
  active: boolean;
  binaryMode: boolean;
  statementDescriptor: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CheckoutBuyerData {
  buyerName: string;
  partnerName: string;
  dedication: string;
}

export interface CommerceOrder {
  id: string;
  userId: string;
  userEmail: string | null;
  buyer: CheckoutBuyerData;
  productName: string;
  expectedAmountCents: number;
  currencyId: "BRL";
  status: CommerceOrderStatus;
  externalReference: string;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  checkoutUrl?: string;
  paymentIds?: string[];
  lastPayment?: Record<string, unknown>;
  securityFlags?: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface UserEntitlement {
  id?: string;
  userId: string;
  active: boolean;
  productName: string;
  orderId: string;
  paymentId: string;
  grantedAt: string;
  updatedAt: string;
  revokedAt?: string;
  revokeReason?: string;
}

export const DEFAULT_COMMERCE_CONFIG: CommerceConfig = {
  productName: "Love Garden - acesso unico",
  description: "Um site privado para guardar fotos, datas e frases do casal.",
  priceCents: 10,
  currencyId: "BRL",
  active: true,
  binaryMode: false,
  statementDescriptor: "LOVEGARDEN",
};

const clampString = (value: unknown, fallback: string, maxLength: number) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().replace(/\s+/g, " ");
  return (normalized || fallback).slice(0, maxLength);
};

const sanitizeStatementDescriptor = (value: unknown) => {
  const normalized = clampString(value, DEFAULT_COMMERCE_CONFIG.statementDescriptor, 22)
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();

  return normalized || DEFAULT_COMMERCE_CONFIG.statementDescriptor;
};

export const sanitizeCommerceConfig = (input: Partial<CommerceConfig>): CommerceConfig => {
  const priceCents = Number(input.priceCents);

  return {
    productName: clampString(input.productName, DEFAULT_COMMERCE_CONFIG.productName, 100),
    description: clampString(input.description, DEFAULT_COMMERCE_CONFIG.description, 500),
    priceCents:
      Number.isInteger(priceCents) && priceCents >= 1 && priceCents <= 1_000_000
        ? priceCents
        : DEFAULT_COMMERCE_CONFIG.priceCents,
    currencyId: "BRL",
    active: typeof input.active === "boolean" ? input.active : DEFAULT_COMMERCE_CONFIG.active,
    binaryMode:
      typeof input.binaryMode === "boolean" ? input.binaryMode : DEFAULT_COMMERCE_CONFIG.binaryMode,
    statementDescriptor: sanitizeStatementDescriptor(input.statementDescriptor),
    updatedAt: input.updatedAt,
    updatedBy: input.updatedBy,
  };
};

export const sanitizeBuyerData = (input: Partial<CheckoutBuyerData>): CheckoutBuyerData => ({
  buyerName: clampString(input.buyerName, "", 80),
  partnerName: clampString(input.partnerName, "", 80),
  dedication: clampString(input.dedication, "", 240),
});

export const amountToCurrencyValue = (amountCents: number) =>
  Number((amountCents / 100).toFixed(2));

export const amountToCents = (amount: unknown) => Math.round(Number(amount || 0) * 100);

export const getCommerceConfig = async () => {
  const savedConfig = await getDocument<Partial<CommerceConfig>>("commerce/config");

  return sanitizeCommerceConfig({
    ...DEFAULT_COMMERCE_CONFIG,
    ...(savedConfig || {}),
  });
};

export const saveCommerceConfig = async (input: Partial<CommerceConfig>, updatedBy: string) => {
  const currentConfig = await getCommerceConfig();
  const nextConfig = sanitizeCommerceConfig({
    ...currentConfig,
    ...input,
    updatedAt: new Date().toISOString(),
    updatedBy,
  });

  await setDocument("commerce/config", nextConfig as unknown as Record<string, unknown>);
  return nextConfig;
};

const createOrderId = () => `lg-${Date.now()}-${randomBytes(4).toString("hex")}`;

export const createCheckoutOrder = async ({
  userId,
  userEmail,
  buyer,
  config,
}: {
  userId: string;
  userEmail: string | null;
  buyer: CheckoutBuyerData;
  config: CommerceConfig;
}) => {
  const now = new Date().toISOString();
  const orderId = createOrderId();
  const order: CommerceOrder = {
    id: orderId,
    userId,
    userEmail,
    buyer,
    productName: config.productName,
    expectedAmountCents: config.priceCents,
    currencyId: config.currencyId,
    status: "created",
    externalReference: orderId,
    paymentIds: [],
    createdAt: now,
    updatedAt: now,
  };

  await setDocument(`orders/${orderId}`, order as unknown as Record<string, unknown>);
  return order;
};

export const getOrder = async (orderId: string) => getDocument<CommerceOrder>(`orders/${orderId}`);

export const updateOrder = async (orderId: string, patch: Partial<CommerceOrder>) => {
  const currentOrder = await getOrder(orderId);

  if (!currentOrder) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const nextOrder = {
    ...currentOrder,
    ...patch,
    id: currentOrder.id,
    updatedAt: new Date().toISOString(),
  };

  await setDocument(`orders/${orderId}`, nextOrder as unknown as Record<string, unknown>);
  return nextOrder;
};

export const getRecentOrders = async (limit = 25) =>
  runQuery<CommerceOrder>({
    from: [{ collectionId: "orders" }],
    orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    limit,
  });

export const getEntitlement = async (userId: string) =>
  getDocument<UserEntitlement>(`entitlements/${userId}`);

export const grantEntitlement = async ({
  userId,
  order,
  paymentId,
}: {
  userId: string;
  order: CommerceOrder;
  paymentId: string;
}) => {
  const now = new Date().toISOString();
  const entitlement: UserEntitlement = {
    userId,
    active: true,
    productName: order.productName,
    orderId: order.id,
    paymentId,
    grantedAt: now,
    updatedAt: now,
  };

  await setDocument(`entitlements/${userId}`, entitlement as unknown as Record<string, unknown>);
  return entitlement;
};

export const revokeEntitlement = async (userId: string, reason: string) => {
  const current = await getEntitlement(userId);
  if (!current) return null;

  const now = new Date().toISOString();
  const nextEntitlement = {
    ...current,
    active: false,
    revokedAt: now,
    revokeReason: reason,
    updatedAt: now,
  };

  await setDocument(
    `entitlements/${userId}`,
    nextEntitlement as unknown as Record<string, unknown>,
  );
  return nextEntitlement;
};
