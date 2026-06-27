import type { NextRequest } from "next/server";
import { z } from "zod";
import type { Actor, ActorType } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const guestIdSchema = z.string().uuid();

export function actorKey(type: ActorType, id: string) {
  return `${type}:${id}`;
}

export function parseActorKey(key: string): Pick<Actor, "type" | "id" | "key"> {
  const [type, id] = key.split(":");

  if ((type !== "guest" && type !== "user") || !id) {
    throw new Error("Invalid actor key");
  }

  return {
    type,
    id,
    key,
  };
}

export async function getRequestActor(request: NextRequest): Promise<Actor> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (token) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new Error("Invalid auth token");
    }

    const displayName =
      data.user.user_metadata?.display_name ||
      data.user.email?.split("@")[0] ||
      "Utente";

    return {
      type: "user",
      id: data.user.id,
      key: actorKey("user", data.user.id),
      displayName,
    };
  }

  const guestId = request.headers.get("x-guest-id");
  const parsedGuestId = guestIdSchema.safeParse(guestId);

  if (!parsedGuestId.success) {
    throw new Error("Missing guest identity");
  }

  return {
    type: "guest",
    id: parsedGuestId.data,
    key: actorKey("guest", parsedGuestId.data),
    displayName: "Ospite",
  };
}
