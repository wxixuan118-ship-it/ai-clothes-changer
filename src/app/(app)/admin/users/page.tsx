import Link from "next/link";

import { fmtDate, Pager, pageParam } from "@/components/admin/pager";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin/auth";
import { listUsers, PAGE_SIZE } from "@/lib/admin/queries";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = pageParam(params.page);
  const q = params.q?.trim() ?? "";
  const { rows, total } = await listUsers({ q, page });
  const href = (p: number) =>
    `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <div className="space-y-4">
      <form className="flex max-w-md gap-2" action="/admin/users">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search email or name"
          aria-label="Search users"
          className="rounded-full"
        />
        <button className="pill pill-brand px-5 py-2 text-sm" type="submit">
          Search
        </button>
      </form>
      <div className="overflow-x-auto rounded-[20px] border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Generations</TableHead>
              <TableHead>Joined (UTC)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="underline-offset-4 hover:text-[var(--brand)] hover:underline"
                  >
                    {user.email}
                  </Link>
                  {!user.emailVerified ? (
                    <span className="ml-2 text-xs text-[var(--muted-ink)]">
                      unverified
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-[var(--muted-ink)]">
                  {user.name}
                </TableCell>
                <TableCell>{user.plan}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {user.credits}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {user.generations}
                </TableCell>
                <TableCell className="text-[var(--muted-ink)]">
                  {fmtDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-[var(--muted-ink)]"
                >
                  No users found.
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
