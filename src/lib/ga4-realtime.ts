import crypto from "node:crypto";
import { CHAT_SCREEN_NAME } from "@/lib/analytics-events";

export type Ga4RealtimeScope = "site" | "chat";

export type Ga4RealtimeResult = {
  activeUsers: number | null;
  configured: boolean;
  scope: Ga4RealtimeScope;
  source: "google_analytics";
  status: "ok" | "not_configured" | "unavailable";
  updatedAt: string;
  windowMinutes: number;
};

type ServiceAccountCredentials = {
  clientEmail: string;
  privateKey: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

type Ga4MetricValue = {
  value?: string;
};

type Ga4DimensionValue = {
  value?: string;
};

type Ga4Row = {
  dimensionValues?: Ga4DimensionValue[];
  metricValues?: Ga4MetricValue[];
};

type Ga4RealtimeResponse = {
  rows?: Ga4Row[];
  totals?: Array<{
    metricValues?: Ga4MetricValue[];
  }>;
};

const GA4_REALTIME_ENDPOINT = "https://analyticsdata.googleapis.com/v1beta";
const GOOGLE_OAUTH_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ANALYTICS_READONLY_SCOPE =
  "https://www.googleapis.com/auth/analytics.readonly";
const SITE_REALTIME_WINDOW_MINUTES = 30;
const CHAT_REALTIME_WINDOW_MINUTES = 1;

let tokenCache: TokenCache | null = null;

export function getGa4RealtimeWindowMinutes(scope: Ga4RealtimeScope) {
  return scope === "chat"
    ? CHAT_REALTIME_WINDOW_MINUTES
    : SITE_REALTIME_WINDOW_MINUTES;
}

function buildMinuteRange(windowMinutes: number) {
  return {
    name: `last${windowMinutes}${windowMinutes === 1 ? "Minute" : "Minutes"}`,
    startMinutesAgo: Math.max(windowMinutes - 1, 0),
    endMinutesAgo: 0,
  };
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function normalizePropertyId(value: string) {
  return value.trim().replace(/^properties\//, "");
}

function parseServiceAccountJson(rawJson: string): ServiceAccountCredentials | null {
  try {
    const parsed = JSON.parse(rawJson) as {
      client_email?: unknown;
      private_key?: unknown;
    };

    if (
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    ) {
      return null;
    }

    return {
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const json = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();

  if (json) {
    return parseServiceAccountJson(json);
  }

  const jsonBase64 = process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64?.trim();

  if (jsonBase64) {
    try {
      const decoded = Buffer.from(jsonBase64, "base64").toString("utf8");
      return parseServiceAccountJson(decoded);
    } catch {
      return null;
    }
  }

  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA4_PRIVATE_KEY?.trim();

  if (!clientEmail || !privateKey) {
    return null;
  }

  return {
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

export function hasGa4RealtimeConfig() {
  return Boolean(
    process.env.GA4_PROPERTY_ID?.trim() && getServiceAccountCredentials(),
  );
}

async function getGa4AccessToken() {
  const now = Math.floor(Date.now() / 1000);

  if (tokenCache && tokenCache.expiresAt - 60 > now) {
    return tokenCache.accessToken;
  }

  const credentials = getServiceAccountCredentials();

  if (!credentials) {
    throw new Error("Missing GA4 service account credentials");
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claimSet = {
    iss: credentials.clientEmail,
    scope: ANALYTICS_READONLY_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_ENDPOINT,
    exp: now + 3600,
    iat: now,
  };
  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claimSet),
  )}`;

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsignedJwt)
    .sign(credentials.privateKey);
  const assertion = `${unsignedJwt}.${base64UrlEncode(signature)}`;

  const response = await fetch(GOOGLE_OAUTH_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GA4 OAuth token failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    access_token?: unknown;
    expires_in?: unknown;
  };

  if (typeof data.access_token !== "string") {
    throw new Error("GA4 OAuth token response did not include access_token");
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt:
      now + (typeof data.expires_in === "number" ? data.expires_in : 3600),
  };

  return tokenCache.accessToken;
}

function parseActiveUsers(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function sumMatchingRows(
  response: Ga4RealtimeResponse,
  expectedDimensionValue: string,
) {
  return (response.rows ?? []).reduce((total, row) => {
    const dimensionValue = row.dimensionValues?.[0]?.value ?? "";

    if (dimensionValue !== expectedDimensionValue) {
      return total;
    }

    return total + parseActiveUsers(row.metricValues?.[0]?.value);
  }, 0);
}

function readTotalActiveUsers(response: Ga4RealtimeResponse) {
  const total = response.totals?.[0]?.metricValues?.[0]?.value;

  if (total !== undefined) {
    return parseActiveUsers(total);
  }

  return (response.rows ?? []).reduce(
    (sum, row) => sum + parseActiveUsers(row.metricValues?.[0]?.value),
    0,
  );
}

async function runRealtimeReport({
  accessToken,
  propertyId,
  scope,
}: {
  accessToken: string;
  propertyId: string;
  scope: Ga4RealtimeScope;
}) {
  const minuteRange = buildMinuteRange(getGa4RealtimeWindowMinutes(scope));
  const body =
    scope === "chat"
      ? {
          dimensionFilter: {
            filter: {
              fieldName: "unifiedScreenName",
              stringFilter: {
                caseSensitive: true,
                matchType: "EXACT",
                value: CHAT_SCREEN_NAME,
              },
            },
          },
          dimensions: [{ name: "unifiedScreenName" }],
          limit: "1000",
          metricAggregations: ["TOTAL"],
          metrics: [{ name: "activeUsers" }],
          minuteRanges: [minuteRange],
        }
      : {
          metricAggregations: ["TOTAL"],
          metrics: [{ name: "activeUsers" }],
          minuteRanges: [minuteRange],
        };

  const response = await fetch(
    `${GA4_REALTIME_ENDPOINT}/properties/${propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GA4 realtime report failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as Ga4RealtimeResponse;
}

export async function getGa4RealtimeUsers(
  scope: Ga4RealtimeScope,
): Promise<Ga4RealtimeResult> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const updatedAt = new Date().toISOString();
  const windowMinutes = getGa4RealtimeWindowMinutes(scope);

  if (!propertyId || !getServiceAccountCredentials()) {
    return {
      activeUsers: null,
      configured: false,
      scope,
      source: "google_analytics",
      status: "not_configured",
      updatedAt,
      windowMinutes,
    };
  }

  const accessToken = await getGa4AccessToken();
  const response = await runRealtimeReport({
    accessToken,
    propertyId: normalizePropertyId(propertyId),
    scope,
  });

  return {
    activeUsers:
      scope === "chat"
        ? readTotalActiveUsers(response) ||
          sumMatchingRows(response, CHAT_SCREEN_NAME)
        : readTotalActiveUsers(response),
    configured: true,
    scope,
    source: "google_analytics",
    status: "ok",
    updatedAt,
    windowMinutes,
  };
}
