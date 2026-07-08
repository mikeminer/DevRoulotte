import type { Metadata } from "next";
import { headers } from "next/headers";
import { LandingPage } from "@/components/landing-page";
import type { LandingLocale } from "@/components/landing-page";

export const dynamic = "force-dynamic";

const metadataByLocale: Record<LandingLocale, Metadata> = {
  it: {
    title: "DevRoulotte.chat | Networking di primo impatto per builder",
    description:
      "Il primo incontro live per conoscere al volo developer, founder, builder e professionisti italiani: zero link, video 1:1 peer-to-peer, Premium Card e parola di sintonia.",
  },
  en: {
    title: "DevRoulotte.chat | First-impression networking for builders",
    description:
      "The first live meeting for discovering developers, founders, builders and professionals: zero links, 1:1 peer-to-peer video, Premium Card and private sync keyword.",
  },
};

function detectLandingLocale(requestHeaders: Headers): LandingLocale {
  const country = requestHeaders.get("x-vercel-ip-country")?.toUpperCase();

  if (country) {
    return country === "IT" ? "it" : "en";
  }

  const acceptLanguage = requestHeaders
    .get("accept-language")
    ?.toLowerCase();

  return acceptLanguage?.startsWith("it") ? "it" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = detectLandingLocale(await headers());

  return metadataByLocale[locale];
}

export default async function Home() {
  const locale = detectLandingLocale(await headers());

  return <LandingPage locale={locale} />;
}
