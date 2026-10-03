// Curated hairstyle presets for the AI hairstyle changer. Each preset is a
// prompt fragment applied to the user's photo — no reference image needed.
// `cover` is an Unsplash photo id used on marketing surfaces.

export type HairCategory =
  "Short" | "Medium" | "Long" | "Curly & braids" | "Bold color";

export type HairPreset = {
  id: string;
  name: string;
  category: HairCategory;
  prompt: string;
  tint: string;
  cover?: string;
};

export const hairCategories: HairCategory[] = [
  "Short",
  "Medium",
  "Long",
  "Curly & braids",
  "Bold color",
];

export const hairPresets: HairPreset[] = [
  {
    id: "copper-bob",
    name: "Copper bob",
    category: "Medium",
    prompt: "a chin-length copper bob with soft, polished ends",
    tint: "var(--pop-orange-bold)",
    cover: "1438761681033-6461ffad8d80",
  },
  {
    id: "long-curls",
    name: "Long curls",
    category: "Curly & braids",
    prompt: "long, voluminous, defined dark curls",
    tint: "var(--pop-pink-bold)",
    cover: "1569430548104-6ca1cda3ec41",
  },
  {
    id: "silver-quiff",
    name: "Silver quiff",
    category: "Short",
    prompt: "a short textured quiff with faded sides in silver-grey",
    tint: "var(--pop-mint-bold)",
    cover: "1660144689256-c9a4a4ac116c",
  },
  {
    id: "pastel-shag",
    name: "Pastel shag",
    category: "Bold color",
    prompt: "a layered shag cut with pastel blue and lilac tones",
    tint: "var(--pop-sky-bold)",
    cover: "1648213037568-2c9c6d267e25",
  },
  {
    id: "pixie-cut",
    name: "Pixie cut",
    category: "Short",
    prompt: "a cropped pixie cut with soft side-swept bangs",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "buzz-cut",
    name: "Buzz cut",
    category: "Short",
    prompt: "a clean, even buzz cut",
    tint: "var(--pop-mint-bold)",
  },
  {
    id: "classic-fade",
    name: "Classic fade",
    category: "Short",
    prompt: "a classic short taper fade, neatly combed on top",
    tint: "var(--pop-orange-bold)",
  },
  {
    id: "curtain-bangs",
    name: "Curtain bangs",
    category: "Medium",
    prompt: "shoulder-length hair with soft curtain bangs",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "wolf-cut",
    name: "Wolf cut",
    category: "Medium",
    prompt: "a choppy, textured wolf cut with feathered layers",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "long-layers",
    name: "Long layers",
    category: "Long",
    prompt: "long, glossy hair with face-framing layers",
    tint: "var(--pop-orange-bold)",
  },
  {
    id: "sleek-straight",
    name: "Sleek straight",
    category: "Long",
    prompt: "long, sleek, straight hair with a center part",
    tint: "var(--pop-mint-bold)",
  },
  {
    id: "beach-waves",
    name: "Beach waves",
    category: "Long",
    prompt: "long, loose beach waves with sun-kissed highlights",
    tint: "var(--pop-yellow-bold)",
  },
  {
    id: "box-braids",
    name: "Box braids",
    category: "Curly & braids",
    prompt: "long, neat box braids",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "afro",
    name: "Natural afro",
    category: "Curly & braids",
    prompt: "a full, rounded natural afro",
    tint: "var(--pop-orange-bold)",
  },
  {
    id: "platinum-blonde",
    name: "Platinum blonde",
    category: "Bold color",
    prompt: "the same haircut recolored platinum blonde",
    tint: "var(--pop-yellow-bold)",
  },
  {
    id: "cherry-red",
    name: "Cherry red",
    category: "Bold color",
    prompt: "the same haircut recolored a vivid cherry red",
    tint: "var(--pop-pink-bold)",
  },
];

export function getHairPreset(id: string): HairPreset | undefined {
  return hairPresets.find((preset) => preset.id === id);
}
