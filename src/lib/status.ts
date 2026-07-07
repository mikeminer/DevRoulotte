import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";
import { getPayPalAccessToken } from "@/lib/paypal";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export type ServiceStatusTone = "ok" | "watch" | "degraded" | "down";

export type ServiceStatusCheck = {
  label: string;
  status: string;
  tone: ServiceStatusTone;
  latencyMs?: number;
  note?: string;
};

export type ServiceStatus = {
  id: string;
  name: string;
  status: string;
  note: string;
  tone: ServiceStatusTone;
  critical?: boolean;
  latencyMs?: number;
  checks?: ServiceStatusCheck[];
};

export type StatusPayload = {
  checkedAt: string;
  overall: {
    status: string;
    title: string;
    description: string;
    tone: ServiceStatusTone;
  };
  refreshSeconds: number;
  services: ServiceStatus[];
};

const STATUS_REFRESH_SECONDS = 60;
const STATUS_CHECK_TIMEOUT_MS = 5000;

type HealthCheckResult = {
  ok: boolean;
  status: string;
  note: string;
  tone: ServiceStatusTone;
  latencyMs?: number;
  checks?: ServiceStatusCheck[];
};

function getElapsedMs(startedAt: number) {
  return Math.max(0, Math.round(performance.now() - startedAt));
}

function getManualIncident() {
  const message = process.env.STATUS_INCIDENT_MESSAGE?.trim();

  if (!message) {
    return null;
  }

  const level = process.env.STATUS_INCIDENT_LEVEL?.trim().toLowerCase();
  const tone: ServiceStatusTone =
    level === "down" ||
    level === "degraded" ||
    level === "watch" ||
    level === "ok"
      ? level
      : "degraded";

  return {
    tone,
    message,
    status:
      tone === "down"
        ? "Down"
        : tone === "watch"
          ? "In osservazione"
          : tone === "ok"
            ? "Risolto"
            : "Degradato",
  };
}

function getServiceTone(checks: ServiceStatusCheck[]): ServiceStatusTone {
  if (checks.some((check) => check.tone === "down")) {
    return "down";
  }

  if (checks.some((check) => check.tone === "degraded")) {
    return "degraded";
  }

  if (checks.some((check) => check.tone === "watch")) {
    return "watch";
  }

  return "ok";
}

function getServiceLatency(checks: ServiceStatusCheck[]) {
  const latencies = checks
    .map((check) => check.latencyMs)
    .filter((latency): latency is number => typeof latency === "number");

  return latencies.length ? Math.max(...latencies) : undefined;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Timeout dopo ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function hasCloudflareTurnConfig() {
  return Boolean(
    process.env.CLOUDFLARE_TURN_KEY_ID?.trim() &&
      process.env.CLOUDFLARE_TURN_API_TOKEN?.trim(),
  );
}

function hasGa4RealtimeConfig() {
  return Boolean(
    process.env.GA4_PROPERTY_ID?.trim() &&
      (process.env.GA4_SERVICE_ACCOUNT_JSON_BASE64?.trim() ||
        process.env.GA4_SERVICE_ACCOUNT_JSON?.trim() ||
        (process.env.GA4_CLIENT_EMAIL?.trim() &&
          process.env.GA4_PRIVATE_KEY?.trim())),
  );
}

function getMissingConfigResult(note: string): HealthCheckResult {
  return {
    ok: false,
    status: "Non configurato",
    note,
    tone: "down",
  };
}

async function checkSupabaseTable(
  table: string,
  label: string,
  column = "id",
): Promise<ServiceStatusCheck> {
  const startedAt = performance.now();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from(table)
      .select(column, { count: "exact", head: true })
      .limit(1);

    const latencyMs = getElapsedMs(startedAt);

    if (error) {
      throw new Error(error.message);
    }

    return {
      label,
      status: "OK",
      tone: "ok",
      latencyMs,
    };
  } catch (error) {
    return {
      label,
      status: "Errore",
      tone: "degraded",
      latencyMs: getElapsedMs(startedAt),
      note:
        error instanceof Error && error.message
          ? error.message
          : "Check fallito",
    };
  }
}

async function checkSupabaseTables(
  tables: Array<{ table: string; label: string; column?: string }>,
  okNote: string,
  degradedNote: string,
): Promise<HealthCheckResult> {
  if (!hasSupabaseServerConfig()) {
    return getMissingConfigResult("Configurazione server Supabase assente.");
  }

  const checks = await Promise.all(
    tables.map(({ table, label, column }) =>
      checkSupabaseTable(table, label, column),
    ),
  );
  const tone = getServiceTone(checks);
  const ok = tone === "ok" || tone === "watch";

  return {
    ok,
    status: ok ? "Operativo" : "Degradato",
    note: ok ? okNote : degradedNote,
    tone,
    latencyMs: getServiceLatency(checks),
    checks,
  };
}

