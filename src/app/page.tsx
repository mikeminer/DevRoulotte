import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "DevRoulotte.chat | Incontri casuali, ma non a caso",
  description:
    "Il superconnector 1:1 per conoscere casualmente founder, builder e professionisti italiani, con opt-in leggero e video peer-to-peer.",
};

export default function Home() {
  return <LandingPage />;
}
