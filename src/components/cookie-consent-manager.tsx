"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  Cookie,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  buildCookieConsent,
  COOKIE_CONSENT_OPEN_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_CHOICES,
  parseCookieConsent,
  type CookieConsent,
  type CookieConsentChoices,
} from "@/lib/cookie-consent";

type Category = {
  id: keyof CookieConsentChoices;
  title: string;
  body: string;
};

type CookieLocale = "it" | "en";

const DEVROULOTTE_LOCALE_COOKIE = "devroulotte_locale";

const optionalCategoriesByLocale: Record<CookieLocale, Category[]> = {
  it: [
    {
      id: "preferences",
      title: "Preferenze",
      body: "Memorizzano scelte facoltative dell'interfaccia. Al momento DevRoulotte non usa strumenti opzionali di preferenza.",
    },
    {
      id: "analytics",
      title: "Statistiche",
      body: "Abilitano Google Analytics 4 per misurare visite, pagine viste ed eventi tecnici aggregati. Restano spenti fino al tuo consenso.",
    },
    {
      id: "marketing",
      title: "Marketing",
      body: "Servirebbero per pubblicità o tracciamenti promozionali. Al momento non sono attivi cookie marketing.",
    },
  ],
  en: [
    {
      id: "preferences",
      title: "Preferences",
      body: "Store optional interface choices. DevRoulotte does not currently use optional preference tools.",
    },
    {
      id: "analytics",
      title: "Analytics",
      body: "Enable Google Analytics 4 to measure visits, page views and aggregated technical events. They stay off until you consent.",
    },
    {
      id: "marketing",
      title: "Marketing",
      body: "Would be used for ads or promotional tracking. DevRoulotte does not currently run marketing cookies.",
    },
  ],
};

const cookieText = {
  it: {
    bannerLabel: "Informativa breve cookie",
    bannerTitle: "Privacy e cookie",
    bannerBody:
      "Usiamo strumenti tecnici necessari per sicurezza, login, preferenze 18+, limiti Free e consenso cookie. Le statistiche con Google Analytics e il marketing restano disattivati finché non li accetti.",
    policyLink: "Leggi la cookie policy",
    necessaryOnly: "Solo necessari",
    customize: "Personalizza",
    acceptAll: "Accetta tutto",
    reviewLabel: "Rivedi le scelte sui cookie",
    centerLabel: "Centro preferenze cookie",
    centerEyebrow: "Centro preferenze",
    centerTitle: "Scelte cookie",
    centerBody:
      "Puoi accettare o rifiutare le categorie non necessarie. Nessun cookie non tecnico viene usato prima del consenso.",
    closePreferences: "Chiudi preferenze cookie",
    necessaryTitle: "Necessari",
    necessaryBody:
      "Sempre attivi: login Supabase, ID ospite, limiti Free, sicurezza, report, conferma 18+/regole e salvataggio della scelta cookie.",
    active: "Attivi",
    accepted: "Accettati",
    rejected: "Rifiutati",
    rejectOptional: "Rifiuta opzionali",
    saveChoice: "Salva scelta",
    footerPrefix: "Dettagli e strumenti attuali sono descritti nella",
    cookiePolicy: "cookie policy",
    footerSuffix:
      "Questa implementazione è una base tecnica e va comunque validata dal consulente privacy prima del lancio pubblico.",
  },
  en: {
    bannerLabel: "Short cookie notice",
    bannerTitle: "Privacy and cookies",
    bannerBody:
      "We use necessary technical tools for security, login, 18+ preferences, Free limits and cookie consent. Google Analytics statistics and marketing remain disabled until you accept them.",
    policyLink: "Read the cookie policy",
    necessaryOnly: "Necessary only",
    customize: "Customize",
    acceptAll: "Accept all",
    reviewLabel: "Review cookie choices",
    centerLabel: "Cookie preference center",
    centerEyebrow: "Preference center",
    centerTitle: "Cookie choices",
    centerBody:
      "You can accept or reject non-essential categories. No non-technical cookies are used before consent.",
    closePreferences: "Close cookie preferences",
    necessaryTitle: "Necessary",
    necessaryBody:
      "Always active: Supabase login, guest ID, Free limits, security, reports, 18+/rules confirmation and storing the cookie choice.",
    active: "Active",
    accepted: "Accepted",
    rejected: "Rejected",
    rejectOptional: "Reject optional",
    saveChoice: "Save choice",
    footerPrefix: "Current details and tools are described in the",
    cookiePolicy: "cookie policy",
    footerSuffix:
      "This implementation is a technical baseline and should still be validated by a privacy consultant before public launch.",
  },
} satisfies Record<CookieLocale, Record<string, string>>;

function choicesFromConsent(
  consent: CookieConsent | null,
): CookieConsentChoices {
  return consent
    ? {
        preferences: consent.preferences,
        analytics: consent.analytics,
        marketing: consent.marketing,
      }
    : DEFAULT_COOKIE_CHOICES;
}

