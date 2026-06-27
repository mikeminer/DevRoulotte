import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthConfirmPanel } from "@/components/auth-confirm-panel";

export const metadata: Metadata = {
  title: "Conferma email | DevRoulotte",
};

function AuthConfirmFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#080b10] px-4 text-white">
      <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
        <Loader2 className="h-4 w-4 animate-spin text-teal-200" />
        Caricamento link
      </div>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<AuthConfirmFallback />}>
      <AuthConfirmPanel />
    </Suspense>
  );
}
