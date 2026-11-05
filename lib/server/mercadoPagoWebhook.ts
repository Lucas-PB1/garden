import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

interface WebhookPayload {
  id?: string;
  type?: string;
  data?: {
    id?: string;
  };
}

const parseSignatureHeader = (signatureHeader: string) =>
  Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value),
  );

export const getMercadoPagoWebhookPaymentId = (request: NextRequest, payload: WebhookPayload) =>
  request.nextUrl.searchParams.get("data.id") ||
  request.nextUrl.searchParams.get("id") ||
  payload.data?.id ||
  payload.id ||
  "";

export const getMercadoPagoWebhookType = (request: NextRequest, payload: WebhookPayload) =>
  request.nextUrl.searchParams.get("type") || payload.type || "";

/**
 * Webhook secrets accepted by this deployment: its own, plus the optional test-mode secret
 * (production also receives sandbox notifications from preview deployments).
 */
const getWebhookSecrets = () =>
  [process.env.MERCADO_PAGO_WEBHOOK_SECRET, process.env.MERCADO_PAGO_TEST_WEBHOOK_SECRET].filter(
    (secret): secret is string => Boolean(secret),
  );

const signatureMatches = (secret: string, manifest: string, receivedHash: string) => {
  const expectedBuffer = Buffer.from(
    createHmac("sha256", secret).update(manifest).digest("hex"),
    "hex",
  );
  const receivedBuffer = Buffer.from(receivedHash, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

export const verifyMercadoPagoWebhookSignature = (request: NextRequest, paymentId: string) => {
  const secrets = getWebhookSecrets();

  if (secrets.length === 0) {
    return {
      ok:
        process.env.NODE_ENV !== "production" ||
        process.env.MERCADO_PAGO_ALLOW_UNSIGNED_WEBHOOKS === "true",
      skipped: true,
      reason: "missing_secret",
    };
  }

  const signatureHeader = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  const signatureParts = parseSignatureHeader(signatureHeader);
  const timestamp = signatureParts.ts;
  const receivedHash = signatureParts.v1;

  if (!paymentId || !requestId || !timestamp || !receivedHash) {
    return { ok: false, skipped: false, reason: "missing_signature_parts" };
  }

  if (!/^[0-9a-f]+$/i.test(receivedHash)) {
    return { ok: false, skipped: false, reason: "invalid_signature_format" };
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const ok = secrets.some((secret) => signatureMatches(secret, manifest, receivedHash));

  return { ok, skipped: false, reason: ok ? "verified" : "invalid_signature" };
};
