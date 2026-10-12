import { faceShapeInfo, type FaceShape } from "@/lib/face/face-shape-info";

import { ranked, type QuizDef } from "./quiz";

const keys = ["oval", "round", "square", "heart", "diamond", "oblong", "triangle"] as const satisfies readonly FaceShape[];

export const faceShapeQuiz: QuizDef<FaceShape> = {
  keys,
  questions: [
    {
      q: "Compared with its width, how long is your face?",
      hint: "Look straight into a mirror with your hair pulled back.",
      options: [
        { label: "Noticeably longer than it is wide", scores: { oblong: 2, oval: 1, diamond: 1 } },
        { label: "A little longer than it is wide", scores: { oval: 2, heart: 1, triangle: 1 } },
        { label: "About as long as it is wide", scores: { round: 2, square: 2 } },
      ],
    },
    {
      q: "Where is your face widest?",
      options: [
        { label: "Forehead", scores: { heart: 2 } },
        { label: "Cheekbones", scores: { diamond: 2, oval: 1, round: 1 } },
        { label: "Jaw", scores: { triangle: 2 } },
        { label: "About the same all the way down", scores: { square: 1, oblong: 2 } },
      ],
    },
    {
      q: "How would you describe your forehead?",
      options: [
        { label: "Wide — wider than my jaw", scores: { heart: 2, oval: 1 } },
        { label: "Narrow — narrower than my cheekbones", scores: { diamond: 2, triangle: 1 } },
        { label: "Similar width to my jaw", scores: { square: 1, oblong: 1, round: 1 } },
      ],
    },
    {
      q: "Which best describes your cheekbones?",
      options: [
        { label: "High and sharp, the widest point", scores: { diamond: 2, heart: 1 } },
        { label: "Full and rounded", scores: { round: 2 } },
        { label: "Not very prominent", scores: { oblong: 1, square: 1, triangle: 1 } },
        { label: "Softly defined", scores: { oval: 2 } },
      ],
    },
    {
      q: "What does your jawline look like?",
      options: [
        { label: "Sharp and angular, strong corners", scores: { square: 2, triangle: 1, oblong: 1 } },
        { label: "Soft and rounded", scores: { round: 2, oval: 1 } },
        { label: "Narrow, tapering to the chin", scores: { heart: 2, diamond: 1 } },
        { label: "Wide, wider than my forehead", scores: { triangle: 2 } },
      ],
    },
    {
      q: "How would you describe your chin?",
      options: [
        { label: "Pointed", scores: { heart: 2, diamond: 2 } },
        { label: "Rounded", scores: { round: 2, oval: 2 } },
        { label: "Square or flat", scores: { square: 2, triangle: 1, oblong: 1 } },
      ],
    },
    {
      q: "Which side profile of your face outline is closest?",
      hint: "Imagine tracing your face outline in the mirror.",
      options: [
        { label: "An egg — gently tapered", scores: { oval: 2 } },
        { label: "A circle", scores: { round: 2 } },
        { label: "A square or rectangle", scores: { square: 2, oblong: 2 } },
        { label: "An upside-down triangle", scores: { heart: 2 } },
        { label: "A diamond", scores: { diamond: 2 } },
        { label: "A pear — wider at the bottom", scores: { triangle: 2 } },
      ],
    },
  ],
  resolve: (totals) => {
    const order = ranked(keys, totals);
    const [first, second] = order;
    const info = faceShapeInfo[first];
    const max = 14;
    return {
      eyebrow: "Your face shape",
      title: info.label,
      summary: info.description,
      tags:
        totals[second] >= totals[first] - 1
          ? [`Close second: ${faceShapeInfo[second].label}`]
          : [],
      metrics: order.slice(0, 3).map((k) => ({
        label: faceShapeInfo[k].label,
        value: `${Math.round((totals[k] / max) * 100)}%`,
        score: Math.round((totals[k] / max) * 100),
      })),
      sections: [
        { title: "Haircuts that suit you", items: info.hairstyles },
        { title: "Glasses frames", items: info.glasses },
      ],
      links: [
        { href: "/face-shape-detector", label: "Confirm it with a photo" },
        { href: "/hairstyles-for-face-shape", label: "Hairstyles for your face shape" },
      ],
    };
  },
};
