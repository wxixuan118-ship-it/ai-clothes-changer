import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { applyWatermark } from "./watermark";

async function grayPhoto(
  width: number,
  height: number,
  format: "png" | "jpeg",
) {
  const base = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 120, b: 120 },
    },
  });
  return format === "png" ? base.png().toBuffer() : base.jpeg().toBuffer();
}

async function regionStdev(
  bytes: Buffer,
  left: number,
  top: number,
  w: number,
  h: number,
) {
  // stats() reads the pipeline's INPUT — extract to a new image first.
  const region = await sharp(bytes)
    .extract({ left, top, width: w, height: h })
    .toBuffer();
  const stats = await sharp(region).stats();
  return Math.max(...stats.channels.slice(0, 3).map((c) => c.stdev));
}

describe("applyWatermark", () => {
  it("draws visible text bottom-right and keeps size and format", async () => {
    const input = await grayPhoto(800, 1000, "png");

    const out = await applyWatermark(input, "AI Hairstyle Changer");

    expect(out.mediaType).toBe("image/png");
    const meta = await sharp(out.bytes).metadata();
    expect([meta.width, meta.height]).toEqual([800, 1000]);
    expect(meta.channels).toBe(3); // no alpha added to an opaque photo
    // A flat gray image has zero variance; the watermark adds some — but
    // only in the bottom-right corner, never over the face area.
    expect(await regionStdev(out.bytes, 400, 920, 400, 80)).toBeGreaterThan(2);
    expect(await regionStdev(out.bytes, 0, 0, 800, 600)).toBe(0);
  });

  it("keeps JPEG input as JPEG", async () => {
    const out = await applyWatermark(await grayPhoto(600, 600, "jpeg"), "x");
    expect(out.mediaType).toBe("image/jpeg");
  });
});
