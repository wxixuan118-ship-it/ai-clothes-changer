"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  categoryLabels,
  freeCategories,
  toolOrder,
  tools,
  toolsInCategory,
  type ToolCategory,
  type ToolId,
} from "@/config/tools";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toolIcon, toolTint } from "./tool-style";

export type NavLink = { href: string; label: string };

const paid = toolOrder.filter((id) => tools[id].type === "generator");
const free = toolOrder.filter((id) => tools[id].type !== "generator");

// Mega-menu columns, balanced by item count.
const freeColumns: ToolCategory[][] = [
  ["face-shape", "fun"],
  ["features", "proportions"],
  ["makeup", "color"],
  ["body", "privacy"],
];

function NewBadge() {
  return (
    <span className="rounded-full bg-[var(--brand)] px-1.5 py-px text-[10px] font-bold text-[var(--ink-deep)]">
      NEW
    </span>
  );
}

function ToolTile({
  id,
  size = "md",
}: {
  id: ToolId;
  size?: "xs" | "sm" | "md";
}) {
  const Icon = toolIcon[id];
  const [bg, fg] = toolTint[id];
  return (
    <span
      className={cn(
        "tile",
        size === "xs" ? "size-8 rounded-lg" : size === "sm" ? "size-10" : "size-11",
      )}
      style={{ background: bg, color: fg }}
    >
      <Icon className={size === "xs" ? "size-4" : "size-5"} aria-hidden />
    </span>
  );
}

function MenuTrigger({
  label,
  active,
  free: isFree,
}: {
  label: string;
  active: boolean;
  free?: boolean;
}) {
  return (
    <DropdownMenuTrigger asChild>
      <button
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-3.5 text-[15px] font-semibold transition-colors hover:bg-[var(--accent-soft)] data-[state=open]:bg-[var(--accent-soft)]",
          active && "text-[var(--brand-strong)]",
        )}
      >
        {label}
        {isFree ? (
          <span className="rounded-full bg-[var(--pop-mint)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--free-text)]">
            FREE
          </span>
        ) : null}
        <ChevronDownIcon className="size-4" aria-hidden />
      </button>
    </DropdownMenuTrigger>
  );
}

export function ProductsMenu() {
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <MenuTrigger
        label="Products"
        active={paid.some((id) => tools[id].landing === pathname)}
      />
      <DropdownMenuContent
        align="start"
        className="w-[min(520px,90vw)] rounded-2xl p-3"
      >
        <p className="px-3 pt-1 pb-2 text-xs font-bold tracking-[0.08em] text-[var(--muted-ink)] uppercase">
          AI try-on · uses credits
        </p>
        {paid.map((id) => (
          <DropdownMenuItem key={id} asChild className="p-0">
            <Link
              href={tools[id].landing}
              className="flex items-center gap-3.5 rounded-xl p-3"
            >
              <ToolTile id={id} />
              <span className="flex flex-col">
                <span className="font-bold">{tools[id].name}</span>
                <span className="text-sm text-[var(--muted-ink)]">
                  {tools[id].desc}
                </span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FreeToolsMenu() {
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <MenuTrigger
        label="Free Tools"
        free
        active={
          pathname === "/free-tools" ||
          free.some((id) => tools[id].landing === pathname)
        }
      />
      <DropdownMenuContent
        align="start"
        className="max-h-[calc(100vh-96px)] w-[min(1120px,96vw)] overflow-y-auto rounded-2xl p-4"
      >
        <div className="grid grid-cols-4 gap-x-4 gap-y-2">
          {freeColumns.map((column) => (
            <div key={column.join()} className="flex flex-col gap-3">
              {column.map((category) => (
                <div key={category}>
                  <p className="border-b border-[var(--border)] px-2 pb-2 text-[13px] font-bold">
                    {categoryLabels[category]}
                  </p>
                  <div className="mt-1 flex flex-col">
                    {toolsInCategory(category).map((id) => (
                      <DropdownMenuItem key={id} asChild className="p-0">
                        <Link
                          href={tools[id].landing}
                          className="flex items-start gap-2.5 rounded-xl px-2 py-1.5"
                        >
                          <ToolTile id={id} size="xs" />
                          <span className="flex min-w-0 flex-col">
                            <span className="flex flex-wrap items-center gap-1.5 text-[13px] leading-snug font-bold">
                              {tools[id].name}
                              {tools[id].isNew ? <NewBadge /> : null}
                            </span>
                            <span className="text-xs leading-snug text-[var(--muted-ink)]">
                              {tools[id].desc}
                            </span>
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <DropdownMenuItem asChild className="mt-3 p-0">
          <Link
            href="/free-tools"
            className="flex items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-bold"
          >
            See all {free.length} free tools
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 items-center rounded-[10px] px-3.5 text-[15px] font-semibold transition-colors hover:bg-[var(--accent-soft)]",
            pathname === link.href &&
              "bg-[var(--brand-soft)] text-[var(--brand-strong)]",
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export function MobileNav({
  links,
  signedIn,
}: {
  links: readonly NavLink[];
  signedIn: boolean;
}) {
  const pathname = usePathname();
  // The sheet remembers the route it was opened on, so navigating away
  // closes it without an effect.
  const [openOn, setOpenOn] = React.useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex size-11 items-center justify-center rounded-[10px] border border-[var(--input)]"
      >
        {open ? (
          <XIcon className="size-5" aria-hidden />
        ) : (
          <MenuIcon className="size-5" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-72px)] overflow-y-auto border-b border-[var(--border)] bg-[var(--canvas)] px-4 pt-2 pb-6 shadow-[var(--shadow-hard-lg)]"
        >
          {[
            { title: "Products", ids: paid },
            ...freeCategories.map((category) => ({
              title: `Free · ${categoryLabels[category]}`,
              ids: toolsInCategory(category),
            })),
          ].map((group) => (
            <div key={group.title} className="py-2">
              <p className="px-2 pb-1 text-xs font-bold tracking-[0.08em] text-[var(--muted-ink)] uppercase">
                {group.title}
              </p>
              {group.ids.map((id) => (
                <Link
                  key={id}
                  href={tools[id].landing}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-2"
                >
                  <ToolTile id={id} size="sm" />
                  <span className="font-semibold">{tools[id].name}</span>
                </Link>
              ))}
            </div>
          ))}
          <div className="border-t border-[var(--border)] pt-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-12 items-center px-2 font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {signedIn ? null : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/login" className="pill pill-outline">
                Log in
              </Link>
              <Link href="/signup" className="pill pill-brand">
                Sign up free
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
