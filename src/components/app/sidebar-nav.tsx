"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CreditCardIcon,
  ScissorsIcon,
  ShirtIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const baseItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/generate", label: "AI Hairstyle", icon: ScissorsIcon },
  {
    href: "/generate?tool=clothes",
    label: "AI Clothes",
    icon: ShirtIcon,
  },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const adminItem = { href: "/admin", label: "Admin", icon: ShieldIcon };

export function SidebarNav({
  orientation = "vertical",
  isAdmin = false,
}: {
  /** "horizontal" = the scrollable bar shown under the header on phones. */
  orientation?: "vertical" | "horizontal";
  /** Shows the Admin link. Display only — /admin re-checks on the server. */
  isAdmin?: boolean;
}) {
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
        // Hairstyle (/generate) and Clothes (/generate?tool=clothes) share a
        // path; the tool query decides which one is current.
        const [itemPath, itemQuery] = item.href.split("?");
        const active = itemQuery
          ? pathname === itemPath && searchParams.toString() === itemQuery
          : (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
            !(
              item.href === "/generate" &&
              searchParams.get("tool") === "clothes"
            );
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
