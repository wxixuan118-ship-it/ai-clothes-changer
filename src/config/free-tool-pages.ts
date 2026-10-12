// Landing-page copy for the free tools rendered by FreeToolLanding. Each
// page targets one keyword: keep it in the title, H1, intro and H2s.

import type { ToolId } from "@/config/tools";
import type { FaqItem } from "@/components/site/blocks";
import { somatotypeInfo } from "@/lib/body-type";
import { faceShapeInfo } from "@/lib/face/face-shape-info";
import {
  browShapeInfo,
  eyeShapeInfo,
  foreheadShapeInfo,
  jawShapeInfo,
  lipShapeInfo,
  noseShapeInfo,
} from "@/lib/face/features";
import { seasonInfo } from "@/lib/style/color-season";
import { kibbeInfo } from "@/lib/style/kibbe";

export type Widget =
  | { kind: "landmark"; tool: string }
  | { kind: "quiz"; quiz: "face-shape" | "color-season" | "kibbe" }
  | { kind: "face-calc" }
  | { kind: "body-type" }
  | { kind: "blur" }
  | { kind: "none" };

export type FreeToolPage = {
  id: ToolId;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: [string, string];
  intro: string;
  widget: Widget;
  steps: { title: string; body: string }[];
  stepsTitle: string;
  /** Outbound reference shown under the steps heading on non-photo tools. */
  source?: { lead: string; label: string; href: string };
  types?: {
    title: string;
    sub: string;
    items: { title: string; body: string; swatches?: string[] }[];
  };
  extra?: { title: string; sub?: string; paragraphs: string[] };
  faqTitle: string;
  faqs: FaqItem[];
  cta: { title: string; sub: string; href: string; label: string };
};

const photoEyebrow = "100% free · No sign-up · Photo stays on your device";

const privacyFaqs: FaqItem[] = [
  {
    q: "Is it really free?",
    a: "Yes. No sign-up, no watermark and no usage limits. The analysis runs in your browser.",
  },
  {
    q: "Is my photo uploaded?",
    a: "No. Detection runs locally with Google's MediaPipe model, so your photo never leaves your device.",
  },
];

const photoTip: FaqItem = {
  q: "What photo works best?",
  a: "A straight-on photo at eye level, from arm's length or further, in soft daylight. Pull hair off your face, remove glasses and keep a neutral expression.",
};

function photoSteps(measure: string, result: string) {
  return [
    {
      title: "Upload a selfie",
      body: "Use a clear, front-facing photo or your camera. Face the lens straight on in even light.",
    },
    { title: "Landmarks are measured", body: measure },
    { title: "Get your result", body: result },
  ];
}

const hairCta = {
  title: "See a new look on your own photo",
  sub: "Preview any of 65 hairstyles on your selfie with the AI hairstyle changer.",
  href: "/#studio",
  label: "Try a hairstyle",
};

const infoItems = (map: Record<string, { label: string; description: string }>) =>
  Object.values(map).map((v) => ({ title: v.label, body: v.description }));

