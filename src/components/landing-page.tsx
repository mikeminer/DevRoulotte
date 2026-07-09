import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarX,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Handshake,
  KeyRound,
  Linkedin,
  Mail,
  MessageSquareText,
  Network,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Video,
  Wrench,
  Zap,
} from "lucide-react";
import { BuilderSponsorPopup } from "@/components/builder-sponsor-popup";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { GdprFooterBadge } from "@/components/gdpr-footer-badge";
import { LandingStoryScene } from "@/components/landing-story-scene";
import { RealtimeUsersBadge } from "@/components/realtime-users-badge";
import { ShippingBadges } from "@/components/shipping-badges";
import {
  CONTACT_EMAIL,
  LEGAL_CONTACT_MAILTO,
  LINKEDIN_COMPANY_URL,
  WORKSHOP_FEEDBACK_URL,
} from "@/lib/app-config";

export type LandingLocale = "it" | "en";

const heroMetrics = [
  {
    value: "0 link",
    label: "niente inviti meeting da creare o inoltrare",
  },
  {
    value: "P2P",
    label: "video WebRTC diretto quando la rete lo permette",
  },
  {
    value: "1 click",
    label: "contatti e profili dalla Premium Card",
  },
];

const heroMetricsEn = [
  {
    value: "0 links",
    label: "no meeting invites to create or forward",
  },
  {
    value: "P2P",
    label: "direct WebRTC video when the network allows it",
  },
  {
    value: "1 click",
    label: "profiles and contacts through the Premium Card",
  },
];

const gapItems = [
  {
    title: "LinkedIn e DM creano contatto, non presenza.",
    body: "Scrivi, aspetti, perdi contesto. La persona resta un profilo, non una voce con cui capire subito se c'è energia.",
    icon: MessageSquareText,
  },
  {
    title: "Calendly risolve il calendario, non il primo impatto.",
    body: "Va benissimo quando avete già deciso di parlarvi. Ma prima devi ancora capire se quella call merita di esistere.",
    icon: CalendarX,
  },
  {
    title: "Meet e Zoom iniziano quando il meeting esiste già.",
    body: "DevRoulotte riempie lo spazio prima: il momento in cui due persone ancora non si conoscono, ma potrebbero avere un motivo per parlarsi.",
    icon: Video,
  },
];

const gapItemsEn = [
  {
    title: "LinkedIn and DMs create contact, not presence.",
    body: "You write, wait and lose context. The other person stays a profile, not a real voice you can read in seconds.",
    icon: MessageSquareText,
  },
  {
    title: "Calendly fixes scheduling, not the first impression.",
    body: "It works when you have already decided to talk. Before that, you still need to know whether the call is worth existing.",
    icon: CalendarX,
  },
  {
    title: "Meet and Zoom start after the meeting already exists.",
    body: "DevRoulotte fills the space before it: when two people do not know each other yet, but may have a good reason to talk.",
    icon: Video,
  },
];

const flowSteps = [
  {
    eyebrow: "01",
    title: "Entri nella roulotte",
    body: "Login social, email o accesso ospite limitato. Confermi 18+ e regole community, poi accendi webcam e microfono.",
    icon: PlayCircle,
  },
  {
    eyebrow: "02",
    title: "Incontri una persona 1:1",
    body: "Il sistema ti mette davanti un altro developer, founder, builder o professionista. Niente directory pubbliche, niente cold outreach.",
    icon: UsersRound,
  },
  {
    eyebrow: "03",
    title: "Capisci in pochi minuti se c'è sostanza",
    body: "Feedback, collaborazione, idea, contatto utile o semplice conversazione vera. Se non funziona, passi oltre senza attrito.",
    icon: Gauge,
  },
  {
    eyebrow: "04",
    title: "Scambi valore senza perdere tempo",
    body: "Con la Premium Card puoi mostrare sito, GitHub, social, progetto e contatti con un click, mentre la conversazione resta sulla sostanza.",
    icon: Sparkles,
  },
];

