import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  KeyRound,
  Linkedin,
  MonitorSmartphone,
  ShieldCheck,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { GdprFooterBadge } from "@/components/gdpr-footer-badge";
import { LandingStoryScene } from "@/components/landing-story-scene";
import {
  CONTACT_EMAIL,
  LEGAL_CONTACT_MAILTO,
  LINKEDIN_COMPANY_URL,
  WORKSHOP_FEEDBACK_URL,
} from "@/lib/app-config";

const tierRows = [
  {
    label: "Durata chiamata",
    guest: "2 min",
    registered: "5 min",
    premium: "15 min",
  },
  {
    label: "Match casuali / giorno",
    guest: "3",
    registered: "15",
    premium: "illimitati",
  },
  {
    label: "Heatmap disponibilità",
    guest: "✓",
    registered: "✓",
    premium: "✓",
  },
  {
    label: "Filtro lingua / stack / regione",
    guest: "—",
    registered: "solo lingua",
    premium: "tutti",
  },
  {
    label: "Coda prioritaria",
    guest: "—",
    registered: "—",
    premium: "✓",
  },
  {
    label: '"Riconnetti" all\'ultimo match',
    guest: "—",
    registered: "—",
    premium: "✓",
  },
  {
    label: "Pubblicità",
    guest: "✓",
    registered: "✓",
    premium: "nessuna",
  },
];

const instantPitchItems = [
  {
    title: "Persone mai viste prima",
    body: "Entri per scoprire al volo un developer, founder o builder che non avresti incrociato con una call fissata o un DM freddo.",
    icon: UsersRound,
  },
  {
    title: "Parola segreta Premium",
    body: "Se volete ritrovarvi senza scambiarvi subito il contatto, inserite entrambi la stessa parola e il sistema matcha soltanto voi.",
    icon: KeyRound,
  },
  {
    title: "1:1 peer-to-peer",
    body: "WebRTC, laptop, mobile o tablet: DevRoulotte è pensata come connector rapido, diretto e leggero.",
    icon: MonitorSmartphone,
  },
];

export function LandingPage() {
  return (
    <main className="theme-page min-h-screen w-full max-w-full overflow-hidden bg-[#080b10] text-white">
      <LandingStoryScene />

      <section className="border-y border-white/10 bg-[#f7efe1] px-4 py-14 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="grid gap-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              Perché DevRoulotte
            </p>
            <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Google Meet è perfetto quando la call esiste già.
            </h2>
            <div className="grid gap-4 text-base font-semibold leading-8 text-slate-700 sm:text-lg">
              <p>
                DevRoulotte serve prima: quando vuoi scoprire persone al volo
                mai viste prima, senza spedire link, aprire un calendario o
                costruire l&apos;ennesima stanza vuota.
              </p>
              <p>
                Entri nella roulotte e parti con una conversazione 1:1 breve,
                diretta, umana. Con Premium puoi anche usare una parola segreta:
                la inserite entrambi e il sistema vi sintonizza solo tra voi,
                senza obbligarvi a scambiarvi subito un contatto.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                data-analytics-event="cta_clicked"
                data-analytics-surface="landing_pitch"
                data-analytics-cta-id="pitch_enter"
                data-analytics-destination="chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800"
              >
                Entra nella roulotte
                <KeyRound className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {instantPitchItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="grid gap-3 rounded-lg border border-slate-950/10 bg-white/70 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-black text-slate-950">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold leading-7 text-slate-700">
                    {item.body}
                  </p>
                </div>
              );
            })}
            <p className="rounded-lg border border-slate-950/10 bg-slate-950 p-5 text-lg font-black leading-8 text-white">
              Meet è uno strumento per riunioni. DevRoulotte è uno strato di
              networking istantaneo.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6">
          <div className="grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
              Tier
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">
              Parti gratis, sali di livello quando ti serve più spazio.
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] text-white">
                <tr>
                  <th className="w-[38%] px-4 py-4 font-bold">Feature</th>
                  <th className="px-4 py-4 font-bold">Free ospite</th>
                  <th className="px-4 py-4 font-bold">Registrato</th>
                  <th className="px-4 py-4 font-bold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {tierRows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th className="px-4 py-4 font-semibold text-white">
                      {row.label}
                    </th>
                    <td className="px-4 py-4 font-semibold text-slate-200">
                      {row.guest}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-200">
                      {row.registered}
                    </td>
                    <td className="px-4 py-4 font-semibold text-teal-100">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section
        id="in-officina"
        className="border-y border-white/10 bg-white/[0.035] px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-3">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
              <Wrench className="h-4 w-4" />
              In officina
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-normal text-white sm:text-4xl">
              Segnala cosa va sistemato nella roulotte.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Bug, ottimizzazioni, idee sui tier o nuove funzionalità: il form
              raccoglie tutto in modo ordinato mentre il prodotto prende forma.
            </p>
          </div>
          <a
            href={WORKSHOP_FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="workshop_form_opened"
            data-analytics-surface="landing_workshop"
            data-analytics-cta-id="workshop_section"
            data-analytics-destination="google_forms"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
          >
            Apri il form
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl justify-items-start gap-6">
          <div className="grid gap-5 text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">
            <p>Benvenuto a bordo di DevRoulotte.</p>
            <p className="text-teal-200">
              Il superconnector casuale per chi costruisce davvero.
            </p>
          </div>
          <p className="max-w-xl text-lg font-bold leading-8 text-slate-200">
            Una persona alla volta.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/chat"
              data-analytics-event="cta_clicked"
              data-analytics-surface="landing_final"
              data-analytics-cta-id="final_enter"
              data-analytics-destination="chat"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
            >
              Entra nel giro
              <Video className="h-4 w-4" />
            </Link>
            <Link
              href="/safety"
              data-analytics-event="cta_clicked"
              data-analytics-surface="landing_final"
              data-analytics-cta-id="final_safety"
              data-analytics-destination="safety"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-sm font-bold text-slate-100 hover:bg-white/10"
            >
              <ShieldCheck className="h-4 w-4" />
              Sicurezza e regole
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span>DevRoulotte.chat · superconnector 1:1 · solo utenti 18+ · niente registrazioni audio/video.</span>
          <div className="flex flex-wrap items-center gap-3">
            <GdprFooterBadge />
            <Link href="/privacy" className="text-slate-300 hover:text-white">
              Privacy
            </Link>
            <Link href="/cookies" className="text-slate-300 hover:text-white">
              Cookie
            </Link>
            <Link href="/terms" className="text-slate-300 hover:text-white">
              Terms
            </Link>
            <a
              href={WORKSHOP_FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="workshop_form_opened"
              data-analytics-surface="landing_footer"
              data-analytics-cta-id="workshop_footer"
              data-analytics-destination="google_forms"
              className="text-slate-300 hover:text-white"
            >
              In officina
            </a>
            <Link
              href="/mediakit"
              data-analytics-event="cta_clicked"
              data-analytics-surface="landing_footer"
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
              data-analytics-surface="landing_footer"
              data-analytics-cta-id="linkedin"
              data-analytics-destination="linkedin"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
            <a
              href={LEGAL_CONTACT_MAILTO}
              className="text-slate-300 hover:text-white"
            >
              Contatti legali: {CONTACT_EMAIL}
            </a>
            <a
              href="https://devglobe.app/projects/devroulotte?utm_source=badge&utm_medium=embed"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="DevRoulotte launched on DevGlobe"
              data-analytics-event="outbound_badge_clicked"
              data-analytics-surface="landing_footer"
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
            <CookiePreferencesButton className="text-slate-300 hover:text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
