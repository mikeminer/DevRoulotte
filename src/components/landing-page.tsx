import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  Handshake,
  Linkedin,
  MessageCircleOff,
  Shuffle,
  ShieldCheck,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { GdprFooterBadge } from "@/components/gdpr-footer-badge";
import { RealtimeUsersBadge } from "@/components/realtime-users-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  CONTACT_EMAIL,
  LEGAL_CONTACT_MAILTO,
  LINKEDIN_COMPANY_URL,
  WORKSHOP_FEEDBACK_URL,
} from "@/lib/app-config";

const painLines = [
  "Niente DM morti.",
  "Niente call senza contesto.",
  "Niente community dove molti sono in panchina e nessuno parla.",
];

const heroParagraphs = [
  "DevRoulotte è il superconnector 1:1 per conoscere casualmente founder, builder e professionisti italiani.",
  "La casualità resta: non devi sfogliare profili, mandare messaggi a freddo o organizzare l'ennesima call. Sali nella roulotte e il sistema ti mette in rotta con qualcuno che vale una conversazione.",
  "Puoi entrare live quando vuoi e lasciare un segnale nel giro della settimana: una heatmap mostra quando la roulotte è più viva.",
  "Il match resta sorprendente e casuale. La heatmap non decide chi incontrerai: ti fa solo capire quando c'è più movimento a bordo.",
  "Qui c'è WebRTC, matching, signaling e una missione semplice: far parlare persone che costruiscono senza trasformare tutto nell'ennesimo evento networking.",
];

const principles = [
  {
    icon: Shuffle,
    title: "Casuale, non a caso",
    body: "La roulotte ti mette davanti una persona nuova, senza liste da scorrere o messaggi a freddo.",
  },
  {
    icon: CalendarDays,
    title: "Heatmap settimanale",
    body: "Gli slot più scelti diventano più intensi e ogni settimana la tabella riparte pulita.",
  },
  {
    icon: Handshake,
    title: "1:1 professionale",
    body: "Founder, builder e professionisti che vogliono conoscersi davvero, non restare fermi in una community silenziosa.",
  },
];

const flowSteps = [
  {
    icon: CalendarDays,
    title: "Lasci un segnale",
    body: "Scegli slot e temi della settimana. È un indicatore aggregato, non una prenotazione.",
  },
  {
    icon: Shuffle,
    title: "La mappa si accende",
    body: "Più persone scelgono lo stesso periodo, più quel quadratino diventa intenso.",
  },
  {
    icon: Video,
    title: "Vi incontrate 1:1",
    body: "Entrate nella stanza video, parlate, capite se vale la pena continuare fuori.",
  },
  {
    icon: UsersRound,
    title: "Restate in rotta",
    body: "Se la conversazione funziona, vi riconnettete o vi scambiate contatti.",
  },
];

const outcomes = [
  "un nuovo dev da conoscere",
  "una collaborazione",
  "un feedback tecnico",
  "un futuro co-founder",
  "una conversazione vera",
];

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

