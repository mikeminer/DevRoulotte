import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  LINKEDIN_COMPANY_URL,
  SOURCE_CODE_URL,
} from "@/lib/app-config";

export const metadata: Metadata = {
  title: "Media kit | DevRoulotte",
  description:
    "Logo, asset, descrizione ufficiale, fact sheet e contatti press di DevRoulotte.chat.",
  openGraph: {
    title: "Media kit | DevRoulotte.chat",
    description:
      "Asset ufficiali e informazioni per parlare di DevRoulotte.chat.",
    url: "https://www.devroulotte.chat/mediakit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevRoulotte.chat media kit",
      },
    ],
  },
};

const descriptions = [
  {
    title: "One-liner",
    body: "DevRoulotte.chat è il superconnector 1:1 per conoscere al volo developer, founder, builder e professionisti italiani.",
  },
  {
    title: "Descrizione breve",
    body: "DevRoulotte.chat mette in contatto persone che costruiscono davvero: entri nella roulotte, accendi la webcam e vieni matchato con un altro builder per una conversazione 1:1 breve, casuale e diretta. Niente directory pubbliche, niente cold outreach, niente call fissate tra settimane.",
  },
  {
    title: "Descrizione lunga",
    body: "DevRoulotte.chat nasce per rendere vivo il networking tra developer, founder, builder e maker italiani. L'idea è semplice: una roulotte digitale dove incontri una persona alla volta, parli per pochi minuti e capisci subito se può nascere un feedback, una collaborazione, un contatto utile o una nuova idea. Il servizio usa WebRTC per le videochiamate 1:1 e non registra audio o video.",
  },
];

const facts = [
  ["Nome", "DevRoulotte.chat"],
  ["Categoria", "Networking 1:1 live per builder"],
  ["Audience", "Developer, founder, builder, maker e professionisti italiani"],
  ["Formato", "Videochiamate casuali 1:1 con webcam"],
  ["Accesso", "Guest limitato, login email, GitHub, LinkedIn e X"],
  ["Premium", "3,99 EUR/mese, senza prova gratuita"],
  ["Media", "WebRTC peer-to-peer quando possibile, TURN come fallback"],
  ["Privacy", "Nessuna registrazione audio/video delle chiamate"],
  ["Licenza codice", "AGPLv3"],
  ["Marchio/logo", "All rights reserved"],
];

const assets = [
  {
    title: "Logo completo",
    description: "Logo quadrato con roulotte, persone e wordmark.",
    src: "/devroulotte-logo.png",
    width: 1254,
    height: 1254,
    href: "/devroulotte-logo.png",
  },
  {
    title: "Roulotte trasparente",
    description: "Visual principale senza wordmark, utile per articoli e card.",
    src: "/devroulotte-roulotte-transparent.png",
    width: 1040,
    height: 850,
    href: "/devroulotte-roulotte-transparent.png",
  },
  {
    title: "Wordmark",
    description: "Scritta DevRoulotte a colori su trasparente.",
    src: "/devroulotte-wordmark.png",
    width: 1048,
    height: 266,
    href: "/devroulotte-wordmark.png",
  },
  {
    title: "Banner animato",
    description: "Wordmark GIF per email, landing e annunci.",
    src: "/devroulotte-banner.gif",
    width: 640,
    height: 162,
    href: "/devroulotte-banner.gif",
    unoptimized: true,
  },
  {
    title: "Open Graph",
    description: "Immagine social 1200x630 per anteprime link.",
    src: "/og-image.png",
    width: 1200,
    height: 630,
    href: "/og-image.png",
  },
];

const officialLinks = [
  {
    label: "Sito",
    href: "https://www.devroulotte.chat",
    icon: ExternalLink,
  },
  {
    label: "LinkedIn",
    href: LINKEDIN_COMPANY_URL,
    icon: Linkedin,
  },
  {
    label: "GitHub",
    href: SOURCE_CODE_URL,
    icon: Github,
  },
  {
    label: "Contatto",
    href: CONTACT_MAILTO,
    icon: Mail,
  },
];

const guidelines = [
  "Scrivi il nome come DevRoulotte.chat o DevRoulotte, non DevRoulette.",
  "Usa il logo senza modificarne proporzioni, colori o elementi principali.",
  "Su sfondi scuri preferisci asset con contrasto sufficiente o spazio negativo attorno al marchio.",
  "Il codice è AGPLv3; marchio, logo e identità visiva restano all rights reserved.",
  "Non presentare DevRoulotte come dating app: è networking 1:1 per chi costruisce.",
];

