import { getCommerceConfig, getRecentOrders, saveCommerceConfig } from "@/lib/server/commerce";
import { HttpError, requireAdmin } from "@/lib/server/firebaseAuth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  return NextResponse.json({ error: "Não foi possível acessar o admin." }, { status: 500 });
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const [config, orders] = await Promise.all([getCommerceConfig(), getRecentOrders()]);

    return NextResponse.json({ config, orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    const body = await getRequestJson(request);
    const config = await saveCommerceConfig(body, admin.uid);
    const orders = await getRecentOrders();

    return NextResponse.json({ config, orders });
  } catch (error) {
    return handleError(error);
  }
}
