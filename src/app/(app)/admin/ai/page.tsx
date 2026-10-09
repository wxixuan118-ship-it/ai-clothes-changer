import Link from "next/link";

import { RecheckButton } from "@/components/admin/health-check";
import { ModelForm } from "@/components/admin/model-form";
import { fmtDate } from "@/components/admin/pager";
import { ProviderToggle } from "@/components/admin/provider-toggle";
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
import { checkKie, type KieStatus } from "@/lib/ai/kie";
import { checkNbility, type NbilityStatus } from "@/lib/ai/nbility";
import { features } from "@/lib/env";
import {
  EDIT_MODELS,
  findModel,
  getEditModel,
  isProviderConfigured,
  isProviderEnabled,
  PROVIDERS,
  providerOf,
  type ModelProvider,
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
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${styles}`}
    >
      {children}
    </span>
  );
}

function Line({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <span>{label}</span>
      <span className="text-right tabular-nums">{children}</span>
    </li>
  );
}

type Checks = {
  nbility: NbilityStatus | null;
  kie: KieStatus | null;
};

/** Provider-specific live rows (key, balance, latency). */
function LiveRows({
  provider,
  checks,
}: {
  provider: ModelProvider;
  checks: Checks;
}) {
  if (provider === "nbility" && checks.nbility) {
    const n = checks.nbility;
    return (
      <>
        <Line label="API key">
          {n.keyValid ? (
            <Badge tone="good">Valid</Badge>
          ) : (
            <Badge tone="bad">Rejected</Badge>
          )}
        </Line>
        {!n.keyValid && n.error ? (
          <li className="py-2 text-xs break-words text-red-300">
            {n.error.slice(0, 200)}
          </li>
        ) : null}
        <Line label={<code>gpt-image-2</code>}>
          {!n.keyValid ? (
            <Badge tone="muted">—</Badge>
          ) : n.imageModels.includes("gpt-image-2") ? (
            <Badge tone="good">Available</Badge>
          ) : (
            <Badge tone="bad">Missing — use the image group</Badge>
          )}
        </Line>
        <Line label="Balance left">
          {n.unlimited
            ? "Unlimited token"
            : n.remaining !== null
              ? money(n.remaining, "CNY")
              : "—"}
        </Line>
        <Line label="Used by this key">
          {n.used !== null ? money(n.used, "CNY") : "—"}
        </Line>
        <Line label="Response time">{n.latencyMs} ms</Line>
      </>
    );
  }
  if (provider === "kie" && checks.kie) {
    const k = checks.kie;
    return (
      <>
        <Line label="API key">
          {k.keyValid ? (
            <Badge tone="good">Valid</Badge>
          ) : (
            <Badge tone="bad">Rejected</Badge>
          )}
        </Line>
        {!k.keyValid && k.error ? (
          <li className="py-2 text-xs break-words text-red-300">
            {k.error.slice(0, 200)}
          </li>
        ) : null}
        <Line label="Credits left">
          {k.credits !== null
            ? `${k.credits.toFixed(1)} (≈ ${money(k.usd ?? 0, "USD")})`
            : "—"}
        </Line>
        <Line label="Images left (Seedream 5 Flash)">
          {k.credits !== null ? Math.floor(k.credits / 3.24) : "—"}
        </Line>
        <Line label="Response time">{k.latencyMs} ms</Line>
      </>
    );
  }
  if (provider === "dashscope" && isProviderConfigured("dashscope")) {
    return (
      <Line label="API key">
        <Badge tone="muted">Set (no balance API)</Badge>
      </Line>
    );
  }
  return null;
}

export default async function AdminAiPage() {
  await requireAdmin();
  const [current, usage, nbility, kie, enabledList] = await Promise.all([
    getEditModel(),
    getModelUsage(),
    features.nbility ? checkNbility("gpt-image-2") : Promise.resolve(null),
    features.kie ? checkKie() : Promise.resolve(null),
    Promise.all(PROVIDERS.map((p) => isProviderEnabled(p.id))),
  ]);
  const checks: Checks = { nbility, kie };
  const enabled = Object.fromEntries(
    PROVIDERS.map((p, i) => [p.id, enabledList[i]]),
  ) as Record<ModelProvider, boolean>;
  const currentProvider = current ? providerOf(current) : null;

  // Live health of the current model from its last finished runs.
  const recent = usage.lastRuns.filter((run) => run.model === current);
  const recentFailed = recent.filter((run) => run.status === "failed").length;
  const health = !current
    ? { tone: "bad" as const, label: "No model available" }
    : recent.length === 0
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
          value={current ? (findModel(current)?.label ?? current) : "None"}
          hint={
            currentProvider
              ? `via ${PROVIDERS.find((p) => p.id === currentProvider)?.label}`
              : "Every provider is off or has no key — the tools show “not available”."
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

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-base font-medium tracking-normal">
              Providers
            </h2>
            <p className="text-sm text-[var(--muted-ink)]">
              Checked live on page load (free — no image is generated).
              Switching a provider off takes effect within 30 seconds.
            </p>
          </div>
          <RecheckButton />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {PROVIDERS.map((provider) => {
            const configured = isProviderConfigured(provider.id);
            const on = enabled[provider.id];
            return (
              <div
                key={provider.id}
                className={`space-y-3 rounded-[20px] border bg-[var(--paper-2)] p-5 ${
                  currentProvider === provider.id ? "border-[var(--brand)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-sans text-base font-medium tracking-normal">
                      {provider.label}
                    </h3>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      {!configured ? (
                        <Badge tone="muted">No key</Badge>
                      ) : on ? (
                        <Badge tone="good">On</Badge>
                      ) : (
                        <Badge tone="warn">Off</Badge>
                      )}
                      {currentProvider === provider.id ? (
                        <Badge tone="good">in use</Badge>
                      ) : null}
                    </p>
                  </div>
                  {configured ? (
                    <ProviderToggle
                      provider={provider.id}
                      enabled={on}
                      label={provider.label}
                    />
                  ) : null}
                </div>
                {configured ? (
                  <ul className="divide-y text-sm">
                    <LiveRows provider={provider.id} checks={checks} />
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--muted-ink)]">
                    Add <code>{provider.envKey}</code> in AnySites and redeploy.
                  </p>
                )}
                <p className="text-xs text-[var(--muted-ink)]">
                  Models:{" "}
                  {EDIT_MODELS.filter((m) => m.provider === provider.id)
                    .map((m) => m.label)
                    .join(", ")}{" "}
                  ·{" "}
                  <a
                    href={provider.console}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    console
                  </a>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-[20px] border bg-[var(--paper-2)] p-5">
        <div>
          <h2 className="font-sans text-base font-medium tracking-normal">
            Switch model
          </h2>
          <p className="text-sm text-[var(--muted-ink)]">
            Used by both tools within 30 seconds, no redeploy. If the chosen
            model&apos;s provider is switched off, the next provider that is on
            takes over automatically.
          </p>
        </div>
        <ModelForm
          models={EDIT_MODELS.map((model) => ({
            ...model,
            label: `${model.label} · ${PROVIDERS.find((p) => p.id === model.provider)?.label}`,
            disabled:
              !isProviderConfigured(model.provider) || !enabled[model.provider],
            reason: !isProviderConfigured(model.provider)
              ? "API key not set"
              : !enabled[model.provider]
                ? "provider switched off"
                : undefined,
          }))}
          current={current ?? ""}
        />
      </section>

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
