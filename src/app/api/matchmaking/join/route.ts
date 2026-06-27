import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  FREE_CALL_LIMIT_SECONDS,
  FREE_DAILY_MATCH_LIMIT,
  MATCH_QUEUE_ACTIVE_SECONDS,
  MATCH_QUEUE_STALE_SECONDS,
  NEXT_COOLDOWN_SECONDS,
  PREMIUM_CALL_LIMIT_SECONDS,
} from "@/lib/app-config";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { Actor, ActorType, MatchPayload } from "@/lib/types";

export const runtime = "nodejs";

const joinSchema = z.object({
  ageConfirmed: z.boolean(),
  rulesAccepted: z.boolean(),
  language: z.string().max(8).optional().default("it"),
  country: z.string().max(8).optional().default("IT"),
  preferredLanguage: z.string().max(8).optional().default("any"),
  preferredCountry: z.string().max(8).optional().default("any"),
});

type QueueRow = {
  actor_type: ActorType;
  actor_id: string;
  display_name: string | null;
  is_premium: boolean;
  language: string | null;
  country: string | null;
  status: "waiting" | "matched";
  match_id: string | null;
  channel_name: string | null;
  role: "caller" | "callee" | null;
  peer_actor_type: ActorType | null;
  peer_actor_id: string | null;
  last_seen_at: string;
};

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}

function logMatchmaking(
  event: string,
  data: Record<string, string | number | boolean | null>,
) {
  console.info(
    JSON.stringify({
      scope: "matchmaking",
      event,
      ...data,
    }),
  );
}

async function isPremium(actor: Actor) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("actor_type", actor.type)
    .eq("actor_id", actor.id)
    .in("status", ["trialing", "active"])
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