export function LandingPage() {
  return (
    <main className="theme-page min-h-screen w-full max-w-full overflow-hidden bg-[#080b10] text-white">
      <section className="relative min-h-[88svh] overflow-hidden px-5 pb-12 pt-4 sm:px-6 lg:px-8">
        <Image
          src="/devroulotte-roulotte-transparent.png"
          alt=""
          aria-hidden="true"
          width={1040}
          height={850}
          priority
          className="pointer-events-none absolute hidden max-w-none saturate-125 md:bottom-auto md:right-[-190px] md:top-20 md:block md:w-[820px] md:opacity-90 lg:right-[-120px] xl:right-[-40px] xl:top-8 xl:w-[900px]"
        />
        <div className="theme-hero-overlay absolute inset-0 bg-[linear-gradient(90deg,#080b10_0%,rgba(8,11,16,0.98)_48%,rgba(8,11,16,0.5)_100%)]" />
        <div className="theme-hero-fade absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#080b10] to-transparent" />

        <div className="relative mx-auto grid w-full min-w-0 max-w-7xl gap-12">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3">
              <Image
                src="/devroulotte-wordmark.png"
                alt="DevRoulotte"
                width={1200}
                height={294}
                priority
                className="brand-wordmark h-auto w-40 max-w-[54vw] sm:w-56"
              />
            </Link>
            <nav className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
              <ThemeToggle />
              <Link
                href="/terms"
                className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Regole
              </Link>
              <a
                href={WORKSHOP_FEEDBACK_URL}
                target="_blank"
                rel="noreferrer"
                data-analytics-event="workshop_form_opened"
                data-analytics-surface="landing_header"
                data-analytics-cta-id="workshop_header"
                data-analytics-destination="google_forms"
                className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                In officina
              </a>
              <Link
                href="/chat"
                data-analytics-event="cta_clicked"
                data-analytics-surface="landing_header"
                data-analytics-cta-id="header_enter"
                data-analytics-destination="chat"
                className="inline-flex items-center gap-2 rounded-md bg-teal-300 px-3 py-2 font-bold text-slate-950 hover:bg-teal-200 sm:px-4"
              >
                Entra
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </header>

          <div className="mx-auto w-full max-w-sm md:hidden">
            <Image
              src="/devroulotte-roulotte-transparent.png"
              alt="La roulotte digitale di DevRoulotte"
              width={1040}
              height={850}
              priority
              className="h-auto w-full drop-shadow-[0_20px_60px_rgba(45,212,191,0.25)]"
            />
          </div>

          <div className="grid w-full min-w-0 max-w-4xl gap-8 pt-0 sm:pt-10 lg:pt-20">
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
              <Code2 className="h-4 w-4" />
              Incontri casuali, ma non a caso.
            </div>
            <RealtimeUsersBadge scope="site" surface="landing" />

            <div className="grid min-w-0 max-w-full gap-5">
              <h1 className="max-w-full break-words text-4xl font-black leading-[0.95] tracking-normal text-white [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl">
                DevRoulotte.chat
              </h1>
              <div className="grid min-w-0 max-w-[42rem] gap-2 text-lg font-bold leading-tight text-slate-100 sm:text-2xl">
                {painLines.map((line) => (
                  <p key={line} className="max-w-full break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid min-w-0 max-w-3xl gap-5 text-base leading-7 text-slate-300 [overflow-wrap:anywhere] sm:text-lg sm:leading-8">
              {heroParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="flex min-w-0 max-w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                data-analytics-event="cta_clicked"
                data-analytics-surface="landing_hero"
                data-analytics-cta-id="hero_enter"
                data-analytics-destination="chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
              >
                Entra nel giro
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#come-funziona"
                data-analytics-event="cta_clicked"
                data-analytics-surface="landing_hero"
                data-analytics-cta-id="hero_how_it_works"
                data-analytics-destination="how_it_works"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold text-slate-100 hover:bg-white/10"
              >
                Scopri come funziona
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="come-funziona"
        className="border-y border-white/10 bg-white/[0.035] px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-5">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-bold uppercase text-slate-300">
              <MessageCircleOff className="h-4 w-4 text-teal-200" />
              Superconnector 1:1
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">
              La casualità resta. Il caos no.
            </h2>
            <div className="grid gap-4 text-sm leading-7 text-slate-300 sm:text-base">
              <p>
                DevRoulotte non è una directory e non è un evento. È una
                roulotte che fa da superconnector: ti mette davanti una persona
                che non avresti cercato, ma che potrebbe avere senso conoscere.
              </p>
              <p>
                Ogni incontro è breve, diretto, casuale. Può nascere{" "}
                {outcomes.map((outcome, index) => (
                  <span key={outcome}>
                    {index === outcomes.length - 1 ? " o " : index ? ", " : ""}
                    <span className="font-semibold text-white">{outcome}</span>
                  </span>
                ))}
                .
              </p>
              <p>
                L&apos;idea non è riempirti il calendario. È creare abbastanza
                attrito buono da far incontrare persone vere, una alla volta.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:pt-10">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  key={principle.title}
                  className="rounded-lg border border-white/10 bg-black/20 p-4"
                >
                  <Icon className="h-5 w-5 text-teal-200" />
                  <h3 className="mt-4 text-sm font-bold text-white">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {principle.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b1118] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8">
          <div className="grid max-w-3xl gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
              Come gira la roulotte
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">
              Una heatmap settimanale, non un calendario.
            </h2>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">
              La modalità live resta immediata e casuale. Il giro della
              settimana serve solo a far emergere i momenti più vivi della
              community: più opt-in su uno slot, più colore su quel quadratino.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {flowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
                >
                  <Icon className="h-5 w-5 text-teal-200" />
                  <h3 className="mt-4 text-sm font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {step.body}
                  </p>
                </article>
              );
            })}
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
