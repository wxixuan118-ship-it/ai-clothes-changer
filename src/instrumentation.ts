// Runs once per server start, before the first request is handled.
// Production servers bring the database schema up to date here, so a fresh
// deploy (e.g. AnySites, whose generated image runs `node server.js`) works
// against an empty DATABASE_URL. A failed migration throws and stops the
// server — visible in the runtime logs instead of failing per request.
// NEXT_RUNTIME/NODE_ENV are framework variables, read before any app module
// (and src/lib/env.ts) is loaded.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  const { runMigrations } = await import("@/db/migrate");
  await runMigrations();
}
