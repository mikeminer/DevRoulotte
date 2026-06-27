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
} from "lucide-react";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";

const painLines = [
  "Basta call fissate tra tre settimane.",
  "Basta “sentiamoci su Calendly”.",
  "Basta networking finto fatto di DM morti e community silenziose.",
];

const principles = [
  {
    icon: Clock3,
    title: "5 minuti",
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
  "un'idea",
  "una collaborazione",
  "un feedback tecnico",
  "un contatto utile",
  "una conversazione vera",
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080b10] text-white">
      <section className="relative min-h-[88svh] px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <Image
          src="/devroulotte-logo.png"
          alt=""
          aria-hidden="true"
          width={1254}
          height={1254}
          priority
          className="pointer-events-none absolute right-[-210px] top-20 hidden w-[740px] max-w-none opacity-20 blur-[1px] saturate-125 md:block xl:right-[-80px] xl:top-8 xl:w-[820px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#080b10_0%,rgba(8,11,16,0.94)_42%,rgba(8,11,16,0.62)_100%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3">
              <Image
                src="/devroulotte-wordmark.png"
                alt="DevRoulotte"
                width={1200}
                height={294}
                priority
                className="h-auto w-40 max-w-[54vw] sm:w-56"
              />
            </Link>
            <nav className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
              <Link
                href="/terms"
                className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                Regole
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-md bg-teal-300 px-3 py-2 font-bold text-slate-950 hover:bg-teal-200 sm:px-4"
              >
                Entra
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </header>

          <div className="grid w-full min-w-0 max-w-4xl gap-8 pt-8 sm:pt-14 lg:pt-20">
            <div className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
              <Code2 className="h-4 w-4" />
              Il networking, senza appuntamenti.
            </div>

            <div className="grid gap-5">
              <h1 className="max-w-full break-words text-4xl font-black leading-[0.95] tracking-normal text-white [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl">
                DevRoulotte.chat
              </h1>
              <div className="grid min-w-0 gap-2 text-lg font-bold leading-tight text-slate-100 sm:text-2xl">
                {painLines.map((line) => (
                  <p key={line} className="max-w-full">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid min-w-0 max-w-3xl gap-5 text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              <p>
                DevRoulotte.chat è una video roulette per developer, builder e
                maker italiani: entri, vieni matchato con un altro builder e
                hai 5 minuti per parlare davvero.
              </p>
              <p>
                Niente meeting infiniti. Niente presentazioni aziendali. Niente
                palco, niente audience, niente bullshit.
              </p>
              <p>
                Solo peer-to-peer networking: una webcam, una connessione
                WebRTC e due persone che stanno costruendo qualcosa.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
              >
                Sali a bordo
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
              Una roulotte digitale per incontrarsi al volo.
            </h2>
            <div className="grid gap-4 text-sm leading-7 text-slate-300 sm:text-base">
              <p>
                L&apos;idea è semplice: se i builder italiani sono sparsi ovunque,
                allora serve una roulotte digitale dove incontrarsi al volo,
                senza dover organizzare l&apos;ennesima riunione.
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

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl justify-items-start gap-6">
          <Image
            src="/devroulotte-banner.gif"
            alt="DevRoulotte"
            width={640}
            height={162}
            unoptimized
            className="h-auto w-56 sm:w-72"
          />
          <div className="grid gap-5 text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">
            <p>DevRoulotte.chat non è una community da guardare.</p>
            <p className="text-teal-200">È una community da attraversare.</p>
          </div>
          <p className="max-w-xl text-lg font-bold leading-8 text-slate-200">
            Sali a bordo. 5 minuti. Un builder alla volta.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/chat"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
            >
              Avvia la roulette
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
            <CookiePreferencesButton className="text-slate-300 hover:text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
