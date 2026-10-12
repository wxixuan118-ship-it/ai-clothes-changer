"use client";

import * as React from "react";
import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { colorSeasonQuiz } from "@/lib/style/color-season";
import { faceShapeQuiz } from "@/lib/style/face-shape-quiz";
import { kibbeQuiz } from "@/lib/style/kibbe";
import { tally, type QuizDef } from "@/lib/style/quiz";

import { ResultCard } from "./result-card";

const quizzes = {
  "face-shape": faceShapeQuiz,
  "color-season": colorSeasonQuiz,
  kibbe: kibbeQuiz,
} as const;

export type QuizId = keyof typeof quizzes;

export function QuizTool({ quiz }: { quiz: QuizId }) {
  const def = quizzes[quiz] as QuizDef<string>;
  const [answers, setAnswers] = React.useState<number[]>([]);
  const step = answers.length;
  const done = step >= def.questions.length;
  const result = done ? def.resolve(tally(def, answers)) : null;
  const question = def.questions[step];

  return (
    <div className="card mx-auto mt-10 max-w-3xl p-5 shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[var(--muted-ink)]">
          {done
            ? "Your result"
            : `Question ${step + 1} of ${def.questions.length}`}
        </p>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setAnswers(done ? [] : answers.slice(0, -1))}
            className="pill pill-outline gap-1.5 px-3 py-1.5 text-sm"
          >
            {done ? (
              <RotateCcwIcon className="size-4" aria-hidden />
            ) : (
              <ArrowLeftIcon className="size-4" aria-hidden />
            )}
            {done ? "Start over" : "Back"}
          </button>
        ) : null}
      </div>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={def.questions.length}
        aria-valuenow={step}
        aria-label="Quiz progress"
      >
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width]"
          style={{ width: `${(step / def.questions.length) * 100}%` }}
        />
      </div>

      {question ? (
        <fieldset key={step} className="mt-7">
          <legend className="text-xl font-bold sm:text-2xl">
            {question.q}
          </legend>
          {question.hint ? (
            <p className="mt-2 text-sm text-[var(--muted-ink)]">
              {question.hint}
            </p>
          ) : null}
          <div
            className={cn(
              "mt-5 grid gap-3",
              question.options.length > 3 && "sm:grid-cols-2",
            )}
          >
            {question.options.map((option, i) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setAnswers([...answers, i])}
                className="min-h-14 rounded-2xl border bg-[var(--paper-2)] px-5 py-3 text-left font-semibold transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] focus-visible:border-[var(--brand)]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}
