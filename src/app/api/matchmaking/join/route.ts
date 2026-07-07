import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getCallLimitSeconds,
  getDailyMatchLimit,
  getPlanCode,
  MATCH_QUEUE_ACTIVE_SECONDS,
  MATCH_QUEUE_STALE_SECONDS,
  NEXT_COOLDOWN_SECONDS,
} from "@/lib/app-config";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPublicActorAlias, getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { Actor, ActorType, MatchPayload, PlanCode } from "@/lib/types";

export const runtime = "nodejs";

const joinSchema = z.object({
  ageConfirmed: z.boolean(),
  rulesAccepted: z.boolean(),
  language: z.string().max(8).optional().default("it"),
  country: z.string().max(8).optional().default("IT"),
  preferredLanguage: z.string().max(8).optional().default("any"),
  preferredCountry: z.string().max(8).optional().default("any"),
  matchSalt: z.string().max(64).optional().default(""),
});

type QueueRow = {
  actor_type: ActorType;
  actor_id: string;
  display_name: string | null;
  is_premium: boolean;
  language: string | null;
  country: string | null;
  match_salt: string | null;
  status: "waiting" | "matched";
  match_id: string | null;
  channel_name: string | null;
  role: "caller" | "callee" | null;
  peer_actor_type: ActorType | null;
  peer_actor_id: string | null;
  last_seen_at: string;
};

type ActiveMatchRow = {
  id: string;
  channel_name: string;
  actor_a_type: ActorType;
  actor_a_id: string;
  actor_b_type: ActorType;
  actor_b_id: string;
  started_at: string;
  connected_at: string | null;
};

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}

function normalizeMatchSalt(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 48);
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
    .eq("status", "active")
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
  const sinceIso = since.toISOString();

  async function countMatches(side: "a" | "b", connectedOnly: boolean) {
    const typeColumn = side === "a" ? "actor_a_type" : "actor_b_type";
    const idColumn = side === "a" ? "actor_a_id" : "actor_b_id";
    let query = supabase
      .from("match_logs")
      .select("id", { count: "exact", head: true })
      .eq(typeColumn, actor.type)
      .eq(idColumn, actor.id);

    query = connectedOnly
      ? query.not("connected_at", "is", null).gte("connected_at", sinceIso)
      : query.gte("started_at", sinceIso);

    return query;
  }

  const [asA, asB] = await Promise.all([
    countMatches("a", true),
    countMatches("b", true),
  ]);

  if (asA.error || asB.error) {
    const [fallbackAsA, fallbackAsB] = await Promise.all([
      countMatches("a", false),
      countMatches("b", false),
    ]);

    if (fallbackAsA.error || fallbackAsB.error) {
      throw new Error(fallbackAsA.error?.message ?? fallbackAsB.error?.message);
    }

    return (fallbackAsA.count ?? 0) + (fallbackAsB.count ?? 0);
  }

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

