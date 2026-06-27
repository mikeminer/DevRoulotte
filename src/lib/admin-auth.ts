import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AdminActor =
  | { type: "token" }
  | { type: "user"; userId: string; email: string | null };

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length);
}

export async function assertAdmin(request: NextRequest): Promise<AdminActor> {
  const expectedToken = process.env.ADMIN_ACCESS_TOKEN;
  const providedToken = request.headers.get("x-admin-token");

  if (expectedToken && providedToken === expectedToken) {
    return { type: "token" };
  }

  const bearerToken = getBearerToken(request);

  if (!bearerToken) {
    throw new Error("Admin non autorizzato");
  }

  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } =
    await supabase.auth.getUser(bearerToken);

  if (userError || !userData.user) {
    throw new Error("Sessione admin non valida");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Ruolo admin non verificabile");
  }

  if (!profile?.is_admin) {
    throw new Error("Admin non autorizzato");
  }

  return {
    type: "user",
    userId: userData.user.id,
    email: userData.user.email ?? null,
  };
}
