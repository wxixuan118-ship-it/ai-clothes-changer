// Generators use credits; analyzers and calculators run in the browser for free.
export type ToolId =
  | "hair"
  | "clothes"
  | "glasses"
  | "face-shape"
  | "hairstyle-face-shape"
  | "foundation"
  | "body-shape"
  | "body-shape-men"
  | "face-analyzer"
  | "face-shape-calculator"
  | "face-shape-quiz"
  | "forehead-shape"
  | "jawline-shape"
  | "eye-shape"
  | "eyebrow-shape"
  | "nose-shape"
  | "lip-shape"
  | "face-symmetry"
  | "eye-distance"
  | "golden-ratio"
  | "canthal-tilt"
  | "facial-proportions"
  | "attractiveness"
  | "face-rating"
  | "how-old"
  | "age-calculator"
  | "skin-tone"
  | "color-analysis"
  | "concealer"
  | "lipstick"
  | "blush"
  | "eyeshadow"
  | "body-type"
  | "kibbe-test"
  | "kibbe-types"
  | "blur-face";

export type ToolType =
  "generator" | "analyzer" | "calculator" | "quiz" | "guide";

// Free-tool groups, in menu order.
export type ToolCategory =
  | "ai"
  | "face-shape"
  | "features"
  | "proportions"
  | "fun"
  | "makeup"
  | "color"
  | "body"
  | "privacy";

export const categoryLabels: Record<ToolCategory, string> = {
  ai: "AI try-on",
  "face-shape": "Face shape",
  features: "Facial features",
  proportions: "Proportions & symmetry",
  fun: "Fun & insights",
  makeup: "Makeup shade finders",
  color: "Color & skin tone",
  body: "Body type",
  privacy: "Privacy & editing",
};

export const tools: Record<
  ToolId,
  {
    name: string;
    landing: string;
    studio?: string;
    action: string;
    type: ToolType;
    category: ToolCategory;
    icon: string;
    desc: string;
    /** Shown as a NEW badge in menus. */
    isNew?: boolean;
  }
