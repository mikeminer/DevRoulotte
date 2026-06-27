import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-auth";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

const banSchema = z.object({
  actorType: z.enum(["guest", "user"]),
  actorId: z.string().uuid(),
  reason: z.string().min(2).max(500).default("Ban manuale admin"),
  action: z.enum(["ban", "unban"]).default("ban"),
});

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    const admin = await assertAdmin(request);
    const body = banSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();

    if (body.action === "unban") {
      await supabase
        .from("bans")
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("actor_type", body.actorType)
        .eq("actor_id", body.actorId);

      return NextResponse.json({ ok: true });
    }

    await supabase.from("bans").insert({
      actor_type: body.actorType,
      actor_id: body.actorId,
      reason: body.reason,
      shadow: false,
      active: true,
      created_by: admin.type === "user" ? admin.userId : null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Ban fallito",
      },
      { status: 400 },
    );
  }
}
