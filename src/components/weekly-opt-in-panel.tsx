"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { buildActorHeaders, getOrCreateGuestId } from "@/lib/client-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getWeeklyOptInSlotId,
  weeklyOptInDays,
  weeklyOptInGoals,
  weeklyOptInInitialState,
  weeklyOptInSlots,
  type WeeklyOptIn,
} from "@/lib/weekly-opt-in";

const storageKey = "devroulotte_weekly_opt_in_v2";

type CountBucket = {
  id: string;
  count: number;
};

type CountPayload = {
  max: number;
  values: CountBucket[];
};

type WeeklyOptInResponse = {
  weekStart: string;
  nextResetAt: string;
  totalOptIns: number;
  heatmap: {
    slots: CountPayload;
    goals: CountPayload;
  };
  own: WeeklyOptIn;
};

function readStoredOptIn() {
  if (typeof window === "undefined") {
    return weeklyOptInInitialState;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    return stored ? (JSON.parse(stored) as WeeklyOptIn) : weeklyOptInInitialState;
  } catch {
    return weeklyOptInInitialState;
  }
}

function emptyCountPayload(ids: readonly string[]): CountPayload {
  return {
    max: 0,
    values: ids.map((id) => ({ id, count: 0 })),
  };
}

function countMap(payload: CountPayload) {
  return new Map(payload.values.map((item) => [item.id, item.count]));
}