> = {
  hair: {
    name: "AI Hairstyle Changer",
    landing: "/",
    studio: "/generate",
    action: "Change hairstyle",
    type: "generator",
    category: "ai",
    icon: "scissors",
    desc: "Try new haircuts & colors",
  },
  clothes: {
    name: "AI Clothes Changer",
    landing: "/ai-clothes-changer",
    studio: "/generate?tool=clothes",
    action: "Change outfit",
    type: "generator",
    category: "ai",
    icon: "shirt",
    desc: "Virtually try on outfits",
  },
  glasses: {
    name: "AI Glasses Try-On",
    landing: "/glasses-try-on",
    studio: "/generate?tool=glasses",
    action: "Try on glasses",
    type: "generator",
    category: "ai",
    icon: "glasses",
    desc: "See any frames on your own photo",
    isNew: true,
  },
  "face-shape": {
    name: "Face Shape Detector",
    landing: "/face-shape-detector",
    action: "Detect face shape",
    type: "analyzer",
    category: "face-shape",
    icon: "face",
    desc: "Find your face shape & best looks",
  },
  "hairstyle-face-shape": {
    name: "Hairstyles for Face Shape",
    landing: "/hairstyles-for-face-shape",
    action: "Find my hairstyles",
    type: "analyzer",
    category: "face-shape",
    icon: "scissors",
    desc: "Discover cuts that suit your face",
  },
  foundation: {
    name: "Foundation Shade Finder",
    landing: "/foundation-shade-finder",
    action: "Find foundation shade",
    type: "analyzer",
    category: "makeup",
    icon: "droplet",
    desc: "Match your perfect foundation",
  },
  "body-shape": {
    name: "Body Shape Calculator for Women",
    landing: "/body-shape-calculator-female",
    action: "Calculate body shape",
    type: "calculator",
    category: "body",
    icon: "ruler",
    desc: "Find your shape from measurements",
  },
  "body-shape-men": {
    name: "Body Shape Calculator for Men",
    landing: "/body-shape-calculator-men",
    action: "Calculate body shape",
    type: "calculator",
    category: "body",
    icon: "ruler",
    desc: "Find your shape from measurements",
  },
  "face-analyzer": {
    name: "Face Analyzer",
    landing: "/face-analyzer",
    action: "Analyze my face",
    type: "analyzer",
    category: "face-shape",
    icon: "scan",
    desc: "Every face reading in one scan",
    isNew: true,
  },
  "face-shape-calculator": {
    name: "Face Shape Calculator",
    landing: "/face-shape-calculator",
    action: "Calculate face shape",
    type: "calculator",
    category: "face-shape",
    icon: "calculator",
    desc: "Your shape from 4 measurements",
    isNew: true,
  },
  "face-shape-quiz": {
    name: "Face Shape Quiz",
    landing: "/face-shape-quiz",
    action: "Start the quiz",
    type: "quiz",
    category: "face-shape",
    icon: "clipboard",
    desc: "7 questions, no photo needed",
    isNew: true,
  },
  "forehead-shape": {
    name: "Forehead Shape Detector",
    landing: "/forehead-shape-detector",
    action: "Detect forehead shape",
    type: "analyzer",
    category: "face-shape",
    icon: "forehead",
    desc: "Forehead type & hairstyle tips",
    isNew: true,
  },
  "jawline-shape": {
    name: "Jawline Shape Detector",
    landing: "/jawline-shape-detector",
    action: "Detect jawline shape",
    type: "analyzer",
    category: "face-shape",
    icon: "jaw",
    desc: "Jawline type & styling tips",
    isNew: true,
  },
  "eye-shape": {
    name: "Eye Shape Detector",
    landing: "/eye-shape-detector",
    action: "Detect eye shape",
    type: "analyzer",
    category: "features",
    icon: "eye",
    desc: "Eye shape & eyeliner tips",
    isNew: true,
  },
  "eyebrow-shape": {
    name: "Eyebrow Shape Detector",
    landing: "/eyebrow-shape-detector",
    action: "Detect brow shape",
    type: "analyzer",
    category: "features",
    icon: "brow",
    desc: "Brow shape & grooming tips",
    isNew: true,
  },
  "nose-shape": {
    name: "Nose Shape Detector",
    landing: "/nose-shape-detector",
    action: "Detect nose shape",
    type: "analyzer",
    category: "features",
    icon: "nose",
    desc: "Your nose shape from 12 types",
    isNew: true,
  },
  "lip-shape": {
    name: "Lip Shape Analyzer",
    landing: "/lip-shape-analyzer",
    action: "Analyze lip shape",
    type: "analyzer",
    category: "features",
    icon: "lips",
    desc: "Lip shape & makeup tips",
    isNew: true,
  },
  "face-symmetry": {
    name: "Face Symmetry Test",
    landing: "/face-symmetry-test",
    action: "Test my symmetry",
    type: "analyzer",
    category: "proportions",
    icon: "symmetry",
    desc: "How symmetrical is your face?",
    isNew: true,
  },
  "eye-distance": {
    name: "Eye Distance Calculator",
    landing: "/eye-distance-calculator",
    action: "Measure eye spacing",
    type: "analyzer",
    category: "proportions",
    icon: "ruler",
    desc: "Close-set, wide-set or balanced",
    isNew: true,
  },
  "golden-ratio": {
    name: "Golden Ratio Face",
    landing: "/golden-ratio-face",
    action: "Check golden ratio",
    type: "analyzer",
    category: "proportions",
    icon: "ratio",
    desc: "Your face vs φ = 1.618",
    isNew: true,
  },
  "canthal-tilt": {
    name: "Canthal Tilt Calculator",
    landing: "/canthal-tilt-calculator",
    action: "Measure canthal tilt",
    type: "analyzer",
    category: "proportions",
    icon: "tilt",
    desc: "Positive, neutral or negative tilt",
    isNew: true,
  },
  "facial-proportions": {
    name: "Facial Proportions Calculator",
    landing: "/facial-proportions-calculator",
    action: "Measure proportions",
    type: "analyzer",
    category: "proportions",
    icon: "thirds",
    desc: "Facial thirds & midface ratio",
    isNew: true,
  },
  attractiveness: {
    name: "Attractiveness Test",
    landing: "/attractiveness-test",
    action: "Take the test",
    type: "analyzer",
    category: "fun",
    icon: "gauge",
    desc: "Your AI facial harmony score",
    isNew: true,
  },
  "face-rating": {
    name: "Face Rating Test",
    landing: "/face-rating-test",
    action: "Rate my face",
    type: "analyzer",
    category: "fun",
    icon: "star",
    desc: "5-part geometry breakdown",
    isNew: true,
  },
  "how-old": {
    name: "How Old Do I Look?",
    landing: "/how-old-do-i-look",
    action: "Guess my age",
    type: "analyzer",
    category: "fun",
    icon: "hourglass",
    desc: "AI guesses your age from a selfie",
    isNew: true,
  },
  "age-calculator": {
    name: "Age Calculator by Photo",
    landing: "/age-calculator-by-photo",
    action: "Estimate ages",
    type: "analyzer",
    category: "fun",
    icon: "users",
    desc: "Estimate ages, even in group photos",
    isNew: true,
  },
  "skin-tone": {
    name: "Skin Tone Analyzer",
    landing: "/skin-tone-analyzer",
    action: "Analyze skin tone",
    type: "analyzer",
    category: "color",
    icon: "palette",
    desc: "Skin tone, undertone & colors",
    isNew: true,
  },
  "color-analysis": {
    name: "Color Analysis Quiz",
    landing: "/color-analysis-quiz",
    action: "Find my season",
    type: "quiz",
    category: "color",
    icon: "swatch",
    desc: "Your seasonal color palette",
    isNew: true,
  },
  concealer: {
    name: "Concealer Shade Finder",
    landing: "/concealer-shade-finder",
    action: "Find concealer shade",
    type: "analyzer",
    category: "makeup",
    icon: "pipette",
    desc: "Concealer shade & corrector",
    isNew: true,
  },
  lipstick: {
    name: "Lipstick Shade Finder",
    landing: "/lipstick-shade-finder",
    action: "Find lipstick shades",
    type: "analyzer",
    category: "makeup",
    icon: "lipstick",
    desc: "Your most flattering lip colors",
    isNew: true,
  },
  blush: {
    name: "Blush Shade Finder",
    landing: "/blush-shade-finder",
    action: "Find blush shades",
    type: "analyzer",
    category: "makeup",
    icon: "blush",
    desc: "Blush colors & placement",
    isNew: true,
  },
  eyeshadow: {
    name: "Eyeshadow Shade Finder",
    landing: "/eyeshadow-shade-finder",
    action: "Find eyeshadow colors",
    type: "analyzer",
    category: "makeup",
    icon: "eye",
    desc: "Shades that make your eyes pop",
    isNew: true,
  },
  "body-type": {
    name: "Body Type Calculator",
    landing: "/body-type-calculator",
    action: "Calculate body type",
    type: "calculator",
    category: "body",
    icon: "activity",
    desc: "Ectomorph, mesomorph or endomorph",
    isNew: true,
  },
  "kibbe-test": {
    name: "Kibbe Body Type Test",
    landing: "/kibbe-body-type-test",
    action: "Take the Kibbe test",
    type: "quiz",
    category: "body",
    icon: "clipboard",
    desc: "Find your Kibbe type in 10 questions",
    isNew: true,
  },
  "kibbe-types": {
    name: "Kibbe Body Types",
    landing: "/kibbe-body-types",
    action: "Read the guide",
    type: "guide",
    category: "body",
    icon: "book",
    desc: "All 13 Kibbe types explained",
    isNew: true,
  },
  "blur-face": {
    name: "Blur Face",
    landing: "/blur-face",
    action: "Blur faces",
    type: "analyzer",
    category: "privacy",
    icon: "blur",
    desc: "Blur faces in a photo automatically",
    isNew: true,
  },
};

