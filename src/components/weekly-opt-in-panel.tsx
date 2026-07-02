"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Shuffle, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const storageKey = "devroulotte_weekly_opt_in_v1";

const days = [
  { key: "mon", label: "Lun" },
  { key: "tue", label: "Mar" },
  { key: "wed", label: "Mer" },
  { key: "thu", label: "Gio" },
  { key: "fri", label: "Ven" },
];

const slots = [
  { key: "morning", label: "Mattina" },
  { key: "lunch", label: "Pranzo" },
  { key: "afternoon", label: "Pomeriggio" },
  { key: "evening", label: "Sera" },
];

const goals = [
  "Founder",
  "Builder",
  "Dev",
  "Product",
  "AI",
  "SaaS",
  "Feedback",
  "Co-founder",
];

type WeeklyOptIn = {
  enabled: boolean;
  selectedSlots: string[];
  selectedGoals: string[];
};

const initialState: WeeklyOptIn = {
  enabled: false,
  selectedSlots: [],
  selectedGoals: [],
};

function readStoredOptIn() {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    return stored ? (JSON.parse(stored) as WeeklyOptIn) : initialState;
  } catch {
    return initialState;
  }
}

function slotId(day: string, slot: string) {
  return `${day}:${slot}`;
}

export function WeeklyOptInPanel() {
  const [state, setState] = useState<WeeklyOptIn>(() => readStoredOptIn());
  const [saved, setSaved] = useState(false);

  const selectedSlotSet = useMemo(
    () => new Set(state.selectedSlots),
    [state.selectedSlots],
  );
  const selectedGoalSet = useMemo(
    () => new Set(state.selectedGoals),
    [state.selectedGoals],
  );

  function toggleSlot(id: string) {
    setSaved(false);
    setState((current) => ({
      ...current,
      selectedSlots: current.selectedSlots.includes(id)
        ? current.selectedSlots.filter((item) => item !== id)
        : [...current.selectedSlots, id],
    }));
  }

  function toggleGoal(goal: string) {
    setSaved(false);
    setState((current) => ({
      ...current,
      selectedGoals: current.selectedGoals.includes(goal)
        ? current.selectedGoals.filter((item) => item !== goal)
        : [...current.selectedGoals, goal],
    }));
  }

  function saveOptIn() {
    const nextState = {
      ...state,
      enabled: true,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    setState(nextState);
    setSaved(true);
    trackEvent("weekly_opt_in_saved", {
      selected_goals: nextState.selectedGoals.length,
      selected_slots: nextState.selectedSlots.length,
      surface: "chat_sidebar",
    });
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
            Indica quando sei disponibile. Serve a orientare il matching
            casuale, non a fissare appuntamenti rigidi.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-teal-100">
            <CalendarDays className="h-4 w-4" />
            Disponibilità
          </div>
          <div className="overflow-hidden rounded-md border border-white/10">
            <div className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] bg-black/20 text-[11px] font-bold text-slate-300">
              <div className="border-r border-white/10 px-2 py-2">Giorno</div>
              {slots.map((slot) => (
                <div
                  key={slot.key}
                  className="border-r border-white/10 px-2 py-2 last:border-r-0"
                >
                  {slot.label}
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.key}
                className="grid grid-cols-[72px_repeat(4,minmax(0,1fr))] border-t border-white/10 text-[11px]"
              >
                <div className="border-r border-white/10 px-2 py-2 font-bold text-white">
                  {day.label}
                </div>
                {slots.map((slot) => {
                  const id = slotId(day.key, slot.key);
                  const selected = selectedSlotSet.has(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleSlot(id)}
                      className={
                        selected
                          ? "min-h-9 border-r border-white/10 bg-teal-300 text-slate-950 last:border-r-0"
                          : "min-h-9 border-r border-white/10 bg-black/10 text-slate-500 hover:bg-white/10 last:border-r-0"
                      }
                    >
                      {selected ? (
                        <CheckCircle2 className="mx-auto h-4 w-4" />
                      ) : null}
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
            Cerco conversazioni su
          </div>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => {
              const selected = selectedGoalSet.has(goal);

              return (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleGoal(goal)}
                  className={
                    selected
                      ? "rounded-md bg-teal-300 px-2.5 py-1.5 text-xs font-bold text-slate-950"
                      : "rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  }
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={saveOptIn}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-300 px-3 text-sm font-black text-slate-950 hover:bg-teal-200"
        >
          {saved || state.enabled ? <CheckCircle2 className="h-4 w-4" /> : null}
          {saved || state.enabled ? "Opt-in salvato" : "Faccio opt-in"}
        </button>
      </div>
    </section>
  );
}
