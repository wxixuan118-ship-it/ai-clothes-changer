import sharp from "sharp";

// Burns a visible watermark into free-plan results (the pricing page
// promises "watermarked downloads" on Free, none on paid plans). Text via an
// SVG overlay rendered by sharp/librsvg — the Docker runner installs fonts
// (font-dejavu); without any font the text would render blank.

function escapeXml(text: string): string {
  return text.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] ?? c,
  );
}

/** Full-canvas overlay so composite() needs no offsets. */
export function watermarkSvg(
  width: number,
  height: number,
  text: string,
): Buffer {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.035));
  const margin = Math.round(fontSize * 0.9);
  const stroke = Math.max(1, Math.round(fontSize / 14));
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<text x="${width - margin}" y="${height - margin}" text-anchor="end"` +
      ` font-family="DejaVu Sans, Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}"` +
      ` fill="#ffffff" fill-opacity="0.65" stroke="#000000" stroke-opacity="0.4"` +
      ` stroke-width="${stroke}" paint-order="stroke">${escapeXml(text)}</text></svg>`,
  );
}

export async function applyWatermark(
  bytes: Buffer,
  text: string,
): Promise<{
  bytes: Buffer;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
}> {
  const image = sharp(bytes, { failOn: "error" }).autoOrient();
  const meta = await image.metadata();
  const { width, height } = meta.autoOrient;
  image.composite([
    { input: watermarkSvg(width, height, text), top: 0, left: 0 },
  ]);
  // The overlay has alpha; don't leave an alpha channel on opaque photos.
  if (!meta.hasAlpha) image.removeAlpha();
  switch (meta.format) {
    case "jpeg":
      return {
        bytes: await image.jpeg({ quality: 92, mozjpeg: true }).toBuffer(),
        mediaType: "image/jpeg",
      };
    case "webp":
      return {
        bytes: await image.webp({ quality: 92 }).toBuffer(),
        mediaType: "image/webp",
      };
    default:
      // PNG (DashScope output), SVG mock placeholder, anything else.
      return { bytes: await image.png().toBuffer(), mediaType: "image/png" };
  }
}
