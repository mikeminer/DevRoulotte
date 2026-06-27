import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const leaveSchema = z.object({
  matchId: z.string().uuid().optional(),
  reason: z.string().max(80).optional().default("left"),
});

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}

function logLeave(event: string, data: Record<string, string | boolean | null>) {
  console.info(
    JSON.stringify({
      scope: "matchmaking",
      event,
      ...data,
    }),
  );
}

async function readLeaveBody(request: NextRequest) {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return {};
  }

  return JSON.parse(rawBody) as unknown;
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const actor = await getRequestActor(request);
    const body = leaveSchema.parse(await readLeaveBody(request));
    const supabase = getSupabaseAdmin();

    const deletedQueue = await supabase
      .from("match_queue")
      .delete()
      .eq("actor_type", actor.type)
      .eq("actor_id", actor.id)
      .select("actor_type");

    logLeave("leave", {
      actorType: actor.type,
      actorHash: hashId(actor.id),
      matchId: body.matchId ?? null,
      reason: body.reason,
      removedQueue: Boolean(deletedQueue.data?.length),
    });

    if (body.matchId) {
      const { data: match } = await supabase
        .from("match_logs")
        .select("id,actor_a_type,actor_a_id,actor_b_type,actor_b_id")
        .eq("id", body.matchId)
        .maybeSingle();

      const isParticipant =
        match &&
        ((match.actor_a_type === actor.type && match.actor_a_id === actor.id) ||
          (match.actor_b_type === actor.type && match.actor_b_id === actor.id));

      if (isParticipant) {
        await supabase
          .from("match_logs")
          .update({
            status: "ended",
            ended_at: new Date().toISOString(),
            ended_reason: body.reason,
          })
          .eq("id", body.matchId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Leave fallita",
      },
      { status: 400 },
    );
  }
}
