// A synthetic, perfectly symmetric front-facing face for tests. Only the
// landmarks the analyzers read are placed; the rest sit at the center.
// Coordinates are pixels on a 1000×1000 image, mirrored around x = 500.

import type { NormalizedLandmark } from "./mediapipe";

type P = [number, number, number?];

// Subject-right landmarks (image left) and their mirrored partners.
const pairs: [number, number, P][] = [
  [33, 263, [365, 380]],
  [133, 362, [455, 380]],
  [159, 386, [410, 365]],
  [145, 374, [410, 395]],
  [468, 473, [410, 380]],
  [469, 474, [420, 380]],
  [107, 336, [455, 325]],
  [66, 296, [435, 315]],
  [105, 334, [410, 310]],
  [63, 293, [385, 312]],
  [70, 300, [360, 325]],
  [55, 285, [455, 340]],
  [65, 295, [435, 332]],
  [52, 282, [410, 330]],
  [53, 283, [385, 332]],
  [46, 276, [360, 340]],
  [64, 294, [455, 545]],
  [48, 278, [465, 550]],
  [129, 358, [462, 520]],
  [61, 291, [440, 630]],
  [37, 267, [480, 598]],
  [40, 270, [455, 615]],
  [39, 269, [465, 608]],
  [82, 312, [480, 622]],
  [81, 311, [465, 622]],
  [84, 314, [470, 665]],
  [87, 317, [480, 638]],
  [181, 405, [465, 660]],
  [178, 402, [465, 640]],
  [234, 454, [300, 420]],
  [127, 356, [305, 380]],
  [93, 323, [305, 500]],
  [132, 361, [315, 560]],
  [58, 288, [330, 620]],
  [172, 397, [345, 660]],
  [136, 365, [365, 700]],
  [150, 379, [390, 735]],
  [149, 378, [420, 760]],
  [176, 400, [440, 775]],
  [148, 377, [470, 785]],
  [103, 332, [340, 280]],
  [67, 297, [380, 240]],
  [109, 338, [440, 210]],
  [54, 284, [320, 320]],
  [21, 251, [310, 360]],
];

const midline: [number, P][] = [
  [10, [500, 200]],
  [151, [500, 230]],
  [9, [500, 330]],
  [8, [500, 350]],
  [168, [500, 380, -20]],
  [6, [500, 410, -32]],
  [197, [500, 440, -44]],
  [195, [500, 470, -56]],
  [5, [500, 500, -68]],
  [4, [500, 530, -80]],
  [1, [500, 535, -78]],
  [2, [500, 560]],
  [0, [500, 600]],
  [13, [500, 625]],
  [14, [500, 635]],
  [17, [500, 670]],
  [18, [500, 690]],
  [200, [500, 710]],
  [199, [500, 730]],
  [175, [500, 760]],
  [152, [500, 790]],
];

export type Edit = Record<number, P>;

/** Normalized landmarks for a 1000×1000 image, with optional pixel edits. */
export function testFace(edit: Edit = {}): NormalizedLandmark[] {
  const px: P[] = Array.from({ length: 478 }, () => [500, 500, 0]);
  for (const [r, l, [x, y, z = 0]] of pairs) {
    px[r] = [x, y, z];
    px[l] = [1000 - x, y, z];
  }
  for (const [i, p] of midline) px[i] = p;
  for (const [i, p] of Object.entries(edit)) px[Number(i)] = p;
  return px.map(([x, y, z = 0]) => ({ x: x / 1000, y: y / 1000, z: z / 1000, visibility: 0 }));
}

/** Rotates every landmark around the image center (simulates head roll). */
export function rotateFace(face: NormalizedLandmark[], degrees: number): NormalizedLandmark[] {
  const a = (degrees * Math.PI) / 180;
  return face.map((l) => {
    const dx = l.x - 0.5;
    const dy = l.y - 0.5;
    return {
      ...l,
      x: 0.5 + dx * Math.cos(a) - dy * Math.sin(a),
      y: 0.5 + dx * Math.sin(a) + dy * Math.cos(a),
    };
  });
}
