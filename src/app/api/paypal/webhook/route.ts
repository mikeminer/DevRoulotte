import { NextRequest, NextResponse } from "next/server";
import { verifyPayPalWebhook } from "@/lib/paypal";
import { parseActorKey } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type PayPalWebhookEvent = {
  id?: string;
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    custom_id?: string;
    plan_id?: string;
    billing_info?: {
      next_billing_time?: string;
    };
  };
};

function mapPayPalStatus(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "APPROVAL_PENDING":
      return "approval_pending";
    case "SUSPENDED":
      return "suspended";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "expired";
    default:
      return "none";
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({ ok: true });
  }

  const rawBody = await request.text();
  const event = JSON.parse(rawBody) as PayPalWebhookEvent;

  const verified = await verifyPayPalWebhook(request.headers, event);

  if (!verified) {
    return NextResponse.json(
      { ok: false, message: "Webhook PayPal non verificato" },
      { status: 401 },
    );
  }

  const resource = event.resource;
  const subscriptionId = resource?.id;
  const customId = resource?.custom_id;

  if (!subscriptionId) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  const status = mapPayPalStatus(resource?.status);
  const nextBillingTime = resource?.billing_info?.next_billing_time ?? null;

  if (customId) {
    const actor = parseActorKey(customId);

    await supabase.from("subscriptions").upsert(
      {
        actor_type: actor.type,
        actor_id: actor.id,
        paypal_subscription_id: subscriptionId,
        paypal_plan_id: resource?.plan_id ?? process.env.PAYPAL_PLAN_ID,
        status,
        current_period_end: nextBillingTime,
        raw_json: event,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paypal_subscription_id" },
    );
  } else {
    await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_end: nextBillingTime,
        raw_json: event,
        updated_at: new Date().toISOString(),
      })
      .eq("paypal_subscription_id", subscriptionId);
  }

  return NextResponse.json({ ok: true });
}
