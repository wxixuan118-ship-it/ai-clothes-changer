"use client";

import type { NormalizedLandmark } from "./mediapipe";

// Skin tone levels (Fitzpatrick-inspired, 6 levels)
export type SkinToneLevel = "fair" | "light" | "light-medium" | "medium" | "tan" | "deep";

// Undertone types
export type Undertone = "warm" | "cool" | "neutral" | "olive";

export interface FoundationShadeResult {
  skinTone: SkinToneLevel;
  skinToneLabel: string;
  undertone: Undertone;
  undertoneLabel: string;
  skinColor: { hex: string; r: number; g: number; b: number; l: number; a: number; b_lab: number };
  ita: number; // Individual Typology Angle
  recommendations: FoundationShade[];
  description: string;
}

export interface FoundationShade {
  brand: string;
  product: string;
  shade: string;
  hex: string;
  deltaE: number;
}

// Foundation shade database (curated selection of popular brands)
// Lab values approximate, based on publicly available shade data
const foundationDatabase: FoundationShade[] = [
  // Fenty Beauty Pro Filt'r
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "110", hex: "#F5D6BA", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "140", hex: "#EBC49A", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "170", hex: "#D9A878", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "210", hex: "#C48B5E", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "260", hex: "#A9704A", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "330", hex: "#8B5536", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "410", hex: "#6D3F28", deltaE: 0 },
  { brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "498", hex: "#4A281A", deltaE: 0 },

  // MAC Studio Fix
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NC15", hex: "#F5DCC0", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NW20", hex: "#EAC9A8", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NC25", hex: "#E0B88A", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NW30", hex: "#D19E6D", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NC35", hex: "#BF8756", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NW40", hex: "#A06940", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NC45", hex: "#7F502E", deltaE: 0 },
  { brand: "MAC", product: "Studio Fix Fluid", shade: "NW50", hex: "#5C3A20", deltaE: 0 },

  // NARS Soft Matte Complete
  { brand: "NARS", product: "Soft Matte Complete", shade: "Gobi", hex: "#F2D5B5", deltaE: 0 },
  { brand: "NARS", product: "Soft Matte Complete", shade: "Deauville", hex: "#E5BE95", deltaE: 0 },
  { brand: "NARS", product: "Soft Matte Complete", shade: "Punjab", hex: "#D2A373", deltaE: 0 },
  { brand: "NARS", product: "Soft Matte Complete", shade: "Aruba", hex: "#B4804F", deltaE: 0 },
  { brand: "NARS", product: "Soft Matte Complete", shade: "Bora Bora", hex: "#8C5C34", deltaE: 0 },
  { brand: "NARS", product: "Soft Matte Complete", shade: "Zambia", hex: "#5F3E22", deltaE: 0 },

  // Estée Lauder Double Wear
  { brand: "Estée Lauder", product: "Double Wear", shade: "1N1 Ivory Nude", hex: "#F6DDC2", deltaE: 0 },
  { brand: "Estée Lauder", product: "Double Wear", shade: "2N1 Desert Beige", hex: "#EBC69F", deltaE: 0 },
  { brand: "Estée Lauder", product: "Double Wear", shade: "3N1 Ivory Beige", hex: "#D6A97B", deltaE: 0 },
  { brand: "Estée Lauder", product: "Double Wear", shade: "4N1 Shell Beige", hex: "#B98957", deltaE: 0 },
  { brand: "Estée Lauder", product: "Double Wear", shade: "5N1 Amber Honey", hex: "#8C5F34", deltaE: 0 },
  { brand: "Estée Lauder", product: "Double Wear", shade: "6N1 Truffle", hex: "#5E3D22", deltaE: 0 },

  // Maybelline Fit Me
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "110 Porcelain", hex: "#F8E0C7", deltaE: 0 },
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "120 Classic Ivory", hex: "#EFD0AD", deltaE: 0 },
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "220 Natural Beige", hex: "#D8AE7E", deltaE: 0 },
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "310 Sun Beige", hex: "#BA8A55", deltaE: 0 },
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "355 Coconut", hex: "#8B5A32", deltaE: 0 },
  { brand: "Maybelline", product: "Fit Me Matte + Poreless", shade: "360 Mocha", hex: "#5E3B20", deltaE: 0 },
];

