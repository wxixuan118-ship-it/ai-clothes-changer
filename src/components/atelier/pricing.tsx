import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { getSession } from "@/lib/auth/session";

import {
  GENERATION_COST_CREDITS,
  plans,
  topupPack,
  WELCOME_CREDITS,
} from "@/config/plans";

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Every number reads from src/config/plans.ts. CTAs depend on the session:
// members go straight to Billing/the studio; visitors sign up first and
// land there afterwards.
export async function AtelierPricing({
  headingLevel = "h2",
}: {
  /** The /pricing page owns its h1; the landing section is an h2. */
  headingLevel?: "h1" | "h2";
}) {
  const tiers = Object.values(plans);
  const signedIn = Boolean(await getSession());
  const Heading = headingLevel;
  const ctaHref = (paid: boolean) => {
    const target = paid ? "/billing" : "/generate";
    return signedIn ? target : `/signup?next=${encodeURIComponent(target)}`;
  };

  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-[1240px] scroll-mt-8 px-4 py-24 sm:px-6"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="eyebrow">Pricing</p>
        <Heading className="text-title mt-3">
          Simple, credit-based pricing
        </Heading>
        <p className="mt-4 text-[var(--muted-ink)]">
          {GENERATION_COST_CREDITS} credit = 1 image. Start with{" "}
          {WELCOME_CREDITS} free credits. Cancel any time.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map((plan) => {
          const featured = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={
                "flex flex-col rounded-[28px] border p-8 " +
                (featured
                  ? "border-transparent bg-[var(--brand)] text-[var(--ink-deep)]"
                  : "bg-[var(--paper-2)]")
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl">{plan.name}</h3>
                {featured ? (
                  <span className="rounded-full bg-[var(--ink-deep)] px-3 py-1 text-xs text-[var(--ink)]">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-heading text-5xl font-semibold tracking-tight">
                  {usd(plan.priceMonthlyCents)}
                </span>
                <span
                  className={
                    featured ? "opacity-60" : "text-[var(--muted-ink)]"
                  }
                >
                  /month
                </span>
              </p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon className="mt-1 size-4 shrink-0" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref(plan.priceMonthlyCents > 0)}
                className={
                  "pill mt-8 justify-center px-6 py-3 " +
                  (featured
                    ? "bg-[var(--ink-deep)] text-[var(--ink)] hover:brightness-125"
                    : "pill-light")
                }
              >
                {plan.priceMonthlyCents === 0
                  ? "Start free"
                  : `Get ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center text-[var(--muted-ink)]">
        Need a few more? {topupPack.name}: {topupPack.credits} credits for{" "}
        {usd(topupPack.priceCents)}, one-time, no subscription.
      </p>
    </section>
  );
}
