// Curated outfit presets for the clothes changer. Each preset is a prompt
// template applied to the user's photo — no garment image needed. `cover`
// is an Unsplash photo id used on marketing surfaces.

export type StylePreset = {
  id: string;
  name: string;
  category: StyleCategory;
  prompt: string;
  tint: string;
  cover?: string;
};

export type StyleCategory =
  | "Professional"
  | "Wedding & formal"
  | "Casual & street"
  | "Party & evening"
  | "Seasonal";

export const styleCategories: StyleCategory[] = [
  "Professional",
  "Wedding & formal",
  "Casual & street",
  "Party & evening",
  "Seasonal",
];

export const stylePresets: StylePreset[] = [
  {
    id: "evening-glam",
    name: "Evening glam",
    category: "Party & evening",
    prompt: "an elegant emerald satin evening gown with a draped neckline",
    tint: "var(--pop-mint-bold)",
    cover: "1653152707179-125e4e184a0b",
  },
  {
    id: "street-layers",
    name: "Street layers",
    category: "Casual & street",
    prompt:
      "an oversized pastel blue trench coat over a white tee and wide trousers",
    tint: "var(--pop-sky-bold)",
    cover: "1539109136881-3be0616acf4b",
  },
  {
    id: "summer-floral",
    name: "Summer floral",
    category: "Seasonal",
    prompt: "a flowing floral midi sundress in soft cream and red tones",
    tint: "var(--pop-orange-bold)",
    cover: "1496747611176-843222e1e57c",
  },
  {
    id: "color-pop",
    name: "Color pop",
    category: "Casual & street",
    prompt: "a vivid teal lace crop top with high-waisted white jeans",
    tint: "var(--pop-yellow-bold)",
    cover: "1469334031218-e382a71b716b",
  },
  {
    id: "navy-suit",
    name: "Navy business suit",
    category: "Professional",
    prompt: "a tailored navy two-piece business suit with a crisp white shirt",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "linkedin-blazer",
    name: "LinkedIn blazer",
    category: "Professional",
    prompt: "a charcoal structured blazer over a fine black knit top",
    tint: "var(--pop-mint-bold)",
  },
  {
    id: "quiet-luxury",
    name: "Quiet luxury",
    category: "Professional",
    prompt:
      "a camel cashmere coat over a cream turtleneck, old-money minimal style",
    tint: "var(--pop-orange-bold)",
  },
  {
    id: "white-wedding",
    name: "A-line wedding dress",
    category: "Wedding & formal",
    prompt: "an ivory A-line wedding dress with delicate lace sleeves",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "black-tie",
    name: "Black tie tuxedo",
    category: "Wedding & formal",
    prompt: "a classic black tuxedo with satin lapels and a bow tie",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "denim-day",
    name: "Denim day",
    category: "Casual & street",
    prompt: "a light-wash denim jacket over a white tee with straight jeans",
    tint: "var(--pop-sky-bold)",
  },
  {
    id: "red-cocktail",
    name: "Red cocktail dress",
    category: "Party & evening",
    prompt: "a fitted red cocktail dress with a square neckline",
    tint: "var(--pop-pink-bold)",
  },
  {
    id: "winter-coat",
    name: "Winter wool coat",
    category: "Seasonal",
    prompt: "a long burgundy wool coat with a knit scarf",
    tint: "var(--pop-pink-bold)",
  },
];

export function getStylePreset(id: string): StylePreset | undefined {
  return stylePresets.find((preset) => preset.id === id);
}
