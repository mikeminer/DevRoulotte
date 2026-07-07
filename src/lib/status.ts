import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";
import { hasPayPalConfig } from "@/lib/paypal";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export type ServiceStatusTone = "ok" | "watch" | "degraded" | "down";

export type ServiceStatus = {
  id: string;
  name: string;
  status: string;
  note: string;
  tone: ServiceStatusTone;
  critical?: boolean;
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

async function checkSupabaseHealth() {
  if (!hasSupabaseServerConfig()) {
    return {
      ok: false,
      status: "Non configurato",
      note: "Configurazione server Supabase assente.",
      tone: "down" as const,
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("match_queue")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      status: "Operativo",
      note: "Database e tabelle operative raggiungibili.",
      tone: "ok" as const,
    };
  } catch (error) {
    console.error("Status Supabase health check failed", error);

    return {
      ok: false,
      status: "Degradato",
      note: "Health check database fallito. Login, profili o coda possono essere instabili.",
      tone: "degraded" as const,
    };
  }
}

export async function getStatusPayload(): Promise<StatusPayload> {
  const checkedAt = new Date().toISOString();
  const supabase = await checkSupabaseHealth();
  const turnConfigured = hasCloudflareTurnConfig();
  const paypalConfigured = hasPayPalConfig();
  const ga4Configured = hasGa4RealtimeConfig();

  const services: ServiceStatus[] = [
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
      status: supabase.status,
      note: supabase.note,
      tone: supabase.tone,
      critical: true,
    },
    {
      id: "matching",
      name: "Matchmaking e signaling",
      status: supabase.ok ? "Operativo" : "Degradato",
      note: supabase.ok
        ? "Coda match e ponte WebRTC su Supabase raggiungibili."
        : "Matchmaking e signaling dipendono da Supabase e possono non completarsi.",
      tone: supabase.ok ? "ok" : "degraded",
      critical: true,
    },
    {
      id: "webrtc",
      name: "WebRTC STUN/TURN",
      status: turnConfigured ? "TURN configurato" : "STUN-only",
      note: turnConfigured
        ? "Cloudflare TURN risulta configurato lato server come fallback."
        : "STUN gratuito disponibile; TURN Cloudflare non risulta configurato nelle env runtime.",
      tone: turnConfigured ? "ok" : "watch",
    },
    {
      id: "payments",
      name: "Pagamenti Premium",
      status: paypalConfigured ? "Configurato" : "Non configurato",
      note: paypalConfigured
        ? "PayPal Subscriptions risulta configurato lato server."
        : "PayPal non risulta configurato nelle env runtime: upgrade Premium non disponibile.",
      tone: paypalConfigured ? "ok" : "degraded",
      critical: true,
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
            "I servizi principali sono disponibili. La videochat resta una funzione beta e viene monitorata durante i test pubblici.",
          tone: "ok" as const,
        };

  return {
    checkedAt,
    overall,
    refreshSeconds: STATUS_REFRESH_SECONDS,
    services,
  };
}
