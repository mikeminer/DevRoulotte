import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "DevRoulotte.chat | Networking di primo impatto per builder",
  description:
    "Il primo incontro live per conoscere al volo developer, founder, builder e professionisti italiani: zero link, video 1:1 peer-to-peer, Premium Card e parola di sintonia.",
};

export default function Home() {
  return <LandingPage />;
}
