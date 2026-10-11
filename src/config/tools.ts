// Four tools: two AI generators (hair, clothes) that cost credits, and two
// browser-side analyzers (face-shape, foundation) that are free and run
// entirely on the client with MediaPipe.
export type ToolId = "hair" | "clothes" | "face-shape" | "foundation";

export type ToolType = "generator" | "analyzer";

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
  foundation: {
    name: "Foundation Shade Finder",
    landing: "/foundation-shade-finder",
    action: "Find foundation shade",
    type: "analyzer",
    icon: "droplet",
    desc: "Match your perfect foundation",
  },
};

// Order for navigation — generators first, analyzers after.
export const toolOrder: ToolId[] = ["hair", "clothes", "face-shape", "foundation"];

export function parseTool(value: string | null | undefined): ToolId {
  if (value === "clothes") return "clothes";
  if (value === "face-shape") return "face-shape";
  if (value === "foundation") return "foundation";
  return "hair";
}

export type GeneratorToolId = "hair" | "clothes";
export type AnalyzerToolId = "face-shape" | "foundation";

export function isGenerator(tool: ToolId): tool is GeneratorToolId {
  return tools[tool].type === "generator";
}
