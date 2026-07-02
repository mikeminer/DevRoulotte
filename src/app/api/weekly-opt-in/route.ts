import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import {
  formatDateOnly,
  getUtcNextWeekStart,
  getUtcWeekStart,
  weeklyOptInGoals,
  weeklyOptInInitialState,
  weeklyOptInSlotIds,
  type WeeklyOptIn,
} from "@/lib/weekly-opt-in";

export const runtime = "nodejs";

type WeeklyOptInRow = {
  actor_type: string;
  actor_id: string;
  selected_slots: string[] | null;
  selected_goals: string[] | null;
};

const validSlotIds = new Set<string>(weeklyOptInSlotIds);
const validGoals = new Set<string>(weeklyOptInGoals);

const saveSchema = z
  .object({
    selectedSlots: z.array(z.string()).max(weeklyOptInSlotIds.length),
    selectedGoals: z.array(z.string()).max(weeklyOptInGoals.length),
  })
  .transform((value) => ({
    selectedSlots: Array.from(new Set(value.selectedSlots)).filter((slot) =>
      validSlotIds.has(slot),
    ),
    selectedGoals: Array.from(new Set(value.selectedGoals)).filter((goal) =>
      validGoals.has(goal),
    ),
  }));

function countValues(rows: WeeklyOptInRow[], key: "selected_slots" | "selected_goals") {
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const value of new Set(row[key] ?? [])) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return counts;
}

function serializeCounts(source: readonly string[], counts: Map<string, number>) {
  const values = source.map((id) => ({
    id,
    count: counts.get(id) ?? 0,
  }));

  return {
    max: values.reduce((max, item) => Math.max(max, item.count), 0),
    values,
  };
}

async function getWeekPayload(actor: { type: string; id: string }) {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const weekStart = formatDateOnly(getUtcWeekStart(now));
  const nextResetAt = getUtcNextWeekStart(now).toISOString();
  const { data, error } = await supabase
    .from("weekly_opt_ins")
    .select("actor_type,actor_id,selected_slots,selected_goals")
    .eq("week_start", weekStart);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as WeeklyOptInRow[];
  const ownRow = rows.find(
    (row) => row.actor_type === actor.type && row.actor_id === actor.id,
  );

  const own: WeeklyOptIn = ownRow
    ? {
        enabled: true,
        selectedSlots: ownRow.selected_slots ?? [],
        selectedGoals: (ownRow.selected_goals ?? []).filter((goal) =>
          validGoals.has(goal),
        ) as WeeklyOptIn["selectedGoals"],
      }
    : weeklyOptInInitialState;

  return {
    weekStart,
    nextResetAt,
    totalOptIns: rows.length,
    heatmap: {
      slots: serializeCounts(weeklyOptInSlotIds, countValues(rows, "selected_slots")),
      goals: serializeCounts(weeklyOptInGoals, countValues(rows, "selected_goals")),
    },
    own,
  };
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { status: "configuration_error", message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    return NextResponse.json(await getWeekPayload(actor));
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Opt-in non disponibile",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { status: "configuration_error", message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const rateLimit = checkRateLimit(`weekly-opt-in:${actor.key}`, 20, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: "rate_limited",
          message: "Troppi aggiornamenti opt-in. Riprova tra poco.",
          retryAfterMs: rateLimit.retryAfterMs,
        },
        { status: 429 },
      );
    }

    const body = saveSchema.parse(await request.json());
    const weekStart = formatDateOnly(getUtcWeekStart());
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("weekly_opt_ins").upsert(
      {
        week_start: weekStart,
        actor_type: actor.type,
        actor_id: actor.id,
        selected_slots: body.selectedSlots,
        selected_goals: body.selectedGoals,
      },
      { onConflict: "week_start,actor_type,actor_id" },
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(await getWeekPayload(actor));
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Opt-in non salvato",
      },
      { status: 400 },
    );
  }
}
