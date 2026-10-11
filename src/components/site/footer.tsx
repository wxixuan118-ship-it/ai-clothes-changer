import Link from "next/link";

import { siteConfig } from "@/config/site";
import { toolOrder, tools } from "@/config/tools";
import { Sparkle } from "@/components/atelier/sparkle";

const columns = [
  {
    title: "Products",
    links: toolOrder
      .filter((id) => tools[id].type === "generator")
      .map((id) => ({ href: tools[id].landing, label: tools[id].name })),
  },
  {
    title: "Free tools",
    links: toolOrder
      .filter((id) => tools[id].type !== "generator")
      .map((id) => ({ href: tools[id].landing, label: tools[id].name })),
  },
  {
    title: "Company",
    links: [
      { href: "/style-guides", label: "Guides" },
      { href: "/pricing", label: "Pricing" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-[var(--border)]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-extrabold"
          >
            <span className="tile size-8 rounded-[9px] bg-[var(--brand)]">
              <Sparkle className="size-4 text-[var(--ink-deep)]" />
            </span>
            {siteConfig.name}
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-ink)]">
            Try new hairstyles and outfits on your own photo, and find what
            suits you with free style tools.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-sm font-bold">{column.title}</p>
            <ul className="space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto w-full max-w-[1280px] border-t border-[var(--border)] px-4 py-6 text-xs text-[var(--muted-ink)] sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  );
}
