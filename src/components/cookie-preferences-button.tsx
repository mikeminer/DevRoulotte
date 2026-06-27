"use client";

import { SlidersHorizontal } from "lucide-react";
import { COOKIE_CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

export function CookiePreferencesButton({
  className,
}: {
  className?: string;
}) {
  function openPreferences() {
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
  }

  return (
    <button type="button" onClick={openPreferences} className={className}>
      <SlidersHorizontal className="h-3.5 w-3.5" />
      Cookie
    </button>
  );
}
