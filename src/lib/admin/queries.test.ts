import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { generations, users } from "@/db/schema";
import { closeDb, ensureTestDatabase } from "@/test/db";

import { getModelUsage } from "./queries";

// Runs against real Postgres (docker compose up -d), like the ledger suite.

beforeAll(async () => {
  await ensureTestDatabase();
}, 60_000);

afterAll(async () => {
  await closeDb();
});

describe("getModelUsage", () => {
  it("aggregates runs per model and per day", async () => {
    const userId = `usage_test_${randomUUID()}`;
    const model = `test-model-${randomUUID()}`;
    await db
      .insert(users)
      .values({ id: userId, name: "Usage", email: `${userId}@test.local` });
    const now = Date.now();
    await db.insert(generations).values([
      {
        userId,
        model,
        prompt: "a",
        status: "completed",
        createdAt: new Date(now - 60_000),
        completedAt: new Date(now - 20_000),
      },
      {
        userId,
        model,
        prompt: "b",
        status: "failed",
        failureReason: "blocked: test",
        createdAt: new Date(now - 30_000),
        completedAt: new Date(now - 25_000),
      },
    ]);

    const usage = await getModelUsage();
    const row = usage.byModel.find((r) => r.model === model);
    expect(row).toMatchObject({
      total: 2,
      completed: 1,
      failed: 1,
      blocked: 1,
      day: 2,
      avgSeconds: 40,
    });
    expect(usage.chart).toHaveLength(14);
    expect(usage.chart.at(-1)!.completed).toBeGreaterThanOrEqual(1);
    expect(usage.recentFailures.some((f) => f.model === model)).toBe(true);
  });
});
