import { cn } from "@/lib/utils";

/** Thin eight-point burst — the brand ornament (decorative). */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden
      className={cn("text-[var(--brand)]", className)}
    >
      <path d="M20 2 L23 15 L36 9 L27 20 L38 25 L24 25 L20 38 L16 25 L2 25 L13 20 L4 9 L17 15 Z" />
    </svg>
  );
}

/** Spiky crown outline that sits above the tallest arch (decorative). */
export function Crown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      aria-hidden
      className={cn("text-[var(--brand)]", className)}
    >
      <path d="M6 46 L14 22 L28 34 L38 6 L50 30 L60 4 L70 30 L82 6 L92 34 L106 22 L114 46" />
    </svg>
  );
}
