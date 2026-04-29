import { amountToCurrencyValue, type CommerceConfig, type CommerceOrder } from "./commerce";

export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  collector_id?: number;
}

export interface MercadoPagoPayment {
  id: number | string;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  external_reference?: string;
  date_approved?: string;
  collector_id?: number;
  payment_method_id?: string;
  payment_type_id?: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

const getMercadoPagoAccessToken = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Missing MERCADO_PAGO_ACCESS_TOKEN");
  }

  return accessToken;
};

const mercadoPagoFetch = async <T>(url: string, init: RequestInit = {}) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getMercadoPagoAccessToken()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Mercado Pago request failed (${response.status}): ${message.slice(0, 500)}`);
  }

  return (await response.json()) as T;
};

const addWebhookSourceParam = (notificationUrl: string) => {
  try {
    const url = new URL(notificationUrl);
    url.searchParams.set("source_news", "webhooks");
    return url.toString();
  } catch {
    const separator = notificationUrl.includes("?") ? "&" : "?";
    return `${notificationUrl}${separator}source_news=webhooks`;
  }
};

export const selectCheckoutUrl = (preference: MercadoPagoPreferenceResponse) => {
  const mode = process.env.MERCADO_PAGO_CHECKOUT_URL_MODE;

  if (mode === "sandbox" && preference.sandbox_init_point) {
    return preference.sandbox_init_point;
  }

  return preference.init_point || preference.sandbox_init_point || "";
};

export const createMercadoPagoPreference = async ({
  order,
  config,
  baseUrl,
}: {
  order: CommerceOrder;
  config: CommerceConfig;
  baseUrl: string;
}) => {
  const notificationUrl =
    process.env.MERCADO_PAGO_WEBHOOK_URL || `${baseUrl}/api/mercado-pago/webhook`;
  const backUrlBase = `${baseUrl}/checkout`;
  const body = {
    items: [
      {
        id: "love-garden",
        title: config.productName,
        description: config.description,
        quantity: 1,
        currency_id: config.currencyId,
        unit_price: amountToCurrencyValue(order.expectedAmountCents),
      },
    ],
    payer: {
      email: order.userEmail || undefined,
      name: order.buyer.buyerName || undefined,
    },
    external_reference: order.externalReference,
    notification_url: addWebhookSourceParam(notificationUrl),
    back_urls: {
      success: `${backUrlBase}/success?orderId=${encodeURIComponent(order.id)}`,
      failure: `${backUrlBase}/failure?orderId=${encodeURIComponent(order.id)}`,
      pending: `${backUrlBase}/pending?orderId=${encodeURIComponent(order.id)}`,
    },
    auto_return: "approved",
    binary_mode: config.binaryMode,
    statement_descriptor: config.statementDescriptor,
    metadata: {
      order_id: order.id,
      user_id: order.userId,
    },
  };

  return mercadoPagoFetch<MercadoPagoPreferenceResponse>(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: { "X-Idempotency-Key": order.id },
      body: JSON.stringify(body),
    },
  );
};

export const getMercadoPagoPayment = async (paymentId: string) =>
  mercadoPagoFetch<MercadoPagoPayment>(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
  );
