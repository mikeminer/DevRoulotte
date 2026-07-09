import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevRoulotte.chat",
    short_name: "DevRoulotte",
    description:
      "Networking 1:1 live per developer, founder, builder e professionisti.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070a0f",
    theme_color: "#070a0f",
    categories: ["business", "productivity", "social"],
    lang: "it",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Entra nella roulotte",
        short_name: "Chat",
        description: "Apri la stanza 1:1 live.",
        url: "/chat",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
      {
        name: "Profilo",
        short_name: "Profilo",
        description: "Gestisci profilo, login e Premium Card.",
        url: "/profile",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
    ],
  };
}
