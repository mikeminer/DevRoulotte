"use client";

import { useEffect, useState } from "react";
import { Github, HeartHandshake, X } from "lucide-react";
import type { LandingLocale } from "@/components/landing-page";

const SPONSOR_URL = "https://github.com/sponsors/mikeminer";
const STORAGE_KEY = "devroulotte_builder_sponsor_popup_v1";
const SNOOZE_DAYS = 7;

const popupCopy: Record<
  LandingLocale,
  {
    tab: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    highlight: string;
    sponsor: string;
    later: string;
    footer: string;
    close: string;
  }
> = {
  it: {
    tab: "from_the_builder.md",
    eyebrow: "Un messaggio dalla persona dietro DevRoulotte",
    title: "Ciao, sono il dev che sta costruendo tutto questo.",
    paragraphs: [
      "Ho studiato da autodidatta e ho una passione enorme per l'IT. DevRoulotte nasce riga dopo riga, la sera, nei ritagli di tempo, con l'idea di creare qualcosa di utile per chi costruisce davvero.",
      "È un progetto nuovo, indipendente e senza funding. Tra server, WebRTC, esperimenti, ottimizzazioni e tempo investito, ogni sponsor aiuta a tenerlo vivo e a farlo crescere.",
    ],
    highlight:
      "Se ti piace l'idea e vuoi contribuire a sponsorizzarla, puoi passare dal mio GitHub Sponsors.",
    sponsor: "Sponsor su GitHub",
    later: "Magari più tardi",
    footer: "$ costruito con passione, grazie per essere qui.",
    close: "Chiudi messaggio sponsor",
  },
  en: {
    tab: "from_the_builder.md",
    eyebrow: "A message from the person behind DevRoulotte",
    title: "Hi, I'm the developer building all of this.",
    paragraphs: [
      "I am self-taught and deeply passionate about IT. DevRoulotte is being built line by line, at night and in spare time, with the goal of creating something useful for people who actually build.",
      "It is a brand-new independent project with no funding. Servers, WebRTC, experiments, optimization and time all add up, and every sponsor helps keep it alive and moving.",
    ],
    highlight:
      "If you like the idea and want to help sponsor it, you can visit my GitHub Sponsors page.",
    sponsor: "Sponsor on GitHub",
    later: "Maybe later",
    footer: "$ built with passion, thank you for being here.",
    close: "Close sponsor message",
  },
};

function shouldShowPopup() {
  let stored: string | null = null;

  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return true;
  }

  if (!stored) {
    return true;
  }

  const snoozedUntil = Number(stored);

  return Number.isNaN(snoozedUntil) || Date.now() > snoozedUntil;
}

function snoozePopup() {
  const snoozedUntil = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;

  try {
    window.localStorage.setItem(STORAGE_KEY, String(snoozedUntil));
  } catch {
    // If storage is blocked, closing still hides it for the current render.
  }
}

export function BuilderSponsorPopup({ locale }: { locale: LandingLocale }) {
  const [isVisible, setIsVisible] = useState(false);
  const copy = popupCopy[locale];

  useEffect(() => {
    if (!shouldShowPopup()) {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), 1400);

    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    snoozePopup();
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[520px]">
      <section
        aria-label={copy.eyebrow}
        className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1019]/95 text-white shadow-2xl shadow-black/40 ring-1 ring-teal-200/10 backdrop-blur"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 rounded-md border border-white/10 bg-black/25 px-2 py-1 font-mono text-[11px] text-slate-300">
              {copy.tab}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={copy.close}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-7">
          <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
            <HeartHandshake className="h-4 w-4" />
            {copy.eyebrow}
          </p>

          <div className="grid gap-3">
            <h2 className="text-2xl font-black leading-tight tracking-normal text-white sm:text-3xl">
              {copy.title}
            </h2>
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm font-medium leading-7 text-slate-300">
                {paragraph}
              </p>
            ))}
            <p className="text-sm font-bold leading-7 text-amber-100">
              {copy.highlight}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="outbound_link_clicked"
              data-analytics-surface="builder_sponsor_popup"
              data-analytics-cta-id="github_sponsors"
              data-analytics-destination="github_sponsors"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-pink-400 px-4 text-sm font-black text-white shadow-lg shadow-pink-950/30 hover:bg-pink-300"
            >
              <Github className="h-4 w-4" />
              {copy.sponsor}
            </a>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white"
            >
              {copy.later}
            </button>
          </div>

          <p className="font-mono text-xs text-slate-500">{copy.footer}</p>
        </div>
      </section>
    </div>
  );
}
