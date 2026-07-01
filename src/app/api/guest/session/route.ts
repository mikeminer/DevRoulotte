import { NextRequest, NextResponse } from "next/server";
import {
  createGuestSessionToken,
  guestSessionCookieName,
  readGuestSessionToken,
  setGuestSessionCookie,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const existingGuestId = readGuestSessionToken(
      request.cookies.get(guestSessionCookieName)?.value,
    );
    const token = createGuestSessionToken(existingGuestId ?? undefined);
    const response = NextResponse.json({ ok: true });

    setGuestSessionCookie(response, token);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Sessione ospite non configurata",
      },
      { status: 503 },
    );
  }
}
