import Link from "next/link";
import { CheckIcon } from "lucide-react";

import { getSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { plans, topupPack } from "@/config/plans";

export function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

// Every number reads from src/config/plans.ts. CTAs depend on the session:
// members go straight to Billing/the studio; visitors sign up first and
// land there afterwards.
export async function PricingCards() {
  const tiers = Object.values(plans);
  const signedIn = Boolean(await getSession());
  const ctaHref = (paid: boolean) => {
    const target = paid ? "/billing" : "/generate";
    return signedIn ? target : `/signup?next=${encodeURIComponent(target)}`;
  };

  return (
    <>
      <div className="mx-auto grid max-w-[1040px] gap-5 md:grid-cols-3">
        {tiers.map((plan) => {
          const featured = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={cn(
                "card flex flex-col gap-4 p-7",
                featured && "border-2 border-[var(--brand)]",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xl font-extrabold">{plan.name}</p>
                {featured ? (
                  <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-xs font-bold text-[var(--ink-deep)]">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="flex items-baseline gap-1">
                <span className="text-[40px] font-extrabold tracking-[-0.03em]">
                  {usd(plan.priceMonthlyCents)}
                </span>
                <span className="font-semibold text-[var(--muted-ink)]">
                  / month
                </span>
              </p>
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckIcon
                      className="mt-0.5 size-[18px] shrink-0 text-[var(--pop-mint-bold)]"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref(plan.priceMonthlyCents > 0)}
                className={cn(
                  "pill",
                  featured
                    ? "pill-brand"
                    : plan.priceMonthlyCents === 0
                      ? "pill-outline"
                      : "pill-light",
                )}
              >
                {plan.priceMonthlyCents === 0
                  ? "Start free"
                  : `Get ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-[var(--muted-ink)]">
        Need a few more? {topupPack.name}: {topupPack.credits.toLocaleString("en-US")}{" "}
        credits for {usd(topupPack.priceCents)}, one-time, no subscription.
      </p>
    </>
  );
}
