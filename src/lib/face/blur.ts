// Face boxes for the blur tool: landmark extents, padded so the blur covers
// the hairline and chin, clipped to the image.

export type FaceBox = { x: number; y: number; w: number; h: number };

export function faceBox(
  landmarks: { x: number; y: number }[],
  width: number,
  height: number,
  pad = 0.18,
): FaceBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const l of landmarks) {
    minX = Math.min(minX, l.x);
    minY = Math.min(minY, l.y);
    maxX = Math.max(maxX, l.x);
    maxY = Math.max(maxY, l.y);
  }
  const w = (maxX - minX) * width;
  const h = (maxY - minY) * height;
  const x0 = Math.max(0, minX * width - w * pad);
  // Extra room on top: the mesh stops below the hairline.
  const y0 = Math.max(0, minY * height - h * pad * 1.6);
  const x1 = Math.min(width, maxX * width + w * pad);
  const y1 = Math.min(height, maxY * height + h * pad);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function boxAt(boxes: FaceBox[], x: number, y: number): number {
  return boxes.findIndex(
    (b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h,
  );
}
