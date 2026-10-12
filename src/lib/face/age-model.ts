"use client";

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
// ONNX Runtime Web is loaded from the CDN at runtime, like the MediaPipe
// runtime, instead of being bundled: bundling it pushed `next build` past
// the 1.5 GB Docker build cap on AnySites.
const ORT_VERSION = "1.30.0";
const ORT_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
const ORT_SCRIPT_SRI =
  "sha384-Bw6URI+Gvoadw0do7/QrSHUC9D1vCYYK5OSqChFyhyV5mzPL4oe2rOAFljAnS8Sq";

// The slice of the onnxruntime-web API this file uses.
type OrtTensor = { data: Float32Array };
type InferenceSession = {
  run(feeds: Record<string, unknown>): Promise<Record<string, OrtTensor>>;
};
type Ort = {
  env: { wasm: { wasmPaths: string; numThreads: number } };
  InferenceSession: {
    create(
      model: Uint8Array,
      options: { executionProviders: string[] },
    ): Promise<InferenceSession>;
  };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => unknown;
};

let ortPromise: Promise<Ort> | null = null;

/** Injects the UMD build once; it defines `window.ort`. */
function loadOrt(): Promise<Ort> {
  ortPromise ??= new Promise<Ort>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${ORT_BASE}ort.wasm.min.js`;
    script.integrity = ORT_SCRIPT_SRI;
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      const ort = (window as unknown as { ort?: Ort }).ort;
      if (ort) resolve(ort);
      else reject(new Error("onnxruntime-web did not load"));
    };
    script.onerror = () => reject(new Error("onnxruntime-web failed to load"));
    document.head.appendChild(script);
  });
  ortPromise.catch(() => {
    ortPromise = null;
  });
  return ortPromise;
}

const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let sessionPromise: Promise<InferenceSession> | null = null;

/** Downloads (with progress, 0–1) and caches the model session. */
export function getAgeModel(
  onProgress?: (fraction: number) => void,
): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    const ort = await loadOrt();
    ort.env.wasm.wasmPaths = ORT_BASE;
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
  const { Tensor } = await loadOrt();
  const results: AgeEstimate[] = [];
  for (const face of faces) {
    const input = new Tensor(
      "float32",
      faceTensor(source, face, width, height),
      [1, 3, INPUT_SIZE, INPUT_SIZE],
    );
    const output = await session.run({ input });
    results.push(estimateAge(output.age_output.data));
  }
  return results;
}
