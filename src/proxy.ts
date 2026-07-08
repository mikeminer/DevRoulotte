import { NextRequest, NextResponse } from "next/server";
import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";

const allowedApiPaths = new Set([
  "/api/status",
  "/api/paypal/webhook",
  "/api/github/marketplace/webhook",
  "/api/cron/cleanup",
]);

type DevRoulotteLocale = "it" | "en";

const LOCALE_COOKIE = "devroulotte_locale";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

function detectLocale(request: NextRequest): DevRoulotteLocale {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();

  if (country) {
    return country === "IT" ? "it" : "en";
  }

  const acceptLanguage = request.headers
    .get("accept-language")
    ?.toLowerCase();

  return acceptLanguage?.startsWith("it") ? "it" : "en";
}

function withLocaleCookie(
  response: NextResponse,
  locale: DevRoulotteLocale,
) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);

  if (!MAINTENANCE_MODE) {
    return withLocaleCookie(NextResponse.next(), locale);
  }

  if (
    pathname === "/maintenance" ||
    pathname === "/status"
  ) {
    return withLocaleCookie(NextResponse.next(), locale);
  }

  if (pathname.startsWith("/api/")) {
    if (allowedApiPaths.has(pathname)) {
      return withLocaleCookie(NextResponse.next(), locale);
    }

    return withLocaleCookie(
      NextResponse.json(
        {
          ok: false,
          status: "maintenance",
          message: MAINTENANCE_MESSAGE,
        },
        {
          status: 503,
          headers: {
            "Retry-After": "600",
          },
        },
      ),
      locale,
    );
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  maintenanceUrl.search = "";

  return withLocaleCookie(
    NextResponse.rewrite(maintenanceUrl, {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    }),
    locale,
  );
}

export const config = {
  matcher: ["/:path*"],
};
