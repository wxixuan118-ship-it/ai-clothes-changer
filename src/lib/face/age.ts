// Age estimation helpers around the FairFace model (Kärkkäinen & Joo,
// CC BY 4.0). The model outputs nine age bands; we report the most likely
// band plus a probability-weighted estimate in years. Everything here is
// pure — the ONNX session lives in age-model.ts.

import type { AnalysisResult } from "./analysis-result";

export const AGE_BANDS = [
  "0–2",
  "3–9",
  "10–19",
  "20–29",
  "30–39",
  "40–49",
  "50–59",
  "60–69",
  "70+",
] as const;

// Band midpoints used for the weighted estimate.
const MIDPOINTS = [1, 6, 14.5, 24.5, 34.5, 44.5, 54.5, 64.5, 75];

export const INPUT_SIZE = 224;

// ArcFace 5-point template (112px) scaled to the 224px model input: image-
// left eye, image-right eye, nose tip, image-left and image-right mouth corner.
export const ALIGN_TEMPLATE: [number, number][] = [
  [38.2946, 51.6963],
  [73.5318, 51.5014],
  [56.0252, 71.7366],
  [41.5493, 92.3655],
  [70.7299, 92.2041],
].map(([x, y]) => [x * 2, y * 2] as [number, number]);

// MediaPipe indices for the template points (iris centers, nose tip, mouth corners).
export const ALIGN_LANDMARKS = [468, 473, 1, 61, 291] as const;

/** 2×3 affine [a, b, c, d, e, f] in canvas setTransform order. */
export type Affine = [number, number, number, number, number, number];

/** Least-squares similarity transform (rotation, uniform scale, shift) from src to dst. */
export function similarityTransform(
  src: [number, number][],
  dst: [number, number][],
): Affine {
  const n = src.length;
  const mean = (pts: [number, number][]) => [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n,
  ];
  const [sx, sy] = mean(src);
  const [dx, dy] = mean(dst);
  let norm = 0;
  let a = 0;
  let b = 0;
  for (let i = 0; i < n; i++) {
    const px = src[i][0] - sx;
    const py = src[i][1] - sy;
    const qx = dst[i][0] - dx;
    const qy = dst[i][1] - dy;
    norm += px * px + py * py;
    a += px * qx + py * qy;
    b += px * qy - py * qx;
  }
  a /= norm;
  b /= norm;
  // x' = a·x − b·y + tx ; y' = b·x + a·y + ty
  const tx = dx - (a * sx - b * sy);
  const ty = dy - (b * sx + a * sy);
  return [a, b, -b, a, tx, ty];
}

export function applyAffine(
  m: Affine,
  [x, y]: [number, number],
): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** Pixel-space alignment points from normalized MediaPipe landmarks. */
export function alignPoints(
  landmarks: { x: number; y: number }[],
  width: number,
  height: number,
): [number, number][] {
  return ALIGN_LANDMARKS.map((i) => [
    landmarks[i].x * width,
    landmarks[i].y * height,
  ]);
}

export function softmax(logits: ArrayLike<number>): number[] {
  const values = Array.from(logits);
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - max));
  const sum = exps.reduce((s, v) => s + v, 0);
  return exps.map((v) => v / sum);
}

export type AgeEstimate = {
  years: number;
  band: (typeof AGE_BANDS)[number];
  bandIndex: number;
  confidence: number;
  probabilities: number[];
};

export function estimateAge(logits: ArrayLike<number>): AgeEstimate {
  const probabilities = softmax(logits);
  let bandIndex = 0;
  probabilities.forEach((p, i) => {
    if (p > probabilities[bandIndex]) bandIndex = i;
  });
  const years = probabilities.reduce((s, p, i) => s + p * MIDPOINTS[i], 0);
  return {
    years: Math.round(years),
    band: AGE_BANDS[bandIndex],
    bandIndex,
    confidence: probabilities[bandIndex],
    probabilities,
  };
}

export function ageResult(estimate: AgeEstimate): AnalysisResult {
  const pct = (p: number) => Math.round(p * 100);
  return {
    eyebrow: "You look about",
    title: `${estimate.years} years old`,
    summary: `Most likely age range: ${estimate.band} (${pct(estimate.confidence)}% of the model's confidence). The estimate in years is a weighted average across all nine age ranges.`,
    tags: [`Age range ${estimate.band}`],
    metrics: AGE_BANDS.map((band, i) => ({
      label: band,
      value: `${pct(estimate.probabilities[i])}%`,
      score: pct(estimate.probabilities[i]),
    })),
    sections: [
      {
        title: "Why the estimate can differ from your real age",
        items: [
          "Lighting: soft front light smooths skin and reads younger; hard overhead light adds shadows and reads older.",
          "Expression: a relaxed face reads younger than a frown; big smiles add lines.",
          "Styling: glasses, beards, makeup and hairstyles all shift perceived age.",
          "The model was trained on age ranges, so expect a typical error of about 5 to 8 years.",
        ],
      },
    ],
    links: [
      {
        href: "/age-calculator-by-photo",
        label: "Estimate ages in a group photo",
      },
      { href: "/skin-tone-analyzer", label: "Analyze your skin tone" },
    ],
  };
}
