"use client";

import { useEffect, useState } from "react";
import { Activity, UsersRound } from "lucide-react";
import { GA4_CHAT_REALTIME_ACTIVE_EVENT } from "@/lib/ga4-event-names";
import { trackEvent } from "@/lib/analytics";

type RealtimeScope = "site" | "chat";

type RealtimeUsersResponse = {
  activeUsers: number | null;
  configured: boolean;
  scope: RealtimeScope;
  source: "google_analytics";
  status: "ok" | "not_configured" | "unavailable";
  updatedAt: string;
  windowMinutes: number;
};

type RealtimeUsersBadgeProps = {
  className?: string;
  scope: RealtimeScope;
  surface: "landing" | "chat";
};

const REFRESH_MS = 30_000;
const CHAT_HEARTBEAT_MS = 60_000;

export function RealtimeUsersBadge({
  className = "",
  scope,
  surface,
}: RealtimeUsersBadgeProps) {
  const [data, setData] = useState<RealtimeUsersResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRealtimeUsers() {
      try {
        const response = await fetch(`/api/analytics/realtime?scope=${scope}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Realtime users unavailable");
        }

        const nextData = (await response.json()) as RealtimeUsersResponse;

        if (!cancelled) {
          setData(nextData);
        }
      } catch {
        if (!cancelled) {
          setData({
            activeUsers: null,
            configured: true,
            scope,
            source: "google_analytics",
            status: "unavailable",
            updatedAt: new Date().toISOString(),
            windowMinutes: 30,
          });
        }
      }
    }

    const initialTimer = window.setTimeout(() => {
      void loadRealtimeUsers();
    }, 0);
    const interval = window.setInterval(() => {
      void loadRealtimeUsers();
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [scope]);

  useEffect(() => {
    if (scope !== "chat") {
      return;
    }

    function sendChatHeartbeat() {
      if (document.visibilityState !== "visible") {
        return;
      }

      trackEvent(GA4_CHAT_REALTIME_ACTIVE_EVENT, {
        surface: "chat_realtime_badge",
      });
    }

    const initialTimer = window.setTimeout(sendChatHeartbeat, 0);
    const interval = window.setInterval(sendChatHeartbeat, CHAT_HEARTBEAT_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [scope]);

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
  const label =
    surface === "chat"
      ? `${activeUsers} in chat ora`
      : `${activeUsers} live negli ultimi ${data.windowMinutes} min`;
  const title =
    "Dato aggregato da Google Analytics 4 Realtime. La finestra standard e' circa 30 minuti.";

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
