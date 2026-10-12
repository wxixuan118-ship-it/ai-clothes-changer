// Pixel-space geometry over MediaPipe's 478 face landmarks. Every analyzer
// works on a "level" face: landmarks scaled to pixels (normalized x and y
// use different scales on non-square photos) and rotated so the eyes sit on
// a horizontal line, which removes head roll from angles and heights.

export type Pt = { x: number; y: number; z: number };

type RawLandmark = { x: number; y: number; z: number };

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

/** Angle at `vertex` between rays to `a` and `b`, in degrees (0–180). */
export function angleAt(a: Pt, vertex: Pt, b: Pt): number {
  const v1x = a.x - vertex.x;
  const v1y = a.y - vertex.y;
  const v2x = b.x - vertex.x;
  const v2y = b.y - vertex.y;
  const cos =
    (v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Signed elevation of `to` above `from` in degrees; up is positive. */
export function riseDeg(from: Pt, to: Pt): number {
  return (Math.atan2(from.y - to.y, Math.abs(to.x - from.x)) * 180) / Math.PI;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

// Landmark indices used across analyzers. "R" is the subject's right side,
// which sits on the left of a non-mirrored photo.
export const LM = {
  foreheadTop: 10,
  glabella: 9,
  nasion: 168,
  noseTip: 1,
  subnasale: 2,
  upperLipTop: 0,
  upperLipInner: 13,
  lowerLipInner: 14,
  lowerLipBottom: 17,
  chin: 152,
  mouthR: 61,
  mouthL: 291,
  eyeOuterR: 33,
  eyeInnerR: 133,
  eyeTopR: 159,
  eyeBottomR: 145,
  eyeOuterL: 263,
  eyeInnerL: 362,
  eyeTopL: 386,
  eyeBottomL: 374,
  irisR: 468,
  irisL: 473,
  cheekR: 234,
  cheekL: 454,
  jawR: 172,
  jawL: 397,
  alarR: 64,
  alarL: 294,
} as const;

export type LevelFace = {
  p: Pt[];
  /** Head roll that was removed, degrees. */
  roll: number;
  /** Left/right head turn estimate; |yaw| above ~0.12 skews measurements. */
  yaw: number;
  faceWidth: number;
};

export function levelFace(
  landmarks: RawLandmark[],
  width: number,
  height: number,
): LevelFace {
  const raw = landmarks.map((l) => ({
    x: l.x * width,
    y: l.y * height,
    z: l.z * width,
  }));
  const eyeR = mid(raw[LM.eyeOuterR], raw[LM.eyeInnerR]);
  const eyeL = mid(raw[LM.eyeOuterL], raw[LM.eyeInnerL]);
  const angle = Math.atan2(eyeL.y - eyeR.y, eyeL.x - eyeR.x);
  const center = mid(eyeR, eyeL);
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const p = raw.map((q) => {
    const dx = q.x - center.x;
    const dy = q.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
      z: q.z,
    };
  });
  const faceWidth = dist(p[LM.cheekR], p[LM.cheekL]);
  const faceMidX = (p[LM.cheekR].x + p[LM.cheekL].x) / 2;
  const yaw = (p[LM.noseTip].x - faceMidX) / (faceWidth / 2);
  return { p, roll: (angle * 180) / Math.PI, yaw, faceWidth };
}

export function yawWarning(face: LevelFace): string[] {
  return Math.abs(face.yaw) > 0.12
    ? [
        "Your head looks turned to one side. Retake the photo facing the camera straight on for a more accurate reading.",
      ]
    : [];
}
