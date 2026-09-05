"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck, Wallet } from "lucide-react";

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type MembershipAccess = {
  active?: boolean;
  expiresAt?: number | null;
};

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}

async function discoverWallet() {
  const providers: Array<{ info?: { name?: string }; provider: InjectedProvider }> = [];
  const listener = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail?.provider) providers.push(detail);
  };
  window.addEventListener("eip6963:announceProvider", listener);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  await new Promise((resolve) => window.setTimeout(resolve, 150));
  window.removeEventListener("eip6963:announceProvider", listener);
  return providers.find((entry) => entry.info?.name?.toLowerCase().includes("zerion"))?.provider
    || providers[0]?.provider
    || window.ethereum;
}

export function TrustRewardsPass() {
  const [wallet, setWallet] = useState("");
  const [access, setAccess] = useState<MembershipAccess | null>(null);
  const [message, setMessage] = useState("Verifica il benefit #5 sul tuo wallet.");
  const [busy, setBusy] = useState(false);

  const verify = async () => {
    setBusy(true);
    try {
      const provider = await discoverWallet();
      if (!provider) throw new Error("Wallet EVM non trovato. Apri o installa Zerion.");
      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      const address = accounts[0];
      if (!address) throw new Error("Nessun account wallet selezionato.");
      const response = await fetch(`https://capital.devfridge.cool/api/rewards/${address}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("Verifica Trust Rewards momentaneamente non disponibile.");
      const payload = await response.json() as { access?: Record<string, MembershipAccess> };
      const benefit = payload.access?.["5"] || { active: false, expiresAt: null };
      setWallet(address);
      setAccess(benefit);
      setMessage(benefit.active ? "Accesso DevRoulotte attivo." : "Benefit #5 non attivo su questo wallet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Verifica non riuscita.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-lg border border-teal-300/20 bg-teal-300/[0.06] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-teal-100">
        <ShieldCheck className="h-4 w-4" />
        Trust Rewards pass
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-300">{message}</p>
      {wallet ? <p className="mt-2 text-[11px] text-slate-500">{wallet.slice(0, 8)}…{wallet.slice(-6)}</p> : null}
      {access?.active && access.expiresAt ? (
        <p className="mt-2 text-xs font-semibold text-teal-200">
          Valido fino al {new Date(access.expiresAt * 1000).toLocaleDateString("it-IT")}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={verify} disabled={busy} className="inline-flex h-9 items-center gap-2 rounded-md border border-teal-300/25 px-3 text-xs font-semibold text-teal-100 hover:bg-teal-300/10 disabled:opacity-50">
          <Wallet className="h-4 w-4" />
          {busy ? "Verifica…" : "Connetti Zerion"}
        </button>
        <a href="https://capital.devfridge.cool/rewards#devroulotte" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10">
          Riscatta accesso <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
