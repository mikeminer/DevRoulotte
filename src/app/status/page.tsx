import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/app-config";
import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";

export const metadata: Metadata = {
  title: "Status | DevRoulotte",
  description:
    "Stato pubblico dei servizi principali DevRoulotte.chat e contatto operativo.",
};

const services = [
  {
    name: "Web app e landing",
    status: "Operativo",
    note: "Frontend Next.js servito da Vercel.",
    tone: "ok",
  },
  {
    name: "Login e profili",
    status: "Operativo",
    note: "Auth email e GitHub tramite Supabase.",
    tone: "ok",
  },
  {
    name: "Videochat 1:1",
    status: "Beta monitorata",
    note: "WebRTC peer-to-peer con signaling su Supabase e fallback TURN Cloudflare.",
    tone: "watch",
  },
  {
    name: "Pagamenti Premium",
    status: "Operativo",
    note: "PayPal Subscriptions e webhook server-side.",
    tone: "ok",
  },
  {
    name: "Analytics e contatori live",
    status: "Non critico",
    note: "Metriche aggregate soggette a consenso cookie e disponibilita' GA4.",
    tone: "watch",
  },
  {
    name: "Email transazionali",
    status: "Operativo",
    note: "Email account e recupero password tramite provider SMTP configurato.",
    tone: "ok",
  },
];

function StatusIcon({ tone }: { tone: string }) {
  if (tone === "ok") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  }

  return <TriangleAlert className="h-4 w-4 text-amber-300" />;
}

export default function StatusPage() {
  const overallStatus = MAINTENANCE_MODE ? "Manutenzione" : "Operativo";
  const overallDescription = MAINTENANCE_MODE
    ? MAINTENANCE_MESSAGE
    : "I servizi principali sono disponibili. La videochat resta una funzione beta e viene monitorata durante i test pubblici.";

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al sito
        </Link>

        <header className="mt-8 border-b border-white/10 pb-7">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-teal-200">
            <Activity className="h-4 w-4" />
            DevRoulotte status
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
                Stato dei servizi
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Pagina pubblica per verificare lo stato operativo di
                DevRoulotte.chat. Per incidenti, pagamenti o problemi di accesso
                puoi scrivere al contatto operativo.
              </p>
            </div>
            <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-emerald-200">
                Stato attuale
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {overallStatus}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-7">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-3">
              {MAINTENANCE_MODE ? (
                <TriangleAlert className="mt-0.5 h-5 w-5 text-amber-300" />
              ) : (
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              )}
              <div>
                <h2 className="text-lg font-bold text-white">
                  {MAINTENANCE_MODE
                    ? "Manutenzione programmata o intervento tecnico"
                    : "Nessun incidente critico dichiarato"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {overallDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.name}
                className="rounded-md border border-white/10 bg-white/[0.035] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-bold text-white">
                    {service.name}
                  </h2>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-xs font-semibold text-slate-200">
                    <StatusIcon tone={service.tone} />
                    {service.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {service.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/10 py-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-4 w-4" />
            Ultimo aggiornamento manuale: 7 luglio 2026
          </div>
          <a
            href={CONTACT_MAILTO}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 font-semibold text-slate-200 hover:bg-white/10"
          >
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </footer>
      </div>
    </main>
  );
}