export const skinToneLabels: Record<SkinToneLevel, string> = {
  fair: "Fair",
  light: "Light",
  "light-medium": "Light Medium",
  medium: "Medium",
  tan: "Tan / Deep Medium",
  deep: "Deep",
};

export const undertoneLabels: Record<Undertone, string> = {
  warm: "Warm",
  cool: "Cool",
  neutral: "Neutral",
  olive: "Olive",
};

// Sample skin from face landmarks (forehead, cheeks, chin - avoiding eyes, nose, mouth)
export function extractSkinColor(
  imageData: ImageData,
  landmarks: NormalizedLandmark[],
  imageWidth: number,
  imageHeight: number,
): { r: number; g: number; b: number } {
  const samplePoints = getSkinSamplePoints(landmarks);
  const pixels: { r: number; g: number; b: number }[] = [];

  for (const point of samplePoints) {
    const px = Math.floor(point.x * imageWidth);
    const py = Math.floor(point.y * imageHeight);

    // Sample a small 5x5 area around each point
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const x = px + dx;
        const y = py + dy;
        if (x < 0 || x >= imageWidth || y < 0 || y >= imageHeight) continue;

        const idx = (y * imageWidth + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];

        if (a < 128) continue; // Skip transparent pixels

        // Basic skin detection in RGB space (quick filter)
        if (isSkinPixel(r, g, b)) {
          pixels.push({ r, g, b });
        }
      }
    }
  }

  if (pixels.length === 0) {
    // Fallback: return average of all face pixels
    return { r: 200, g: 160, b: 130 };
  }

  // Remove outliers (brightest and darkest 10%)
  pixels.sort((a, b) => (a.r + a.g + a.b) / 3 - (b.r + b.g + b.b) / 3);
  const trimCount = Math.floor(pixels.length * 0.1);
  const trimmed = pixels.slice(trimCount, pixels.length - trimCount);

  // Calculate median
  const mid = Math.floor(trimmed.length / 2);
  const sortedR = [...trimmed].sort((a, b) => a.r - b.r);
  const sortedG = [...trimmed].sort((a, b) => a.g - b.g);
  const sortedB = [...trimmed].sort((a, b) => a.b - b.b);

  return {
    r: Math.round(sortedR[mid].r),
    g: Math.round(sortedG[mid].g),
    b: Math.round(sortedB[mid].b),
  };
}

function getSkinSamplePoints(
  landmarks: NormalizedLandmark[],
): { x: number; y: number }[] {
  // Sample from forehead, left cheek, right cheek, and chin
  // Using MediaPipe landmark indices for skin-safe areas

  const points: { x: number; y: number }[] = [];

  // Forehead - multiple points across
  const foreheadPoints = [10, 67, 297, 109, 338];
  for (const idx of foreheadPoints) {
    const lm = landmarks[idx];
    points.push({ x: lm.x, y: lm.y });
  }

  // Left cheek (avoid nose and eye area)
  const leftCheekPoints = [117, 118, 119, 100, 101];
  for (const idx of leftCheekPoints) {
    const lm = landmarks[idx];
    points.push({ x: lm.x, y: lm.y });
  }

  // Right cheek
  const rightCheekPoints = [346, 347, 348, 329, 330];
  for (const idx of rightCheekPoints) {
    const lm = landmarks[idx];
    points.push({ x: lm.x, y: lm.y });
  }

  // Chin area
  const chinPoints = [152, 148, 377, 176, 400];
  for (const idx of chinPoints) {
    const lm = landmarks[idx];
    points.push({ x: lm.x, y: lm.y });
  }

  return points;
}

