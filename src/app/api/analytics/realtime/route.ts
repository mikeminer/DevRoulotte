import { NextResponse, type NextRequest } from "next/server";
import {
  getGa4RealtimeWindowMinutes,
  getGa4RealtimeUsers,
  type Ga4RealtimeScope,
} from "@/lib/ga4-realtime";

export const runtime = "nodejs";

const SITE_CACHE_SECONDS = 30;

function parseScope(value: string | null): Ga4RealtimeScope {
  return value === "chat" ? "chat" : "site";
}

function getCacheHeaders(scope: Ga4RealtimeScope) {
  if (scope === "chat") {
    return { "Cache-Control": "no-store" };
  }

  return {
    "Cache-Control": `s-maxage=${SITE_CACHE_SECONDS}, stale-while-revalidate=${SITE_CACHE_SECONDS}`,
  };
}

export async function GET(request: NextRequest) {
  const scope = parseScope(request.nextUrl.searchParams.get("scope"));

  try {
    const data = await getGa4RealtimeUsers(scope);

    return NextResponse.json(data, {
      headers: getCacheHeaders(scope),
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
        windowMinutes: getGa4RealtimeWindowMinutes(scope),
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
