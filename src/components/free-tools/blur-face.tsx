"use client";

import * as React from "react";
import { DownloadIcon, RotateCcwIcon, UploadIcon } from "lucide-react";

import { boxAt, faceBox, type FaceBox } from "@/lib/face/blur";
import { getMultiFaceLandmarker } from "@/lib/face/mediapipe";

import { SegmentedControl } from "./measure-field";

type Mode = "blur" | "pixelate";
type Face = FaceBox & { on: boolean };

const MAX_DIM = 2000;

/** Blur or pixelate every detected face; click a face to toggle it. */
export function BlurFace() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sourceRef = React.useRef<HTMLCanvasElement | null>(null);
  const [faces, setFaces] = React.useState<Face[] | null>(null);
  const [mode, setMode] = React.useState<Mode>("blur");
  const [strength, setStrength] = React.useState(60);
  const [status, setStatus] = React.useState<"idle" | "working" | "error">("idle");
  const [fileName, setFileName] = React.useState("photo");

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source || !faces) return;
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source, 0, 0);
    // Downscale then upscale: smoothing on gives a blur, off gives pixels.
    const factor = 4 + (strength / 100) * 36;
    for (const f of faces) {
      if (!f.on) continue;
      const sw = Math.max(1, Math.round(f.w / factor));
      const sh = Math.max(1, Math.round(f.h / factor));
      const small = document.createElement("canvas");
      small.width = sw;
      small.height = sh;
      const sctx = small.getContext("2d")!;
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(source, f.x, f.y, f.w, f.h, 0, 0, sw, sh);
      ctx.save();
      ctx.beginPath();
      if (mode === "blur") {
        ctx.ellipse(f.x + f.w / 2, f.y + f.h / 2, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(f.x, f.y, f.w, f.h);
      }
      ctx.clip();
      ctx.imageSmoothingEnabled = mode === "blur";
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(small, 0, 0, sw, sh, f.x, f.y, f.w, f.h);
      ctx.restore();
      if (mode === "blur") {
        // A second pass softens the blocky edges of the upscaled image.
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(f.x + f.w / 2, f.y + f.h / 2, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.5;
        ctx.drawImage(small, 0, 0, sw, sh, f.x - 2, f.y - 2, f.w + 4, f.h + 4);
        ctx.restore();
      }
    }
  }, [faces, mode, strength]);

  async function load(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      return;
    }
    setStatus("working");
    setFileName(file.name.replace(/\.[^.]+$/, "") || "photo");
    try {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const source = document.createElement("canvas");
      source.width = Math.round(img.width * scale);
      source.height = Math.round(img.height * scale);
      source.getContext("2d")!.drawImage(img, 0, 0, source.width, source.height);
      URL.revokeObjectURL(url);
      const landmarker = await getMultiFaceLandmarker();
      const found = landmarker.detect(source).faceLandmarks ?? [];
      sourceRef.current = source;
      setFaces(
        found.map((l) => ({ ...faceBox(l, source.width, source.height), on: true })),
      );
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function toggleAt(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !faces) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const i = boxAt(faces, x, y);
    if (i < 0) return;
    setFaces(faces.map((f, j) => (j === i ? { ...f, on: !f.on } : f)));
  }

  function download() {
    canvasRef.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}-blurred.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  function reset() {
    setFaces(null);
    sourceRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }

  const onCount = faces?.filter((f) => f.on).length ?? 0;

  return (
    <div className="card mx-auto mt-10 max-w-4xl p-4 shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-6">
      {faces ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SegmentedControl
              label="Effect"
              value={mode}
              onChange={setMode}
              options={[
                { value: "blur", label: "Blur" },
                { value: "pixelate", label: "Pixelate" },
              ]}
            />
            <label className="flex items-center gap-3 text-sm font-semibold">
              Strength
              <input
                type="range"
                min={0}
                max={100}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="w-40 accent-[var(--brand)]"
              />
            </label>
          </div>
          <p className="text-sm text-[var(--muted-ink)]">
            {faces.length === 0
              ? "No faces found. Try a sharper photo where faces are at least 40px wide."
              : `${faces.length} face${faces.length === 1 ? "" : "s"} found, ${onCount} blurred. Click a face to toggle it.`}
          </p>
          <canvas
            ref={canvasRef}
            onClick={toggleAt}
            className="mx-auto block h-auto max-h-[70vh] max-w-full cursor-pointer rounded-2xl border"
            aria-label="Photo with blurred faces"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={download}
              className="pill pill-brand gap-1.5 px-5 py-2.5 text-sm"
            >
              <DownloadIcon className="size-4" aria-hidden />
              Download PNG
            </button>
            <button
              type="button"
              onClick={reset}
              className="pill pill-outline gap-1.5 px-5 py-2.5 text-sm"
            >
              <RotateCcwIcon className="size-4" aria-hidden />
              New photo
            </button>
          </div>
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
              <p className="mt-4 font-medium">Finding faces…</p>
              <p className="mt-1 text-sm text-[var(--muted-ink)]">
                The first run loads the detection model (a few seconds).
              </p>
            </>
          ) : (
            <>
              <p className="font-medium">Drop a photo here</p>
              {status === "error" ? (
                <p role="alert" className="mt-1 text-sm text-[var(--debit-text)]">
                  That file couldn&apos;t be read. Try a JPG, PNG or WebP image.
                </p>
              ) : (
                <p className="mt-1 text-sm text-[var(--muted-ink)]">
                  Group photos work too — up to 20 faces.
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
