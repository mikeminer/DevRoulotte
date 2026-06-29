"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAnalyticsContext, trackEvent } from "@/lib/analytics";
import { getAuthErrorMessage } from "@/lib/auth-error";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SaveState = "idle" | "saving" | "success";

export function ResetPasswordPanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [message, setMessage] = useState(
    supabase ? "" : "Configura Supabase per abilitare il reset password.",
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const analyticsContext = getAnalyticsContext(hasRecoverySession, false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(Boolean(data.session));
      setUserEmail(data.session?.user.email ?? "");
      if (!data.session) {
        setMessage("Apri questa pagina dal link ricevuto via email.");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasRecoverySession(Boolean(session));
        setUserEmail(session?.user.email ?? "");
        if (session) {
          setMessage("");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      trackEvent("password_reset_save_failed", {
        ...analyticsContext,
        failure_reason: "supabase_missing",
        surface: "reset_password",
      });
      setMessage("Configura Supabase per abilitare il reset password.");
      return;
    }

    if (!hasRecoverySession) {
      trackEvent("password_reset_save_failed", {
        ...analyticsContext,
        failure_reason: "recovery_session_missing",
        surface: "reset_password",
      });
      setMessage("Apri questa pagina dal link ricevuto via email.");
      return;
    }

    if (password.length < 6) {
      trackEvent("password_reset_save_failed", {
        ...analyticsContext,
        failure_reason: "password_too_short",
        surface: "reset_password",
      });
      setMessage("La password deve avere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      trackEvent("password_reset_save_failed", {
        ...analyticsContext,
        failure_reason: "password_mismatch",
        surface: "reset_password",
      });
      setMessage("Le password non coincidono.");
      return;
    }

    setSaveState("saving");
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      trackEvent("password_reset_save_failed", {
        ...analyticsContext,
        error_name: error.name,
        surface: "reset_password",
      });
      setSaveState("idle");
      setMessage(
        getAuthErrorMessage(
          error,
          "Non sono riuscito ad aggiornare la password. Richiedi un nuovo link.",
        ),
      );
      return;
    }

    await supabase.auth.signOut();
    trackEvent("password_reset_completed", {
      ...analyticsContext,
      surface: "reset_password",
    });
    setPassword("");
    setConfirmPassword("");
    setSaveState("success");
    setMessage("Password aggiornata. Ora puoi effettuare il login.");
  }

  return (
    <main className="theme-page min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_50%,#080b10_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-lg content-center gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/chat"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna a DevRoulotte
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex justify-center">
          <Image
            src="/devroulotte-banner.gif"
            alt="DevRoulotte"
            width={640}
            height={162}
            unoptimized
            priority
            className="brand-wordmark h-auto w-64 max-w-full sm:w-80"
          />
        </div>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-teal-300/20 bg-teal-300/10 text-teal-100">
              {saveState === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <KeyRound className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-normal">
                Reimposta password
              </h1>
              <p className="text-xs text-slate-400">
                Usa il link ricevuto via email per scegliere una nuova password.
              </p>
            </div>
          </div>

          {saveState === "success" ? (
            <Link
              href="/chat"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-slate-950 hover:bg-teal-200"
            >
              Vai al login
            </Link>
          ) : (
            <form className="grid gap-3" onSubmit={updatePassword}>
              <input
                className="sr-only"
                type="email"
                autoComplete="username"
                value={userEmail}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
              />
              <label className="grid gap-1 text-xs text-slate-300">
                Nuova password
                <input
                  className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-teal-300/30 focus:ring-2"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  minLength={6}
                  placeholder="minimo 6 caratteri"
                  autoComplete="new-password"
                />
              </label>
              <label className="grid gap-1 text-xs text-slate-300">
                Conferma password
                <input
                  className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none ring-teal-300/30 focus:ring-2"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  minLength={6}
                  placeholder="ripeti la password"
                  autoComplete="new-password"
                />
              </label>
              <button
                type="submit"
                disabled={saveState === "saving"}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Aggiorna password
              </button>
            </form>
          )}

          {message ? (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
