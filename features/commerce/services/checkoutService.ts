import type { User } from "firebase/auth";
import type {
  AdminCommerceConfig,
  CheckoutBuyerData,
  CheckoutOrderStatus,
  CommerceOrderSummary,
  PublicCommerceConfig,
} from "../types";

const getAuthHeaders = async (user: User) => ({
  Authorization: `Bearer ${await user.getIdToken()}`,
  "Content-Type": "application/json",
});

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "A solicitação falhou.");
  }

  return data as T;
};

export const fetchCommerceConfig = async () => {
  const response = await fetch("/api/checkout/config", { cache: "no-store" });
  const data = await parseResponse<{ config: PublicCommerceConfig }>(response);

  return data.config;
};

export const createCheckout = async (user: User, buyer: CheckoutBuyerData) => {
  const response = await fetch("/api/checkout/create", {
    method: "POST",
    headers: await getAuthHeaders(user),
    body: JSON.stringify(buyer),
  });

  return parseResponse<{ orderId: string; checkoutUrl: string; preferenceId: string }>(response);
};

export const fetchCheckoutStatus = async (user: User, orderId: string) => {
  const params = new URLSearchParams({ orderId });
  const response = await fetch(`/api/checkout/status?${params.toString()}`, {
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    cache: "no-store",
  });
  const data = await parseResponse<{ order: CheckoutOrderStatus }>(response);

  return data.order;
};

export const fetchAdminCommerce = async (user: User) => {
  const response = await fetch("/api/admin/commerce", {
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    cache: "no-store",
  });

  return parseResponse<{ config: AdminCommerceConfig; orders: CommerceOrderSummary[] }>(response);
};

export const updateAdminCommerce = async (user: User, config: AdminCommerceConfig) => {
  const response = await fetch("/api/admin/commerce", {
    method: "PUT",
    headers: await getAuthHeaders(user),
    body: JSON.stringify(config),
  });

  return parseResponse<{ config: AdminCommerceConfig; orders: CommerceOrderSummary[] }>(response);
};
