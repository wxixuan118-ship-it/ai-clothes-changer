import sharp from "sharp";

import { env } from "@/lib/env";

import { ContentBlockedError, ProviderBusyError } from "./errors";
import type { GenerateImageInput, ImageProvider, InputImage } from "./provider";

// kie.ai market API — Seedream 5.0 Flash image editing.
// Tasks take image URLs, not bytes, so each photo first goes through kie's
// temporary upload (files are deleted after 24h), then the task is created
// and polled until it finishes.
// Docs: https://docs.kie.ai/market/seedream/5-flash-image-to-image

const DEFAULT_MODEL = "seedream/5-flash-image-to-image";
const TIMEOUT_MS = 240_000;
const POLL_INTERVAL_MS = 3_000;
const RETRY_DELAYS_MS = [1_000, 3_000];

/** kie.ai credit price in USD (pricing page: 72 credits = $0.36). */
export const KIE_USD_PER_CREDIT = 0.005;

const SAFETY =
  "The person must stay fully clothed in non-revealing clothing: no nudity, underwear, see-through fabric, or sexualized pose.";

const BLOCKED =
  /nsfw|sensitive|content[ _-]?policy|safety|moderation|prohibited|violat/i;

/** Seedream's accepted aspect ratios as width / height. */
const RATIOS = [
  ["1:1", 1],
  ["4:3", 4 / 3],
  ["3:4", 3 / 4],
  ["16:9", 16 / 9],
  ["9:16", 9 / 16],
  ["2:3", 2 / 3],
  ["3:2", 3 / 2],
  ["21:9", 21 / 9],
] as const;

type KieBody<T> = { code?: number; msg?: string; data?: T };
type TaskRecord = {
  state?: string;
  resultJson?: string | null;
  failCode?: string | null;
  failMsg?: string | null;
};

/** Closest supported aspect ratio to the person photo. */
export async function pickAspectRatio(person: InputImage): Promise<string> {
  const meta = await sharp(person.bytes).metadata();
  const ratio = (meta.width ?? 1) / (meta.height ?? 1);
  let best: string = RATIOS[0][0];
  let bestDistance = Infinity;
  for (const [label, value] of RATIOS) {
    const distance = Math.abs(Math.log(ratio / value));
    if (distance < bestDistance) {
      best = label;
      bestDistance = distance;
    }
  }
  return best;
}

/** The instruction. The person photo is always image 1. */
export function buildPrompt(input: GenerateImageInput): string {
  if (input.referenceImage) {
    const kind = input.task === "hair" ? "hairstyle" : "garment";
    return `${SAFETY} Image 1 is the person to edit — keep their face, identity, skin tone, body, pose, background, lighting and framing exactly the same. Image 2 is the ${kind} reference: apply only the ${kind} from image 2 to the person in image 1 and ignore any person, skin or body shown in image 2. ${input.prompt} ${SAFETY}`;
  }
  return `${SAFETY} Keep the person's face, identity, skin tone, body, pose, background, lighting and framing exactly the same. ${input.prompt} ${SAFETY}`;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.KIE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function signal(deadline: number): AbortSignal {
  return AbortSignal.timeout(Math.max(1_000, deadline - Date.now()));
}

async function readJson<T>(response: Response): Promise<KieBody<T>> {
  return (await response.json().catch(() => ({}))) as KieBody<T>;
}

/** kie returns HTTP 200 with the real status in `code`. */
function statusOf(response: Response, body: KieBody<unknown>): number {
  return body.code ?? response.status;
}

function throwFor(message: string, code: number): never {
  if (BLOCKED.test(message)) throw new ContentBlockedError("kie_blocked");
  if (code === 429) throw new ProviderBusyError("kie_429");
  throw new Error(`kie ${code}: ${message}`.slice(0, 500));
}

async function uploadImage(
  image: InputImage,
  name: string,
  deadline: number,
): Promise<string> {
  const ext =
    image.mediaType === "image/jpeg" ? "jpg" : image.mediaType.split("/")[1];
  const response = await fetch(`${env.KIE_UPLOAD_URL}/api/file-base64-upload`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      base64Data: `data:${image.mediaType};base64,${image.bytes.toString("base64")}`,
      uploadPath: "stylemirror",
      fileName: `${name}-${crypto.randomUUID()}.${ext}`,
    }),
    signal: signal(deadline),
  });
  const body = await readJson<{ downloadUrl?: string }>(response);
  const code = statusOf(response, body);
  if (code !== 200 || !body.data?.downloadUrl) {
    throwFor(`upload failed: ${body.msg ?? "no URL"}`, code);
  }
  return body.data.downloadUrl;
}

