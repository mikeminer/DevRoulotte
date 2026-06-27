import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "DevRoulotte.chat | Il networking, senza appuntamenti",
  description:
    "Videochat peer-to-peer per conoscere developer, builder e maker italiani: entri nella roulotte, parli 5 minuti, trovi chi sta costruendo davvero.",
};

export default function Home() {
  return <LandingPage />;
}