async function getActiveMatch(actor: Actor) {
  const supabase = getSupabaseAdmin();
  const selectColumns =
    "id,channel_name,actor_a_type,actor_a_id,actor_b_type,actor_b_id,started_at,connected_at";
  const [asA, asB] = await Promise.all([
    supabase
      .from("match_logs")
      .select(selectColumns)
      .eq("status", "active")
      .eq("actor_a_type", actor.type)
      .eq("actor_a_id", actor.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle<ActiveMatchRow>(),
    supabase
      .from("match_logs")
      .select(selectColumns)
      .eq("status", "active")
      .eq("actor_b_type", actor.type)
      .eq("actor_b_id", actor.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle<ActiveMatchRow>(),
  ]);

  if (asA.error || asB.error) {
    throw new Error(asA.error?.message ?? asB.error?.message);
  }

  const matches = [asA.data, asB.data].filter(Boolean) as ActiveMatchRow[];

  return matches.sort(
    (left, right) =>
      new Date(right.started_at).getTime() - new Date(left.started_at).getTime(),
  )[0] ?? null;
}

function buildMatchPayload(
  matchId: string,
  channelName: string,
  role: "caller" | "callee",
  peer: Pick<Actor, "type" | "id">,
  planCode: PlanCode,
  dailyUsed: number,
  startedAt = new Date().toISOString(),
): MatchPayload {
  const dailyLimit = getDailyMatchLimit(planCode);

  return {
    id: matchId,
    channelName,
    role,
    peerActorType: peer.type,
    peerActorId: getPublicActorAlias(peer, matchId),
    limitSeconds: getCallLimitSeconds(planCode),
    nextCooldownSeconds: NEXT_COOLDOWN_SECONDS,
    isPremium: planCode === "premium",
    planCode,
    dailyRemaining: dailyLimit === null
      ? null
      : Math.max(dailyLimit - dailyUsed, 0),
    startedAt,
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
    const planCode = getPlanCode(actor.type, premium);
    const dailyLimit = getDailyMatchLimit(planCode);
    const canUseLanguageFilter = planCode !== "guest";
    const canUseCountryFilter = planCode === "premium";
    const matchSalt =
      planCode === "premium" ? normalizeMatchSalt(body.matchSalt) : "";
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
      planCode,
      dailyUsed,
      hasPrivateMatchSalt: Boolean(matchSalt),
    });

    if (dailyLimit !== null && dailyUsed >= dailyLimit) {
      return NextResponse.json(
        {
          status: "limit_reached",
          message:
            planCode === "guest"
              ? "Limite ospite raggiunto: registrati gratis o passa a Premium."
              : "Limite giornaliero Registrato raggiunto. Passa a Premium.",
        },
        { status: 402 },
      );
    }

    const activeMatch = await getActiveMatch(actor);

    if (activeMatch) {
      const isCaller =
        activeMatch.actor_a_type === actor.type &&
        activeMatch.actor_a_id === actor.id;
      const isFresh =
        new Date(activeMatch.started_at).getTime() >=
        new Date(staleCutoff).getTime();

      if (activeMatch.connected_at || isFresh) {
        const role = isCaller ? "caller" : "callee";
        const peer = isCaller
          ? {
              type: activeMatch.actor_b_type,
              id: activeMatch.actor_b_id,
            }
          : {
              type: activeMatch.actor_a_type,
              id: activeMatch.actor_a_id,
            };

        logMatchmaking("active_match_reused", {
          actorType: actor.type,
          actorHash: hashId(actor.id),
          role,
          matchId: activeMatch.id,
        });

        return NextResponse.json({
          status: "matched",
          match: buildMatchPayload(
            activeMatch.id,
            activeMatch.channel_name,
            role,
            peer,
            planCode,
            dailyUsed,
            activeMatch.started_at,
          ),
        });
      }

      await supabase
        .from("match_logs")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
          ended_reason: "stale_active_rejoin",
        })
        .eq("id", activeMatch.id)
        .eq("status", "active");

      await supabase.from("match_queue").delete().eq("match_id", activeMatch.id);

      logMatchmaking("stale_active_match_removed", {
        actorType: actor.type,
        actorHash: hashId(actor.id),
        matchId: activeMatch.id,
      });
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
            planCode,
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

    const hardFilteredCandidates = (candidates ?? []).filter((candidate) => {
      const peerKey = `${candidate.actor_type}:${candidate.actor_id}`;

      if (recentPeerKeys.has(peerKey)) {
        return false;
      }

      if ((candidate.match_salt ?? "") !== matchSalt) {
        return false;
      }

      return true;
    });

    const filteredCandidates = hardFilteredCandidates.filter((candidate) => {
      if (
        canUseLanguageFilter &&
        body.preferredLanguage !== "any" &&
        candidate.language !== body.preferredLanguage
      ) {
        return false;
      }

      if (
        canUseCountryFilter &&
        body.preferredCountry !== "any" &&
        candidate.country !== body.preferredCountry
      ) {
        return false;
      }

      return true;
    });

    const pool = filteredCandidates.length
      ? filteredCandidates
      : hardFilteredCandidates;
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
      hardFilteredCandidates: hardFilteredCandidates.length,
      availablePool: availablePool.length,
      hasPeer: Boolean(peer),
      hasPrivateMatchSalt: Boolean(matchSalt),
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
          match_salt: matchSalt || null,
          preferred_language: canUseLanguageFilter
            ? body.preferredLanguage
            : "any",
          preferred_country: canUseCountryFilter ? body.preferredCountry : "any",
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
        hasPrivateMatchSalt: Boolean(matchSalt),
      });

      return NextResponse.json({
        status: "waiting",
        retryAfterMs: 1800,
        message: matchSalt
          ? "Sto cercando una persona con la stessa parola di sintonia."
          : "Sto cercando una persona disponibile.",
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
        plan_snapshot: planCode,
      })
      .select("id")
      .single();

    if (matchError || !match) {
      throw new Error(matchError?.message ?? "Creazione match fallita");
    }

    let peerClaimQuery = supabase
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
      .gte("last_seen_at", activeCutoff);

    peerClaimQuery = matchSalt
      ? peerClaimQuery.eq("match_salt", matchSalt)
      : peerClaimQuery.is("match_salt", null);

    const peerClaim = await peerClaimQuery
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
          match_salt: matchSalt || null,
          preferred_language: canUseLanguageFilter
            ? body.preferredLanguage
            : "any",
          preferred_country: canUseCountryFilter ? body.preferredCountry : "any",
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
        message: matchSalt
          ? "Sto cercando una persona con la stessa parola di sintonia."
          : "Sto cercando una persona disponibile.",
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
        planCode,
        dailyUsed,
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Matchmaking non riuscito";

    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 400 },
    );
  }
}
