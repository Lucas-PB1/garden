import { getOrder } from "@/lib/server/commerce";
import { HttpError, isAdminUser, requireAuth } from "@/lib/server/firebaseAuth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const handleError = (error: unknown) => {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Não foi possível consultar o pedido." }, { status: 500 });
};

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const orderId = request.nextUrl.searchParams.get("orderId") || "";

    if (!orderId) {
      return NextResponse.json({ error: "Pedido não informado." }, { status: 400 });
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    if (order.userId !== user.uid && !isAdminUser(user)) {
      return NextResponse.json({ error: "Você não pode acessar este pedido." }, { status: 403 });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        productName: order.productName,
        expectedAmountCents: order.expectedAmountCents,
        currencyId: order.currencyId,
        securityFlags: order.securityFlags || [],
        approvedAt: order.approvedAt || null,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
