import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";

export const metadata: Metadata = {
  title: "Giro 1:1 | DevRoulotte",
  description:
    "Entra nella roulotte live e guarda la heatmap settimanale delle disponibilità dichiarate dalla community.",
};

export default function ChatPage() {
  return <HomeShell />;
}
