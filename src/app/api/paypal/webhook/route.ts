import { NextRequest, NextResponse } from "next/server";
import { hashGa4Id, hasGa4ServerConfig, sendGa4PurchaseEvent } from "@/lib/ga4-server";
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

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function getStoredGa4ClientId(rawJson: unknown) {
  const raw = asRecord(rawJson);
  const ga4 = asRecord(raw.ga4);

  return typeof ga4.client_id === "string" ? ga4.client_id : null;
}

function hasSentGa4Purchase(rawJson: unknown) {
  const raw = asRecord(rawJson);
  const ga4 = asRecord(raw.ga4);

  return typeof ga4.purchase_sent_at === "string";
}

function mergeGa4RawJson(
  rawJson: unknown,
  ga4Patch: Record<string, unknown>,
) {
  const raw = asRecord(rawJson);
  const ga4 = asRecord(raw.ga4);

  return {
    ...raw,
    ga4: {
      ...ga4,
      ...ga4Patch,
    },
  };
}

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
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id,status,raw_json")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();
  const status = mapPayPalStatus(resource?.status);
  const nextBillingTime = resource?.billing_info?.next_billing_time ?? null;
  const existingRawJson = existingSubscription?.raw_json ?? {};
  const nextRawJson = {
    ...asRecord(existingRawJson),
    paypal_webhook: event,
  };

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
        raw_json: nextRawJson,
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
        raw_json: nextRawJson,
        updated_at: new Date().toISOString(),
      })
      .eq("paypal_subscription_id", subscriptionId);
  }

  const shouldSendPurchase =
    event.event_type === "BILLING.SUBSCRIPTION.ACTIVATED" &&
    status === "active" &&
    !hasSentGa4Purchase(existingRawJson);
  const ga4ClientId = getStoredGa4ClientId(existingRawJson);

  if (shouldSendPurchase && ga4ClientId && hasGa4ServerConfig()) {
    const transactionId = `paypal_${hashGa4Id(`${subscriptionId}:initial`)}`;

    try {
      await sendGa4PurchaseEvent({
        clientId: ga4ClientId,
        transactionSeed: `${subscriptionId}:initial`,
        value: Number(process.env.PREMIUM_MONTHLY_PRICE_EUR ?? 3.99),
      });

      await supabase
        .from("subscriptions")
        .update({
          raw_json: mergeGa4RawJson(nextRawJson, {
            purchase_sent_at: new Date().toISOString(),
            purchase_transaction_id: transactionId,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("paypal_subscription_id", subscriptionId);
    } catch (error) {
      console.error("GA4 purchase event failed", error);
      await supabase
        .from("subscriptions")
        .update({
          raw_json: mergeGa4RawJson(nextRawJson, {
            purchase_error_at: new Date().toISOString(),
            purchase_error:
              error instanceof Error ? error.message : "unknown_error",
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("paypal_subscription_id", subscriptionId);
    }
  }

  return NextResponse.json({ ok: true });
}
