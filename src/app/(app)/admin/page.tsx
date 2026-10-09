import Link from "next/link";

import { BarChart, Stat } from "@/components/admin/stat";
import { requireAdmin } from "@/lib/admin/auth";
import { getOverview } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function pct(part: number, whole: number): string {
  return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const o = await getOverview();
  const weekRuns = o.generations.weekCompleted + o.generations.weekFailed;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Users"
          value={o.users.total}
          hint={`+${o.users.today} today · +${o.users.week} in 7 days`}
        />
        <Stat label="Paying subscribers" value={o.payingSubscribers} />
        <Stat
          label="Generations"
          value={o.generations.total}
          hint={`${o.generations.today} today`}
        />
        <Stat
          label="Success rate (7 days)"
          value={pct(o.generations.weekCompleted, weekRuns)}
          hint={`${o.generations.weekFailed} failed · ${o.generations.weekBlocked} blocked by safety`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title="Sign-ups (14 days)"
          data={o.signupsChart}
          series={[{ key: "value", label: "Sign-ups", color: "var(--brand)" }]}
        />
        <BarChart
          title="Generations (14 days)"
          data={o.generationsChart}
          series={[
            { key: "completed", label: "Completed", color: "var(--brand)" },
            { key: "failed", label: "Failed", color: "var(--debit)" },
          ]}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Stat
          label="Credits used (7 days, net of refunds)"
          value={o.creditsSpentWeek}
          hint="≈ images generated and kept"
        />
        <section className="rounded-[20px] border bg-[var(--paper-2)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sans text-base font-medium tracking-normal">
              Newest users
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-[var(--muted-ink)] underline underline-offset-4 hover:text-[var(--ink)]"
            >
              All users
            </Link>
          </div>
          <ul className="divide-y">
            {o.recentUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-[var(--brand)]"
                >
                  <span className="truncate">
                    {user.email}
                    <span className="ml-2 text-[var(--muted-ink)]">
                      {user.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--muted-ink)]">
                    {user.createdAt
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </span>
                </Link>
              </li>
            ))}
            {o.recentUsers.length === 0 ? (
              <li className="py-3 text-sm text-[var(--muted-ink)]">
                No users yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
