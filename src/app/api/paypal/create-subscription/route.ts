import { NextRequest, NextResponse } from "next/server";
import { createPayPalSubscription, hasPayPalConfig } from "@/lib/paypal";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { Actor } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  if (!hasPayPalConfig()) {
    return NextResponse.json(
      {
        ok: false,
        message: "PayPal non configurato. Inserisci le variabili nel .env.",
      },
      { status: 503 },
    );
  }

  try {
    let actor: Actor;

    try {
      actor = await getRequestActor(request);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Accedi o registrati per attivare Premium.",
        },
        { status: 401 },
      );
    }

    if (actor.type !== "user") {
      return NextResponse.json(
        {
          ok: false,
          message: "Accedi o registrati per attivare Premium.",
        },
        { status: 401 },
      );
    }

    const subscription = await createPayPalSubscription(actor.key);
    const approvalUrl = subscription.links?.find(
      (link) => link.rel === "approve",
    )?.href;

    await getSupabaseAdmin().from("subscriptions").upsert(
      {
        actor_type: actor.type,
        actor_id: actor.id,
        paypal_subscription_id: subscription.id,
        paypal_plan_id: process.env.PAYPAL_PLAN_ID,
        status: "approval_pending",
        raw_json: subscription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paypal_subscription_id" },
    );

    return NextResponse.json({
      ok: true,
      subscriptionId: subscription.id,
      approvalUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Creazione abbonamento fallita",
      },
      { status: 400 },
    );
  }
}