export function isSkinPixel(r: number, g: number, b: number): boolean {
  // RGB-based skin detection (simplified)
  // More robust methods use HSV/YCrCb, but RGB is fine for initial filtering
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    r > g &&
    r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 20
  );
}

// RGB to CIELAB conversion
export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  // sRGB to XYZ
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  const x = rn * 0.4124564 + gn * 0.3575761 + bn * 0.1804375;
  const y = rn * 0.2126729 + gn * 0.7151522 + bn * 0.072175;
  const z = rn * 0.0193339 + gn * 0.119192 + bn * 0.9503041;

  // XYZ to Lab (D65 reference white)
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;

  const fx = x / xn;
  const fy = y / yn;
  const fz = z / zn;

  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  const fx2 = fx > epsilon ? Math.cbrt(fx) : (kappa * fx + 16) / 116;
  const fy2 = fy > epsilon ? Math.cbrt(fy) : (kappa * fy + 16) / 116;
  const fz2 = fz > epsilon ? Math.cbrt(fz) : (kappa * fz + 16) / 116;

  return {
    l: 116 * fy2 - 16,
    a: 500 * (fx2 - fy2),
    b: 200 * (fy2 - fz2),
  };
}

// CIEDE2000 color difference
export function ciede2000(
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number },
): number {
  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));

  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

  let h1Prime = Math.atan2(b1, a1Prime);
  if (h1Prime < 0) h1Prime += 2 * Math.PI;
  let h2Prime = Math.atan2(b2, a2Prime);
  if (h2Prime < 0) h2Prime += 2 * Math.PI;

  const deltaLPrime = L2 - L1;
  const deltaCPrime = C2Prime - C1Prime;

  let deltahPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    deltahPrime = h2Prime - h1Prime;
    if (Math.abs(deltahPrime) > Math.PI) {
      if (deltahPrime > Math.PI) {
        deltahPrime -= 2 * Math.PI;
      } else {
        deltahPrime += 2 * Math.PI;
      }
    }
  }

  const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin(deltahPrime / 2);

  const LbarPrime = (L1 + L2) / 2;
  const CbarPrime2 = (C1Prime + C2Prime) / 2;

  let hbarPrime = (h1Prime + h2Prime) / 2;
  if (C1Prime * C2Prime !== 0) {
    if (Math.abs(h1Prime - h2Prime) > Math.PI) {
      if (h1Prime + h2Prime < 2 * Math.PI) {
        hbarPrime += Math.PI;
      } else {
        hbarPrime -= Math.PI;
      }
    }
  }

  const T =
    1 -
    0.17 * Math.cos(hbarPrime - Math.PI / 6) +
    0.24 * Math.cos(2 * hbarPrime) +
    0.32 * Math.cos(3 * hbarPrime + Math.PI / 30) -
    0.2 * Math.cos(4 * hbarPrime - (63 * Math.PI) / 180);

  const deltaTheta = (30 * Math.PI) / 180 * Math.exp(-Math.pow(((hbarPrime - (275 * Math.PI) / 180) / ((25 * Math.PI) / 180)), 2));

  const RC = 2 * Math.sqrt(Math.pow(CbarPrime2, 7) / (Math.pow(CbarPrime2, 7) + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(LbarPrime - 50, 2)) / Math.sqrt(20 + Math.pow(LbarPrime - 50, 2));
  const SC = 1 + 0.045 * CbarPrime2;
  const SH = 1 + 0.015 * CbarPrime2 * T;

  const RT = -Math.sin(2 * deltaTheta) * RC;

  const dE = Math.sqrt(
    Math.pow(deltaLPrime / SL, 2) +
      Math.pow(deltaCPrime / SC, 2) +
      Math.pow(deltaHPrime / SH, 2) +
      RT * (deltaCPrime / SC) * (deltaHPrime / SH),
  );

  return dE;
}

// Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Calculate ITA (Individual Typology Angle)
export function calculateITA(l: number, b: number): number {
  return (Math.atan2(l - 50, b) * 180) / Math.PI;
}

// Classify skin tone from ITA
export function classifySkinTone(ita: number): SkinToneLevel {
  if (ita > 55) return "fair";
  if (ita > 41) return "light";
  if (ita > 28) return "light-medium";
  if (ita > 14) return "medium";
  if (ita > 0) return "tan";
  return "deep";
}

// Classify undertone from a* and b* values
export function classifyUndertone(lab: { l: number; a: number; b: number }): Undertone {
  const { a, b } = lab;

  // Olive undertone: relatively low a*, moderate b*, and specific a/b ratio
  if (a < 5 && b > 10 && b < 20 && b / Math.max(a, 0.1) > 3) {
    return "olive";
  }

  // Warm: higher b* (yellow)
  // Cool: lower b*, possibly higher a* (reddish)
  // Neutral: balanced a* and b*

  if (b > 15) {
    if (a > 10) return "warm";
    return "warm";
  }

  if (b < 8) {
    return "cool";
  }

  // Neutral range
  if (a >= 4 && a <= 10 && b >= 8 && b <= 15) {
    return "neutral";
  }

  if (a > 10) return "cool";
  return "warm";
}

function generateDescription(
  tone: SkinToneLevel,
  undertone: Undertone,
): string {
  const toneDesc: Record<SkinToneLevel, string> = {
    fair: "very fair skin that burns easily and rarely tans",
    light: "light skin that burns occasionally and tans gradually",
    "light-medium": "light to medium skin that tans well with occasional burning",
    medium: "medium skin that tans easily and rarely burns",
    tan: "tan to deep medium skin that tans very easily",
    deep: "deep skin that tans easily and rarely burns",
  };

  const undertoneDesc: Record<Undertone, string> = {
    warm: "golden, yellow, or peachy undertones",
    cool: "pink, red, or bluish undertones",
    neutral: "a balanced mix of warm and cool undertones",
    olive: "subtle greenish or olive undertones with warm golden hints",
  };

  return `You have ${toneDesc[tone]} with ${undertoneDesc[undertone]}.`;
}

export function analyzeFoundationShade(
  imageData: ImageData,
  landmarks: NormalizedLandmark[],
  imageWidth: number,
  imageHeight: number,
): FoundationShadeResult {
  // Extract average skin color
  const skinColor = extractSkinColor(imageData, landmarks, imageWidth, imageHeight);

  // Convert to CIELAB
  const lab = rgbToLab(skinColor.r, skinColor.g, skinColor.b);

  // Calculate ITA
  const ita = calculateITA(lab.l, lab.b);

  // Classify
  const skinTone = classifySkinTone(ita);
  const undertone = classifyUndertone(lab);

  // Find matching foundation shades
  const withDeltaE = foundationDatabase.map((shade) => {
    const shadeRgb = hexToRgb(shade.hex);
    const shadeLab = rgbToLab(shadeRgb.r, shadeRgb.g, shadeRgb.b);
    const deltaE = ciede2000(lab, shadeLab);
    return { ...shade, deltaE };
  });

  // Sort by deltaE and take top 6
  withDeltaE.sort((a, b) => a.deltaE - b.deltaE);
  const recommendations = withDeltaE.slice(0, 6);

  return {
    skinTone,
    skinToneLabel: skinToneLabels[skinTone],
    undertone,
    undertoneLabel: undertoneLabels[undertone],
    skinColor: {
      hex: rgbToHex(skinColor.r, skinColor.g, skinColor.b),
      r: skinColor.r,
      g: skinColor.g,
      b: skinColor.b,
      l: lab.l,
      a: lab.a,
      b_lab: lab.b,
    },
    ita,
    recommendations,
    description: generateDescription(skinTone, undertone),
  };
}
