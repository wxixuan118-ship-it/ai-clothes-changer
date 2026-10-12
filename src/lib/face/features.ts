// Feature-level detectors (eyes, brows, nose, lips, forehead, jawline).
// Each one measures a few landmark ratios on the level face and maps them
// to the closest named type. Thresholds are styling heuristics, not
// clinical cut-offs, and the copy says so.

import type { NormalizedLandmark } from "./mediapipe";
import type { AnalysisResult } from "./analysis-result";
import { detectFaceShape } from "./face-shape";
import {
  angleAt,
  clamp,
  dist,
  levelFace,
  LM,
  riseDeg,
  yawWarning,
  type LevelFace,
  type Pt,
} from "./geometry";

type RawLandmark = NormalizedLandmark;
type TypeInfo = { label: string; description: string; tips: string[] };

const pct = (v: number) => `${Math.round(v * 100)}%`;
const deg = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}°`;

// ---------------------------------------------------------------- eyes

export type EyeShape =
  | "almond"
  | "round"
  | "upturned"
  | "downturned"
  | "hooded"
  | "monolid";

export const eyeShapeInfo: Record<EyeShape, TypeInfo> = {
  almond: {
    label: "Almond",
    description:
      "Wider than they are tall, with corners that taper to a soft point and a slight lift at the outer edge. The most versatile eye shape for makeup.",
    tips: [
      "Almost any liner works — try a classic thin wing",
      "Smoke a deeper shade into the outer V to elongate",
      "Tightline the upper waterline for definition without weight",
    ],
  },
  round: {
    label: "Round",
    description:
      "Eyes that look open and tall, with visible white above or below the iris. They read bright and youthful.",
    tips: [
      "Extend liner past the outer corner to lengthen the eye",
      "Keep the darkest shadow on the outer third, not the center",
      "Skip heavy liner all the way around — it emphasizes roundness",
    ],
  },
  upturned: {
    label: "Upturned",
    description:
      "The outer corners sit noticeably higher than the inner corners, giving a natural cat-eye lift.",
    tips: [
      "Line the outer third of the lower lash line to balance the lift",
      "Keep wings short and follow your natural angle",
      "A soft shimmer on the inner corner opens the eye",
    ],
  },
  downturned: {
    label: "Downturned",
    description:
      "The outer corners dip slightly below the inner corners, which can read gentle and soulful.",
    tips: [
      "Flick liner upward from the outer corner, not along the lash line",
      "Concentrate shadow up and out, above the crease",
      "Curl lashes and focus mascara on the outer lashes",
    ],
  },
  hooded: {
    label: "Hooded",
    description:
      "A fold of skin from the brow bone covers part of the lid, so less lid space shows when the eyes are open.",
    tips: [
      "Apply shadow above the natural crease with eyes open",
      "Use a 'bat-wing' liner shape that shows when eyes are open",
      "Choose waterproof formulas — hooded lids transfer easily",
    ],
  },
  monolid: {
    label: "Monolid",
    description:
      "A smooth lid with little or no visible crease. The lid space is a great canvas for gradient color.",
    tips: [
      "Build shadow in a gradient from the lash line upward",
      "Thicker liner shows best — check it with eyes open",
      "Tightlining and lash curling open the eye",
    ],
  },
};

function eyeMetrics(p: Pt[], side: "R" | "L") {
  const outer = p[side === "R" ? LM.eyeOuterR : LM.eyeOuterL];
  const inner = p[side === "R" ? LM.eyeInnerR : LM.eyeInnerL];
  const top = p[side === "R" ? LM.eyeTopR : LM.eyeTopL];
  const bottom = p[side === "R" ? LM.eyeBottomR : LM.eyeBottomL];
  // Lower edge of the brow, roughly above the pupil.
  const brow = p[side === "R" ? 52 : 282];
  const width = dist(outer, inner);
  return {
    width,
    openness: dist(top, bottom) / width,
    tilt: riseDeg(inner, outer),
    lidSpace: (top.y - brow.y) / width,
  };
}

export function measureEyes(face: LevelFace) {
  const r = eyeMetrics(face.p, "R");
  const l = eyeMetrics(face.p, "L");
  const width = (r.width + l.width) / 2;
  return {
    openness: (r.openness + l.openness) / 2,
    tilt: (r.tilt + l.tilt) / 2,
    tiltR: r.tilt,
    tiltL: l.tilt,
    lidSpace: (r.lidSpace + l.lidSpace) / 2,
    width,
    spacing: dist(face.p[LM.eyeInnerR], face.p[LM.eyeInnerL]) / width,
  };
}

export function classifyEyeShape(m: {
  openness: number;
  tilt: number;
  lidSpace: number;
}): EyeShape {
  if (m.openness >= 0.4) return "round";
  if (m.tilt >= 6) return "upturned";
  if (m.tilt <= -2) return "downturned";
  if (m.lidSpace < 0.36) return "hooded";
  if (m.openness < 0.24) return "monolid";
  return "almond";
}

export function analyzeEyeShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const m = measureEyes(face);
  const shape = classifyEyeShape(m);
  const info = eyeShapeInfo[shape];
  const tags = [
    m.spacing > 1.1 ? "Wide-set" : m.spacing < 0.9 ? "Close-set" : "Balanced spacing",
  ];
  if (m.lidSpace < 0.42 && shape !== "hooded") tags.push("Slightly hooded");
  return {
    eyebrow: "Your eye shape",
    title: info.label,
    summary: info.description,
    tags,
    metrics: [
      { label: "Openness", value: m.openness.toFixed(2), hint: "Eye height ÷ width. Round eyes read above 0.40." },
      { label: "Outer corner tilt", value: deg(m.tilt), hint: "Positive = upturned, negative = downturned." },
      { label: "Lid space", value: m.lidSpace.toFixed(2), hint: "Brow-to-lid gap ÷ eye width. Low values suggest hooding." },
      { label: "Eye spacing", value: m.spacing.toFixed(2), hint: "Gap between eyes ÷ eye width. About 1.0 is balanced." },
    ],
    sections: [{ title: "Eyeliner and shadow tips", items: info.tips }],
    warnings: yawWarning(face),
    links: [
      { href: "/eyeshadow-shade-finder", label: "Find your eyeshadow colors" },
      { href: "/canthal-tilt-calculator", label: "Measure your canthal tilt" },
    ],
  };
}

// ---------------------------------------------------------------- brows

export type BrowShape =
  | "straight"
  | "soft-arched"
  | "high-arched"
  | "rounded"
  | "upward"
  | "downward";

export const browShapeInfo: Record<BrowShape, TypeInfo> = {
  straight: {
    label: "Straight",
    description:
      "A flat, horizontal brow with little or no arch. It reads youthful and calm and can make a face look shorter.",
    tips: [
      "Suits long and oblong faces — it shortens the face visually",
      "Fill the tail slightly upward if you want more lift",
      "Brush hairs straight up and set with clear gel",
    ],
  },
  "soft-arched": {
    label: "Soft Arched",
    description:
      "A gentle, low arch that peaks about two-thirds along the brow. The most common and most adaptable shape.",
    tips: [
      "Works with almost every face shape",
      "Keep the peak above the outer edge of the iris",
      "Pencil hair-like strokes in the front, defined line at the tail",
    ],
  },
  "high-arched": {
    label: "High Arched",
    description:
      "A pronounced, angled arch that lifts the eye and adds drama. It balances round and square faces.",
    tips: [
      "Great for round faces — the angle adds structure",
      "Soften the peak slightly if it looks surprised",
      "Avoid over-plucking under the arch",
    ],
  },
  rounded: {
    label: "Rounded",
    description:
      "A curved brow that arcs smoothly with no sharp peak. It softens angular features.",
    tips: [
      "Flattering on square and diamond faces",
      "Keep the curve even on both sides",
      "Define the underside lightly to keep the arc clean",
    ],
  },
  upward: {
    label: "Upward",
    description:
      "The tail sits higher than the head of the brow, giving an energetic, lifted look.",
    tips: [
      "Lengthen the tail slightly outward to keep balance",
      "Fill the front so the brow doesn't look sparse",
      "Works well on heart and oval faces",
    ],
  },
  downward: {
    label: "Downward / Falling",
    description:
      "The tail drops below the head of the brow, which can make eyes look tired or soft.",
    tips: [
      "Remove a few stray hairs under the tail to lift it",
      "Draw the tail ending level with the brow head",
      "Brush the tail up and set with gel",
    ],
  },
};

// Upper contour points, head (inner) → tail (outer).
const browUpperR = [107, 66, 105, 63, 70];
const browLowerR = [55, 65, 52, 53, 46];
const browUpperL = [336, 296, 334, 293, 300];
const browLowerL = [285, 295, 282, 283, 276];

function browMetrics(p: Pt[], upper: number[], lower: number[]) {
  const pts = upper.map((i) => p[i]);
  const head = pts[0];
  const tail = pts[pts.length - 1];
  const length = dist(head, tail);
  // Height of each point above the head→tail chord.
  let best = 0;
  let bestIndex = 0;
  pts.forEach((q, i) => {
    const t = (q.x - head.x) / (tail.x - head.x || 1);
    const chordY = head.y + t * (tail.y - head.y);
    const h = chordY - q.y;
    if (h > best) {
      best = h;
      bestIndex = i;
    }
  });
  const thickness =
    upper.reduce((s, idx, i) => s + dist(p[idx], p[lower[i]]), 0) /
    upper.length;
  return {
    arch: best / length,
    peakAt: bestIndex / (pts.length - 1),
    peakAngle: angleAt(head, pts[bestIndex], tail),
    tailRise: (head.y - tail.y) / length,
    thickness: thickness / length,
  };
}

export function classifyBrowShape(m: {
  arch: number;
  peakAt: number;
  peakAngle: number;
  tailRise: number;
}): BrowShape {
  if (m.tailRise <= -0.12 && m.arch < 0.1) return "downward";
  if (m.tailRise >= 0.12 && m.arch < 0.08) return "upward";
  if (m.arch < 0.06) return "straight";
  if (m.arch >= 0.13) return m.peakAt >= 0.5 ? "high-arched" : "rounded";
  if (m.peakAt < 0.5 && m.peakAngle > 160) return "rounded";
  return "soft-arched";
}

const browForFace: Record<string, string> = {
  oval: "Lucky — most brow shapes suit an oval face. A soft arch keeps it balanced.",
  round: "A high, angled arch adds structure and lengthens a round face.",
  square: "A rounded or soft arch softens a strong jawline.",
  heart: "A soft, rounded arch balances a wider forehead.",
  diamond: "A curved brow with a soft peak softens prominent cheekbones.",
  oblong: "A straight or low-arched brow makes a long face look shorter.",
  triangle: "A longer, gently arched brow widens the upper face.",
};

export function analyzeEyebrowShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const r = browMetrics(face.p, browUpperR, browLowerR);
  const l = browMetrics(face.p, browUpperL, browLowerL);
  const m = {
    arch: (r.arch + l.arch) / 2,
    peakAt: (r.peakAt + l.peakAt) / 2,
    peakAngle: (r.peakAngle + l.peakAngle) / 2,
    tailRise: (r.tailRise + l.tailRise) / 2,
    thickness: (r.thickness + l.thickness) / 2,
  };
  const shape = classifyBrowShape(m);
  const info = browShapeInfo[shape];
  const faceShape = detectFaceShape(landmarks);
  const thickness =
    m.thickness > 0.2 ? "Thick" : m.thickness < 0.13 ? "Thin" : "Medium";
  const evenness = Math.abs(r.arch - l.arch) < 0.03 ? "Even pair" : "Uneven arches";
  return {
    eyebrow: "Your eyebrow shape",
    title: info.label,
    summary: info.description,
    tags: [`${thickness} brows`, evenness, `${faceShape.shapeLabel} face`],
    metrics: [
      { label: "Arch height", value: pct(m.arch), hint: "Peak height relative to brow length." },
      { label: "Peak position", value: pct(m.peakAt), hint: "How far along the brow the arch peaks (from the inner end)." },
      { label: "Tail direction", value: m.tailRise >= 0 ? `Up ${pct(m.tailRise)}` : `Down ${pct(-m.tailRise)}`, hint: "Tail height relative to the brow head." },
      { label: "Thickness", value: thickness, hint: "Average brow height relative to its length." },
    ],
    sections: [
      { title: "Grooming tips for your brows", items: info.tips },
      {
        title: `Best brow for a ${faceShape.shapeLabel.toLowerCase()} face`,
        items: [browForFace[faceShape.shape] ?? browForFace.oval],
      },
    ],
    warnings: yawWarning(face),
    links: [{ href: "/face-shape-detector", label: "Check your face shape" }],
  };
}

// ---------------------------------------------------------------- nose

export type NoseShape =
  | "straight"
  | "roman"
  | "hooked"
  | "snub"
  | "celestial"
  | "button"
  | "nubian"
  | "bulbous"
  | "fleshy"
  | "narrow"
  | "long"
  | "flat-wide";

export const noseShapeInfo: Record<NoseShape, TypeInfo> = {
  straight: {
    label: "Straight (Greek)",
    description:
      "A straight bridge with no visible bump or dip and a balanced width. Often called the Greek nose.",
    tips: ["Light contour down both sides keeps the line crisp", "Most glasses bridges fit well"],
  },
  roman: {
    label: "Roman (Aquiline)",
    description:
      "A bridge with a gentle outward curve or slight bump, giving a strong, distinguished profile.",
    tips: [
      "Matte bronzer just on the bump softens it on camera",
      "Fuller hairstyles with volume balance a strong profile",
    ],
  },
  hooked: {
    label: "Hooked (Hawk)",
    description:
      "A pronounced convex bridge with a tip that points slightly downward. Striking in profile.",
    tips: [
      "Highlight the tip lightly and keep the bridge matte",
      "Side parts and layered cuts flatter a bold profile",
    ],
  },
  snub: {
    label: "Snub",
    description:
      "A short, slightly upturned nose with a small, rounded tip and a soft bridge.",
    tips: ["A touch of highlight on the bridge adds length", "Suits almost any glasses frame"],
  },
  celestial: {
    label: "Celestial (Ski-slope)",
    description:
      "A bridge with a gentle dip in the middle and an upturned tip — the classic ski-slope profile.",
    tips: ["Keep contour soft — the curve is the feature", "Frames with a keyhole bridge sit nicely"],
  },
  button: {
    label: "Button",
    description:
      "A small, short nose with a rounded tip and narrow width that sits in proportion with soft features.",
    tips: ["Minimal contour needed", "Lighter frames keep the face from looking crowded"],
  },
  nubian: {
    label: "Nubian",
    description:
      "A longer bridge with a wider base and fuller nostrils, common across African descent.",
    tips: [
      "Use a contour shade only one to two shades deeper than your skin",
      "Glasses with adjustable nose pads fit better on a lower bridge",
    ],
  },
  bulbous: {
    label: "Bulbous",
    description:
      "A tip that is rounder and fuller than the bridge, giving the nose a soft, rounded end.",
    tips: ["A small dot of highlight on the very tip refines it", "Avoid heavy contour that looks muddy"],
  },
  fleshy: {
    label: "Fleshy",
    description:
      "A larger, full nose with soft tissue around the tip and nostrils. A strong central feature.",
    tips: ["Balance with defined brows and lips", "Wider frames keep proportions even"],
  },
  narrow: {
    label: "Narrow",
    description:
      "A slim nose with a thin bridge and narrow base that sits close between the eyes.",
    tips: ["Highlight down the center line adds dimension", "Thin-bridged frames fit well"],
  },
  long: {
    label: "Long",
    description:
      "A nose that runs longer than average relative to the middle of the face.",
    tips: [
      "A touch of contour under the tip visually shortens it",
      "Bangs and fuller cheek-length styles balance length",
    ],
  },
  "flat-wide": {
    label: "Flat / Wide",
    description:
      "A lower bridge with a wider base. It sits softly in profile and pairs with full cheeks.",
    tips: ["Low-bridge (Asian-fit) frames stop glasses sliding", "Soft contour along the sides narrows the look"],
  },
};

export function measureNose(face: LevelFace) {
  const p = face.p;
  const width = dist(p[LM.alarR], p[LM.alarL]);
  const intercanthal = dist(p[LM.eyeInnerR], p[LM.eyeInnerL]);
  const length = dist(p[LM.nasion], p[LM.subnasale]);
  const lowerFace = dist(p[LM.nasion], p[LM.chin]);
  // Dorsum profile from depth: bridge → tip. Points nearer the camera than
  // the straight line read as a hump, further away as a scoop.
  const bridge = p[LM.nasion];
  const tip = p[4];
  let hump = 0;
  for (const i of [6, 197, 195, 5]) {
    const q = p[i];
    const t = (q.y - bridge.y) / (tip.y - bridge.y || 1);
    const lineZ = bridge.z + t * (tip.z - bridge.z);
    const d = (lineZ - q.z) / length;
    if (Math.abs(d) > Math.abs(hump)) hump = d;
  }
  // Tip width vs alar base: a round tip spreads close to the alae.
  const tipWidth = dist(p[48], p[278]);
  return {
    widthRatio: width / intercanthal,
    lengthRatio: length / lowerFace,
    hump,
    tipRatio: tipWidth / width,
    projection: (bridge.z - tip.z) / length,
  };
}

export function classifyNoseShape(m: {
  widthRatio: number;
  lengthRatio: number;
  hump: number;
  tipRatio: number;
  projection: number;
}): NoseShape {
  const wide = m.widthRatio > 1.18;
  const narrow = m.widthRatio < 0.9;
  const long = m.lengthRatio > 0.47;
  const short = m.lengthRatio < 0.39;
  if (m.hump > 0.06) return "hooked";
  if (m.hump > 0.035) return "roman";
  if (m.hump < -0.025) return short ? "snub" : "celestial";
  if (wide && m.projection < 0.35) return "flat-wide";
  if (wide && long) return "nubian";
  if (wide && m.tipRatio > 0.82) return "bulbous";
  if (wide) return "fleshy";
  if (short && narrow) return "button";
  if (narrow) return "narrow";
  if (long) return "long";
  return "straight";
}

export function analyzeNoseShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const m = measureNose(face);
  const shape = classifyNoseShape(m);
  const info = noseShapeInfo[shape];
  return {
    eyebrow: "Your nose shape",
    title: info.label,
    summary: info.description,
    tags: [
      m.widthRatio > 1.18 ? "Wide base" : m.widthRatio < 0.9 ? "Narrow base" : "Balanced width",
      m.lengthRatio > 0.47 ? "Long" : m.lengthRatio < 0.39 ? "Short" : "Average length",
    ],
    metrics: [
      { label: "Width ratio", value: m.widthRatio.toFixed(2), hint: "Nose width ÷ gap between the eyes. Classic proportion is about 1.0." },
      { label: "Length ratio", value: m.lengthRatio.toFixed(2), hint: "Nose length ÷ bridge-to-chin distance." },
      { label: "Bridge profile", value: m.hump > 0.035 ? "Convex" : m.hump < -0.025 ? "Concave" : "Straight", hint: "Estimated from 3D depth along the bridge." },
      { label: "Tip fullness", value: pct(m.tipRatio), hint: "Tip width relative to nostril width." },
    ],
    sections: [
      { title: "Contour and glasses tips", items: info.tips },
      {
        title: "How to read this",
        items: [
          "Profile shapes (Roman, hooked, celestial) come from the depth estimate of a front photo, so a side photo check is worth doing.",
          "Every nose shape is normal. These labels are for makeup and eyewear choices only.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [{ href: "/face-analyzer", label: "Run the full face analysis" }],
  };
}

// ---------------------------------------------------------------- lips

export type LipShape =
  | "full"
  | "thin"
  | "heart"
  | "bow"
  | "wide"
  | "round"
  | "top-heavy"
  | "bottom-heavy"
  | "downturned";

export const lipShapeInfo: Record<LipShape, TypeInfo> = {
  full: {
    label: "Full",
    description: "Both lips are plump and balanced, with plenty of visible color.",
    tips: ["Satin and matte finishes keep full lips polished", "Any color depth works — try a bold red"],
  },
  thin: {
    label: "Thin",
    description: "Both lips are slim relative to mouth width, with a neat, defined line.",
    tips: [
      "Lighter, glossy shades add volume",
      "Line just on the outer edge of your natural line",
      "A dab of highlighter on the cupid's bow lifts the upper lip",
    ],
  },
  heart: {
    label: "Heart-shaped",
    description: "A defined cupid's bow over a fuller lower lip — the classic heart-shaped lip.",
    tips: ["Trace the bow precisely with liner", "Blotted stains show off the shape"],
  },
  bow: {
    label: "Bow-shaped (Cupid's bow)",
    description: "A pronounced cupid's bow with sharply peaked upper lip.",
    tips: ["Soften the peaks slightly with a rounded liner line if you prefer", "Gloss in the center flatters the bow"],
  },
  wide: {
    label: "Wide",
    description: "The mouth extends wider than average relative to the nose and eyes.",
    tips: ["Concentrate color in the center and blend outward", "Skip liner at the very corners"],
  },
  round: {
    label: "Round",
    description: "Lips that are tall relative to their width, with a soft, rounded outline.",
    tips: ["Extend liner slightly at the corners to widen", "Matte finishes keep the shape crisp"],
  },
  "top-heavy": {
    label: "Top-heavy",
    description: "The upper lip is as full as or fuller than the lower lip.",
    tips: ["Use a slightly lighter shade on the bottom lip", "A touch of gloss on the lower lip balances it"],
  },
  "bottom-heavy": {
    label: "Bottom-heavy",
    description: "The lower lip is noticeably fuller than the upper lip.",
    tips: ["Overline the upper lip slightly at the center", "Use a lighter shade on top to add volume"],
  },
  downturned: {
    label: "Downturned",
    description: "The corners of the mouth sit slightly lower than the center line.",
    tips: [
      "Line the corners a touch higher than your natural line",
      "Concealer just below the corners lifts the look",
    ],
  },
};

export function measureLips(face: LevelFace) {
  const p = face.p;
  const width = dist(p[LM.mouthR], p[LM.mouthL]);
  const upper = dist(p[LM.upperLipTop], p[LM.upperLipInner]);
  const lower = dist(p[LM.lowerLipInner], p[LM.lowerLipBottom]);
  const bowPeak = (p[37].y + p[267].y) / 2;
  const centerY = (p[LM.upperLipInner].y + p[LM.lowerLipInner].y) / 2;
  const cornerY = (p[LM.mouthR].y + p[LM.mouthL].y) / 2;
  return {
    fullness: (upper + lower) / width,
    ratio: lower / Math.max(upper, 1e-6),
    bow: (p[LM.upperLipTop].y - bowPeak) / Math.max(upper, 1e-6),
    widthToNose: width / dist(p[LM.alarR], p[LM.alarL]),
    cornerDrop: (cornerY - centerY) / width,
  };
}

export function classifyLipShape(m: {
  fullness: number;
  ratio: number;
  bow: number;
  widthToNose: number;
  cornerDrop: number;
}): LipShape {
  if (m.cornerDrop > 0.06) return "downturned";
  if (m.fullness > 0.42 && m.widthToNose < 1.35) return "round";
  if (m.bow > 0.25 && m.ratio > 1.3) return "heart";
  if (m.bow > 0.25) return "bow";
  if (m.widthToNose > 1.75) return "wide";
  if (m.fullness < 0.22) return "thin";
  if (m.ratio < 1.0) return "top-heavy";
  if (m.ratio > 2.0) return "bottom-heavy";
  if (m.fullness > 0.34) return "full";
  return m.ratio > 1.3 ? "heart" : "full";
}

export function analyzeLipShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const m = measureLips(face);
  const shape = classifyLipShape(m);
  const info = lipShapeInfo[shape];
  return {
    eyebrow: "Your lip shape",
    title: info.label,
    summary: info.description,
    tags: [
      m.fullness > 0.34 ? "Full volume" : m.fullness < 0.22 ? "Slim volume" : "Medium volume",
      `Upper : lower = 1 : ${m.ratio.toFixed(1)}`,
    ],
    metrics: [
      { label: "Fullness", value: m.fullness.toFixed(2), hint: "Total lip height ÷ mouth width." },
      { label: "Lower ÷ upper", value: m.ratio.toFixed(2), hint: "Often-cited ideal is about 1.6." },
      { label: "Cupid's bow", value: m.bow > 0.25 ? "Defined" : m.bow > 0.12 ? "Soft" : "Flat", hint: "Depth of the dip between the bow peaks." },
      { label: "Mouth ÷ nose width", value: m.widthToNose.toFixed(2), hint: "About 1.5–1.6 is typical." },
    ],
    sections: [{ title: "Lip makeup tips", items: info.tips }],
    warnings: yawWarning(face),
    links: [{ href: "/lipstick-shade-finder", label: "Find your lipstick shades" }],
  };
}

// ---------------------------------------------------------------- forehead

export type ForeheadShape = "broad" | "narrow" | "round" | "square" | "balanced";

export const foreheadShapeInfo: Record<ForeheadShape, TypeInfo> = {
  broad: {
    label: "Broad",
    description: "The forehead is about as wide as, or wider than, the cheekbones.",
    tips: [
      "Side-swept or curtain bangs soften width",
      "Volume at the jaw (lobs, waves) balances the upper face",
      "Avoid slicked-back styles that expose the full width",
    ],
  },
  narrow: {
    label: "Narrow",
    description: "The forehead is noticeably narrower than the cheekbones.",
    tips: [
      "Add volume at the temples and crown",
      "Wispy or full bangs widen the upper face",
      "Middle parts with lift work well",
    ],
  },
  round: {
    label: "Round",
    description: "The forehead curves smoothly at the top with soft temples.",
    tips: ["Angular, textured bangs add structure", "Side parts break up the curve", "Height at the crown elongates"],
  },
  square: {
    label: "Square",
    description: "A flatter top line with defined, straight-ish sides at the temples.",
    tips: ["Soft, wispy fringe rounds the corners", "Layers around the face soften angles", "Avoid blunt, straight-across bangs"],
  },
  balanced: {
    label: "Balanced",
    description: "Average width and a gently curved top — proportionate to the rest of the face.",
    tips: ["Nearly every fringe and parting works", "Try a slicked-back style to show it off"],
  },
};

export function analyzeForeheadShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const p = face.p;
  const foreheadWidth = dist(p[103], p[332]);
  const cheekWidth = dist(p[LM.cheekR], p[LM.cheekL]);
  const widthRatio = foreheadWidth / cheekWidth;
  // Drop of the upper corners below the top center, relative to half width.
  const curve =
    ((p[67].y + p[297].y) / 2 - p[LM.foreheadTop].y) /
    (dist(p[67], p[297]) / 2);
  const heightRatio =
    (p[LM.glabella].y - p[LM.foreheadTop].y) /
    (p[LM.chin].y - p[LM.foreheadTop].y);
  let shape: ForeheadShape;
  if (widthRatio >= 0.86) shape = "broad";
  else if (widthRatio < 0.74) shape = "narrow";
  else if (curve > 0.42) shape = "round";
  else if (curve < 0.3) shape = "square";
  else shape = "balanced";
  const info = foreheadShapeInfo[shape];
  const heightLabel =
    heightRatio > 0.27 ? "High forehead" : heightRatio < 0.21 ? "Low forehead" : "Average height";
  return {
    eyebrow: "Your forehead shape",
    title: info.label,
    summary: info.description,
    tags: [heightLabel],
    metrics: [
      { label: "Forehead ÷ cheekbones", value: pct(widthRatio), hint: "Width at the temples vs the widest part of the face." },
      { label: "Top curve", value: curve.toFixed(2), hint: "Higher = rounder top line, lower = flatter." },
      { label: "Visible height", value: pct(heightRatio), hint: "Brow-to-forehead-top as a share of face length." },
    ],
    sections: [
      { title: "Hairstyles for your forehead", items: info.tips },
      {
        title: "Check your hairline too",
        items: [
          "Hairline shapes like a widow's peak or M-shape aren't captured by face landmarks — pull your hair back in a mirror to check.",
          "An M-shaped hairline pairs well with textured fringes or a side part; a widow's peak suits slicked-back or side-swept styles.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [{ href: "/hairstyles-for-face-shape", label: "Hairstyles for your face shape" }],
  };
}

// ---------------------------------------------------------------- jawline

export type JawShape = "square" | "round" | "v-shaped" | "oval" | "rectangular" | "triangular";

export const jawShapeInfo: Record<JawShape, TypeInfo> = {
  square: {
    label: "Square",
    description: "A wide jaw with defined corners, close in width to the cheekbones.",
    tips: ["Soft layers and side parts soften the angles", "Longer styles past the jaw elongate", "Beards: keep sides short, a little length at the chin"],
  },
  round: {
    label: "Round",
    description: "A soft jaw with gently curved corners and a rounded chin.",
    tips: ["Height at the crown and longer layers add length", "Avoid chin-length bobs that end at the widest point", "Beards: a squared, slightly longer chin adds definition"],
  },
  "v-shaped": {
    label: "V-shaped",
    description: "The jaw tapers sharply from the cheekbones to a narrow, pointed chin.",
    tips: ["Chin-length bobs and waves add width at the jaw", "Side-swept bangs balance a broader upper face", "Beards: fuller sides even out the taper"],
  },
  oval: {
    label: "Oval",
    description: "A softly tapered jaw narrower than the cheekbones with a gently rounded chin.",
    tips: ["Most hairstyles and beard styles work", "Show it off with sleek, pulled-back styles"],
  },
  rectangular: {
    label: "Rectangular",
    description: "An angular jaw on a longer face, with straight sides from cheek to jaw.",
    tips: ["Bangs and volume at the sides shorten the face", "Avoid very long, straight styles", "Beards: keep the chin short and sides fuller"],
  },
  triangular: {
    label: "Triangular",
    description: "The jaw is wider than the forehead and cheekbones — a strong, grounded jawline.",
    tips: ["Volume at the crown and temples balances the base", "Layers that start above the jaw", "Beards: keep sides tight"],
  },
};

export function measureJaw(face: LevelFace) {
  const p = face.p;
  const cheek = dist(p[LM.cheekR], p[LM.cheekL]);
  const jaw = dist(p[LM.jawR], p[LM.jawL]);
  const chinWidth = dist(p[176], p[400]);
  const gonial =
    (angleAt(p[93], p[LM.jawR], p[150]) + angleAt(p[323], p[LM.jawL], p[379])) /
    2;
  return {
    jawToCheek: jaw / cheek,
    chinToJaw: chinWidth / jaw,
    gonial,
    chinAngle: angleAt(p[176], p[LM.chin], p[400]),
    lengthRatio: dist(p[LM.foreheadTop], p[LM.chin]) / cheek,
  };
}

export function classifyJawShape(m: {
  jawToCheek: number;
  chinToJaw: number;
  gonial: number;
  lengthRatio: number;
}): JawShape {
  const angular = m.gonial < 138;
  if (m.jawToCheek >= 0.98) return "triangular";
  if (m.jawToCheek < 0.8 && m.chinToJaw < 0.3) return "v-shaped";
  if (angular && m.lengthRatio > 1.45) return "rectangular";
  if (angular && m.jawToCheek >= 0.86) return "square";
  if (!angular && m.lengthRatio < 1.3) return "round";
  return "oval";
}

export function analyzeJawlineShape(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const m = measureJaw(face);
  const shape = classifyJawShape(m);
  const info = jawShapeInfo[shape];
  const definition = clamp(Math.round(((160 - m.gonial) / 35) * 100), 0, 100);
  return {
    eyebrow: "Your jawline shape",
    title: info.label,
    summary: info.description,
    score: { value: definition, max: 100, label: "Jaw angle definition" },
    tags: [m.gonial < 138 ? "Angular corners" : "Soft corners"],
    metrics: [
      { label: "Jaw ÷ cheekbones", value: pct(m.jawToCheek), hint: "Width across the jaw corners vs the widest point of the face." },
      { label: "Jaw corner angle", value: `${Math.round(m.gonial)}°`, hint: "Front-view angle at the jaw corner. Lower = sharper." },
      { label: "Chin width", value: pct(m.chinToJaw), hint: "Chin width relative to jaw width." },
      { label: "Chin angle", value: `${Math.round(m.chinAngle)}°`, hint: "Smaller angles read as a pointed chin." },
    ],
    sections: [{ title: "Hair and beard tips", items: info.tips }],
    warnings: yawWarning(face),
    links: [{ href: "/face-shape-detector", label: "Detect your full face shape" }],
  };
}
