"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Save, Sparkles } from "lucide-react";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PremiumCard } from "@/lib/types";

type PremiumCardEditorProps = {
  isPremium: boolean;
  isAuthenticated: boolean;
};

type PremiumCardResponse = {
  ok: boolean;
  isPremium?: boolean;
  card?: PremiumCard;
  message?: string;
};

const blankPremiumCard: PremiumCard = {
  displayName: "",
  headline: "",
  bio: "",
  websiteUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  xUrl: "",
  productUrl: "",
  contactEmail: "",
  preferredContact: "",
  stack: "",
  lookingFor: "",
  building: "",
  ctaLabel: "",
  ctaUrl: "",
  shareInCalls: false,
  updatedAt: null,
};

const textInputs: Array<{
  key: keyof Pick<
    PremiumCard,
    | "displayName"
    | "headline"
    | "websiteUrl"
    | "githubUrl"
    | "linkedinUrl"
    | "xUrl"
    | "productUrl"
    | "contactEmail"
    | "preferredContact"
    | "stack"
    | "building"
    | "lookingFor"
    | "ctaLabel"
    | "ctaUrl"
  >;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  {
    key: "displayName",
    label: "Nome pubblico",
    placeholder: "Mario Rossi",
  },
  {
    key: "headline",
    label: "Headline",
    placeholder: "Founder, frontend dev, builder SaaS",
  },
  {
    key: "websiteUrl",
    label: "Sito web",
    placeholder: "https://tuosito.dev",
    type: "url",
  },
  {
    key: "githubUrl",
    label: "GitHub",
    placeholder: "https://github.com/username",
    type: "url",
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    type: "url",
  },
  {
    key: "xUrl",
    label: "X / Twitter",
    placeholder: "https://x.com/username",
    type: "url",
  },
  {
    key: "productUrl",
    label: "Prodotto / progetto",
    placeholder: "https://demo.dev",
    type: "url",
  },
  {
    key: "contactEmail",
    label: "Email di contatto",
    placeholder: "nome@example.com",
    type: "email",
  },
  {
    key: "preferredContact",
    label: "Contatto preferito",
    placeholder: "LinkedIn, GitHub, email, Telegram...",
  },
  {
    key: "stack",
    label: "Stack",
    placeholder: "Next.js, Supabase, AI, mobile...",
  },
  {
    key: "building",
    label: "Sto costruendo",
    placeholder: "Un tool per developer italiani",
  },
  {
    key: "lookingFor",
    label: "Cerco",
    placeholder: "Feedback, co-founder, clienti beta...",
  },
  {
    key: "ctaLabel",
    label: "Testo CTA",
    placeholder: "Guarda il progetto",
  },
  {
    key: "ctaUrl",
    label: "Link CTA",
    placeholder: "https://...",
    type: "url",
  },
];

function getPreviewLinks(card: PremiumCard) {
  return [
    ["Sito", card.websiteUrl],
    ["GitHub", card.githubUrl],
    ["LinkedIn", card.linkedinUrl],
    ["X", card.xUrl],
    ["Prodotto", card.productUrl],
  ].filter(([, href]) => href);
}

