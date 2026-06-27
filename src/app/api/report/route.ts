import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AUTO_SHADOWBAN_REPORT_THRESHOLD,
  REPORT_REASONS,
} from "@/lib/app-config";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const reportSchema = z.object({
  matchId: z.string().uuid(),
  reportedActorType: z.enum(["guest", "user"]),
  reportedActorId: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(1000).optional().default(""),
});

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const rateLimit = checkRateLimit(`report:${actor.key}`, 5, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, message: "Troppi report in poco tempo." },
        { status: 429 },
      );
    }

    const body = reportSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    await supabase.from("reports").insert({
      reporter_actor_type: actor.type,
      reporter_actor_id: actor.id,
      reported_actor_type: body.reportedActorType,
      reported_actor_id: body.reportedActorId,
      match_id: body.matchId,
      reason: body.reason,
      details: body.details,
      status: "pending",
    });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("reported_actor_type", body.reportedActorType)
      .eq("reported_actor_id", body.reportedActorId)
      .gte("created_at", since);

    if ((count ?? 0) >= AUTO_SHADOWBAN_REPORT_THRESHOLD) {
      await supabase.from("bans").insert({
        actor_type: body.reportedActorType,
        actor_id: body.reportedActorId,
        reason: "Auto-shadowban: troppi report nelle ultime 24 ore",
        shadow: true,
        active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Report fallito",
      },
      { status: 400 },
    );
  }
}