const flowStepsEn = [
  {
    eyebrow: "01",
    title: "Enter the roulotte",
    body: "Use social login, email or limited guest access. Confirm 18+ and the community rules, then enable camera and microphone.",
    icon: PlayCircle,
  },
  {
    eyebrow: "02",
    title: "Meet one person 1:1",
    body: "The system puts you in front of another developer, founder, builder or professional. No public directory, no cold outreach.",
    icon: UsersRound,
  },
  {
    eyebrow: "03",
    title: "Find out quickly if there is substance",
    body: "Feedback, collaboration, an idea, a useful contact or simply a real conversation. If it does not work, move on without friction.",
    icon: Gauge,
  },
  {
    eyebrow: "04",
    title: "Exchange value without wasting time",
    body: "With the Premium Card you can show website, GitHub, socials, project and contact links in one click, while the conversation stays focused.",
    icon: Sparkles,
  },
];

const comparisonRows = [
  {
    tool: "Google Meet / Zoom",
    strength: "ottimi per riunioni già decise",
    devroulotte: "fa nascere il primo incontro live",
  },
  {
    tool: "Calendly",
    strength: "coordina disponibilità e appuntamenti",
    devroulotte: "toglie il bisogno di fissare una call conoscitiva",
  },
  {
    tool: "LinkedIn / DM",
    strength: "identità, profili, reach professionale",
    devroulotte: "porta subito da profilo scritto a presenza reale",
  },
  {
    tool: "Lunchclub / mentorship",
    strength: "introduzioni e percorsi più curati",
    devroulotte: "mantiene casualità, immediatezza e leggerezza",
  },
  {
    tool: "Chatroulette",
    strength: "immediatezza del video casuale",
    devroulotte: "orientamento professionale, 18+, safety e biglietto integrato",
  },
];

const comparisonRowsEn = [
  {
    tool: "Google Meet / Zoom",
    strength: "great for meetings that are already decided",
    devroulotte: "creates the first live professional encounter",
  },
  {
    tool: "Calendly",
    strength: "coordinates availability and appointments",
    devroulotte: "removes the need to schedule a discovery call first",
  },
  {
    tool: "LinkedIn / DMs",
    strength: "identity, profiles and professional reach",
    devroulotte: "turns written profiles into real presence immediately",
  },
  {
    tool: "Lunchclub / mentorship",
    strength: "more curated introductions and paths",
    devroulotte: "keeps randomness, immediacy and lightweight access",
  },
  {
    tool: "Chatroulette",
    strength: "instant random video",
    devroulotte: "professional framing, 18+, safety and integrated contact card",
  },
];

const audienceItems = [
  "Founder che vogliono uscire dalla propria bolla.",
  "Developer che cercano feedback su prodotto, repository o stack.",
  "Builder che vogliono conoscere persone prima di fissare call lunghe.",
  "Professionisti che preferiscono una stretta di mano live a dieci messaggi freddi.",
];

const audienceItemsEn = [
  "Founders who want to get outside their usual bubble.",
  "Developers looking for quick feedback on a product, repository or stack.",
  "Builders who want to meet people before scheduling longer calls.",
  "Professionals who prefer a live first impression over ten cold messages.",
];

const premiumFeatures = [
  "match illimitati",
  "chiamate da 15 minuti",
  "filtri completi",
  "priorità nel matching",
  "parola di sintonia",
  "Premium Card",
];

const premiumFeaturesEn = [
  "unlimited matches",
  "15-minute calls",
  "full filters",
  "priority matching",
  "sync keyword",
  "Premium Card",
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
    guest: "-",
    registered: "solo lingua",
    premium: "tutti",
  },
  {
    label: "Coda prioritaria",
    guest: "-",
    registered: "-",
    premium: "sì",
  },
  {
    label: "Parola di sintonia",
    guest: "-",
    registered: "-",
    premium: "sì",
  },
  {
    label: "Premium Card",
    guest: "-",
    registered: "-",
    premium: "sì",
  },
  {
    label: "Pubblicità",
    guest: "sì",
    registered: "sì",
    premium: "nessuna",
  },
];

