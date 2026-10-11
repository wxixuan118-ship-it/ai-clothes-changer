import {
  DropletIcon,
  RulerIcon,
  ScanFaceIcon,
  ScissorsIcon,
  ShirtIcon,
  WandSparklesIcon,
} from "lucide-react";

import type { ToolId } from "@/config/tools";

// Icon tile colors per tool: [tile background, icon color].
export const toolTint: Record<ToolId, [string, string]> = {
  hair: ["var(--brand-soft)", "var(--brand)"],
  clothes: ["var(--pop-pink)", "var(--pop-pink-bold)"],
  "face-shape": ["var(--pop-mint)", "var(--pop-mint-bold)"],
  "hairstyle-face-shape": ["var(--pop-orange)", "var(--pop-orange-bold)"],
  foundation: ["var(--pop-yellow)", "var(--pop-yellow-bold)"],
  "body-shape": ["var(--pop-sky)", "var(--pop-sky-bold)"],
  "body-shape-men": ["var(--pop-green)", "var(--pop-green-bold)"],
};

export const toolIcon: Record<ToolId, typeof ScissorsIcon> = {
  hair: ScissorsIcon,
  clothes: ShirtIcon,
  "face-shape": ScanFaceIcon,
  "hairstyle-face-shape": WandSparklesIcon,
  foundation: DropletIcon,
  "body-shape": RulerIcon,
  "body-shape-men": RulerIcon,
};

