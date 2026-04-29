export interface PublicCommerceConfig {
  productName: string;
  description: string;
  priceCents: number;
  currencyId: "BRL";
  active: boolean;
}

export interface AdminCommerceConfig extends PublicCommerceConfig {
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

export interface CheckoutOrderStatus {
  id: string;
  status: string;
  productName: string;
  expectedAmountCents: number;
  currencyId: "BRL";
  securityFlags: string[];
  approvedAt: string | null;
  updatedAt: string;
}

export interface CommerceOrderSummary extends CheckoutOrderStatus {
  userEmail?: string | null;
  userId?: string;
  preferenceId?: string;
  paymentIds?: string[];
  createdAt?: string;
}

export interface UserEntitlement {
  active: boolean;
  productName: string;
  orderId: string;
  paymentId: string;
  grantedAt: string;
  updatedAt: string;
  revokedAt?: string;
  revokeReason?: string;
}