const tierRowsEn = [
  {
    label: "Call duration",
    guest: "2 min",
    registered: "5 min",
    premium: "15 min",
  },
  {
    label: "Matches / day",
    guest: "3",
    registered: "15",
    premium: "unlimited",
  },
  {
    label: "Language / stack / region filter",
    guest: "-",
    registered: "language only",
    premium: "all",
  },
  {
    label: "Priority queue",
    guest: "-",
    registered: "-",
    premium: "yes",
  },
  {
    label: "Sync keyword",
    guest: "-",
    registered: "-",
    premium: "yes",
  },
  {
    label: "Premium Card",
    guest: "-",
    registered: "-",
    premium: "yes",
  },
  {
    label: "Ads",
    guest: "yes",
    registered: "yes",
    premium: "none",
  },
];

const trustItems = [
  {
    title: "Nessuna registrazione audio/video",
    body: "Le chiamate sono live. DevRoulotte non salva registrazioni delle conversazioni.",
    icon: ShieldCheck,
  },
  {
    title: "Regole 18+ e report",
    body: "Gate 18+, regole community, Stop, Next, Report, rate limit e strumenti di ban.",
    icon: CheckCircle2,
  },
  {
    title: "Pensata per primi incontri brevi",
    body: "Non devi convincerti a restare: il prodotto funziona se in pochi minuti capisci se vale la pena continuare.",
    icon: Clock3,
  },
];

const trustItemsEn = [
  {
    title: "No audio/video recording",
    body: "Calls are live. DevRoulotte does not save recordings of conversations.",
    icon: ShieldCheck,
  },
  {
    title: "18+ rules and reporting",
    body: "18+ gate, community rules, Stop, Next, Report, rate limits and ban tools.",
    icon: CheckCircle2,
  },
  {
    title: "Built for short first meetings",
    body: "You do not need to convince yourself to stay: the product works when you can tell in minutes whether to continue.",
    icon: Clock3,
  },
];

