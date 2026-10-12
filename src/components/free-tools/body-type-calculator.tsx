"use client";

import * as React from "react";

import { bodyTypeResult, type Sex } from "@/lib/body-type";
import type { AnalysisResult } from "@/lib/face/analysis-result";

import { MeasureField, SegmentedControl } from "./measure-field";
import { ResultCard } from "./result-card";

const fields = [
  {
    key: "height",
    label: "Height",
    help: "Standing straight, without shoes.",
    cm: [120, 230],
    in: [48, 90],
  },
  {
    key: "weight",
    label: "Weight",
    help: "Morning weight is most consistent.",
    cm: [30, 250],
    in: [66, 550],
  },
  {
    key: "wrist",
    label: "Wrist",
    help: "Around the wrist, just above the wrist bone.",
    cm: [10, 25],
    in: [4, 10],
  },
  {
    key: "shoulders",
    label: "Shoulders",
    help: "Around the widest part of your shoulders.",
    cm: [70, 170],
    in: [28, 67],
  },
  {
    key: "waist",
    label: "Waist",
    help: "Around your natural waist.",
    cm: [45, 180],
    in: [18, 71],
  },
  {
    key: "hips",
    label: "Hips",
    help: "Around the fullest part of your hips.",
    cm: [60, 190],
    in: [24, 75],
  },
] as const;

type Key = (typeof fields)[number]["key"];
const IN = 2.54;
const LB = 0.453592;

export function BodyTypeCalculator() {
  const [unit, setUnit] = React.useState<"cm" | "in">("cm");
  const [sex, setSex] = React.useState<Sex>("female");
  const [values, setValues] = React.useState<Record<Key, string>>({
    height: "",
    weight: "",
    wrist: "",
    shoulders: "",
    waist: "",
    hips: "",
  });
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [error, setError] = React.useState("");

  function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bad = fields.find((f) => {
      const v = Number(values[f.key]);
      const [lo, hi] = f[unit];
      return !Number.isFinite(v) || v < lo || v > hi;
    });
    if (bad) {
      const [lo, hi] = bad[unit];
      setError(`${bad.label} should be between ${lo} and ${hi}.`);
      setResult(null);
      return;
    }
    const n = (k: Key) => Number(values[k]);
    const len = (k: Key) => (unit === "cm" ? n(k) : n(k) * IN);
    setError("");
    setResult(
      bodyTypeResult({
        sex,
        heightCm: len("height"),
        weightKg: unit === "cm" ? n("weight") : n("weight") * LB,
        wristCm: len("wrist"),
        shouldersCm: len("shoulders"),
        waistCm: len("waist"),
        hipsCm: len("hips"),
      }),
    );
  }

  return (
    <div className="card mx-auto mt-10 max-w-3xl p-5 shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-8">
      <form onSubmit={calculate}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SegmentedControl
            label="Sex"
            value={sex}
            onChange={(v) => {
              setSex(v);
              setResult(null);
            }}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
          <SegmentedControl
            label="Units"
            value={unit}
            onChange={(v) => {
              setUnit(v);
              setResult(null);
            }}
            options={[
              { value: "cm", label: "Cm / kg" },
              { value: "in", label: "In / lb" },
            ]}
          />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <MeasureField
              key={f.key}
              id={`body-type-${f.key}`}
              label={f.label}
              help={f.help}
              unit={f.key === "weight" ? (unit === "cm" ? "kg" : "lb") : unit}
              min={f[unit][0]}
              max={f[unit][1]}
              value={values[f.key]}
              onChange={(v) => {
                setValues((cur) => ({ ...cur, [f.key]: v }));
                setResult(null);
              }}
            />
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-[var(--debit-text)]">
            {error}
          </p>
        ) : null}
        <button type="submit" className="pill pill-brand mt-7 px-6 py-3">
          Calculate my body type
        </button>
      </form>
      {result ? <ResultCard result={result} /> : null}
    </div>
  );
}
