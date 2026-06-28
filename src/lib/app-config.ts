import type { ActorType, PlanCode } from "@/lib/types";

export const APP_NAME = "DevRoulotte";
export const SOURCE_CODE_URL = "https://github.com/mikeminer/DevRoulotte";
export const LICENSE_NAME = "AGPL-3.0-only";
export const CONTACT_EMAIL = "dev@devroulotte.chat";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
export const WORKSHOP_FEEDBACK_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdiwzk0AGdbaPPRtEWR6QhnBRbfcLK-rJFf7es3J_Pnn-Ow8w/viewform";

export const GUEST_DAILY_MATCH_LIMIT = Number(
  process.env.GUEST_DAILY_MATCH_LIMIT ?? 3,
);

export const REGISTERED_DAILY_MATCH_LIMIT = Number(
  process.env.REGISTERED_DAILY_MATCH_LIMIT ?? 15,
);

export const GUEST_CALL_LIMIT_SECONDS = Number(
  process.env.GUEST_CALL_LIMIT_SECONDS ?? 120,
);

export const REGISTERED_CALL_LIMIT_SECONDS = Number(
  process.env.REGISTERED_CALL_LIMIT_SECONDS ?? 300,
);

export const PREMIUM_CALL_LIMIT_SECONDS = Number(
  process.env.PREMIUM_TIER_CALL_LIMIT_SECONDS ?? 900,
);

export const NEXT_COOLDOWN_SECONDS = Number(
  process.env.NEXT_COOLDOWN_SECONDS ?? 8,
);

export const AUTO_SHADOWBAN_REPORT_THRESHOLD = Number(
  process.env.AUTO_SHADOWBAN_REPORT_THRESHOLD ?? 3,
);

export const MATCH_QUEUE_STALE_SECONDS = Number(
  process.env.MATCH_QUEUE_STALE_SECONDS ?? 45,
);

export const MATCH_QUEUE_ACTIVE_SECONDS = Number(
  process.env.MATCH_QUEUE_ACTIVE_SECONDS ?? 6,
);

export const REPORT_REASONS = [
  "nudity",
  "spam",
  "threats",
  "minor",
  "illegal",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export function getPlanCode(actorType: ActorType, isPremium: boolean): PlanCode {
  if (isPremium) {
    return "premium";
  }

  return actorType === "user" ? "registered" : "guest";
}

export function getPlanLabel(planCode: PlanCode) {
  if (planCode === "premium") {
    return "Premium";
  }

  return planCode === "registered" ? "Registrato" : "Free ospite";
}

export function getDailyMatchLimit(planCode: PlanCode) {
  if (planCode === "premium") {
    return null;
  }

  return planCode === "registered"
    ? REGISTERED_DAILY_MATCH_LIMIT
    : GUEST_DAILY_MATCH_LIMIT;
}

export function getCallLimitSeconds(planCode: PlanCode) {
  if (planCode === "premium") {
    return PREMIUM_CALL_LIMIT_SECONDS;
  }

  return planCode === "registered"
    ? REGISTERED_CALL_LIMIT_SECONDS
    : GUEST_CALL_LIMIT_SECONDS;
}