const landingText = {
  it: {
    navHow: "Come funziona",
    navPremium: "Premium",
    navSafety: "Safety",
    navMediaKit: "Media kit",
    headerCta: "Entra",
    primaryCta: "Entra nella roulotte",
    heroBadge: "Networking di primo impatto",
    heroTitle: "DevRoulotte.chat",
    heroLead:
      "Il primo incontro live per conoscere al volo developer, founder, builder e professionisti italiani.",
    heroBody:
      "Prima c'erano DM, email e call rimandate. Qui entri, parli 1:1 subito e capisci se vale la pena continuare.",
    whyCta: "Perché è diverso",
    gapEyebrow: "Il gap",
    gapTitle: "Non un altro tool per meeting. Lo spazio prima del meeting.",
    gapBody:
      "Una pagina principale efficace non deve spiegare tutto: deve far capire in pochi secondi quale fatica elimina. Qui la fatica è trasformare contatti freddi in conversazioni vive.",
    flowEyebrow: "Come funziona",
    flowTitle:
      "Una stretta di mano online, ma senza tutto il teatro intorno.",
    flowBody:
      "La psicologia è semplice: meno decisioni prima, più esperienza subito. La CTA non promette una community astratta: promette un'azione concreta, entrare nella roulotte.",
    positioningEyebrow: "Positioning",
    positioningTitle:
      "DevRoulotte non sostituisce gli altri strumenti. Li anticipa.",
    comparisonTool: "Alternativa",
    comparisonStrength: "Cosa fa bene",
    comparisonDevroulotte: "Dove entra DevRoulotte",
    audienceEyebrow: "Per chi",
    audienceTitle:
      "Per chi preferisce scoprire persone al volo invece di inseguire risposte.",
    audienceBody:
      "DevRoulotte è volutamente leggero: non devi cercare nella directory giusta, scrivere il messaggio perfetto o aspettare che qualcuno apra il calendario.",
    premiumEyebrow: "Premium",
    premiumTitle:
      "Premium serve quando il primo impatto deve diventare follow-up.",
    premiumBody:
      "A 3,99 €/mese non compra una promessa magica: compra meno attrito. Più tempo, più filtri, priorità, parola di sintonia e un biglietto da visita che evita lo scambio manuale dei contatti.",
    syncTitle: "Parola di sintonia",
    syncBody:
      "Se due persone inseriscono la stessa parola, il sistema può sintonizzarle tra loro senza scambiarsi subito contatti o link. Utile per ritrovarsi al volo mantenendo il formato DevRoulotte.",
    cardTitle: "Premium Card",
    cardBody:
      "Sito, GitHub, social, progetto, stack e contatti in un biglietto digitale condivisibile durante la chiamata. Meno tempo a segnarsi link, più tempo a capire se c'è sostanza.",
    tiersEyebrow: "Piani",
    tiersTitle: "Gratis per provare. Premium per usarla senza frizione.",
    tiersFeature: "Feature",
    tiersGuest: "Ospite",
    tiersRegistered: "Registrato",
    tiersPremium: "Premium",
    trustEyebrow: "Trust",
    trustTitle: "Video live, ma con confini chiari.",
    workshopEyebrow: "In officina",
    workshopTitle: "Aiutami a capire cosa rende DevRoulotte davvero utile.",
    workshopBody:
      "Bug, ottimizzazioni, posizionamento, tier o nuove funzionalità: ogni feedback aiuta a trasformare il primo impatto in un prodotto che le persone tornano a usare.",
    workshopCta: "Lascia feedback",
    finalEyebrow: "Call to action",
    finalTitle: "Non devi fissare una call. Devi solo salire a bordo.",
    finalBody:
      "Se c'è valore, lo senti subito. Se non c'è, hai perso pochi minuti invece di una settimana di messaggi.",
    safetyCta: "Sicurezza e regole",
    footerClaim:
      "DevRoulotte.chat · networking di primo impatto · solo utenti 18+ · niente registrazioni audio/video.",
    privacy: "Privacy",
    cookies: "Cookie",
    terms: "Terms",
    workshopLink: "In officina",
    legalContacts: `Contatti legali: ${CONTACT_EMAIL}`,
    storyEyebrow: "Storia",
    storyTitle:
      "La roulotte non promette il match perfetto. Apre una porta.",
    storyBody:
      "Una persona alla volta, pochi minuti, abbastanza poco per entrare e abbastanza tanto per cambiare traiettoria.",
  },
  en: {
    navHow: "How it works",
    navPremium: "Premium",
    navSafety: "Safety",
    navMediaKit: "Media kit",
    headerCta: "Enter",
    primaryCta: "Enter the roulotte",
    heroBadge: "First-impression networking",
    heroTitle: "DevRoulotte.chat",
    heroLead:
      "The first live meeting for discovering developers, founders, builders and professionals.",
    heroBody:
      "Before, there were DMs, emails and delayed calls. Here you enter, talk 1:1 immediately and decide whether it is worth continuing.",
    whyCta: "Why it is different",
    gapEyebrow: "The gap",
    gapTitle: "Not another meeting tool. The space before the meeting.",
    gapBody:
      "A strong homepage should not explain everything: it should make the removed friction obvious in seconds. Here the friction is turning cold contacts into live conversations.",
    flowEyebrow: "How it works",
    flowTitle: "An online handshake, without the ceremony around it.",
    flowBody:
      "The psychology is simple: fewer decisions before, more experience immediately. The CTA does not promise an abstract community: it promises a concrete action, entering the roulotte.",
    positioningEyebrow: "Positioning",
    positioningTitle:
      "DevRoulotte does not replace the other tools. It comes before them.",
    comparisonTool: "Alternative",
    comparisonStrength: "What it does well",
    comparisonDevroulotte: "Where DevRoulotte fits",
    audienceEyebrow: "Who it is for",
    audienceTitle:
      "For people who would rather discover someone live than chase replies.",
    audienceBody:
      "DevRoulotte is intentionally lightweight: you do not need to find the right directory, write the perfect message or wait for someone to open a calendar.",
    premiumEyebrow: "Premium",
    premiumTitle:
      "Premium is for when a first impression should become a follow-up.",
    premiumBody:
      "At €3.99/month, it does not buy a magic promise: it buys less friction. More time, more filters, priority, a sync keyword and a contact card that avoids manual link exchange.",
    syncTitle: "Sync keyword",
    syncBody:
      "If two people enter the same word, the system can tune them to each other without exchanging contacts or links first. Useful for meeting quickly while keeping the DevRoulotte format.",
    cardTitle: "Premium Card",
    cardBody:
      "Website, GitHub, socials, project, stack and contact links in a digital card you can share during the call. Less time copying links, more time finding substance.",
    tiersEyebrow: "Plans",
    tiersTitle: "Free to try. Premium to use it without friction.",
    tiersFeature: "Feature",
    tiersGuest: "Guest",
    tiersRegistered: "Registered",
    tiersPremium: "Premium",
    trustEyebrow: "Trust",
    trustTitle: "Live video, with clear boundaries.",
    workshopEyebrow: "Workshop",
    workshopTitle: "Help me understand what makes DevRoulotte truly useful.",
    workshopBody:
      "Bugs, optimizations, positioning, tiers or new features: every piece of feedback helps turn first-impression networking into a product people come back to.",
    workshopCta: "Leave feedback",
    finalEyebrow: "Call to action",
    finalTitle: "You do not need to schedule a call. Just get on board.",
    finalBody:
      "If there is value, you feel it immediately. If not, you lost a few minutes instead of a week of messages.",
    safetyCta: "Safety and rules",
    footerClaim:
      "DevRoulotte.chat · first-impression networking · 18+ only · no audio/video recordings.",
    privacy: "Privacy",
    cookies: "Cookies",
    terms: "Terms",
    workshopLink: "Workshop",
    legalContacts: `Legal contact: ${CONTACT_EMAIL}`,
    storyEyebrow: "Story",
    storyTitle: "The roulotte does not promise the perfect match. It opens a door.",
    storyBody:
      "One person at a time, a few minutes, short enough to enter and long enough to change direction.",
  },
};

