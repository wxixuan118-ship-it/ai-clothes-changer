// Kibbe body types: the 13 image identities, and a short self-assessment.
// Each answer leans toward one of five families — Dramatic (sharp yang),
// Natural (blunt yang), Classic (balance), Gamine (mixed, compact) or
// Romantic (yin) — and the top two families decide the type.

import { ranked, type QuizDef } from "./quiz";

export type KibbeFamily = "D" | "N" | "C" | "G" | "R";

export type KibbeType =
  | "dramatic"
  | "soft-dramatic"
  | "flamboyant-natural"
  | "natural"
  | "soft-natural"
  | "dramatic-classic"
  | "classic"
  | "soft-classic"
  | "flamboyant-gamine"
  | "gamine"
  | "soft-gamine"
  | "theatrical-romantic"
  | "romantic";

export const kibbeInfo: Record<
  KibbeType,
  { label: string; family: string; essence: string; body: string; wear: string[]; avoid: string }
> = {
  dramatic: {
    label: "Dramatic",
    family: "Dramatic",
    essence: "Sharp, elongated yang — bold and striking.",
    body: "Long vertical line, narrow and angular bone structure, flatter flesh.",
    wear: ["Sharp tailoring and strong shoulders", "Long, unbroken vertical lines", "Bold geometric prints", "Stiff, smooth fabrics"],
    avoid: "Fussy details, ruffles and soft draping.",
  },
  "soft-dramatic": {
    label: "Soft Dramatic",
    family: "Dramatic",
    essence: "Sharp yang with lush yin — glamorous and opulent.",
    body: "Long vertical line and large bones, with curves in the bust and hips and soft facial features.",
    wear: ["Long, draped silhouettes", "Defined waist with fluid fabric", "Large, ornate jewelry", "Rich, luxurious textures"],
    avoid: "Boxy, unconstructed shapes and tiny details.",
  },
  "flamboyant-natural": {
    label: "Flamboyant Natural",
    family: "Natural",
    essence: "Blunt yang with length — relaxed and expansive.",
    body: "Long line, broad shoulders, blunt wide bones, flesh on the flatter side.",
    wear: ["Relaxed, unconstructed layers", "Oversized blazers and wide trousers", "Textured, natural fabrics", "Chunky, organic jewelry"],
    avoid: "Tight, rigid tailoring and tiny prints.",
  },
  natural: {
    label: "Natural",
    family: "Natural",
    essence: "Soft yang — effortless and approachable.",
    body: "Moderate height, slightly broad and blunt frame, athletic look.",
    wear: ["Easy, slightly relaxed fits", "Soft structure, not stiff", "Natural textures like linen and denim", "Asymmetric, casual details"],
    avoid: "Severe tailoring and overly delicate trims.",
  },
  "soft-natural": {
    label: "Soft Natural",
    family: "Natural",
    essence: "Blunt yang with yin curves — warm and free-spirited.",
    body: "Moderate or shorter height, slightly broad frame, softer curves in bust and hips.",
    wear: ["Soft, drapey fabrics", "Waist definition with relaxed shape", "Wrap dresses and soft knits", "Curved, organic details"],
    avoid: "Stiff, boxy cuts and sharp geometric lines.",
  },
  "dramatic-classic": {
    label: "Dramatic Classic",
    family: "Classic",
    essence: "Balance with a sharp edge — refined and polished.",
    body: "Moderate height, symmetrical proportions with slightly angular bones.",
    wear: ["Crisp, tailored pieces", "Clean lines and structured fabrics", "Polished, minimal accessories", "Tonal outfits"],
    avoid: "Very relaxed shapes and fussy trims.",
  },
  classic: {
    label: "Classic",
    family: "Classic",
    essence: "Pure balance — elegant and timeless.",
    body: "Moderate everything: height, bone structure and flesh are all evenly balanced.",
    wear: ["Tailored but softly finished", "Matching sets and refined basics", "Moderate, symmetrical details"],
    avoid: "Extremes — oversized, very sharp or very ornate pieces.",
  },
  "soft-classic": {
    label: "Soft Classic",
    family: "Classic",
    essence: "Balance with softness — graceful and gentle.",
    body: "Moderate height, symmetrical proportions with slightly rounded curves.",
    wear: ["Gently shaped tailoring", "Soft, smooth fabrics", "Delicate, refined jewelry", "Soft draping at the waist"],
    avoid: "Harsh angles and heavy, rough textures.",
  },
  "flamboyant-gamine": {
    label: "Flamboyant Gamine",
    family: "Gamine",
    essence: "Mixed yang and yin, leaning sharp — energetic and playful.",
    body: "Petite or compact frame with angular bones and a straighter line.",
    wear: ["Cropped jackets and slim pants", "Bold contrasts and color blocking", "Sharp, quirky details", "Short, broken lines"],
    avoid: "Long, flowing, unbroken silhouettes.",
  },
  gamine: {
    label: "Gamine",
    family: "Gamine",
    essence: "Even mix of yang and yin — spirited and youthful.",
    body: "Compact frame mixing sharp and soft features in equal parts.",
    wear: ["Tailored, close-fitting shapes", "Broken lines: separates, belts", "Crisp fabrics with playful details", "Contrast and small prints"],
    avoid: "Oversized, draped or very long pieces.",
  },
  "soft-gamine": {
    label: "Soft Gamine",
    family: "Gamine",
    essence: "Mixed yang and yin, leaning soft — sweet and lively.",
    body: "Petite frame, a little sharpness with noticeable curves.",
    wear: ["Fitted waists with shaped skirts", "Rounded, playful details", "Contrast in small doses", "Cropped, shaped jackets"],
    avoid: "Long, heavy, unbroken lines and boxy cuts.",
  },
  "theatrical-romantic": {
    label: "Theatrical Romantic",
    family: "Romantic",
    essence: "Lush yin with a sharp edge — alluring and dramatic.",
    body: "Petite to moderate frame, delicate sharp bones, soft curves.",
    wear: ["Fitted, waist-defined shapes", "Draping with sharp accents", "Sheer, luxe fabrics", "Ornate, delicate jewelry"],
    avoid: "Boxy, oversized and heavy fabrics.",
  },
  romantic: {
    label: "Romantic",
    family: "Romantic",
    essence: "Pure yin — soft, sensual and lush.",
    body: "Petite to moderate height, rounded bones and soft, curvy flesh.",
    wear: ["Soft, flowing fabrics", "Defined waists and curved seams", "Lace, ruffles and draping", "Round, delicate details"],
    avoid: "Sharp tailoring, stiff fabrics and geometric prints.",
  },
};

