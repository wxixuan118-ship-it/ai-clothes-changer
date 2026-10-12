"use client";

import * as React from "react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import type { AnalysisResult } from "@/lib/face/analysis-result";
import {
  analyzeEyebrowShape,
  analyzeEyeShape,
  analyzeForeheadShape,
  analyzeJawlineShape,
  analyzeLipShape,
  analyzeNoseShape,
} from "@/lib/face/features";
import { analyzeFullFace } from "@/lib/face/full-analysis";
import {
  analyzeBlush,
  analyzeConcealer,
  analyzeEyeshadow,
  analyzeLipstick,
  analyzeSkinTone,
} from "@/lib/face/makeup";
import type { NormalizedLandmark } from "@/lib/face/mediapipe";
import {
  analyzeAttractiveness,
  analyzeCanthalTilt,
  analyzeEyeDistance,
  analyzeFaceRating,
  analyzeFacialProportions,
  analyzeGoldenRatio,
  analyzeSymmetry,
} from "@/lib/face/proportions";

import { ResultCard } from "./result-card";

type Geometry = (l: NormalizedLandmark[], w: number, h: number) => AnalysisResult;
type Color = (
  l: NormalizedLandmark[],
  img: ImageData,
  w: number,
  h: number,
) => AnalysisResult;

const geometry = {
  "eye-shape": analyzeEyeShape,
  "eyebrow-shape": analyzeEyebrowShape,
  "nose-shape": analyzeNoseShape,
  "lip-shape": analyzeLipShape,
  "forehead-shape": analyzeForeheadShape,
  "jawline-shape": analyzeJawlineShape,
  "face-symmetry": analyzeSymmetry,
  "eye-distance": analyzeEyeDistance,
  "golden-ratio": analyzeGoldenRatio,
  "canthal-tilt": analyzeCanthalTilt,
  "facial-proportions": analyzeFacialProportions,
  attractiveness: analyzeAttractiveness,
  "face-rating": analyzeFaceRating,
} satisfies Record<string, Geometry>;

const color = {
  "skin-tone": analyzeSkinTone,
  concealer: analyzeConcealer,
  lipstick: analyzeLipstick,
  blush: analyzeBlush,
  eyeshadow: analyzeEyeshadow,
} satisfies Record<string, Color>;

export type LandmarkToolId =
  | keyof typeof geometry
  | keyof typeof color
  | "face-analyzer";

/** Photo → MediaPipe landmarks → one (or, for the face analyzer, many) results. */
export function LandmarkTool({ tool }: { tool: LandmarkToolId }) {
  const [results, setResults] = React.useState<AnalysisResult[] | null>(null);

  const handleAnalyze = (
    landmarks: NormalizedLandmark[],
    imageData: ImageData,
    width: number,
    height: number,
  ) => {
    if (tool === "face-analyzer") {
      setResults(analyzeFullFace(landmarks, imageData, width, height));
    } else if (tool in color) {
      const fn = color[tool as keyof typeof color];
      setResults([fn(landmarks, imageData, width, height)]);
    } else {
      const fn = geometry[tool as keyof typeof geometry];
      setResults([fn(landmarks, width, height)]);
    }
  };

  return (
    <FaceAnalyzer onAnalyze={handleAnalyze}>
      {results?.length === 1 ? <ResultCard result={results[0]} /> : null}
      {results && results.length > 1 ? (
        <div className="mt-8 space-y-8">
          <ResultCard result={results[0]} />
          <div className="grid gap-6 lg:grid-cols-2">
            {results.slice(1).map((r) => (
              <div key={r.eyebrow} className="rounded-3xl border p-4">
                <ResultCard result={r} compact />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </FaceAnalyzer>
  );
}
