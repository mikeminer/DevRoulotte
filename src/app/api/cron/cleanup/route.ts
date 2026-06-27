import { NextRequest, NextResponse } from "next/server";
import {
  MATCH_QUEUE_STALE_SECONDS,
  PREMIUM_CALL_LIMIT_SECONDS,
} from "@/lib/app-config";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

function assertCleanupAccess(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_ACCESS_TOKEN;
  const authorization = request.headers.get("authorization");
  const adminHeader = request.headers.get("x-admin-token");

  if (cronSecret && authorization === `Bearer ${cronSecret}`) {
    return;
  }

  if (adminToken && adminHeader === adminToken) {
    return;
  }

  throw new Error("Cleanup non autorizzato");
}

async function cleanup(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    assertCleanupAccess(request);

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const queueCutoff = new Date(
      now.getTime() - MATCH_QUEUE_STALE_SECONDS * 1000,
    ).toISOString();
    const activeMatchCutoff = new Date(
      now.getTime() -
        (PREMIUM_CALL_LIMIT_SECONDS + MATCH_QUEUE_STALE_SECONDS) * 1000,
    ).toISOString();
    const signalCutoff = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

    const [queueCleanup, matchCleanup, signalCleanup] = await Promise.all([
      supabase
        .from("match_queue")
        .delete({ count: "exact" })
        .lt("last_seen_at", queueCutoff),
      supabase
        .from("match_logs")
        .update(
          {
            status: "ended",
            ended_at: now.toISOString(),
            ended_reason: "cleanup_stale",
          },
          { count: "exact" },
        )
        .eq("status", "active")
        .lt("started_at", activeMatchCutoff),
      supabase
        .from("webrtc_signals")
        .delete({ count: "exact" })
        .lt("created_at", signalCutoff),
    ]);

    if (queueCleanup.error) {
      throw new Error(queueCleanup.error.message);
    }

    if (matchCleanup.error) {
      throw new Error(matchCleanup.error.message);
    }

    if (signalCleanup.error) {
      throw new Error(signalCleanup.error.message);
    }

    return NextResponse.json({
      ok: true,
      deletedQueueRows: queueCleanup.count ?? 0,
      endedMatchLogs: matchCleanup.count ?? 0,
      deletedWebrtcSignals: signalCleanup.count ?? 0,
      queueCutoff,
      activeMatchCutoff,
      signalCutoff,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Cleanup fallito",
      },
      { status: 401 },
    );
  }
}

export async function GET(request: NextRequest) {
  return cleanup(request);
}

export async function POST(request: NextRequest) {
  return cleanup(request);
}
