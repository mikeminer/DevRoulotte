"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, RefreshCw, ShieldCheck } from "lucide-react";
import { PremiumUpgrade } from "@/components/premium-upgrade";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileStatus } from "@/lib/types";

export function ProfilePanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [message, setMessage] = useState("");

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
    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto grid max-w-3xl gap-4">
        <Link
          href="/"
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
                Stato piano, limiti Free e abbonamento PayPal.
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
                {profile?.isPremium ? "Premium" : "Free"}
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
                Match Free rimasti oggi
              </dt>
              <dd className="mt-2 text-sm font-semibold text-white">
                {profile?.isPremium
                  ? "illimitati"
                  : profile?.freeDailyRemaining ?? "-"}
              </dd>
            </div>
          </dl>
        </section>

        {!profile?.isPremium ? <PremiumUpgrade /> : null}
      </div>
    </main>
  );
}
