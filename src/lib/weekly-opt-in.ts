export const weeklyOptInDays = [
  { key: "mon", label: "Lun" },
  { key: "tue", label: "Mar" },
  { key: "wed", label: "Mer" },
  { key: "thu", label: "Gio" },
  { key: "fri", label: "Ven" },
] as const;

export const weeklyOptInSlots = [
  { key: "morning", label: "Mattina" },
  { key: "lunch", label: "Pranzo" },
  { key: "afternoon", label: "Pomeriggio" },
  { key: "evening", label: "Sera" },
] as const;

export const weeklyOptInGoals = [
  "Founder",
  "Builder",
  "Dev",
  "Product",
  "AI",
  "SaaS",
  "Feedback",
  "Co-founder",
] as const;

export type WeeklyOptInGoal = (typeof weeklyOptInGoals)[number];

export type WeeklyOptIn = {
  enabled: boolean;
  selectedSlots: string[];
  selectedGoals: WeeklyOptInGoal[];
};

export const weeklyOptInInitialState: WeeklyOptIn = {
  enabled: false,
  selectedSlots: [],
  selectedGoals: [],
};

export const weeklyOptInSlotIds = weeklyOptInDays.flatMap((day) =>
  weeklyOptInSlots.map((slot) => `${day.key}:${slot.key}`),
);

export function getWeeklyOptInSlotId(day: string, slot: string) {
  return `${day}:${slot}`;
}

export function getUtcWeekStart(input = new Date()) {
  const date = new Date(input);
  const day = date.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;

  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  return date;
}

export function getUtcNextWeekStart(input = new Date()) {
  const next = getUtcWeekStart(input);
  next.setUTCDate(next.getUTCDate() + 7);
  return next;
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}