export function PremiumCardEditor({
  isPremium,
  isAuthenticated,
}: PremiumCardEditorProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [card, setCard] = useState<PremiumCard>(blankPremiumCard);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadCard = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/profile/premium-card", { headers });
      const payload = (await response.json()) as PremiumCardResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Premium Card non disponibile");
      }

      setCard(payload.card ?? blankPremiumCard);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Premium Card non disponibile",
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCard]);

  function updateCard<K extends keyof PremiumCard>(
    key: K,
    value: PremiumCard[K],
  ) {
    setCard((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveCard() {
    if (!isPremium) {
      setMessage("La Premium Card e' disponibile solo con Premium.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/profile/premium-card", {
        method: "PUT",
        headers,
        body: JSON.stringify(card),
      });
      const payload = (await response.json()) as PremiumCardResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Salvataggio non riuscito");
      }

      setCard(payload.card ?? card);
      setMessage("Premium Card salvata.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito");
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthenticated) {
    return null;
  }

  const previewLinks = getPreviewLinks(card);
  const disabled = !isPremium || loading || saving;

  return (
    <section className="rounded-lg border border-amber-200/20 bg-amber-100/[0.06] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md border border-amber-200/20 bg-amber-200/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            Premium
          </p>
          <h2 className="mt-3 text-lg font-black text-white">
            Premium Card
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Un biglietto da visita opzionale da mostrare al match durante la
            chiamata: sito, GitHub, social, cosa stai costruendo e come
            ricontattarti.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void saveCard()}
          disabled={disabled}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-200 px-3 text-sm font-black text-slate-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salva card
        </button>
      </div>

      {!isPremium ? (
        <p className="mt-4 rounded-md border border-amber-300/20 bg-black/25 p-3 text-sm text-amber-100">
          La card resta una funzione Premium: puoi prepararla dopo l&apos;upgrade e
          decidere se mostrarla in chiamata.
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-slate-100">
          {message}
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {textInputs.map((input) => (
            <label key={input.key} className="grid gap-1 text-xs text-slate-300">
              {input.label}
              <input
                className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-45"
                type={input.type ?? "text"}
                value={card[input.key] as string}
                onChange={(event) => updateCard(input.key, event.target.value)}
                placeholder={input.placeholder}
                disabled={disabled}
              />
            </label>
          ))}
          <label className="grid gap-1 text-xs text-slate-300 sm:col-span-2">
            Bio breve
            <textarea
              className="min-h-24 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-45"
              value={card.bio}
              onChange={(event) => updateCard("bio", event.target.value)}
              placeholder="Due righe su chi sei, cosa fai e cosa ti interessa incontrare."
              disabled={disabled}
            />
          </label>
          <label className="flex items-start gap-3 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-slate-200 sm:col-span-2">
            <input
              className="mt-1 h-4 w-4 accent-amber-200"
              type="checkbox"
              checked={card.shareInCalls}
              onChange={(event) =>
                updateCard("shareInCalls", event.target.checked)
              }
              disabled={disabled}
            />
            <span>
              Mostra questa card ai match durante la chiamata.
              <span className="mt-1 block text-xs text-slate-500">
                Se disattivata, resta salvata ma non viene condivisa.
              </span>
            </span>
          </label>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Anteprima</p>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <h3 className="text-xl font-black text-white">
              {card.displayName || "Il tuo nome"}
            </h3>
            <p className="mt-1 text-sm font-semibold text-amber-100">
              {card.headline || "Headline professionale"}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {card.bio || "Racconta in breve cosa stai costruendo."}
            </p>
            <dl className="mt-4 grid gap-2 text-sm">
              {card.stack ? (
                <div>
                  <dt className="text-xs uppercase text-slate-500">Stack</dt>
                  <dd className="text-slate-100">{card.stack}</dd>
                </div>
              ) : null}
              {card.building ? (
                <div>
                  <dt className="text-xs uppercase text-slate-500">
                    Sto costruendo
                  </dt>
                  <dd className="text-slate-100">{card.building}</dd>
                </div>
              ) : null}
              {card.lookingFor ? (
                <div>
                  <dt className="text-xs uppercase text-slate-500">Cerco</dt>
                  <dd className="text-slate-100">{card.lookingFor}</dd>
                </div>
              ) : null}
            </dl>
            {previewLinks.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {previewLinks.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-slate-100 hover:bg-white/10"
                  >
                    {label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            ) : null}
            {card.contactEmail || card.preferredContact ? (
              <p className="mt-4 rounded-md border border-teal-200/20 bg-teal-200/10 px-3 py-2 text-xs text-teal-50">
                {card.preferredContact || "Contatto"}{" "}
                {card.contactEmail ? `- ${card.contactEmail}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
