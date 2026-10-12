"use client";

import * as React from "react";

import { FaceAnalyzer } from "@/components/face/face-analyzer";
import { ageResult } from "@/lib/face/age";
import { estimateAges } from "@/lib/face/age-model";
import type { AnalysisResult } from "@/lib/face/analysis-result";
import type { NormalizedLandmark } from "@/lib/face/mediapipe";

import { ResultCard } from "./result-card";

/** One selfie → estimated age. Loads the 14 MB age model on first use. */
export function AgeTool() {
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [error, setError] = React.useState(false);

  const handleAnalyze = (
    landmarks: NormalizedLandmark[],
    imageData: ImageData,
    width: number,
    height: number,
  ) => {
    setResult(null);
    setError(false);
    setProgress(0);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.putImageData(imageData, 0, 0);
    estimateAges(canvas, [landmarks], width, height, setProgress)
      .then(([estimate]) => setResult(ageResult(estimate)))
      .catch(() => setError(true))
      .finally(() => setProgress(null));
  };

  return (
    <FaceAnalyzer onAnalyze={handleAnalyze}>
      {progress !== null ? (
        <div className="mt-8 rounded-2xl border bg-[var(--paper-2)] p-6 text-center">
          <div className="sparkle-spinner mx-auto size-8" />
          <p className="mt-3 font-medium">
            {progress < 1
              ? `Loading the age model… ${Math.round(progress * 100)}%`
              : "Estimating your age…"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-ink)]">
            14 MB, downloaded once and kept in your browser cache.
          </p>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-8 text-center text-[var(--debit-text)]">
          The age model couldn&apos;t load. Check your connection and try again.
        </p>
      ) : null}
      {result ? <ResultCard result={result} /> : null}
    </FaceAnalyzer>
  );
}
