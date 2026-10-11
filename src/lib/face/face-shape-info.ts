// Face shape copy shared by the in-browser detector and the server-rendered
// landing pages (kept out of the "use client" module so both can read it).

export type FaceShape =
  | "oval"
  | "round"
  | "square"
  | "heart"
  | "diamond"
  | "oblong"
  | "triangle";

export const faceShapeInfo: Record<
  FaceShape,
  { label: string; description: string; hairstyles: string[]; glasses: string[] }
> = {
  oval: {
    label: "Oval",
    description:
      "Oval faces are longer than they are wide, with a gently rounded jawline. Considered the most versatile face shape — most hairstyles and glasses look great on you.",
    hairstyles: [
      "Layered cuts",
      "Beach waves",
      "Long bob (lob)",
      "Bangs (side-swept or blunt)",
      "Pixie cut",
      "Sleek ponytail",
    ],
    glasses: [
      "Wayfarer frames",
      "Cat-eye glasses",
      "Rectangular frames",
      "Browline glasses",
    ],
  },
  round: {
    label: "Round",
    description:
      "Round faces have soft, curved angles with width and length roughly equal. The goal is to add length and definition to elongate the face.",
    hairstyles: [
      "Long layers",
      "Side part",
      "Angled bob",
      "Pixie with volume on top",
      "High ponytail",
      "Asymmetrical cuts",
    ],
    glasses: [
      "Rectangular frames",
      "Wayfarer frames",
      "Cat-eye glasses",
      "Angular geometric frames",
    ],
  },
  square: {
    label: "Square",
    description:
      "Square faces have a strong, angular jawline with similar width across the forehead, cheekbones, and jaw. Softening the angles is usually the goal.",
    hairstyles: [
      "Soft layers",
      "Side-swept bangs",
      "Long waves",
      "Curly / textured styles",
      "A-line bob",
      "Shag haircut",
    ],
    glasses: [
      "Round frames",
      "Oval frames",
      "Cat-eye glasses",
      "Aviator style",
    ],
  },
  heart: {
    label: "Heart",
    description:
      "Heart-shaped faces have a wide forehead and cheekbones that taper to a narrow, pointed chin. Balancing the width of the forehead with the narrow chin is key.",
    hairstyles: [
      "Chin-length bob",
      "Side part with waves",
      "Long layers starting below the chin",
      "Curtain bangs",
      "Low ponytail / bun",
      "Wispy bangs",
    ],
    glasses: [
      "Round frames",
      "Oval frames",
      "Rimless glasses",
      "Lightweight bottom-heavy frames",
    ],
  },
  diamond: {
    label: "Diamond",
    description:
      "Diamond faces have narrow forehead and jawlines with wide cheekbones — the rarest face shape. The goal is to soften the cheekbones and balance the narrow chin.",
    hairstyles: [
      "Shoulder-length layers",
      "Side-swept bangs",
      "Curly / voluminous styles",
      "Bob with fullness at the jawline",
      "Low buns and updos",
      "Long layers face-framing",
    ],
    glasses: [
      "Oval frames",
      "Cat-eye glasses",
      "Rimless frames",
      "Browline glasses",
    ],
  },
  oblong: {
    label: "Oblong",
    description:
      "Oblong (rectangle) faces are significantly longer than they are wide, with a long straight cheek line. Adding width and shortening the face visually creates balance.",
    hairstyles: [
      "Chin-length bob",
      "Blunt bangs",
      "Wide curls / waves",
      "Layered shoulder-length",
      "Half-up styles",
      "Side parts with volume on sides",
    ],
    glasses: [
      "Round frames",
      "Oversized square frames",
      "Wide rectangular frames",
      "Low-bridge frames",
    ],
  },
  triangle: {
    label: "Triangle",
    description:
      "Triangle (pear-shaped) faces have a narrow forehead that widens through the cheeks and jaw. Adding width to the forehead balances the stronger jawline.",
    hairstyles: [
      "Side-swept bangs",
      "Layers with volume at the temples",
      "Pixie cut",
      "Long layers below the chin",
      "Curtain bangs",
      "Half-up styles with height",
    ],
    glasses: [
      "Cat-eye glasses",
      "Browline frames",
      "Wayfarer style",
      "Semi-rimless top-heavy frames",
    ],
  },
};
