"use client";

import type { InferenceSession } from "onnxruntime-web";

import {
  alignPoints,
  ALIGN_TEMPLATE,
  estimateAge,
  INPUT_SIZE,
  similarityTransform,
  type AgeEstimate,
} from "./age";

// FairFace ResNet-34, quantized to 8-bit weights (21 MB, 14 MB gzipped).
// Weights by Kärkkäinen & Joo, CC BY 4.0 — credited on every page that
// uses it. Stored gzipped: smaller to download, and raw weight bytes trip
// GitHub's secret scanner.
const MODEL_URL = "/models/fairface-age-int8.onnx.gz";
// The wasm runtime is loaded from the CDN at the installed version, like the
// MediaPipe runtime, so the bundler never has to handle .wasm files.
const ORT_VERSION = "1.30.0";

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let sessionPromise: Promise<InferenceSession> | null = null;

/** Downloads (with progress, 0–1) and caches the model session. */
export function getAgeModel(
  onProgress?: (fraction: number) => void,
): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    const ort = await import("onnxruntime-web/wasm");
    ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
    // Threads need cross-origin isolation, which the site doesn't enable.
    ort.env.wasm.numThreads = 1;
    const response = await fetch(MODEL_URL);
    if (!response.ok || !response.body)
      throw new Error(`age model: HTTP ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) onProgress?.(received / total);
    }
    const packed = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      packed.set(chunk, offset);
      offset += chunk.length;
    }
    // A CDN may already have decoded it (Content-Encoding); check the magic.
    const bytes =
      packed[0] === 0x1f && packed[1] === 0x8b
        ? new Uint8Array(
            await new Response(
              new Blob([packed])
                .stream()
                .pipeThrough(new DecompressionStream("gzip")),
            ).arrayBuffer(),
          )
        : packed;
    return ort.InferenceSession.create(bytes, {
      executionProviders: ["wasm"],
    });
  })();
  sessionPromise.catch(() => {
    sessionPromise = null;
  });
  return sessionPromise;
}

/** Aligns one face to the model's 224px template and returns its tensor data. */
function faceTensor(
  source: CanvasImageSource,
  landmarks: { x: number; y: number }[],
  width: number,
  height: number,
): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = INPUT_SIZE;
  canvas.height = INPUT_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const m = similarityTransform(
    alignPoints(landmarks, width, height),
    ALIGN_TEMPLATE,
  );
  ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const plane = INPUT_SIZE * INPUT_SIZE;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) {
      out[c * plane + i] = (data[i * 4 + c] / 255 - MEAN[c]) / STD[c];
    }
  }
  return out;
}

/** Estimates the age of each face (normalized landmarks on `source`). */
export async function estimateAges(
  source: CanvasImageSource,
  faces: { x: number; y: number }[][],
  width: number,
  height: number,
  onProgress?: (fraction: number) => void,
): Promise<AgeEstimate[]> {
  const session = await getAgeModel(onProgress);
  const { Tensor } = await import("onnxruntime-web/wasm");
  const results: AgeEstimate[] = [];
  for (const face of faces) {
    const input = new Tensor(
      "float32",
      faceTensor(source, face, width, height),
      [1, 3, INPUT_SIZE, INPUT_SIZE],
    );
    const output = await session.run({ input });
    results.push(estimateAge(output.age_output.data as Float32Array));
  }
  return results;
}
