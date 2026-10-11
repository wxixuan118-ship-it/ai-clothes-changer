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
      title="Find your perfect foundation shade"
      description="Upload a selfie and our AI will analyze your skin tone and undertone to find your perfect foundation match from top brands."
      badges={[
        "100% free",
        "Runs in your browser",
        "Photo stays private",
      ]}
      onAnalyze={handleAnalyze}
    >
      {result ? <FoundationResultCard result={result} /> : null}
    </FaceAnalyzer>
  );
}
