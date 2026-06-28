import { NextRequest, NextResponse } from "next/server";
import {
  FREE_DAILY_MATCH_LIMIT,
  NEXT_COOLDOWN_SECONDS,
} from "@/lib/app-config";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { ProfileStatus, SubscriptionStatus } from "@/lib/types";

export const runtime = "nodejs";

async function getFreeUsage(actorType: string, actorId: string) {
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
      .eq(typeColumn, actorType)
      .eq(idColumn, actorId);

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

async function getSubscriptionStatus(
  actorType: string,
  actorId: string,
): Promise<SubscriptionStatus> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("subscriptions")
    .select("status,current_period_end,trial_ends_at")
    .eq("actor_type", actorType)
    .eq("actor_id", actorId)
    .in("status", ["trialing", "active"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    return "none";
  }

  return data.status as SubscriptionStatus;
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { status: "configuration_error", message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const [freeDailyUsed, subscriptionStatus] = await Promise.all([
      getFreeUsage(actor.type, actor.id),
      getSubscriptionStatus(actor.type, actor.id),
    ]);

    const isPremium =
      subscriptionStatus === "active" || subscriptionStatus === "trialing";

    const payload: ProfileStatus = {
      actor,
      isPremium,
      subscriptionStatus,
      freeDailyLimit: FREE_DAILY_MATCH_LIMIT,
      freeDailyUsed,
      freeDailyRemaining: Math.max(FREE_DAILY_MATCH_LIMIT - freeDailyUsed, 0),
      nextCooldownSeconds: NEXT_COOLDOWN_SECONDS,
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Errore profilo",
      },
      { status: 401 },
    );
  }
}
