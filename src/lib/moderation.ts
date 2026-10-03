// Pre-call content screen for user-written prompts (both tools). Blocks
// undress/nudity, sexual content, and anything involving minors (hard), and
// keeps swimwear/lingerie/suggestive wording out of the MVP (soft). Runs
// before any credit is spent; the provider's own moderation (DashScope
// DataInspectionFailed) is the second layer for photos and outputs.
// Never echo the matched word back to the user.

export type Severity = "hard" | "soft";
export type Rule =
  | "minor"
  | "nudity"
  | "undress"
  | "sexual"
  | "lingerie"
  | "swimwear"
  | "suggestive"
  | "nonenglish"
  /** Latin words disguised with Cyrillic/Greek look-alike letters. */
  | "evasion"
  /** Any non-Latin script — the tools and presets are English-only. */
  | "script";

export type ScreenResult = { rule: Rule; severity: Severity } | null;

const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
  "!": "i",
};

// Zero-width and other invisible characters: deleted (not turned into
// spaces), so "na\u200bked" can't split a word.
const INVISIBLE = /[\p{Cf}\p{Default_Ignorable_Code_Point}]/gu;

// Cyrillic/Greek letters that look like Latin ones ("nаkеd" with Cyrillic
// а/е). Folded to Latin before matching the English rules.
const CONFUSABLES: Record<string, string> = {
  а: "a",
  в: "b",
  е: "e",
  ё: "e",
  к: "k",
  м: "m",
  н: "h",
  о: "o",
  р: "p",
  с: "c",
  т: "t",
  у: "y",
  х: "x",
  і: "i",
  ї: "i",
  ј: "j",
  ѕ: "s",
  ԁ: "d",
  ԛ: "q",
  ԝ: "w",
  α: "a",
  β: "b",
  ε: "e",
  η: "n",
  ι: "i",
  κ: "k",
  ν: "v",
  ο: "o",
  ρ: "p",
  τ: "t",
  υ: "u",
  χ: "x",
  ω: "w",
};

