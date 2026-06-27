import { APP_NAME } from "@/lib/app-config";

export function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function hasPayPalConfig() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      process.env.PAYPAL_PLAN_ID,
  );
}

export async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalSubscription(actorKey: string) {
  const planId = process.env.PAYPAL_PLAN_ID;

  if (!planId) {
    throw new Error("Missing PayPal plan id");
  }

  const accessToken = await getPayPalAccessToken();
  const returnUrl =
    process.env.PAYPAL_RETURN_URL ?? "http://localhost:3000/profile";
  const cancelUrl =
    process.env.PAYPAL_CANCEL_URL ?? "http://localhost:3000/?upgrade=cancelled";

  const response = await fetch(`${getPayPalBaseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "PayPal-Request-Id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: actorKey,
      application_context: {
        brand_name: APP_NAME,
        locale: "it-IT",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal subscription failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as {
    id: string;
    status: string;
    links?: Array<{ href: string; rel: string; method: string }>;
  };
}

export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string,
) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({ reason }),
    },
  );

  if (!response.ok && response.status !== 204) {
    const detail = await response.text();
    throw new Error(`PayPal cancellation failed: ${response.status} ${detail}`);
  }
}

export async function verifyPayPalWebhook(
  headers: Headers,
  webhookEvent: unknown,
) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    throw new Error("Missing PayPal webhook id");
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}
