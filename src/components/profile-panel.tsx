"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Crown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { PremiumCardEditor } from "@/components/premium-card-editor";
import { PremiumUpgrade } from "@/components/premium-upgrade";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getAnalyticsContext, trackEvent } from "@/lib/analytics";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileStatus } from "@/lib/types";

function formatPlanDuration(seconds?: number | null) {
  if (!seconds) {
    return "-";
  }

  return `${Math.round(seconds / 60)} min`;
}

export function ProfilePanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [message, setMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/profile/me", { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Profilo non disponibile");
      }

      setProfile(data as ProfileStatus);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore profilo");
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadProfile();
    });

    return () => subscription.unsubscribe();
  }, [loadProfile, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const isAuthenticated = Boolean(session);
  const analyticsContext = getAnalyticsContext(
    isAuthenticated,
    Boolean(profile?.isPremium),
  );
  const canCancelPremium =
    isAuthenticated &&
    Boolean(profile?.subscriptionStatus) &&
    !["none", "cancelled", "expired"].includes(
      profile?.subscriptionStatus ?? "none",
    );

  async function cancelPremium() {
    trackEvent("premium_cancel_clicked", {
      ...analyticsContext,
      surface: "profile",
    });

    if (
      !window.confirm(
        "Vuoi annullare Premium? La subscription PayPal verra' cancellata.",
      )
    ) {
      return;
    }

    setCancelLoading(true);
    setActionMessage("");

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/paypal/cancel-subscription", {
        method: "POST",
        headers,
        body: JSON.stringify({
          reason: "Cancelled by user from DevRoulotte profile",
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Cancellazione non riuscita");
      }

      setActionMessage("Premium cancellato. Lo stato e' stato aggiornato.");
      trackEvent("premium_cancelled", {
        ...analyticsContext,
        payment_provider: "paypal",
        surface: "profile",
      });
      await loadProfile();
    } catch (error) {
      trackEvent("premium_cancel_failed", {
        ...analyticsContext,
        error_name: error instanceof Error ? error.name : "unknown",
        payment_provider: "paypal",
        surface: "profile",
      });
      setActionMessage(
        error instanceof Error ? error.message : "Cancellazione non riuscita",
      );
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto grid max-w-3xl gap-4">
        <Link
          href="/chat"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla chat
        </Link>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black">Profilo</h1>
              <p className="mt-1 text-sm text-slate-400">
                Stato piano, limiti giornalieri e abbonamento PayPal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadProfile()}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Aggiorna
            </button>
          </div>

          {message ? (
            <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
              {message}
            </p>
          ) : null}

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase text-slate-500">Identità</dt>
              <dd className="mt-2 break-all text-sm font-semibold text-white">
                {profile?.actor.key ?? "-"}
              </dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase text-slate-500">Piano</dt>
              <dd className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
                {profile?.isPremium ? (
                  <Crown className="h-4 w-4 text-amber-200" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-teal-200" />
                )}
                {profile?.planLabel ?? (profile?.isPremium ? "Premium" : "Free")}
              </dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase text-slate-500">
                Stato subscription
              </dt>
              <dd className="mt-2 text-sm font-semibold text-white">
                {profile?.subscriptionStatus ?? "none"}
              </dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase text-slate-500">
                Match rimasti oggi
              </dt>
              <dd className="mt-2 text-sm font-semibold text-white">
                {profile?.dailyMatchRemaining === null
                  ? "illimitati"
                  : profile?.dailyMatchRemaining ?? "-"}
              </dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <dt className="text-xs uppercase text-slate-500">
                Durata chiamata
              </dt>
              <dd className="mt-2 text-sm font-semibold text-white">
                {formatPlanDuration(profile?.callLimitSeconds)}
              </dd>
            </div>
          </dl>
        </section>

        {isAuthenticated ? (
          <PremiumCardEditor
            isPremium={Boolean(profile?.isPremium)}
            isAuthenticated={isAuthenticated}
          />
        ) : null}

        {!profile?.isPremium && isAuthenticated ? <PremiumUpgrade /> : null}

        {canCancelPremium ? (
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Gestisci Premium</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Puoi annullare la subscription dal profilo o dal dashboard
                  PayPal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cancelPremium()}
                disabled={cancelLoading}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-300/30 px-3 text-sm font-semibold text-rose-100 hover:bg-rose-300/10 disabled:opacity-60"
              >
                {cancelLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Annulla Premium
              </button>
            </div>
            {actionMessage ? (
              <p className="mt-4 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
                {actionMessage}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
