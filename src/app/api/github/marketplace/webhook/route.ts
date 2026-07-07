import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GitHubMarketplacePayload = {
  action?: string;
  marketplace_purchase?: {
    account?: {
      id?: number;
      login?: string;
      type?: string;
    };
    plan?: {
      id?: number;
      name?: string;
    };
  };
};

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")}`;
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function parsePayload(rawBody: string) {
  try {
    return JSON.parse(rawBody) as GitHubMarketplacePayload;
  } catch {
    return null;
  }
}

function logWebhookEvent(
  event: string,
  delivery: string,
  payload: GitHubMarketplacePayload | null,
  ignored = false,
) {
  console.info(
    JSON.stringify({
      scope: "github_marketplace_webhook",
      event,
      delivery,
      ignored,
      action: payload?.action ?? null,
      account: payload?.marketplace_purchase?.account?.login ?? null,
      account_type: payload?.marketplace_purchase?.account?.type ?? null,
      plan: payload?.marketplace_purchase?.plan?.name ?? null,
    }),
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_MARKETPLACE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        message: "GitHub Marketplace webhook secret not configured.",
      },
      { status: 503, headers: noStoreHeaders },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid GitHub webhook signature.",
      },
      { status: 401, headers: noStoreHeaders },
    );
  }

  const event = request.headers.get("x-github-event") ?? "unknown";
  const delivery = request.headers.get("x-github-delivery") ?? "unknown";
  const payload = parsePayload(rawBody);

  if (event === "ping") {
    logWebhookEvent(event, delivery, payload);
    return NextResponse.json({ ok: true, event }, { headers: noStoreHeaders });
  }

  if (event === "marketplace_purchase") {
    logWebhookEvent(event, delivery, payload);
    return NextResponse.json({ ok: true, event }, { headers: noStoreHeaders });
  }

  logWebhookEvent(event, delivery, payload, true);
  return NextResponse.json(
    {
      ok: true,
      event,
      ignored: true,
    },
    { headers: noStoreHeaders },
  );
}
