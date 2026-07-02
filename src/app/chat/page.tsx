import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";

export const metadata: Metadata = {
  title: "Giro 1:1 | DevRoulotte",
  description:
    "Entra nella roulotte live o indica la tua disponibilità per conoscere founder, builder e professionisti in match 1:1 casuali.",
};

export default function ChatPage() {
  return <HomeShell />;
}