function getCookieValue(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

function detectCookieLocale(): CookieLocale {
  const storedLocale = getCookieValue(DEVROULOTTE_LOCALE_COOKIE);

  if (storedLocale === "it" || storedLocale === "en") {
    return storedLocale;
  }

  return navigator.language.toLowerCase().startsWith("it") ? "it" : "en";
}

export function CookieConsentManager() {
  const [isReady, setIsReady] = useState(false);
  const [locale, setLocale] = useState<CookieLocale>("it");
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [draft, setDraft] = useState<CookieConsentChoices>(
    DEFAULT_COOKIE_CHOICES,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = parseCookieConsent(
        window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
      );

      setLocale(detectCookieLocale());
      setConsent(stored);
      setDraft(choicesFromConsent(stored));
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function openPreferences() {
      setLocale(detectCookieLocale());
      setDraft(choicesFromConsent(consent));
      setIsPanelOpen(true);
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openPreferences);
    };
  }, [consent]);

  useEffect(() => {
    if (!isPanelOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPanelOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isPanelOpen]);

  function saveChoices(choices: CookieConsentChoices) {
    const nextConsent = buildCookieConsent(choices);

    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(nextConsent),
    );
    window.dispatchEvent(new Event(COOKIE_CONSENT_UPDATED_EVENT));
    setConsent(nextConsent);
    setDraft(choices);
    setIsPanelOpen(false);
  }

  function rejectOptional() {
    saveChoices(DEFAULT_COOKIE_CHOICES);
  }

  function acceptAll() {
    saveChoices({
      preferences: true,
      analytics: true,
      marketing: true,
    });
  }

  function toggleChoice(category: keyof CookieConsentChoices) {
    setDraft((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  if (!isReady) {
    return null;
  }

  const shouldShowBanner = !consent && !isPanelOpen;
  const text = cookieText[locale];
  const optionalCategories = optionalCategoriesByLocale[locale];

  return (
    <>
      {shouldShowBanner ? (
        <section
          aria-label={text.bannerLabel}
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 z-40 max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-lg border border-white/10 bg-[#0d121a]/95 p-3 text-white shadow-2xl shadow-black/40 backdrop-blur sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[420px] sm:p-4"
        >
          <div className="grid gap-3">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Cookie className="h-4 w-4 text-teal-200" />
                {text.bannerTitle}
              </div>
              <p className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                {text.bannerBody}
              </p>
              <Link
                href="/cookies"
                className="w-fit text-xs font-semibold text-teal-200 hover:text-teal-100"
              >
                {text.policyLink}
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={rejectOptional}
                className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-xs font-semibold text-slate-100 hover:bg-white/10"
              >
                {text.necessaryOnly}
              </button>
              <button
                type="button"
                onClick={() => setIsPanelOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-xs font-semibold text-slate-100 hover:bg-white/10"
              >
                <Settings2 className="h-4 w-4" />
                {text.customize}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-xs font-bold text-slate-950 hover:bg-teal-200"
              >
                {text.acceptAll}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {consent && !isPanelOpen ? (
        <button
          type="button"
          onClick={() => {
            setDraft(choicesFromConsent(consent));
            setLocale(detectCookieLocale());
            setIsPanelOpen(true);
          }}
          className="fixed bottom-3 left-3 z-40 inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-[#0d121a]/90 px-3 text-xs font-semibold text-slate-200 shadow-lg shadow-black/30 backdrop-blur hover:bg-white/10 sm:bottom-4 sm:left-4"
          aria-label={text.reviewLabel}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Cookie
        </button>
      ) : null}

      {isPanelOpen ? (
        <div
          className="fixed inset-0 z-50 grid items-start overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:place-items-center sm:p-6"
          role="presentation"
          onClick={() => setIsPanelOpen(false)}
        >
          <section
            aria-label={text.centerLabel}
            aria-modal="true"
            role="dialog"
            className="my-auto max-h-[calc(100svh-1.5rem)] w-full max-w-2xl overflow-auto rounded-lg border border-white/10 bg-[#0d121a] p-4 text-white shadow-2xl shadow-black/50 sm:max-h-[min(760px,calc(100svh-3rem))] sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-teal-200">
                  <ShieldCheck className="h-4 w-4" />
                  {text.centerEyebrow}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-normal">
                  {text.centerTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {text.centerBody}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-200 hover:bg-white/10"
                aria-label={text.closePreferences}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-lg border border-teal-300/20 bg-teal-300/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-teal-50">
                      {text.necessaryTitle}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-teal-50/75">
                      {text.necessaryBody}
                    </p>
                  </div>
                  <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-teal-200/20 px-2 text-xs font-semibold text-teal-50">
                    <Check className="h-3.5 w-3.5" />
                    {text.active}
                  </span>
                </div>
              </div>

              {optionalCategories.map((category) => (
                <label
                  key={category.id}
                  className="grid cursor-pointer gap-3 rounded-lg border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block text-sm font-bold text-white">
                      {category.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">
                      {category.body}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-3 text-xs font-semibold text-slate-300">
                    {draft[category.id] ? text.accepted : text.rejected}
                    <input
                      type="checkbox"
                      checked={draft[category.id]}
                      onChange={() => toggleChoice(category.id)}
                      className="h-5 w-5 accent-teal-300"
                    />
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={rejectOptional}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                {text.rejectOptional}
              </button>
              <button
                type="button"
                onClick={() => saveChoices(draft)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                <Save className="h-4 w-4" />
                {text.saveChoice}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                {text.acceptAll}
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              {text.footerPrefix}{" "}
              <Link href="/cookies" className="text-teal-200 hover:text-white">
                {text.cookiePolicy}
              </Link>
              . {text.footerSuffix}
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
