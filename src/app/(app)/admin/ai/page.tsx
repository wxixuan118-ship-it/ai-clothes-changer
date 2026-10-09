import Link from "next/link";

import { RecheckButton } from "@/components/admin/health-check";
import { ModelForm } from "@/components/admin/model-form";
import { fmtDate } from "@/components/admin/pager";
import { BarChart, Stat } from "@/components/admin/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin/auth";
import { getModelUsage } from "@/lib/admin/queries";
import { checkNbility } from "@/lib/ai/nbility";
import { env, features } from "@/lib/env";
import {
  EDIT_MODELS,
  findModel,
  getEditModel,
  isProviderConfigured,
  providerOf,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

const currencySymbol = { CNY: "¥", USD: "$" } as const;

function money(amount: number, currency: "CNY" | "USD"): string {
  return `${currencySymbol[currency]}${amount.toFixed(amount < 10 ? 2 : 0)}`;
}

/** Sums completed runs × list price, per currency. */
function spend(rows: { model: string; completed: number }[]): string {
  const totals = new Map<"CNY" | "USD", number>();
  for (const row of rows) {
    const cost = findModel(row.model)?.cost;
    if (!cost) continue;
    totals.set(
      cost.currency,
      (totals.get(cost.currency) ?? 0) + row.completed * cost.amount,
    );
  }
  const nonZero = [...totals].filter(([, amount]) => amount > 0);
  if (nonZero.length === 0) return totals.size ? "¥0" : "—";
  return nonZero.map(([c, amount]) => money(amount, c)).join(" + ");
}

function Badge({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "muted";
  children: React.ReactNode;
}) {
  const styles = {
    good: "border-[var(--brand)] text-[var(--brand)]",
    warn: "border-amber-400 text-amber-300",
    bad: "border-red-400 text-red-300",
    muted: "text-[var(--muted-ink)]",
  }[tone];
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs ${styles}`}>
      {children}
    </span>
  );
}

export default async function AdminAiPage() {
  await requireAdmin();
  const current = await getEditModel();
  const provider = providerOf(current);
  const [usage, nbility] = await Promise.all([
    getModelUsage(),
    features.nbility ? checkNbility(current) : Promise.resolve(null),
  ]);

  // Live health of the current model from its last finished runs.
  const recent = usage.lastRuns.filter((run) => run.model === current);
  const recentFailed = recent.filter((run) => run.status === "failed").length;
  const health =
    recent.length === 0
      ? { tone: "muted" as const, label: "No runs yet" }
      : recentFailed === recent.length && recent.length >= 3
        ? { tone: "bad" as const, label: "Failing" }
        : recentFailed > 0
          ? { tone: "warn" as const, label: "Some failures" }
          : { tone: "good" as const, label: "Healthy" };

  const dayRows = usage.byModel.map((row) => ({
    model: row.model,
    completed: row.dayCompleted,
  }));
  const day = usage.byModel.reduce(
    (acc, row) => ({
      total: acc.total + row.day,
      completed: acc.completed + row.dayCompleted,
      failed: acc.failed + row.dayFailed,
    }),
    { total: 0, completed: 0, failed: 0 },
  );
  const successRate = (completed: number, failed: number) =>
    completed + failed === 0
      ? "—"
      : `${Math.round((completed / (completed + failed)) * 100)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Model in use"
          value={findModel(current)?.label ?? current}
          hint={
            provider === "nbility" ? "via Nbility" : "via Alibaba DashScope"
          }
        />
        <div className="rounded-[20px] border bg-[var(--paper-2)] p-5">
          <p className="text-sm text-[var(--muted-ink)]">Live status</p>
          <p className="mt-3">
            <Badge tone={health.tone}>{health.label}</Badge>
          </p>
          <p className="mt-2 text-xs text-[var(--muted-ink)]">
            {recent.length
              ? `${recent.length - recentFailed}/${recent.length} of the latest runs succeeded`
              : "Waiting for the first generation"}
          </p>
        </div>
        <Stat
          label="Last 24h"
          value={day.total}
          hint={`${successRate(day.completed, day.failed)} success · ${day.failed} failed`}
        />
        <Stat
          label="Est. model cost, 24h"
          value={spend(dayRows)}
          hint="completed images × list price"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-[20px] border bg-[var(--paper-2)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-medium tracking-normal">
                Nbility account
              </h2>
              <p className="text-sm text-[var(--muted-ink)]">
                {env.NBILITY_BASE_URL.replace("https://", "")} · checked live on
                page load (free, no image is generated)
              </p>
            </div>
            {features.nbility ? <RecheckButton /> : null}
          </div>
          {!nbility ? (
            <p className="text-sm">
              <Badge tone="muted">Not connected</Badge>{" "}
              <span className="text-[var(--muted-ink)]">
                Add <code>NBILITY_API_KEY</code> in AnySites and redeploy.
              </span>
            </p>
          ) : (
            <ul className="divide-y text-sm">
              <li className="flex justify-between gap-4 py-2">
                <span>API key</span>
                {nbility.keyValid ? (
                  <Badge tone="good">Valid</Badge>
                ) : (
                  <Badge tone="bad">{nbility.error ?? "Rejected"}</Badge>
                )}
              </li>
              <li className="flex justify-between gap-4 py-2">
                <span>
                  <code>gpt-image-2</code> available to this key
                </span>
                {nbility.keyValid ? (
                  nbility.imageModels.includes("gpt-image-2") ? (
                    <Badge tone="good">Yes</Badge>
                  ) : (
                    <Badge tone="bad">No — check the token&apos;s group</Badge>
                  )
                ) : (
                  <Badge tone="muted">—</Badge>
                )}
              </li>
              <li className="flex justify-between gap-4 py-2">
                <span>Balance left</span>
                <span className="tabular-nums">
                  {nbility.unlimited
                    ? "Unlimited token (see Nbility console for account balance)"
                    : nbility.remaining !== null
                      ? money(nbility.remaining, "CNY")
                      : "—"}
                </span>
              </li>
              <li className="flex justify-between gap-4 py-2">
                <span>Used by this key</span>
                <span className="tabular-nums">
                  {nbility.used !== null ? money(nbility.used, "CNY") : "—"}
                </span>
              </li>
              <li className="flex justify-between gap-4 py-2">
                <span>Response time</span>
                <span className="tabular-nums">{nbility.latencyMs} ms</span>
              </li>
              {nbility.imageModels.length ? (
                <li className="py-2 text-xs text-[var(--muted-ink)]">
                  Image models on this key: {nbility.imageModels.join(", ")}
                </li>
              ) : null}
            </ul>
          )}
          <p className="text-xs text-[var(--muted-ink)]">
            Detailed per-request logs and top-ups:{" "}
            <a
              href="https://nbility.ai/console/log"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Nbility console
            </a>
            .
          </p>
        </section>

        <section className="space-y-4 rounded-[20px] border bg-[var(--paper-2)] p-5">
          <div>
            <h2 className="font-sans text-base font-medium tracking-normal">
              Switch model
            </h2>
            <p className="text-sm text-[var(--muted-ink)]">
              Applies to both tools within 30 seconds, no redeploy. Models whose
              provider has no API key are skipped automatically.
            </p>
          </div>
          <ModelForm
            models={EDIT_MODELS.map((model) => ({
              ...model,
              disabled: !isProviderConfigured(model.provider),
            }))}
            current={current}
          />
        </section>
      </div>

      <BarChart
        title="Generations per day (14 days, UTC)"
        data={usage.chart}
        series={[
          { key: "completed", label: "Completed", color: "var(--brand)" },
          { key: "failed", label: "Failed", color: "var(--debit, #f87171)" },
        ]}
      />

      <section className="space-y-3">
        <h2 className="font-sans text-base font-medium tracking-normal">
          Usage by model (last 30 days)
        </h2>
        <div className="overflow-x-auto rounded-[20px] border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Runs</TableHead>
                <TableHead className="text-right">Success</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Blocked</TableHead>
                <TableHead className="text-right">Avg / max time</TableHead>
                <TableHead className="text-right">Est. cost</TableHead>
                <TableHead>Last success (UTC)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.byModel.map((row) => (
                <TableRow key={row.model}>
                  <TableCell>
                    {findModel(row.model)?.label ?? row.model}
                    {row.model === current ? (
                      <span className="ml-2">
                        <Badge tone="good">in use</Badge>
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.total}
                    {row.pending ? (
                      <span className="text-xs text-[var(--muted-ink)]">
                        {" "}
                        ({row.pending} running)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {successRate(row.completed, row.failed)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.failed}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.blocked}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.avgSeconds !== null
                      ? `${row.avgSeconds}s / ${row.maxSeconds}s`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {spend([row])}
                  </TableCell>
                  <TableCell className="text-[var(--muted-ink)]">
                    {row.lastSuccessAt
                      ? fmtDate(new Date(row.lastSuccessAt))
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {usage.byModel.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-[var(--muted-ink)]"
                  >
                    No generations in the last 30 days.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-[var(--muted-ink)]">
          Cost is an estimate (completed images × list price). The exact bill is
          in each provider&apos;s console.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-base font-medium tracking-normal">
            Recent failures
          </h2>
          <Link
            href="/admin/generations?status=failed"
            className="text-sm text-[var(--muted-ink)] hover:text-[var(--ink)]"
          >
            All failed →
          </Link>
        </div>
        {usage.recentFailures.length === 0 ? (
          <p className="text-sm text-[var(--muted-ink)]">None. </p>
        ) : (
          <ul className="divide-y rounded-[20px] border">
            {usage.recentFailures.map((failure) => (
              <li
                key={failure.id}
                className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[150px_200px_1fr]"
              >
                <span className="text-[var(--muted-ink)]">
                  {fmtDate(failure.createdAt)}
                </span>
                <span>{findModel(failure.model)?.label ?? failure.model}</span>
                <Link
                  href={`/admin/users/${failure.userId}`}
                  className="break-words hover:text-[var(--brand)]"
                >
                  {failure.failureReason ?? "unknown"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