function base(s: string): string {
  return s
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function foldConfusables(s: string): string {
  return s.replace(
    /[\u0370-\u03ff\u0400-\u04ff\u0500-\u052f]/g,
    (c) => CONFUSABLES[c] ?? c,
  );
}

/** Lowercase, strip accents/invisibles/look-alikes, undo leetspeak. */
function normalize(s: string): string {
  let t = foldConfusables(base(s));
  t = t.replace(/[013457@$!]/g, (c) => LEET[c] ?? c);
  t = t.replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  // "n u d e" -> "nude"
  t = t.replace(/\b(?:\p{L} ){2,}\p{L}\b/gu, (m) => m.replace(/ /g, ""));
  // "nuuuude" -> "nude"
  t = t.replace(/(\p{L})\1{2,}/gu, "$1");
  return t;
}

/** Same, but digits survive — for age patterns ("15yo"). */
function normalizeDigits(s: string): string {
  return foldConfusables(base(s))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// Legitimate fashion/hair phrases removed before matching ("nude heels",
// "double breasted", "baby bangs", "sheer tights", ...).
const ALLOW = [
  /\bnude (?:colou?r(?:ed)?|tones?|toned|shade|beige|pink|heels?|pumps?|shoes?|sandals?|flats|boots?|lipstick|lips?|lip gloss|makeup|nails?|polish|manicure|eyeshadow|palette)\b/g,
  /\bdouble breasted\b/g,
  /\bbreast pocket\b/g,
  /\bbaby (?:blue|pink|yellow|doll|tee|t shirt|hairs?|bangs|braids?|curls|powder|breath)\b/g,
  /\bkid (?:gloves?|leather|suede)\b/g,
  /\bkidskin\b/g,
  /\bboxer braids?\b/g,
  /\bwet look\b/g,
  /\bbare (?:shoulders?|arms?|legs?|feet|foot|midriff|back|neck|face|skin tone)\b/g,
  /\ba minor (?:change|edit|tweak|adjustment|fix|detail|touch)\w*\b/g,
  /\bsheer (?:tights|stockings|sleeves?|scarf|socks|overlay|kimono)\b/g,
  // Ordinary outfit wording that trips the abuse rules.
  /\bnude (?:dress|skirt|midi|maxi|top|blazer|knit|sweater|cardigan|trench|coat|suit)\b/g,
  /\b(?:transparent|clear|translucent) (?:raincoat|umbrella|heels?|pumps?|sandals?|bag|tote|frames?|glasses|buttons?|straps?|vinyl)\b/g,
  /\binvisible (?:zip\w*|seams?|hems?)\b/g,
  /\b(?:strip|remove|erase|delete|get rid of)(?: the)? (?:logo|logos|stain|stains|print|graphic|wrinkles?|tag|label|pattern|text|writing)\b/g,
  /\btear away\b/g,
  /\bchest pocket\b/g,
  /\bthong sandals?\b/g,
  /\bgarter stitch\b/g,
  /\bnaughty or nice\b/g,
  /\bmoby dick\b/g,
  /\bsex pistols\b/g,
];

// Hair-tool wording ("nude blonde", "sheer highlights", "a minor trim").
const HAIR_ALLOW = [
  /\bnude (?:blonde?|brown|beige|caramel|honey|balayage|highlights?|hair(?: colou?r)?)\b/g,
  /\b(?:sheer|see through|transparent|translucent|wispy) (?:bangs|fringe|highlights?|layers|ends|curtain bangs)\b/g,
  /\binvisible (?:hairline|part|parting|layers)\b/g,
  /\ba minor (?:trim|cut|haircut|change)\w*\b/g,
  /\bhair (?:\w+ ){0,2}covering (?:the |her |his |their )?(?:chest|shoulders?)\b/g,
];

const RULES: readonly [Rule, Severity, RegExp][] = [
  // [rule, severity, regex] -- severity: hard = minor/nudity/undress/sexual; soft = lingerie/swimwear/suggestive (MVP-blocked, specific message)
  [
    "minor",
    "hard",
    /\b(?:child|children|childlike|kids?|kiddie|toddlers?|infants?|newborns?|babies|preteens?|pre teens?|tweens?|teens?|teenage|teenagers?|adolescents?|underage|under aged?|minors|juvenile|schoolgirls?|schoolboys?|school girls?|school boys?|school uniform|little (?:girl|boy)s?|young (?:girl|boy)s?|lolis?|lolita|shota|jailbait|barely legal|pedo\w*|paedo\w*|csam|cp porn)\b/,
  ],
  ["minor", "hard", /\ba minor\b/],
  ["minor", "hard", /\bbaby\b/],
  [
    "nudity",
    "hard",
    /\b(?:naked|nude|nudes|nudity|nudist|topless|bottomless|shirtless|bare chested|barechested|in the buff|birthday suit|au naturel|unclothed|undressed|disrobed|starkers)\b/,
  ],
  [
    "nudity",
    "hard",
    /\b(?:nipples?|areolas?|areolae|genitals?|genitalia|vagina|vulva|labia|penis|dick|cock|pussy|clit\w*|boobs?|boobies|tits|titties|breasts|buttocks|butt cheeks|crotch|camel ?toe|pubic|pubes|anus|bare (?:chest|breasts?|butt|ass|bottom|body|torso|skin))\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:undress\w*|disrob\w*|unclothe\w*|declothe\w*|nudif\w*|nudeify|strip(?:s|ped|ping|per|pers|tease)?|striptease)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:remov\w*|strip(?:s|ped|ping)?|unbutton\w*|unzip\w*|unhook\w*|unlac\w*|eras\w*|delet\w*|get rid of|ditch\w*|lose|losing)(?: (?!from\b|on\b|in\b|of\b|under\b)\w+){0,3}? (?:cloth(?:es|ing)?|outfit|garments?|shirt|t shirt|top|blouse|dress|skirt|pants|trousers|jeans|shorts|bra|bras|underwear|panties|knickers|lingerie|bikini|swimsuit|towel|robe|everything)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:take|takes|taking|took|taken|pull\w*|peel\w*)(?: \w+){0,3}? (?:cloth(?:es|ing)?|outfit|garments?|shirt|t shirt|top|blouse|dress|skirt|pants|trousers|jeans|shorts|bra|bras|underwear|panties|knickers|lingerie|bikini|swimsuit|towel|robe|everything)(?: \w+)?? (?:off|down)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:take|takes|taking|took|taken|pull\w*|peel\w*|slip\w*) (?:off|down|out of)(?: \w+){0,2}? (?:cloth(?:es|ing)?|outfit|garments?|shirt|t shirt|top|blouse|dress|skirt|pants|trousers|jeans|shorts|bra|bras|underwear|panties|knickers|lingerie|bikini|swimsuit|towel|robe|everything)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:rip\w*|tear\w*|tore|torn) (?:off|open|away)(?: (?:her|his|their|the|my))? (?:cloth(?:es|ing)?|outfit|garments?|shirt|t shirt|top|blouse|dress|skirt|pants|trousers|jeans|shorts|bra|bras|underwear|panties|knickers|lingerie|bikini|swimsuit|towel|robe|everything)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:without|no|minus|zero|lacking)(?: (?:any|her|his|their|a|an|the))? (?:cloth(?:es|ing)?|outfit|garments?|shirt|t shirt|top|blouse|dress|skirt|pants|trousers|jeans|shorts|bra|bras|underwear|panties|knickers|lingerie|bikini|swimsuit|towel|robe|everything)\b/,
  ],
  [
    "undress",
    "hard",
    /\blift\w*(?: up)?(?: (?:her|his|their|the|my))? (?:shirt|t shirt|top|blouse|dress|skirt)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:hair|hands?|towel|sheets?|blanket|leaves|foam|bubbles|arms?)(?: \w+){0,2}? cover\w*(?: (?:her|his|their|the|my))? (?:body|chest|breasts?|privates?|private parts|nipples?|crotch|torso)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:cloth(?:es|ing)?|outfit|garments?|dress|shirt|top|fabric|bikini|swimsuit|underwear) (?:\w+ ){0,2}?(?:removed|gone|vanish\w*|disappear\w*|missing|dissolv\w*|melt\w*|(?:fall|falls|falling|fell|fallen|slip|slips|slipping|slipped|come|comes|coming|came) off)\b/,
  ],
  ["undress", "hard", /\b(?:cloth(?:es|ing)?|outfit|garments?) off\b/],
  [
    "undress",
    "hard",
    /\b(?:see through|seethrough|transparent|translucent|invisible|x ?ray|xray)\b/,
  ],
  ["undress", "hard", /\bsheer\b/],
  [
    "undress",
    "hard",
    /\bwet (?:t shirt|tshirt|shirt|top|blouse|dress|clothes|clothing|fabric|white)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:only|just|nothing but|covered (?:only )?(?:by|with|in)|wearing nothing)\b(?: (?:a|an|the|her|his|their|my))? (?:towel|bed ?sheets?|sheets?|blanket|hands?|hair|leaves|leaf|foam|bubbles|body ?paint|paint|tape|ribbons?|strings?|chains?|censor bars?|emojis?|nothing)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:body ?paint\w*|censor(?:ed)? bars?|pixelat\w*|mosaic(?:ed)? (?:censor|private))\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:skin|flesh|nude) (?:tones?|toned|colou?red) (?:body ?suit|leotard|cat ?suit|body ?stocking|unitard|lingerie|bra|underwear)\b/,
  ],
  [
    "sexual",
    "hard",
    /\b(?:sex|sexual\w*|porn\w*|xxx|nsfw|erotic\w*|hentai|lewd|explicit|fetish\w*|bdsm|bondage|kinky|orgasm\w*|aroused|horny|masturbat\w*|cum|semen|sperm|blow ?job|handjob|fellatio|onlyfans|playboy|cam ?girl|escort|hooker|whore|slut\w*|boudoir|spread (?:her |his |their )?legs|bend\w* over|on all fours)\b/,
  ],
  [
    "sexual",
    "hard",
    /\b(?:bigger|larger|huge|giant|enormous|enlarg\w*|increase\w*|perkier|fuller|busty|voluptuous) (?:\w+ ){0,2}?(?:breasts?|boobs?|tits|bust|chest|butt|ass|booty|hips|thighs|cleavage)\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:wearing nothing|with nothing on|nothing (?:on|under\w*|beneath|underneath))\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:shirt|t shirt|top|blouse|dress|skirt|pants|bra|clothes|clothing|outfit|underwear|panties) off\b(?! (?:the |one |both )?shoulders?| white| duty| the rack)/,
  ],
  [
    "undress",
    "hard",
    /\b(?:remov\w*|take|taking|strip\w*)(?: \w+){0,2} (?:what|everything) (?:she|he|they) (?:is |s |are |re )?wearing\b/,
  ],
  [
    "undress",
    "hard",
    /\b(?:into|with|made of|replac\w* (?:\w+ ){0,2}with) (?:bare )?(?:skin|flesh)\b|\b(?:skin|flesh)(?: tones?)?(?: colou?red)? (?:outfit|dress|clothes|clothing|suit)\b/,
  ],
  [
    "nudity",
    "hard",
    /\b(?:braless|bra less|underboob|sideboob|nips|topfree|commando|unclad|nekkid|neked|nood|nudy|scantily|barely (?:dressed|clothed|covered)|half (?:dressed|clothed))\b/,
  ],
  [
    "sexual",
    "hard",
    /\b(?:rule 34|ecchi|ahegao|thirst trap|seggs\w*|secksy|sexi)\b/,
  ],
  [
    "minor",
    "hard",
    /\b(?:(?:elementary|primary|middle|junior high) ?school(?:ers?)?|high ?schoolers?|highschool (?:girl|boy)s?|grade school\w*|kindergarten\w*|diapers?|nappy|nappies|flat ?chested|jk uniform|joshi ?kosei|lolli\w*)\b/,
  ],
  [
    "lingerie",
    "soft",
    /\b(?:lingerie|underwear|under wear|undies|bra|bras|bralette|brassiere|panty|panties|knickers|thong|g ?string|boy ?shorts|boxers|boxer (?:shorts|briefs)|briefs|jock ?strap|negligee|nightie|garters?|garter belt|pasties|nipple covers?|corselette)\b/,
  ],
  [
    "swimwear",
    "soft",
    /\b(?:bikini|bikinis|swim ?suits?|swim ?wear|bathing suits?|swimming costume|monokini|tankini|swim trunks|swimming trunks|speedos?|board ?shorts|rash ?guard)\b/,
  ],
  [
    "suggestive",
    "soft",
    /\b(?:sexy|seductive\w*|sultry|provocative\w*|revealing|skimpy|racy|risque|steamy|naughty|raunchy|cleavage|booty shorts|micro (?:skirt|shorts|dress|mini))\b/,
  ],
  [
    "nonenglish",
    "hard",
    /(?:\bdesnud\w*|\bdesvest\w*|\bsin ropa\b|\bpelad[ao]s?\b|\bsem roupa\b|\bnackt\w*|\bausziehen\b|\boben ohne\b|\bunterwasche\b|\ba poil\b|\bsans vetements\b|\bdeshabill\w*|\bnuda\b|\bnudo\b|\bsvestit\w*|\bsenza vestiti\b|\btelanjang\b|\bbugil\b|(?<!\p{L})(?:гол(?:ая|ый|ые|ой|ую)|раздень\p{L}*|раздеть\p{L}*|без одежды)(?!\p{L})|裸|脱衣|脱光|脱掉|一丝不挂|色情|内衣|比基尼|ヌード|下着|全裸|脱が|나체|알몸|누드|벗겨|عاري)/u,
  ],
];

