// Post-auth redirect targets come from the query string, so they are
// attacker-controlled. Browsers normalise "/\evil.com" and "/<TAB>/evil.com"
// into "//evil.com" — a prefix check alone is not enough. Resolve against a
// dummy origin with the WHATWG parser and keep only same-origin paths.

const BASE = "http://next.invalid";

export function safeNext(
  next: string | null | undefined,
  fallback = "/generate",
): string {
  if (!next || !next.startsWith("/")) return fallback;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
