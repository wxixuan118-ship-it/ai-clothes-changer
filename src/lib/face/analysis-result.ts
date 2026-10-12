// One shape for every free tool's result, so a single card renders them all.

export type Metric = {
  label: string;
  value: string;
  hint?: string;
  /** 0–100, drawn as a bar when present. */
  score?: number;
};

export type Swatch = { name: string; hex: string; note?: string };

export type AnalysisResult = {
  eyebrow: string;
  title: string;
  summary: string;
  score?: { value: number; max: number; label: string };
  tags?: string[];
  metrics: Metric[];
  swatches?: { title: string; items: Swatch[] }[];
  sections: { title: string; items: string[] }[];
  warnings?: string[];
  links?: { href: string; label: string }[];
};
