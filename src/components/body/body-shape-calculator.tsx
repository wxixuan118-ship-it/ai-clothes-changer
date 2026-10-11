"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";

import {
  bodyShapeInfo,
  calculateBodyShape,
  calculateMaleBodyShape,
  convertMeasurement,
  maleBodyShapeInfo,
  type MeasurementUnit,
} from "@/lib/body-shape";

const femaleFields = [
  { key: "bust", label: "Bust", help: "Around the fullest part of your bust" },
  { key: "waist", label: "Waist", help: "Around your natural waist" },
  { key: "hips", label: "Hips", help: "Around the fullest part of your hips" },
] as const;

const maleFields = [
  {
    key: "shoulders",
    label: "Shoulders",
    help: "Wrap the tape around the widest part of your shoulders",
  },
  {
    key: "chest",
    label: "Chest",
    help: "Around the fullest part of your chest",
  },
  { key: "waist", label: "Waist", help: "Around your natural waist" },
  { key: "hips", label: "Hips", help: "Around the fullest part of your hips" },
] as const;

type FieldKey = "bust" | "shoulders" | "chest" | "waist" | "hips";
type FormValues = Record<FieldKey, string>;
const emptyValues: FormValues = {
  bust: "",
  shoulders: "",
  chest: "",
  waist: "",
  hips: "",
};
type ShapeInfo = {
  label: string;
  description: string;
  ideas: readonly string[];
};

export function BodyShapeCalculator({
  audience,
}: {
  audience: "female" | "male";
}) {
  const fields = audience === "female" ? femaleFields : maleFields;
  const [unit, setUnit] = React.useState<MeasurementUnit>("in");
  const [values, setValues] = React.useState<FormValues>(emptyValues);
  const [result, setResult] = React.useState<{
    audience: "female" | "male";
    info: ShapeInfo;
  } | null>(null);
  const [error, setError] = React.useState("");
  const activeResult = result?.audience === audience ? result.info : null;

  function changeUnit(nextUnit: MeasurementUnit) {
    if (nextUnit === unit) return;
    const convert = (value: string) =>
      value ? convertMeasurement(Number(value), unit, nextUnit).toFixed(1) : "";
    setValues((current) => ({
      bust: convert(current.bust),
      shoulders: convert(current.shoulders),
      chest: convert(current.chest),
      waist: convert(current.waist),
      hips: convert(current.hips),
    }));
    setUnit(nextUnit);
    setError("");
  }

  function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const min = unit === "in" ? 15 : 38;
    const max = unit === "in" ? 100 : 254;
    if (
      fields.some(
        ({ key }) =>
          !Number.isFinite(Number(values[key])) ||
          Number(values[key]) < min ||
          Number(values[key]) > max,
      )
    ) {
      setResult(null);
      setError(`Enter each measurement between ${min} and ${max} ${unit}.`);
      return;
    }
    if (audience === "female") {
      const shape = calculateBodyShape({
        bust: Number(values.bust),
        waist: Number(values.waist),
        hips: Number(values.hips),
      });
      setResult(shape ? { audience, info: bodyShapeInfo[shape] } : null);
    } else {
      const shape = calculateMaleBodyShape({
        shoulders: Number(values.shoulders),
        chest: Number(values.chest),
        waist: Number(values.waist),
        hips: Number(values.hips),
      });
      setResult(shape ? { audience, info: maleBodyShapeInfo[shape] } : null);
    }
    setError("");
  }

  function reset() {
    setValues(emptyValues);
    setResult(null);
    setError("");
  }

  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form
        onSubmit={calculate}
        className="rounded-[28px] border bg-[var(--paper-2)] p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--brand)]">Your measurements</p>
            <h2 className="mt-2 text-2xl font-bold">Calculate your shape</h2>
          </div>
          <div
            role="group"
            aria-label="Measurement unit"
            className="flex rounded-full border p-1 text-sm"
          >
            {(["in", "cm"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeUnit(option)}
                aria-pressed={unit === option}
                className={`rounded-full px-4 py-1.5 transition-colors ${unit === option ? "bg-[var(--brand)] text-[var(--ink-deep)]" : "text-[var(--muted-ink)] hover:text-[var(--ink)]"}`}
              >
                {option === "in" ? "Inches" : "Cm"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5">
          {fields.map(({ key, label, help }) => (
            <div key={key}>
              <label htmlFor={`body-${key}`} className="block font-semibold">
                {label}
              </label>
              <p
                id={`body-${key}-help`}
                className="mt-1 text-sm text-[var(--muted-ink)]"
              >
                {help}
              </p>
              <div className="relative mt-2">
                <input
                  id={`body-${key}`}
                  type="number"
                  inputMode="decimal"
                  min={unit === "in" ? 15 : 38}
                  max={unit === "in" ? 100 : 254}
                  step="0.1"
                  required
                  value={values[key]}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                    setResult(null);
                    setError("");
                  }}
                  aria-describedby={`body-${key}-help`}
                  className="w-full rounded-xl border bg-[var(--canvas)] px-4 py-3 pr-12 text-lg outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
                  placeholder={unit === "in" ? "e.g. 40" : "e.g. 102"}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-[var(--debit-text)]">
            {error}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="pill pill-brand inline-flex items-center gap-2 px-6 py-3"
          >
            Calculate my shape <ArrowRightIcon className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[var(--muted-ink)] hover:text-[var(--ink)]"
          >
            <RotateCcwIcon className="size-4" aria-hidden />
            Clear
          </button>
        </div>
        <p className="mt-5 text-xs text-[var(--muted-ink)]">
          Your measurements stay in this browser tab and are not uploaded.
        </p>
      </form>

      <div
        className="rounded-[28px] border bg-[var(--paper-2)] p-6 sm:p-8"
        aria-live="polite"
      >
        {activeResult ? (
          <>
            <p className="eyebrow text-[var(--brand)]">Your styling guide</p>
            <h2 className="mt-3 text-4xl font-bold">{activeResult.label}</h2>
            <p className="mt-4 text-[var(--muted-ink)]">
              {activeResult.description}
            </p>
            <div className="mt-7 grid grid-cols-3 gap-2 border-y py-5 text-center">
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <p className="text-xs text-[var(--muted-ink)]">{label}</p>
                  <p className="mt-1 font-semibold">
                    {values[key]} {unit}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="mt-7 text-lg font-bold">Outfit ideas to explore</h3>
            <ul className="mt-3 space-y-2">
              {activeResult.ideas.map((idea) => (
                <li key={idea} className="flex items-center gap-2">
                  <span className="size-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                  {idea}
                </li>
              ))}
            </ul>
            <Link
              href="/ai-clothes-changer#studio"
              className="pill pill-brand mt-7 inline-flex items-center gap-2 px-6 py-3"
            >
              Try AI Clothes Changer{" "}
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
            <p className="mt-5 text-xs text-[var(--muted-ink)]">
              These labels are approximate. Wear what feels right for you.
            </p>
          </>
        ) : (
          <div className="flex h-full min-h-80 flex-col justify-center text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-[var(--brand)]/40 bg-[var(--brand)]/10 text-2xl text-[var(--brand)]">
              ◇
            </span>
            <p className="eyebrow mt-6 text-[var(--brand)]">
              Your result appears here
            </p>
            <h2 className="mt-3 text-2xl font-bold">Find your proportions</h2>
            <p className="mx-auto mt-3 max-w-sm text-[var(--muted-ink)]">
              {audience === "female"
                ? "Enter your bust, waist, and hip measurements to get a simple styling guide."
                : "Enter your shoulder, chest, waist, and hip measurements to get a simple styling guide."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
