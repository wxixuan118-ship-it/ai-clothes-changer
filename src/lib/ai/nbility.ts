import sharp from "sharp";

import { env } from "@/lib/env";

import { ContentBlockedError, ProviderBusyError } from "./errors";
import type { GenerateImageInput, ImageProvider, InputImage } from "./provider";

// Nbility AI gateway (new-api, OpenAI-compatible) — gpt-image-2 editing.
// The gateway sits behind Cloudflare, which cuts synchronous requests at
// 100s, and gpt-image-2 edits often take longer. So every edit is submitted
// as an async task (X-New-Api-Async-Task) and polled until it finishes.
// Docs: https://nbility.ai/docs/api/images

const DEFAULT_MODEL = "gpt-image-2";
/** One budget for submit + polling. */
const TIMEOUT_MS = 240_000;
const POLL_INTERVAL_MS = 3_000;
/** Submit retries on 429/5xx — the task was not accepted, safe to resend. */
const RETRY_DELAYS_MS = [1_000, 3_000];

const SAFETY =
  "The person must stay fully clothed in non-revealing clothing: no nudity, underwear, see-through fabric, or sexualized pose.";

const BLOCKED =
  /moderation|safety system|content[ _-]?policy|safety_violation|sensitive|blocked/i;

type ImageData = { url?: string; b64_json?: string };
type GatewayBody = {
  code?: string;
  message?: string;
  error?: { message?: string; code?: string; type?: string };
  data?:
    | ImageData[]
    | {
        task_id?: string;
        status?: string;
        status_raw?: string;
        fail_reason?: string;
        reason?: string;
        result_url?: string;
        image_urls?: string[];
      };
};

/** Output size that keeps the person photo's orientation. */
export async function pickSize(
  person: InputImage,
): Promise<{ size: string; width: number; height: number }> {
  const meta = await sharp(person.bytes).metadata();
  const ratio = (meta.height ?? 1) / (meta.width ?? 1);
  if (ratio > 1.2) return { size: "1024x1536", width: 1024, height: 1536 };
  if (ratio < 0.83) return { size: "1536x1024", width: 1536, height: 1024 };
  return { size: "1024x1024", width: 1024, height: 1024 };
}

/** The instruction. The person photo is always image 1. */
export function buildPrompt(input: GenerateImageInput): string {
  if (input.referenceImage) {
    const kind = input.task === "hair" ? "hairstyle" : "garment";
    return `${SAFETY} Image 1 is the person to edit — keep their face, identity, skin tone, body, pose, background, lighting and framing exactly the same. Image 2 is the ${kind} reference photo: take only the ${kind} from it and ignore any person, skin or body shown in it. ${input.prompt} ${SAFETY}`;
  }
  return `${SAFETY} Keep the person's face, identity, skin tone, body, pose, background, lighting and framing exactly the same. ${input.prompt} ${SAFETY}`;
}

function extension(mediaType: string): string {
  return mediaType === "image/jpeg" ? "jpg" : mediaType.split("/")[1] || "png";
}

function errorText(body: GatewayBody, status: number): string {
  return (
    body.error?.message ??
    body.message ??
    (status ? `HTTP ${status}` : "request failed")
  );
}

function headers(): Record<string, string> {
  return { Authorization: `Bearer ${env.NBILITY_API_KEY}` };
}

async function readJson(response: Response): Promise<GatewayBody> {
  return (await response.json().catch(() => ({}))) as GatewayBody;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** A finished image (sync shape) or null when the body is a task. */
function imageFrom(body: GatewayBody): string | null {
  if (!Array.isArray(body.data)) return null;
  const first = body.data[0];
  if (first?.url) return first.url;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return null;
}

function throwFor(message: string, status: number): never {
  if (BLOCKED.test(message)) throw new ContentBlockedError("nbility_blocked");
  if (status === 429) throw new ProviderBusyError("nbility_429");
  throw new Error(`nbility ${status}: ${message}`.slice(0, 500));
}

async function submit(
  input: GenerateImageInput,
  model: string,
  size: string,
  deadline: number,
): Promise<GatewayBody> {
  for (let attempt = 0; ; attempt++) {
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", buildPrompt(input));
    form.append("n", "1");
    form.append("size", size);
    form.append("quality", "medium");
    form.append("response_format", "url");
    form.append("user", input.userId);
    for (const [index, image] of [
      input.personImage,
      input.referenceImage,
    ].entries()) {
      if (!image) continue;
      form.append(
        "image[]",
        new Blob([new Uint8Array(image.bytes)], { type: image.mediaType }),
        `image-${index + 1}.${extension(image.mediaType)}`,
      );
    }
    const response = await fetch(`${env.NBILITY_BASE_URL}/v1/images/edits`, {
      method: "POST",
      headers: { ...headers(), "X-New-Api-Async-Task": "true" },
      body: form,
      signal: AbortSignal.timeout(Math.max(1_000, deadline - Date.now())),
    });
    const body = await readJson(response);
    if (response.ok) return body;
    const delay = RETRY_DELAYS_MS[attempt];
    const transient = response.status === 429 || response.status >= 500;
    if (transient && delay !== undefined && Date.now() + delay < deadline) {
      await sleep(delay + Math.random() * 300);
      continue;
    }
    throwFor(errorText(body, response.status), response.status);
  }
}

async function waitForTask(taskId: string, deadline: number): Promise<string> {
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    const response = await fetch(
      `${env.NBILITY_BASE_URL}/v1/images/tasks/${encodeURIComponent(taskId)}`,
      {
        headers: headers(),
        signal: AbortSignal.timeout(Math.max(1_000, deadline - Date.now())),
      },
    );
    const body = await readJson(response);
    // A failed poll is a read — keep polling until the deadline.
    if (!response.ok || Array.isArray(body.data) || !body.data) continue;
    const task = body.data;
    const status = (task.status ?? task.status_raw ?? "").toLowerCase();
    if (status === "succeeded" || status === "success") {
      const url = task.result_url ?? task.image_urls?.[0];
      if (!url) throw new Error(`nbility: task ${taskId} has no image`);
      return url;
    }
    if (status === "failed" || status === "failure") {
      throwFor(
        task.fail_reason ?? task.reason ?? body.message ?? "task failed",
        200,
      );
    }
  }
  throw new Error(`nbility: task ${taskId} timed out`);
}

