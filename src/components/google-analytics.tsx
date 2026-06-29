"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_UPDATED_EVENT,
} from "@/lib/cookie-consent";
import { hasAnalyticsConsent, trackEvent } from "@/lib/analytics";

const GOOGLE_ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat"];

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";

  document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`;
}

function removeGoogleAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(Boolean)
    .filter((name) =>
      GOOGLE_ANALYTICS_COOKIE_PREFIXES.some((prefix) =>
        name.startsWith(prefix),
      ),
    );

  const host = window.location.hostname;
  const baseDomain = host.split(".").slice(-2).join(".");
  const domains = Array.from(
    new Set(["", host, `.${host}`, baseDomain, `.${baseDomain}`]),
  );

  for (const name of names) {
    for (const domain of domains) {
      expireCookie(name, domain || undefined);
    }
  }
}

function updateGoogleConsent(analyticsAccepted: boolean) {
  window.gtag?.("consent", "update", {
    ad_personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    analytics_storage: analyticsAccepted ? "granted" : "denied",
  });

  if (!analyticsAccepted) {
    removeGoogleAnalyticsCookies();
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const [analyticsAccepted, setAnalyticsAccepted] = useState(false);
  const [isTagReady, setIsTagReady] = useState(false);

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    function syncConsent() {
      const accepted = hasAnalyticsConsent();

      setAnalyticsAccepted(accepted);
      updateGoogleConsent(accepted);
      setIsTagReady(Boolean(window.gtag));
    }

    function syncFromStorage(event: StorageEvent) {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
        syncConsent();
      }
    }

    syncConsent();
    const readinessTimer = window.setInterval(() => {
      if (!window.gtag) {
        return;
      }

      syncConsent();
      window.clearInterval(readinessTimer);
    }, 200);

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsent);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.clearInterval(readinessTimer);
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncConsent);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !analyticsAccepted || !isTagReady || !window.gtag) {
      return;
    }

    const pagePath = `${pathname}${window.location.search}`;

    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [analyticsAccepted, isTagReady, measurementId, pathname]);

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    function handleTrackedClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest<HTMLElement>("[data-analytics-event]");
      const eventName = element?.dataset.analyticsEvent;

      if (!element || !eventName) {
        return;
      }

      trackEvent(eventName, {
        cta_id: element.dataset.analyticsCtaId,
        destination: element.dataset.analyticsDestination,
        surface: element.dataset.analyticsSurface,
      });
    }

    document.addEventListener("click", handleTrackedClick);

    return () => {
      document.removeEventListener("click", handleTrackedClick);
    };
  }, [measurementId]);

  return null;
}
