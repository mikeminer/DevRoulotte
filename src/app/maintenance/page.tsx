import Image from "next/image";
import type { Metadata } from "next";
import { MAINTENANCE_MESSAGE } from "@/lib/maintenance";

export const metadata: Metadata = {
  title: "Manutenzione | DevRoulotte",
  description: "DevRoulotte e' temporaneamente in manutenzione.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_34%),linear-gradient(180deg,#080b10_0%,#0d121a_54%,#080b10_100%)] px-4 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center gap-8 text-center">
        <Image
          src="/devroulotte-logo.png"
          alt="DevRoulotte"
          width={320}
          height={320}
          priority
          className="brand-mark-plate h-36 w-36 rounded-lg object-cover sm:h-44 sm:w-44"
        />
        <div className="grid gap-4">
          <div className="brand-wordmark-plate mx-auto rounded-lg px-3 py-2">
            <Image
              src="/devroulotte-banner.gif"
              alt="DevRoulotte"
              width={640}
              height={162}
              unoptimized
              priority
              className="h-auto w-72 max-w-full sm:w-96"
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
            Manutenzione in corso
          </p>
          <h1 className="text-3xl font-black tracking-normal text-white sm:text-5xl">
            Torniamo online a breve.
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {MAINTENANCE_MESSAGE}
          </p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-400">
          Nessun video o audio viene registrato. La roulotte riparte appena il
          fix e&apos; stabile.
        </div>
      </section>
    </main>
  );
}
