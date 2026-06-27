import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Actor, ActorType } from "@/lib/types";

export const signalKindSchema = z.enum([
  "offer",
  "answer",
  "candidate",
  "control",
]);

export const signalPayloadSchema = z.object({
  sender: z.string().max(120),
  kind: signalKindSchema,
  description: z.unknown().optional(),
  candidate: z.unknown().optional(),
  control: z.string().max(40).optional(),
});

type MatchParticipantRow = {
  actor_a_type: ActorType;
  actor_a_id: string;
  actor_b_type: ActorType;
  actor_b_id: string;
};

export function isMatchParticipant(
  match: MatchParticipantRow | null,
  actor: Pick<Actor, "type" | "id">,
) {
  return Boolean(
    match &&
      ((match.actor_a_type === actor.type && match.actor_a_id === actor.id) ||
        (match.actor_b_type === actor.type && match.actor_b_id === actor.id)),
  );
}

export async function assertMatchParticipant(matchId: string, actor: Actor) {
  const supabase = getSupabaseAdmin();
  const { data: match, error } = await supabase
    .from("match_logs")
    .select("actor_a_type,actor_a_id,actor_b_type,actor_b_id")
    .eq("id", matchId)
    .maybeSingle<MatchParticipantRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!isMatchParticipant(match, actor)) {
    throw new Error("Match non autorizzato");
  }
}