function PrimaryCta({
  surface,
  ctaId,
  children = "Entra nella roulotte",
}: {
  surface: string;
  ctaId: string;
  children?: string;
}) {
  return (
    <Link
      href="/chat"
      data-analytics-event="cta_clicked"
      data-analytics-surface={surface}
      data-analytics-cta-id={ctaId}
      data-analytics-destination="chat"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function LandingPage({ locale = "it" }: { locale?: LandingLocale }) {
  const copy = landingText[locale];
  const isEnglish = locale === "en";
  const metrics = isEnglish ? heroMetricsEn : heroMetrics;
  const gapCards = isEnglish ? gapItemsEn : gapItems;
  const steps = isEnglish ? flowStepsEn : flowSteps;
  const comparisons = isEnglish ? comparisonRowsEn : comparisonRows;
  const audience = isEnglish ? audienceItemsEn : audienceItems;
  const premium = isEnglish ? premiumFeaturesEn : premiumFeatures;
  const rows = isEnglish ? tierRowsEn : tierRows;
  const trust = isEnglish ? trustItemsEn : trustItems;

  return (
    <main
      lang={locale}
      className="theme-page mobile-safe-area min-h-screen w-full max-w-full overflow-hidden bg-[#070a0f] text-white"
    >
      <BuilderSponsorPopup locale={locale} />
      <section className="relative min-h-[92svh] border-b border-white/10 px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_4%,rgba(45,212,191,0.26),transparent_27%),radial-gradient(circle_at_86%_8%,rgba(252,211,77,0.18),transparent_22%),linear-gradient(180deg,#080b10_0%,#0d121a_58%,#08100f_100%)]" />
        <Image
          src="/devroulotte-roulotte-transparent.png"
          alt=""
          aria-hidden="true"
          width={1040}
          height={850}
          priority
          className="pointer-events-none absolute bottom-4 right-[-220px] z-0 w-[680px] max-w-none opacity-35 drop-shadow-[0_28px_90px_rgba(45,212,191,0.22)] sm:right-[-170px] sm:opacity-50 lg:right-[-120px] lg:w-[640px] lg:opacity-45 xl:right-[-80px] xl:w-[700px] xl:opacity-90 2xl:right-8 2xl:w-[760px]"
        />

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-white/10 py-3">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <Image
              src="/devroulotte-wordmark.png"
              alt="DevRoulotte"
              width={1200}
              height={294}
              priority
              className="brand-wordmark h-auto w-44 max-w-[58vw] sm:w-60"
            />
          </Link>
          <nav className="hidden items-center gap-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 md:flex">
            <a href="#come-funziona" className="hover:text-white">
              {copy.navHow}
            </a>
            <a href="#premium" className="hover:text-white">
              {copy.navPremium}
            </a>
            <a href="#safety" className="hover:text-white">
              {copy.navSafety}
            </a>
            <Link href="/mediakit" className="hover:text-white">
              {copy.navMediaKit}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <RealtimeUsersBadge
              scope="site"
              surface="landing"
              locale={locale}
              className="hidden sm:inline-flex"
            />
            <PrimaryCta surface="landing_header" ctaId="header_enter">
              {copy.headerCta}
            </PrimaryCta>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(92svh-92px)] max-w-7xl content-center gap-10 py-12 lg:grid-cols-[minmax(0,700px)_1fr] lg:py-8">
          <div className="grid gap-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-teal-100">
              <Zap className="h-4 w-4" />
              {copy.heroBadge}
            </div>

            <div className="grid gap-5">
              <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
                {copy.heroTitle}
              </h1>
              <p className="max-w-[620px] text-xl font-bold leading-8 text-slate-100 sm:text-2xl sm:leading-10">
                {copy.heroLead}
              </p>
              <p className="max-w-[590px] text-base font-semibold leading-8 text-slate-300 sm:text-lg">
                {copy.heroBody}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryCta surface="landing_hero" ctaId="hero_enter">
                {copy.primaryCta}
              </PrimaryCta>
              <a
                href="#perche"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-sm font-bold text-slate-100 transition hover:bg-white/10"
              >
                {copy.whyCta}
                <Network className="h-4 w-4" />
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.value}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                >
                  <p className="text-2xl font-black text-teal-200">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      <section
        id="perche"
        className="border-b border-white/10 bg-[#f7efe1] px-4 py-16 text-slate-950 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="grid gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
              {copy.gapEyebrow}
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              {copy.gapTitle}
            </h2>
            <p className="text-base font-semibold leading-8 text-slate-700 sm:text-lg">
              {copy.gapBody}
            </p>
            <PrimaryCta surface="landing_gap" ctaId="gap_enter">
              {copy.primaryCta}
            </PrimaryCta>
          </div>

          <div className="grid gap-4">
            {gapCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="grid gap-3 rounded-lg border border-slate-950/10 bg-white/70 p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-950 text-teal-200">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="grid gap-2">
                      <h3 className="text-lg font-black text-slate-950">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold leading-7 text-slate-700">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="come-funziona"
        className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-10">
          <div className="grid max-w-3xl gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.flowEyebrow}
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.flowTitle}
            </h2>
            <p className="text-base font-semibold leading-8 text-slate-300">
              {copy.flowBody}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm font-black text-teal-200">
                      {step.eyebrow}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-300 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                    {step.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.035] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">
              {copy.positioningEyebrow}
            </p>
            <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.positioningTitle}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.05] text-white">
                <tr>
                  <th className="w-[24%] px-4 py-4 font-black">
                    {copy.comparisonTool}
                  </th>
                  <th className="w-[38%] px-4 py-4 font-black">
                    {copy.comparisonStrength}
                  </th>
                  <th className="px-4 py-4 font-black">
                    {copy.comparisonDevroulotte}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.tool} className="border-t border-white/10">
                    <th className="px-4 py-4 font-bold text-white">
                      {row.tool}
                    </th>
                    <td className="px-4 py-4 font-semibold leading-6 text-slate-300">
                      {row.strength}
                    </td>
                    <td className="px-4 py-4 font-semibold leading-6 text-teal-100">
                      {row.devroulotte}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="grid gap-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.audienceEyebrow}
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.audienceTitle}
            </h2>
            <p className="text-base font-semibold leading-8 text-slate-300">
              {copy.audienceBody}
            </p>
          </div>

          <div className="grid gap-3">
            {audience.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
                <p className="text-sm font-semibold leading-7 text-slate-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="premium"
        className="border-b border-white/10 bg-[#11131a] px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">
              {copy.premiumEyebrow}
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.premiumTitle}
            </h2>
            <p className="text-base font-semibold leading-8 text-slate-300">
              {copy.premiumBody}
            </p>
            <div className="flex flex-wrap gap-2">
              {premium.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-2 text-xs font-bold text-amber-100"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-lg border border-amber-200/30 bg-amber-200/10 p-5">
              <div className="flex items-start gap-3">
                <KeyRound className="mt-1 h-6 w-6 shrink-0 text-amber-200" />
                <div className="grid gap-2">
                  <h3 className="text-2xl font-black text-white">
                    {copy.syncTitle}
                  </h3>
                  <p className="text-sm font-semibold leading-7 text-amber-50/80">
                    {copy.syncBody}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-teal-200/25 bg-teal-200/10 p-5">
              <div className="flex items-start gap-3">
                <Handshake className="mt-1 h-6 w-6 shrink-0 text-teal-200" />
                <div className="grid gap-2">
                  <h3 className="text-2xl font-black text-white">
                    {copy.cardTitle}
                  </h3>
                  <p className="text-sm font-semibold leading-7 text-teal-50/80">
                    {copy.cardBody}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.tiersEyebrow}
            </p>
            <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.tiersTitle}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.05] text-white">
                <tr>
                  <th className="w-[34%] px-4 py-4 font-black">
                    {copy.tiersFeature}
                  </th>
                  <th className="px-4 py-4 font-black">{copy.tiersGuest}</th>
                  <th className="px-4 py-4 font-black">
                    {copy.tiersRegistered}
                  </th>
                  <th className="px-4 py-4 font-black text-amber-100">
                    {copy.tiersPremium}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th className="px-4 py-4 font-semibold text-white">
                      {row.label}
                    </th>
                    <td className="px-4 py-4 font-semibold text-slate-300">
                      {row.guest}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-300">
                      {row.registered}
                    </td>
                    <td className="px-4 py-4 font-semibold text-amber-100">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="safety" className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <div className="grid gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.trustEyebrow}
            </p>
            <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.trustTitle}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trust.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
                >
                  <Icon className="h-6 w-6 text-teal-200" />
                  <h3 className="mt-4 text-xl font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {isEnglish ? (
        <section className="border-b border-white/10 bg-[#0b1017] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.storyEyebrow}
            </p>
            <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
              {copy.storyTitle}
            </h2>
            <p className="max-w-3xl text-base font-semibold leading-8 text-slate-300 sm:text-lg">
              {copy.storyBody}
            </p>
          </div>
        </section>
      ) : (
        <LandingStoryScene />
      )}

      <section
        id="in-officina"
        className="border-y border-white/10 bg-white/[0.035] px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="grid gap-3">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
              <Wrench className="h-4 w-4" />
              {copy.workshopEyebrow}
            </p>
            <h2 className="max-w-3xl text-3xl font-black tracking-normal text-white sm:text-4xl">
              {copy.workshopTitle}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {copy.workshopBody}
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 transition hover:bg-teal-200"
          >
            {copy.workshopCta}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-7">
          <div className="grid max-w-4xl gap-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">
              {copy.finalEyebrow}
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">
              {copy.finalTitle}
            </h2>
            <p className="max-w-2xl text-lg font-bold leading-8 text-slate-300">
              {copy.finalBody}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryCta surface="landing_final" ctaId="final_enter">
              {copy.primaryCta}
            </PrimaryCta>
            <Link
              href="/safety"
              data-analytics-event="cta_clicked"
              data-analytics-surface="landing_final"
              data-analytics-cta-id="final_safety"
              data-analytics-destination="safety"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-sm font-bold text-slate-100 transition hover:bg-white/10"
            >
              <ShieldCheck className="h-4 w-4" />
              {copy.safetyCta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{copy.footerClaim}</span>
            <div className="flex flex-wrap items-center gap-3">
              <GdprFooterBadge />
              <Link href="/privacy" className="text-slate-300 hover:text-white">
                {copy.privacy}
              </Link>
              <Link href="/cookies" className="text-slate-300 hover:text-white">
                {copy.cookies}
              </Link>
              <Link href="/terms" className="text-slate-300 hover:text-white">
                {copy.terms}
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
                {copy.workshopLink}
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
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                {copy.legalContacts}
              </a>
              <CookiePreferencesButton className="text-slate-300 hover:text-white" />
            </div>
          </div>

          <ShippingBadges surface="landing_footer" />
        </div>
      </footer>
    </main>
  );
}
