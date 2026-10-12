// Body type (somatotype) estimate from tape measurements. Frame size from
// the height-to-wrist ratio, plus BMI, waist-to-height and shoulder-to-waist,
// each nudge ectomorph / mesomorph / endomorph scores. A styling and
// training guide — not a body-composition test.

import type { AnalysisResult } from "@/lib/face/analysis-result";

export type Sex = "female" | "male";
export type Somatotype = "ectomorph" | "mesomorph" | "endomorph";

export type BodyTypeInput = {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  wristCm: number;
  shouldersCm: number;
  waistCm: number;
  hipsCm: number;
};

export const somatotypeInfo: Record<
  Somatotype,
  { label: string; description: string; training: string[]; style: string[] }
> = {
  ectomorph: {
    label: "Ectomorph",
    description:
      "A lean, linear build with a smaller frame, narrow shoulders and hips, and a fast-feeling metabolism. Gaining weight or muscle takes deliberate effort.",
    training: [
      "Prioritize compound strength lifts with progressive overload",
      "Keep cardio moderate so it doesn't eat into recovery",
      "Eat in a small calorie surplus with plenty of protein",
    ],
    style: [
      "Layering and textured fabrics add visual volume",
      "Horizontal details (stripes, yokes) broaden the frame",
      "Structured shoulders on jackets and coats",
    ],
  },
  mesomorph: {
    label: "Mesomorph",
    description:
      "A medium-to-large frame with broader shoulders, a defined waist and muscle that builds readily. The classic 'athletic' build.",
    training: [
      "Mix strength and conditioning — you respond quickly to both",
      "Vary rep ranges to keep progressing",
      "Watch total calories; mesomorphs can gain fat as easily as muscle",
    ],
    style: [
      "Tailored fits show off your proportions",
      "Avoid boxy cuts that hide the waist",
      "Stretch fabrics for comfort across shoulders and thighs",
    ],
  },
  endomorph: {
    label: "Endomorph",
    description:
      "A larger, rounder frame with a wider waist and hips, and a body that stores energy readily. Strong and sturdy, often powerful in strength sports.",
    training: [
      "Combine strength training with regular, enjoyable cardio",
      "Focus on daily movement — steps add up",
      "Build meals around protein, vegetables and fiber",
    ],
    style: [
      "Vertical lines and monochrome outfits elongate",
      "V-necks and open collars lengthen the torso",
      "Structured, mid-weight fabrics skim rather than cling",
    ],
  },
};

export function frameSize(sex: Sex, heightCm: number, wristCm: number): "small" | "medium" | "large" {
  const r = heightCm / wristCm;
  if (sex === "male") return r > 10.4 ? "small" : r >= 9.6 ? "medium" : "large";
  return r > 11 ? "small" : r >= 10.1 ? "medium" : "large";
}

export function scoreSomatotype(input: BodyTypeInput): Record<Somatotype, number> {
  const frame = frameSize(input.sex, input.heightCm, input.wristCm);
  const bmi = input.weightKg / (input.heightCm / 100) ** 2;
  const whtr = input.waistCm / input.heightCm;
  const swr = input.shouldersCm / input.waistCm;
  const [swrHigh, swrMid] = input.sex === "male" ? [1.45, 1.3] : [1.35, 1.2];

  const ecto =
    (frame === "small" ? 2 : frame === "medium" ? 1 : 0) +
    (bmi < 18.5 ? 3 : bmi < 21 ? 2 : bmi < 23 ? 1 : 0) +
    (whtr < 0.42 ? 1 : 0);
  const meso =
    (frame === "small" ? 0 : 1) +
    (bmi >= 21 && bmi <= 26 ? 2 : bmi >= 19 && bmi <= 28 ? 1 : 0) +
    (swr >= swrHigh ? 2 : swr >= swrMid ? 1 : 0);
  const endo =
    (frame === "large" ? 2 : 0) +
    (bmi > 27 ? 3 : bmi > 24 ? 2 : bmi > 22.5 ? 1 : 0) +
    (whtr > 0.5 ? 2 : whtr > 0.46 ? 1 : 0);
  return { ectomorph: ecto, mesomorph: meso, endomorph: endo };
}

export function bodyTypeResult(input: BodyTypeInput): AnalysisResult {
  const scores = scoreSomatotype(input);
  const order = (Object.keys(scores) as Somatotype[]).sort((a, b) => scores[b] - scores[a]);
  const [first, second] = order;
  const hybrid = scores[first] - scores[second] <= 1 && scores[second] > 0;
  const total = order.reduce((s, k) => s + scores[k], 0) || 1;
  const info = somatotypeInfo[first];
  const bmi = input.weightKg / (input.heightCm / 100) ** 2;
  const frame = frameSize(input.sex, input.heightCm, input.wristCm);
  const title = hybrid
    ? `${somatotypeInfo[first].label.replace(/morph$/, "")}-${somatotypeInfo[second].label.toLowerCase()}`
    : info.label;
  return {
    eyebrow: "Your body type",
    title,
    summary: hybrid
      ? `You're a mix of ${somatotypeInfo[first].label.toLowerCase()} and ${somatotypeInfo[second].label.toLowerCase()} — most people are. ${info.description}`
      : info.description,
    tags: [`${frame[0].toUpperCase()}${frame.slice(1)} frame`],
    metrics: [
      ...order.map((k) => ({
        label: somatotypeInfo[k].label,
        value: `${Math.round((scores[k] / total) * 100)}%`,
        score: Math.round((scores[k] / total) * 100),
      })),
      { label: "Frame size", value: frame, hint: "From your height-to-wrist ratio." },
      { label: "BMI", value: bmi.toFixed(1), hint: "Weight ÷ height². A rough guide that doesn't separate muscle from fat." },
      { label: "Waist ÷ height", value: (input.waistCm / input.heightCm).toFixed(2), hint: "Under 0.5 is the common health guideline." },
      { label: "Shoulders ÷ waist", value: (input.shouldersCm / input.waistCm).toFixed(2), hint: "Higher reads more V-shaped." },
    ],
    sections: [
      { title: "Training that suits you", items: info.training },
      { title: "Style tips", items: info.style },
      {
        title: "Good to know",
        items: [
          "Somatotypes are a loose framework — your habits shape your body far more than a label does.",
          "This isn't medical advice. Talk to a professional before big diet or training changes.",
        ],
      },
    ],
    links: [
      { href: input.sex === "male" ? "/body-shape-calculator-men" : "/body-shape-calculator-female", label: "Body shape calculator" },
      { href: "/kibbe-body-type-test", label: "Take the Kibbe test" },
    ],
  };
}
