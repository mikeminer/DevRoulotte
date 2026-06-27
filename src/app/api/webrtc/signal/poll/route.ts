import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/lib/session";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";
import { assertMatchParticipant } from "@/lib/webrtc-signaling";

export const runtime = "nodejs";

const pollSchema = z.object({
  matchId: z.string().uuid(),
  receiverClientId: z.string().max(120),
  afterId: z.number().int().nonnegative().default(0),
});

type SignalRow = {
  id: number;
  payload: unknown;
};

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const actor = await getRequestActor(request);
    const body = pollSchema.parse(await request.json());

    await assertMatchParticipant(body.matchId, actor);

    const { data, error } = await getSupabaseAdmin()
      .from("webrtc_signals")
      .select("id,payload")
      .eq("match_id", body.matchId)
      .neq("sender_client_id", body.receiverClientId)
      .gt("id", body.afterId)
      .order("id", { ascending: true })
      .limit(50)
      .returns<SignalRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      signals: (data ?? []).map((signal) => ({
        id: signal.id,
        message: signal.payload,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Polling signaling fallito",
      },
      { status: 400 },
    );
  }
}