export default function MediaKitPage() {
  return (
    <main className="min-h-screen bg-[#080b10] text-white">
      <section className="border-b border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/devroulotte-wordmark.png"
              alt="DevRoulotte"
              width={1048}
              height={266}
              priority
              className="brand-wordmark h-auto w-44 sm:w-56"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-md border border-white/10 px-3 text-sm font-bold text-slate-200 hover:bg-white/10"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-black text-slate-950 hover:bg-teal-200"
            >
              Entra nella roulotte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="grid gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-100">
              <FileText className="h-4 w-4" />
              Media kit
            </p>
            <div className="grid gap-4">
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">
                Asset e informazioni ufficiali per parlare di DevRoulotte.
              </h1>
              <p className="max-w-2xl text-lg font-semibold leading-8 text-slate-300">
                Qui trovi descrizioni pronte, logo, visual, fact sheet, link
                ufficiali e contatti. Utile per articoli, directory, newsletter,
                community post e partner page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/og-image.png"
                download
                className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-black text-slate-950 hover:bg-teal-200"
              >
                <Download className="h-4 w-4" />
                Scarica OG image
              </a>
              <a
                href={CONTACT_MAILTO}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-white/15 px-4 text-sm font-bold text-slate-100 hover:bg-white/10"
              >
                <Mail className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#f7efe1] p-4">
            <Image
              src="/devroulotte-roulotte-transparent.png"
              alt="Roulotte DevRoulotte con developer a bordo"
              width={1040}
              height={850}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {descriptions.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-white/10 bg-black/20 p-5"
            >
              <h2 className="text-lg font-black text-white">{item.title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid content-start gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              Fact sheet
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white">
              Cosa dire, senza inventare nulla.
            </h2>
            <p className="text-sm leading-7 text-slate-400">
              DevRoulotte è un servizio live, 18+, orientato al networking tra
              persone che costruiscono. Non registra audio/video e non è pensato
              come directory pubblica.
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10">
            <dl className="divide-y divide-white/10">
              {facts.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 bg-white/[0.025] px-4 py-4 sm:grid-cols-[220px_1fr]"
                >
                  <dt className="text-xs font-bold uppercase text-slate-500">
                    {label}
                  </dt>
                  <dd className="text-sm font-semibold text-slate-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#f7efe1] px-4 py-12 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8">
          <div className="grid gap-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              Brand assets
            </p>
            <h2 className="text-3xl font-black tracking-normal sm:text-4xl">
              Logo, roulotte e immagini social.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <article
                key={asset.title}
                className="grid gap-4 rounded-lg border border-slate-950/10 bg-white p-4 shadow-sm"
              >
                <div className="flex min-h-44 items-center justify-center rounded-md border border-slate-950/10 bg-slate-50 p-4">
                  <Image
                    src={asset.src}
                    alt={asset.title}
                    width={asset.width}
                    height={asset.height}
                    unoptimized={asset.unoptimized}
                    className="max-h-52 w-auto max-w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black">{asset.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
                    {asset.description}
                  </p>
                </div>
                <a
                  href={asset.href}
                  download
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-black text-white hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Scarica
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-200" />
              <h2 className="text-xl font-black text-white">Linee guida</h2>
            </div>
            <ul className="grid gap-3 text-sm leading-7 text-slate-300">
              {guidelines.map((guideline) => (
                <li key={guideline} className="flex gap-3">
                  <ShieldCheck className="mt-1 h-4 w-4 flex-none text-teal-200" />
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-teal-200" />
              <h2 className="text-xl font-black text-white">Link ufficiali</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {officialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={
                      link.href.startsWith("mailto:") ? undefined : "noreferrer"
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-bold text-slate-100 hover:bg-white/10"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </a>
                );
              })}
            </div>
            <p className="mt-5 rounded-md border border-amber-200/20 bg-amber-200/10 px-3 py-2 text-sm font-semibold text-amber-50">
              Per richieste stampa, partnership, directory o community post:
              {" "}
              <a href={CONTACT_MAILTO} className="underline underline-offset-4">
                {CONTACT_EMAIL}
              </a>
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
