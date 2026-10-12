// Proportion and symmetry measurements, plus the composite scores behind
// the attractiveness and face rating tests. All ratios come from the level
// face, so head roll does not leak into them.

import type { NormalizedLandmark } from "./mediapipe";
import type { AnalysisResult } from "./analysis-result";
import { measureEyes } from "./features";
import {
  clamp,
  dist,
  levelFace,
  LM,
  mid,
  yawWarning,
  type LevelFace,
} from "./geometry";

type RawLandmark = NormalizedLandmark;

export const PHI = 1.618;

// ---------------------------------------------------------------- symmetry

// Mirror pairs (subject right, subject left) grouped by region.
const symmetryPairs: Record<string, [number, number][]> = {
  Eyes: [
    [33, 263],
    [133, 362],
    [159, 386],
    [145, 374],
    [468, 473],
  ],
  Brows: [
    [70, 300],
    [105, 334],
    [107, 336],
    [46, 276],
  ],
  Nose: [
    [64, 294],
    [129, 358],
    [48, 278],
  ],
  Mouth: [
    [61, 291],
    [37, 267],
    [84, 314],
    [40, 270],
  ],
  Jaw: [
    [172, 397],
    [136, 365],
    [150, 379],
    [176, 400],
    [234, 454],
    [132, 361],
  ],
};

const midline = [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 2, 0, 13, 14, 17, 18, 200, 199, 175, 152];

export function measureSymmetry(face: LevelFace) {
  const p = face.p;
  // Vertical midline as the mean x of midline landmarks (face is level).
  const axisX = midline.reduce((s, i) => s + p[i].x, 0) / midline.length;
  const regions: Record<string, number> = {};
  let total = 0;
  let count = 0;
  for (const [region, pairs] of Object.entries(symmetryPairs)) {
    let sum = 0;
    for (const [r, l] of pairs) {
      const mirroredX = 2 * axisX - p[r].x;
      const dev = Math.hypot(mirroredX - p[l].x, p[r].y - p[l].y);
      sum += dev / face.faceWidth;
    }
    regions[region] = sum / pairs.length;
    total += sum;
    count += pairs.length;
  }
  const deviation = total / count;
  return { deviation, regions, score: symmetryScore(deviation) };
}

/** Maps mean mirror deviation (share of face width) to 0–100. */
export function symmetryScore(deviation: number): number {
  return Math.round(clamp(100 - deviation * 100 * 7, 35, 99));
}

