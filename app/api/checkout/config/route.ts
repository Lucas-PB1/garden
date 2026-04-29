import { getCommerceConfig } from "@/lib/server/commerce";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const config = await getCommerceConfig();

  return NextResponse.json(
    {
      config: {
        productName: config.productName,
        description: config.description,
        priceCents: config.priceCents,
        currencyId: config.currencyId,
        active: config.active,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
