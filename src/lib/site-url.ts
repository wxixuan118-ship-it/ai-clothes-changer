import { env } from "@/lib/env";

// Canonical public origin, no trailing slash. Server-only (reads env).
export const siteUrl = (env.SITE_URL ?? env.BETTER_AUTH_URL).replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}
