import Link from "next/link";
import { notFound } from "next/navigation";

import { AdjustCreditsForm } from "@/components/admin/adjust-credits-form";
import { fmtDate } from "@/components/admin/pager";
import { Stat } from "@/components/admin/stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin/auth";
import { getUserDetail } from "@/lib/admin/queries";

const ledgerLabels: Record<string, string> = {
  subscription_grant: "Credits added",
  topup: "Top-up",
  spend: "Generation",
  refund: "Refund",
  expiry: "Expired",
  admin_adjust: "Admin adjustment",
};

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const detail = await getUserDetail((await params).id);
  if (!detail) notFound();
  const { user, generations, ledger } = detail;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="text-sm text-[var(--muted-ink)] hover:text-[var(--ink)]"
        >
          ← All users
        </Link>
        <h2 className="mt-2 font-heading text-2xl">{user.email}</h2>
        <p className="text-sm text-[var(--muted-ink)]">
          {user.name} · joined {fmtDate(user.createdAt)} UTC ·{" "}
          {user.emailVerified ? "email verified" : "email not verified"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Credits" value={user.credits} />
        <Stat
          label="Plan"
          value={user.plan}
          hint={
            user.status && user.status !== "none"
              ? `${user.status}${user.cancelAtPeriodEnd ? " · cancels" : ""}${user.currentPeriodEnd ? ` · until ${fmtDate(user.currentPeriodEnd).slice(0, 10)}` : ""}`
              : "no subscription"
          }
        />
        <Stat
          label="Generations"
          value={generations.length}
          hint="latest 24 shown"
        />
        <Stat
          label="Stripe customer"
          value={user.stripeCustomerId ? "Yes" : "—"}
          hint={user.stripeCustomerId ?? undefined}
        />
      </div>

      <section className="space-y-3 rounded-[20px] border bg-[var(--paper-2)] p-5">
        <h3 className="font-sans text-base font-medium tracking-normal">
          Adjust credits
        </h3>
        <AdjustCreditsForm userId={user.id} />
      </section>

      <section className="space-y-3">
        <h3 className="font-sans text-base font-medium tracking-normal">
          Recent generations
        </h3>
        {generations.length === 0 ? (
          <p className="text-sm text-[var(--muted-ink)]">None yet.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {generations.map((g) => (
              <li
                key={g.id}
                className="overflow-hidden rounded-[14px] border bg-[var(--paper-2)]"
              >
                <div className="relative aspect-[4/5] bg-[var(--canvas)]">
                  {g.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- owner/admin-checked route
                    <img
                      src={g.imageUrl}
                      alt={g.prompt}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-xs text-[var(--muted-ink)]">
                      {g.status}
                    </span>
                  )}
                </div>
                <p
                  className="truncate px-2 py-1.5 text-xs"
                  title={g.failureReason ?? g.prompt}
                >
                  {g.status === "failed"
                    ? `Failed: ${g.failureReason ?? "unknown"}`
                    : g.prompt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-sans text-base font-medium tracking-normal">
          Credit history
        </h3>
        <div className="overflow-x-auto rounded-[20px] border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When (UTC)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-[var(--muted-ink)]">
                    {fmtDate(tx.createdAt)}
                  </TableCell>
                  <TableCell>{ledgerLabels[tx.type] ?? tx.type}</TableCell>
                  <TableCell
                    className="max-w-[320px] truncate text-[var(--muted-ink)]"
                    title={tx.refId ?? ""}
                  >
                    {tx.refType === "admin" ? tx.refId : (tx.refType ?? "—")}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${tx.amount > 0 ? "text-credit-text" : "text-debit-text"}`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
