// Edit tasks shared by the generate action and every provider. Kept apart
// from provider.ts, which imports the providers themselves.

export type EditTask = "clothes" | "hair" | "glasses";

/** How provider prompts name the reference photo for each task. */
export function referenceKind(task: EditTask | undefined): string {
  if (task === "hair") return "hairstyle";
  if (task === "glasses") return "eyewear";
  return "garment";
}
