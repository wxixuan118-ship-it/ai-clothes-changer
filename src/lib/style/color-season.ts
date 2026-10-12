// 12-season color analysis. The quiz scores three axes — temperature
// (warm +), value (light +) and chroma (bright +) — and the dominant axis
// plus its partner pick one of the twelve seasons.

import type { Swatch } from "@/lib/face/analysis-result";

import { type QuizDef } from "./quiz";

export type Season =
  | "light-spring"
  | "true-spring"
  | "bright-spring"
  | "light-summer"
  | "true-summer"
  | "soft-summer"
  | "soft-autumn"
  | "true-autumn"
  | "deep-autumn"
  | "deep-winter"
  | "true-winter"
  | "bright-winter";

type Axis = "temp" | "value" | "chroma";

export const seasonInfo: Record<
  Season,
  { label: string; family: string; description: string; palette: Swatch[]; avoid: string; neutrals: string; metals: string }
> = {
  "light-spring": {
    label: "Light Spring",
    family: "Spring",
    description: "Light and warm. Your coloring is delicate and golden — fresh, clear pastels with a warm base look best.",
    palette: [
      { name: "Peach", hex: "#F7B39A" },
      { name: "Light coral", hex: "#F48E7C" },
      { name: "Buttercup", hex: "#F7DC7C" },
      { name: "Mint", hex: "#A6DCC0" },
      { name: "Aqua", hex: "#7FCDD0" },
      { name: "Periwinkle", hex: "#9DAEE3" },
      { name: "Warm pink", hex: "#F29CB2" },
      { name: "Ivory", hex: "#FBF3DF" },
    ],
    avoid: "Black, charcoal and heavy dark colors overpower you.",
    neutrals: "Ivory, camel, light warm gray, soft navy",
    metals: "Light gold, rose gold",
  },
  "true-spring": {
    label: "True (Warm) Spring",
    family: "Spring",
    description: "Warm and bright. Golden, sunny coloring that glows in clear, warm colors.",
    palette: [
      { name: "Coral", hex: "#F2735A" },
      { name: "Poppy red", hex: "#E5402F" },
      { name: "Golden yellow", hex: "#F5C02E" },
      { name: "Kelly green", hex: "#3BA55C" },
      { name: "Turquoise", hex: "#2AB3B1" },
      { name: "Warm aqua", hex: "#5FC9C0" },
      { name: "Apricot", hex: "#F7A060" },
      { name: "Cream", hex: "#F8ECD1" },
    ],
    avoid: "Cool grays, icy pastels and blue-black.",
    neutrals: "Camel, warm beige, golden brown, cream",
    metals: "Yellow gold, brass",
  },
  "bright-spring": {
    label: "Bright Spring",
    family: "Spring",
    description: "Bright and warm-leaning. High contrast, clear coloring that needs vivid, saturated colors.",
    palette: [
      { name: "Hot coral", hex: "#FF5A4E" },
      { name: "Bright red", hex: "#E3242B" },
      { name: "Lemon", hex: "#FBE34A" },
      { name: "Emerald", hex: "#00A36C" },
      { name: "Bright turquoise", hex: "#00B5C0" },
      { name: "Hot pink", hex: "#F0418C" },
      { name: "Cobalt", hex: "#2558C9" },
      { name: "Clear white", hex: "#FCFCF7" },
    ],
    avoid: "Dusty, muted colors like sage, mauve and taupe make you look tired.",
    neutrals: "Navy, warm gray, chocolate, clear white",
    metals: "Shiny gold, polished silver",
  },
  "light-summer": {
    label: "Light Summer",
    family: "Summer",
    description: "Light and cool. Soft, airy coloring flattered by cool pastels and gentle contrast.",
    palette: [
      { name: "Powder blue", hex: "#AFC8E7" },
      { name: "Lavender", hex: "#C3B1E1" },
      { name: "Rose pink", hex: "#F0A6BC" },
      { name: "Soft mint", hex: "#B5E0CF" },
      { name: "Periwinkle", hex: "#A3AEE0" },
      { name: "Lilac", hex: "#D3B5D9" },
      { name: "Light teal", hex: "#86C3C4" },
      { name: "Soft white", hex: "#F6F5F2" },
    ],
    avoid: "Black, orange and heavy earth tones.",
    neutrals: "Soft white, light gray, rose beige, gray-navy",
    metals: "Silver, white gold, platinum",
  },
  "true-summer": {
    label: "True (Cool) Summer",
    family: "Summer",
    description: "Cool and soft. Rosy, blue-based coloring that looks best in cool, medium, slightly muted shades.",
    palette: [
      { name: "Raspberry", hex: "#C2456E" },
      { name: "Soft fuchsia", hex: "#D0609B" },
      { name: "Blue-gray", hex: "#6F86A6" },
      { name: "Cornflower", hex: "#6F8FD6" },
      { name: "Spruce", hex: "#3E7C74" },
      { name: "Plum", hex: "#7A4E7E" },
      { name: "Watermelon", hex: "#E26E83" },
      { name: "Soft white", hex: "#F3F2EE" },
    ],
    avoid: "Orange, gold, rust and warm browns.",
    neutrals: "Gray-navy, rose-brown, blue-gray, soft white",
    metals: "Silver, pewter, white gold",
  },
  "soft-summer": {
    label: "Soft Summer",
    family: "Summer",
    description: "Soft and cool-leaning. Low-contrast, gentle coloring that shines in dusty, blended colors.",
    palette: [
      { name: "Dusty rose", hex: "#C48C95" },
      { name: "Sage", hex: "#9DAF9A" },
      { name: "Slate blue", hex: "#6C7E99" },
      { name: "Mauve", hex: "#A27A93" },
      { name: "Soft teal", hex: "#5F8F8C" },
      { name: "Taupe", hex: "#9A8A82" },
      { name: "Lavender gray", hex: "#A69FB8" },
      { name: "Oyster", hex: "#E8E2D9" },
    ],
    avoid: "Bright, saturated colors and stark black-and-white.",
    neutrals: "Taupe, charcoal-blue, mushroom, oyster",
    metals: "Brushed silver, pewter, rose gold",
  },
  "soft-autumn": {
    label: "Soft Autumn",
    family: "Autumn",
    description: "Soft and warm-leaning. Gentle, golden coloring that blends beautifully with muted earth tones.",
    palette: [
      { name: "Sage", hex: "#A3AE8A" },
      { name: "Salmon", hex: "#E39A82" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Soft teal", hex: "#5E9590" },
      { name: "Olive", hex: "#8B8B5A" },
      { name: "Terracotta", hex: "#C07A5E" },
      { name: "Mushroom", hex: "#A99787" },
      { name: "Cream", hex: "#F2E8D5" },
    ],
    avoid: "Icy colors, neon brights and stark black.",
    neutrals: "Mushroom, camel, soft brown, cream",
    metals: "Brushed gold, bronze, rose gold",
  },
  "true-autumn": {
    label: "True (Warm) Autumn",
    family: "Autumn",
    description: "Warm and rich. Golden, earthy coloring made for spice tones and deep warm greens.",
    palette: [
      { name: "Rust", hex: "#B5502E" },
      { name: "Mustard", hex: "#C9A227" },
      { name: "Olive", hex: "#6B7A3A" },
      { name: "Pumpkin", hex: "#D6702B" },
      { name: "Teal", hex: "#1F7A7A" },
      { name: "Tomato red", hex: "#C8372D" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Chocolate", hex: "#5C3A21" },
    ],
    avoid: "Icy pastels, fuchsia and cool grays.",
    neutrals: "Chocolate, camel, olive, warm cream",
    metals: "Gold, copper, bronze",
  },
  "deep-autumn": {
    label: "Deep Autumn",
    family: "Autumn",
    description: "Deep and warm. Rich, intense coloring that holds dark, warm colors with ease.",
    palette: [
      { name: "Burgundy", hex: "#6E2232" },
      { name: "Forest green", hex: "#2F5E3F" },
      { name: "Burnt orange", hex: "#B5501F" },
      { name: "Deep teal", hex: "#1C5F5F" },
      { name: "Aubergine", hex: "#4E2C4E" },
      { name: "Bronze", hex: "#A0673A" },
      { name: "Brick", hex: "#9C3B2A" },
      { name: "Espresso", hex: "#3B2416" },
    ],
    avoid: "Pastels and light, cool colors wash you out.",
    neutrals: "Espresso, dark olive, charcoal brown, warm off-white",
    metals: "Antique gold, bronze, copper",
  },
  "deep-winter": {
    label: "Deep Winter",
    family: "Winter",
    description: "Deep and cool-leaning. Dark, striking coloring that looks best in deep jewel tones.",
    palette: [
      { name: "Black cherry", hex: "#5C0E25" },
      { name: "Emerald", hex: "#0B6B4F" },
      { name: "Sapphire", hex: "#163C8C" },
      { name: "Deep plum", hex: "#4A1840" },
      { name: "True red", hex: "#B5152B" },
      { name: "Pine", hex: "#1C4A3A" },
      { name: "Magenta", hex: "#A8125E" },
      { name: "Black", hex: "#141414" },
    ],
    avoid: "Light pastels, beige and golden earth tones.",
    neutrals: "Black, charcoal, navy, pure white",
    metals: "Silver, platinum, gunmetal",
  },
  "true-winter": {
    label: "True (Cool) Winter",
    family: "Winter",
    description: "Cool and bright. Clear, high-contrast coloring made for icy and jewel-toned blue-based colors.",
    palette: [
      { name: "Royal blue", hex: "#2448B0" },
      { name: "Fuchsia", hex: "#C2186E" },
      { name: "Emerald", hex: "#0E8A5F" },
      { name: "Blue-red", hex: "#B8203A" },
      { name: "Icy pink", hex: "#F2C7D8" },
      { name: "Icy blue", hex: "#CFE3F5" },
      { name: "Purple", hex: "#5C2D91" },
      { name: "Pure white", hex: "#FFFFFF" },
    ],
    avoid: "Orange, camel, mustard and warm browns.",
    neutrals: "Black, navy, charcoal, pure white",
    metals: "Silver, platinum, white gold",
  },
  "bright-winter": {
    label: "Bright Winter",
    family: "Winter",
    description: "Bright and cool-leaning. Vivid, high-contrast coloring that needs saturated, clear colors.",
    palette: [
      { name: "Electric blue", hex: "#1F5FE0" },
      { name: "Hot pink", hex: "#E0297A" },
      { name: "Lemon", hex: "#F5E642" },
      { name: "Emerald", hex: "#00956A" },
      { name: "True red", hex: "#D11A2A" },
      { name: "Violet", hex: "#7B2FBF" },
      { name: "Turquoise", hex: "#00A8B5" },
      { name: "Pure white", hex: "#FFFFFF" },
    ],
    avoid: "Dusty, muted, earthy colors dull your contrast.",
    neutrals: "Black, charcoal, navy, pure white",
    metals: "Polished silver, platinum",
  },
};

export function pickSeason(t: number, v: number, c: number): Season {
  const axes: [Axis, number][] = [
    ["temp", t],
    ["value", v],
    ["chroma", c],
  ];
  const [dominant] = axes.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  const warm = t >= 0;
  if (dominant === "value") {
    if (v > 0) return warm ? "light-spring" : "light-summer";
    return warm ? "deep-autumn" : "deep-winter";
  }
  if (dominant === "chroma") {
    if (c > 0) return warm ? "bright-spring" : "bright-winter";
    return warm ? "soft-autumn" : "soft-summer";
  }
  if (warm) return v + c >= 0 ? "true-spring" : "true-autumn";
  return v - c >= 0 ? "true-summer" : "true-winter";
}

export const colorSeasonQuiz: QuizDef<Axis> = {
  keys: ["temp", "value", "chroma"],
  questions: [
    {
      q: "Look at the veins on the inside of your wrist in daylight. What color are they?",
      options: [
        { label: "Green or olive", scores: { temp: 2 } },
        { label: "Blue or purple", scores: { temp: -2 } },
        { label: "A mix — hard to tell", scores: {} },
      ],
    },
    {
      q: "Which jewelry looks better against your skin?",
      options: [
        { label: "Gold", scores: { temp: 2 } },
        { label: "Silver", scores: { temp: -2 } },
        { label: "Both look good", scores: {} },
      ],
    },
    {
      q: "How does your skin react to the sun?",
      options: [
        { label: "Burns easily, rarely tans", scores: { value: 2, temp: -1 } },
        { label: "Burns first, then tans", scores: { value: 1 } },
        { label: "Tans easily to golden brown", scores: { temp: 1, value: -1 } },
        { label: "Rarely burns, deepens quickly", scores: { value: -2 } },
      ],
    },
    {
      q: "What is your natural hair color (or was it, before graying)?",
      options: [
        { label: "Platinum or light ash blonde", scores: { value: 2, temp: -1 } },
        { label: "Golden or strawberry blonde", scores: { value: 2, temp: 1 } },
        { label: "Ash or mousy brown", scores: { temp: -1, chroma: -1 } },
        { label: "Golden, auburn or red", scores: { temp: 2 } },
        { label: "Dark brown", scores: { value: -1 } },
        { label: "Black or blue-black", scores: { value: -2, temp: -1 } },
      ],
    },
    {
      q: "What color are your eyes?",
      options: [
        { label: "Icy or bright blue / green", scores: { chroma: 2, temp: -1 } },
        { label: "Soft blue-gray or gray-green", scores: { chroma: -2, temp: -1 } },
        { label: "Hazel or soft green", scores: { chroma: -1, temp: 1 } },
        { label: "Warm brown or amber", scores: { temp: 1, value: -1 } },
        { label: "Very dark brown or black", scores: { value: -2, chroma: 1 } },
      ],
    },
    {
      q: "How much contrast is there between your hair, skin and eyes?",
      options: [
        { label: "High — e.g. dark hair, light skin, bright eyes", scores: { chroma: 2 } },
        { label: "Medium", scores: {} },
        { label: "Low — everything blends together", scores: { chroma: -2 } },
      ],
    },
    {
      q: "How do you look in very bright, saturated colors (hot pink, cobalt)?",
      options: [
        { label: "Great — they light me up", scores: { chroma: 2 } },
        { label: "Fine in small doses", scores: {} },
        { label: "They wear me — I prefer softer colors", scores: { chroma: -2 } },
      ],
    },
    {
      q: "Which looks better next to your face?",
      options: [
        { label: "Pure bright white", scores: { temp: -1, chroma: 1 } },
        { label: "Cream or ivory", scores: { temp: 1, chroma: -1 } },
      ],
    },
    {
      q: "Which dark color flatters you more?",
      options: [
        { label: "Black", scores: { value: -1, chroma: 1 } },
        { label: "Chocolate brown", scores: { temp: 1, value: -1 } },
        { label: "Navy or charcoal", scores: { temp: -1 } },
        { label: "Dark colors feel heavy on me", scores: { value: 2 } },
      ],
    },
    {
      q: "When you blush, what color do your cheeks turn?",
      options: [
        { label: "Rosy pink", scores: { temp: -1 } },
        { label: "Peachy or coral", scores: { temp: 1 } },
        { label: "I rarely visibly blush", scores: { value: -1 } },
      ],
    },
  ],
  resolve: (totals) => {
    const season = pickSeason(totals.temp, totals.value, totals.chroma);
    const info = seasonInfo[season];
    const axis = (v: number, pos: string, neg: string) =>
      v > 1 ? pos : v < -1 ? neg : "Balanced";
    const pct = (v: number) => Math.round(50 + Math.max(-1, Math.min(1, v / 8)) * 50);
    return {
      eyebrow: `Your color season · ${info.family}`,
      title: info.label,
      summary: info.description,
      tags: [
        axis(totals.temp, "Warm", "Cool"),
        axis(totals.value, "Light", "Deep"),
        axis(totals.chroma, "Bright", "Soft"),
      ],
      metrics: [
        { label: "Temperature", value: axis(totals.temp, "Warm", "Cool"), score: pct(totals.temp), hint: "Bar: cool ← → warm" },
        { label: "Value", value: axis(totals.value, "Light", "Deep"), score: pct(totals.value), hint: "Bar: deep ← → light" },
        { label: "Chroma", value: axis(totals.chroma, "Bright", "Soft"), score: pct(totals.chroma), hint: "Bar: soft ← → bright" },
      ],
      swatches: [{ title: `${info.label} palette`, items: info.palette }],
      sections: [
        { title: "Best neutrals", items: [info.neutrals] },
        { title: "Metals", items: [info.metals] },
        { title: "Go easy on", items: [info.avoid] },
      ],
      links: [
        { href: "/skin-tone-analyzer", label: "Check your undertone from a photo" },
        { href: "/lipstick-shade-finder", label: "Find your lipstick shades" },
      ],
    };
  },
};

export const seasons = Object.keys(seasonInfo) as Season[];
