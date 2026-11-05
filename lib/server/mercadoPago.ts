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
  /** false for payments made with test credentials (sandbox). */
  live_mode?: boolean;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

class MercadoPagoRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const getMercadoPagoAccessToken = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("Missing MERCADO_PAGO_ACCESS_TOKEN");
  }

  return accessToken;
};

/**
 * Tokens that may own a payment, in lookup order: this environment's token, then the optional
 * test token. Production sets MERCADO_PAGO_TEST_ACCESS_TOKEN so sandbox payments created by
 * preview deployments (which notify the production webhook) can still be reconciled.
 */
const getPaymentLookupTokens = () =>
  Array.from(
    new Set(
      [getMercadoPagoAccessToken(), process.env.MERCADO_PAGO_TEST_ACCESS_TOKEN].filter(
        (token): token is string => Boolean(token),
      ),
    ),
  );

const mercadoPagoFetch = async <T>(
  url: string,
  init: RequestInit = {},
  accessToken = getMercadoPagoAccessToken(),
) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new MercadoPagoRequestError(
      response.status,
      `Mercado Pago request failed (${response.status}): ${message.slice(0, 500)}`,
    );
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

export const getMercadoPagoPayment = async (paymentId: string) => {
  const url = `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`;
  const tokens = getPaymentLookupTokens();

  for (const [index, token] of tokens.entries()) {
    try {
      return await mercadoPagoFetch<MercadoPagoPayment>(url, {}, token);
    } catch (error) {
      const isLast = index === tokens.length - 1;
      // A payment that belongs to the other account (live vs test) answers 401/403/404.
      const notOwnedByThisToken =
        error instanceof MercadoPagoRequestError && [401, 403, 404].includes(error.status);
      if (isLast || !notOwnedByThisToken) throw error;
    }
  }

  throw new Error("No Mercado Pago access token configured.");
};
