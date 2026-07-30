import type {
  ServiceStatusCheck,
  ServiceStatusTone,
  StatusHistoryPoint,
  StatusPayload,
} from "@/lib/status";

const ELASTIC_TIMEOUT_MS = 2500;
const DEFAULT_INDEX_PATTERN = "devroulotte-logs-*";

type ElasticSearchResponse = {
  hits?: {
    hits?: Array<{
      _source?: {
        "@timestamp"?: string;
        status?: {
          overall?: {
            tone?: ServiceStatusTone;
          };
        };
      };
    }>;
  };
};

export type ElasticObservabilityResult = {
  configured: boolean;
  status: string;
  note: string;
  tone: ServiceStatusTone;
  latencyMs?: number;
  checks?: ServiceStatusCheck[];
  history: StatusHistoryPoint[];
};

function getElasticConfig() {
  const url = process.env.ELASTICSEARCH_URL?.trim().replace(/\/+$/, "");
  const apiKey = process.env.ELASTICSEARCH_API_KEY?.trim();
  const username = process.env.ELASTICSEARCH_USERNAME?.trim();
  const password = process.env.ELASTICSEARCH_PASSWORD?.trim();

  return {
    url,
    apiKey,
    username,
    password,
    index:
      process.env.ELASTICSEARCH_INDEX?.trim() || DEFAULT_INDEX_PATTERN,
  };
}

function getElasticHeaders(config: ReturnType<typeof getElasticConfig>) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    headers.Authorization = `ApiKey ${config.apiKey}`;
  } else if (config.username && config.password) {
    headers.Authorization = `Basic ${Buffer.from(
      `${config.username}:${config.password}`,
    ).toString("base64")}`;
  }

  return headers;
}

function isStatusTone(value: unknown): value is ServiceStatusTone {
  return (
    value === "ok" ||
    value === "watch" ||
    value === "degraded" ||
    value === "down"
  );
}

function parseHistory(data: ElasticSearchResponse): StatusHistoryPoint[] {
  return (data.hits?.hits ?? []).flatMap((hit) => {
    const checkedAt = hit._source?.["@timestamp"];
    const tone = hit._source?.status?.overall?.tone;

    if (!checkedAt || !isStatusTone(tone)) {
      return [];
    }

    return [{ checkedAt, tone }];
  });
}

export async function getElasticObservability(): Promise<ElasticObservabilityResult> {
  const config = getElasticConfig();

  if (!config.url) {
    return {
      configured: false,
      status: "Predisposto",
      note: "Lo storico Elastic non e' collegato; i controlli live restano attivi.",
      tone: "watch",
      history: [],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ELASTIC_TIMEOUT_MS);
  const startedAt = performance.now();

  try {
    const response = await fetch(
      `${config.url}/${encodeURIComponent(config.index)}/_search`,
      {
        method: "POST",
        headers: getElasticHeaders(config),
        body: JSON.stringify({
          size: 120,
          track_total_hits: false,
          _source: ["@timestamp", "status.overall.tone"],
          query: {
            bool: {
              filter: [
                { term: { "event.dataset": "devroulotte.status" } },
                { range: { "@timestamp": { gte: "now-24h" } } },
              ],
            },
          },
          sort: [{ "@timestamp": { order: "asc" } }],
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );
    const latencyMs = Math.max(
      0,
      Math.round(performance.now() - startedAt),
    );

    if (!response.ok) {
      throw new Error(`Elasticsearch ${response.status}`);
    }

    const history = parseHistory(
      (await response.json()) as ElasticSearchResponse,
    );
    const hasHistory = history.length > 0;

    return {
      configured: true,
      status: hasHistory ? "Operativo" : "In attesa dati",
      note: hasHistory
        ? `${history.length} snapshot operativi indicizzati nelle ultime 24 ore.`
        : "Elasticsearch risponde, ma Filebeat non ha ancora indicizzato snapshot nelle ultime 24 ore.",
      tone: hasHistory ? "ok" : "watch",
      latencyMs,
      checks: [
        {
          label: "Elasticsearch search",
          status: "OK",
          tone: "ok",
          latencyMs,
        },
        {
          label: "Storico status 24h",
          status: hasHistory ? `${history.length} eventi` : "Nessun evento",
          tone: hasHistory ? "ok" : "watch",
        },
      ],
      history,
    };
  } catch (error) {
    return {
      configured: true,
      status: "Degradato",
      note: "Elasticsearch non risponde; i controlli live continuano senza storico.",
      tone: "degraded",
      latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      checks: [
        {
          label: "Elasticsearch search",
          status: "Errore",
          tone: "degraded",
          note: error instanceof Error ? error.message : "Check fallito",
        },
      ],
      history: [],
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildStatusEvent(payload: StatusPayload) {
  return {
    "@timestamp": payload.checkedAt,
    message: `DevRoulotte status: ${payload.overall.status}`,
    log: { level: payload.overall.tone === "ok" ? "info" : "warning" },
    event: {
      dataset: "devroulotte.status",
      kind: "state",
      category: ["availability"],
      outcome: payload.overall.tone === "ok" ? "success" : "failure",
    },
    service: {
      name: "devroulotte",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA,
    },
    status: {
      overall: payload.overall,
      services: payload.services.map((service) => ({
        id: service.id,
        status: service.status,
        tone: service.tone,
        latency_ms: service.latencyMs,
      })),
    },
  };
}

export async function publishStatusSnapshot(payload: StatusPayload) {
  const event = buildStatusEvent(payload);
  const serializedEvent = JSON.stringify(event);

  console.log(serializedEvent);

  const collectorUrl = process.env.OBSERVABILITY_COLLECTOR_URL?.trim();
  const collectorSecret =
    process.env.OBSERVABILITY_COLLECTOR_SECRET?.trim();

  if (!collectorUrl || !collectorSecret) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ELASTIC_TIMEOUT_MS);

  try {
    const response = await fetch(collectorUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${collectorSecret}`,
        "Content-Type": "application/json",
      },
      body: serializedEvent,
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Collector ${response.status}`);
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        "@timestamp": new Date().toISOString(),
        message: "Status snapshot collector delivery failed",
        log: { level: "error" },
        event: {
          dataset: "devroulotte.observability",
          kind: "event",
          category: ["configuration"],
          outcome: "failure",
        },
        error: {
          message: error instanceof Error ? error.message : String(error),
        },
      }),
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
