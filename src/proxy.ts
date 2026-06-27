import { NextRequest, NextResponse } from "next/server";
import { MAINTENANCE_MESSAGE, MAINTENANCE_MODE } from "@/lib/maintenance";

const allowedApiPaths = new Set(["/api/paypal/webhook", "/api/cron/cleanup"]);

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export function proxy(request: NextRequest) {
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/maintenance" || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (allowedApiPaths.has(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.json(
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
    );
  }

  const maintenanceUrl = request.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  maintenanceUrl.search = "";

  return NextResponse.rewrite(maintenanceUrl, {
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: ["/:path*"],
};