const NUM =
  "(?:[1-9]|1[0-7]|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen)";
const AGE = new RegExp(
  `\\b(?:${NUM} ?(?:yo|y o|yrs? old|years? old|year olds?)\\b|aged? ${NUM}\\b|look(?:s|ing)? (?:like )?(?:a |an )?${NUM}\\b(?! (?:years?|yrs?) (?:older|younger)))`,
);

// Explicit terms in other scripts (checked on the un-folded text). Anything
// else in a non-Latin script gets the soft "English only" answer.
const EXPLICIT_OTHER_SCRIPTS =
  /萝莉|蘿莉|幼女|未成年|ロリ|児童|女子高生|不穿衣服|没穿衣服|沒穿衣服|去掉衣服|光着身子|光著身子|露点|露點|脫光|內衣|脱いで|옷을 벗겨|обнаж\p{L}*|нижнее белье|γυμν\p{L}*|เปลือย/u;
const NON_LATIN_LETTER = /(?![\p{Script=Latin}])\p{L}/u;
// A word mixing Latin with Cyrillic/Greek letters is a disguise attempt.
const MIXED_SCRIPT_WORD =
  /(?=[\p{L}]*\p{Script=Latin})(?=[\p{L}]*[\p{Script=Cyrillic}\p{Script=Greek}])[\p{L}]{2,}/u;

