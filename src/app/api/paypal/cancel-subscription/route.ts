import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  cancelPayPalSubscription,
  hasPayPalConfig,
} from "@/lib/paypal";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import type { Actor } from "@/lib/types";

export const runtime = "nodejs";

const cancelSchema = z.object({
  reason: z.string().min(2).max(200).default("Cancelled from DevRoulotte"),
});

async function readCancelBody(request: NextRequest) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody) as unknown;
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  if (!hasPayPalConfig()) {
    return NextResponse.json(
      { ok: false, message: "PayPal non configurato" },
      { status: 503 },
    );
  }

  try {
    let actor: Actor;

    try {
      actor = await getRequestActor(request);
    } catch {
      return NextResponse.json(
        { ok: false, message: "Accedi per gestire Premium." },
        { status: 401 },
      );
    }

    if (actor.type !== "user") {
      return NextResponse.json(
        { ok: false, message: "Accedi per gestire Premium." },
        { status: 401 },
      );
    }

    const body = cancelSchema.parse(await readCancelBody(request));
    const supabase = getSupabaseAdmin();
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("id,paypal_subscription_id,status,raw_json")
      .eq("actor_type", actor.type)
      .eq("actor_id", actor.id)
      .in("status", ["approval_pending", "active", "suspended"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!subscription?.paypal_subscription_id) {
      return NextResponse.json(
        { ok: false, message: "Nessun abbonamento Premium attivo." },
        { status: 404 },
      );
    }

    await cancelPayPalSubscription(
      subscription.paypal_subscription_id,
      body.reason,
    );

    const existingRaw =
      subscription.raw_json && typeof subscription.raw_json === "object"
        ? subscription.raw_json
        : {};

    await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: false,
        raw_json: {
          ...existingRaw,
          local_cancellation: {
            reason: body.reason,
            previous_status: subscription.status,
            cancelled_at: new Date().toISOString(),
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Cancellazione Premium fallita",
      },
      { status: 400 },
    );
  }
}
