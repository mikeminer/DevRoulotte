import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import {
  assertMatchParticipant,
  signalPayloadSchema,
} from "@/lib/webrtc-signaling";

export const runtime = "nodejs";

const sendSchema = z.object({
  matchId: z.string().uuid(),
  senderClientId: z.string().max(120),
  message: signalPayloadSchema,
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
    const body = sendSchema.parse(await request.json());

    await assertMatchParticipant(body.matchId, actor);

    const { error } = await getSupabaseAdmin().from("webrtc_signals").insert({
      match_id: body.matchId,
      sender_actor_type: actor.type,
      sender_actor_id: actor.id,
      sender_client_id: body.senderClientId,
      kind: body.message.kind,
      payload: body.message,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Invio signaling fallito",
      },
      { status: 400 },
    );
  }
}
