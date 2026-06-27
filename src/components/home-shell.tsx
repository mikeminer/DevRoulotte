"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Code2,
  Crown,
  FileText,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { AuthPanel } from "@/components/auth-panel";
import { PremiumUpgrade } from "@/components/premium-upgrade";
import { VideoChat } from "@/components/video-chat";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { LICENSE_NAME, SOURCE_CODE_URL } from "@/lib/app-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileStatus } from "@/lib/types";

export function HomeShell() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [profileMessage, setProfileMessage] = useState("");

  const refreshProfile = useCallback(async () => {
    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/profile/me", { headers });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        throw new Error(data.message ?? "Profilo non disponibile");
      }

      const data = (await response.json()) as ProfileStatus;
      setProfile(data);
      setProfileMessage("");
    } catch (error) {
      setProfile(null);
      setProfileMessage(
        error instanceof Error ? error.message : "Configura Supabase.",
      );
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
      void refreshProfile();
    });

    return () => subscription.unsubscribe();
  }, [refreshProfile, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshProfile]);

  const isPremium = Boolean(profile?.isPremium);
  const isAuthenticated = Boolean(session);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_50%,#080b10_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/devroulotte-logo.png"
              alt="DevRoulotte"
              width={64}
              height={64}
              className="h-12 w-12 rounded-md object-cover"
              priority
            />
            <div>
              <h1 className="text-xl font-black tracking-normal text-white sm:text-2xl">
                DevRoulotte
              </h1>
              <p className="text-xs text-slate-400">
                Il networking, senza appuntamenti.
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {isPremium ? (
              <span className="inline-flex h-9 items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 px-3 text-xs font-bold text-amber-100">
                <Crown className="h-4 w-4" />
                Premium
              </span>
            ) : isAuthenticated ? (
              <PremiumUpgrade compact />
            ) : null}
            <Link
              href="/profile"
              className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Profilo
            </Link>
            <Link
              href="/admin"
              className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Admin
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="grid gap-4">
            <VideoChat
              isPremium={isPremium}
              isAuthenticated={isAuthenticated}
              onProfileRefresh={() => void refreshProfile()}
            />

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="h-4 w-4 text-teal-200" />
                  Free
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  Match casuale 1:1, chiamate da 5 minuti, limite giornaliero e
                  rate limit su Next.
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-200">
                  Rimasti oggi:{" "}
                  {profile?.isPremium
                    ? "illimitati"
                    : profile?.freeDailyRemaining ?? "-"}
                </p>
              </div>
              {isAuthenticated ? (
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-100">
                    <Sparkles className="h-4 w-4" />
                    Premium
                  </div>
                  <p className="text-xs leading-5 text-amber-100/75">
                    3,99 €/mese, prova gratuita 5 giorni, match illimitati,
                    filtri lingua/Paese e priorità in coda.
                  </p>
                </div>
              ) : null}
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-teal-200" />
                  Moderazione
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  Report, ban manuale, auto-shadowban e blocco dichiarazione
                  minorenni. Le chiamate non vengono registrate.
                </p>
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <AuthPanel />
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-sm font-semibold text-white">Stato</h2>
              <dl className="mt-3 grid gap-2 text-xs">
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Piano</dt>
                  <dd className="font-semibold text-white">
                    {isPremium ? "Premium" : "Free"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Subscription</dt>
                  <dd className="font-semibold text-white">
                    {profile?.subscriptionStatus ?? "none"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Next cooldown</dt>
                  <dd className="font-semibold text-white">
                    {profile?.nextCooldownSeconds ?? 8}s
                  </dd>
                </div>
              </dl>
              {profileMessage ? (
                <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
                  {profileMessage}
                </p>
              ) : null}
            </section>
            {!isPremium && isAuthenticated ? <PremiumUpgrade /> : null}
          </aside>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-slate-500">
          <span>
            Codice {LICENSE_NAME}. Marchio e logo DevRoulotte riservati.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              Terms
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              Privacy
            </Link>
            <Link
              href="/community-rules"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Regole
            </Link>
            <Link
              href="/safety"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Safety
            </Link>
            <a
              href={SOURCE_CODE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Code2 className="h-3.5 w-3.5" />
              Source
            </a>
            <a
              href={`${SOURCE_CODE_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Scale className="h-3.5 w-3.5" />
              License
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
