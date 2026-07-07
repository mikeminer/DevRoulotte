import { NextRequest, NextResponse } from "next/server";
import {
  hasVisiblePremiumCardContent,
  premiumCardFromRow,
  premiumCardSelect,
  type PremiumCardRow,
} from "@/lib/premium-card";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { ActorType } from "@/lib/types";

export const runtime = "nodejs";

type MatchParticipantRow = {
  id: string;
  actor_a_type: ActorType;
  actor_a_id: string;
  actor_b_type: ActorType;
  actor_b_id: string;
  status: "active" | "ended" | "failed";
};

async function isActivePremiumUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("actor_type", "user")
    .eq("actor_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const matchId = request.nextUrl.searchParams.get("matchId")?.trim();

    if (!matchId) {
      return NextResponse.json(
        { ok: false, message: "Match mancante" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: match, error: matchError } = await supabase
      .from("match_logs")
      .select("id,actor_a_type,actor_a_id,actor_b_type,actor_b_id,status")
      .eq("id", matchId)
      .maybeSingle<MatchParticipantRow>();

    if (matchError) {
      throw new Error(matchError.message);
    }

    if (!match || match.status !== "active") {
      return NextResponse.json(
        { ok: false, message: "Match non attivo" },
        { status: 404 },
      );
    }

    const isActorA =
      match.actor_a_type === actor.type && match.actor_a_id === actor.id;
    const isActorB =
      match.actor_b_type === actor.type && match.actor_b_id === actor.id;

    if (!isActorA && !isActorB) {
      return NextResponse.json(
        { ok: false, message: "Non autorizzato su questo match" },
        { status: 403 },
      );
    }

    const peer = isActorA
      ? { type: match.actor_b_type, id: match.actor_b_id }
      : { type: match.actor_a_type, id: match.actor_a_id };

    if (peer.type !== "user" || !(await isActivePremiumUser(peer.id))) {
      return NextResponse.json({ ok: true, card: null });
    }

    const { data: row, error: cardError } = await supabase
      .from("premium_cards")
      .select(premiumCardSelect)
      .eq("user_id", peer.id)
      .eq("share_in_calls", true)
      .maybeSingle<PremiumCardRow>();

    if (cardError) {
      throw new Error(cardError.message);
    }

    if (!row) {
      return NextResponse.json({ ok: true, card: null });
    }

    const card = premiumCardFromRow(row);

    return NextResponse.json({
      ok: true,
      card: hasVisiblePremiumCardContent(card) ? card : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Premium Card del peer non disponibile",
      },
      { status: 400 },
    );
  }
}
