"use client";

import * as React from "react";
import { RotateCcwIcon, UploadIcon } from "lucide-react";

import { AGE_BANDS, type AgeEstimate } from "@/lib/face/age";
import { estimateAges } from "@/lib/face/age-model";
import { faceBox, type FaceBox } from "@/lib/face/blur";
import { getMultiFaceLandmarker } from "@/lib/face/mediapipe";

const MAX_DIM = 1600;

type Face = FaceBox & { estimate: AgeEstimate };

/** Group photo → an age label on every face. */
export function AgeGroupTool() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sourceRef = React.useRef<HTMLCanvasElement | null>(null);
  const [faces, setFaces] = React.useState<Face[] | null>(null);
  const [status, setStatus] = React.useState<"idle" | "working" | "error">(
    "idle",
  );
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source || !faces) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source, 0, 0);
    const scale = Math.max(1, source.width / 800);
    ctx.lineWidth = 3 * scale;
    ctx.font = `700 ${Math.round(18 * scale)}px system-ui, sans-serif`;
    faces.forEach((f, i) => {
      ctx.strokeStyle = "#7C3AED";
      ctx.strokeRect(f.x, f.y, f.w, f.h);
      const label = `#${i + 1} · ~${f.estimate.years}`;
      const pad = 6 * scale;
      const tw = ctx.measureText(label).width + pad * 2;
      const th = 26 * scale;
      const ty = Math.max(0, f.y - th);
      ctx.fillStyle = "#7C3AED";
      ctx.fillRect(f.x, ty, tw, th);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, f.x + pad, ty + th - 8 * scale);
    });
  }, [faces]);

  async function load(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      return;
    }
    setStatus("working");
    setProgress(0);
    try {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const source = document.createElement("canvas");
      source.width = Math.round(img.width * scale);
      source.height = Math.round(img.height * scale);
      source
        .getContext("2d")!
        .drawImage(img, 0, 0, source.width, source.height);
      URL.revokeObjectURL(url);
      const landmarker = await getMultiFaceLandmarker();
      const found = landmarker.detect(source).faceLandmarks ?? [];
      const estimates = await estimateAges(
        source,
        found,
        source.width,
        source.height,
        setProgress,
      );
      sourceRef.current = source;
      const next = found
        .map((l, i) => ({
          ...faceBox(l, source.width, source.height, 0.08),
          estimate: estimates[i],
        }))
        .sort((a, b) => a.x - b.x);
      setFaces(next);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setFaces(null);
    sourceRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="card mx-auto mt-10 max-w-4xl p-4 shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-6">
      {faces ? (
        <div className="space-y-5">
          <p className="text-sm text-[var(--muted-ink)]">
            {faces.length === 0
              ? "No faces found. Try a sharper photo where faces are at least 40px wide."
              : `${faces.length} face${faces.length === 1 ? "" : "s"} found, numbered left to right.`}
          </p>
          <canvas
            ref={canvasRef}
            className="mx-auto block h-auto max-h-[70vh] max-w-full rounded-2xl border"
            aria-label="Photo with estimated ages on each face"
          />
          {faces.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {faces.map((f, i) => (
                <li
                  key={`${f.x}-${f.y}`}
                  className="rounded-2xl border bg-[var(--paper-2)] p-4"
                >
                  <p className="text-xs font-semibold tracking-wider text-[var(--muted-ink)] uppercase">
                    Face #{i + 1}
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    About {f.estimate.years}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-ink)]">
                    Most likely {AGE_BANDS[f.estimate.bandIndex]} ·{" "}
                    {Math.round(f.estimate.confidence * 100)}%
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            onClick={reset}
            className="pill pill-outline gap-1.5 px-5 py-2.5 text-sm"
          >
            <RotateCcwIcon className="size-4" aria-hidden />
            New photo
          </button>
        </div>
      ) : (
        <div
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) void load(file);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--muted-ink)]/30 px-8 py-14 text-center"
        >
          {status === "working" ? (
            <>
              <div className="sparkle-spinner size-8" />
              <p className="mt-4 font-medium">
                {progress > 0 && progress < 1
                  ? `Loading the age model… ${Math.round(progress * 100)}%`
                  : "Finding faces and estimating ages…"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-ink)]">
                The first run downloads about 14 MB of models, then they stay cached.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Drop a photo here</p>
              {status === "error" ? (
                <p
                  role="alert"
                  className="mt-1 text-sm text-[var(--debit-text)]"
                >
                  That photo couldn&apos;t be processed. Try a JPG, PNG or WebP
                  image.
                </p>
              ) : (
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  Selfies and group photos — up to 20 faces.
                </p>
              )}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="pill pill-brand mt-5 gap-1.5 px-5 py-2.5 text-sm"
              >
                <UploadIcon className="size-4" aria-hidden />
                Upload photo
              </button>
              <p className="mt-4 text-xs text-[var(--muted-ink)]">
                Runs in your browser · Photo never leaves your device
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void load(file);
            }}
          />
        </div>
      )}
    </div>
  );
}
