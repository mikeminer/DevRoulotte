"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/app-config";
import type { ServiceStatusTone, StatusPayload } from "@/lib/status";

function getToneClasses(tone: ServiceStatusTone) {
  if (tone === "ok") {
    return {
      border: "border-emerald-300/20",
      bg: "bg-emerald-300/10",
      text: "text-emerald-200",
    };
  }

  if (tone === "down") {
    return {
      border: "border-rose-300/20",
      bg: "bg-rose-300/10",
      text: "text-rose-200",
    };
  }

  if (tone === "degraded") {
    return {
      border: "border-amber-300/20",
      bg: "bg-amber-300/10",
      text: "text-amber-200",
    };
  }

  return {
    border: "border-sky-300/20",
    bg: "bg-sky-300/10",
    text: "text-sky-200",
  };
}

function StatusIcon({ tone }: { tone: ServiceStatusTone }) {
  if (tone === "ok") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }

  if (tone === "down") {
    return <XCircle className="h-4 w-4 text-rose-300" />;
  }

  return <TriangleAlert className="h-4 w-4 text-amber-300" />;
}

function formatCheckedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export function StatusDashboard({
  initialStatus,
}: {
  initialStatus: StatusPayload;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refreshIntervalMs = initialStatus.refreshSeconds * 1000;

  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/status", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Status API ${response.status}`);
      }

      setStatus((await response.json()) as StatusPayload);
      setRefreshError(null);
    } catch (error) {
      setRefreshError(
        error instanceof Error
          ? error.message
          : "Aggiornamento status non riuscito",
      );
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshStatus();
    }, refreshIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [refreshIntervalMs, refreshStatus]);

  const overallTone = useMemo(
    () => getToneClasses(status.overall.tone),
    [status.overall.tone],
  );

  return (
    <>
      <header className="mt-8 border-b border-white/10 pb-7">
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
              Stato dei servizi
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Pagina pubblica aggiornata automaticamente per verificare lo stato
              operativo di DevRoulotte.chat. Per incidenti, pagamenti o problemi
              di accesso puoi scrivere al contatto operativo.
            </p>
          </div>
          <div
            className={`rounded-md border px-4 py-3 ${overallTone.border} ${overallTone.bg}`}
          >
            <p
              className={`text-xs font-semibold uppercase ${overallTone.text}`}
            >
              Stato attuale
            </p>
            <p className="mt-1 text-2xl font-black text-white">
              {status.overall.status}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 py-7">
        <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              {status.overall.tone === "ok" ? (
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              ) : (
                <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-300" />
              )}
              <div>
                <h2 className="text-lg font-bold text-white">
                  {status.overall.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {status.overall.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void refreshStatus()}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Aggiorna
            </button>
          </div>
          {refreshError ? (
            <p className="mt-4 text-xs text-amber-200">
              Ultimo refresh non riuscito: {refreshError}. Riprovo
              automaticamente.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {status.services.map((service) => (
            <article
              key={service.id}
              className="rounded-md border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-bold text-white">
                  {service.name}
                </h2>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                  <StatusIcon tone={service.tone} />
                  {service.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {service.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-4 border-t border-white/10 py-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ultimo controllo: {formatCheckedAt(status.checkedAt)}
          </span>
          <span>
            Aggiornamento automatico ogni {status.refreshSeconds} secondi.
          </span>
        </div>
        <a
          href={CONTACT_MAILTO}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 font-semibold text-slate-200 hover:bg-white/10"
        >
          <Mail className="h-4 w-4" />
          {CONTACT_EMAIL}
        </a>
      </footer>
    </>
  );
}
