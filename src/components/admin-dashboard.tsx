"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Ban, Loader2, RefreshCw, Shield } from "lucide-react";

type AdminData = {
  profiles: Array<Record<string, unknown>>;
  subscriptions: Array<Record<string, unknown>>;
  reports: Array<Record<string, unknown>>;
  bans: Array<Record<string, unknown>>;
  matches: Array<Record<string, unknown>>;
};

function asText(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function DataTable({
  title,
  rows,
  columns,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  columns: string[];
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-sm font-semibold text-white">
        {title}{" "}
        <span className="text-xs font-normal text-slate-500">({rows.length})</span>
      </h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-3 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="text-slate-300">
                {columns.map((column) => (
                  <td key={column} className="max-w-[260px] truncate px-3 py-2">
                    {asText(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-slate-500">
            Nessun dato.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [banActorType, setBanActorType] = useState<"guest" | "user">("guest");
  const [banActorId, setBanActorId] = useState("");
  const [banReason, setBanReason] = useState("Ban manuale admin");

  async function loadAdmin() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        headers: { "x-admin-token": token },
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Admin non autorizzato");
      }

      setData(payload as AdminData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore admin");
    } finally {
      setLoading(false);
    }
  }

  async function submitBan(action: "ban" | "unban") {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/ban", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          actorType: banActorType,
          actorId: banActorId,
          reason: banReason,
          action,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Operazione fallita");
      }

      setMessage(action === "ban" ? "Utente bannato." : "Utente sbannato.");
      await loadAdmin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Operazione fallita");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b10] px-4 py-5 text-white sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla chat
          </Link>
          <div className="inline-flex items-center gap-2 text-sm text-slate-400">
            <Shield className="h-4 w-4 text-teal-200" />
            Dashboard admin
          </div>
        </div>

        <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-xs text-slate-300">
            Admin token
            <input
              className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              type="password"
              placeholder="ADMIN_ACCESS_TOKEN"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadAdmin()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-teal-300 px-4 text-sm font-bold text-slate-950 hover:bg-teal-200 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Carica
          </button>
        </section>

        <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[160px_1fr_1fr_auto_auto]">
          <select
            className="h-10 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-white"
            value={banActorType}
            onChange={(event) => setBanActorType(event.target.value as "guest" | "user")}
          >
            <option value="guest">guest</option>
            <option value="user">user</option>
          </select>
          <input
            className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            value={banActorId}
            onChange={(event) => setBanActorId(event.target.value)}
            placeholder="actor UUID"
          />
          <input
            className="h-10 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
            placeholder="motivo"
          />
          <button
            type="button"
            onClick={() => void submitBan("ban")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-rose-300/30 px-3 text-sm font-semibold text-rose-100 hover:bg-rose-300/10"
          >
            <Ban className="h-4 w-4" />
            Ban
          </button>
          <button
            type="button"
            onClick={() => void submitBan("unban")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 px-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Sban
          </button>
        </section>

        {message ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">
            {message}
          </p>
        ) : null}

        {data ? (
          <div className="grid gap-4">
            <DataTable
              title="Utenti registrati"
              rows={data.profiles}
              columns={["id", "display_name", "language", "country", "created_at"]}
            />
            <DataTable
              title="Report"
              rows={data.reports}
              columns={[
                "id",
                "reported_actor_type",
                "reported_actor_id",
                "reason",
                "status",
                "created_at",
              ]}
            />
            <DataTable
              title="Ban"
              rows={data.bans}
              columns={[
                "id",
                "actor_type",
                "actor_id",
                "shadow",
                "active",
                "reason",
                "expires_at",
              ]}
            />
            <DataTable
              title="Abbonamenti"
              rows={data.subscriptions}
              columns={[
                "actor_type",
                "actor_id",
                "status",
                "paypal_subscription_id",
                "current_period_end",
              ]}
            />
            <DataTable
              title="Match logs"
              rows={data.matches}
              columns={[
                "id",
                "actor_a_type",
                "actor_a_id",
                "actor_b_type",
                "actor_b_id",
                "status",
                "started_at",
              ]}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
