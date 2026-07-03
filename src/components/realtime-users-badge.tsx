"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, UsersRound } from "lucide-react";
import { CHAT_PRESENCE_HEARTBEAT_MS } from "@/lib/chat-presence";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type RealtimeScope = "site" | "chat";

type RealtimeUsersResponse = {
  activeUsers: number | null;
  configured: boolean;
  scope: RealtimeScope;
  source: "devroulotte_presence" | "google_analytics";
  status: "ok" | "not_configured" | "rate_limited" | "unavailable";
  updatedAt: string;
  windowMinutes?: number;
  windowSeconds?: number;
};

type RealtimeUsersBadgeProps = {
  className?: string;
  scope: RealtimeScope;
  surface: "landing" | "chat";
};

const REFRESH_MS = 30_000;

function formatWindowLabel(data: RealtimeUsersResponse) {
  if (data.windowSeconds) {
    return data.windowSeconds <= 90
      ? "nell'ultimo minuto"
      : `negli ultimi ${Math.round(data.windowSeconds / 60)} min`;
  }

  const windowMinutes = data.windowMinutes ?? 1;

  return windowMinutes === 1
    ? "nell'ultimo minuto"
    : `negli ultimi ${windowMinutes} min`;
}

export function RealtimeUsersBadge({
  className = "",
  scope,
  surface,
}: RealtimeUsersBadgeProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const clientIdRef = useRef("");
  const presenceHeadersRef = useRef<Record<string, string> | null>(null);
  const [data, setData] = useState<RealtimeUsersResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function heartbeatChatPresence(active = true) {
      const clientId = clientIdRef.current || getOrCreateGuestId();
      clientIdRef.current = clientId;

      const headers = await buildActorHeaders(supabase, clientId);
      presenceHeadersRef.current = headers;

      const response = await fetch("/api/presence/chat", {
        body: JSON.stringify({ active, clientId }),
        cache: "no-store",
        credentials: "same-origin",
        headers,
        keepalive: !active,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Chat presence unavailable");
      }

      return (await response.json()) as RealtimeUsersResponse;
    }

    function markChatPresenceOffline() {
      const clientId = clientIdRef.current;
      const headers = presenceHeadersRef.current;

      if (!clientId || !headers) {
        return;
      }

      void fetch("/api/presence/chat", {
        body: JSON.stringify({ active: false, clientId }),
        cache: "no-store",
        credentials: "same-origin",
        headers,
        keepalive: true,
        method: "POST",
      }).catch(() => undefined);
    }

    async function loadRealtimeUsers() {
      try {
        const nextData =
          surface === "chat"
            ? await heartbeatChatPresence(true)
            : await (async () => {
                const response = await fetch(
                  `/api/analytics/realtime?scope=${scope}`,
                  {
                    cache: "no-store",
                  },
                );

                if (!response.ok) {
                  throw new Error("Realtime users unavailable");
                }

                return (await response.json()) as RealtimeUsersResponse;
              })();

        if (!cancelled) {
          setData(nextData);
        }
      } catch {
        if (!cancelled) {
          setData({
            activeUsers: null,
            configured: true,
            scope,
            source:
              surface === "chat"
                ? "devroulotte_presence"
                : "google_analytics",
            status: "unavailable",
            updatedAt: new Date().toISOString(),
            ...(surface === "chat"
              ? { windowSeconds: 70 }
              : { windowMinutes: scope === "chat" ? 1 : 30 }),
          });
        }
      }
    }

    const initialTimer = window.setTimeout(() => {
      void loadRealtimeUsers();
    }, 0);
    const interval = window.setInterval(() => {
      void loadRealtimeUsers();
    }, surface === "chat" ? CHAT_PRESENCE_HEARTBEAT_MS : REFRESH_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadRealtimeUsers();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", markChatPresenceOffline);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", markChatPresenceOffline);
      markChatPresenceOffline();
    };
  }, [scope, supabase, surface]);

  if (!data || !data.configured || data.status === "not_configured") {
    return null;
  }

  const icon =
    surface === "chat" ? (
      <UsersRound className="h-4 w-4 text-teal-200" />
    ) : (
      <Activity className="h-4 w-4 text-teal-200" />
    );
  const activeUsers = data.activeUsers ?? 0;
  const windowLabel = formatWindowLabel(data);
  const label =
    surface === "chat"
      ? `${activeUsers} in chat ${windowLabel}`
      : `${activeUsers} live ${windowLabel}`;
  const title =
    surface === "chat"
      ? `Presenza tecnica DevRoulotte, aggiornata ogni pochi secondi. Finestra: ${windowLabel}.`
      : `Dato aggregato da Google Analytics 4 Realtime, non presenza istantanea. Finestra: ${windowLabel}.`;

  return (
    <span
      title={title}
      className={`inline-flex h-9 items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 text-xs font-bold text-teal-100 ${className}`}
    >
      {icon}
      {data.status === "unavailable" ? "Live non disponibile" : label}
    </span>
  );
}
