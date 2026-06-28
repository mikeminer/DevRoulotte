import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import { isMatchParticipant } from "@/lib/webrtc-signaling";
import type { ActorType } from "@/lib/types";

export const runtime = "nodejs";

const connectedSchema = z.object({
  matchId: z.string().uuid(),
});

type MatchParticipantRow = {
  actor_a_type: ActorType;
  actor_a_id: string;
  actor_b_type: ActorType;
  actor_b_id: string;
};

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const body = connectedSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    const { data: match, error: matchError } = await supabase
      .from("match_logs")
      .select("actor_a_type,actor_a_id,actor_b_type,actor_b_id")
      .eq("id", body.matchId)
      .maybeSingle<MatchParticipantRow>();

    if (matchError) {
      throw new Error(matchError.message);
    }

    if (!isMatchParticipant(match, actor)) {
      throw new Error("Match non autorizzato");
    }

    const { error } = await supabase
      .from("match_logs")
      .update({ connected_at: new Date().toISOString() })
      .eq("id", body.matchId)
      .is("connected_at", null);

    if (error) {
      throw new Error(error.message);
    }

    console.info(
      JSON.stringify({
        scope: "matchmaking",
        event: "connected",
        actorType: actor.type,
        actorHash: hashId(actor.id),
        matchId: body.matchId,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Connessione non salvata",
      },
      { status: 400 },
    );
  }
}
