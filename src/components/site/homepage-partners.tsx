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
      <a
        href="https://findly.tools/stylemirror-ai?utm_source=stylemirror-ai"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Featured on Findly.tools"
      >
        <img
          src="https://findly.tools/badges/findly-tools-badge-light.svg"
          alt="Featured on Findly.tools"
          width={175}
          height={55}
        />
      </a>
      <a
        href="https://huntfortools.com/tool/stylemirrorai"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hunt for Tools"
      >
        <img
          src="https://huntfortools.com/assets/images/badge.png"
          alt="Hunt for Tools"
          height={54}
          loading="lazy"
        />
      </a>
      <a
        href="https://huzzler.so/products/85YXPRuiMQ/stylemirror?utm_source=huzzler_product_website&amp;utm_medium=badge&amp;utm_campaign=free_listing"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          alt="Huzzler Embed Badge"
          src="https://huzzler.so/assets/images/embeddable-badges/featured.png"
          width={159}
          height={55}
        />
      </a>
      <a
        href="https://devhub.best/projects/stylemirror-ai?utm_source=badge"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Featured on DevHub"
      >
        <img
          src="https://r2.direasy-multi-tenant.focusapps.app/uploads/616d0b1a-3979-4b8c-94d1-b4f1fedd3ead/1783239702078/53yqmim54zv/featured-on-light.svg"
          alt="Featured on DevHub"
          style={{ height: 44, width: "auto" }}
        />
      </a>
      <a href="https://www.freeai.run" target="_blank" rel="noopener noreferrer">
        <img
          src="https://www.freeai.run/badge/badge_light.svg"
          alt="Featured on FreeAI"
          width={200}
          height={54}
        />
      </a>
    </div>
  );
}
