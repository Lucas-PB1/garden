import { getMercadoPagoPayment } from "@/lib/server/mercadoPago";
import {
  getMercadoPagoWebhookPaymentId,
  getMercadoPagoWebhookType,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/server/mercadoPagoWebhook";
import { reconcileMercadoPagoPayment } from "@/lib/server/paymentReconciliation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getPayload = async (request: NextRequest) => {
  try {
    return (await request.json()) as { id?: string; type?: string; data?: { id?: string } };
  } catch {
    return {};
  }
};

export async function POST(request: NextRequest) {
  const payload = await getPayload(request);
  const paymentId = getMercadoPagoWebhookPaymentId(request, payload);
  const eventType = getMercadoPagoWebhookType(request, payload);

  if (!paymentId) {
    return NextResponse.json({ received: true, ignored: "missing_payment_id" });
  }

  if (eventType && eventType !== "payment") {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  const signature = verifyMercadoPagoWebhookSignature(request, paymentId);
  if (!signature.ok) {
    return NextResponse.json(
      {
        error: "Invalid Mercado Pago webhook signature.",
        reason: signature.reason,
      },
      { status: 401 },
    );
  }

  try {
    const payment = await getMercadoPagoPayment(paymentId);
    const result = await reconcileMercadoPagoPayment(payment);

    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
