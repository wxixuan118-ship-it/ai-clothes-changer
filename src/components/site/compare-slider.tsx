"use client";

import * as React from "react";

import Image from "next/image";
import { ChevronsLeftRightIcon } from "lucide-react";

// Before/after comparison: the before image is clipped to the slider
// position over the after image. A native range input drives it, so it
// works with keyboard, touch and screen readers.
export function CompareSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  afterLabel,
  width = 700,
  height = 850,
  priority = false,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  afterLabel: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const [pos, setPos] = React.useState(50);

  return (
    <div
      className="relative overflow-hidden rounded-[20px] bg-[var(--paper-2)]"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Image
        src={after}
        alt={afterAlt}
        width={width}
        height={height}
        unoptimized
        priority={priority}
        className="absolute inset-0 size-full object-cover"
      />
      <Image
        src={before}
        alt={beforeAlt}
        width={width}
        height={height}
        unoptimized
        priority={priority}
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white"
        style={{ left: `${pos}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--ink)] shadow-[0_4px_14px_rgba(14,19,24,0.25)]">
          <ChevronsLeftRightIcon className="size-5" />
        </span>
      </div>
      <span className="absolute top-3.5 left-3.5 rounded-full bg-[rgba(14,19,24,0.75)] px-3 py-1.5 text-[13px] font-bold text-white">
        Before
      </span>
      <span className="absolute top-3.5 right-3.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-[var(--ink)]">
        After · {afterLabel}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