export const nbilityProvider: ImageProvider = {
  modelId: DEFAULT_MODEL,
  async generateImage(input) {
    if (!env.NBILITY_API_KEY) {
      throw new Error("Nbility is not configured — set NBILITY_API_KEY.");
    }
    if (!input.personImage) {
      throw new Error("nbility: a person photo is required");
    }
    const model = input.model ?? DEFAULT_MODEL;
    const deadline = Date.now() + TIMEOUT_MS;
    const { size, width, height } = await pickSize(input.personImage);

    const body = await submit(input, model, size, deadline);
    const direct = imageFrom(body);
    let url: string;
    if (direct) {
      url = direct;
    } else {
      const taskId =
        body.data && !Array.isArray(body.data) ? body.data.task_id : undefined;
      if (!taskId) {
        throw new Error(
          `nbility: unexpected response (${errorText(body, 200)})`.slice(
            0,
            500,
          ),
        );
      }
      url = await waitForTask(taskId, deadline);
    }
    return { url, width, height, model };
  },
};

// ── Account status for /admin ────────────────────────────────────────────────

/** new-api quota units per 1 unit of display currency (from /api/status). */
const QUOTA_PER_UNIT = 500_000;

export type NbilityStatus = {
  ok: boolean;
  /** Key accepted by /v1/models. */
  keyValid: boolean;
  /** The selected model is in the key's model list. */
  modelAvailable: boolean | null;
  imageModels: string[];
  /** Token quota in display currency units (¥); null when unknown. */
  remaining: number | null;
  used: number | null;
  unlimited: boolean;
  latencyMs: number;
  error?: string;
};

/** Free health check: lists models and reads the token's quota. */
export async function checkNbility(model: string): Promise<NbilityStatus> {
  const started = Date.now();
  const base: NbilityStatus = {
    ok: false,
    keyValid: false,
    modelAvailable: null,
    imageModels: [],
    remaining: null,
    used: null,
    unlimited: false,
    latencyMs: 0,
  };
  if (!env.NBILITY_API_KEY)
    return { ...base, error: "NBILITY_API_KEY not set" };
  try {
    const [modelsRes, usageRes] = await Promise.all([
      fetch(`${env.NBILITY_BASE_URL}/v1/models`, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      }),
      fetch(`${env.NBILITY_BASE_URL}/api/usage/token/`, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      }).catch(() => null),
    ]);
    const latencyMs = Date.now() - started;
    const modelsBody = (await modelsRes.json().catch(() => ({}))) as {
      data?: { id?: string }[];
      error?: { message?: string };
    };
    if (!modelsRes.ok) {
      return {
        ...base,
        latencyMs,
        error: modelsBody.error?.message ?? `HTTP ${modelsRes.status}`,
      };
    }
    const ids = (modelsBody.data ?? []).flatMap((m) => (m.id ? [m.id] : []));
    const usage = usageRes?.ok
      ? ((await usageRes.json().catch(() => ({}))) as {
          data?: {
            total_used?: number;
            total_available?: number;
            unlimited_quota?: boolean;
          };
        })
      : {};
    const toUnits = (quota: number | undefined) =>
      typeof quota === "number" ? quota / QUOTA_PER_UNIT : null;
    return {
      ok: ids.includes(model),
      keyValid: true,
      modelAvailable: ids.includes(model),
      imageModels: ids.filter((id) => /image/i.test(id)).sort(),
      remaining: toUnits(usage.data?.total_available),
      used: toUnits(usage.data?.total_used),
      unlimited: Boolean(usage.data?.unlimited_quota),
      latencyMs,
    };
  } catch (error) {
    return {
      ...base,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
