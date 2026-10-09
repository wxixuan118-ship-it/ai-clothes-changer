import Link from "next/link";

export function Pager({
  page,
  total,
  pageSize,
  href,
}: {
  page: number;
  total: number;
  pageSize: number;
  /** Builds the link for a page number. */
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center justify-between text-sm text-[var(--muted-ink)]">
      <span>
        {total} total · page {page} of {pages}
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link
            className="rounded-full border px-3 py-1 hover:text-[var(--ink)]"
            href={href(page - 1)}
          >
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link
            className="rounded-full border px-3 py-1 hover:text-[var(--ink)]"
            href={href(page + 1)}
          >
            Next
          </Link>
        ) : null}
      </span>
    </div>
  );
}

export function fmtDate(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 16).replace("T", " ") : "—";
}

export function pageParam(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
