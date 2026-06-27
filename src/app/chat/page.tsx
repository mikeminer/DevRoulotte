import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";

export const metadata: Metadata = {
  title: "Chat | DevRoulotte",
  description:
    "Entra nella video roulette DevRoulotte per parlare 5 minuti con un altro builder.",
};

export default function ChatPage() {
  return <HomeShell />;
}
