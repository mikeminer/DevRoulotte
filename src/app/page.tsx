import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "DevRoulotte.chat | Il networking, senza appuntamenti",
  description:
    "Video roulette per developer, builder e maker italiani: 5 minuti, un builder alla volta.",
};

export default function Home() {
  return <LandingPage />;
}
