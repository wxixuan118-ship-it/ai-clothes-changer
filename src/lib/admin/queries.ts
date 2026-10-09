import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";

import { plans } from "@/config/plans";
import { db } from "@/db";
import { generations, subscriptions, users } from "@/db/schema";
import { planByPriceId } from "@/lib/billing/plans";
import { getCreditTotals, getHistory } from "@/lib/credits";

// Read-only queries behind /admin. Credit ledger reads go through
// src/lib/credits (AGENTS.md); subscriptions are only read here.

const DAY = 24 * 60 * 60 * 1000;
export const PAGE_SIZE = 25;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Last `days` UTC dates as YYYY-MM-DD, oldest first. */
function dayKeys(days: number): string[] {
  const today = startOfUtcDay(new Date()).getTime();
  return Array.from({ length: days }, (_, i) =>
    new Date(today - (days - 1 - i) * DAY).toISOString().slice(0, 10),
  );
}

function planLabel(status: string | null, priceId: string | null): string {
  const active = status === "active" || status === "trialing";
  return ((active && priceId && planByPriceId(priceId)) || plans.free).name;
}

export async function getOverview() {
  const now = new Date();
  const today = startOfUtcDay(now);
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const chartStart = new Date(startOfUtcDay(now).getTime() - 13 * DAY);

  const [
    [userTotals],
    [paying],
    [genTotals],
    signupsByDay,
    generationsByDay,
    recentUsers,
    creditTotals,
  ] = await Promise.all([
    db
      .select({
        total: count(),
        today: sql<number>`count(*) filter (where ${users.createdAt} >= ${today})::int`,
        week: sql<number>`count(*) filter (where ${users.createdAt} >= ${weekAgo})::int`,
      })
      .from(users),
    db
      .select({ total: count() })
      .from(subscriptions)
      .where(sql`${subscriptions.status} in ('active', 'trialing')`),
    db
      .select({
        total: count(),
        today: sql<number>`count(*) filter (where ${generations.createdAt} >= ${today})::int`,
        weekCompleted: sql<number>`count(*) filter (where ${generations.createdAt} >= ${weekAgo} and ${generations.status} = 'completed')::int`,
        weekFailed: sql<number>`count(*) filter (where ${generations.createdAt} >= ${weekAgo} and ${generations.status} = 'failed')::int`,
        weekBlocked: sql<number>`count(*) filter (where ${generations.createdAt} >= ${weekAgo} and ${generations.failureReason} like 'blocked:%')::int`,
      })
      .from(generations),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${users.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
        total: count(),
      })
      .from(users)
      .where(gte(users.createdAt, chartStart))
      .groupBy(sql`1`),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${generations.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
        completed: sql<number>`count(*) filter (where ${generations.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${generations.status} = 'failed')::int`,
      })
      .from(generations)
      .where(gte(generations.createdAt, chartStart))
      .groupBy(sql`1`),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(8),
    getCreditTotals(weekAgo),
  ]);

  const keys = dayKeys(14);
  const signups = new Map(signupsByDay.map((row) => [row.day, row.total]));
  const gens = new Map(generationsByDay.map((row) => [row.day, row]));
  return {
    users: userTotals ?? { total: 0, today: 0, week: 0 },
    payingSubscribers: paying?.total ?? 0,
    generations: genTotals ?? {
      total: 0,
      today: 0,
      weekCompleted: 0,
      weekFailed: 0,
      weekBlocked: 0,
    },
    creditsSpentWeek:
      Math.abs(creditTotals.spend ?? 0) - (creditTotals.refund ?? 0),
    signupsChart: keys.map((day) => ({ day, value: signups.get(day) ?? 0 })),
    generationsChart: keys.map((day) => ({
      day,
      completed: gens.get(day)?.completed ?? 0,
      failed: gens.get(day)?.failed ?? 0,
    })),
    recentUsers,
  };
}