function formatResetAt(value: string | null) {
  if (!value) {
    return "inizio prossima settimana";
  }

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function intensityClass(count: number, max: number, selected: boolean) {
  if (selected) {
    return "border-teal-100 bg-teal-300 text-slate-950 shadow-[0_0_22px_rgba(94,234,212,0.36)]";
  }

  if (count <= 0 || max <= 0) {
    return "border-white/10 bg-black/10 text-slate-500 hover:bg-white/10";
  }

  const level = Math.ceil((count / max) * 4);

  if (level >= 4) {
    return "border-teal-200/70 bg-teal-300/70 text-white shadow-[0_0_18px_rgba(94,234,212,0.22)] hover:bg-teal-300/80";
  }

  if (level === 3) {
    return "border-teal-200/50 bg-teal-300/45 text-teal-50 hover:bg-teal-300/55";
  }

  if (level === 2) {
    return "border-teal-200/35 bg-teal-300/25 text-teal-50 hover:bg-teal-300/35";
  }

  return "border-teal-200/25 bg-teal-300/12 text-teal-100 hover:bg-teal-300/20";
}

function goalClass(count: number, max: number, selected: boolean) {
  if (selected) {
    return "border-teal-100 bg-teal-300 text-slate-950";
  }

  if (count <= 0 || max <= 0) {
    return "border-white/10 text-slate-300 hover:bg-white/10";
  }

  const level = Math.ceil((count / max) * 3);

  if (level >= 3) {
    return "border-teal-200/60 bg-teal-300/45 text-white hover:bg-teal-300/55";
  }

  if (level === 2) {
    return "border-teal-200/40 bg-teal-300/25 text-teal-50 hover:bg-teal-300/35";
  }

  return "border-teal-200/25 bg-teal-300/12 text-teal-100 hover:bg-teal-300/20";
}

export function WeeklyOptInPanel() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [state, setState] = useState<WeeklyOptIn>(() => readStoredOptIn());
  const [heatmap, setHeatmap] = useState<WeeklyOptInResponse["heatmap"]>({
    slots: emptyCountPayload(
      weeklyOptInDays.flatMap((day) =>
        weeklyOptInSlots.map((slot) =>
          getWeeklyOptInSlotId(day.key, slot.key),
        ),
      ),
    ),
    goals: emptyCountPayload(weeklyOptInGoals),
  });
  const [totalOptIns, setTotalOptIns] = useState(0);
  const [nextResetAt, setNextResetAt] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedSlotSet = useMemo(
    () => new Set(state.selectedSlots),
    [state.selectedSlots],
  );
  const selectedGoalSet = useMemo(
    () => new Set(state.selectedGoals),
    [state.selectedGoals],
  );
  const slotCounts = useMemo(() => countMap(heatmap.slots), [heatmap.slots]);
  const goalCounts = useMemo(() => countMap(heatmap.goals), [heatmap.goals]);

  const applyServerPayload = useCallback((payload: WeeklyOptInResponse) => {
    setHeatmap(payload.heatmap);
    setTotalOptIns(payload.totalOptIns);
    setNextResetAt(payload.nextResetAt);
    setState(payload.own);
    window.localStorage.setItem(storageKey, JSON.stringify(payload.own));
  }, []);

  const refreshHeatmap = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/weekly-opt-in", {
        headers,
        credentials: "same-origin",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(data?.message ?? "Heatmap non disponibile");
      }

      applyServerPayload((await response.json()) as WeeklyOptInResponse);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Heatmap settimanale non disponibile.",
      );
    } finally {
      setLoading(false);
    }
  }, [applyServerPayload, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshHeatmap();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshHeatmap]);

  function toggleSlot(id: string) {
    setSaved(false);
    setMessage("");
    setState((current) => ({
      ...current,
      selectedSlots: current.selectedSlots.includes(id)
        ? current.selectedSlots.filter((item) => item !== id)
        : [...current.selectedSlots, id],
    }));
  }

  function toggleGoal(goal: WeeklyOptIn["selectedGoals"][number]) {
    setSaved(false);
    setMessage("");
    setState((current) => ({
      ...current,
      selectedGoals: current.selectedGoals.includes(goal)
        ? current.selectedGoals.filter((item) => item !== goal)
        : [...current.selectedGoals, goal],
    }));
  }

  async function saveOptIn() {
    const nextState: WeeklyOptIn = {
      ...state,
      enabled: true,
    };

    setSaving(true);
    setSaved(false);
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    setState(nextState);

    try {
      const headers = await buildActorHeaders(supabase, getOrCreateGuestId());
      const response = await fetch("/api/weekly-opt-in", {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: JSON.stringify({
          selectedSlots: nextState.selectedSlots,
          selectedGoals: nextState.selectedGoals,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(data?.message ?? "Opt-in non salvato");
      }

      const payload = (await response.json()) as WeeklyOptInResponse;
      applyServerPayload(payload);
      setSaved(true);
      setMessage("");
      trackEvent("weekly_opt_in_saved", {
        selected_goals: nextState.selectedGoals.length,
        selected_slots: nextState.selectedSlots.length,
        surface: "chat_sidebar",
        total_opt_ins: payload.totalOptIns,
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Opt-in salvato solo su questo browser.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-teal-300/20 bg-teal-300/10 p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-teal-200/25 bg-teal-200/10 text-teal-100">
          <Shuffle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">
            Giro della settimana
          </h2>
          <p className="mt-1 text-xs leading-5 text-teal-50/75">
            I quadratini si accendono dove più persone si dichiarano
            disponibili. Reset automatico: {formatResetAt(nextResetAt)}.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-teal-100">
              <CalendarDays className="h-4 w-4" />
              Disponibilità
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {loading ? "carico..." : `${totalOptIns} opt-in`}
            </span>
          </div>
          <div className="overflow-hidden rounded-md border border-white/10">
            <div className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] bg-black/20 text-[11px] font-bold text-slate-300">
              <div className="border-r border-white/10 px-2 py-2">Giorno</div>
              {weeklyOptInSlots.map((slot) => (
                <div
                  key={slot.key}
                  className="border-r border-white/10 px-2 py-2 last:border-r-0"
                >
                  {slot.label}
                </div>
              ))}
            </div>
            {weeklyOptInDays.map((day) => (
              <div
                key={day.key}
                className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] border-t border-white/10 text-[11px]"
              >
                <div className="border-r border-white/10 px-2 py-2 font-bold text-white">
                  {day.label}
                </div>
                {weeklyOptInSlots.map((slot) => {
                  const id = getWeeklyOptInSlotId(day.key, slot.key);
                  const selected = selectedSlotSet.has(id);
                  const count = slotCounts.get(id) ?? 0;

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-label={`${day.label} ${slot.label}: ${count} opt-in`}
                      aria-pressed={selected}
                      onClick={() => toggleSlot(id)}
                      className={`grid min-h-10 place-items-center border-r text-[10px] font-black transition last:border-r-0 ${intensityClass(
                        count,
                        heatmap.slots.max,
                        selected,
                      )}`}
                    >
                      {selected ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : count > 0 ? (
                        count
                      ) : (
                        <span aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-teal-100">
            <Sparkles className="h-4 w-4" />
            Temi caldi
          </div>
          <div className="flex flex-wrap gap-2">
            {weeklyOptInGoals.map((goal) => {
              const selected = selectedGoalSet.has(goal);
              const count = goalCounts.get(goal) ?? 0;

              return (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleGoal(goal)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition ${goalClass(
                    count,
                    heatmap.goals.max,
                    selected,
                  )}`}
                >
                  {goal}
                  {count > 0 ? (
                    <span className="ml-1 text-[10px] opacity-75">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={saveOptIn}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-black text-slate-950 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved || state.enabled ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {saving
            ? "Salvo..."
            : saved || state.enabled
              ? "Opt-in salvato"
              : "Faccio opt-in"}
        </button>

        {message ? (
          <p className="rounded-md border border-amber-300/20 bg-amber-300/10 p-2 text-xs leading-5 text-amber-100">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
