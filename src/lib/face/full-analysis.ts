// The all-in-one face analyzer: one photo, every free reading, in the order
// a reader cares about (shape → features → proportions → color).

import type { NormalizedLandmark } from "./mediapipe";
import type { AnalysisResult } from "./analysis-result";
import { detectFaceShape } from "./face-shape";
import {
  analyzeEyebrowShape,
  analyzeEyeShape,
  analyzeJawlineShape,
  analyzeLipShape,
  analyzeNoseShape,
} from "./features";
import { analyzeSkinTone } from "./makeup";
import {
  analyzeCanthalTilt,
  analyzeFacialProportions,
  analyzeFaceRating,
  analyzeGoldenRatio,
  analyzeSymmetry,
} from "./proportions";

type RawLandmark = NormalizedLandmark;

export function analyzeFullFace(
  landmarks: RawLandmark[],
  imageData: ImageData,
  width: number,
  height: number,
): AnalysisResult[] {
  const shape = detectFaceShape(landmarks);
  const faceShape: AnalysisResult = {
    eyebrow: "Face shape",
    title: shape.shapeLabel,
    summary: shape.description,
    metrics: [
      { label: "Length ÷ width", value: shape.measurements.lengthToWidthRatio.toFixed(2) },
      { label: "Forehead ÷ cheek", value: `${Math.round(shape.measurements.foreheadToCheekRatio * 100)}%` },
      { label: "Jaw ÷ cheek", value: `${Math.round(shape.measurements.jawToCheekRatio * 100)}%` },
    ],
    sections: [
      { title: "Haircuts that suit you", items: shape.hairstyles.slice(0, 4) },
      { title: "Glasses frames", items: shape.glasses.slice(0, 3) },
    ],
    links: [{ href: "/hairstyles-for-face-shape", label: "More hairstyles for your shape" }],
  };
  const args = [landmarks, width, height] as const;
  // Keep the overview compact: drop per-tool cross-links and repeat warnings.
  const compact = (r: AnalysisResult): AnalysisResult => ({ ...r, warnings: undefined });
  const rating = analyzeFaceRating(...args);
  return [
    { ...rating, eyebrow: "Overall face rating" },
    faceShape,
    compact(analyzeEyeShape(...args)),
    compact(analyzeEyebrowShape(...args)),
    compact(analyzeNoseShape(...args)),
    compact(analyzeLipShape(...args)),
    compact(analyzeJawlineShape(...args)),
    compact(analyzeSymmetry(...args)),
    compact(analyzeGoldenRatio(...args)),
    compact(analyzeFacialProportions(...args)),
    compact(analyzeCanthalTilt(...args)),
    analyzeSkinTone(landmarks, imageData, width, height),
  ];
}
