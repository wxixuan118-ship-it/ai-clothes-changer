// Editorial portraits for the marketing arches. Unsplash license: free for
// commercial use, no attribution required. Swap for owned shoots later.
// Served straight from Unsplash's CDN (it resizes via ?w=) with
// next/image `unoptimized` — no open image proxy on our server.
export type Portrait = {
  id: string;
  alt: string;
  /** Arch backdrop shown while the photo loads. */
  tint: string;
};

export const portraits: Portrait[] = [
  {
    id: "1529139574466-a303027c1d8b",
    alt: "Woman in a red graphic T-shirt and black jacket against a teal wall",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "1617690033147-ce6b332d677b",
    alt: "Woman in a bright layered outfit with a printed scarf",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "1515886657613-9f3515b0c78f",
    alt: "Woman in a mustard tracksuit under a blue sky",
    tint: "var(--pop-mint-bold)",
  },
  {
    id: "1488426862026-3ee34a7d66df",
    alt: "Woman in a denim jacket against a soft pink backdrop",
    tint: "var(--pop-yellow-bold)",
  },
  {
    id: "1509631179647-0177331693ae",
    alt: "Model in a white crop top and striped trousers on a teal set",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "1483985988355-763728e1935b",
    alt: "Woman in a burgundy coat against a white wall",
    tint: "var(--pop-orange-bold)",
  },
];

export function portraitSrc(id: string, width = 600): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=80&auto=format&fit=crop`;
}
