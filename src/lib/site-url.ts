import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

// Canonical public origin, no trailing slash. Server-only (reads env).
// Production defaults to the real domain even while the app is still served
// from a platform subdomain, so canonical tags and the sitemap never point
// search engines at a temporary host. Dev uses the local origin.
export const siteUrl = (
  env.SITE_URL ??
  (env.NODE_ENV === "production" ? siteConfig.url : env.BETTER_AUTH_URL)
).replace(/\/$/, "");

export const siteHost = new URL(siteUrl).host;

export function absoluteUrl(path = "/"): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}
