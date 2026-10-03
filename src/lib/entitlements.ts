import { eq } from "drizzle-orm";

import { plans, type Plan } from "@/config/plans";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { planByPriceId } from "@/lib/billing/plans";

// Read-only view of what a user's subscription entitles them to. Same rule
// as the dashboard and billing pages: an active/trialing Stripe
// subscription whose price maps to a paid plan; anything else is Free.
// (Subscription state is only ever WRITTEN by billing/sync.ts.)

export async function getCurrentPlan(userId: string): Promise<Plan> {
  const [sub] = await db
    .select({ status: subscriptions.status, priceId: subscriptions.priceId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);
  const active = sub?.status === "active" || sub?.status === "trialing";
  return (active && sub?.priceId && planByPriceId(sub.priceId)) || plans.free;
}

/** Paid plans get unwatermarked, commercially usable results. */
export async function hasPaidPlan(userId: string): Promise<boolean> {
  return (await getCurrentPlan(userId)).id !== "free";
}
