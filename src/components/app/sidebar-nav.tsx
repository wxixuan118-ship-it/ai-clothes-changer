"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCardIcon,
  ShirtIcon,
  LayoutDashboardIcon,
  SettingsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/generate", label: "Clothes changer", icon: ShirtIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function SidebarNav({
  orientation = "vertical",
}: {
  /** "horizontal" = the scrollable bar shown under the header on phones. */
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className={cn(
        "flex gap-1",
        orientation === "vertical"
          ? "flex-col"
          : "overflow-x-auto [scrollbar-width:none]",
      )}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors",
              active
                ? "bg-[var(--brand)] font-medium text-[var(--ink-deep)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
