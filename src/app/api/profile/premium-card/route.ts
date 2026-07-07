import { NextRequest, NextResponse } from "next/server";
import {
  emptyPremiumCard,
  normalizePremiumCard,
  premiumCardFromRow,
  premiumCardSelect,
  premiumCardToRow,
  type PremiumCardRow,
} from "@/lib/premium-card";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

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

    if (actor.type !== "user") {
      return NextResponse.json(
        { ok: false, message: "Serve un account registrato" },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const [isPremium, cardResult] = await Promise.all([
      isActivePremiumUser(actor.id),
      supabase
        .from("premium_cards")
        .select(premiumCardSelect)
        .eq("user_id", actor.id)
        .maybeSingle<PremiumCardRow>(),
    ]);

    if (cardResult.error) {
      throw new Error(cardResult.error.message);
    }

    return NextResponse.json({
      ok: true,
      isPremium,
      card: cardResult.data
        ? premiumCardFromRow(cardResult.data)
        : emptyPremiumCard,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Premium Card non disponibile",
      },
      { status: 400 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);

    if (actor.type !== "user") {
      return NextResponse.json(
        { ok: false, message: "Serve un account registrato" },
        { status: 401 },
      );
    }

    if (!(await isActivePremiumUser(actor.id))) {
      return NextResponse.json(
        { ok: false, message: "La Premium Card e' riservata agli utenti Premium" },
        { status: 403 },
      );
    }

    const card = normalizePremiumCard(await request.json());
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("premium_cards")
      .upsert(premiumCardToRow(actor.id, card), {
        onConflict: "user_id",
      })
      .select(premiumCardSelect)
      .single<PremiumCardRow>();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      card: premiumCardFromRow(data),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Premium Card non salvata",
      },
      { status: 400 },
    );
  }
}
