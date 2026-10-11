import type { FaceShape } from "@/lib/face/face-shape-info";

// Hairstyle presets (ids in src/config/hairstyles.ts) recommended per face
// shape. Shared by the in-browser finder and the landing page.
export const faceShapeHairstyles: Record<FaceShape, { note: string; styles: { id: string; name: string }[] }> = {
  oval: { note: "Balanced proportions work with many lengths and textures.", styles: [{ id: "long-bob", name: "Long bob" }, { id: "beach-waves", name: "Beach waves" }, { id: "pixie-cut", name: "Pixie cut" }] },
  round: { note: "Height and face-framing layers can add definition.", styles: [{ id: "long-layers", name: "Long layers" }, { id: "asymmetric-bob", name: "Asymmetric bob" }, { id: "high-ponytail", name: "High ponytail" }] },
  square: { note: "Soft movement can complement an angular jawline.", styles: [{ id: "beach-waves", name: "Beach waves" }, { id: "side-swept-bangs", name: "Side-swept bangs" }, { id: "shag", name: "Shag" }] },
  heart: { note: "Volume near the jaw can balance a wider forehead.", styles: [{ id: "french-bob", name: "French bob" }, { id: "curtain-bangs", name: "Curtain bangs" }, { id: "long-layers", name: "Long layers" }] },
  diamond: { note: "Fringe and fullness near the jaw frame your cheekbones.", styles: [{ id: "side-swept-bangs", name: "Side-swept bangs" }, { id: "long-bob", name: "Long bob" }, { id: "loose-curls", name: "Loose curls" }] },
  oblong: { note: "Fringe and side volume can add visual width.", styles: [{ id: "blunt-bangs", name: "Blunt bangs" }, { id: "french-bob", name: "French bob" }, { id: "loose-curls", name: "Loose curls" }] },
  triangle: { note: "Volume near the temples can balance a wider jaw.", styles: [{ id: "curtain-bangs", name: "Curtain bangs" }, { id: "pixie-cut", name: "Pixie cut" }, { id: "long-layers", name: "Long layers" }] },
};
