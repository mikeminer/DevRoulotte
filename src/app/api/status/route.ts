import { after, NextResponse } from "next/server";
import { publishStatusSnapshot } from "@/lib/elastic-observability";
import { getStatusPayload } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getNoStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

export async function GET() {
  const payload = await getStatusPayload();

  after(() => publishStatusSnapshot(payload));

  return NextResponse.json(payload, {
    headers: getNoStoreHeaders(),
  });
}
