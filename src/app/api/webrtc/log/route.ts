import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestActor } from "@/lib/session";

export const runtime = "nodejs";

const logSchema = z.object({
  matchId: z.string().uuid().optional(),
  event: z.string().max(64),
  role: z.enum(["caller", "callee"]).optional(),
  channelStatus: z.string().max(40).optional(),
  connectionState: z.string().max(40).optional(),
  iceConnectionState: z.string().max(40).optional(),
  iceGatheringState: z.string().max(40).optional(),
  signalingState: z.string().max(40).optional(),
  detail: z.string().max(160).optional(),
});

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex").slice(0, 10);
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getRequestActor(request);
    const body = logSchema.parse(await request.json());

    console.info(
      JSON.stringify({
        scope: "webrtc",
        event: body.event,
        actorType: actor.type,
        actorHash: hashId(actor.id),
        matchId: body.matchId?.slice(0, 8) ?? null,
        role: body.role ?? null,
        channelStatus: body.channelStatus ?? null,
        connectionState: body.connectionState ?? null,
        iceConnectionState: body.iceConnectionState ?? null,
        iceGatheringState: body.iceGatheringState ?? null,
        signalingState: body.signalingState ?? null,
        detail: body.detail ?? null,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "WebRTC log failed",
      },
      { status: 400 },
    );
  }
}
