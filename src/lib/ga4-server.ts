import crypto from "node:crypto";
import type { NextRequest } from "next/server";

type Ga4ParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<Record<string, string | number | boolean | null | undefined>>;

type Ga4Event = {
  name: string;
  params?: Record<string, Ga4ParamValue>;
};

const DEFAULT_GA4_ENDPOINT = "https://region1.google-analytics.com/mp/collect";

export function hasGa4ServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() &&
      process.env.GA4_API_SECRET?.trim(),
  );
}

export function extractGaClientIdFromRequest(request: NextRequest) {
  const gaCookie = request.cookies.get("_ga")?.value;

  if (!gaCookie) {
    return null;
  }

  const parts = gaCookie.split(".");

  if (parts.length >= 4 && /^GA\d+$/.test(parts[0])) {
    return `${parts[2]}.${parts[3]}`;
  }

  return /^\d+\.\d+$/.test(gaCookie) ? gaCookie : null;
}

export function hashGa4Id(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function pruneParams(params: Record<string, Ga4ParamValue> = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
  );
}

export async function sendGa4ServerEvents({
  clientId,
  events,
}: {
  clientId: string | null | undefined;
  events: Ga4Event[];
}) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const apiSecret = process.env.GA4_API_SECRET?.trim();

  if (!measurementId || !apiSecret || !clientId || events.length === 0) {
    return { sent: false, reason: "missing_config_or_client_id" };
  }

  const endpoint =
    process.env.GA4_MEASUREMENT_PROTOCOL_ENDPOINT?.trim() ?? DEFAULT_GA4_ENDPOINT;
  const url = new URL(endpoint);

  url.searchParams.set("measurement_id", measurementId);
  url.searchParams.set("api_secret", apiSecret);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      non_personalized_ads: true,
      events: events.map((event) => ({
        name: event.name,
        params: pruneParams(event.params),
      })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `GA4 Measurement Protocol failed: ${response.status} ${detail}`,
    );
  }

  return { sent: true, reason: "ok" };
}

export async function sendGa4PurchaseEvent({
  clientId,
  transactionSeed,
  value,
  currency = "EUR",
  subscriptionPeriod = "monthly",
}: {
  clientId: string | null | undefined;
  transactionSeed: string;
  value: number;
  currency?: string;
  subscriptionPeriod?: string;
}) {
  return sendGa4ServerEvents({
    clientId,
    events: [
      {
        name: "purchase",
        params: {
          affiliation: "paypal",
          currency,
          payment_provider: "paypal",
          subscription_period: subscriptionPeriod,
          transaction_id: `paypal_${hashGa4Id(transactionSeed)}`,
          value,
          items: [
            {
              item_id: "devroulotte_premium_monthly",
              item_name: "DevRoulotte Premium",
              item_category: "subscription",
              price: value,
              quantity: 1,
            },
          ],
        },
      },
    ],
  });
}
