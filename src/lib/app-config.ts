export const APP_NAME = "DevRoulotte";
export const SOURCE_CODE_URL = "https://github.com/mikeminer/DevRoulotte";
export const LICENSE_NAME = "AGPL-3.0-only";

export const FREE_DAILY_MATCH_LIMIT = Number(
  process.env.FREE_DAILY_MATCH_LIMIT ?? 20,
);

export const FREE_CALL_LIMIT_SECONDS = Number(
  process.env.FREE_CALL_LIMIT_SECONDS ?? 300,
);

export const PREMIUM_CALL_LIMIT_SECONDS = Number(
  process.env.PREMIUM_CALL_LIMIT_SECONDS ?? 3600,
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

export const REPORT_REASONS = [
  "nudity",
  "spam",
  "threats",
  "minor",
  "illegal",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