async function checkTurnHealth(): Promise<HealthCheckResult> {
  if (!hasCloudflareTurnConfig()) {
    return {
      ok: true,
      status: "STUN-only",
      note: "STUN gratuito disponibile; TURN Cloudflare non risulta configurato nelle env runtime.",
      tone: "watch",
    };
  }

  const startedAt = performance.now();
  const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
  const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;

  try {
    const response = await fetchWithTimeout(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 60 }),
      },
      STATUS_CHECK_TIMEOUT_MS,
    );

    const latencyMs = getElapsedMs(startedAt);

    if (!response.ok) {
      throw new Error(`Cloudflare TURN ${response.status}`);
    }

    const data = (await response.json()) as {
      iceServers?: Array<{ urls?: string | string[] }>;
    };
    const hasTurnServer = Boolean(
      data.iceServers?.some((server) => {
        const urls = Array.isArray(server.urls)
          ? server.urls
          : [server.urls ?? ""];

        return urls.some((url) => url.startsWith("turn:"));
      }),
    );

    return {
      ok: hasTurnServer,
      status: hasTurnServer ? "TURN operativo" : "STUN-only",
      note: hasTurnServer
        ? "Cloudflare TURN genera credenziali temporanee correttamente."
        : "Cloudflare ha risposto, ma non ha restituito server TURN.",
      tone: hasTurnServer ? "ok" : "watch",
      latencyMs,
      checks: [
        {
          label: "Generazione credenziali TURN",
          status: hasTurnServer ? "OK" : "Senza TURN",
          tone: hasTurnServer ? "ok" : "watch",
          latencyMs,
        },
      ],
    };
  } catch (error) {
    console.error("Status TURN health check failed", error);

    return {
      ok: false,
      status: "Degradato",
      note: "Cloudflare TURN non ha generato credenziali temporanee; WebRTC puo' ricadere su STUN.",
      tone: "degraded",
      latencyMs: getElapsedMs(startedAt),
      checks: [
        {
          label: "Generazione credenziali TURN",
          status: "Errore",
          tone: "degraded",
          latencyMs: getElapsedMs(startedAt),
          note: error instanceof Error ? error.message : "Check fallito",
        },
      ],
    };
  }
}

async function checkPayPalHealth(): Promise<HealthCheckResult> {
  const hasOAuthConfig = Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim(),
  );
  const hasPlan = Boolean(process.env.PAYPAL_PLAN_ID?.trim());

  if (!hasOAuthConfig) {
    return {
      ok: false,
      status: "Non configurato",
      note: "Credenziali PayPal assenti: upgrade Premium non disponibile.",
      tone: "degraded",
    };
  }

  const startedAt = performance.now();

  try {
    await withTimeout(getPayPalAccessToken(), STATUS_CHECK_TIMEOUT_MS);

    const latencyMs = getElapsedMs(startedAt);
    const checks: ServiceStatusCheck[] = [
      {
        label: "OAuth PayPal",
        status: "OK",
        tone: "ok",
        latencyMs,
      },
      {
        label: "Piano Premium",
        status: hasPlan ? "Configurato" : "Manca plan id",
        tone: hasPlan ? "ok" : "degraded",
      },
    ];
    const tone = getServiceTone(checks);

    return {
      ok: hasPlan,
      status: hasPlan ? "Operativo" : "Degradato",
      note: hasPlan
        ? "PayPal risponde e il piano Premium risulta configurato."
        : "PayPal risponde, ma manca il piano Premium nelle env runtime.",
      tone,
      latencyMs,
      checks,
    };
  } catch (error) {
    console.error("Status PayPal health check failed", error);

    return {
      ok: false,
      status: "Degradato",
      note: "PayPal OAuth non raggiungibile: upgrade Premium puo' non partire.",
      tone: "degraded",
      latencyMs: getElapsedMs(startedAt),
      checks: [
        {
          label: "OAuth PayPal",
          status: "Errore",
          tone: "degraded",
          latencyMs: getElapsedMs(startedAt),
          note: error instanceof Error ? error.message : "Check fallito",
        },
      ],
    };
  }
}

