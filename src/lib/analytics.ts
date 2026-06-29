import {
  COOKIE_CONSENT_STORAGE_KEY,
  parseCookieConsent,
} from "@/lib/cookie-consent";

type AnalyticsParamValue = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsParamValue>;
export type AnalyticsPlanTier = "guest" | "registered" | "premium";
export type AnalyticsAuthState = "guest" | "logged_in";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getAnalyticsMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = parseCookieConsent(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    );

    return Boolean(stored?.analytics);
  } catch {
    return false;
  }
}

export function getAnalyticsContext(
  isAuthenticated: boolean,
  isPremium: boolean,
) {
  const auth_state: AnalyticsAuthState = isAuthenticated ? "logged_in" : "guest";
  const plan_tier: AnalyticsPlanTier = isPremium
    ? "premium"
    : isAuthenticated
      ? "registered"
      : "guest";

  return {
    auth_state,
    plan_tier,
  };
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const measurementId = getAnalyticsMeasurementId();

  if (!measurementId || !hasAnalyticsConsent() || !window.gtag) {
    return;
  }

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
  );

  window.gtag("event", eventName, {
    ...safeParams,
    send_to: measurementId,
  });
}
