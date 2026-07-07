import { NextResponse } from "next/server";
import { getStatusPayload } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getNoStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

export async function GET() {
  return NextResponse.json(await getStatusPayload(), {
    headers: getNoStoreHeaders(),
  });
}
