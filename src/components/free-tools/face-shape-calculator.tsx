"use client";

import * as React from "react";

import type { AnalysisResult } from "@/lib/face/analysis-result";
import {
  faceShapeCalcResult,
  type ChinShape,
} from "@/lib/face/face-shape-calc";

import { MeasureField, SegmentedControl } from "./measure-field";
import { ResultCard } from "./result-card";

const fields = [
  {
    key: "forehead",
    label: "Forehead width",
    help: "Across the widest part of your forehead, halfway between brows and hairline.",
  },
  {
    key: "cheekbones",
    label: "Cheekbone width",
    help: "Across the widest point of your cheekbones, just below the outer eye corners.",
  },
  {
    key: "jaw",
    label: "Jaw width",
    help: "Straight across from one jaw corner (below the ear) to the other.",
  },
  {
    key: "length",
    label: "Face length",
    help: "From the center of your hairline to the tip of your chin.",
  },
] as const;

type Key = (typeof fields)[number]["key"];

export function FaceShapeCalculator() {
  const [unit, setUnit] = React.useState<"cm" | "in">("cm");
  const [values, setValues] = React.useState<Record<Key, string>>({
    forehead: "",
    cheekbones: "",
    jaw: "",
    length: "",
  });
  const [chin, setChin] = React.useState<ChinShape>("rounded");
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState("");
  const [min, max] = unit === "cm" ? [5, 40] : [2, 16];

  function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nums = Object.fromEntries(
      fields.map(({ key }) => [key, Number(values[key])]),
    ) as Record<Key, number>;
    if (
      Object.values(nums).some((v) => !Number.isFinite(v) || v < min || v > max)
    ) {
      setError(`Enter each measurement between ${min} and ${max} ${unit}.`);
      setResult(null);
      return;
    }
    setError("");
    setResult(faceShapeCalcResult({ ...nums, chin }));
  }

  return (
    <div className="card mx-auto mt-10 max-w-3xl p-5 shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-8">
      <form onSubmit={calculate}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-bold">Your measurements</p>
          <SegmentedControl
            label="Measurement unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "cm", label: "Cm" },
              { value: "in", label: "Inches" },
            ]}
          />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <MeasureField
              key={f.key}
              id={`face-${f.key}`}
              label={f.label}
              help={f.help}
              unit={unit}
              min={min}
              max={max}
              value={values[f.key]}
              placeholder={unit === "cm" ? "e.g. 14" : "e.g. 5.5"}
              onChange={(v) => {
                setValues((cur) => ({ ...cur, [f.key]: v }));
                setResult(null);
              }}
            />
          ))}
        </div>
        <div className="mt-6">
          <p className="font-semibold">Chin shape</p>
          <div className="mt-2">
            <SegmentedControl
              label="Chin shape"
              value={chin}
              onChange={(v) => {
                setChin(v);
                setResult(null);
              }}
              options={[
                { value: "rounded", label: "Rounded" },
                { value: "square", label: "Square" },
                { value: "pointed", label: "Pointed" },
              ]}
            />
          </div>
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-[var(--debit-text)]">
            {error}
          </p>
        ) : null}
        <button type="submit" className="pill pill-brand mt-7 px-6 py-3">
          Calculate my face shape
        </button>
      </form>
      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}
