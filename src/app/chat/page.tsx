import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";

export const metadata: Metadata = {
  title: "Chat | DevRoulotte",
  description:
    "Entra nella roulotte DevRoulotte per conoscere un altro builder in videochat peer-to-peer.",
};

export default function ChatPage() {
  return <HomeShell />;
}
