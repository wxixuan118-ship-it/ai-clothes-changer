// The two generators. "hair" is the primary product (home page, studio
// default); "clothes" lives at /ai-clothes-changer.
export type ToolId = "hair" | "clothes";

export const tools: Record<
  ToolId,
  { name: string; landing: string; studio: string; action: string }
> = {
  hair: {
    name: "AI Hairstyle Changer",
    landing: "/",
    studio: "/generate",
    action: "Change hairstyle",
  },
  clothes: {
    name: "AI Clothes Changer",
    landing: "/ai-clothes-changer",
    studio: "/generate?tool=clothes",
    action: "Change outfit",
  },
};

export function parseTool(value: string | null | undefined): ToolId {
  return value === "clothes" ? "clothes" : "hair";
}
