import { NextResponse, type NextRequest } from "next/server";
import {
  getGa4RealtimeUsers,
  type Ga4RealtimeScope,
} from "@/lib/ga4-realtime";

export const runtime = "nodejs";

const CACHE_SECONDS = 30;

function parseScope(value: string | null): Ga4RealtimeScope {
  return value === "chat" ? "chat" : "site";
}

export async function GET(request: NextRequest) {
  const scope = parseScope(request.nextUrl.searchParams.get("scope"));

  try {
    const data = await getGa4RealtimeUsers(scope);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("GA4 realtime query failed", error);

    return NextResponse.json(
      {
        activeUsers: null,
        configured: true,
        scope,
        source: "google_analytics",
        status: "unavailable",
        updatedAt: new Date().toISOString(),
        windowMinutes: 30,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
