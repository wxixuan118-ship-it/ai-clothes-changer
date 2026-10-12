// Color-based tools: skin tone, concealer, lipstick, blush and eyeshadow.
// They reuse the foundation finder's skin sampler and Lab conversions, then
// map depth × undertone (and eye color for shadow) to curated palettes.

import type { NormalizedLandmark } from "./mediapipe";
import type { AnalysisResult, Swatch } from "./analysis-result";
import { detectFaceShape } from "./face-shape";
import {
  calculateITA,
  classifySkinTone,
  classifyUndertone,
  extractSkinColor,
  rgbToHex,
  rgbToLab,
  skinToneLabels,
  undertoneLabels,
  type SkinToneLevel,
  type Undertone,
} from "./foundation-shade";

type RawLandmark = NormalizedLandmark;
type Lab = { l: number; a: number; b: number };
type Rgb = { r: number; g: number; b: number };

// ---------------------------------------------------------------- color math

export function labToRgb({ l, a, b }: Lab): Rgb {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const x = inv(fx) * 0.95047;
  const y = inv(fy);
  const z = inv(fz) * 1.08883;
  const lin = [
    x * 3.2404542 - y * 1.5371385 - z * 0.4985314,
    -x * 0.969266 + y * 1.8760108 + z * 0.041556,
    x * 0.0556434 - y * 0.2040259 + z * 1.0572252,
  ];
  const [r, g, bl] = lin.map((c) => {
    const v = c > 0.0031308 ? 1.055 * c ** (1 / 2.4) - 0.055 : 12.92 * c;
    return Math.round(Math.min(1, Math.max(0, v)) * 255);
  });
  return { r, g, b: bl };
}

export function labHex(lab: Lab): string {
  const { r, g, b } = labToRgb(lab);
  return rgbToHex(r, g, b).toUpperCase();
}

function median(values: number[]): number {
  const s = [...values].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)] ?? 0;
}

/** Median color of small patches around pixel-space points. */
export function samplePatches(
  imageData: ImageData,
  points: { x: number; y: number }[],
  radius = 2,
  keep: (c: Rgb) => boolean = () => true,
): Rgb | null {
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const { width, height, data } = imageData;
  for (const pt of points) {
    const cx = Math.round(pt.x);
    const cy = Math.round(pt.y);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) continue;
        const i = (y * width + x) * 4;
        const c = { r: data[i], g: data[i + 1], b: data[i + 2] };
        if (!keep(c)) continue;
        rs.push(c.r);
        gs.push(c.g);
        bs.push(c.b);
      }
    }
  }
  if (!rs.length) return null;
  return { r: median(rs), g: median(gs), b: median(bs) };
}

const toPx = (lms: RawLandmark[], w: number, h: number) => (i: number) => ({
  x: lms[i].x * w,
  y: lms[i].y * h,
});

// ---------------------------------------------------------------- skin

export type Depth = "light" | "medium" | "deep";
export type Temp = "warm" | "cool" | "neutral";

export function depthOf(tone: SkinToneLevel): Depth {
  if (tone === "fair" || tone === "light") return "light";
  if (tone === "light-medium" || tone === "medium") return "medium";
  return "deep";
}

export function tempOf(undertone: Undertone): Temp {
  if (undertone === "olive") return "neutral";
  return undertone;
}

export type SkinReading = {
  rgb: Rgb;
  lab: Lab;
  hex: string;
  ita: number;
  tone: SkinToneLevel;
  undertone: Undertone;
  depth: Depth;
  temp: Temp;
};

export function readSkin(
  imageData: ImageData,
  landmarks: RawLandmark[],
  width: number,
  height: number,
): SkinReading {
  const rgb = extractSkinColor(imageData, landmarks, width, height);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  const ita = calculateITA(lab.l, lab.b);
  const tone = classifySkinTone(ita);
  const undertone = classifyUndertone(lab);
  return {
    rgb,
    lab,
    hex: rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase(),
    ita,
    tone,
    undertone,
    depth: depthOf(tone),
    temp: tempOf(undertone),
  };
}

