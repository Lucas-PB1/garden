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

export const verifyMercadoPagoWebhookSignature = (request: NextRequest, paymentId: string) => {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
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

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const receivedBuffer = Buffer.from(receivedHash, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { ok: false, skipped: false, reason: "invalid_signature_length" };
  }

  return {
    ok: timingSafeEqual(expectedBuffer, receivedBuffer),
    skipped: false,
    reason: "verified",
  };
};
