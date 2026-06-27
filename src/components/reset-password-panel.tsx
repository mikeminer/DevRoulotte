"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
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
      setMessage("Configura Supabase per abilitare il reset password.");
      return;
    }

    if (!hasRecoverySession) {
      setMessage("Apri questa pagina dal link ricevuto via email.");
      return;
    }

    if (password.length < 6) {
      setMessage("La password deve avere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Le password non coincidono.");
      return;
    }

    setSaveState("saving");
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
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
    setPassword("");
    setConfirmPassword("");
    setSaveState("success");
    setMessage("Password aggiornata. Ora puoi effettuare il login.");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_50%,#080b10_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-lg content-center gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna a DevRoulotte
        </Link>

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
              href="/"
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
