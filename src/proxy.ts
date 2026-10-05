import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import { siteUrl } from "@/lib/site-url";

const APP_PREFIXES = ["/dashboard", "/generate", "/billing", "/settings"];

/**
 * One canonical host for search engines and sessions. www always goes to
 * the apex; the platform subdomain (*.anysites.app) only once SITE_URL is
 * set — i.e. after the custom domain actually serves the app, so the site
 * is never redirected to a host that isn't live yet. /api is never
 * redirected: webhook senders (Stripe) don't follow redirects.
 */
function canonicalRedirect(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) return null;
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    ?.trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
  if (!host) return null;
  const isWww = host === `www.${siteConfig.domain}`;
  const isPlatformHost =
    Boolean(env.SITE_URL) && host.endsWith(".anysites.app");
  if (!isWww && !isPlatformHost) return null;
  return NextResponse.redirect(`${siteUrl}${pathname}${search}`, 308);
}

// Optimistic redirect for signed-out visitors to (app) routes. This checks
// only that a session cookie EXISTS — it is UX, not auth. The security
// boundary is requireSession() inside every (app) page and server action
// (AGENTS.md: never trust middleware alone).
export function proxy(request: NextRequest) {
  const canonical = canonicalRedirect(request);
  if (canonical) return canonical;

  const { pathname } = request.nextUrl;
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isAppRoute && !getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Every page (for the canonical-host redirect); static assets skip it.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|apple-icon|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)",
  ],
};
