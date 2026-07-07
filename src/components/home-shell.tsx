"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Code2,
  Crown,
  FileText,
  Linkedin,
  Mail,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { AuthPanel } from "@/components/auth-panel";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { GdprFooterBadge } from "@/components/gdpr-footer-badge";
import { PremiumUpgrade } from "@/components/premium-upgrade";
import { RealtimeUsersBadge } from "@/components/realtime-users-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoChat } from "@/components/video-chat";
import { WeeklyOptInPanel } from "@/components/weekly-opt-in-panel";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import {
  CONTACT_EMAIL,
  LEGAL_CONTACT_MAILTO,
  LICENSE_NAME,
  LINKEDIN_COMPANY_URL,
  SOURCE_CODE_URL,
  WORKSHOP_FEEDBACK_URL,
} from "@/lib/app-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileStatus } from "@/lib/types";

function formatPlanDuration(seconds?: number | null) {
  if (!seconds) {
    return "-";
  }

  return `${Math.round(seconds / 60)} min`;
}

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
    <main className="theme-page min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_50%,#080b10_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <Image
              src="/devroulotte-roulotte-transparent.png"
              alt=""
              aria-hidden="true"
              width={1040}
              height={850}
              priority
              className="h-12 w-auto shrink-0 object-contain drop-shadow-[0_10px_24px_rgba(45,212,191,0.16)] sm:h-14"
            />
            <Image
              src="/devroulotte-wordmark.png"
              alt="DevRoulotte"
              width={1200}
              height={294}
              priority
              className="brand-wordmark h-auto w-40 max-w-[54vw] sm:w-56"
            />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2">
            <RealtimeUsersBadge scope="chat" surface="chat" />
            <ThemeToggle />
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
              data-analytics-event="cta_clicked"
              data-analytics-surface="chat_header"
              data-analytics-cta-id="profile"
              data-analytics-destination="profile"
              className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Profilo
            </Link>
            <a
              href={WORKSHOP_FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="workshop_form_opened"
              data-analytics-surface="chat_header"
              data-analytics-cta-id="workshop_header"
              data-analytics-destination="google_forms"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              <Wrench className="h-4 w-4" />
              In officina
            </a>
            <Link
              href="/admin"
              data-analytics-event="cta_clicked"
              data-analytics-surface="chat_header"
              data-analytics-cta-id="admin"
              data-analytics-destination="admin"
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

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="h-4 w-4 text-teal-200" />
                  Free ospite
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  3 match al giorno, chiamate da 2 minuti, niente filtri
                  avanzati e accesso al giro casuale live.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <UsersRound className="h-4 w-4 text-teal-200" />
                  Registrato
                </div>
                <p className="text-xs leading-5 text-slate-400">
                  15 match al giorno, chiamate da 5 minuti e filtro lingua per
                  dare più contesto al superconnector.
                </p>
              </div>
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-100">
                  <Sparkles className="h-4 w-4" />
                  Premium
                </div>
                <p className="text-xs leading-5 text-amber-100/75">
                  3,99 €/mese, match illimitati, chiamate da 15 minuti,
                  filtri completi, priorità nel matching e parola di sintonia.
                </p>
              </div>
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
            <WeeklyOptInPanel />
            <AuthPanel />
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <h2 className="text-sm font-semibold text-white">Stato</h2>
              <dl className="mt-3 grid gap-2 text-xs">
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Piano</dt>
                  <dd className="font-semibold text-white">
                    {profile?.planLabel ?? (isPremium ? "Premium" : "Free")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Identità</dt>
                  <dd className="font-semibold text-white">
                    {profile?.actor.type === "user" ? "registrato" : "ospite"}
                    {profile?.actor.id ? ` · ${profile.actor.id.slice(0, 8)}` : ""}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Subscription</dt>
                  <dd className="font-semibold text-white">
                    {profile?.subscriptionStatus ?? "none"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Durata</dt>
                  <dd className="font-semibold text-white">
                    {formatPlanDuration(profile?.callLimitSeconds)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
                  <dt className="text-slate-400">Match oggi</dt>
                  <dd className="font-semibold text-white">
                    {profile?.dailyMatchRemaining === null
                      ? "illimitati"
                      : profile?.dailyMatchRemaining ?? "-"}
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
            <GdprFooterBadge />
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
              href="/cookies"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              Cookie policy
            </Link>
            <CookiePreferencesButton className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white" />
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
              href={WORKSHOP_FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="workshop_form_opened"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="workshop_footer"
              data-analytics-destination="google_forms"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Wrench className="h-3.5 w-3.5" />
              In officina
            </a>
            <Link
              href="/mediakit"
              data-analytics-event="cta_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="media_kit"
              data-analytics-destination="mediakit"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              Media kit
            </Link>
            <a
              href={LINKEDIN_COMPANY_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="outbound_link_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="linkedin"
              data-analytics-destination="linkedin"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
            <a
              href={LEGAL_CONTACT_MAILTO}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              Contatti legali: {CONTACT_EMAIL}
            </a>
            <a
              href={SOURCE_CODE_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="outbound_link_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="source"
              data-analytics-destination="github"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Code2 className="h-3.5 w-3.5" />
              Source
            </a>
            <a
              href={`${SOURCE_CODE_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="outbound_link_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="license"
              data-analytics-destination="github"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Scale className="h-3.5 w-3.5" />
              License
            </a>
            <a
              href="https://shipordie.club/ship/devroulotte"
              target="_blank"
              rel="noreferrer"
              aria-label="DevRoulotte su Ship or Die"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="ship_or_die_badge"
              data-analytics-destination="ship_or_die"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-2 py-1 transition hover:bg-slate-100"
            >
              <Image
                src="https://shipordie.club/logo.webp"
                alt="Ship or Die"
                width={400}
                height={225}
                className="h-7 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.producthunt.com/products/devroulotte-chat?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-devroulotte-chat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte.chat su Product Hunt"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="product_hunt_badge"
              data-analytics-destination="product_hunt"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-1.5 py-1 transition hover:bg-slate-100"
            >
              <Image
                alt="DevRoulotte.chat - networking | Product Hunt"
                width={250}
                height={54}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1183531&theme=light&t=1782720049081"
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </a>
            <a
              href="https://peerpush.com/p/devroulottechat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte.chat su PeerPush"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="peerpush_badge"
              data-analytics-destination="peerpush"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-1.5 py-1 transition hover:bg-slate-100"
            >
              <Image
                src="https://peerpush.com/p/devroulottechat/badge.png"
                alt="DevRoulotte.chat on PeerPush"
                width={230}
                height={54}
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.uneed.best/tool/devroulotte"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte.chat launching soon on Uneed"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="uneed_badge"
              data-analytics-destination="uneed"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-1.5 py-1 transition hover:bg-slate-100"
            >
              <Image
                src="https://www.uneed.best/EMBED3B.png"
                alt="Launching Soon on Uneed"
                width={250}
                height={54}
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.nxgntools.com/tools/devroulottechat?utm_source=devroulottechat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte.chat launching soon on NextGen Tools"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="nextgen_tools_badge"
              data-analytics-destination="nextgen_tools"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-1.5 py-1 transition hover:bg-slate-100"
            >
              <Image
                src="https://www.nxgntools.com/api/embed/devroulottechat?type=LAUNCHING_SOON_ON"
                alt="Launching Soon on NextGen Tools"
                width={250}
                height={48}
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </a>
            <a
              href="https://devglobe.app/projects/devroulotte?utm_source=badge&utm_medium=embed"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte launched on DevGlobe"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="chat_footer"
              data-analytics-cta-id="devglobe_badge"
              data-analytics-destination="devglobe"
              className="inline-flex h-9 items-center rounded-md border border-white/10 bg-white px-1.5 py-1 transition hover:bg-slate-100"
            >
              <Image
                src="https://devglobe.app/badges/launched-on-devglobe-dark.svg"
                alt="Launched on DevGlobe"
                width={250}
                height={54}
                unoptimized
                className="h-7 w-auto object-contain"
              />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
