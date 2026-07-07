import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { StatusDashboard } from "@/components/status-dashboard";
import { getStatusPayload } from "@/lib/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status | DevRoulotte",
  description:
    "Stato pubblico dei servizi principali DevRoulotte.chat e contatto operativo.",
};

export default async function StatusPage() {
  const initialStatus = await getStatusPayload();

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al sito
        </Link>

        <p className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase text-teal-200">
          <Activity className="h-4 w-4" />
          DevRoulotte status
        </p>

        <StatusDashboard initialStatus={initialStatus} />
      </div>
    </main>
  );
}
