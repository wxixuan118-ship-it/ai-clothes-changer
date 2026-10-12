// Long-form guide copy for each free tool page: an H2 section beside the
// tool's illustration plus extra FAQs. Mention the keyword once or twice
// here at most — the page already carries it in title, H1 and intro.

import type { FaqItem } from "@/components/site/blocks";
import type { ToolId } from "@/config/tools";

export type FreeToolGuide = {
  title: string;
  paragraphs: string[];
  alt: string;
  caption: string;
  faqs: FaqItem[];
};

export const freeToolGuides: Partial<Record<ToolId, FreeToolGuide>> = {
  "face-analyzer": {
    title: "Face analyzer tips",
    alt: "Face analyzer diagram showing measured landmarks on the eyes, nose, lips and jaw",
    caption: "Every reading starts from the same 478 points, so results stay consistent across features.",
    paragraphs: [
      "Start with the overall rating, then read the cards in order. Shape comes first because it frames everything else: a heart-shaped face with almond eyes needs different haircuts and frames than a square face with round eyes, even though both have balanced proportions.",
      "Proportion cards compare your measurements with classic ideals such as equal facial thirds or eyes spaced one eye-width apart. These ideals come from art history, not biology, so treat a lower number as a description of your features rather than a flaw. Plenty of famous faces break every rule.",
      "Color cards depend on light. Take one photo facing a window in daylight and another indoors, then compare. If the undertone changes, trust the daylight version. When a card interests you, open its dedicated tool for a deeper breakdown and more tips.",
      "Lighting and camera position affect every card at once. Sit facing a window, hold the phone at eye level and keep your chin level. Remove glasses, push hair off your forehead and relax your mouth. If a warning appears about head turn, retake the photo before reading the details.",
    ],
    faqs: [
      {
        q: "Why do two photos give slightly different results?",
        a: "Head angle, distance from the lens and expression all shift landmark positions a little. Use a straight-on photo at arm's length and compare like with like.",
      },
      {
        q: "Does it work for men and women?",
        a: "Yes. The measurements are the same for every face; only some styling tips differ, and each card covers both.",
      },
    ],
  },
  "face-shape-calculator": {
    title: "Tips for accurate face shape calculator measurements",
    alt: "Face shape calculator diagram showing forehead, cheekbone, jaw and face length measurements",
    caption: "Measure the four lines straight across, then trace your chin shape.",
    paragraphs: [
      "Use a soft tailor's tape and measure in front of a mirror, or ask a friend to help. Keep the tape level and straight across the face for widths — don't follow the curve around to your ears. Tie your hair back so you can see where your hairline really starts.",
      "Forehead width sits halfway between your eyebrows and hairline. Cheekbone width is the widest point just below the outer corners of your eyes. Jaw width runs from one jaw corner, just below the earlobe, to the other. Face length goes from the center of your hairline down to the tip of your chin.",
      "Take each measurement twice and use the average. If your results land between two shapes, read the haircut advice for both: the overlap is usually where your best styles are. A selfie check with the photo detector is a good tiebreaker.",
    ],
    faqs: [
      {
        q: "What counts as a pointed chin?",
        a: "If the bottom of your face narrows to a clear point rather than a curve or a flat line, choose pointed. Heart and diamond faces usually have one.",
      },
      {
        q: "My hairline is receding — where do I measure from?",
        a: "Measure from where your hairline was, or from the top of the forehead crease when you raise your eyebrows.",
      },
    ],
  },
  "face-shape-quiz": {
    title: "How to answer the face shape quiz honestly",
    alt: "Face shape quiz illustration with an oval face outline and question cards",
    caption: "Answer what you see in the mirror, not the shape you hope for.",
    paragraphs: [
      "Stand square to a mirror in even light with your hair pulled back. Relax your face — smiling widens the cheeks and changes the jawline. If you can, trace your outline on the mirror with a dry-erase marker or soap, then step back and look at the drawing.",
      "The questions move from overall proportions to details: length versus width first, then which part of your face is widest, then forehead, cheekbones, jaw and chin. Each answer adds points to two or three shapes, so one uncertain answer won't decide your result on its own.",
      "Your result shows the top match plus a close second when the scores are near each other. That happens often, because real faces blend shapes. Pick the hairstyle tips that suit both, or confirm with a selfie in the photo detector.",
    ],
    faqs: [
      {
        q: "Which face shape is most common?",
        a: "Oval is usually described as the most common, followed by round and square, but surveys vary a lot.",
      },
      {
        q: "Can I take the quiz for someone else?",
        a: "Yes — answering from a straight-on photo of them works well.",
      },
    ],
  },
  "forehead-shape": {
    title: "Choosing a hairstyle for your forehead shape",
    alt: "Forehead shape detector diagram highlighting forehead width and top curve",
    caption: "Width at the temples and the curve of the top line decide the forehead type.",
    paragraphs: [
      "A forehead reads as broad or narrow relative to your cheekbones, not on its own. That's why the detector compares the two widths instead of measuring the forehead alone. A broad forehead pairs well with fringes and volume lower down; a narrow one benefits from lift at the temples.",
      "Height matters too. A high forehead can be balanced with curtain bangs or a side part, while a low forehead looks best with hair swept back to open it up. Middle parts make any forehead look more symmetrical but also highlight width.",
      "Remember that hairline shape is separate from forehead shape. Check for a widow's peak or a receding M-shape in a mirror, since those change which fringes sit flat. Our hairstyle guide pairs each face shape with cuts that work.",
    ],
    faqs: [
      {
        q: "Is a big forehead a bad thing?",
        a: "No. Many models and actors have high or broad foreheads. It only changes which fringes and partings frame your face best.",
      },
      {
        q: "Can I check my forehead without a photo?",
        a: "Pull your hair back and compare forehead width with cheekbone width in a mirror, using your fingers or a ruler.",
      },
    ],
  },
  "jawline-shape": {
    title: "Styling tips by jawline shape",
    alt: "Jawline shape detector diagram highlighting the jaw corners and chin",
    caption: "Jaw width, corner angle and chin width together define the jawline type.",
    paragraphs: [
      "Your jawline sets where a haircut should end. Cuts that stop exactly at the widest point of the jaw draw the eye there, which is great for a defined jaw and less flattering when you want to soften it. Ending a bob just below or above the jaw changes the effect.",
      "For beards, the rule is to add what the jaw lacks. A round jaw gains structure from a squared beard with a little length at the chin. A square jaw looks softer with rounded edges. A V-shaped jaw looks fuller with denser sides.",
      "Jaw definition also changes with posture and weight. Photograph yourself with your chin slightly forward and your head level, not tipped down, to see your natural outline rather than a shadowed one.",
    ],
    faqs: [
      {
        q: "Can I change my jawline shape?",
        a: "Bone structure doesn't change, but posture, body composition, hairstyles and beards all change how sharp your jaw looks.",
      },
      {
        q: "What's the difference between jawline and face shape?",
        a: "Face shape describes the whole outline; jawline shape focuses on the lower third — jaw corners and chin.",
      },
    ],
  },
  "eye-shape": {
    title: "Eyeliner by eye shape: quick guide",
    alt: "Eye shape detector diagram showing eye width, height and corner tilt",
    caption: "Openness, outer-corner tilt and lid space are the three numbers behind the result.",
    paragraphs: [
      "Eyeliner works best when it follows your natural angle. Almond eyes can take a classic wing. Round eyes look longer when the liner extends past the outer corner and stays thin in the middle. Upturned eyes need little lift, while downturned eyes benefit from a wing that angles up rather than following the lower lash line.",
      "Hooded and monolid eyes need placement you can see with your eyes open. Apply liner and shadow while looking straight into a mirror, building color above the crease or from the lash line upward, and pick waterproof formulas so nothing transfers.",
      "Spacing changes the plan too. Wide-set eyes look closer with darker inner corners; close-set eyes look wider with a bright inner corner and darker outer third. The detector reports both shape and spacing so you can combine the tips.",
    ],
    faqs: [
      {
        q: "Do my two eyes have the same shape?",
        a: "Often not exactly. The detector averages both eyes; check each side in a mirror if one looks more hooded.",
      },
      {
        q: "Does eye shape change with age?",
        a: "Yes. Skin above the lid loosens over time, so many people become more hooded with age.",
      },
    ],
  },
  "eyebrow-shape": {
    title: "Shaping brows after the eyebrow shape detector",
    alt: "Eyebrow shape detector diagram showing brow head, arch peak and tail",
    caption: "Arch height, peak position and tail direction decide the brow type.",
    paragraphs: [
      "Map your ideal brow with a pencil held against your face. The brow should start above the inner corner of your eye, peak above the outer edge of your iris when you look straight ahead, and end on a line from the side of your nose past the outer corner of your eye.",
      "Grow before you shape. Leave brows alone for four to six weeks so you can see their natural line, then remove only the hairs clearly outside it. Over-plucked hairs can take months to return, and some never do.",
      "Fill sparse areas with light, hair-like strokes in a shade one step lighter than your hair if you're dark-haired, or one step darker if you're blonde. Set everything with a clear or tinted gel brushed upward.",
    ],
    faqs: [
      {
        q: "Should both brows be identical?",
        a: "No — brows are sisters, not twins. Aim for similar height and length rather than a perfect copy.",
      },
      {
        q: "Does the result change if my brows are tinted or filled in?",
        a: "Yes. For your natural shape, use a photo with bare brows.",
      },
    ],
  },
  "nose-shape": {
    title: "Contour and glasses tips for every nose shape",
    alt: "Nose shape detector diagram showing nose width, length and bridge profile",
    caption: "Width, length and the bridge's depth profile point to one of 12 nose types.",
    paragraphs: [
      "Contouring a nose is about light, not changing it. Use a matte shade one to two steps deeper than your skin along the sides of the bridge, blend well, and add a small touch of highlight down the center. Keep contour lighter on camera than you think you need.",
      "Glasses fit depends on your bridge more than your nose length. Lower or flatter bridges suit frames with adjustable nose pads or a low-bridge fit, so lenses don't rest on your cheeks. Higher bridges suit keyhole or saddle bridges that spread weight evenly.",
      "The 12 types are labels for styling choices, not medical categories. Many noses combine traits, like a straight bridge with a fuller tip, so read the tips for your closest two types.",
    ],
    faqs: [
      {
        q: "Is a nose shape linked to ethnicity?",
        a: "Some shapes are more common in certain populations, but every shape appears everywhere. The labels describe features, not ancestry.",
      },
      {
        q: "Can lighting change the result?",
        a: "Strong side light exaggerates bumps and dips. Use soft light facing you.",
      },
    ],
  },
  "lip-shape": {
    title: "Lip liner tricks by lip shape",
    alt: "Lip shape analyzer diagram showing lip height, mouth width and cupid's bow",
    caption: "Fullness, upper-to-lower ratio and the cupid's bow define lip type.",
    paragraphs: [
      "Lip liner is the most useful tool for any lip shape. Choose a shade close to your natural lip color, not your lipstick, so the edge stays invisible as the color wears off. Line just on the natural edge to add definition, or a hair outside at the center to add volume.",
      "Gloss and light shades make lips look fuller; matte and deep shades make them look smaller and more defined. You can combine both: a deeper shade at the corners and a lighter, glossier one in the center creates a pout without overlining.",
      "For uneven lips, line the fuller lip on its natural edge and the thinner lip slightly outside its edge, then blend. Check from arm's length — small asymmetries disappear at conversation distance.",
    ],
    faqs: [
      {
        q: "Should I smile in the photo?",
        a: "No. Keep lips relaxed and closed; smiling stretches them and changes the ratio.",
      },
      {
        q: "Can lip shape change?",
        a: "Lips can thin slightly with age as collagen decreases, which is why many people move to liner and lighter shades over time.",
      },
    ],
  },
  "face-symmetry": {
    title: "How to get a fair face symmetry reading",
    alt: "Face symmetry test diagram with a center line and mirrored landmark pairs",
    caption: "Each left-side point is mirrored across the center line and compared with its right-side partner.",
    paragraphs: [
      "Symmetry scores are sensitive to the photo more than the face. Stand facing the camera with your nose pointing straight at the lens, and keep the phone at eye level. Even a small head turn makes the nearer side look wider and drops the score.",
      "Avoid wide-angle selfies held close to your face. Lenses at short distances enlarge whatever is nearest, usually the nose and one cheek. Prop the phone on a shelf, step back and use the timer, or ask someone to take the photo.",
      "Run the test two or three times and average the results. If one region is consistently least symmetrical — often the mouth or brows — that's a genuine trait, and usually something people only notice in photos, not in person.",
    ],
    faqs: [
      {
        q: "Is a more symmetrical face more attractive?",
        a: "Studies find a modest link, but averageness, skin and expression matter as much or more.",
      },
      {
        q: "Why do I look different in mirrors and photos?",
        a: "A mirror flips your face, so small asymmetries appear on the side you're not used to. That's why photos can feel off.",
      },
    ],
  },
  "eye-distance": {
    title: "Eye distance calculator results for makeup and frames",
    alt: "Eye distance calculator diagram showing eye width and the gap between the eyes",
    caption: "The rule of fifths compares the inner-corner gap with one eye width.",
    paragraphs: [
      "The rule of fifths divides a face into five equal vertical sections, each the width of one eye. When the gap between the inner corners equals one eye width, eyes read as balanced. The calculator reports that ratio directly, so you don't need a ruler or millimeters.",
      "Makeup can nudge the look either way. To bring wide-set eyes closer, darken the inner third of the lid and fill brows slightly toward the nose. To open up close-set eyes, keep the inner corners bright and focus color on the outer half.",
      "Glasses do the same job. A dark, heavy bridge visually pulls eyes together; a clear or thin bridge adds space. Lens width also matters — your pupils should sit near the horizontal center of each lens.",
      "Spacing also changes how brows should sit. Brows that start directly above the inner corners keep wide-set eyes connected, while starting them a touch further out gives close-set eyes more breathing room. Small changes of a millimeter or two make a visible difference.",
    ],
    faqs: [
      {
        q: "Are wide-set eyes attractive?",
        a: "Slightly wide-set eyes are often described as youthful and open. Neither spacing is better.",
      },
      {
        q: "Why use ratios instead of millimeters?",
        a: "Photos don't carry a reliable scale, but ratios between features stay the same at any distance.",
      },
    ],
  },
  "golden-ratio": {
    title: "Where the golden ratio face idea comes from",
    alt: "Golden ratio face calculator diagram comparing facial proportions to 1.618",
    caption: "Five proportions are compared with φ = 1.618 and averaged into one match score.",
    paragraphs: [
      "The golden ratio, often written φ, is about 1.618. Renaissance artists used it in composition, and in the twentieth century some cosmetic surgeons proposed facial masks built from it. The idea became popular online as a way to score beauty.",
      "Modern research is more cautious. Faces rated attractive in studies tend to be average, symmetrical and healthy-looking, and their ratios cluster near but not exactly on 1.618. So a high score means some of your proportions happen to land near φ, not that you're objectively more attractive.",
      "For a fair result, use a photo taken from at least arm's length, straight on, with a neutral expression. Close-up selfies widen the nose and shorten the face, which shifts several ratios at once.",
      "If you want to compare your result over time, keep the setup identical: same distance, same height, same light and a neutral face. Small changes in posture move the lower-face ratios most, while mouth and nose widths stay steadier from photo to photo. Averaging three photos gives a more stable figure than relying on one.",
      "Treat the per-ratio scores as the useful part. A high mouth-to-nose match with a lower face-length match, for example, simply means your face is a little wider than the classical template, which many people consider a youthful trait. No single proportion makes or breaks a face.",
    ],
    faqs: [
      {
        q: "Which ratios does the calculator use?",
        a: "Face length to width, mouth to nose width, face width to outer eye span, nose length to width, and nose-to-chin versus mouth-to-chin.",
      },
      {
        q: "Who has a perfect golden ratio face?",
        a: "Nobody scores 100%. Celebrity rankings online use different measurements and aren't comparable.",
      },
    ],
  },
  "canthal-tilt": {
    title: "Reading your canthal tilt result",
    alt: "Canthal tilt calculator diagram showing the angle between inner and outer eye corners",
    caption: "Tilt is the angle of the line from the inner to the outer corner of each eye.",
    paragraphs: [
      "The calculator measures each eye separately because most people have slightly different tilts on each side. It also measures against the line joining your two eyes, so a tilted head doesn't make your tilt look more positive or negative than it is.",
      "Expression matters. Smiling lifts the lower lids and outer corners, which increases tilt, while a tired or relaxed face can lower it. For a baseline, keep a neutral face and look straight into the lens at eye level.",
      "If you want a more lifted look, makeup is the easiest tool: a winged liner angled up from the outer corner, lifted brow tails and shadow blended up and out all make tilt appear more positive without changing anything permanent.",
    ],
    faqs: [
      {
        q: "What is a normal canthal tilt?",
        a: "Most adults measure between 0° and about +6°. Small negative values are also common.",
      },
      {
        q: "Does canthal tilt change with age?",
        a: "Yes. The outer corners tend to drop slightly as skin and supporting tissue relax.",
      },
    ],
  },
  "facial-proportions": {
    title: "Using facial proportions for hair and makeup",
    alt: "Facial proportions calculator diagram dividing the face into thirds",
    caption: "Brow line, nose base and chin divide the face into thirds.",
    paragraphs: [
      "Facial proportions are most useful as a styling map. If your lower third is longer than your middle third, fuller hair at cheek level and a softer lip line balance it. If your middle third is longer, a fringe or blush placed lower on the cheeks shortens it visually.",
      "The midface ratio is popular online as a measure of a compact face. A lower ratio means the space between eyes and mouth is shorter relative to eye spacing. Like all of these ratios, it varies naturally across people and ethnic groups.",
      "Use photos taken from arm's length or further with the camera at eye level. Tilting your head up or down changes the thirds dramatically, so keep your chin level, ideally with your ears in line with your eyes.",
    ],
    faqs: [
      {
        q: "Are equal thirds the ideal?",
        a: "Equal thirds come from classical art. Real faces vary, and many attractive faces have unequal thirds.",
      },
      {
        q: "What is the lip-to-chin ratio?",
        a: "The distance from nose base to mouth compared with mouth to chin. The classic ideal is about one to two.",
      },
    ],
  },
  attractiveness: {
    title: "How the attractiveness test scores you",
    alt: "Attractiveness test diagram combining symmetry, proportion and eye tilt measurements",
    caption: "Six geometric measures are weighted into one facial harmony score.",
    paragraphs: [
      "The score combines six measures that research and beauty tradition link to facial harmony: symmetry, golden ratio proportions, eye tilt, balance between facial thirds, midface compactness and eye spacing. Symmetry carries the most weight, since it has the strongest support in studies.",
      "What it can't measure matters just as much. Skin quality, hair, grooming, expression and confidence all change how people see you, and none of them appear in landmark geometry. A warm smile in real life outweighs a decimal point here.",
      "To see your best result, use soft front light and a camera at eye level from arm's length. Try a few photos and keep the highest — that's closest to how you look in person, not the worst angle.",
      "People judge faces in motion, not in still frames. Expression, eye contact and how you move all shape first impressions, and familiarity makes faces look more appealing over time. Use the breakdown to learn which angles and styles flatter you, then focus on grooming, sleep and confidence, which change how you come across far more than any ratio.",
      "Scores also depend on the camera. Front cameras on phones use wide lenses that distort faces held close, which lowers symmetry and ratio scores. Holding the phone further away and zooming in slightly gives a more natural result.",
    ],
    faqs: [
      {
        q: "Why is the lowest score 3.5?",
        a: "Geometry can't capture what makes a face appealing, so the scale is intentionally kind and centered around 6.5.",
      },
      {
        q: "Is my photo stored or rated by people?",
        a: "No. The score is calculated on your device and nothing is shared.",
      },
    ],
  },
  "face-rating": {
    title: "How each face rating part is scored",
    alt: "Face rating test diagram showing five scored measurements on a face",
    caption: "Golden ratio, canthal tilt, symmetry, thirds and midface each get a score out of 10.",
    paragraphs: [
      "Each part is scored out of ten. Golden ratio averages how close five proportions come to 1.618. Canthal tilt peaks at a slight upward angle of about four to nine degrees. Symmetry compares mirrored points on both sides of the face.",
      "Facial thirds rewards a middle third about equal to the lower third, and midface ratio rewards a compact space between the eyes and upper lip. The overall rating weights symmetry most, then golden ratio, then the rest.",
      "The breakdown is more useful than the total. A lower canthal tilt score, for example, tells you that liner angled upward and lifted brows will change the overall impression of your face more than anything else.",
    ],
    faqs: [
      {
        q: "Why does my rating change between photos?",
        a: "Small shifts in head angle and expression move several measurements at once. Average two or three photos.",
      },
      {
        q: "Does the rating consider skin or hair?",
        a: "No, only facial geometry from landmarks.",
      },
    ],
  },
  "skin-tone": {
    title: "Using your skin tone results day to day",
    alt: "Skin tone analyzer diagram showing forehead, cheek and chin sampling points and a tone scale",
    caption: "Skin is sampled at the forehead, cheeks and chin, then placed on a 10-shade scale.",
    paragraphs: [
      "Your undertone is the most useful result. Warm undertones glow in golden, olive and earthy shades; cool undertones look clearest in blue-based pinks, jewel tones and crisp white; neutral undertones can borrow from both. Olive skin often suits deep greens, golds and warm reds.",
      "Use the swatches as a shopping filter. Hold a top in a store mirror near your face in daylight: if your skin looks even and your eyes look brighter, it's working. If shadows look grayer or redness appears, the color is fighting your undertone.",
      "Skin tone changes with seasons and tanning, so re-run the analysis when you switch foundations. Undertone stays the same all year, which makes it the safer guide for clothes, hair color and jewelry.",
    ],
    faqs: [
      {
        q: "What is the Monk Skin Tone scale?",
        a: "A 10-shade scale published by Google to describe skin tones more inclusively than the older Fitzpatrick scale.",
      },
      {
        q: "Can makeup affect the result?",
        a: "Yes. Foundation and bronzer change the sampled color, so use a bare-skin photo.",
      },
    ],
  },
  "color-analysis": {
    title: "Using your color season palette",
    alt: "Color analysis quiz palette showing seasonal color swatches",
    caption: "Each season has its own palette, neutrals and metals.",
    paragraphs: [
      "Start with the colors worn closest to your face: tops, scarves, glasses frames and lipstick. Those are the places where a palette makes the most visible difference. Trousers, shoes and bags matter far less and can stay neutral.",
      "Seasonal color analysis sorts coloring along three traits: warm or cool, light or deep, and bright or soft. Your season comes from whichever trait is strongest. That's why two people with the same hair color can land in different seasons.",
      "Test the result with a mirror in daylight. Hold a palette color and its opposite under your chin. The right color evens out skin and brightens eyes; the wrong one emphasizes shadows and redness. If a neighboring season looks better, trust your eyes.",
    ],
    faqs: [
      {
        q: "Do I have to throw out clothes outside my palette?",
        a: "No. Wear them away from your face, or add a scarf or collar in a palette color near your face.",
      },
      {
        q: "What's the difference between 4 and 12 seasons?",
        a: "The 12-season system splits each of the four seasons into three, based on which trait is dominant.",
      },
    ],
  },
  concealer: {
    title: "Concealer shade guide by concern",
    alt: "Concealer shade finder diagram comparing under-eye and cheek color with corrector swatches",
    caption: "Under-eye color is compared with the cheeks to choose a corrector.",
    paragraphs: [
      "Dark circles come in different colors. Blue or purple shadows show through thin skin and need a peach, apricot or orange corrector depending on skin depth. Brown pigmentation needs a salmon or orange tone. Redness around the nose and blemishes needs a yellow or green corrector.",
      "After correcting, apply concealer only where it's needed. For brightening under the eyes, choose a shade about one step lighter than your foundation. For spots and scars, match your skin exactly; a lighter shade on a blemish makes it stand out.",
      "Texture matters as much as color. Creamy, hydrating formulas suit the delicate under-eye area, while thicker, matte formulas hold better on blemishes. Set lightly with powder so it doesn't crease or slide.",
    ],
    faqs: [
      {
        q: "Should concealer match my foundation?",
        a: "For blemishes, yes. For under-eyes, go about one shade lighter with the same undertone.",
      },
      {
        q: "Do I always need a corrector?",
        a: "Only if your under-eyes are noticeably darker or tinted. The tool tells you when you don't.",
      },
    ],
  },
  lipstick: {
    title: "Lipstick shade finder tips by undertone",
    alt: "Lipstick shade finder swatches matched to skin tone and undertone",
    caption: "Your skin depth and undertone narrow down the shades that flatter you.",
    paragraphs: [
      "Undertone decides the direction of a shade. Cool undertones suit blue-based reds, berries and pinks; warm undertones suit orange-based reds, corals and terracottas; neutral undertones suit true reds and rosy nudes. Depth decides how intense the shade can be before it looks too heavy or too faint.",
      "Nude lipstick is the hardest to choose. It should be slightly deeper than your natural lip and never lighter than your skin, or it can look washed out. The 'my lips but better' shade the tool suggests starts from your own lip color for that reason.",
      "Finish changes the effect. Matte formulas look bold and last longer, satin is easy to wear, and gloss makes lips look fuller. Try the same shade in two finishes before deciding a color doesn't work.",
      "Your natural lip color matters as much as your skin. Pigmented lips can make sheer shades look darker than in the tube, while pale lips show colors truer. A thin layer of concealer or lip primer neutralizes your base when you want a shade to look exactly as swatched. Reapply after eating and blot once to set the color.",
    ],
    faqs: [
      {
        q: "How do I test lipstick in a store?",
        a: "Swatch on your fingertips, which are closer to lip color than the back of your hand, and check in daylight.",
      },
      {
        q: "Can I wear shades outside my palette?",
        a: "Of course — the suggestions are a starting point, not rules.",
      },
    ],
  },
  blush: {
    title: "Blush placement and formulas",
    alt: "Blush shade finder diagram showing blush placement on the cheeks",
    caption: "Blush color follows your undertone; placement follows your face shape.",
    paragraphs: [
      "Blush should look like a natural flush, so the best shade is often close to the color your cheeks turn after exercise. Warm undertones usually flush peach or coral, cool undertones pink or rose, and neutral undertones somewhere in between.",
      "Placement changes the shape of your face. Sweeping blush upward toward the temples lifts and lengthens; applying it horizontally toward the nose shortens a long face; keeping it on the apples softens angles. The tool picks placement from your detected face shape.",
      "Deeper skin needs more pigment, or blush can look gray. Lighter skin is easy to overdo, so tap off excess and build in layers. Cream formulas blend into bare or hydrated skin; powders last longer over foundation.",
    ],
    faqs: [
      {
        q: "Should blush and lipstick match?",
        a: "They don't need to match exactly, but staying in the same warm or cool family keeps the look cohesive.",
      },
      {
        q: "Where are the apples of my cheeks?",
        a: "Smile — the rounded parts that rise are the apples.",
      },
    ],
  },
  eyeshadow: {
    title: "Building an eyeshadow look that makes your eyes pop",
    alt: "Eyeshadow shade finder diagram showing iris color and contrasting shadow swatches",
    caption: "Iris color is sampled from the lower half of each iris to avoid lashes and reflections.",
    paragraphs: [
      "Contrast is what makes eye color look brighter. Colors opposite your iris on the color wheel intensify it: coppers and warm browns for blue eyes, plums and burgundies for green, purples and olives for hazel. Brown eyes have the widest range and suit both warm metallics and cool jewel tones.",
      "A simple three-shade routine works for everyone. Sweep the neutral base across the lid, press the crease shade into the socket with a fluffy brush, then add the pop color to the outer third and along the lower lash line.",
      "Eye color reading depends on light. Face a window and look straight into the camera so the iris isn't shaded by lashes. If the detected color looks wrong, pick the palette for your real eye color — the advice still applies.",
    ],
    faqs: [
      {
        q: "What eyeshadow suits hooded eyes?",
        a: "Matte shades blended above the crease show best. Use the eye shape detector for placement tips.",
      },
      {
        q: "Do I need primer?",
        a: "It helps colors show true and stops creasing, especially on oily lids.",
      },
    ],
  },
  "body-type": {
    title: "How the body type calculator estimates your build",
    alt: "Body type calculator illustration comparing ectomorph, mesomorph and endomorph builds",
    caption: "Frame size, BMI and body ratios each nudge the three somatotype scores.",
    paragraphs: [
      "Frame size comes from your height divided by your wrist circumference, a standard method used in nutrition guides. A small frame pushes toward ectomorph, a large frame toward endomorph or mesomorph. BMI and waist-to-height then show how much mass that frame carries.",
      "Shoulder-to-waist ratio separates a muscular build from a heavier one with similar weight. A high ratio adds to the mesomorph score; a high waist-to-height adds to endomorph. The three scores become percentages, so you see your mix rather than a single label.",
      "Somatotypes were proposed in the 1940s and are now used loosely in fitness. They describe tendencies, not destiny. Training and nutrition move your scores over time, so recalculate every few months if you're working toward a goal.",
      "Measure in the morning, before eating, in light clothing. Keep the tape snug but not tight and parallel to the floor. For shoulders, wrap the tape around the widest point over your arms with them relaxed at your sides. Small errors matter less than consistency, so use the same method each time you recalculate and compare trends rather than single results.",
    ],
    faqs: [
      {
        q: "Is BMI accurate for muscular people?",
        a: "Not very — it can't tell muscle from fat. That's why the calculator also uses frame size and body ratios.",
      },
      {
        q: "Can I be two body types?",
        a: "Yes, most people are a mix. A close second shows as a combined result like ecto-mesomorph.",
      },
    ],
  },
  "kibbe-test": {
    title: "How the Kibbe body type test scores you",
    alt: "Kibbe body type test illustration showing five body silhouettes from yang to yin",
    caption: "Answers lean toward five families, from sharp yang to soft yin.",
    paragraphs: [
      "Each answer adds points to one family. Dramatic answers describe length and sharpness, Natural answers describe breadth and bluntness, Classic answers describe balance, Gamine answers describe a compact mix of sharp and soft, and Romantic answers describe softness and curves.",
      "Your strongest family sets your main type. Your second family decides the variation: Dramatic with Romantic becomes Soft Dramatic, Natural with Dramatic becomes Flamboyant Natural, and so on. A clear lead with no strong second keeps you in the pure type.",
      "Answer for your bone structure and natural shape rather than your style preferences or current weight. Asking a friend to answer about you, or comparing full-length photos, often gives a more accurate result.",
      "Full-length photos help a lot. Take one straight on and one from the side in fitted clothing, standing naturally. Look at your vertical line first — whether you read long, moderate or compact — then at bone width and softness. Those three impressions decide most results. Style preferences and favorite outfits can come later, once you know which lines your body naturally carries.",
    ],
    faqs: [
      {
        q: "Why did I get a different type than an online forum suggested?",
        a: "Kibbe typing is subjective and communities disagree. Read the descriptions of your top two types and see which feels right.",
      },
      {
        q: "Does height decide my type?",
        a: "Height matters, but how long your lines look matters more. Some petite people read as long-lined.",
      },
    ],
  },
  "kibbe-types": {
    title: "Choosing between neighboring Kibbe body types",
    alt: "Kibbe body types illustration with silhouettes for the five Kibbe families",
    caption: "Five families, each with a yin or yang variation, make up the 13 types.",
    paragraphs: [
      "Neighboring types share a family but differ in their yin or yang lean. A Soft Dramatic and a Dramatic are both long and bold, but the Soft Dramatic adds curves and softer features, so they look best in draping rather than stiff geometry.",
      "When you're unsure, try clothing lines rather than labels. Put on a sharply tailored jacket and then a soft wrap top. Notice which one makes your outline look intentional. Repeat with a long column dress and a cropped, broken-line outfit.",
      "Your type doesn't change with weight, age or fitness. It reflects bone structure and overall impression, which is why the system focuses on line, scale and fabric rather than body measurements.",
    ],
    faqs: [
      {
        q: "What's the most common Kibbe type?",
        a: "There's no official data. Online communities report Soft Natural, Soft Classic and Soft Gamine often, but self-typing is unreliable.",
      },
      {
        q: "Can men use Kibbe types?",
        a: "Yes. The same families describe line and scale in any body; only the clothing examples change.",
      },
    ],
  },
  "blur-face": {
    title: "When to blur faces before sharing photos",
    alt: "Blur face online example with faces in a group photo blurred automatically",
    caption: "Every detected face is blurred; click any face to keep it sharp.",
    paragraphs: [
      "Blurring is good practice whenever someone in a photo hasn't agreed to be shared — bystanders at events, children at school activities, or people in the background of a street photo. Many platforms and workplaces also expect faces to be hidden in screenshots of chats or video calls.",
      "Choose pixelate for a clearly censored look and blur for a softer result that keeps the photo pleasant. Set the strength high when anonymity matters: light blur can sometimes be partly recognized, especially for people you know.",
      "Faces that are very small, turned sideways or covered by sunglasses and masks can be missed by detection. Check the preview before downloading, and use a higher-resolution photo if a face wasn't found.",
      "Because the tool works offline after the first load, you can blur face online even on a slow connection: once the model is cached, nothing else needs to download. Large photos are resized to 2000 pixels on the longest side before blurring, which keeps the browser fast while staying sharp enough for social media and documents.",
      "Blurring also helps with documents. Before sharing a screenshot of an ID, a team photo or a classroom picture, hide every face that isn't yours to share. The download keeps the original framing, so the image still makes sense to whoever receives it, and you can switch between blur and pixelate until it looks right.",
    ],
    faqs: [
      {
        q: "Does it work on screenshots?",
        a: "Yes, any JPG, PNG or WebP image works, including screenshots of video calls.",
      },
      {
        q: "Is there a watermark?",
        a: "No. The downloaded PNG has no watermark and keeps your photo's resolution up to 2000 pixels.",
      },
    ],
  },
};