export async function createTask(
  payload: unknown,
  deadline: number,
): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${env.KIE_BASE_URL}/api/v1/jobs/createTask`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
      signal: signal(deadline),
    });
    const body = await readJson<{ taskId?: string }>(response);
    const code = statusOf(response, body);
    if (code === 200 && body.data?.taskId) return body.data.taskId;
    const delay = RETRY_DELAYS_MS[attempt];
    const transient = code === 429 || code >= 500;
    if (transient && delay !== undefined && Date.now() + delay < deadline) {
      await sleep(delay + Math.random() * 300);
      continue;
    }
    throwFor(body.msg ?? `HTTP ${response.status}`, code);
  }
}

export async function waitForTask(
  taskId: string,
  deadline: number,
): Promise<string> {
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const response = await fetch(
      `${env.KIE_BASE_URL}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: headers(), signal: signal(deadline) },
    );
    const body = await readJson<TaskRecord>(response);
    // A failed poll is a read — keep polling until the deadline.
    if (statusOf(response, body) !== 200 || !body.data) continue;
    const task = body.data;
    if (task.state === "success") {
      let urls: string[] | undefined;
      try {
        urls = (
          JSON.parse(task.resultJson ?? "{}") as { resultUrls?: string[] }
        ).resultUrls;
      } catch {
        urls = undefined;
      }
      const url = urls?.[0];
      if (!url) throw new Error(`kie: task ${taskId} has no image`);
      return url;
    }
    if (task.state === "fail") {
      throwFor(
        `${task.failMsg || "task failed"}${task.failCode ? ` (${task.failCode})` : ""}`,
        200,
      );
    }
  }
  throw new Error(`kie: task ${taskId} timed out`);
}

export const kieProvider: ImageProvider = {
  modelId: DEFAULT_MODEL,
  async generateImage(input) {
    if (!env.KIE_API_KEY) {
      throw new Error("kie.ai is not configured — set KIE_API_KEY.");
    }
    if (!input.personImage) {
      throw new Error("kie: a person photo is required");
    }
    const model = input.model ?? DEFAULT_MODEL;
    const deadline = Date.now() + TIMEOUT_MS;
    const [aspectRatio, ...imageUrls] = await Promise.all([
      pickAspectRatio(input.personImage),
      uploadImage(input.personImage, "person", deadline),
      ...(input.referenceImage
        ? [uploadImage(input.referenceImage, "reference", deadline)]
        : []),
    ]);
    const taskId = await createTask(
      {
        model,
        input: {
          prompt: buildPrompt(input),
          image_urls: imageUrls,
          aspect_ratio: aspectRatio,
          size: "2K",
          output_format: "png",
          nsfw_checker: true,
        },
      },
      deadline,
    );
    const url = await waitForTask(taskId, deadline);
    const [w, h] = aspectRatio.split(":").map(Number) as [number, number];
    const long = 2048;
    return {
      url,
      width: w >= h ? long : Math.round((long * w) / h),
      height: h >= w ? long : Math.round((long * h) / w),
      model,
    };
  },
};

// ── Account status for /admin ────────────────────────────────────────────────

export type KieStatus = {
  keyValid: boolean;
  /** Remaining kie credits and their USD value. */
  credits: number | null;
  usd: number | null;
  latencyMs: number;
  error?: string;
};

/** Free health check: reads the account's remaining credits. */
export async function checkKie(): Promise<KieStatus> {
  const started = Date.now();
  if (!env.KIE_API_KEY) {
    return {
      keyValid: false,
      credits: null,
      usd: null,
      latencyMs: 0,
      error: "KIE_API_KEY not set",
    };
  }
  try {
    const response = await fetch(`${env.KIE_BASE_URL}/api/v1/chat/credit`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    });
    const body = await readJson<number>(response);
    const latencyMs = Date.now() - started;
    const code = statusOf(response, body);
    if (code !== 200 || typeof body.data !== "number") {
      return {
        keyValid: false,
        credits: null,
        usd: null,
        latencyMs,
        error: body.msg ?? `HTTP ${response.status}`,
      };
    }
    return {
      keyValid: true,
      credits: body.data,
      usd: body.data * KIE_USD_PER_CREDIT,
      latencyMs,
    };
  } catch (error) {
    return {
      keyValid: false,
      credits: null,
      usd: null,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
