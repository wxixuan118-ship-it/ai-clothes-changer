// Generators use credits; analyzers and calculators run in the browser for free.
export type ToolId =
  | "hair"
  | "clothes"
  | "face-shape"
  | "hairstyle-face-shape"
  | "foundation"
  | "body-shape";

export type ToolType = "generator" | "analyzer" | "calculator";

export const tools: Record<
  ToolId,
  {
    name: string;
    landing: string;
    studio?: string;
    action: string;
    type: ToolType;
    icon: string;
    desc: string;
  }
> = {
  hair: {
    name: "AI Hairstyle Changer",
    landing: "/",
    studio: "/generate",
    action: "Change hairstyle",
    type: "generator",
    icon: "scissors",
    desc: "Try new haircuts & colors",
  },
  clothes: {
    name: "AI Clothes Changer",
    landing: "/ai-clothes-changer",
    studio: "/generate?tool=clothes",
    action: "Change outfit",
    type: "generator",
    icon: "shirt",
    desc: "Virtually try on outfits",
  },
  "face-shape": {
    name: "Face Shape Detector",
    landing: "/face-shape-detector",
    action: "Detect face shape",
    type: "analyzer",
    icon: "face",
    desc: "Find your face shape & best looks",
  },
  "hairstyle-face-shape": {
    name: "Hairstyles for Face Shape",
    landing: "/hairstyles-for-face-shape",
    action: "Find my hairstyles",
    type: "analyzer",
    icon: "scissors",
    desc: "Discover cuts that suit your face",
  },
  foundation: {
    name: "Foundation Shade Finder",
    landing: "/foundation-shade-finder",
    action: "Find foundation shade",
    type: "analyzer",
    icon: "droplet",
    desc: "Match your perfect foundation",
  },
  "body-shape": {
    name: "Body Shape Calculator",
    landing: "/body-shape-calculator-female",
    action: "Calculate body shape",
    type: "calculator",
    icon: "ruler",
    desc: "Find your shape from measurements",
  },
};

// Order for navigation — generators first, free tools after.
export const toolOrder: ToolId[] = [
  "hair",
  "clothes",
  "hairstyle-face-shape",
  "face-shape",
  "foundation",
  "body-shape",
];

export function parseTool(value: string | null | undefined): ToolId {
  if (value === "clothes") return "clothes";
  if (value === "face-shape") return "face-shape";
  if (value === "hairstyle-face-shape") return "hairstyle-face-shape";
  if (value === "foundation") return "foundation";
  if (value === "body-shape") return "body-shape";
  return "hair";
}

export type GeneratorToolId = "hair" | "clothes";
export type AnalyzerToolId =
  "face-shape" | "hairstyle-face-shape" | "foundation";

export function isGenerator(tool: ToolId): tool is GeneratorToolId {
  return tools[tool].type === "generator";
}
