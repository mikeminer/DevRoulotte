import crypto from "node:crypto";

type PostHogParamValue = string | number | boolean | null | undefined;

const DEFAULT_POSTHOG_HOST = "https://eu.i.posthog.com";
const DEFAULT_POSTHOG_REVENUE_EVENT_NAME = "purchase_completed";

function getPostHogHost() {
  const host = process.env.POSTHOG_HOST?.trim();

  return host ? host.replace(/\/$/, "") : DEFAULT_POSTHOG_HOST;
}

function getPostHogRevenueEventName() {
  return (
    process.env.POSTHOG_REVENUE_EVENT_NAME?.trim() ||
    DEFAULT_POSTHOG_REVENUE_EVENT_NAME
  );
}

function pruneProperties(params: Record<string, PostHogParamValue> = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
  );
}

export function hasPostHogServerConfig() {
  return Boolean(process.env.POSTHOG_PROJECT_API_KEY?.trim());
}

export function hashPostHogId(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function toMinorCurrencyUnit(value: number, currency: string) {
  const zeroDecimalCurrencies = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "UGX",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ]);

  return zeroDecimalCurrencies.has(currency.toUpperCase())
    ? Math.round(value)
    : Math.round(value * 100);
}

async function sendPostHogServerEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string;
  event: string;
  properties: Record<string, PostHogParamValue>;
}) {
  const token = process.env.POSTHOG_PROJECT_API_KEY?.trim();

  if (!token) {
    return { sent: false, reason: "missing_config" };
  }

  const response = await fetch(`${getPostHogHost()}/i/v0/e/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      event,
      distinct_id: distinctId,
      timestamp: new Date().toISOString(),
      properties: pruneProperties({
        ...properties,
        $lib: "devroulotte-server",
        $lib_version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12),
      }),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`PostHog capture failed: ${response.status} ${detail}`);
  }

  return { sent: true, reason: "ok" };
}

export async function sendPostHogPurchaseEvent({
  subscriptionSeed,
  transactionSeed,
  value,
  currency = "EUR",
  subscriptionPeriod = "monthly",
}: {
  subscriptionSeed: string;
  transactionSeed: string;
  value: number;
  currency?: string;
  subscriptionPeriod?: string;
}) {
  const normalizedCurrency = currency.toUpperCase();
  const transactionId = `paypal_${hashPostHogId(transactionSeed)}`;
  const subscriptionId = `paypal_${hashPostHogId(subscriptionSeed)}`;

  await sendPostHogServerEvent({
    distinctId: `subscription_${subscriptionId}`,
    event: getPostHogRevenueEventName(),
    properties: {
      currency: normalizedCurrency,
      payment_provider: "paypal",
      product: "DevRoulotte Premium",
      revenue: toMinorCurrencyUnit(value, normalizedCurrency),
      revenue_decimal: value,
      subscription_id: subscriptionId,
      subscription_period: subscriptionPeriod,
      transaction_id: transactionId,
      value,
    },
  });

  return {
    sent: true,
    subscriptionId,
    transactionId,
  };
}
