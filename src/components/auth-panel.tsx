"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, LogIn, LogOut, UserPlus } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { getAnalyticsContext, trackEvent } from "@/lib/analytics";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthPanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
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

  async function authenticate(mode: "in" | "up") {
    trackEvent(mode === "up" ? "sign_up_attempted" : "login_attempted", {
      ...analyticsContext,
      method: "email",
      surface: "auth_panel",
    });

    if (!supabase) {
      trackEvent("auth_failed", {
        ...analyticsContext,
        auth_mode: mode === "up" ? "sign_up" : "login",
        failure_reason: "supabase_missing",
        surface: "auth_panel",
      });
      setMessage("Configura Supabase per abilitare login e registrazione.");
      return;
    }

    setMessage("");
    const action =
      mode === "up"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });
    const { error } = await action;

    if (error) {
      trackEvent("auth_failed", {
        ...analyticsContext,
        auth_mode: mode === "up" ? "sign_up" : "login",
        error_name: error.name,
        method: "email",
        surface: "auth_panel",
      });
      setMessage(
        getAuthErrorMessage(
          error,
          "Autenticazione non riuscita. Controlla email e password.",
        ),
      );
    } else {
      trackEvent(mode === "up" ? "sign_up" : "login", {
        ...analyticsContext,
        method: "email",
        surface: "auth_panel",
      });
      setMessage(mode === "up" ? "Controlla la tua email." : "Accesso fatto.");
      setPassword("");
    }
  }

  async function requestPasswordReset() {
    if (!supabase) {
      trackEvent("password_reset_failed", {
        ...analyticsContext,
        failure_reason: "supabase_missing",
        surface: "auth_panel",
      });
      setMessage("Configura Supabase per abilitare il reset password.");
      return;
    }

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      trackEvent("password_reset_failed", {
        ...analyticsContext,
        failure_reason: "email_missing",
        surface: "auth_panel",
      });
      setMessage("Inserisci la tua email per ricevere il link di reset.");
      return;
    }

    trackEvent("password_reset_requested", {
      ...analyticsContext,
      surface: "auth_panel",
    });
    setIsSendingReset(true);
    setMessage("Invio link di reset in corso.");

    const { error } = await supabase.auth
      .resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      .catch((caughtError: unknown) => ({ error: caughtError }));

    setIsSendingReset(false);

    if (error) {
      trackEvent("password_reset_failed", {
        ...analyticsContext,
        error_name: error instanceof Error ? error.name : "unknown",
        surface: "auth_panel",
      });
      setMessage(
        getAuthErrorMessage(
          error,
          "Non sono riuscito a inviare l'email di reset. Verifica SMTP/Resend e riprova.",
        ),
      );
    } else {
      trackEvent("password_reset_email_sent", {
        ...analyticsContext,
        surface: "auth_panel",
      });
      setMessage("Link di reset inviato. Controlla la tua email.");
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate("in");
  }

  async function signOut() {
    trackEvent("logout", {
      ...analyticsContext,
      surface: "auth_panel",
    });
    await supabase?.auth.signOut();
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Accesso</h2>
          <p className="text-xs text-slate-400">
            {session?.user.email ?? "Puoi entrare anche come ospite."}
          </p>
        </div>
        {session ? (
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        ) : null}
      </div>

      {!session ? (
        <form className="grid gap-2" onSubmit={handleAuth}>
          <label className="grid gap-1 text-xs text-slate-300">
            Email
            <input
              className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-teal-300/30 focus:ring-2"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="tu@email.it"
              autoComplete="username"
            />
          </label>
          <label className="grid gap-1 text-xs text-slate-300">
            Password
            <input
              className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-teal-300/30 focus:ring-2"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={6}
              placeholder="minimo 6 caratteri"
              autoComplete="current-password"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-semibold text-slate-950 hover:bg-teal-200"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => authenticate("up")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              <UserPlus className="h-4 w-4" />
              Registrati
            </button>
          </div>
          <button
            type="button"
            onClick={requestPasswordReset}
            disabled={isSendingReset}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSendingReset ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {isSendingReset ? "Invio reset" : "Password dimenticata?"}
          </button>
        </form>
      ) : null}

      {message ? <p className="mt-2 text-xs text-amber-200">{message}</p> : null}
    </section>
  );
}
