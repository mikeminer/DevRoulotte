import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Actor, ActorType } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const guestIdSchema = z.string().uuid();
export const guestSessionCookieName = "__Host-devroulotte_guest";
export const guestSessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const guestSessionVersion = "v1";

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

function getGuestSessionSecret() {
  const secret =
    process.env.GUEST_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("Missing GUEST_SESSION_SECRET");
  }

  return secret;
}

function signGuestSession(guestId: string, issuedAt: string) {
  return createHmac("sha256", getGuestSessionSecret())
    .update(`${guestSessionVersion}.${guestId}.${issuedAt}`)
    .digest("base64url");
}

function signaturesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createGuestSessionToken(guestId: string = randomUUID()) {
  const parsedGuestId = guestIdSchema.parse(guestId);
  const issuedAt = Date.now().toString();
  const signature = signGuestSession(parsedGuestId, issuedAt);

  return `${guestSessionVersion}.${parsedGuestId}.${issuedAt}.${signature}`;
}

export function readGuestSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [version, guestId, issuedAt, signature] = token.split(".");

  if (version !== guestSessionVersion || !signature) {
    return null;
  }

  const parsedGuestId = guestIdSchema.safeParse(guestId);
  const issuedAtMs = Number(issuedAt);

  if (!parsedGuestId.success || !Number.isFinite(issuedAtMs)) {
    return null;
  }

  if (Date.now() - issuedAtMs > guestSessionMaxAgeSeconds * 1000) {
    return null;
  }

  const expectedSignature = signGuestSession(parsedGuestId.data, issuedAt);

  if (!signaturesMatch(signature, expectedSignature)) {
    return null;
  }

  return parsedGuestId.data;
}

export function setGuestSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: guestSessionCookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: guestSessionMaxAgeSeconds,
  });
}

export function getPublicActorAlias(
  actor: Pick<Actor, "type" | "id">,
  scope: string,
) {
  return createHmac("sha256", getGuestSessionSecret())
    .update(`${scope}:${actor.type}:${actor.id}`)
    .digest("hex")
    .slice(0, 24);
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
      data.user.email?.split("@")[0] ||
      "Utente";

    return {
      type: "user",
      id: data.user.id,
      key: actorKey("user", data.user.id),
      displayName,
    };
  }

  const guestId = readGuestSessionToken(
    request.cookies.get(guestSessionCookieName)?.value,
  );

  if (!guestId) {
    throw new Error("Missing guest session");
  }

  return {
    type: "guest",
    id: guestId,
    key: actorKey("guest", guestId),
    displayName: "Ospite",
  };
}
