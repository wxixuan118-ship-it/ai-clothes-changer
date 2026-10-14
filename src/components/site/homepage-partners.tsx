"use client";

import { usePathname } from "next/navigation";

export function HomepagePartners() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-4 border-t border-[var(--border)] px-4 py-6 sm:px-6">
      <span className="text-sm font-bold">Partners</span>
      <a
        href="https://fazier.com/launches/stylemirrorai.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="StyleMirror AI on Fazier"
      >
        <img
          src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
          width={120}
          alt="Fazier badge"
        />
      </a>
      <a
        href="https://twelve.tools"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Featured on Twelve Tools"
      >
        <img
          src="https://twelve.tools/badge0-white.svg"
          alt="Featured on Twelve Tools"
          width={148}
          height={40}
        />
      </a>
    </div>
  );
}