async function isBanned(actorType: ActorType, actorId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("bans")
    .select("id")
    .eq("actor_type", actorType)
    .eq("actor_id", actorId)
    .eq("active", true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

async function getDailyUsage(actor: Actor) {
  const supabase = getSupabaseAdmin();
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [asA, asB] = await Promise.all([
    supabase
      .from("match_logs")
      .select("id", { count: "exact", head: true })
      .eq("actor_a_type", actor.type)
      .eq("actor_a_id", actor.id)
      .gte("started_at", since.toISOString()),
    supabase
      .from("match_logs")
      .select("id", { count: "exact", head: true })
      .eq("actor_b_type", actor.type)
      .eq("actor_b_id", actor.id)
      .gte("started_at", since.toISOString()),
  ]);

  return (asA.count ?? 0) + (asB.count ?? 0);
}

async function getRecentPeerKeys(actor: Actor) {
  const supabase = getSupabaseAdmin();
  const [asA, asB] = await Promise.all([
    supabase
      .from("match_logs")
      .select("actor_b_type,actor_b_id")
      .eq("actor_a_type", actor.type)
      .eq("actor_a_id", actor.id)
      .order("started_at", { ascending: false })
      .limit(3),
    supabase
      .from("match_logs")
      .select("actor_a_type,actor_a_id")
      .eq("actor_b_type", actor.type)
      .eq("actor_b_id", actor.id)
      .order("started_at", { ascending: false })
      .limit(3),
  ]);

  return new Set([
    ...(asA.data ?? []).map(
      (row) => `${row.actor_b_type}:${row.actor_b_id}`,
    ),
    ...(asB.data ?? []).map(
      (row) => `${row.actor_a_type}:${row.actor_a_id}`,
    ),
  ]);
}

function buildMatchPayload(
  matchId: string,
  channelName: string,
  role: "caller" | "callee",
  peer: Pick<Actor, "type" | "id">,
  premium: boolean,
  dailyUsed: number,
): MatchPayload {
  return {
    id: matchId,
    channelName,
    role,
    peerActorType: peer.type,
    peerActorId: peer.id,
    limitSeconds: premium ? PREMIUM_CALL_LIMIT_SECONDS : FREE_CALL_LIMIT_SECONDS,
    nextCooldownSeconds: NEXT_COOLDOWN_SECONDS,
    isPremium: premium,
    dailyRemaining: premium
      ? null
      : Math.max(FREE_DAILY_MATCH_LIMIT - dailyUsed - 1, 0),
    startedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      {
        status: "configuration_error",
        message: "Supabase non configurato. Vedi README e .env.local.example.",
      },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const rateLimit = checkRateLimit(
      `match:${actor.key}`,
      10,
      NEXT_COOLDOWN_SECONDS * 1000,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: "error",
          message: `Attendi ${Math.ceil(
            rateLimit.retryAfterMs / 1000,
          )}s prima di premere Next.`,
        },
        { status: 429 },
      );
    }

    const body = joinSchema.parse(await request.json());

    if (!body.ageConfirmed || !body.rulesAccepted) {
      return NextResponse.json(
        {
          status: "error",
          message: "Devi confermare 18+ e accettare le regole.",
        },
        { status: 400 },
      );
    }

    const banned = await isBanned(actor.type, actor.id);

    if (banned) {
      return NextResponse.json(
        {
          status: "banned",
          message: "Account o sessione bloccata dalla moderazione.",
        },
        { status: 403 },
      );
    }

    const supabase = getSupabaseAdmin();
    const premium = await isPremium(actor);
    const dailyUsed = await getDailyUsage(actor);
    const activeCutoff = new Date(
      Date.now() - MATCH_QUEUE_ACTIVE_SECONDS * 1000,
    ).toISOString();
    const staleCutoff = new Date(
      Date.now() - MATCH_QUEUE_STALE_SECONDS * 1000,
    ).toISOString();

    logMatchmaking("join_start", {
      actorType: actor.type,
      actorHash: hashId(actor.id),
      premium,
      dailyUsed,
    });

    if (!premium && dailyUsed >= FREE_DAILY_MATCH_LIMIT) {
      return NextResponse.json(
        {
          status: "limit_reached",
          message: "Limite giornaliero Free raggiunto. Passa a Premium.",
        },
        { status: 402 },
      );
    }

    const { data: ownQueue } = await supabase
      .from("match_queue")
      .select("*")
      .eq("actor_type", actor.type)
      .eq("actor_id", actor.id)
      .maybeSingle<QueueRow>();

    if (ownQueue?.status === "matched" && ownQueue.match_id) {
      if (ownQueue.last_seen_at < staleCutoff) {
        await supabase
          .from("match_queue")
          .delete()
          .eq("actor_type", actor.type)
          .eq("actor_id", actor.id);

        await supabase
          .from("match_logs")
          .update({
            status: "ended",
            ended_at: new Date().toISOString(),
            ended_reason: "stale_queue_rejoin",
          })
          .eq("id", ownQueue.match_id)
          .eq("status", "active");

        logMatchmaking("stale_matched_queue_removed", {
          actorType: actor.type,
          actorHash: hashId(actor.id),
        });
      } else {
        await supabase
          .from("match_queue")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("actor_type", actor.type)
          .eq("actor_id", actor.id);

        logMatchmaking("own_queue_matched", {
          actorType: actor.type,
          actorHash: hashId(actor.id),
          role: ownQueue.role ?? "callee",
        });

        return NextResponse.json({
          status: "matched",
          match: buildMatchPayload(
            ownQueue.match_id,
            ownQueue.channel_name ?? "",
            ownQueue.role ?? "callee",
            {
              type: ownQueue.peer_actor_type ?? "guest",
              id: ownQueue.peer_actor_id ?? "",
            },
            premium,
            dailyUsed,
          ),
        });
      }
    }

    await supabase
      .from("match_queue")
      .delete()
      .eq("status", "waiting")
      .lt("last_seen_at", staleCutoff);

    const recentPeerKeys = await getRecentPeerKeys(actor);
    const { data: candidates } = await supabase
      .from("match_queue")
      .select("*")
      .eq("status", "waiting")
      .neq("actor_id", actor.id)
      .gte("last_seen_at", activeCutoff)
      .order("is_premium", { ascending: false })
      .order("queued_at", { ascending: true })
      .limit(20)
      .returns<QueueRow[]>();

    logMatchmaking("candidate_scan", {
      actorType: actor.type,
      actorHash: hashId(actor.id),
      candidates: candidates?.length ?? 0,
      activeWindowSeconds: MATCH_QUEUE_ACTIVE_SECONDS,
    });

    const filteredCandidates = (candidates ?? []).filter((candidate) => {
      const peerKey = `${candidate.actor_type}:${candidate.actor_id}`;

      if (recentPeerKeys.has(peerKey)) {
        return false;
      }

      if (
        premium &&
        body.preferredLanguage !== "any" &&
        candidate.language !== body.preferredLanguage
      ) {
        return false;
      }

      if (
        premium &&
        body.preferredCountry !== "any" &&
        candidate.country !== body.preferredCountry
      ) {
        return false;
      }

      return true;
    });

    const pool = filteredCandidates.length ? filteredCandidates : candidates ?? [];
    const availablePool = [];

    for (const candidate of pool.slice(0, 8)) {
      if (!(await isBanned(candidate.actor_type, candidate.actor_id))) {
        availablePool.push(candidate);
      }
    }

    const peer =
      availablePool.length > 0
        ? availablePool[Math.floor(Math.random() * availablePool.length)]
        : null;

    logMatchmaking("candidate_filter", {
      actorType: actor.type,
      actorHash: hashId(actor.id),
      filteredCandidates: filteredCandidates.length,
      availablePool: availablePool.length,
      hasPeer: Boolean(peer),
    });

    if (!peer) {
      await supabase.from("match_queue").upsert(
        {
          actor_type: actor.type,
          actor_id: actor.id,
          display_name: actor.displayName,
          is_premium: premium,
          language: body.language,
          country: body.country,
          preferred_language: premium ? body.preferredLanguage : "any",
          preferred_country: premium ? body.preferredCountry : "any",
          status: "waiting",
          match_id: null,
          channel_name: null,
          role: null,
          peer_actor_type: null,
          peer_actor_id: null,
          queued_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "actor_type,actor_id" },
      );

      logMatchmaking("waiting", {
        actorType: actor.type,
        actorHash: hashId(actor.id),
      });

      return NextResponse.json({
        status: "waiting",
        retryAfterMs: 1800,
        message: "Sto cercando una persona disponibile.",
      });
    }

    const channelName = `match:${crypto.randomUUID()}:${randomBytes(12).toString(
      "hex",
    )}`;
    const { data: match, error: matchError } = await supabase
      .from("match_logs")
      .insert({
        channel_name: channelName,
        actor_a_type: actor.type,
        actor_a_id: actor.id,
        actor_b_type: peer.actor_type,
        actor_b_id: peer.actor_id,
        status: "active",
        plan_snapshot: premium ? "premium" : "free",
      })
      .select("id")
      .single();

    if (matchError || !match) {
      throw new Error(matchError?.message ?? "Creazione match fallita");
    }

    const peerClaim = await supabase
      .from("match_queue")
      .update({
        status: "matched",
        match_id: match.id,
        channel_name: channelName,
        role: "callee",
        peer_actor_type: actor.type,
        peer_actor_id: actor.id,
        last_seen_at: new Date().toISOString(),
      })
      .eq("actor_type", peer.actor_type)
      .eq("actor_id", peer.actor_id)
      .eq("status", "waiting")
      .gte("last_seen_at", activeCutoff)
      .select("actor_type,actor_id")
      .maybeSingle();

    if (peerClaim.error || !peerClaim.data) {
      await supabase
        .from("match_logs")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          ended_reason: "peer_claim_failed",
        })
        .eq("id", match.id);

      logMatchmaking("peer_claim_failed", {
        actorType: actor.type,
        actorHash: hashId(actor.id),
        peerType: peer.actor_type,
        peerHash: hashId(peer.actor_id),
      });

      await supabase.from("match_queue").upsert(
        {
          actor_type: actor.type,
          actor_id: actor.id,
          display_name: actor.displayName,
          is_premium: premium,
          language: body.language,
          country: body.country,
          preferred_language: premium ? body.preferredLanguage : "any",
          preferred_country: premium ? body.preferredCountry : "any",
          status: "waiting",
          match_id: null,
          channel_name: null,
          role: null,
          peer_actor_type: null,
          peer_actor_id: null,
          queued_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "actor_type,actor_id" },
      );

      return NextResponse.json({
        status: "waiting",
        retryAfterMs: 900,
        message: "Sto cercando una persona disponibile.",
      });
    }

    await supabase
      .from("match_queue")
      .delete()
      .eq("actor_type", actor.type)
      .eq("actor_id", actor.id);

    logMatchmaking("matched", {
      actorType: actor.type,
      actorHash: hashId(actor.id),
      peerType: peer.actor_type,
      peerHash: hashId(peer.actor_id),
      role: "caller",
    });

    return NextResponse.json({
      status: "matched",
      match: buildMatchPayload(
        match.id,
        channelName,
        "caller",
        {
          type: peer.actor_type,
          id: peer.actor_id,
        },
        premium,
        dailyUsed,
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Matchmaking non riuscito",
      },
      { status: 400 },
    );
  }
}
