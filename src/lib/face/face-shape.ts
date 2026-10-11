"use client";

import type { NormalizedLandmark } from "./mediapipe";

import { faceShapeInfo, type FaceShape } from "./face-shape-info";

export type { FaceShape };

export interface FaceShapeResult {
  shape: FaceShape;
  shapeLabel: string;
  confidence: number;
  measurements: {
    faceLength: number;
    foreheadWidth: number;
    cheekboneWidth: number;
    jawWidth: number;
    lengthToWidthRatio: number;
    foreheadToCheekRatio: number;
    jawToCheekRatio: number;
  };
  description: string;
  hairstyles: string[];
  glasses: string[];
}


// Key landmark indices for face shape analysis (MediaPipe 478 landmarks)
// Forehead: top center (10), left/right temporal (103, 332)
// Cheekbones: left/right zygomatic arch (111, 340)
// Jaw: left/right jaw angle (136, 365), chin bottom (152)
// Face length: forehead top (10) to chin bottom (152)

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function detectFaceShape(
  landmarks: NormalizedLandmark[],
): FaceShapeResult {
  // Key points
  const foreheadTop = landmarks[10];
  const chinBottom = landmarks[152];
  const foreheadLeft = landmarks[103];
  const foreheadRight = landmarks[332];
  const cheekLeft = landmarks[111];
  const cheekRight = landmarks[340];
  const jawLeft = landmarks[136];
  const jawRight = landmarks[365];

  // Measurements (normalized, but we use ratios so scale doesn't matter)
  const faceLength = dist(foreheadTop, chinBottom);
  const foreheadWidth = dist(foreheadLeft, foreheadRight);
  const cheekboneWidth = dist(cheekLeft, cheekRight);
  const jawWidth = dist(jawLeft, jawRight);

  const lengthToWidthRatio = faceLength / cheekboneWidth;
  const foreheadToCheekRatio = foreheadWidth / cheekboneWidth;
  const jawToCheekRatio = jawWidth / cheekboneWidth;

  // Determine jaw angle by looking at the jaw curve points
  // Points along jaw: left jaw (136) → chin (152) → right jaw (365)
  const jawAngle = calculateJawAngle(landmarks);

  const shape = classifyFaceShape({
    lengthToWidthRatio,
    foreheadToCheekRatio,
    jawToCheekRatio,
    jawAngle,
  });

  const info = faceShapeInfo[shape];

  // Simple confidence based on how well the ratios fit the classification
  const confidence = calculateConfidence(shape, {
    lengthToWidthRatio,
    foreheadToCheekRatio,
    jawToCheekRatio,
  });

  return {
    shape,
    shapeLabel: info.label,
    confidence,
    measurements: {
      faceLength,
      foreheadWidth,
      cheekboneWidth,
      jawWidth,
      lengthToWidthRatio,
      foreheadToCheekRatio,
      jawToCheekRatio,
    },
    description: info.description,
    hairstyles: info.hairstyles,
    glasses: info.glasses,
  };
}

function calculateJawAngle(landmarks: NormalizedLandmark[]): number {
  // Use jaw points to estimate how angular vs rounded the jaw is
  // Calculate the angle at the chin (152)
  const chin = landmarks[152];
  const leftJaw = landmarks[136];
  const rightJaw = landmarks[365];

  // Vectors from chin to jaw angles
  const v1 = { x: leftJaw.x - chin.x, y: leftJaw.y - chin.y };
  const v2 = { x: rightJaw.x - chin.x, y: rightJaw.y - chin.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const angleRad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
  return (angleRad * 180) / Math.PI;
}

interface FaceMetrics {
  lengthToWidthRatio: number;
  foreheadToCheekRatio: number;
  jawToCheekRatio: number;
  jawAngle: number;
}

function classifyFaceShape(metrics: FaceMetrics): FaceShape {
  const { lengthToWidthRatio, foreheadToCheekRatio, jawToCheekRatio, jawAngle } =
    metrics;

  // Decision tree for face shape classification
  // Based on standard face shape analysis methodology

  // Oblong: significantly longer than wide, with similar width throughout
  if (lengthToWidthRatio > 1.6 && jawToCheekRatio > 0.75 && foreheadToCheekRatio > 0.75) {
    return "oblong";
  }

  // Heart: wide forehead, narrow jaw
  if (foreheadToCheekRatio >= 0.9 && jawToCheekRatio < 0.75) {
    return "heart";
  }

  // Triangle: narrow forehead, wide jaw
  if (foreheadToCheekRatio < 0.8 && jawToCheekRatio >= 0.9) {
    return "triangle";
  }

  // Diamond: wide cheekbones, narrow forehead and jaw
  if (foreheadToCheekRatio < 0.85 && jawToCheekRatio < 0.85) {
    return "diamond";
  }

  // Round: length ≈ width, soft jaw
  if (lengthToWidthRatio < 1.25 && jawAngle > 70) {
    return "round";
  }

  // Square: length ≈ width, angular jaw
  if (lengthToWidthRatio < 1.35 && jawAngle <= 70 && jawToCheekRatio > 0.85) {
    return "square";
  }

  // Oval: longer than wide, balanced proportions (default / most common)
  return "oval";
}

function calculateConfidence(
  shape: FaceShape,
  metrics: {
    lengthToWidthRatio: number;
    foreheadToCheekRatio: number;
    jawToCheekRatio: number;
  },
): number {
  // Simplified confidence: how far from decision boundaries
  // Range: 0.55 - 0.95
  const { lengthToWidthRatio, jawToCheekRatio } = metrics;

  let score = 0.7;

  switch (shape) {
    case "oblong":
      score = 0.6 + Math.min(0.3, (lengthToWidthRatio - 1.6) * 2);
      break;
    case "round":
      score = 0.6 + Math.min(0.3, (1.25 - lengthToWidthRatio) * 2);
      break;
    case "heart":
      score = 0.6 + Math.min(0.3, (0.75 - jawToCheekRatio) * 2);
      break;
    case "square":
      score = 0.65;
      break;
    case "oval":
      score = 0.7;
      break;
    default:
      score = 0.65;
  }

  return Math.max(0.55, Math.min(0.95, score));
}