export async function getStatusPayload(): Promise<StatusPayload> {
  const checkedAt = new Date().toISOString();
  const [database, matching, turn, payments] = await Promise.all([
    checkSupabaseTables(
      [
        { table: "profiles", label: "Profili" },
        { table: "subscriptions", label: "Stato Premium" },
      ],
      "Database profili e abbonamenti raggiungibile.",
      "Health check database fallito. Login, profili o stato Premium possono essere instabili.",
    ),
    checkSupabaseTables(
      [
        { table: "match_queue", label: "Coda matchmaking" },
        { table: "webrtc_signals", label: "Signaling WebRTC" },
        { table: "chat_presence", label: "Presenza live", column: "actor_type" },
      ],
      "Coda match, signaling WebRTC e presenza live raggiungibili.",
      "Matchmaking, signaling o presenza live non risultano pienamente operativi.",
    ),
    checkTurnHealth(),
    checkPayPalHealth(),
  ]);
  const ga4Configured = hasGa4RealtimeConfig();
  const manualIncident = getManualIncident();

  const services: ServiceStatus[] = [
    ...(manualIncident
      ? [
          {
            id: "incident",
            name: "Avviso operativo",
            status: manualIncident.status,
            note: manualIncident.message,
            tone: manualIncident.tone,
            critical:
              manualIncident.tone === "down" ||
              manualIncident.tone === "degraded",
          },
        ]
      : []),
    {
      id: "web",
      name: "Web app e landing",
      status: "Operativo",
      note: "Questa pagina e le route pubbliche sono servite da Vercel.",
      tone: "ok",
      critical: true,
    },
    {
      id: "supabase",
      name: "Login, profili e database",
      status: database.status,
      note: database.note,
      tone: database.tone,
      critical: true,
      latencyMs: database.latencyMs,
      checks: database.checks,
    },
    {
      id: "matching",
      name: "Matchmaking e signaling",
      status: matching.status,
      note: matching.note,
      tone: matching.tone,
      critical: true,
      latencyMs: matching.latencyMs,
      checks: matching.checks,
    },
    {
      id: "webrtc",
      name: "WebRTC STUN/TURN",
      status: turn.status,
      note: turn.note,
      tone: turn.tone,
      latencyMs: turn.latencyMs,
      checks: turn.checks,
    },
    {
      id: "payments",
      name: "Pagamenti Premium",
      status: payments.status,
      note: payments.note,
      tone: payments.tone,
      critical: true,
      latencyMs: payments.latencyMs,
      checks: payments.checks,
    },
    {
      id: "analytics",
      name: "Analytics e contatori live",
      status: ga4Configured ? "Configurato" : "Non critico",
      note: ga4Configured
        ? "GA4 Realtime risulta configurato per contatori aggregati."
        : "Metriche aggregate non critiche o non configurate; il servizio principale resta utilizzabile.",
      tone: ga4Configured ? "ok" : "watch",
    },
    {
      id: "email",
      name: "Email transazionali",
      status: "Monitorato",
      note: "Invio email gestito da Supabase/SMTP. Non esiste un health check pubblico senza inviare email reali.",
      tone: "watch",
    },
  ];

  const hasCriticalIssue = services.some(
    (service) =>
      service.critical &&
      (service.tone === "degraded" || service.tone === "down"),
  );

  const overall = MAINTENANCE_MODE
    ? {
        status: "Manutenzione",
        title: "Manutenzione programmata o intervento tecnico",
        description: MAINTENANCE_MESSAGE,
        tone: "degraded" as const,
      }
    : manualIncident &&
        (manualIncident.tone === "down" ||
          manualIncident.tone === "degraded" ||
          manualIncident.tone === "watch")
      ? {
          status: manualIncident.status,
          title: "Avviso operativo dichiarato",
          description: manualIncident.message,
          tone: manualIncident.tone,
        }
    : hasCriticalIssue
      ? {
          status: "Degradato",
          title: "Alcuni servizi richiedono attenzione",
          description:
            "Uno o piu' servizi critici non risultano pienamente operativi. La pagina si aggiorna automaticamente.",
          tone: "degraded" as const,
        }
      : {
          status: "Operativo",
          title: "Nessun incidente critico dichiarato",
          description:
            "I servizi principali sono disponibili. Il servizio di videocall e' operativo e viene monitorato insieme a matchmaking, signaling e infrastruttura WebRTC.",
          tone: "ok" as const,
        };

  return {
    checkedAt,
    overall,
    refreshSeconds: STATUS_REFRESH_SECONDS,
    services,
  };
}
