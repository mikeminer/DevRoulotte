export const COOKIE_CONSENT_STORAGE_KEY = "devroulotte_cookie_consent_v1";
export const COOKIE_CONSENT_OPEN_EVENT = "devroulotte:open-cookie-preferences";
export const COOKIE_CONSENT_UPDATED_EVENT = "devroulotte:cookie-consent-updated";

export type CookieConsent = {
  version: 1;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type CookieConsentChoices = Pick<
  CookieConsent,
  "preferences" | "analytics" | "marketing"
>;

export const DEFAULT_COOKIE_CHOICES: CookieConsentChoices = {
  preferences: false,
  analytics: false,
  marketing: false,
};

export function buildCookieConsent(
  choices: CookieConsentChoices,
): CookieConsent {
  return {
    version: 1,
    necessary: true,
    ...choices,
    updatedAt: new Date().toISOString(),
  };
}

export function parseCookieConsent(value: string | null): CookieConsent | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsent>;

    if (parsed.version !== 1 || parsed.necessary !== true) {
      return null;
    }

    return {
      version: 1,
      necessary: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