export function analyzeSymmetry(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const s = measureSymmetry(face);
  const regions = Object.entries(s.regions).sort((a, b) => a[1] - b[1]);
  const label =
    s.score >= 90
      ? "Highly symmetrical"
      : s.score >= 80
        ? "Very symmetrical"
        : s.score >= 70
          ? "Naturally balanced"
          : "Noticeably asymmetrical";
  return {
    eyebrow: "Your face symmetry",
    title: `${s.score}% symmetrical`,
    summary: `${label}. Most real faces score between 75% and 90% — perfect symmetry is rare and often looks unnatural.`,
    score: { value: s.score, max: 100, label: "Symmetry score" },
    tags: [`Most symmetrical: ${regions[0][0]}`, `Least symmetrical: ${regions[regions.length - 1][0]}`],
    metrics: regions.map(([region, dev]) => ({
      label: region,
      value: `${symmetryScore(dev)}%`,
      score: symmetryScore(dev),
      hint: `Average mirror offset ${(dev * 100).toFixed(1)}% of face width.`,
    })),
    sections: [
      {
        title: "What affects your score",
        items: [
          "Head tilt and turn: face the camera straight on, at eye level.",
          "Expression: relax your face — smiles are rarely symmetrical.",
          "Lens distortion: phone cameras held close exaggerate the nearer side.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [
      { href: "/golden-ratio-face", label: "Check your golden ratio" },
      { href: "/face-rating-test", label: "Get a full face rating" },
    ],
  };
}

// ---------------------------------------------------------------- spacing

export function analyzeEyeDistance(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const p = face.p;
  const eyes = measureEyes(face);
  const ipd = dist(p[LM.irisR], p[LM.irisL]);
  const ipdRatio = ipd / face.faceWidth;
  const spacing = eyes.spacing;
  const type =
    spacing > 1.1 ? "Wide-set eyes" : spacing < 0.9 ? "Close-set eyes" : "Balanced eye spacing";
  const summary =
    spacing > 1.1
      ? "The gap between your eyes is wider than one eye width. Wide-set eyes read open and youthful."
      : spacing < 0.9
        ? "The gap between your eyes is narrower than one eye width. Close-set eyes read intense and focused."
        : "The gap between your eyes is about one eye width — the classic 'rule of fifths' balance.";
  const tips =
    spacing > 1.1
      ? [
          "Darken the inner third of the lid and the inner lash line",
          "Fill brows slightly closer toward the nose",
          "Frames with a darker, thicker bridge pull the eyes together",
        ]
      : spacing < 0.9
        ? [
            "Highlight the inner corners and keep them light",
            "Focus liner and shadow on the outer half, winging outward",
            "Frames with a clear or thin bridge add space",
          ]
        : [
            "Any liner placement works",
            "Keep shadow balanced between inner and outer corners",
          ];
  return {
    eyebrow: "Your eye spacing",
    title: type,
    summary,
    score: {
      value: Math.round(clamp(100 - Math.abs(spacing - 1) * 200, 40, 100)),
      max: 100,
      label: "Rule-of-fifths balance",
    },
    metrics: [
      { label: "Eye spacing ratio", value: spacing.toFixed(2), hint: "Inner-corner gap ÷ eye width. 1.0 is the classic ideal." },
      { label: "Pupil distance ÷ face width", value: ipdRatio.toFixed(2), hint: "Commonly cited ideal is about 0.46." },
      { label: "Eye width ÷ face width", value: (eyes.width / face.faceWidth).toFixed(2), hint: "About 0.2 in the rule of fifths." },
    ],
    sections: [{ title: "Makeup and glasses tips", items: tips }],
    warnings: yawWarning(face),
    links: [
      { href: "/eye-shape-detector", label: "Detect your eye shape" },
      { href: "/facial-proportions-calculator", label: "Check facial proportions" },
    ],
  };
}

// ---------------------------------------------------------------- canthal

export function canthalLabel(tilt: number): string {
  if (tilt >= 4) return "Positive canthal tilt";
  if (tilt >= 0) return "Neutral canthal tilt";
  return "Negative canthal tilt";
}

export function analyzeCanthalTilt(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const eyes = measureEyes(face);
  const label = canthalLabel(eyes.tilt);
  const summary =
    eyes.tilt >= 4
      ? "Your outer eye corners sit higher than the inner corners — the lifted 'fox' or 'hunter' eye look."
      : eyes.tilt >= 0
        ? "Your eye corners sit close to level. A neutral tilt is the most common."
        : "Your outer eye corners sit slightly lower than the inner corners, giving a softer, 'hound eye' look.";
  return {
    eyebrow: "Your canthal tilt",
    title: `${eyes.tilt >= 0 ? "+" : ""}${eyes.tilt.toFixed(1)}°`,
    summary: `${label}. ${summary}`,
    tags: [label],
    metrics: [
      { label: "Right eye", value: `${eyes.tiltR.toFixed(1)}°` },
      { label: "Left eye", value: `${eyes.tiltL.toFixed(1)}°` },
      { label: "Average", value: `${eyes.tilt.toFixed(1)}°`, hint: "Angle from inner to outer corner, measured against the line between both eyes." },
    ],
    sections: [
      {
        title: "How to read it",
        items: [
          "Positive: above +4°. Neutral: 0° to +4°. Negative: below 0°.",
          "Tilt changes with expression and head angle, so compare photos taken the same way.",
          "Winged liner and lifting the outer brow tail make a tilt look more positive.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [
      { href: "/eye-shape-detector", label: "Detect your eye shape" },
      { href: "/face-rating-test", label: "See your full face rating" },
    ],
  };
}

// ---------------------------------------------------------------- thirds

export function measureThirds(face: LevelFace) {
  const p = face.p;
  const glabella = p[LM.glabella].y;
  const subnasale = p[LM.subnasale].y;
  const chin = p[LM.chin].y;
  const stomion = mid(p[LM.upperLipInner], p[LM.lowerLipInner]).y;
  const middle = subnasale - glabella;
  const lower = chin - subnasale;
  const pupils = mid(p[LM.irisR], p[LM.irisL]).y;
  const ipd = dist(p[LM.irisR], p[LM.irisL]);
  return {
    middle,
    lower,
    middleToLower: middle / lower,
    lipChin: (stomion - subnasale) / (chin - stomion),
    midfaceRatio: ipd / (p[LM.upperLipTop].y - pupils),
    upperVisible: glabella - p[LM.foreheadTop].y,
  };
}

export function analyzeFacialProportions(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const t = measureThirds(face);
  const eyes = measureEyes(face);
  const share = (v: number) => Math.round((v / (t.middle + t.lower)) * 100);
  const balance = Math.round(clamp(100 - Math.abs(t.middleToLower - 1) * 150, 30, 100));
  const verdict =
    t.middleToLower > 1.08
      ? "Your middle third is longer than your lower third."
      : t.middleToLower < 0.92
        ? "Your lower third is longer than your middle third."
        : "Your middle and lower thirds are closely balanced.";
  return {
    eyebrow: "Your facial proportions",
    title: `${share(t.middle)} : ${share(t.lower)}`,
    summary: `Middle third to lower third. ${verdict} The neoclassical ideal is an even 50 : 50.`,
    score: { value: balance, max: 100, label: "Thirds balance" },
    metrics: [
      { label: "Middle ÷ lower third", value: t.middleToLower.toFixed(2), hint: "Brow to nose base vs nose base to chin. Ideal 1.0." },
      { label: "Midface ratio", value: t.midfaceRatio.toFixed(2), hint: "Pupil distance ÷ pupils-to-upper-lip height. About 1.0–1.1 reads compact." },
      { label: "Lip-to-chin split", value: `1 : ${(1 / t.lipChin).toFixed(2)}`, hint: "Nose-to-mouth vs mouth-to-chin. Classic ideal is 1 : 2." },
      { label: "Eye spacing (fifths)", value: eyes.spacing.toFixed(2), hint: "Gap between eyes ÷ eye width. Ideal 1.0." },
    ],
    sections: [
      {
        title: "About the upper third",
        items: [
          "The upper third runs from hairline to brow. Face landmarks stop below the hairline, so measure it in a mirror: it should be roughly equal to your middle third.",
          "Fringes shorten a long upper third; slicked-back styles lengthen a short one.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [
      { href: "/golden-ratio-face", label: "Golden ratio face test" },
      { href: "/eye-distance-calculator", label: "Eye distance calculator" },
    ],
  };
}

// ---------------------------------------------------------------- golden

export function measureGoldenRatios(face: LevelFace) {
  const p = face.p;
  const t = measureThirds(face);
  const mouth = dist(p[LM.mouthR], p[LM.mouthL]);
  const nose = dist(p[LM.alarR], p[LM.alarL]);
  // Hairline estimate: upper third ≈ middle third (neoclassical canon).
  const faceLength = t.middle * 2 + t.lower;
  const outerEyes = dist(p[LM.eyeOuterR], p[LM.eyeOuterL]);
  const stomion = mid(p[LM.upperLipInner], p[LM.lowerLipInner]).y;
  const ratios = [
    { label: "Face length ÷ width", value: faceLength / face.faceWidth },
    { label: "Mouth ÷ nose width", value: mouth / nose },
    { label: "Face width ÷ outer eye span", value: face.faceWidth / outerEyes },
    { label: "Nose length ÷ nose width", value: dist(p[LM.nasion], p[LM.subnasale]) / nose },
    { label: "Nose-to-chin ÷ mouth-to-chin", value: (p[LM.chin].y - p[LM.subnasale].y) / (p[LM.chin].y - stomion) },
  ];
  const scored = ratios.map((r) => ({
    ...r,
    score: Math.round(clamp(100 - (Math.abs(r.value - PHI) / PHI) * 160, 0, 100)),
  }));
  const score = Math.round(scored.reduce((s, r) => s + r.score, 0) / scored.length);
  return { ratios: scored, score };
}

export function analyzeGoldenRatio(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const g = measureGoldenRatios(face);
  const best = [...g.ratios].sort((a, b) => b.score - a.score)[0];
  return {
    eyebrow: "Your golden ratio score",
    title: `${g.score}%`,
    summary: `How closely five facial ratios match the golden ratio φ = 1.618. Your closest match: ${best.label.toLowerCase()} (${best.value.toFixed(2)}). Most faces land between 70% and 90%.`,
    score: { value: g.score, max: 100, label: "Golden ratio match" },
    metrics: g.ratios.map((r) => ({
      label: r.label,
      value: r.value.toFixed(2),
      score: r.score,
      hint: `${r.score}% match to 1.618`,
    })),
    sections: [
      {
        title: "Keep it in perspective",
        items: [
          "The golden ratio is one historical beauty theory, not a scientific measure of attractiveness.",
          "Face length uses an estimated hairline (upper third equal to middle third).",
          "Use a straight-on photo at arm's length — close selfies widen the nose and narrow the face.",
        ],
      },
    ],
    warnings: yawWarning(face),
    links: [
      { href: "/face-symmetry-test", label: "Face symmetry test" },
      { href: "/attractiveness-test", label: "Attractiveness test" },
    ],
  };
}

// ---------------------------------------------------------------- ratings

export function measureRatings(face: LevelFace) {
  const eyes = measureEyes(face);
  const t = measureThirds(face);
  const sym = measureSymmetry(face).score;
  const golden = measureGoldenRatios(face).score;
  const tilt = eyes.tilt;
  const canthal = Math.round(
    tilt >= 4 && tilt <= 9
      ? 95
      : tilt > 9
        ? clamp(95 - (tilt - 9) * 5, 60, 95)
        : clamp(80 + tilt * 4, 40, 92),
  );
  const thirds = Math.round(clamp(100 - Math.abs(t.middleToLower - 1) * 150, 30, 100));
  const midface = Math.round(clamp(100 - Math.abs(t.midfaceRatio - 1.05) * 180, 30, 100));
  const spacing = Math.round(clamp(100 - Math.abs(eyes.spacing - 1) * 200, 40, 100));
  return { sym, golden, canthal, thirds, midface, spacing };
}

/** Weighted 0–100 harmony score from the individual ratings. */
export function harmonyScore(r: ReturnType<typeof measureRatings>): number {
  return Math.round(
    r.sym * 0.3 + r.golden * 0.2 + r.canthal * 0.15 + r.thirds * 0.15 + r.midface * 0.1 + r.spacing * 0.1,
  );
}

/** Maps harmony (0–100) onto a kind 1–10 scale that centers near 6.5. */
export function toTen(harmony: number): number {
  return Math.round(clamp(3.5 + (harmony / 100) * 6.2, 3.5, 9.7) * 10) / 10;
}

const ratingLabels = (s: number) =>
  s >= 8.5 ? "Striking" : s >= 7.5 ? "Very attractive" : s >= 6.5 ? "Attractive" : s >= 5.5 ? "Above average" : "Unique";

const disclaimer = [
  "This is a geometry score from one photo. Attractiveness also depends on expression, style, skin, confidence and who is looking.",
  "Lighting, lens distance and head angle can move the score a full point — try two or three photos.",
];

export function analyzeAttractiveness(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const r = measureRatings(face);
  const score = toTen(harmonyScore(r));
  const strengths = [
    ["Symmetry", r.sym],
    ["Golden ratio", r.golden],
    ["Eye tilt", r.canthal],
    ["Facial thirds", r.thirds],
    ["Midface", r.midface],
    ["Eye spacing", r.spacing],
  ] as const;
  const top = [...strengths].sort((a, b) => b[1] - a[1]).slice(0, 2);
  return {
    eyebrow: "Your attractiveness score",
    title: `${score.toFixed(1)} / 10`,
    summary: `${ratingLabels(score)}. Your strongest features are ${top[0][0].toLowerCase()} and ${top[1][0].toLowerCase()}.`,
    score: { value: score, max: 10, label: "Facial harmony" },
    metrics: strengths.map(([label, v]) => ({ label, value: `${v}`, score: v })),
    sections: [
      {
        title: "Easy ways to photograph better",
        items: [
          "Shoot at eye level from arm's length or further — close lenses widen the nose.",
          "Soft window light from the front evens out skin and shadows.",
          "Relax your jaw and slightly lift your chin toward the camera.",
        ],
      },
      { title: "Keep it in perspective", items: disclaimer },
    ],
    warnings: yawWarning(face),
    links: [
      { href: "/face-rating-test", label: "See the 5-part face rating" },
      { href: "/", label: "Try a new hairstyle on your photo" },
    ],
  };
}

export function analyzeFaceRating(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): AnalysisResult {
  const face = levelFace(landmarks, width, height);
  const r = measureRatings(face);
  const eyes = measureEyes(face);
  const t = measureThirds(face);
  const parts = [
    { label: "Golden ratio", v: r.golden, note: "Five facial ratios vs φ = 1.618" },
    { label: "Canthal tilt", v: r.canthal, note: `${eyes.tilt.toFixed(1)}° — ${canthalLabel(eyes.tilt).toLowerCase()}` },
    { label: "Symmetry", v: r.sym, note: "Left/right mirror match" },
    { label: "Facial thirds", v: r.thirds, note: `Middle ÷ lower = ${t.middleToLower.toFixed(2)}` },
    { label: "Midface ratio", v: r.midface, note: `${t.midfaceRatio.toFixed(2)} (compact ≈ 1.0–1.1)` },
  ];
  const overall = toTen(harmonyScore(r));
  return {
    eyebrow: "Your face rating",
    title: `${overall.toFixed(1)} / 10`,
    summary: `${ratingLabels(overall)}. A breakdown of five geometric measures, each scored out of 10.`,
    score: { value: overall, max: 10, label: "Overall rating" },
    metrics: parts.map((x) => ({
      label: x.label,
      value: `${(x.v / 10).toFixed(1)} / 10`,
      score: x.v,
      hint: x.note,
    })),
    sections: [{ title: "Keep it in perspective", items: disclaimer }],
    warnings: yawWarning(face),
    links: [
      { href: "/attractiveness-test", label: "Attractiveness test" },
      { href: "/face-symmetry-test", label: "Detailed symmetry test" },
    ],
  };
}
