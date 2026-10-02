import { generateImage } from "ai";

import { env } from "@/lib/env";

import type { ImageProvider } from "./provider";

// Vercel AI Gateway implementation. The model string ("provider/model",
// from AI_IMAGE_MODEL) resolves through the gateway, which authenticates
// with AI_GATEWAY_API_KEY — swap models via env, never in code.

const SIZE = 1024;

export const gatewayProvider: ImageProvider = {
  modelId: env.AI_IMAGE_MODEL,
  async generateImage({ prompt, personImage }) {
    // Text-to-image only: it cannot keep the person from a photo, so it
    // must not silently return an unrelated picture for a try-on run.
    if (personImage) {
      throw new Error(
        "Clothes changing needs a try-on provider — none is configured yet. Use AI_MOCK=true for local development.",
      );
    }
    if (!env.AI_GATEWAY_API_KEY) {
      throw new Error(
        "AI generation is not configured — set AI_GATEWAY_API_KEY in .env, or use AI_MOCK=true for free local development (see .env.example).",
      );
    }
    const result = await generateImage({
      model: env.AI_IMAGE_MODEL,
      prompt,
      size: `${SIZE}x${SIZE}`,
    });
    return {
      url: `data:${result.image.mediaType};base64,${result.image.base64}`,
      width: SIZE,
      height: SIZE,
      model: env.AI_IMAGE_MODEL,
    };
  },
};
