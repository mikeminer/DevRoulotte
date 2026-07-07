"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getAnalyticsContext, trackEvent } from "@/lib/analytics";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function PremiumUpgrade({ compact = false }: { compact?: boolean }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const analyticsContext = useMemo(
    () => getAnalyticsContext(Boolean(session), false),
    [session],
  );

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function startUpgrade() {
    trackEvent("premium_upgrade_clicked", {
      ...analyticsContext,
      cta_id: compact ? "premium_compact" : "premium_card",
      surface: compact ? "chat_header" : "premium_card",
    });

    if (!session) {
      trackEvent("login_required_for_premium", {
        ...analyticsContext,
        surface: compact ? "chat_header" : "premium_card",
      });
      setMessage("Accedi o registrati per attivare Premium.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/paypal/create-subscription", {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      });
      const data = (await response.json()) as {
        ok: boolean;
        approvalUrl?: string;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.approvalUrl) {
        throw new Error(data.message ?? "PayPal non disponibile");
      }

      trackEvent("begin_checkout", {
        ...analyticsContext,
        currency: "EUR",
        payment_provider: "paypal",
        subscription_period: "monthly",
        surface: compact ? "chat_header" : "premium_card",
        value: 3.99,
      });
      window.location.href = data.approvalUrl;
    } catch (error) {
      trackEvent("checkout_error", {
        ...analyticsContext,
        error_name: error instanceof Error ? error.name : "unknown",
        payment_provider: "paypal",
        surface: compact ? "chat_header" : "premium_card",
      });
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossibile avviare upgrade Premium",
      );
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "grid gap-2" : "rounded-lg border border-amber-300/20 bg-amber-300/10 p-4"}>
      {!compact ? (
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-amber-100">Premium</h2>
          <p className="text-xs text-amber-100/70">
            3,99 €/mese, match illimitati, chiamate da 15 min, filtri completi,
            priorità, parola di sintonia e Premium Card. Nessuna prova gratuita.
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={startUpgrade}
        disabled={loading || !session}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-300 px-4 text-sm font-bold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
        {session ? "Upgrade Premium" : "Accedi per Premium"}
      </button>
      {message ? <p className="text-xs text-amber-100">{message}</p> : null}
    </div>
  );
}
