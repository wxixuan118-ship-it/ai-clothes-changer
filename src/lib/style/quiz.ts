import type { AnalysisResult } from "@/lib/face/analysis-result";

// A scored multiple-choice quiz. Each option adds points to one or more
// keys; `resolve` turns the totals into a result.

export type QuizOption<K extends string> = {
  label: string;
  scores: Partial<Record<K, number>>;
};

export type QuizQuestion<K extends string> = {
  q: string;
  hint?: string;
  options: QuizOption<K>[];
};

export type QuizDef<K extends string> = {
  keys: readonly K[];
  questions: QuizQuestion<K>[];
  resolve: (totals: Record<K, number>) => AnalysisResult;
};

export function tally<K extends string>(
  def: Pick<QuizDef<K>, "keys" | "questions">,
  answers: number[],
): Record<K, number> {
  const totals = Object.fromEntries(def.keys.map((k) => [k, 0])) as Record<K, number>;
  def.questions.forEach((question, i) => {
    const option = question.options[answers[i]];
    if (!option) return;
    for (const [k, v] of Object.entries(option.scores) as [K, number][]) {
      totals[k] += v;
    }
  });
  return totals;
}

/** Keys sorted by score, highest first. Ties keep `keys` order. */
export function ranked<K extends string>(keys: readonly K[], totals: Record<K, number>): K[] {
  return [...keys].sort((a, b) => totals[b] - totals[a]);
}
