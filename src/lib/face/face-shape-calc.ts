// Manual face shape calculator: four tape measurements plus chin shape.
// Same seven shapes as the photo detector, with thresholds for full
// hairline-to-chin length (the photo mesh stops below the hairline).

import type { AnalysisResult } from "./analysis-result";
import { faceShapeInfo, type FaceShape } from "./face-shape-info";

export type ChinShape = "rounded" | "square" | "pointed";

export type FaceMeasurements = {
  forehead: number;
  cheekbones: number;
  jaw: number;
  length: number;
  chin: ChinShape;
};

export function classifyFaceShapeFromMeasurements(m: FaceMeasurements): FaceShape {
  const lw = m.length / m.cheekbones;
  const fc = m.forehead / m.cheekbones;
  const jc = m.jaw / m.cheekbones;
  if (jc > 1.02 && m.jaw > m.forehead * 1.05) return "triangle";
  if (lw >= 1.6 && Math.abs(fc - jc) < 0.12) return "oblong";
  if (fc < 0.88 && jc < 0.88 && m.chin === "pointed") return "diamond";
  if (fc >= 0.95 && jc < 0.85) return "heart";
  if (lw < 1.3) return m.chin === "square" || jc >= 0.92 ? "square" : "round";
  if (fc < 0.85 && jc < 0.85) return "diamond";
  return "oval";
}

export function faceShapeCalcResult(m: FaceMeasurements): AnalysisResult {
  const shape = classifyFaceShapeFromMeasurements(m);
  const info = faceShapeInfo[shape];
  const r = (v: number) => v.toFixed(2);
  return {
    eyebrow: "Your face shape",
    title: info.label,
    summary: info.description,
    metrics: [
      { label: "Length ÷ cheekbones", value: r(m.length / m.cheekbones), hint: "Above 1.6 reads long; under 1.3 reads short and wide." },
      { label: "Forehead ÷ cheekbones", value: r(m.forehead / m.cheekbones) },
      { label: "Jaw ÷ cheekbones", value: r(m.jaw / m.cheekbones) },
    ],
    sections: [
      { title: "Haircuts that suit you", items: info.hairstyles },
      { title: "Glasses frames", items: info.glasses },
    ],
    links: [
      { href: "/face-shape-detector", label: "Double-check with a photo" },
      { href: "/hairstyles-for-face-shape", label: "Hairstyles for your face shape" },
    ],
  };
}
