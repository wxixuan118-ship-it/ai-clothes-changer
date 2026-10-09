import Link from "next/link";

import { fmtDate, Pager, pageParam } from "@/components/admin/pager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin/auth";
import { listGenerations, PAGE_SIZE } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

const filters = [
  { value: undefined, label: "All" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
] as const;

export default async function AdminGenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = filters.find((f) => f.value === params.status)?.value;
  const page = pageParam(params.page);
  const { rows, total } = await listGenerations({ status, page });
  const href = (p: number) =>
    `/admin/generations?${new URLSearchParams({ ...(status ? { status } : {}), page: String(p) })}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={
              f.value
                ? `/admin/generations?status=${f.value}`
                : "/admin/generations"
            }
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              status === f.value
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[20px] border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Result</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Request</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>When (UTC)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  {g.imageUrl ? (
                    <a href={g.imageUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-checked route */}
                      <img
                        src={g.imageUrl}
                        alt=""
                        className="size-12 rounded-md object-cover"
                      />
                    </a>
                  ) : (
                    <span className="block size-12 rounded-md bg-[var(--paper-2)]" />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/users/${g.userId}`}
                    className="hover:text-[var(--brand)] hover:underline"
                  >
                    {g.email}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[260px] truncate" title={g.prompt}>
                  {g.prompt}
                </TableCell>
                <TableCell className="text-xs text-[var(--muted-ink)]">
                  {g.model}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      g.status === "failed"
                        ? "text-debit-text"
                        : g.status === "completed"
                          ? "text-credit-text"
                          : ""
                    }
                  >
                    {g.status}
                  </span>
                  {g.failureReason ? (
                    <p
                      className="max-w-[260px] truncate text-xs text-[var(--muted-ink)]"
                      title={g.failureReason}
                    >
                      {g.failureReason}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="text-[var(--muted-ink)]">
                  {fmtDate(g.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--muted-ink)]"
                >
                  Nothing here.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <Pager page={page} total={total} pageSize={PAGE_SIZE} href={href} />
    </div>
  );
}
