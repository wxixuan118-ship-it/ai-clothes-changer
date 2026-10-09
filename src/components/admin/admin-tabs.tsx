"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/generations", label: "Generations" },
  { href: "/admin/ai", label: "AI" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border bg-[var(--paper-2)] p-1"
    >
      {tabs.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
              active
                ? "bg-[var(--brand)] font-medium text-[var(--ink-deep)]"
                : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
