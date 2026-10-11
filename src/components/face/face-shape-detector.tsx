"use client";

import * as React from "react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import { FaceShapeResultCard } from "@/components/face/face-shape-result";
import { detectFaceShape, type FaceShapeResult } from "@/lib/face/face-shape";
import type { NormalizedLandmark } from "@/lib/face/mediapipe";

export function FaceShapeDetector() {
  const [result, setResult] = React.useState<FaceShapeResult | null>(null);

  const handleAnalyze = (landmarks: NormalizedLandmark[]) => {
    const shapeResult = detectFaceShape(landmarks);
    setResult(shapeResult);
  };

  return (
    <FaceAnalyzer
      onAnalyze={handleAnalyze}
    >
      {result ? <FaceShapeResultCard result={result} /> : null}
    </FaceAnalyzer>
  );
}