// Order for navigation — generators first, free tools after, grouped by
// category.
export const toolOrder: ToolId[] = [
  "hair",
  "clothes",
  "glasses",
  "face-shape",
  "hairstyle-face-shape",
  "face-analyzer",
  "face-shape-calculator",
  "face-shape-quiz",
  "forehead-shape",
  "jawline-shape",
  "eye-shape",
  "eyebrow-shape",
  "nose-shape",
  "lip-shape",
  "face-symmetry",
  "eye-distance",
  "golden-ratio",
  "canthal-tilt",
  "facial-proportions",
  "attractiveness",
  "face-rating",
  "how-old",
  "age-calculator",
  "foundation",
  "concealer",
  "lipstick",
  "blush",
  "eyeshadow",
  "skin-tone",
  "color-analysis",
  "body-shape",
  "body-shape-men",
  "body-type",
  "kibbe-test",
  "kibbe-types",
  "blur-face",
];

export function parseTool(value: string | null | undefined): ToolId {
  if (value === "clothes") return "clothes";
  if (value === "glasses") return "glasses";
  if (value === "face-shape") return "face-shape";
  if (value === "hairstyle-face-shape") return "hairstyle-face-shape";
  if (value === "foundation") return "foundation";
  if (value === "body-shape") return "body-shape";
  if (value === "body-shape-men") return "body-shape-men";
  return "hair";
}

export type GeneratorToolId = "hair" | "clothes" | "glasses";
export type AnalyzerToolId =
  "face-shape" | "hairstyle-face-shape" | "foundation";

export function isGenerator(tool: ToolId): tool is GeneratorToolId {
  return tools[tool].type === "generator";
}

export const freeCategories: ToolCategory[] = [
  "face-shape",
  "features",
  "proportions",
  "fun",
  "makeup",
  "color",
  "body",
  "privacy",
];

export function toolsInCategory(category: ToolCategory): ToolId[] {
  return toolOrder.filter((id) => tools[id].category === category);
}
