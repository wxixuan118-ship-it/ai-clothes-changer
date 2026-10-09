// Hair colors for the hairstyle changer, picked separately from the cut.
// `prompt` is what the model is told ("dyed <prompt>"); "ai" adds no color
// instruction beyond suiting the person, "keep" preserves the current one.
// `swatch` is CSS (a color or gradient) for the picker circle.

export type HairColor = {
  id: string;
  name: string;
  swatch: string;
  /** null = let the model choose a flattering, natural color. */
  prompt: string | null;
  hot?: boolean;
};

export const DEFAULT_HAIR_COLOR = "ai";

export const hairColors: HairColor[] = [
  {
    id: "ai",
    name: "AI recommended",
    swatch: "conic-gradient(#f87171,#facc15,#4ade80,#60a5fa,#c084fc,#f87171)",
    prompt: null,
  },
  {
    id: "keep",
    name: "No change",
    swatch: "#8a8a8a",
    prompt: "Keep the person's current hair color exactly as it is.",
  },
  {
    id: "jet-black",
    name: "Jet black",
    swatch: "#0b0b0c",
    prompt: "jet black",
  },
  {
    id: "dark-brown",
    name: "Dark brown",
    swatch: "#3b2417",
    prompt: "dark brown",
  },
  {
    id: "medium-brown",
    name: "Medium brown",
    swatch: "#6b4429",
    prompt: "medium brown",
  },
  {
    id: "light-brown",
    name: "Light brown",
    swatch: "#9a6a42",
    prompt: "light brown",
  },
  {
    id: "chestnut",
    name: "Chestnut",
    swatch: "#7b3b22",
    prompt: "rich chestnut brown",
  },
  {
    id: "auburn",
    name: "Auburn",
    swatch: "#8f3a1e",
    prompt: "auburn",
  },
  {
    id: "copper",
    name: "Copper",
    swatch: "#c2602b",
    prompt: "copper",
  },
  {
    id: "honey-blonde",
    name: "Honey blonde",
    swatch: "#d5a35a",
    prompt: "honey blonde",
  },
  {
    id: "blonde",
    name: "Blonde",
    swatch: "#e9c46a",
    prompt: "golden blonde",
    hot: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    swatch: "#e8e2d0",
    prompt: "platinum blonde",
  },
  {
    id: "silver",
    name: "Silver grey",
    swatch: "#b9bcc2",
    prompt: "silver grey",
  },
  {
    id: "cherry-red",
    name: "Cherry red",
    swatch: "#b3132f",
    prompt: "vivid cherry red",
  },
  {
    id: "pastel-pink",
    name: "Pastel pink",
    swatch: "#f5a9c9",
    prompt: "pastel pink",
    hot: true,
  },
  {
    id: "lavender",
    name: "Lavender",
    swatch: "#b9a3e3",
    prompt: "pastel lavender",
  },
  {
    id: "blue-highlights",
    name: "Blue highlights",
    swatch: "#2f5fd0",
    prompt: "the person's base color with bright blue highlights",
    hot: true,
  },
  {
    id: "balayage",
    name: "Balayage",
    swatch: "linear-gradient(180deg,#5a3a22,#d9b07a)",
    prompt: "a soft brown-to-honey balayage",
  },
];

export function getHairColor(id: string): HairColor | undefined {
  return hairColors.find((color) => color.id === id);
}

/** The color sentence appended to a hair instruction. */
export function hairColorInstruction(color: HairColor): string {
  if (color.id === "ai") {
    return "Choose a natural, flattering hair color that suits the person and the new style.";
  }
  if (color.id === "keep") return color.prompt ?? "";
  return `Hair color: ${color.prompt}.`;
}
