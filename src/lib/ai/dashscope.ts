import { env } from "@/lib/env";

import { ContentBlockedError, ProviderBusyError } from "./errors";
import type { GenerateImageInput, ImageProvider, InputImage } from "./provider";

// Alibaba Cloud Model Studio (DashScope) image editing — qwen-image-edit-plus
// by default. Synchronous HTTP API: one POST returns a signed PNG URL that
// lives 24h; storage.ts copies it into our own storage right away.
// Docs: https://www.alibabacloud.com/help/en/model-studio/qwen-image-edit-api

const PATH = "/api/v1/services/aigc/multimodal-generation/generation";
/** One budget for the call including retries. */
const TIMEOUT_MS = 180_000;
/** Throttling backoff (the model's 2 req/s limit is shared by all users). */
const RETRY_DELAYS_MS = [600, 1800];

// Appended to every instruction, whatever the tool or mode.
const SAFETY =
  "The person must stay fully clothed in non-revealing clothing: no nudity, underwear, see-through fabric, or sexualized pose.";
const NEGATIVE_PROMPT =
  "nudity, naked, nipples, genitals, underwear, lingerie, bikini, see-through, sheer fabric, sexualized pose, cleavage, deformed face, distorted features, extra fingers, blurry";

// Content-safety refusals (input or output). Failed calls are not billed.
const BLOCKED_CODES = new Set([
  "DataInspectionFailed",
  "data_inspection_failed",
  "IPInfringementSuspect",
  "CustomRoleBlocked",
]);

type DashScopeResponse = {
  code?: string;
  message?: string;
  request_id?: string;
  output?: {
    choices?: { message?: { content?: { image?: string }[] } }[];
  };
  usage?: { width?: number; height?: number };
};

function dataUri(image: InputImage): string {
  return `data:${image.mediaType};base64,${image.bytes.toString("base64")}`;
}

/**
 * Builds the single-turn message. With a reference photo the person goes
 * LAST: without an explicit size the output follows the last image's
 * aspect ratio, so the result keeps the person photo's framing.
 */
export function buildMessageContent(
  input: GenerateImageInput,
): ({ image: string } | { text: string })[] {
  if (!input.personImage) {
    throw new Error("dashscope: a person photo is required");
  }
  if (input.referenceImage) {
    const kind = input.task === "hair" ? "hairstyle" : "garment";
    return [
      { image: dataUri(input.referenceImage) },
      { image: dataUri(input.personImage) },
      {
        text: `${SAFETY} Image 1 is the ${kind} reference photo. Image 2 is the person to edit — keep Image 2's framing and edit only that person. Take only the ${kind} from Image 1 and ignore any skin or body shown in it. ${input.prompt} ${SAFETY}`,
      },
    ];
  }
  return [
    { image: dataUri(input.personImage) },
    { text: `${input.prompt} ${SAFETY}` },
  ];
}

export const dashscopeProvider: ImageProvider = {
  modelId: env.AI_EDIT_MODEL,
  async generateImage(input) {
    if (!env.DASHSCOPE_API_KEY) {
      throw new Error("DashScope is not configured — set DASHSCOPE_API_KEY.");
    }
    const payload = JSON.stringify({
      model: env.AI_EDIT_MODEL,
      input: {
        messages: [{ role: "user", content: buildMessageContent(input) }],
      },
      parameters: {
        n: 1,
        watermark: false,
        // Keep our instruction verbatim — rewriting it can drift the face.
        prompt_extend: false,
        negative_prompt: NEGATIVE_PROMPT,
      },
    });
    const deadline = Date.now() + TIMEOUT_MS;
    let body: DashScopeResponse = {};
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(`${env.DASHSCOPE_BASE_URL}${PATH}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: payload,
        signal: AbortSignal.timeout(Math.max(1_000, deadline - Date.now())),
      });
      body = (await response.json().catch(() => ({}))) as DashScopeResponse;
      if (response.ok) break;

      const code = body.code ?? `HTTP_${response.status}`;
      if (BLOCKED_CODES.has(code)) throw new ContentBlockedError(code);
      const throttled =
        response.status === 429 || code.startsWith("Throttling");
      const delay = RETRY_DELAYS_MS[attempt];
      if (throttled && delay !== undefined && Date.now() + delay < deadline) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay + Math.random() * 300),
        );
        continue;
      }
      if (throttled) throw new ProviderBusyError(code);
      throw new Error(
        `dashscope ${response.status} ${code}: ${body.message ?? "request failed"} (request ${body.request_id ?? "?"})`,
      );
    }

    const url = body.output?.choices?.[0]?.message?.content?.find(
      (item) => item.image,
    )?.image;
    if (!url) {
      throw new Error(
        `dashscope: no image in response (request ${body.request_id ?? "?"})`,
      );
    }
    return {
      url,
      width: body.usage?.width ?? 1024,
      height: body.usage?.height ?? 1024,
      model: env.AI_EDIT_MODEL,
    };
  },
};
