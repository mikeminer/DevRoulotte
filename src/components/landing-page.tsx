import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Code2,
  MessageCircleOff,
  ShieldCheck,
  UsersRound,
  Video,
  Wrench,
} from "lucide-react";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  WORKSHOP_FEEDBACK_URL,
} from "@/lib/app-config";

const painLines = [
  "Niente “ci aggiorniamo”.",
  "Niente Calendly e call fissate tra 17 giorni.",
  "Niente community dove tutti lurkano e nessuno parla.",
];

const heroParagraphs = [
  "DevRoulotte nasce per saltare tutto il teatro del networking moderno.",
  "Entri nella roulotte, accendi la webcam, vieni matchato con un altro builder italiano e hai pochi minuti per capire chi hai davanti.",
  "Magari un futuro co-founder, un dev con un repository mezzo rotto, un genio sottovalutato o qualcuno che ha deployato su Vercel alle 3 di notte e vuole raccontarlo a qualcuno.",
  "Qui c'è WebRTC, matching, signaling e una missione semplice: far parlare i builder italiani senza organizzare convegni, call o gruppi Telegram.",
];

const principles = [
  {
    icon: Clock3,
    title: "Pochi minuti",
    body: "Il tempo giusto per capire se vale la pena continuare fuori dalla roulotte.",
  },
  {
    icon: Video,
    title: "WebRTC peer-to-peer",
    body: "Una webcam, una connessione diretta e zero registrazioni audio/video.",
  },
  {
    icon: UsersRound,
    title: "Builder italiani",
    body: "Developer, maker e founder che stanno costruendo qualcosa, non spettatori.",
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
    label: "Match / giorno",
    guest: "3",
    registered: "15",
    premium: "illimitati",
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
                className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                In officina
              </a>
              <Link
                href="/chat"
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
              Il networking, senza appuntamenti.
            </div>

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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
              >
                Entra nella roulotte
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#come-funziona"
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
              Non un&apos;altra community silenziosa
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">
              Un camper digitale nel caos dell&apos;internet italiano.
            </h2>
            <div className="grid gap-4 text-sm leading-7 text-slate-300 sm:text-base">
              <p>
                Ci sali sopra, trovi un altro dev, parli pochi minuti, scambi
                idee, ti fai due risate e magari trovi qualcuno con cui
                costruire qualcosa.
              </p>
              <p>
                Ogni chat è breve, diretta, casuale. Può nascere{" "}
                {outcomes.map((outcome, index) => (
                  <span key={outcome}>
                    {index === outcomes.length - 1 ? " o " : index ? ", " : ""}
                    <span className="font-semibold text-white">{outcome}</span>
                  </span>
                ))}
                .
              </p>
              <p>
                E se va male? Hai perso pochi minuti. Meno di quanto perdi ogni
                giorno leggendo thread motivazionali di gente che non ha mai
                pushato nulla in produzione.
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
          >
            Apri il form
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl justify-items-start gap-6">
          <Image
            src="/devroulotte-banner.gif"
            alt="DevRoulotte"
            width={640}
            height={162}
            unoptimized
            className="brand-wordmark h-auto w-56 sm:w-72"
          />
          <div className="grid gap-5 text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">
            <p>Benvenuto a bordo di DevRoulotte.</p>
            <p className="text-teal-200">
              Il networking peer-to-peer per chi costruisce davvero.
            </p>
          </div>
          <p className="max-w-xl text-lg font-bold leading-8 text-slate-200">
            Pochi minuti alla volta.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
            >
              Entra nella roulotte
              <Video className="h-4 w-4" />
            </Link>
            <Link
              href="/safety"
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
          <span>DevRoulotte.chat · solo utenti 18+ · niente registrazioni audio/video.</span>
          <div className="flex flex-wrap items-center gap-3">
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
              className="text-slate-300 hover:text-white"
            >
              In officina
            </a>
            <a
              href={CONTACT_MAILTO}
              className="text-slate-300 hover:text-white"
            >
              Contacts: {CONTACT_EMAIL}
            </a>
            <CookiePreferencesButton className="text-slate-300 hover:text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