export const kibbeTypes = Object.keys(kibbeInfo) as KibbeType[];

export function pickKibbe(first: KibbeFamily, second: KibbeFamily, gap: number): KibbeType {
  // A clear lead with no strong secondary keeps the pure type.
  const pure = gap >= 3;
  switch (first) {
    case "D":
      return !pure && second === "R" ? "soft-dramatic" : "dramatic";
    case "N":
      if (!pure && second === "D") return "flamboyant-natural";
      if (!pure && second === "R") return "soft-natural";
      return "natural";
    case "C":
      if (!pure && (second === "D" || second === "N")) return "dramatic-classic";
      if (!pure && second === "R") return "soft-classic";
      return "classic";
    case "G":
      if (!pure && (second === "D" || second === "N")) return "flamboyant-gamine";
      if (!pure && second === "R") return "soft-gamine";
      return "gamine";
    case "R":
      return !pure && second === "D" ? "theatrical-romantic" : "romantic";
  }
}

const families = ["D", "N", "C", "G", "R"] as const;

export const kibbeQuiz: QuizDef<KibbeFamily> = {
  keys: families,
  questions: [
    {
      q: "How does your height read in photos with other people?",
      options: [
        { label: "Tall and long — I look taller than I am", scores: { D: 2, N: 1 } },
        { label: "Moderate and in proportion", scores: { C: 2 } },
        { label: "Petite or compact", scores: { G: 2, R: 1 } },
      ],
    },
    {
      q: "Your shoulders are…",
      options: [
        { label: "Narrow and sharp", scores: { D: 2 } },
        { label: "Broad, blunt or squared", scores: { N: 2 } },
        { label: "Even with my hips, neatly tapered", scores: { C: 2 } },
        { label: "Small and slightly sloped or rounded", scores: { R: 2, G: 1 } },
      ],
    },
    {
      q: "Your hands and feet are…",
      options: [
        { label: "Long and narrow", scores: { D: 2 } },
        { label: "Large and wide", scores: { N: 2 } },
        { label: "Medium, in proportion", scores: { C: 2 } },
        { label: "Small and narrow", scores: { G: 2 } },
        { label: "Small and soft or fleshy", scores: { R: 2 } },
      ],
    },
    {
      q: "Your arms and legs look…",
      options: [
        { label: "Long and slender", scores: { D: 2 } },
        { label: "Long and solid", scores: { N: 2 } },
        { label: "In proportion with my torso", scores: { C: 2 } },
        { label: "Short in relation to my torso", scores: { G: 2, R: 1 } },
      ],
    },
    {
      q: "When you gain weight, it goes…",
      options: [
        { label: "Evenly, and I stay fairly straight", scores: { D: 1, N: 1 } },
        { label: "To my waist and middle first", scores: { N: 2 } },
        { label: "Evenly, keeping my shape", scores: { C: 2 } },
        { label: "To my bust and hips, keeping a waist", scores: { R: 2 } },
        { label: "Mostly to my hips and thighs", scores: { G: 1, R: 1 } },
      ],
    },
    {
      q: "Your bust and hips are…",
      options: [
        { label: "Flat or narrow", scores: { D: 2, G: 1 } },
        { label: "Slightly broad but not very curvy", scores: { N: 2 } },
        { label: "Moderate and balanced", scores: { C: 2 } },
        { label: "Rounded and full", scores: { R: 2 } },
      ],
    },
    {
      q: "Your jawline and cheekbones are…",
      options: [
        { label: "Sharp and angular", scores: { D: 2 } },
        { label: "Broad or blunt", scores: { N: 2 } },
        { label: "Even and symmetrical", scores: { C: 2 } },
        { label: "A mix of sharp and soft", scores: { G: 2 } },
        { label: "Soft and rounded", scores: { R: 2 } },
      ],
    },
    {
      q: "Your eyes and lips are…",
      options: [
        { label: "Narrow or thin", scores: { D: 2 } },
        { label: "Moderate and natural-looking", scores: { N: 1, C: 1 } },
        { label: "Balanced and refined", scores: { C: 2 } },
        { label: "Mixed — e.g. large eyes, small nose", scores: { G: 2 } },
        { label: "Large, round or full", scores: { R: 2 } },
      ],
    },
    {
      q: "Which outfit do people compliment most?",
      options: [
        { label: "Sleek, sharp and minimal", scores: { D: 2 } },
        { label: "Relaxed, casual and textured", scores: { N: 2 } },
        { label: "Polished and tailored", scores: { C: 2 } },
        { label: "Playful, cropped or color-blocked", scores: { G: 2 } },
        { label: "Soft, flowing and feminine", scores: { R: 2 } },
      ],
    },
    {
      q: "Which word do strangers use about your look?",
      options: [
        { label: "Striking", scores: { D: 2 } },
        { label: "Approachable", scores: { N: 2 } },
        { label: "Elegant", scores: { C: 2 } },
        { label: "Cute or spunky", scores: { G: 2 } },
        { label: "Alluring or soft", scores: { R: 2 } },
      ],
    },
  ],
  resolve: (totals) => {
    const order = ranked(families, totals);
    const type = pickKibbe(order[0], order[1], totals[order[0]] - totals[order[1]]);
    const info = kibbeInfo[type];
    const sum = families.reduce((s, k) => s + totals[k], 0) || 1;
    const name: Record<KibbeFamily, string> = { D: "Dramatic", N: "Natural", C: "Classic", G: "Gamine", R: "Romantic" };
    return {
      eyebrow: `Your Kibbe body type · ${info.family} family`,
      title: info.label,
      summary: `${info.essence} ${info.body}`,
      metrics: order.map((k) => ({
        label: name[k],
        value: `${Math.round((totals[k] / sum) * 100)}%`,
        score: Math.round((totals[k] / sum) * 100),
      })),
      sections: [
        { title: "What to wear", items: info.wear },
        { title: "What to avoid", items: [info.avoid] },
        {
          title: "Good to know",
          items: [
            "Kibbe types describe your overall line and essence, not your weight or size.",
            "Ask a friend to answer with you — we often misjudge our own proportions.",
          ],
        },
      ],
      links: [
        { href: "/kibbe-body-types", label: "Read about all 13 Kibbe types" },
        { href: "/body-shape-calculator-female", label: "Body shape calculator" },
      ],
    };
  },
};
