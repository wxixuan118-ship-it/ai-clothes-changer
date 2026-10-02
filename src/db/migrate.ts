import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "@/db";

// Applies pending drizzle/ migrations. Idempotent: drizzle records applied
// migrations in its own table, so re-running on every boot is a no-op once
// the schema is current. Never edits an applied migration (AGENTS.md).
export async function runMigrations(): Promise<void> {
  const started = performance.now();
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  console.info(
    `[db] migrations up to date (${Math.round(performance.now() - started)}ms)`,
  );
}
