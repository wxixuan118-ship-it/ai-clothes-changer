// Curated frames for the glasses try-on. Each preset is a prompt template
// applied to the user's photo; `tint` colors the frame swatch in the picker.

export type GlassesCategory = "Eyeglasses" | "Sunglasses" | "Statement";

export type GlassesPreset = {
  id: string;
  name: string;
  category: GlassesCategory;
  prompt: string;
  tint: string;
};

export const glassesCategories: GlassesCategory[] = [
  "Eyeglasses",
  "Sunglasses",
  "Statement",
];

export const glassesPresets: GlassesPreset[] = [
  {
    id: "classic-rectangle",
    name: "Classic rectangle",
    category: "Eyeglasses",
    prompt: "thin black rectangular acetate eyeglasses with clear lenses",
    tint: "#1E1B2E",
  },
  {
    id: "round-wire",
    name: "Round wire",
    category: "Eyeglasses",
    prompt: "thin gold round wire-frame eyeglasses with clear lenses",
    tint: "#C9A24A",
  },
  {
    id: "tortoise-cat-eye",
    name: "Tortoise cat-eye",
    category: "Eyeglasses",
    prompt: "tortoiseshell cat-eye acetate eyeglasses with clear lenses",
    tint: "#8A5A2B",
  },
  {
    id: "wayfarer",
    name: "Wayfarer",
    category: "Eyeglasses",
    prompt: "black wayfarer-style acetate eyeglasses with clear lenses",
    tint: "#2B2B2B",
  },
  {
    id: "browline",
    name: "Browline",
    category: "Eyeglasses",
    prompt:
      "browline eyeglasses with a black acetate top bar and silver metal lower rims, clear lenses",
    tint: "#5A5A66",
  },
  {
    id: "clear-frame",
    name: "Clear frame",
    category: "Eyeglasses",
    prompt:
      "transparent crystal-clear acetate square eyeglasses with clear lenses",
    tint: "#D8DEE6",
  },
  {
    id: "rimless",
    name: "Rimless",
    category: "Eyeglasses",
    prompt:
      "minimal rimless eyeglasses with thin silver temples and clear lenses",
    tint: "#B9BCC4",
  },
  {
    id: "oversized-square",
    name: "Oversized square",
    category: "Eyeglasses",
    prompt: "oversized square black acetate eyeglasses with clear lenses",
    tint: "#3B3B42",
  },
  {
    id: "geometric-titanium",
    name: "Geometric titanium",
    category: "Eyeglasses",
    prompt:
      "thin hexagonal titanium eyeglasses in matte silver with clear lenses",
    tint: "#9AA0A8",
  },
  {
    id: "aviator-sun",
    name: "Aviator",
    category: "Sunglasses",
    prompt: "classic gold aviator sunglasses with dark green tinted lenses",
    tint: "#4F6B4A",
  },
  {
    id: "wayfarer-sun",
    name: "Wayfarer shades",
    category: "Sunglasses",
    prompt: "black wayfarer sunglasses with dark gray tinted lenses",
    tint: "#1E1B2E",
  },
  {
    id: "round-retro-sun",
    name: "Round retro",
    category: "Sunglasses",
    prompt:
      "round retro sunglasses with thin gold frames and brown gradient lenses",
    tint: "#8A5A2B",
  },
  {
    id: "cat-eye-sun",
    name: "Cat-eye shades",
    category: "Sunglasses",
    prompt: "black cat-eye sunglasses with dark tinted lenses",
    tint: "#2B2B2B",
  },
  {
    id: "oversized-sun",
    name: "Oversized",
    category: "Sunglasses",
    prompt:
      "oversized square tortoiseshell sunglasses with brown gradient lenses",
    tint: "#6B4A33",
  },
  {
    id: "red-cat-eye",
    name: "Red cat-eye",
    category: "Statement",
    prompt: "bold glossy red cat-eye acetate eyeglasses with clear lenses",
    tint: "#C2262E",
  },
  {
    id: "pink-clear",
    name: "Pink clear",
    category: "Statement",
    prompt: "translucent pink round acetate eyeglasses with clear lenses",
    tint: "#F2A7B8",
  },
  {
    id: "two-tone",
    name: "Two-tone",
    category: "Statement",
    prompt:
      "two-tone eyeglasses with a navy acetate top and a crystal-clear bottom rim, clear lenses",
    tint: "#2E3A6B",
  },
  {
    id: "thick-black",
    name: "Thick black",
    category: "Statement",
    prompt: "thick chunky black acetate square eyeglasses with clear lenses",
    tint: "#141414",
  },
];

export function getGlassesPreset(id: string): GlassesPreset | undefined {
  return glassesPresets.find((preset) => preset.id === id);
}
