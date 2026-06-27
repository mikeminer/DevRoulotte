import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  hasSupabaseServerConfig,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

function assertAdmin(request: NextRequest) {
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  const provided = request.headers.get("x-admin-token");

  if (!expected || provided !== expected) {
    throw new Error("Admin non autorizzato");
  }
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return NextResponse.json(
      { ok: false, message: "Supabase non configurato" },
      { status: 503 },
    );
  }

  try {
    assertAdmin(request);
    const supabase = getSupabaseAdmin();

    const [profiles, subscriptions, reports, bans, matches] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("subscriptions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("bans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("match_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(100),
    ]);

    return NextResponse.json({
      ok: true,
      profiles: profiles.data ?? [],
      subscriptions: subscriptions.data ?? [],
      reports: reports.data ?? [],
      bans: bans.data ?? [],
      matches: matches.data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Dashboard non disponibile",
      },
      { status: 401 },
    );
  }
}
