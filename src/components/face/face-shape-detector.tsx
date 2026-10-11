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
      title="What shape is your face?"
      description="Upload a selfie and our AI will analyze your facial proportions to find your face shape — plus the best hairstyles and glasses for you."
      badges={[
        "100% free",
        "Runs in your browser",
        "Photo stays private",
      ]}
      onAnalyze={handleAnalyze}
    >
      {result ? <FaceShapeResultCard result={result} /> : null}
    </FaceAnalyzer>
  );
}
