"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

const clientStorageKey = "devroulotte_client_id";
let guestSessionPromise: Promise<void> | null = null;

export function getOrCreateGuestId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(clientStorageKey);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(clientStorageKey, id);
  return id;
}

async function ensureGuestSessionCookie() {
  if (guestSessionPromise) {
    return guestSessionPromise;
  }

  guestSessionPromise = fetch("/api/guest/session", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  }).then(async (response) => {
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      throw new Error(data?.message ?? "Sessione ospite non disponibile");
    }
  });

  try {
    await guestSessionPromise;
  } catch (error) {
    guestSessionPromise = null;
    throw error;
  }
}

export async function buildActorHeaders(
  supabase: SupabaseClient | null,
  _guestId: string,
) {
  void _guestId;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    await ensureGuestSessionCookie();
  }

  return headers;
}
