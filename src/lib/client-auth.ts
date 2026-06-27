"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

const guestStorageKey = "devroulotte_guest_id";

export function getOrCreateGuestId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(guestStorageKey);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(guestStorageKey, id);
  return id;
}

export async function buildActorHeaders(
  supabase: SupabaseClient | null,
  guestId: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    headers["x-guest-id"] = guestId;
  }

  return headers;
}