export const freeToolPages: FreeToolPage[] = [
  // ------------------------------------------------------------ face shape
  {
    id: "face-analyzer",
    metaTitle: "Face Analyzer: Free AI Facial Analysis Online | StyleMirror",
    metaDescription:
      "Free AI face analyzer: one selfie gives you face shape, eye, nose and lip shapes, symmetry, golden ratio, facial thirds and skin tone. No sign-up.",
    eyebrow: photoEyebrow,
    h1: ["Face analyzer:", "your full facial analysis"],
    intro:
      "Upload one selfie and the free face analyzer runs every reading at once — face shape, eye, brow, nose and lip shapes, jawline, symmetry, golden ratio, facial thirds and skin tone — in your browser.",
    widget: { kind: "landmark", tool: "face-analyzer" },
    stepsTitle: "How the face analyzer works",
    steps: photoSteps(
      "478 facial landmarks are mapped in your browser, then measured for shape, proportion and color.",
      "See an overall face rating plus a card for each feature, with styling tips.",
    ),
    extra: {
      title: "What the face analyzer checks",
      paragraphs: [
        "Shape: face shape, jawline, eye, eyebrow, nose and lip shapes. Proportion: symmetry, golden ratio, facial thirds, midface ratio and canthal tilt. Color: skin tone and undertone.",
        "Each reading links to a dedicated free tool with a deeper breakdown, so you can dig into whatever interests you most.",
      ],
    },
    faqTitle: "Face analyzer FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "How accurate is AI facial analysis?",
        a: "Landmark measurements are precise, but labels like 'almond eyes' or 'oval face' are styling categories with fuzzy borders. Treat the results as a guide and compare a few photos.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "face-shape-calculator",
    metaTitle: "Face Shape Calculator: Measure Your Face Shape | StyleMirror",
    metaDescription:
      "Free face shape calculator: enter forehead, cheekbone, jaw and face length measurements to calculate your face shape — no photo needed.",
    eyebrow: "Free · No photo needed · Cm or inches",
    h1: ["Face shape calculator:", "measure, don't guess"],
    intro:
      "No photo? Use this free face shape calculator. Enter four measurements from a soft tape and your chin shape, and it calculates your face shape with haircut and glasses tips.",
    widget: { kind: "face-calc" },
    stepsTitle: "How to use the face shape calculator",
    source: {
      lead: "Measurements follow standard",
      label: "facial anthropometry",
      href: "https://en.wikipedia.org/wiki/Anthropometry",
    },
    steps: [
      { title: "Grab a soft tape", body: "Stand in front of a mirror with your hair pulled back." },
      { title: "Take 4 measurements", body: "Forehead, cheekbones and jaw straight across, then hairline to chin." },
      { title: "Calculate your face shape", body: "The calculator compares the ratios to seven face shapes." },
    ],
    types: {
      title: "Face shapes the calculator can find",
      sub: "Seven shapes, defined by how length, forehead, cheekbones and jaw compare.",
      items: infoItems(faceShapeInfo),
    },
    faqTitle: "Face shape calculator FAQ",
    faqs: [
      {
        q: "Do I need a photo to calculate my face shape?",
        a: "No. The face shape calculator only needs four tape measurements and your chin shape. For a photo-based check, use the face shape detector.",
      },
      {
        q: "Which unit should I use?",
        a: "Either — the calculator compares ratios, so centimeters and inches give the same result as long as every measurement uses the same unit.",
      },
      {
        q: "What if I'm between two shapes?",
        a: "Many faces are. Look at the hairstyle tips for both and pick what you like — the advice overlaps a lot.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "face-shape-quiz",
    metaTitle: "Face Shape Quiz: What Face Shape Am I? | StyleMirror",
    metaDescription:
      "Take the free face shape quiz: answer 7 quick questions about your forehead, cheekbones, jawline and chin to find out what face shape you are.",
    eyebrow: "Free · 7 questions · Instant result",
    h1: ["Face shape quiz:", "what face shape am I?"],
    intro:
      "Answer seven quick questions in front of a mirror and this free face shape quiz tells you whether your face is oval, round, square, heart, diamond, oblong or triangle.",
    widget: { kind: "quiz", quiz: "face-shape" },
    stepsTitle: "How the face shape quiz works",
    source: {
      lead: "Questions are based on",
      label: "facial anthropometry",
      href: "https://en.wikipedia.org/wiki/Anthropometry",
    },
    steps: [
      { title: "Find a mirror", body: "Pull your hair back so you can see your hairline and jaw." },
      { title: "Answer 7 questions", body: "About length, forehead, cheekbones, jawline and chin." },
      { title: "Get your face shape", body: "With the closest runner-up and the haircuts that suit you." },
    ],
    types: {
      title: "Face shapes in the quiz",
      sub: "The quiz scores you against all seven common face shapes.",
      items: infoItems(faceShapeInfo),
    },
    faqTitle: "Face shape quiz FAQ",
    faqs: [
      {
        q: "How accurate is a face shape quiz?",
        a: "It's as good as your answers. For a measured result, try the face shape detector with a selfie or the calculator with a tape.",
      },
      {
        q: "Can my face shape change?",
        a: "Weight changes, aging and hairstyles change how your face shape reads, so retake the quiz every few years.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "forehead-shape",
    metaTitle: "Forehead Shape Detector: Find Your Forehead Type",
    metaDescription:
      "Free forehead shape detector: upload a selfie to find your forehead shape — broad, narrow, round, square or balanced — plus hairstyles that suit it.",
    eyebrow: photoEyebrow,
    h1: ["Forehead shape detector:", "find your forehead type"],
    intro:
      "Upload a selfie and the free forehead shape detector measures your forehead width, curve and height to find your forehead shape, with the fringes and partings that flatter it.",
    widget: { kind: "landmark", tool: "forehead-shape" },
    stepsTitle: "How the forehead shape detector works",
    steps: photoSteps(
      "Your forehead width is compared to your cheekbones, and the curve of the top contour is measured.",
      "See your forehead shape and height, with hairstyle tips.",
    ),
    types: {
      title: "Types of forehead shapes",
      sub: "The detector sorts foreheads by width and curve. Hairline shapes are covered below.",
      items: infoItems(foreheadShapeInfo),
    },
    extra: {
      title: "M-shaped forehead and widow's peak",
      paragraphs: [
        "An M-shaped forehead has a hairline that recedes at both temples, while a widow's peak dips to a V in the center. Both are hairline shapes rather than forehead bone shapes, so check them in a mirror with your hair pulled back.",
        "Textured fringes and side parts soften an M-shape; slicked-back or side-swept styles show off a widow's peak.",
      ],
    },
    faqTitle: "Forehead shape detector FAQ",
    faqs: [...privacyFaqs, photoTip],
    cta: hairCta,
  },
  {
    id: "jawline-shape",
    metaTitle: "Jawline Shape Detector: Find Your Jaw Type | StyleMirror",
    metaDescription:
      "Free jawline shape detector: upload a selfie to find out if your jawline is square, round, V-shaped, oval, rectangular or triangular — with styling tips.",
    eyebrow: photoEyebrow,
    h1: ["Jawline shape detector:", "square, round or V?"],
    intro:
      "Upload a selfie and the free jawline shape detector measures your jaw width, jaw corner angle and chin to find your jawline shape, plus haircuts and beard styles that suit it.",
    widget: { kind: "landmark", tool: "jawline-shape" },
    stepsTitle: "How the jawline shape detector works",
    steps: photoSteps(
      "Jaw width, chin width and the angle at each jaw corner are measured from the face outline.",
      "See your jawline shape, a jaw definition score and hair and beard tips.",
    ),
    types: {
      title: "Types of jawline shapes",
      sub: "Six jawline shapes, from sharp and square to soft and tapered.",
      items: infoItems(jawShapeInfo),
    },
    faqTitle: "Jawline shape detector FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Is the jaw angle my real gonial angle?",
        a: "No. A front photo shows a projected angle, not the true bone angle a side X-ray measures. It's useful for comparing jaw definition, not for clinical use.",
      },
    ],
    cta: hairCta,
  },
  // ------------------------------------------------------------ features
  {
    id: "eye-shape",
    metaTitle: "Eye Shape Detector: What Is My Eye Shape? | StyleMirror",
    metaDescription:
      "Free eye shape detector: upload a selfie to find your eye shape — almond, round, hooded, monolid, upturned or downturned — with eyeliner tips.",
    eyebrow: photoEyebrow,
    h1: ["Eye shape detector:", "what is my eye shape?"],
    intro:
      "Upload a selfie and the free eye shape detector measures how open your eyes are, the tilt of the outer corners, lid space and spacing to find your eye shape, with eyeliner and shadow tips.",
    widget: { kind: "landmark", tool: "eye-shape" },
    stepsTitle: "How the eye shape detector works",
    steps: photoSteps(
      "Eye width, height, corner tilt and the gap between lid and brow are measured on both eyes.",
      "See your eye shape, whether your eyes are close-set or wide-set, and makeup tips.",
    ),
    types: {
      title: "6 eye shapes the detector recognizes",
      sub: "Plus spacing: close-set, wide-set or balanced.",
      items: infoItems(eyeShapeInfo),
    },
    faqTitle: "Eye shape detector FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Can I have more than one eye shape?",
        a: "Yes. Many people have, for example, almond eyes that are slightly hooded. The detector shows your main shape and secondary traits as tags.",
      },
    ],
    cta: {
      title: "Found your eye shape? Find your shadow colors",
      sub: "The eyeshadow shade finder reads your eye color and picks shades that make it pop.",
      href: "/eyeshadow-shade-finder",
      label: "Find eyeshadow colors",
    },
  },
  {
    id: "eyebrow-shape",
    metaTitle: "Eyebrow Shape Detector: Find Your Brow Shape | StyleMirror",
    metaDescription:
      "Free eyebrow shape detector: upload a selfie to find your brow shape — straight, arched, rounded, upward or downward — and the best brow for your face.",
    eyebrow: photoEyebrow,
    h1: ["Eyebrow shape detector:", "find your brow shape"],
    intro:
      "Upload a selfie and the free eyebrow shape detector traces both brows to find your eyebrow shape, thickness and arch, then suggests the brow shape that suits your face shape best.",
    widget: { kind: "landmark", tool: "eyebrow-shape" },
    stepsTitle: "How the eyebrow shape detector works",
    steps: photoSteps(
      "Arch height, peak position, tail direction and thickness are measured on both brows.",
      "See your eyebrow shape, grooming tips and the best brow for your face shape.",
    ),
    types: {
      title: "Types of eyebrow shapes",
      sub: "Six common eyebrow shapes the detector can identify.",
      items: infoItems(browShapeInfo),
    },
    faqTitle: "Eyebrow shape detector FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Should my eyebrows match my face shape?",
        a: "A brow shape that contrasts your face shape tends to balance it — angled arches for round faces, softer curves for square ones. The detector shows the best match for yours.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "nose-shape",
    metaTitle: "Nose Shape Detector: Find Your Nose Type | StyleMirror",
    metaDescription:
      "Free nose shape detector: upload a selfie to find your nose shape from 12 types — Greek, Roman, celestial, button, Nubian, bulbous and more.",
    eyebrow: photoEyebrow,
    h1: ["Nose shape detector:", "12 nose types"],
    intro:
      "Upload a selfie and the free nose shape detector measures your nose width, length, bridge profile and tip to match one of 12 nose shapes, with contour and glasses tips.",
    widget: { kind: "landmark", tool: "nose-shape" },
    stepsTitle: "How the nose shape detector works",
    steps: photoSteps(
      "Nose width and length are measured, and the bridge profile is estimated from 3D depth.",
      "See your nose shape with contouring and eyewear tips.",
    ),
    types: {
      title: "12 nose shapes",
      sub: "Every nose is normal — these types are for makeup and eyewear choices.",
      items: infoItems(noseShapeInfo),
    },
    faqTitle: "Nose shape detector FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "How can a front photo tell a Roman nose?",
        a: "MediaPipe estimates depth for each landmark, so the bridge profile can be approximated. It's less reliable than a side photo, so treat profile types as a best guess.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "lip-shape",
    metaTitle: "Lip Shape Analyzer: What Lip Shape Do I Have? | StyleMirror",
    metaDescription:
      "Free lip shape analyzer: upload a selfie to find your lip shape — full, thin, heart, bow, wide, round, top-heavy, bottom-heavy or downturned — with makeup tips.",
    eyebrow: photoEyebrow,
    h1: ["Lip shape analyzer:", "what lip shape do I have?"],
    intro:
      "Upload a selfie and the free lip shape analyzer measures lip fullness, upper-to-lower ratio, cupid's bow and corners to find your lip shape, with lipstick and liner tips.",
    widget: { kind: "landmark", tool: "lip-shape" },
    stepsTitle: "How the lip shape analyzer works",
    steps: photoSteps(
      "Lip height, mouth width, cupid's bow depth and corner position are measured.",
      "See your lip shape, upper-to-lower ratio and makeup tips.",
    ),
    types: {
      title: "Types of lip shapes",
      sub: "Nine lip shapes the analyzer can identify.",
      items: infoItems(lipShapeInfo),
    },
    faqTitle: "Lip shape analyzer FAQ",
    faqs: [
      ...privacyFaqs,
      { ...photoTip, a: `${photoTip.a} Keep your lips relaxed and closed.` },
      {
        q: "What is the ideal lip ratio?",
        a: "A lower lip about 1.6 times the height of the upper lip is often cited as ideal. It's an aesthetic convention, not a rule.",
      },
    ],
    cta: {
      title: "Now find your lipstick shades",
      sub: "The lipstick shade finder reads your skin and lip color and picks flattering shades.",
      href: "/lipstick-shade-finder",
      label: "Find lipstick shades",
    },
  },
  // ------------------------------------------------------------ proportions
  {
    id: "face-symmetry",
    metaTitle: "Face Symmetry Test: How Symmetrical Am I? | StyleMirror",
    metaDescription:
      "Free face symmetry test: upload a selfie to get a facial symmetry score, plus a breakdown for eyes, brows, nose, mouth and jaw.",
    eyebrow: photoEyebrow,
    h1: ["Face symmetry test:", "how symmetrical are you?"],
    intro:
      "Upload a selfie and the free face symmetry test mirrors your landmarks across the center of your face to score your facial symmetry, with a breakdown for each feature.",
    widget: { kind: "landmark", tool: "face-symmetry" },
    stepsTitle: "How the face symmetry test works",
    steps: photoSteps(
      "Pairs of left and right landmarks are mirrored across your facial midline and compared.",
      "See an overall symmetry score and which features are most and least symmetrical.",
    ),
    extra: {
      title: "Facial symmetry explained",
      paragraphs: [
        "No face is perfectly symmetrical. Most people score between 75% and 90% on a face symmetry test, and faces made artificially symmetrical often look uncanny.",
        "Small asymmetries come from how we sleep, chew and smile. Head turn and lens distortion add more, so take the test with a straight-on photo from arm's length.",
      ],
    },
    faqTitle: "Face symmetry test FAQ",
    faqs: [...privacyFaqs, photoTip],
    cta: hairCta,
  },
  {
    id: "eye-distance",
    metaTitle: "Eye Distance Calculator: Close or Wide-Set? | StyleMirror",
    metaDescription:
      "Free eye distance calculator: upload a selfie to measure your eye spacing ratio and find out if your eyes are close-set, wide-set or balanced.",
    eyebrow: photoEyebrow,
    h1: ["Eye distance calculator:", "close-set or wide-set?"],
    intro:
      "Upload a selfie and the free eye distance calculator measures the gap between your eyes against your eye width — the rule of fifths — to tell you if your eyes are close-set, wide-set or balanced.",
    widget: { kind: "landmark", tool: "eye-distance" },
    stepsTitle: "How the eye distance calculator works",
    steps: photoSteps(
      "The inner-corner gap, eye width and pupil distance are measured and compared to face width.",
      "See your eye spacing ratio with makeup and glasses tips.",
    ),
    extra: {
      title: "The ideal eye spacing ratio",
      paragraphs: [
        "In the rule of fifths, a face is five eye-widths wide and the gap between the eyes is one eye width — an eye spacing ratio of 1.0. Above 1.1 reads wide-set; below 0.9 reads close-set.",
        "Neither is better. Eye spacing simply changes which makeup placement and frame bridges look most balanced.",
      ],
    },
    faqTitle: "Eye distance calculator FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Can I use this to measure my PD for glasses?",
        a: "No. Pupil distance for prescription glasses must be measured in millimeters by an optician; this tool works in ratios.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "golden-ratio",
    metaTitle: "Golden Ratio Face Calculator: Upload a Photo | StyleMirror",
    metaDescription:
      "Free golden ratio face calculator: upload a photo to see how closely five facial ratios match φ = 1.618, with a golden ratio score.",
    eyebrow: photoEyebrow,
    h1: ["Golden ratio face calculator:", "your φ score"],
    intro:
      "Upload a photo and the free golden ratio face calculator measures five facial proportions and compares each to the golden ratio, φ = 1.618, for an overall golden ratio score.",
    widget: { kind: "landmark", tool: "golden-ratio" },
    stepsTitle: "How the golden ratio face calculator works",
    steps: photoSteps(
      "Face length and width, mouth and nose width and lower-face proportions are measured.",
      "See each ratio, how close it is to 1.618, and an overall golden ratio match.",
    ),
    extra: {
      title: "What is the golden ratio of a face?",
      paragraphs: [
        "The golden ratio, about 1.618, appears in art and architecture, and some theories claim faces whose proportions approach it look more attractive.",
        "Research doesn't strongly support that — averageness, symmetry and skin quality matter more — so read your golden ratio score as a fun proportion check, not a verdict.",
      ],
    },
    faqTitle: "Golden ratio face calculator FAQ",
    faqs: [...privacyFaqs, photoTip],
    cta: hairCta,
  },
  {
    id: "canthal-tilt",
    metaTitle: "Canthal Tilt Calculator: Measure Eye Tilt | StyleMirror",
    metaDescription:
      "Free canthal tilt calculator: upload a selfie to measure your canthal tilt angle in degrees and see if it's positive, neutral or negative.",
    eyebrow: photoEyebrow,
    h1: ["Canthal tilt calculator:", "measure your eye tilt"],
    intro:
      "Upload a selfie and the free canthal tilt calculator measures the angle from your inner to outer eye corners, for each eye, to tell you if your canthal tilt is positive, neutral or negative.",
    widget: { kind: "landmark", tool: "canthal-tilt" },
    stepsTitle: "How the canthal tilt calculator works",
    steps: photoSteps(
      "The inner (medial) and outer (lateral) canthus of each eye are located and the angle is measured.",
      "See your canthal tilt in degrees for each eye and on average.",
    ),
    extra: {
      title: "Positive vs negative canthal tilt",
      paragraphs: [
        "Canthal tilt is the angle of the line from the inner eye corner to the outer one. When the outer corner sits higher it's positive — the 'fox eye' or 'hunter eye' look. When it sits lower it's negative, sometimes called 'hound eyes'.",
        "Most people fall between 0° and +6°. The calculator measures against the line between your eyes, so a tilted head doesn't skew the result.",
      ],
    },
    faqTitle: "Canthal tilt calculator FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Can makeup change my canthal tilt?",
        a: "Not the bone structure, but winged liner and lifting the brow tail make the tilt look more positive.",
      },
    ],
    cta: hairCta,
  },
  {
    id: "facial-proportions",
    metaTitle: "Facial Proportions Calculator: Thirds & Midface Ratio",
    metaDescription:
      "Free facial proportions calculator: upload a selfie to measure your facial thirds, midface ratio, lip-to-chin ratio and eye spacing.",
    eyebrow: photoEyebrow,
    h1: ["Facial proportions calculator:", "thirds & midface ratio"],
    intro:
      "Upload a selfie and the free facial proportions calculator measures your facial thirds, midface ratio, lip-to-chin split and eye spacing, and compares each to the classic ideal.",
    widget: { kind: "landmark", tool: "facial-proportions" },
    stepsTitle: "How the facial proportions calculator works",
    steps: photoSteps(
      "Brow, nose base, mouth and chin heights are measured, plus pupil distance and eye width.",
      "See your facial thirds balance, midface ratio and lower-face proportions.",
    ),
    extra: {
      title: "Facial thirds and the midface ratio",
      paragraphs: [
        "The neoclassical canon splits the face into three equal thirds: hairline to brow, brow to nose base, and nose base to chin. The lower third splits again — one part above the mouth, two below.",
        "The midface ratio compares the distance between your pupils to the height from your pupils to your upper lip. Around 1.0 to 1.1 reads compact.",
      ],
    },
    faqTitle: "Facial proportions calculator FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Why isn't the upper third measured?",
        a: "Face landmarks stop below the hairline, so the upper third can't be measured reliably from them. Check it in a mirror: it should be roughly equal to your middle third.",
      },
    ],
    cta: hairCta,
  },
  // ------------------------------------------------------------ fun
  {
    id: "attractiveness",
    metaTitle: "Attractiveness Test: How Attractive Am I? | StyleMirror",
    metaDescription:
      "Free AI attractiveness test: upload a selfie to get a facial harmony score out of 10 based on symmetry, golden ratio, eye tilt and facial thirds.",
    eyebrow: photoEyebrow,
    h1: ["Attractiveness test:", "how attractive am I?"],
    intro:
      "Upload a selfie and the free AI attractiveness test scores your facial harmony out of 10 from symmetry, golden ratio, eye tilt, facial thirds, midface and eye spacing — and shows your strongest features.",
    widget: { kind: "landmark", tool: "attractiveness" },
    stepsTitle: "How the attractiveness test works",
    steps: photoSteps(
      "Six geometric measures of facial harmony are scored from 478 landmarks.",
      "See your attractiveness score out of 10 and your two strongest features.",
    ),
    extra: {
      title: "What an attractiveness test can and can't tell you",
      paragraphs: [
        "This attractiveness test scores facial geometry only — the parts of attractiveness that research links to symmetry and proportion. It can't see your expression, style, voice or charisma, which matter as much.",
        "The scale is deliberately gentle and photos vary, so take it a few times with different photos and treat it as entertainment.",
      ],
    },
    faqTitle: "Attractiveness test FAQ",
    faqs: [...privacyFaqs, photoTip],
    cta: hairCta,
  },
  {
    id: "face-rating",
    metaTitle: "Face Rating Test: Rate My Face Free (1–10) | StyleMirror",
    metaDescription:
      "Free face rating test: rate your face from 1 to 10 with an AI geometry breakdown of golden ratio, canthal tilt, symmetry, facial thirds and midface.",
    eyebrow: photoEyebrow,
    h1: ["Face rating test:", "rate my face 1–10"],
    intro:
      "Upload a selfie and the free face rating test rates your face from 1 to 10 with a five-part AI geometry breakdown: golden ratio, canthal tilt, symmetry, facial thirds and midface ratio.",
    widget: { kind: "landmark", tool: "face-rating" },
    stepsTitle: "How the face rating test works",
    steps: photoSteps(
      "Five geometric measures are scored from 478 facial landmarks.",
      "See your face rating out of 10 and each part's score.",
    ),
    extra: {
      title: "The five parts of your face rating",
      paragraphs: [
        "Golden ratio compares five proportions to 1.618. Canthal tilt rewards a slight upward eye angle. Symmetry mirrors left and right. Facial thirds compares the middle and lower face. Midface ratio checks how compact the area between the eyes and mouth is.",
        "It's a geometry score from one photo, not a measure of your worth. Lighting and angle can shift it by a point.",
      ],
    },
    faqTitle: "Face rating test FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Is this a PSL score?",
        a: "No. PSL ratings are subjective community scores. This face rating uses only measurable geometry, and its scale is centered around 6.5.",
      },
    ],
    cta: hairCta,
  },
  // ------------------------------------------------------------ color
  {
    id: "skin-tone",
    metaTitle: "Skin Tone Analyzer: Tone & Undertone Test | StyleMirror",
    metaDescription:
      "Free skin tone analyzer: upload a selfie to find your skin tone, undertone (warm, cool, neutral or olive), Monk scale shade and the colors that suit you.",
    eyebrow: photoEyebrow,
    h1: ["Skin tone analyzer:", "tone, undertone & colors"],
    intro:
      "Upload a selfie in daylight and the free skin tone analyzer samples your forehead, cheeks and chin to find your skin tone and undertone, your Monk scale shade and the colors and metals that flatter you.",
    widget: { kind: "landmark", tool: "skin-tone" },
    stepsTitle: "How the skin tone analyzer works",
    steps: [
      { title: "Upload a daylight selfie", body: "Face a window, no makeup or filters if possible." },
      { title: "Skin is sampled", body: "Forehead, cheek and chin pixels are converted to CIELAB color." },
      { title: "Get your skin tone", body: "Tone, undertone, Monk scale shade and your best colors." },
    ],
    extra: {
      title: "Skin tone vs undertone",
      paragraphs: [
        "Skin tone is how light or deep your skin is — the analyzer places it on the 10-shade Monk Skin Tone scale. Undertone is the hue underneath: warm (golden), cool (pink), neutral (balanced) or olive (green-gold).",
        "Your skin tone can change with a tan; your undertone doesn't. Undertone decides which colors and metals look best near your face.",
      ],
    },
    faqTitle: "Skin tone analyzer FAQ",
    faqs: [
      ...privacyFaqs,
      {
        q: "Why does lighting matter so much?",
        a: "Warm bulbs push results warmer and shade makes skin read deeper. Soft daylight from a window gives the truest reading.",
      },
    ],
    cta: {
      title: "Know your undertone? Match your foundation",
      sub: "The foundation shade finder turns your skin reading into shades from popular brands.",
      href: "/foundation-shade-finder",
      label: "Find my foundation",
    },
  },
  {
    id: "color-analysis",
    metaTitle: "Color Analysis Quiz: What Color Season Am I? | StyleMirror",
    metaDescription:
      "Free color analysis quiz: answer 10 questions to find your seasonal color type from 12 seasons, with your personal color palette.",
    eyebrow: "Free · 10 questions · 12 seasons",
    h1: ["Color analysis quiz:", "what season are you?"],
    intro:
      "Answer ten questions about your veins, hair, eyes and how colors look on you, and this free color analysis quiz finds your season from the 12-season system, with your personal palette.",
    widget: { kind: "quiz", quiz: "color-season" },
    stepsTitle: "How the color analysis quiz works",
    source: {
      lead: "Based on the 12-season system of",
      label: "personal color analysis",
      href: "https://en.wikipedia.org/wiki/Color_analysis_(art)",
    },
    steps: [
      { title: "Stand in daylight", body: "With a mirror and, ideally, something white and gold nearby." },
      { title: "Answer 10 questions", body: "Each one scores warmth, lightness and brightness." },
      { title: "Get your color season", body: "Your season, palette, best neutrals and metals." },
    ],
    types: {
      title: "The 12 color seasons",
      sub: "Each season is defined by its dominant trait: light, deep, warm, cool, bright or soft.",
      items: Object.values(seasonInfo).map((s) => ({
        title: s.label,
        body: s.description,
        swatches: s.palette.slice(0, 6).map((p) => p.hex),
      })),
    },
    faqTitle: "Color analysis quiz FAQ",
    faqs: [
      {
        q: "How accurate is an online color analysis quiz?",
        a: "It gets most people to the right family. Draping real fabric in daylight is the gold standard — use the palette to test a few colors against your face.",
      },
      {
        q: "Can my color season change?",
        a: "Your season is tied to your natural coloring, so it usually stays the same. Big hair-color changes or graying can shift you to a neighboring season.",
      },
    ],
    cta: {
      title: "Check your undertone from a photo",
      sub: "The skin tone analyzer reads your undertone from a daylight selfie.",
      href: "/skin-tone-analyzer",
      label: "Analyze my skin tone",
    },
  },
  // ------------------------------------------------------------ makeup
  {
    id: "concealer",
    metaTitle: "Concealer Shade Finder: Shade & Corrector | StyleMirror",
    metaDescription:
      "Free concealer shade finder: upload a selfie to find your concealer shade, undertone and the right color corrector for dark circles or redness.",
    eyebrow: photoEyebrow,
    h1: ["Concealer shade finder:", "shade & corrector"],
    intro:
      "Upload a selfie and the free concealer shade finder matches your skin, compares your under-eyes to your cheeks and picks your under-eye concealer, spot concealer and color corrector.",
    widget: { kind: "landmark", tool: "concealer" },
    stepsTitle: "How the concealer shade finder works",
    steps: photoSteps(
      "Skin is sampled across your face, then your under-eye area is compared with your cheeks.",
      "Get an under-eye shade, a spot-concealer match and a color corrector if you need one.",
    ),
    extra: {
      title: "Concealer vs color corrector",
      paragraphs: [
        "Concealer for under-eyes should be about one shade lighter than your foundation; for blemishes it should match exactly, or it draws attention.",
        "Color correctors cancel tints first: peach or orange for blue-purple dark circles, yellow for redness. Apply a thin layer, then concealer on top.",
      ],
    },
    faqTitle: "Concealer shade finder FAQ",
    faqs: [...privacyFaqs, photoTip],
    cta: {
      title: "Complete your base",
      sub: "Match your foundation to the same skin reading.",
      href: "/foundation-shade-finder",
      label: "Find my foundation",
    },
  },
  {
    id: "lipstick",
    metaTitle: "Lipstick Shade Finder: Best Lip Colors | StyleMirror",
    metaDescription:
      "Free lipstick shade finder: upload a picture to find the most flattering lipstick colors for your skin tone and undertone, plus your 'my lips but better' shade.",
    eyebrow: photoEyebrow,
    h1: ["Lipstick shade finder:", "your best lip colors"],
    intro:
      "Upload a picture and the free lipstick shade finder reads your skin tone, undertone and natural lip color to pick the most flattering lipstick shades — from everyday nudes to statement reds.",
    widget: { kind: "landmark", tool: "lipstick" },
    stepsTitle: "How the lipstick shade finder works",
    steps: photoSteps(
      "Your skin and natural lip color are sampled and classified by depth and undertone.",
      "Get a 'my lips but better' shade plus five lipstick colors picked for you.",
    ),
    faqTitle: "Lipstick shade finder FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "What shade of red lipstick suits me?",
        a: "Cool undertones suit blue-based reds, warm undertones suit orange-based reds, and neutral undertones can wear true reds. The finder includes the right red for you.",
      },
    ],
    cta: {
      title: "Match your blush to your lipstick",
      sub: "The blush shade finder uses the same skin reading.",
      href: "/blush-shade-finder",
      label: "Find blush shades",
    },
  },
  {
    id: "blush",
    metaTitle: "Blush Shade Finder: Best Blush Color for Me | StyleMirror",
    metaDescription:
      "Free blush shade finder: upload a picture to find your most flattering blush colors and where to apply blush for your face shape.",
    eyebrow: photoEyebrow,
    h1: ["Blush shade finder:", "your best blush colors"],
    intro:
      "Upload a picture and the free blush shade finder reads your skin tone and undertone to pick your most flattering blush colors, then shows where to place blush for your face shape.",
    widget: { kind: "landmark", tool: "blush" },
    stepsTitle: "How the blush shade finder works",
    steps: photoSteps(
      "Your skin is sampled for depth and undertone, and your face shape is detected.",
      "Get four blush colors and placement for your face shape.",
    ),
    faqTitle: "Blush shade finder FAQ",
    faqs: [
      ...privacyFaqs,
      photoTip,
      {
        q: "Should blush match my lipstick?",
        a: "Not exactly, but keeping them in the same color family — both warm or both cool — makes a look feel finished.",
      },
    ],
    cta: {
      title: "Find a lipstick to match",
      sub: "The lipstick shade finder uses the same skin reading.",
      href: "/lipstick-shade-finder",
      label: "Find lipstick shades",
    },
  },
  {
    id: "eyeshadow",
    metaTitle: "Eyeshadow Shade Finder: Best Colors for Me | StyleMirror",
    metaDescription:
      "Free eyeshadow shade finder: upload a picture to detect your eye color and find the eyeshadow colors that make your eyes pop, matched to your undertone.",
    eyebrow: photoEyebrow,
    h1: ["Eyeshadow shade finder:", "make your eyes pop"],
    intro:
      "Upload a picture and the free eyeshadow shade finder detects your eye color and undertone, then picks eyeshadow colors that contrast your iris plus an everyday neutral base.",
    widget: { kind: "landmark", tool: "eyeshadow" },
    stepsTitle: "How the eyeshadow shade finder works",
    steps: photoSteps(
      "Your iris is located and sampled to detect your eye color, and your skin undertone is read.",
      "Get five pop shades for your eye color and a neutral base for your undertone.",
    ),
    extra: {
      title: "Eyeshadow colors by eye color",
      paragraphs: [
        "Colors opposite your iris on the color wheel make it look brighter: copper and bronze for blue eyes, plum and burgundy for green eyes, purple and olive for hazel eyes. Brown eyes can wear almost anything.",
        "Your base, crease and liner shades should follow your skin undertone so the look blends naturally.",
      ],
    },
    faqTitle: "Eyeshadow shade finder FAQ",
    faqs: [
      ...privacyFaqs,
      {
        q: "My eye color was detected wrong — why?",
        a: "Lighting, reflections and lashes can shift the iris sample. Use soft daylight facing a window, and look straight at the camera.",
      },
    ],
    cta: {
      title: "Know your eye shape too",
      sub: "The eye shape detector gives liner and shadow placement tips.",
      href: "/eye-shape-detector",
      label: "Detect eye shape",
    },
  },
  // ------------------------------------------------------------ body
  {
    id: "body-type",
    metaTitle: "Body Type Calculator: Ecto, Meso or Endo? | StyleMirror",
    metaDescription:
      "Free body type calculator: enter height, weight and measurements to estimate your somatotype — ectomorph, mesomorph or endomorph — plus style tips.",
    eyebrow: "Free · No sign-up · Metric or imperial",
    h1: ["Body type calculator:", "find your somatotype"],
    intro:
      "Enter your height, weight and four tape measurements and this free body type calculator estimates your somatotype — ectomorph, mesomorph, endomorph or a mix — with training and style tips.",
    widget: { kind: "body-type" },
    stepsTitle: "How to use the body type calculator",
    source: {
      lead: "Uses the three",
      label: "somatotypes",
      href: "https://en.wikipedia.org/wiki/Somatotype_and_constitutional_psychology",
    },
    steps: [
      { title: "Measure yourself", body: "Height, weight, wrist, shoulders, waist and hips." },
      { title: "Frame and ratios", body: "Frame size, BMI, waist-to-height and shoulder-to-waist are calculated." },
      { title: "Get your body type", body: "Your somatotype mix with training and style tips." },
    ],
    types: {
      title: "The three body types",
      sub: "Most people are a mix of two somatotypes.",
      items: infoItems(somatotypeInfo),
    },
    extra: {
      title: "Body type vs body shape vs Kibbe",
      paragraphs: [
        "Body type (somatotype) describes your build — lean, muscular or rounder. Body shape describes your silhouette from bust, waist and hip measurements. Kibbe types describe your overall line and essence for styling.",
        "Each answers a different question, so it's worth knowing all three.",
      ],
    },
    faqTitle: "Body type calculator FAQ",
    faqs: [
      {
        q: "Are my measurements saved?",
        a: "No. The body type calculator runs entirely in your browser and doesn't store anything.",
      },
      {
        q: "Can my body type change?",
        a: "Your frame doesn't change, but training and nutrition shift where you sit between the three types.",
      },
    ],
    cta: {
      title: "Find your body shape too",
      sub: "The body shape calculator turns bust, waist and hip measurements into outfit ideas.",
      href: "/body-shape-calculator-female",
      label: "Body shape calculator",
    },
  },
  {
    id: "kibbe-test",
    metaTitle: "Kibbe Body Type Test: Free 13-Type Quiz | StyleMirror",
    metaDescription:
      "Take the free Kibbe body type test: 10 questions about your bone structure, body and features to find your Kibbe type from all 13, with style tips.",
    eyebrow: "Free · 10 questions · 13 Kibbe types",
    h1: ["Kibbe body type test:", "find your Kibbe type"],
    intro:
      "Answer ten questions about your height, bone structure, curves and features and this free Kibbe body type test finds your Kibbe type from all 13, with what to wear and what to avoid.",
    widget: { kind: "quiz", quiz: "kibbe" },
    stepsTitle: "How the Kibbe body type test works",
    source: {
      lead: "Inspired by the image identity system described alongside other",
      label: "body shape classifications",
      href: "https://en.wikipedia.org/wiki/Female_body_shape",
    },
    steps: [
      { title: "Be honest", body: "Answer for your natural frame, not your weight or the clothes you like." },
      { title: "10 questions", body: "Each answer leans Dramatic, Natural, Classic, Gamine or Romantic." },
      { title: "Get your Kibbe type", body: "Your top family plus its yin or yang lean decide your type." },
    ],
    types: {
      title: "The 13 Kibbe body types",
      sub: "Five families, from sharp yang (Dramatic) to soft yin (Romantic).",
      items: Object.values(kibbeInfo).map((k) => ({ title: k.label, body: k.essence })),
    },
    faqTitle: "Kibbe body type test FAQ",
    faqs: [
      {
        q: "Is this the official Kibbe test?",
        a: "No. It's an independent quiz inspired by David Kibbe's image identity system, written in our own words.",
      },
      {
        q: "Does my weight change my Kibbe type?",
        a: "No. Kibbe types are about bone structure and overall line, which stay the same through weight changes.",
      },
    ],
    cta: {
      title: "Read about every Kibbe type",
      sub: "Style lines, fabrics and what to avoid for all 13 types.",
      href: "/kibbe-body-types",
      label: "Kibbe body types guide",
    },
  },
  {
    id: "kibbe-types",
    metaTitle: "Kibbe Body Types: All 13 Kibbe Types Explained | StyleMirror",
    metaDescription:
      "All 13 Kibbe body types explained: Dramatic, Natural, Classic, Gamine and Romantic families, with each type's body traits and what to wear.",
    eyebrow: "Free guide · 13 types · 5 families",
    h1: ["Kibbe body types:", "all 13 types explained"],
    intro:
      "The Kibbe body types group people into five image families — Dramatic, Natural, Classic, Gamine and Romantic — and 13 types in total. Here is each Kibbe type's body traits and what to wear.",
    widget: { kind: "none" },
    stepsTitle: "How the Kibbe body types work",
    source: {
      lead: "Kibbe types sit alongside other",
      label: "body shape classifications",
      href: "https://en.wikipedia.org/wiki/Female_body_shape",
    },
    steps: [
      { title: "Yin and yang", body: "Yang is sharp, long or broad; yin is soft, rounded and small." },
      { title: "Five families", body: "Dramatic, Natural, Classic, Gamine and Romantic." },
      { title: "13 types", body: "Each family splits by a yin or yang lean, like Soft Dramatic." },
    ],
    types: {
      title: "All 13 Kibbe body types",
      sub: "Body traits and the style lines that suit each Kibbe type.",
      items: Object.values(kibbeInfo).map((k) => ({
        title: `${k.label} · ${k.family}`,
        body: `${k.essence} ${k.body} Wear: ${k.wear.join("; ").toLowerCase()}. Avoid: ${k.avoid.toLowerCase()}`,
      })),
    },
    faqTitle: "Kibbe body types FAQ",
    faqs: [
      {
        q: "How do I find my Kibbe body type?",
        a: "Take the free Kibbe body type test — ten questions about your frame and features — then read your type here.",
      },
      {
        q: "Why did Kibbe reduce the system to 10 types?",
        a: "In later work Kibbe merged some types, but the 13-type system remains the most widely used, so this guide covers all 13.",
      },
    ],
    cta: {
      title: "Not sure which Kibbe type you are?",
      sub: "Take the 10-question Kibbe body type test.",
      href: "/kibbe-body-type-test",
      label: "Take the Kibbe test",
    },
  },
  // ------------------------------------------------------------ privacy
  {
    id: "blur-face",
    metaTitle: "Blur Face Online: Blur Faces in Photos Free | StyleMirror",
    metaDescription:
      "Blur face online, free: upload a photo and every face is detected and blurred or pixelated automatically. Group photos work. Nothing is uploaded.",
    eyebrow: "Free · No sign-up · Nothing is uploaded",
    h1: ["Blur face online:", "automatic face blur"],
    intro:
      "Upload a photo and this free tool finds every face and blurs or pixelates it automatically — group photos included. Click a face to keep it sharp, then download your blurred photo.",
    widget: { kind: "blur" },
    stepsTitle: "How to blur a face in a photo",
    steps: [
      { title: "Upload a photo", body: "JPG, PNG or WebP. Up to 20 faces are detected." },
      { title: "Pick blur or pixelate", body: "Set the strength. Click any face to toggle it." },
      { title: "Download", body: "Save the blurred photo as a PNG." },
    ],
    extra: {
      title: "Why blur faces online in your browser",
      paragraphs: [
        "Most online blur tools upload your photo to a server. This one detects and blurs faces on your own device, so photos of kids, crowds or private events never leave it.",
        "Use it to anonymize photos before posting, protect bystanders or censor screenshots.",
      ],
    },
    faqTitle: "Blur face online FAQ",
    faqs: [
      {
        q: "Is my photo uploaded?",
        a: "No. Face detection and blurring run entirely in your browser.",
      },
      {
        q: "Can the blur be reversed?",
        a: "Strong blur and pixelation remove detail permanently from the downloaded image. Use a high strength for real anonymization.",
      },
      {
        q: "A face wasn't detected — what can I do?",
        a: "Very small, side-on or heavily covered faces can be missed. Try a higher-resolution photo.",
      },
    ],
    cta: hairCta,
  },
];

export function freeToolPage(id: ToolId): FreeToolPage {
  const page = freeToolPages.find((p) => p.id === id);
  if (!page) throw new Error(`No free tool page for ${id}`);
  return page;
}
