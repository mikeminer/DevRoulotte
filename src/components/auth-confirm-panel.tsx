"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ConfirmState = "idle" | "confirming" | "success" | "error";

const SUPPORTED_EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function normalizeOtpType(value: string | null): EmailOtpType | null {
  if (!value) {
    return null;
  }

  return SUPPORTED_EMAIL_OTP_TYPES.has(value) ? value : null;
}

function safeNextPath(value: string | null, type: EmailOtpType | null) {
  const fallback = type === "recovery" ? "/reset-password" : "/";

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function AuthConfirmPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [state, setState] = useState<ConfirmState>("idle");
  const [message, setMessage] = useState("");

  const tokenHash = searchParams.get("token_hash");
  const type = normalizeOtpType(searchParams.get("type"));
  const nextPath = safeNextPath(searchParams.get("next"), type);
  const isRecovery = type === "recovery";
  const canConfirm = Boolean(supabase && tokenHash && type);

  async function confirmEmailLink() {
    if (!supabase) {
      setState("error");
      setMessage("Configura Supabase per completare questo link.");
      return;
    }

    if (!tokenHash || !type) {
      setState("error");
      setMessage("Il link non contiene un token valido. Richiedi una nuova email.");
      return;
    }

    setState("confirming");
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }

    setState("success");
    setMessage(
      isRecovery
        ? "Link verificato. Ti porto alla scelta della nuova password."
        : "Email verificata. Ti porto su DevRoulotte.",
    );

    window.setTimeout(() => {
      router.replace(nextPath);
    }, 450);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_50%,#080b10_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-lg content-center gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white"
        >
          DevRoulotte
        </Link>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-teal-300/20 bg-teal-300/10 text-teal-100">
              {state === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isRecovery ? (
                <KeyRound className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-normal">
                {isRecovery ? "Conferma reset password" : "Conferma email"}
              </h1>
              <p className="text-xs text-slate-400">
                {isRecovery
                  ? "Verifica il link e scegli una nuova password."
                  : "Completa la verifica per continuare."}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!canConfirm || state === "confirming" || state === "success"}
            onClick={confirmEmailLink}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "confirming" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecovery ? (
              <KeyRound className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {isRecovery ? "Apri cambio password" : "Continua"}
          </button>

          {message || !canConfirm ? (
            <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-100">
              {message || "Questo link non e' completo. Richiedi una nuova email."}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
