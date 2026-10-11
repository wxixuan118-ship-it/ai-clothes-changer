"use client";

import * as React from "react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import { FoundationResultCard } from "@/components/face/foundation-result";
import { analyzeFoundationShade, type FoundationShadeResult } from "@/lib/face/foundation-shade";
import type { NormalizedLandmark } from "@/lib/face/mediapipe";

export function FoundationShadeFinder() {
  const [result, setResult] = React.useState<FoundationShadeResult | null>(null);

  const handleAnalyze = (
    landmarks: NormalizedLandmark[],
    imageData: ImageData,
    width: number,
    height: number,
  ) => {
    const shadeResult = analyzeFoundationShade(imageData, landmarks, width, height);
    setResult(shadeResult);
  };

  return (
    <FaceAnalyzer
      onAnalyze={handleAnalyze}
    >
      {result ? <FoundationResultCard result={result} /> : null}
    </FaceAnalyzer>
  );
}
