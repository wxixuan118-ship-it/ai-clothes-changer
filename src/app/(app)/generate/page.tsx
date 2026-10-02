import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { GENERATION_COST_CREDITS } from "@/config/plans";
import { db } from "@/db";
import { generations } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { getRefundedGenerationIds } from "@/lib/credits";
import { env } from "@/lib/env";
import { DeleteLookButton } from "@/components/generate/delete-look-button";
import { GenerateForm } from "@/components/generate/generate-form";
import { PageHeader } from "@/components/app/page-header";
import { SparkleSpinner } from "@/components/sparkle-spinner";

export const metadata: Metadata = { title: "Clothes changer" };

function formatTimestamp(date: Date): string {
  return date.toISOString().slice(0, 16).replace("T", " ");
}

export default async function GeneratePage() {
  const session = await requireSession();

  const history = await db
    .select()
    .from(generations)
    .where(eq(generations.userId, session.user.id))
    .orderBy(desc(generations.createdAt), desc(generations.id))
    .limit(24);
  // A failed row only says "refunded" when the refund actually landed.
  const refunded = await getRefundedGenerationIds(
    session.user.id,
    history.filter((row) => row.status === "failed").map((row) => row.id),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader
        eyebrow="Studio"
        title="AI Clothes Changer"
        action={
          <span className="chip-mono">
            {session.user.creditBalance ?? 0} credits
          </span>
        }
      />

      <GenerateForm
        balance={session.user.creditBalance ?? 0}
        cost={GENERATION_COST_CREDITS}
        mock={env.AI_MOCK}
        signedIn
      />

      <section>
        <p className="eyebrow mb-4">Your looks</p>
        {history.length === 0 ? (
          <div className="rounded-[24px] border border-dashed px-6 py-10 text-center text-[var(--muted-ink)]">
            Nothing here yet. Upload a photo above and your new looks will
            appear here.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {history.map((generation) => (
              <li
                key={generation.id}
                className="overflow-hidden rounded-[20px] border bg-[var(--paper-2)]"
              >
                <div className="relative aspect-[4/5] bg-[var(--canvas)]">
                  {generation.status === "completed" && generation.imageUrl ? (
                    <a
                      href={generation.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- API-served user images */}
                      <img
                        src={generation.imageUrl}
                        alt={generation.prompt}
                        className="absolute inset-0 size-full object-cover"
                      />
                    </a>
                  ) : generation.status === "failed" ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                      <p className="text-xs tracking-wider text-debit-text uppercase">
                        {refunded.has(generation.id)
                          ? "Failed — credit refunded"
                          : "Failed — refund pending"}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <SparkleSpinner className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 py-2 pr-1.5 pl-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="truncate text-sm" title={generation.prompt}>
                      {generation.prompt}
                    </p>
                    <p className="text-xs text-[var(--muted-ink)]">
                      {formatTimestamp(generation.createdAt)}
                    </p>
                  </div>
                  {generation.status !== "pending" ? (
                    <DeleteLookButton
                      id={generation.id}
                      label={generation.prompt}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