// Monk Skin Tone scale reference swatches (Google, CC BY 4.0).
const monk = ["#F6EDE4", "#F3E7DB", "#F7EAD0", "#EADABA", "#D7BD96", "#A07E56", "#825C43", "#604134", "#3A312A", "#292420"];

export function nearestMonk(lab: Lab): number {
  let best = 0;
  let bestD = Infinity;
  monk.forEach((hex, i) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const m = rgbToLab(r, g, b);
    const d = Math.hypot(m.l - lab.l, (m.a - lab.a) * 0.5, (m.b - lab.b) * 0.5);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best + 1;
}

const fitzpatrick = (ita: number) =>
  ita > 55 ? "I" : ita > 41 ? "II" : ita > 28 ? "III" : ita > 10 ? "IV" : ita > -30 ? "V" : "VI";

const bestColors: Record<Undertone, Swatch[]> = {
  warm: [
    { name: "Olive", hex: "#6B7A3A" },
    { name: "Mustard", hex: "#C9A227" },
    { name: "Coral", hex: "#F07F5E" },
    { name: "Rust", hex: "#B5502E" },
    { name: "Camel", hex: "#C19A6B" },
    { name: "Tomato red", hex: "#C8372D" },
    { name: "Teal", hex: "#1F7A7A" },
    { name: "Cream", hex: "#F3E5C8" },
  ],
  cool: [
    { name: "Navy", hex: "#1F2F5C" },
    { name: "Emerald", hex: "#1E7A55" },
    { name: "Fuchsia", hex: "#C2366E" },
    { name: "Royal blue", hex: "#2D4FA0" },
    { name: "Lavender", hex: "#B9A3D6" },
    { name: "Burgundy", hex: "#7A1F3A" },
    { name: "Icy pink", hex: "#F2C7D8" },
    { name: "Pure white", hex: "#FFFFFF" },
  ],
  neutral: [
    { name: "Jade", hex: "#3E9E7E" },
    { name: "Dusty pink", hex: "#D99AA2" },
    { name: "Soft white", hex: "#F4F1EA" },
    { name: "Teal", hex: "#2A7F80" },
    { name: "Plum", hex: "#6E3C5E" },
    { name: "Medium blue", hex: "#3B6EB5" },
    { name: "Taupe", hex: "#9E8B78" },
    { name: "True red", hex: "#C0262E" },
  ],
  olive: [
    { name: "Forest green", hex: "#2F5E3F" },
    { name: "Gold", hex: "#C9A24A" },
    { name: "Burgundy", hex: "#6E2232" },
    { name: "Teal", hex: "#1F7A7A" },
    { name: "Terracotta", hex: "#B5603F" },
    { name: "Eggplant", hex: "#4E2C4E" },
    { name: "Warm white", hex: "#F6EFE0" },
    { name: "Bronze", hex: "#A0673A" },
  ],
};

const avoidColors: Record<Undertone, string> = {
  warm: "Icy pastels, blue-gray and stark blue-black can wash warm skin out.",
  cool: "Orange, mustard and camel worn right next to the face can look sallow.",
  neutral: "Very neon shades can overpower — otherwise you have a wide range.",
  olive: "Pale yellow, pastel orange and beige that matches your skin too closely.",
};

const metals: Record<Undertone, string> = {
  warm: "Gold, brass and copper jewelry",
  cool: "Silver, platinum and white gold jewelry",
  neutral: "Both gold and silver — mix metals freely",
  olive: "Gold and rose gold jewelry",
};

export function analyzeSkinTone(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult {
  const s = readSkin(imageData, landmarks, width, height);
  const level = nearestMonk(s.lab);
  return {
    eyebrow: "Your skin tone",
    title: `${skinToneLabels[s.tone]} · ${undertoneLabels[s.undertone]} undertone`,
    summary: `Your sampled skin color is ${s.hex}, closest to Monk scale tone ${level} of 10, with a ${undertoneLabels[s.undertone].toLowerCase()} undertone.`,
    tags: [`Monk tone ${level}`, `Fitzpatrick type ${fitzpatrick(s.ita)} (estimate)`, metals[s.undertone]],
    metrics: [
      { label: "Skin color", value: s.hex, hint: "Median of forehead, cheek and chin samples." },
      { label: "Lightness (L*)", value: s.lab.l.toFixed(0), hint: "0 = black, 100 = white." },
      { label: "Undertone", value: undertoneLabels[s.undertone], hint: `Red a* ${s.lab.a.toFixed(1)}, yellow b* ${s.lab.b.toFixed(1)}.` },
      { label: "ITA°", value: s.ita.toFixed(0), hint: "Individual Typology Angle used in dermatology." },
    ],
    swatches: [
      { title: "Your skin", items: [{ name: "Sampled tone", hex: s.hex }, { name: `Monk ${level}`, hex: monk[level - 1] }] },
      { title: "Colors that flatter you", items: bestColors[s.undertone] },
    ],
    sections: [
      { title: "Colors to go easy on", items: [avoidColors[s.undertone]] },
      {
        title: "Double-check your undertone",
        items: [
          "Veins: greenish suggests warm, blue or purple suggests cool, a mix suggests neutral.",
          "Daylight matters — warm indoor bulbs push results warmer.",
        ],
      },
    ],
    links: [
      { href: "/color-analysis-quiz", label: "Find your color season" },
      { href: "/foundation-shade-finder", label: "Match your foundation" },
    ],
  };
}

// ---------------------------------------------------------------- concealer

const underEyeR = [230, 229, 228, 231];
const underEyeL = [450, 449, 448, 451];
const midCheek = [205, 425, 50, 280];

export function analyzeConcealer(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult {
  const s = readSkin(imageData, landmarks, width, height);
  const px = toPx(landmarks, width, height);
  const under = samplePatches(imageData, [...underEyeR, ...underEyeL].map(px), 2);
  const cheek = samplePatches(imageData, midCheek.map(px), 3);
  const underLab = under ? rgbToLab(under.r, under.g, under.b) : s.lab;
  const cheekLab = cheek ? rgbToLab(cheek.r, cheek.g, cheek.b) : s.lab;
  const darkness = cheekLab.l - underLab.l;
  const blueShift = cheekLab.b - underLab.b;
  const redShift = underLab.a - cheekLab.a;

  const brighten = labHex({ ...s.lab, l: Math.min(96, s.lab.l + 5), b: s.lab.b + (s.temp === "cool" ? 0 : 1.5) });
  const match = s.hex;
  const deep = s.depth === "deep";
  const corrector: Swatch =
    darkness < 4
      ? { name: "No corrector needed", hex: s.hex, note: "Your under-eyes are close to your cheek tone." }
      : blueShift > 2
        ? deep
          ? { name: "Orange / red corrector", hex: "#D9653B", note: "Cancels blue-purple shadows on deep skin." }
          : s.depth === "medium"
            ? { name: "Peach / apricot corrector", hex: "#F0A27A", note: "Cancels blue-purple shadows." }
            : { name: "Light peach corrector", hex: "#F6C2A2", note: "Cancels blue-purple shadows on light skin." }
        : redShift > 3
          ? { name: "Yellow corrector", hex: "#F2D98A", note: "Neutralizes redness and pink tones." }
          : deep
            ? { name: "Deep orange corrector", hex: "#C9572F", note: "Brightens brown pigmentation." }
            : { name: "Bisque / salmon corrector", hex: "#EDB08F", note: "Brightens brown pigmentation." };

  const circle =
    darkness < 4
      ? "Minimal"
      : darkness < 9
        ? "Mild"
        : darkness < 15
          ? "Moderate"
          : "Pronounced";
  return {
    eyebrow: "Your concealer shades",
    title: `${skinToneLabels[s.tone]} ${undertoneLabels[s.undertone].toLowerCase()} concealer`,
    summary: `For under-eyes, pick a concealer about one shade lighter than your foundation with a ${undertoneLabels[s.undertone].toLowerCase()} undertone. For blemishes, match your skin exactly.`,
    tags: [`${circle} under-eye darkness`],
    metrics: [
      { label: "Under-eye vs cheek", value: `${darkness >= 0 ? "-" : "+"}${Math.abs(darkness).toFixed(1)} L*`, hint: "How much darker your under-eye area is than your cheeks." },
      { label: "Shadow tint", value: blueShift > 2 ? "Blue / purple" : redShift > 3 ? "Red / pink" : "Brown", hint: "Decides the color corrector." },
      { label: "Skin depth", value: skinToneLabels[s.tone] },
      { label: "Undertone", value: undertoneLabels[s.undertone] },
    ],
    swatches: [
      {
        title: "Your concealer shades",
        items: [
          { name: "Under-eye brightener", hex: brighten, note: "~1 shade lighter" },
          { name: "Spot concealer", hex: match, note: "Exact skin match" },
          corrector,
        ],
      },
    ],
    sections: [
      {
        title: "How to apply",
        items: [
          "Color-correct first (thin layer, only where dark), then concealer on top.",
          "Under the eyes: a small inverted triangle, tapped in with a damp sponge.",
          "On blemishes: dab the matching shade with a small brush, don't rub.",
          "Set lightly with powder to stop creasing.",
        ],
      },
    ],
    links: [{ href: "/foundation-shade-finder", label: "Find your foundation shade" }],
  };
}

// ---------------------------------------------------------------- lips

// Mid-points between outer and inner lip contours (upper then lower).
const lipBody: [number, number][] = [
  [0, 13],
  [37, 82],
  [267, 312],
  [39, 81],
  [269, 311],
  [17, 14],
  [84, 87],
  [314, 317],
  [181, 178],
  [405, 402],
];

export function readLipColor(
  imageData: ImageData,
  landmarks: RawLandmark[],
  width: number,
  height: number,
): string | null {
  const px = toPx(landmarks, width, height);
  const pts = lipBody.map(([a, b]) => {
    const p = px(a);
    const q = px(b);
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  });
  const c = samplePatches(imageData, pts, 1);
  return c ? rgbToHex(c.r, c.g, c.b).toUpperCase() : null;
}

type Palette = Record<`${Depth}-${Temp}`, Swatch[]>;

const lipsticks: Palette = {
  "light-warm": [
    { name: "Peachy nude", hex: "#D8957A" },
    { name: "Coral", hex: "#E8705A" },
    { name: "Warm pink", hex: "#D9727F" },
    { name: "Orange-red", hex: "#D2392B" },
    { name: "Terracotta", hex: "#B5523B" },
  ],
  "light-cool": [
    { name: "Rosy nude", hex: "#C98C8C" },
    { name: "Baby pink", hex: "#E89BB0" },
    { name: "Blue-red", hex: "#B8203A" },
    { name: "Berry", hex: "#8E2C4C" },
    { name: "Mauve", hex: "#A86A84" },
  ],
  "light-neutral": [
    { name: "Pink nude", hex: "#CF8E87" },
    { name: "Dusty rose", hex: "#C27A80" },
    { name: "Classic red", hex: "#C2262E" },
    { name: "Raspberry", hex: "#B03A5B" },
    { name: "Soft coral", hex: "#E0806C" },
  ],
  "medium-warm": [
    { name: "Caramel nude", hex: "#B9775A" },
    { name: "Brick", hex: "#A8432F" },
    { name: "Warm red", hex: "#C0302A" },
    { name: "Burnt orange", hex: "#C8562B" },
    { name: "Cinnamon", hex: "#9C4E3A" },
  ],
  "medium-cool": [
    { name: "Mauve nude", hex: "#A86B6E" },
    { name: "Fuchsia", hex: "#C2366E" },
    { name: "Cherry", hex: "#A61C35" },
    { name: "Plum", hex: "#6E2846" },
    { name: "Raspberry", hex: "#A83158" },
  ],
  "medium-neutral": [
    { name: "Rosewood", hex: "#A65E5E" },
    { name: "True red", hex: "#B5232B" },
    { name: "Berry", hex: "#8C2D47" },
    { name: "Coral rose", hex: "#C9665A" },
    { name: "Brown nude", hex: "#9E6553" },
  ],
  "deep-warm": [
    { name: "Toffee nude", hex: "#8A5038" },
    { name: "Orange-red", hex: "#C2391F" },
    { name: "Brick", hex: "#8F3122" },
    { name: "Bronze", hex: "#A0612E" },
    { name: "Burgundy", hex: "#6B1F24" },
  ],
  "deep-cool": [
    { name: "Mahogany", hex: "#6E2E2E" },
    { name: "Deep berry", hex: "#6B1B3D" },
    { name: "Blue-red", hex: "#9E1530" },
    { name: "Fuchsia", hex: "#B02A66" },
    { name: "Plum", hex: "#4F1F3A" },
  ],
  "deep-neutral": [
    { name: "Chocolate nude", hex: "#6B3A2C" },
    { name: "Wine", hex: "#6E1E2E" },
    { name: "True red", hex: "#A8222A" },
    { name: "Raspberry", hex: "#9C2C55" },
    { name: "Rosewood", hex: "#8A4846" },
  ],
};

const blushes: Palette = {
  "light-warm": [
    { name: "Peach", hex: "#F4A988" },
    { name: "Apricot", hex: "#F0997A" },
    { name: "Coral", hex: "#EE8A74" },
    { name: "Warm pink", hex: "#E89A9A" },
  ],
  "light-cool": [
    { name: "Baby pink", hex: "#F2A7B8" },
    { name: "Rose", hex: "#E38FA0" },
    { name: "Soft mauve", hex: "#D49AAE" },
    { name: "Cool berry", hex: "#C9768E" },
  ],
  "light-neutral": [
    { name: "Soft pink", hex: "#EDA3A8" },
    { name: "Peach-pink", hex: "#F0A592" },
    { name: "Dusty rose", hex: "#D99596" },
    { name: "Rose petal", hex: "#E48E9E" },
  ],
  "medium-warm": [
    { name: "Coral", hex: "#E0785C" },
    { name: "Apricot", hex: "#D98A5F" },
    { name: "Terracotta", hex: "#C46A4E" },
    { name: "Bronze peach", hex: "#C98258" },
  ],
  "medium-cool": [
    { name: "Rose", hex: "#CF6C86" },
    { name: "Berry", hex: "#B85274" },
    { name: "Mauve", hex: "#B8728A" },
    { name: "Raspberry", hex: "#C2496C" },
  ],
  "medium-neutral": [
    { name: "Rosy coral", hex: "#D9786E" },
    { name: "Dusty rose", hex: "#C47A7A" },
    { name: "Warm berry", hex: "#B55B6A" },
    { name: "Brick rose", hex: "#B66558" },
  ],
  "deep-warm": [
    { name: "Brick", hex: "#A84B32" },
    { name: "Burnt orange", hex: "#C25A2E" },
    { name: "Terracotta", hex: "#A85638" },
    { name: "Bronze", hex: "#9A5A30" },
  ],
  "deep-cool": [
    { name: "Plum", hex: "#8A3255" },
    { name: "Deep berry", hex: "#9C2F59" },
    { name: "Fuchsia", hex: "#B5326E" },
    { name: "Wine", hex: "#7A2840" },
  ],
  "deep-neutral": [
    { name: "Raisin", hex: "#8A3F45" },
    { name: "Cranberry", hex: "#9E2F3F" },
    { name: "Brick rose", hex: "#A24B48" },
    { name: "Deep rose", hex: "#A6455E" },
  ],
};

export function lipstickPalette(depth: Depth, temp: Temp): Swatch[] {
  return lipsticks[`${depth}-${temp}`];
}

export function blushPalette(depth: Depth, temp: Temp): Swatch[] {
  return blushes[`${depth}-${temp}`];
}

export function analyzeLipstick(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult {
  const s = readSkin(imageData, landmarks, width, height);
  const lip = readLipColor(imageData, landmarks, width, height);
  const palette = lipstickPalette(s.depth, s.temp);
  const mlbb = lip
    ? (() => {
        const r = parseInt(lip.slice(1, 3), 16);
        const g = parseInt(lip.slice(3, 5), 16);
        const b = parseInt(lip.slice(5, 7), 16);
        const lab = rgbToLab(r, g, b);
        return labHex({ l: lab.l - 6, a: lab.a + 4, b: lab.b });
      })()
    : palette[0].hex;
  return {
    eyebrow: "Your lipstick shades",
    title: `${palette[0].name} to ${palette[2].name.toLowerCase()}`,
    summary: `Picked for ${skinToneLabels[s.tone].toLowerCase()} skin with a ${undertoneLabels[s.undertone].toLowerCase()} undertone. Start with your 'my lips but better' shade for every day, and a statement shade for nights out.`,
    tags: [skinToneLabels[s.tone], `${undertoneLabels[s.undertone]} undertone`],
    metrics: [
      { label: "Natural lip color", value: lip ?? "—", hint: "Median color sampled from your lips." },
      { label: "Skin color", value: s.hex },
    ],
    swatches: [
      {
        title: "Everyday",
        items: [
          ...(lip ? [{ name: "Your lips", hex: lip }] : []),
          { name: "My lips but better", hex: mlbb, note: "One shade deeper than your lips" },
        ],
      },
      { title: "Shades that flatter you", items: palette },
    ],
    sections: [
      {
        title: "Lipstick tips",
        items: [
          s.temp === "cool"
            ? "Blue-based reds and berries make teeth look whiter on cool undertones."
            : s.temp === "warm"
              ? "Orange-based reds and corals glow on warm undertones."
              : "True reds (balanced blue and orange) work on neutral undertones.",
          "Nude lipstick should be slightly deeper than your skin, never lighter, to avoid a washed-out look.",
          "Swatch on your fingertips — their color is closer to your lips than the back of your hand.",
        ],
      },
    ],
    links: [
      { href: "/lip-shape-analyzer", label: "Analyze your lip shape" },
      { href: "/blush-shade-finder", label: "Find a matching blush" },
    ],
  };
}

const blushPlacement: Record<string, string> = {
  oval: "Apply on the apples of the cheeks and blend toward the temples.",
  round: "Apply slightly above the apples and sweep diagonally toward the ears to add length.",
  square: "Keep blush on the apples in a soft circle to round out angles.",
  heart: "Apply just below the cheekbones, blending outward — keep it away from the temples.",
  diamond: "Apply on the apples and blend inward toward the center of the face.",
  oblong: "Sweep horizontally across the cheeks, toward the nose, to shorten the face.",
  triangle: "Apply high on the cheekbones and blend up toward the temples.",
};

export function analyzeBlush(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult {
  const s = readSkin(imageData, landmarks, width, height);
  const palette = blushPalette(s.depth, s.temp);
  const shape = detectFaceShape(landmarks);
  return {
    eyebrow: "Your blush shades",
    title: `${palette[0].name} & ${palette[1].name.toLowerCase()}`,
    summary: `Blush colors chosen for ${skinToneLabels[s.tone].toLowerCase()} skin with a ${undertoneLabels[s.undertone].toLowerCase()} undertone, plus placement for your ${shape.shapeLabel.toLowerCase()} face.`,
    tags: [skinToneLabels[s.tone], `${undertoneLabels[s.undertone]} undertone`, `${shape.shapeLabel} face`],
    metrics: [
      { label: "Skin color", value: s.hex },
      { label: "Face shape", value: shape.shapeLabel },
    ],
    swatches: [{ title: "Blush that flatters you", items: palette }],
    sections: [
      { title: `Where to apply on a ${shape.shapeLabel.toLowerCase()} face`, items: [blushPlacement[shape.shape] ?? blushPlacement.oval] },
      {
        title: "Formula tips",
        items: [
          s.depth === "deep"
            ? "Choose richly pigmented formulas — sheer blush can look ashy on deep skin."
            : "Build sheer layers — it's easier to add than take away.",
          "Cream blush melts into skin and suits dry skin; powder lasts longer on oily skin.",
          "Smile to find the apples, then blend upward so the color lifts the face.",
        ],
      },
    ],
    links: [
      { href: "/lipstick-shade-finder", label: "Find matching lipstick" },
      { href: "/face-shape-detector", label: "Face shape detector" },
    ],
  };
}

// ---------------------------------------------------------------- eyes

export type EyeColor = "dark-brown" | "brown" | "amber" | "hazel" | "green" | "blue" | "gray";

export const eyeColorLabels: Record<EyeColor, string> = {
  "dark-brown": "Dark brown",
  brown: "Brown",
  amber: "Amber",
  hazel: "Hazel",
  green: "Green",
  blue: "Blue",
  gray: "Gray",
};

export function classifyEyeColor(lab: Lab): EyeColor {
  const chroma = Math.hypot(lab.a, lab.b);
  const hue = ((Math.atan2(lab.b, lab.a) * 180) / Math.PI + 360) % 360;
  if (lab.b < -2 || (hue > 180 && hue < 300 && chroma > 4)) return "blue";
  if (chroma < 6) return lab.l > 45 ? "gray" : "dark-brown";
  if (hue >= 100 && hue <= 180) return hue > 120 ? "green" : "hazel";
  if (lab.l < 32) return "dark-brown";
  if (hue >= 70 && hue < 100) return lab.l > 45 ? "amber" : "hazel";
  return "brown";
}

export function readEyeColor(
  imageData: ImageData,
  landmarks: RawLandmark[],
  width: number,
  height: number,
): { color: EyeColor; hex: string } | null {
  if (landmarks.length < 478) return null;
  const px = toPx(landmarks, width, height);
  const points: { x: number; y: number }[] = [];
  for (const [center, ring] of [
    [468, 469],
    [473, 474],
  ] as const) {
    const c = px(center);
    const r = Math.hypot(px(ring).x - c.x, px(ring).y - c.y);
    for (let k = 0; k < 16; k++) {
      const t = (k / 16) * Math.PI * 2;
      // Lower half of the iris: least covered by lids and lashes.
      if (Math.sin(t) < -0.3) continue;
      for (const f of [0.55, 0.75]) {
        points.push({ x: c.x + Math.cos(t) * r * f, y: c.y + Math.sin(t) * r * f });
      }
    }
  }
  const c = samplePatches(imageData, points, 0, ({ r, g, b }) => {
    const sum = r + g + b;
    return sum > 45 && sum < 690;
  });
  if (!c) return null;
  const lab = rgbToLab(c.r, c.g, c.b);
  return { color: classifyEyeColor(lab), hex: rgbToHex(c.r, c.g, c.b).toUpperCase() };
}

const eyeshadows: Record<EyeColor, Swatch[]> = {
  "dark-brown": [
    { name: "Copper", hex: "#B0603A" },
    { name: "Deep purple", hex: "#4E2C5E" },
    { name: "Royal blue", hex: "#2D4A9C" },
    { name: "Olive gold", hex: "#8C7A3A" },
    { name: "Champagne", hex: "#E6CFA6" },
  ],
  brown: [
    { name: "Bronze", hex: "#A0673A" },
    { name: "Plum", hex: "#6E3C5E" },
    { name: "Navy", hex: "#2E3A6B" },
    { name: "Emerald", hex: "#2E6B4F" },
    { name: "Gold", hex: "#C9A24A" },
  ],
  amber: [
    { name: "Teal", hex: "#2F6E6E" },
    { name: "Purple", hex: "#6E4A7E" },
    { name: "Bronze", hex: "#A0673A" },
    { name: "Navy", hex: "#2E3A6B" },
    { name: "Gold", hex: "#C9A24A" },
  ],
  hazel: [
    { name: "Olive", hex: "#6B6B35" },
    { name: "Purple", hex: "#6E4A7E" },
    { name: "Gold", hex: "#C9A24A" },
    { name: "Copper", hex: "#B0603A" },
    { name: "Forest green", hex: "#2F5E3F" },
  ],
  green: [
    { name: "Plum", hex: "#6E3058" },
    { name: "Burgundy", hex: "#6E2232" },
    { name: "Copper", hex: "#B0603A" },
    { name: "Mauve", hex: "#A07088" },
    { name: "Bronze", hex: "#A0673A" },
  ],
  blue: [
    { name: "Copper", hex: "#B0603A" },
    { name: "Terracotta", hex: "#B5603F" },
    { name: "Peach", hex: "#E8A07E" },
    { name: "Bronze", hex: "#A0673A" },
    { name: "Champagne", hex: "#E6CFA6" },
  ],
  gray: [
    { name: "Charcoal", hex: "#3B3B42" },
    { name: "Silver", hex: "#B9BCC4" },
    { name: "Plum", hex: "#6E3C5E" },
    { name: "Deep blue", hex: "#2E3A6B" },
    { name: "Smoky purple", hex: "#5E4A6B" },
  ],
};

const shadowBases: Record<Temp, Swatch[]> = {
  warm: [
    { name: "Champagne base", hex: "#E8C9A4" },
    { name: "Warm taupe crease", hex: "#B98A64" },
    { name: "Chocolate liner", hex: "#6B4A33" },
  ],
  cool: [
    { name: "Pink-beige base", hex: "#E6D3D6" },
    { name: "Cool taupe crease", hex: "#A08A8E" },
    { name: "Charcoal liner", hex: "#4A3F45" },
  ],
  neutral: [
    { name: "Bone base", hex: "#E3CDB8" },
    { name: "Taupe crease", hex: "#A88C7A" },
    { name: "Espresso liner", hex: "#574238" },
  ],
};

export function eyeshadowPalette(color: EyeColor): Swatch[] {
  return eyeshadows[color];
}

export function analyzeEyeshadow(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult {
  const s = readSkin(imageData, landmarks, width, height);
  const eye = readEyeColor(imageData, landmarks, width, height) ?? { color: "brown" as EyeColor, hex: "#5A3A22" };
  return {
    eyebrow: "Your eyeshadow colors",
    title: `For ${eyeColorLabels[eye.color].toLowerCase()} eyes`,
    summary: `Shades that contrast with ${eyeColorLabels[eye.color].toLowerCase()} eyes make the iris color pop, while the neutral base is matched to your ${undertoneLabels[s.undertone].toLowerCase()} undertone.`,
    tags: [`${eyeColorLabels[eye.color]} eyes`, `${undertoneLabels[s.undertone]} undertone`],
    metrics: [
      { label: "Detected eye color", value: eyeColorLabels[eye.color], hint: `Sampled iris color ${eye.hex}. Lighting can shift this — correct it in your head if needed.` },
      { label: "Skin color", value: s.hex },
    ],
    swatches: [
      { title: "Your eyes", items: [{ name: "Iris sample", hex: eye.hex }] },
      { title: "Colors that make your eyes pop", items: eyeshadowPalette(eye.color) },
      { title: "Everyday neutral base", items: shadowBases[s.temp] },
    ],
    sections: [
      {
        title: "Eyeshadow tips",
        items: [
          "Base shade all over the lid, crease shade in the socket, a pop color on the outer third.",
          "Shimmer on the center of the lid catches light and makes eyes look bigger.",
          s.depth === "deep"
            ? "Use a colored base or primer so bright shades show true on deep skin."
            : "A primer stops shadow fading and creasing.",
        ],
      },
    ],
    links: [
      { href: "/eye-shape-detector", label: "Detect your eye shape" },
      { href: "/color-analysis-quiz", label: "Find your color season" },
    ],
  };
}
