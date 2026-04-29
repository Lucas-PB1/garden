import {
  createCheckoutOrder,
  getCommerceConfig,
  getEntitlement,
  sanitizeBuyerData,
  updateOrder,
} from "@/lib/server/commerce";
import { HttpError, requireAuth } from "@/lib/server/firebaseAuth";
import { createMercadoPagoPreference, selectCheckoutUrl } from "@/lib/server/mercadoPago";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getRequestBaseUrl = (request: NextRequest) => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";

  if (!host) {
    throw new Error("Could not determine application URL.");
  }

  return `${protocol}://${host}`;
};

const getRequestJson = async (request: NextRequest) => {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const handleError = (error: unknown) => {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Não foi possível iniciar o checkout." }, { status: 500 });
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const config = await getCommerceConfig();

    if (!config.active) {
      return NextResponse.json(
        { error: "As vendas estão temporariamente pausadas." },
        { status: 403 },
      );
    }

    const entitlement = await getEntitlement(user.uid);
    if (entitlement?.active) {
      return NextResponse.json(
        {
          error: "Esta conta já possui acesso ativo.",
          code: "already_purchased",
        },
        { status: 409 },
      );
    }

    const body = await getRequestJson(request);
    const buyer = sanitizeBuyerData({
      buyerName: body.buyerName as string,
      partnerName: body.partnerName as string,
      dedication: body.dedication as string,
    });
    const order = await createCheckoutOrder({
      userId: user.uid,
      userEmail: user.email,
      buyer,
      config,
    });

    try {
      const preference = await createMercadoPagoPreference({
        order,
        config,
        baseUrl: getRequestBaseUrl(request),
      });
      const checkoutUrl = selectCheckoutUrl(preference);

      if (!checkoutUrl) {
        throw new Error("Mercado Pago did not return a checkout URL.");
      }

      await updateOrder(order.id, {
        status: "preference_created",
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
        checkoutUrl,
      });

      return NextResponse.json({
        orderId: order.id,
        checkoutUrl,
        preferenceId: preference.id,
      });
    } catch (error) {
      await updateOrder(order.id, { status: "preference_failed" });
      throw error;
    }
  } catch (error) {
    return handleError(error);
  }
}