export async function listUsers({ q, page }: { q?: string; page: number }) {
  const search = q?.trim();
  const where = search
    ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`))
    : undefined;
  const generationCount = db
    .select({ userId: generations.userId, total: count().as("total") })
    .from(generations)
    .groupBy(generations.userId)
    .as("generation_count");

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        credits: users.creditBalance,
        status: subscriptions.status,
        priceId: subscriptions.priceId,
        generations: sql<number>`coalesce(${generationCount.total}, 0)::int`,
      })
      .from(users)
      .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
      .leftJoin(generationCount, eq(generationCount.userId, users.id))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(users).where(where),
  ]);
  return {
    rows: rows.map((row) => ({
      ...row,
      plan: planLabel(row.status, row.priceId),
    })),
    total: totalRow?.total ?? 0,
  };
}

export async function getUserDetail(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      credits: users.creditBalance,
      stripeCustomerId: users.stripeCustomerId,
      status: subscriptions.status,
      priceId: subscriptions.priceId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;

  const [recentGenerations, ledger] = await Promise.all([
    db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt))
      .limit(24),
    getHistory(userId, 50),
  ]);
  return {
    user: { ...user, plan: planLabel(user.status, user.priceId) },
    generations: recentGenerations,
    ledger,
  };
}

export async function listGenerations({
  status,
  page,
}: {
  status?: "completed" | "failed" | "pending";
  page: number;
}) {
  const where = status ? eq(generations.status, status) : undefined;
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: generations.id,
        prompt: generations.prompt,
        imageUrl: generations.imageUrl,
        model: generations.model,
        status: generations.status,
        failureReason: generations.failureReason,
        createdAt: generations.createdAt,
        userId: users.id,
        email: users.email,
      })
      .from(generations)
      .innerJoin(users, eq(users.id, generations.userId))
      .where(where)
      .orderBy(desc(generations.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(generations)
      .where(where ?? and()),
  ]);
  return { rows, total: totalRow?.total ?? 0 };
}

/** Per-model health and spend for /admin/ai. */
export async function getModelUsage() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - DAY);
  const monthAgo = new Date(now.getTime() - 30 * DAY);
  const chartStart = new Date(startOfUtcDay(now).getTime() - 13 * DAY);
  const seconds = sql`extract(epoch from (${generations.completedAt} - ${generations.createdAt}))`;

  const [byModel, byDay, recentFailures, lastRuns] = await Promise.all([
    db
      .select({
        model: generations.model,
        day: sql<number>`count(*) filter (where ${generations.createdAt} >= ${dayAgo})::int`,
        dayCompleted: sql<number>`count(*) filter (where ${generations.createdAt} >= ${dayAgo} and ${generations.status} = 'completed')::int`,
        dayFailed: sql<number>`count(*) filter (where ${generations.createdAt} >= ${dayAgo} and ${generations.status} = 'failed')::int`,
        total: count(),
        completed: sql<number>`count(*) filter (where ${generations.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${generations.status} = 'failed')::int`,
        blocked: sql<number>`count(*) filter (where ${generations.failureReason} like 'blocked:%')::int`,
        pending: sql<number>`count(*) filter (where ${generations.status} = 'pending')::int`,
        avgSeconds: sql<
          number | null
        >`round(avg(${seconds}) filter (where ${generations.status} = 'completed'))::int`,
        maxSeconds: sql<
          number | null
        >`round(max(${seconds}) filter (where ${generations.status} = 'completed'))::int`,
        lastSuccessAt: sql<Date | null>`max(${generations.createdAt}) filter (where ${generations.status} = 'completed')`,
      })
      .from(generations)
      .where(gte(generations.createdAt, monthAgo))
      .groupBy(generations.model)
      .orderBy(desc(count())),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${generations.createdAt} at time zone 'UTC'), 'YYYY-MM-DD')`,
        model: generations.model,
        completed: sql<number>`count(*) filter (where ${generations.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${generations.status} = 'failed')::int`,
      })
      .from(generations)
      .where(gte(generations.createdAt, chartStart))
      .groupBy(sql`1`, generations.model),
    db
      .select({
        id: generations.id,
        userId: generations.userId,
        model: generations.model,
        failureReason: generations.failureReason,
        createdAt: generations.createdAt,
      })
      .from(generations)
      .where(eq(generations.status, "failed"))
      .orderBy(desc(generations.createdAt))
      .limit(12),
    // Last 10 finished runs, newest first — "is it failing right now?"
    db
      .select({ model: generations.model, status: generations.status })
      .from(generations)
      .where(
        or(
          eq(generations.status, "completed"),
          eq(generations.status, "failed"),
        ),
      )
      .orderBy(desc(generations.createdAt))
      .limit(10),
  ]);

  const keys = dayKeys(14);
  const days = new Map<string, { completed: number; failed: number }>();
  const completedByDayModel = new Map<string, number>();
  for (const row of byDay) {
    const entry = days.get(row.day) ?? { completed: 0, failed: 0 };
    entry.completed += row.completed;
    entry.failed += row.failed;
    days.set(row.day, entry);
    completedByDayModel.set(`${row.day}|${row.model}`, row.completed);
  }
  return {
    byModel,
    chart: keys.map((day) => ({
      day,
      completed: days.get(day)?.completed ?? 0,
      failed: days.get(day)?.failed ?? 0,
    })),
    /** day → model → completed (for per-day spend). */
    completedByDayModel,
    chartDays: keys,
    recentFailures,
    lastRuns,
  };
}
