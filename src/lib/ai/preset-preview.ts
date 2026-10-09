import sharp from "sharp";

import {
  getHairPreset,
  type HairGender,
  type HairPreset,
} from "@/config/hairstyles";
import { env } from "@/lib/env";
import { getEditModel, isProviderUsable } from "@/lib/settings";

import * as kie from "./kie";
import * as nbility from "./nbility";
import { getImageProvider } from "./provider";
import { readPresetPreview, storePresetPreview } from "./storage";

// Preview images for the curated hairstyles, all on the SAME model per
// gender (like a lookbook): a base studio portrait is rendered once per
// gender (text-to-image), then every preview is an edit of that base photo
// through the same image-editing pipeline users get — only the hair changes.
// Stored as public marketing assets: presets/hair/<id>.jpg, and the bases as
// presets/hair/_base-<gender>.jpg.

const TIMEOUT_MS = 240_000;
const PREVIEW_WIDTH = 480;
/** Bases stay larger: they are the input of every edit. */
const BASE_WIDTH = 1024;

export function baseId(gender: HairGender): string {
  return `_base-${gender}`;
}

export function basePrompt(gender: HairGender): string {
  const person =
    gender === "male"
      ? "a friendly young man in his twenties with short, neat dark brown hair"
      : "a friendly young woman in her twenties with shoulder-length straight dark brown hair tucked behind her ears";
  return `Professional studio headshot of ${person}, facing the camera with a soft natural smile. Head and shoulders, centered, plain light-grey background, soft even studio lighting, wearing a plain dark crew-neck top. Photorealistic, high detail. No text, no watermark.`;
}

/** The edit applied to the base photo for one hairstyle. */
export function previewInstruction(preset: HairPreset): string {
  return `Change only the person's hair to ${preset.prompt}. Keep the person's current dark brown hair color. Keep the face, expression, skin, clothing, background, framing and lighting exactly the same. Make the hairline and hair texture look natural.`;
}

/** Which provider renders the base portraits: kie.ai first, then Nbility. */
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
        size: "2K",
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
  if (!response.ok) {
    throw new Error(`preview download failed (${response.status})`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function toJpeg(bytes: Buffer, width: number): Promise<Buffer> {
  return sharp(bytes)
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

/** Renders (or re-renders) the shared model photo for one gender. */
export async function generateBaseModel(
  gender: HairGender,
): Promise<{ provider: "kie" | "nbility" }> {
  const provider = await previewProvider();
  if (!provider) {
    throw new Error("No image provider is on — add a kie.ai or Nbility key.");
  }
  const deadline = Date.now() + TIMEOUT_MS;
  const prompt = basePrompt(gender);
  const url =
    provider === "kie"
      ? await renderWithKie(prompt, deadline)
      : await renderWithNbility(prompt, deadline);
  await storePresetPreview(
    "hair",
    baseId(gender),
    await toJpeg(await download(url), BASE_WIDTH),
  );
  return { provider };
}

/**
 * Generates and stores one hairstyle preview by editing the gender's base
 * photo (rendered first when it doesn't exist yet). Returns the model used.
 */
export async function generateHairPreview(
  id: string,
): Promise<{ model: string }> {
  const preset = getHairPreset(id);
  if (!preset) throw new Error(`Unknown hairstyle: ${id}`);
  const model = await getEditModel();
  if (!model) {
    throw new Error("No image provider is on — check Admin → AI.");
  }
  let base = await readPresetPreview("hair", baseId(preset.gender));
  if (!base) {
    await generateBaseModel(preset.gender);
    base = await readPresetPreview("hair", baseId(preset.gender));
    if (!base) throw new Error("The model photo could not be stored.");
  }
  const image = await getImageProvider().generateImage({
    prompt: previewInstruction(preset),
    userId: "preset-preview",
    task: "hair",
    personImage: { bytes: Buffer.from(base), mediaType: "image/jpeg" },
    model,
  });
  await storePresetPreview(
    "hair",
    preset.id,
    await toJpeg(await download(image.url), PREVIEW_WIDTH),
  );
  return { model: image.model };
}
