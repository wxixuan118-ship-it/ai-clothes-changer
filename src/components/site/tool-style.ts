import {
  ActivityIcon,
  BookOpenIcon,
  BrushIcon,
  CalculatorIcon,
  CircleDotIcon,
  ClipboardListIcon,
  DropletIcon,
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  FlipHorizontal2Icon,
  GaugeIcon,
  PaletteIcon,
  PanelTopIcon,
  PipetteIcon,
  RulerIcon,
  Rows3Icon,
  ScanFaceIcon,
  ScissorsIcon,
  ShirtIcon,
  SigmaIcon,
  SmileIcon,
  StarIcon,
  SwatchBookIcon,
  TrendingUpIcon,
  TriangleIcon,
  WandSparklesIcon,
} from "lucide-react";

import type { ToolCategory, ToolId } from "@/config/tools";
import { toolOrder, tools } from "@/config/tools";

// Icon tile colors per category: [tile background, icon color].
const categoryTint: Record<ToolCategory, [string, string]> = {
  ai: ["var(--brand-soft)", "var(--brand)"],
  "face-shape": ["var(--pop-mint)", "var(--pop-mint-bold)"],
  features: ["var(--pop-pink)", "var(--pop-pink-bold)"],
  proportions: ["var(--pop-sky)", "var(--pop-sky-bold)"],
  fun: ["var(--pop-yellow)", "var(--pop-yellow-bold)"],
  makeup: ["var(--pop-orange)", "var(--pop-orange-bold)"],
  color: ["var(--pop-yellow)", "var(--pop-yellow-bold)"],
  body: ["var(--pop-green)", "var(--pop-green-bold)"],
  privacy: ["var(--pop-sky)", "var(--pop-sky-bold)"],
};

// Existing tools keep their original colors.
const tintOverride: Partial<Record<ToolId, [string, string]>> = {
  clothes: ["var(--pop-pink)", "var(--pop-pink-bold)"],
  "hairstyle-face-shape": ["var(--pop-orange)", "var(--pop-orange-bold)"],
  foundation: ["var(--pop-yellow)", "var(--pop-yellow-bold)"],
  "body-shape": ["var(--pop-sky)", "var(--pop-sky-bold)"],
};

export const toolTint = Object.fromEntries(
  toolOrder.map((id) => [
    id,
    tintOverride[id] ?? categoryTint[tools[id].category],
  ]),
) as Record<ToolId, [string, string]>;

export const toolIcon: Record<ToolId, typeof ScissorsIcon> = {
  hair: ScissorsIcon,
  clothes: ShirtIcon,
  "face-shape": ScanFaceIcon,
  "hairstyle-face-shape": WandSparklesIcon,
  foundation: DropletIcon,
  "body-shape": RulerIcon,
  "body-shape-men": RulerIcon,
  "face-analyzer": ScanFaceIcon,
  "face-shape-calculator": CalculatorIcon,
  "face-shape-quiz": ClipboardListIcon,
  "forehead-shape": PanelTopIcon,
  "jawline-shape": TriangleIcon,
  "eye-shape": EyeIcon,
  "eyebrow-shape": BrushIcon,
  "nose-shape": FingerprintIcon,
  "lip-shape": SmileIcon,
  "face-symmetry": FlipHorizontal2Icon,
  "eye-distance": RulerIcon,
  "golden-ratio": SigmaIcon,
  "canthal-tilt": TrendingUpIcon,
  "facial-proportions": Rows3Icon,
  attractiveness: GaugeIcon,
  "face-rating": StarIcon,
  "skin-tone": PaletteIcon,
  "color-analysis": SwatchBookIcon,
  concealer: PipetteIcon,
  lipstick: BrushIcon,
  blush: CircleDotIcon,
  eyeshadow: EyeIcon,
  "body-type": ActivityIcon,
  "kibbe-test": ClipboardListIcon,
  "kibbe-types": BookOpenIcon,
  "blur-face": EyeOffIcon,
};
