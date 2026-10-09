import sharp from "sharp";

import { getHairPreset, type HairPreset } from "@/config/hairstyles";
import { env } from "@/lib/env";
import { isProviderUsable } from "@/lib/settings";

import * as kie from "./kie";
import * as nbility from "./nbility";
import { storePresetPreview } from "./storage";

// Preview images for the curated hairstyle presets: a text-to-image studio
// portrait per preset, generated on demand from /admin, downscaled to a
// small JPEG and stored as a public marketing asset.

const TIMEOUT_MS = 240_000;
const PREVIEW_WIDTH = 480;

/** Presets better shown on a man; everything else on a woman. */
const MEN = new Set([
  "buzz-cut",
  "crew-cut",
  "french-crop",
  "classic-fade",
  "slick-back",
  "silver-quiff",
  "side-part",
  "modern-mullet",
  "man-bun",
  "tapered-afro",
]);

/** Natural textures read best on models with that hair type. */
const TEXTURED = new Set(["Braids & locs", "Natural & afro"]);

export function previewPrompt(preset: HairPreset): string {
  const person = MEN.has(preset.id) ? "a young man" : "a young woman";
  const who = TEXTURED.has(preset.category)
    ? `${person} of African descent`
    : person;
  return `Professional studio portrait photo of ${who} with ${preset.prompt}. Head and shoulders, three-quarter view so the haircut is clearly visible, plain light-grey background, soft even studio lighting, natural relaxed expression, wearing a plain dark crew-neck top. Photorealistic, sharp focus on the hair, high detail. No text, no watermark.`;
}

/** Which provider renders previews: kie.ai first (cheap), then Nbility. */
export async function previewProvider(): Promise<"kie" | "nbility" | null> {
  if (await isProviderUsable("kie")) return "kie";
  if (await isProviderUsable("nbility")) return "nbility";
  return null;
}

async function renderWithKie(prompt: string, deadline: number) {
  const taskId = await kie.createTask(
    {
      model: "seedream/5-flash-text-to-image",
      input: {
        prompt,
        aspect_ratio: "3:4",
        size: "1K",
        output_format: "png",
        nsfw_checker: true,
      },
    },
    deadline,
  );
  return kie.waitForTask(taskId, deadline);
}

async function renderWithNbility(prompt: string, deadline: number) {
  const response = await fetch(
    `${env.NBILITY_BASE_URL}/v1/images/generations`,
    {
      method: "POST",
      headers: {
        ...nbility.headers(),
        "Content-Type": "application/json",
        "X-New-Api-Async-Task": "true",
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        n: 1,
        size: "1024x1536",
        quality: "medium",
        response_format: "url",
      }),
      signal: AbortSignal.timeout(Math.max(1_000, deadline - Date.now())),
    },
  );
  const body = await nbility.readJson(response);
  if (!response.ok) {
    nbility.throwFor(
      body.error?.message ?? body.message ?? `HTTP ${response.status}`,
      response.status,
    );
  }
  const direct = nbility.imageFrom(body);
  if (direct) return direct;
  const taskId =
    body.data && !Array.isArray(body.data) ? body.data.task_id : undefined;
  if (!taskId) throw new Error("nbility: no task id for preview");
  return nbility.waitForTask(taskId, deadline);
}

async function download(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    return Buffer.from(url.slice(url.indexOf(",") + 1), "base64");
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok)
    throw new Error(`preview download failed (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

/** Generates and stores one hairstyle preview. Returns the provider used. */
export async function generateHairPreview(
  id: string,
): Promise<{ provider: "kie" | "nbility" }> {
  const preset = getHairPreset(id);
  if (!preset) throw new Error(`Unknown hairstyle: ${id}`);
  const provider = await previewProvider();
  if (!provider) {
    throw new Error("No image provider is on — add a kie.ai or Nbility key.");
  }
  const deadline = Date.now() + TIMEOUT_MS;
  const prompt = previewPrompt(preset);
  const url =
    provider === "kie"
      ? await renderWithKie(prompt, deadline)
      : await renderWithNbility(prompt, deadline);
  const image = await sharp(await download(url))
    .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await storePresetPreview("hair", preset.id, image);
  return { provider };
}