// Words split to dodge the rules ("na ked", "und.r3ss"): re-joined pairs
// and triples of short fragments must not form one of these.
const SPLIT_STEMS =
  /^(?:naked|nude|nudes|nudity|topless|undress\w*|nudif\w*|nsfw|porn\w*|hentai|lingerie)$/;

const GARMENT_WORDS =
  /bodysuit|body suit|leotard|catsuit|cat suit|stocking|unitard|lingerie|bra|underwear/;

export function screenPrompt(
  raw: string,
  tool: "hair" | "clothes" = "clothes",
): ScreenResult {
  const plain = base(raw);
  if (EXPLICIT_OTHER_SCRIPTS.test(plain)) {
    return { rule: "nonenglish", severity: "hard" };
  }
  if (MIXED_SCRIPT_WORD.test(plain)) {
    return { rule: "evasion", severity: "hard" };
  }
  const withDigits = normalizeDigits(raw);
  if (AGE.test(withDigits)) {
    return { rule: "minor", severity: "hard" };
  }
  // Number slang the leetspeak pass would mangle ("r34" -> "rea").
  if (/\b(?:rule ?34|r ?34|r ?18)\b/.test(withDigits)) {
    return { rule: "sexual", severity: "hard" };
  }

  const full = normalize(raw);
  let text = full;
  for (const re of ALLOW) text = text.replace(re, " ");
  if (tool === "hair")
    for (const re of HAIR_ALLOW) text = text.replace(re, " ");

  const words = text.split(" ").filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    for (const span of [2, 3]) {
      const joined = words.slice(i, i + span).join("");
      if (words.length >= i + span && SPLIT_STEMS.test(joined)) {
        return { rule: "nudity", severity: "hard" };
      }
    }
  }

  for (const [rule, severity, re] of RULES) {
    // "nude colored bodysuit" must be judged before the allowlist strips
    // "nude colored".
    const target = rule === "undress" && GARMENT_WORDS.test(full) ? full : text;
    if (re.test(target)) return { rule, severity };
  }

  // Only now, so that explicit terms above still get the hard answer.
  if (NON_LATIN_LETTER.test(plain)) return { rule: "script", severity: "soft" };
  return null;
}
