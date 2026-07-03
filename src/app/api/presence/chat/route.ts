import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CHAT_PRESENCE_WINDOW_SECONDS } from "@/lib/chat-presence";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const heartbeatSchema = z.object({
  active: z.boolean().optional().default(true),
  clientId: z.string().uuid(),
});

function getNoStoreHeaders() {
  return { "Cache-Control": "no-store" };
}

function getPresenceCutoff() {
  return new Date(
    Date.now() - CHAT_PRESENCE_WINDOW_SECONDS * 1000,
  ).toISOString();
}

function hashUserAgent(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return createHash("sha256").update(userAgent).digest("hex").slice(0, 24);
}

async function getPresencePayload() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("chat_presence")
    .select("client_id", { count: "exact", head: true })
    .gte("last_seen_at", getPresenceCutoff());

  if (error) {
    throw new Error(error.message);
  }

  return {
    activeUsers: count ?? 0,
    configured: true,
    scope: "chat",
    source: "devroulotte_presence",
    status: "ok",
    updatedAt: new Date().toISOString(),
    windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
  };
}

export async function GET() {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      {
        activeUsers: null,
        configured: false,
        scope: "chat",
        source: "devroulotte_presence",
        status: "not_configured",
        updatedAt: new Date().toISOString(),
        windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
      },
      { headers: getNoStoreHeaders() },
    );
  }

  try {
    return NextResponse.json(await getPresencePayload(), {
      headers: getNoStoreHeaders(),
    });
  } catch (error) {
    console.error("Chat presence count failed", error);

    return NextResponse.json(
      {
        activeUsers: null,
        configured: true,
        scope: "chat",
        source: "devroulotte_presence",
        status: "unavailable",
        updatedAt: new Date().toISOString(),
        windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
      },
      { headers: getNoStoreHeaders() },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      {
        activeUsers: null,
        configured: false,
        scope: "chat",
        source: "devroulotte_presence",
        status: "not_configured",
        updatedAt: new Date().toISOString(),
        windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
      },
      { headers: getNoStoreHeaders() },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const body = heartbeatSchema.parse(await request.json());
    const rateLimit = checkRateLimit(
      `chat-presence:${actor.key}:${body.clientId}`,
      30,
      60_000,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          activeUsers: null,
          configured: true,
          message: "Troppi aggiornamenti presenza. Riprova tra poco.",
          retryAfterMs: rateLimit.retryAfterMs,
          scope: "chat",
          source: "devroulotte_presence",
          status: "rate_limited",
          updatedAt: new Date().toISOString(),
          windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
        },
        { headers: getNoStoreHeaders(), status: 429 },
      );
    }

    const supabase = getSupabaseAdmin();

    if (body.active) {
      const now = new Date().toISOString();
      const { error } = await supabase.from("chat_presence").upsert(
        {
          actor_id: actor.id,
          actor_type: actor.type,
          client_id: body.clientId,
          last_seen_at: now,
          updated_at: now,
          user_agent_hash: hashUserAgent(request),
        },
        { onConflict: "actor_type,actor_id,client_id" },
      );

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase
        .from("chat_presence")
        .delete()
        .eq("actor_type", actor.type)
        .eq("actor_id", actor.id)
        .eq("client_id", body.clientId);

      if (error) {
        throw new Error(error.message);
      }
    }

    return NextResponse.json(await getPresencePayload(), {
      headers: getNoStoreHeaders(),
    });
  } catch (error) {
    console.error("Chat presence heartbeat failed", error);

    return NextResponse.json(
      {
        activeUsers: null,
        configured: true,
        message:
          error instanceof Error ? error.message : "Presenza chat non aggiornata",
        scope: "chat",
        source: "devroulotte_presence",
        status: "unavailable",
        updatedAt: new Date().toISOString(),
        windowSeconds: CHAT_PRESENCE_WINDOW_SECONDS,
      },
      { headers: getNoStoreHeaders() },
    );
  }
}
