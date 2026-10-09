"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ImageUpIcon,
  ScissorsIcon,
  ShirtIcon,
  SparklesIcon,
  TypeIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  generateImageAction,
  type GenerateResult,
} from "@/app/(app)/generate/actions";
import { BusyButton } from "@/components/busy-button";
import {
  AuthDialog,
  type AuthOptions,
} from "@/components/generate/auth-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getHairPreset,
  hairCategories,
  hairPresets,
} from "@/config/hairstyles";
import { getStylePreset, styleCategories, stylePresets } from "@/config/styles";
import { tools, type ToolId } from "@/config/tools";
import { cn } from "@/lib/utils";

const initialState: GenerateResult = { ok: true };

/** Formats the browser can decode and the server accepts. */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Original-file cap before downscaling (phone photos run 3–15MB). */
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

const errorMessages: Record<NonNullable<GenerateResult["error"]>, string> = {
  invalid_photo: "Use a JPG, PNG, or WebP photo of yourself (up to 25 MB).",
  invalid_garment: "Use a JPG, PNG, or WebP reference photo.",
  invalid_prompt: "Describe the look in 3–300 characters.",
  invalid_style: "Pick a style first.",
  unauthenticated: "Please sign in again to continue.",
  blocked_prompt:
    "We can't make this edit. We only create fully clothed, non-sexual looks of adults. Try a different description. No credits were used.",
  unsupported_prompt:
    "Swimwear, lingerie, and suggestive looks aren't supported. Try describing the cut, color, or fabric instead. No credits were used.",
  english_only: "Please describe the look in English.",
  unavailable:
    "Image generation isn't switched on yet — please check back soon. No credits were used.",
  provider_busy:
    "Our generator is busy right now — your credit was refunded. Please try again in a moment.",
  blocked_result:
    "Our safety check couldn't approve this photo or result, so no image was made. Try a photo where you're fully dressed. Your credit was refunded.",
  rate_limited: "Slow down — 10 per minute. Try again in a moment.",
  insufficient_credits:
    "You're out of credits — top up in Billing and try again.",
  generation_failed: "Outfit change failed — credit refunded.",
};

type Mode = "reference" | "prompt" | "style";

type Preset = { id: string; name: string; category: string; tint: string };

const garmentTypes = [
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "dress", label: "Dress" },
  { id: "full", label: "Full outfit" },
] as const;

// Everything that differs between the two generators. The clothes copy and
// field names are unchanged from the original clothes-only form.
const toolCopy = {
  clothes: {
    referenceMode: "garment",
    referenceField: "garmentImage",
    referenceId: "garment-photo",
    referenceTitle: "Upload a garment",
    referenceHint:
      "Product shot, flat lay, or someone wearing it. Clean backgrounds work best.",
    personHint:
      "One person, facing the camera, half or full body. Drag & drop or click.",
    step2: "Choose the outfit",
    modeLabels: {
      reference: { label: "Garment photo", short: "Garment" },
      prompt: { label: "Describe it", short: "Describe" },
      style: { label: "Styles", short: "Styles" },
    },
    promptLabel: "Describe the outfit",
    promptExample: "light blue linen suit with a white tee",
    promptIdeas: [
      "Navy tailored suit with a white shirt",
      "Red satin evening gown",
      "Oversized beige trench coat",
      "Black leather biker jacket",
    ],
    categories: styleCategories as readonly string[],
    presets: stylePresets as readonly Preset[],
    getPreset: getStylePreset as (id: string) => Preset | undefined,
    busyLabel: "Changing outfit…",
  },
  hair: {
    referenceMode: "reference",
    referenceField: "referenceImage",
    referenceId: "hair-photo",
    referenceTitle: "Upload a hairstyle",
    referenceHint:
      "A clear photo of the haircut you want — a celebrity, a salon photo, anyone.",
    personHint:
      "A clear photo of your face with your hair visible. Drag & drop or click.",
    step2: "Choose the hairstyle",
    modeLabels: {
      reference: { label: "Hairstyle photo", short: "Photo" },
      prompt: { label: "Describe it", short: "Describe" },
      style: { label: "Hairstyles", short: "Styles" },
    },
    promptLabel: "Describe the hairstyle",
    promptExample: "short curly bob, copper red",
    promptIdeas: [
      "Short pixie cut with side bangs",
      "Long beach waves, honey blonde",
      "Textured crop with a low fade",
      "Shoulder-length bob, jet black",
    ],
    categories: hairCategories as readonly string[],
    presets: hairPresets as readonly Preset[],
    getPreset: getHairPreset as (id: string) => Preset | undefined,
    busyLabel: "Changing hairstyle…",
  },
} as const;

const modeIcons: Record<Mode, typeof ShirtIcon> = {
  reference: ShirtIcon,
  prompt: TypeIcon,
  style: SparklesIcon,
};
// Tab order: the hairstyle tool leads with its style library.
const modeOrders: Record<"hair" | "clothes", Mode[]> = {
  hair: ["style", "reference", "prompt"],
  clothes: ["reference", "prompt", "style"],
};

const MAX_EDGE = 1600;

/** Downscale to ≤1600px JPEG so uploads stay well under platform limits. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  // Transparent PNGs (product cut-outs) land on white, not black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
      "image/jpeg",
      0.9,
    ),
  );
}

/** Same-origin dev images and Blob URLs both download via ?download=1. */
function downloadHref(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
}

function usePhoto() {
  const [photo, setPhoto] = React.useState<{
    file: File;
    preview: string;
  } | null>(null);
  // Tracks the live object URL outside React state so it is revoked exactly
  // once — on replacement and on unmount.
  const urlRef = React.useRef<string | null>(null);

  const setFile = React.useCallback((file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const next = file ? { file, preview: URL.createObjectURL(file) } : null;
    urlRef.current = next?.preview ?? null;
    setPhoto(next);
  }, []);

  React.useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    },
    [],
  );

  return {
    file: photo?.file ?? null,
    preview: photo?.preview ?? null,
    setFile,
  };
}

function PhotoDrop({
  id,
  title,
  hint,
  preview,
  onFile,
  invalidMessage,
  disabled,
  className,
}: {
  id: string;
  title: string;
  hint: string;
  preview: string | null;
  onFile: (file: File | null) => void;
  invalidMessage: string;
  disabled?: boolean;
  className?: string;
}) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Drag-and-drop bypasses the input's accept= filter, so every path
  // through here checks the type and size itself.
  const accept = React.useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (
        !ACCEPTED_TYPES.includes(file.type) ||
        file.size > MAX_ORIGINAL_BYTES
      ) {
        toast.error(invalidMessage);
        return;
      }
      onFile(file);
    },
    [invalidMessage, onFile],
  );

  // A file picked before hydration never fired React's onChange — adopt
  // whatever the native input already holds once we mount.
  React.useEffect(() => {
    const input = inputRef.current;
    const pending = input?.files?.[0];
    if (input && pending) {
      accept(pending);
      input.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Input first so the label can show its keyboard focus via peer-*. */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="peer sr-only"
        disabled={disabled}
        onChange={(event) => {
          accept(event.target.files?.[0]);
          // Clear so picking the same file again still fires onChange.
          event.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        onDragOver={(event) => {
          // Always claim the drop — otherwise the browser opens the image
          // and navigates away mid-run.
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          accept(event.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex h-full min-h-48 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] border border-dashed border-[var(--brand-line)] bg-[var(--canvas)] p-6 text-center transition-colors hover:bg-[color-mix(in_oklch,var(--ink),transparent_95%)]",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)]",
          dragging && "border-[var(--brand)] bg-[var(--brand-soft)]",
          preview && "border-solid p-0",
          disabled && "cursor-default",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            src={preview}
            alt={title}
            className="absolute inset-0 size-full object-contain"
          />
        ) : (
          <>
            <span className="flex size-12 items-center justify-center rounded-full border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <ImageUpIcon className="size-5" aria-hidden />
            </span>
            <span className="font-medium">{title}</span>
            <span className="max-w-[28ch] text-sm text-[var(--muted-ink)]">
              {hint}
            </span>
          </>
        )}
      </label>
      {preview ? (
        <button
          type="button"
          onClick={() => {
            onFile(null);
            // The button unmounts with the preview — keep keyboard focus
            // on the (now empty) drop zone instead of dropping to <body>.
            inputRef.current?.focus();
          }}
          disabled={disabled}
          aria-label={`Remove ${title.toLowerCase()}`}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--ink-deep)]"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

export function GenerateForm({
  balance,
  cost,
  mock,
  signedIn,
  auth,
  showHistoryLink = false,
  tool = "clothes",
}: {
  balance: number;
  cost: number;
  /** AI_MOCK is on — results echo the uploaded photo. */
  mock: boolean;
  /** Signed-out visitors (home page) authenticate in a dialog on submit. */
  signedIn: boolean;
  auth?: AuthOptions;
  /** Home page: point at the studio's full history after a run. */
  showHistoryLink?: boolean;
  /** Which generator this form drives. */
  tool?: ToolId;
}) {
  const copy = toolCopy[tool];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formId = React.useId();
  const submitRef = React.useRef<HTMLButtonElement>(null);
  const resultRef = React.useRef<HTMLHeadingElement>(null);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [state, formAction, pending] = React.useActionState(
    generateImageAction,
    initialState,
  );
  const [isPreparing, startPreparing] = React.useTransition();
  const person = usePhoto();
  const garment = usePhoto();
  // The hairstyle tool opens on the style library (pick and go); the
  // clothes tool on the garment upload.
  const modeOrder = modeOrders[tool];
  const [mode, setMode] = React.useState<Mode>(
    tool === "hair" ? "style" : "reference",
  );
  const [garmentType, setGarmentType] =
    React.useState<(typeof garmentTypes)[number]["id"]>("full");
  // Preview photos of the curated hairstyles (id → version), once generated.
  const [previews, setPreviews] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    if (tool !== "hair") return;
    let cancelled = false;
    fetch("/api/preset-previews")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { hair?: Record<string, number> } | null) => {
        if (!cancelled && data?.hair) setPreviews(data.hair);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tool]);
  const [prompt, setPrompt] = React.useState("");
  const [styleFilter, setStyleFilter] = React.useState<string>("All");
  const [styleId, setStyleId] = React.useState<string>(
    copy.presets[0]?.id ?? "",
  );

  // "?style=<id>" (the home page style cards) preselects that style. Applied
  // during render whenever the param changes, so a second card click on the
  // same page also takes effect.
  const styleParam = searchParams.get("style");
  const [appliedStyleParam, setAppliedStyleParam] = React.useState<
    string | null
  >(null);
  if (styleParam !== appliedStyleParam) {
    setAppliedStyleParam(styleParam);
    if (styleParam && copy.getPreset(styleParam)) {
      setMode("style");
      setStyleId(styleParam);
    }
  }

  // The result panel belongs to the run that produced it; picking a new
  // photo dismisses it until the next success.
  const [dismissedFor, setDismissedFor] = React.useState<GenerateResult | null>(
    null,
  );
  const showResult =
    state !== initialState && state.ok && dismissedFor !== state;

  React.useEffect(() => {
    if (state === initialState) return;
    if (state.error === "unauthenticated") {
      // Session expired mid-visit. On the home page reopen the dialog so the
      // photo and outfit survive; elsewhere go through login and come back.
      if (auth) {
        router.refresh();
      } else {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }
      toast.error(errorMessages.unauthenticated);
      return;
    }
    if (state.error) {
      toast.error(errorMessages[state.error]);
      return;
    }
    toast.success(`New look ready! ${cost} credit spent.`);
    resultRef.current?.focus();
  }, [state, cost, auth, pathname, router]);

  // An expired session on the home page reopens the sign-in dialog (derived,
  // so it shows once per failed run and stays closed after dismissal).
  const [authDismissedFor, setAuthDismissedFor] =
    React.useState<GenerateResult | null>(null);
  const dialogOpen =
    authOpen ||
    (Boolean(auth) &&
      state.error === "unauthenticated" &&
      authDismissedFor !== state);
  const closeDialog = () => {
    setAuthOpen(false);
    setAuthDismissedFor(state);
  };

  const busy = pending || isPreparing;
  const outOfCredits = signedIn && balance < cost;
  const latest = showResult ? (state.result ?? null) : null;
  const ready =
    Boolean(person.file) &&
    (mode === "reference"
      ? Boolean(garment.file)
      : mode === "prompt"
        ? prompt.trim().length >= 3
        : Boolean(styleId));

  // Tells the visitor why the button is still disabled.
  const missing = !person.file
    ? "Upload your photo to start."
    : mode === "reference" && !garment.file
      ? `${copy.referenceTitle} too — or switch to “${copy.modeLabels.style.label}” to pick one.`
      : mode === "prompt" && prompt.trim().length < 3
        ? `${copy.promptLabel} (at least 3 characters).`
        : mode === "style" && !styleId
          ? `${copy.step2} — tap one above.`
          : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signedIn && auth) {
      setAuthOpen(true);
      return;
    }
    submit();
  }

  function submit() {
    if (!person.file) {
      toast.error(errorMessages.invalid_photo);
      return;
    }
    const personFile = person.file;
    const garmentFile = mode === "reference" ? garment.file : null;
    startPreparing(async () => {
      const formData = new FormData();
      formData.set("tool", tool);
      formData.set("mode", mode === "reference" ? copy.referenceMode : mode);
      // A file can pass the type check and still be undecodable (corrupt,
      // mislabeled). Report it on the right photo instead of crashing.
      try {
        formData.set("personImage", await downscale(personFile), "person.jpg");
      } catch {
        person.setFile(null);
        toast.error(errorMessages.invalid_photo);
        return;
      }
      if (garmentFile) {
        try {
          formData.set(
            copy.referenceField,
            await downscale(garmentFile),
            "reference.jpg",
          );
        } catch {
          garment.setFile(null);
          toast.error(errorMessages.invalid_garment);
          return;
        }
        if (tool === "clothes") formData.set("garmentType", garmentType);
      }
      if (mode === "prompt") formData.set("prompt", prompt);
      if (mode === "style") formData.set("styleId", styleId);
      React.startTransition(() => formAction(formData));
    });
  }

  function onTabKeyDown(event: React.KeyboardEvent, index: number) {
    const last = modeOrder.length - 1;
    const next =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    const target = modeOrder[next];
    if (!target) return;
    setMode(target);
    tabRefs.current[next]?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-[minmax(0,1fr)] gap-6"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="flex min-w-0 flex-col gap-3">
          <p className="text-sm font-medium">
            <span className="mr-2 text-[var(--muted-ink)]">01</span>Your photo
          </p>
          <PhotoDrop
            id="person-photo"
            title="Upload your photo"
            hint={copy.personHint}
            preview={person.preview}
            invalidMessage={errorMessages.invalid_photo}
            onFile={(file) => {
              person.setFile(file);
              setDismissedFor(state);
            }}
            disabled={busy}
            className="aspect-square min-h-0 sm:aspect-[4/5] lg:aspect-auto lg:flex-1"
          />
        </section>

        <section className="flex min-w-0 flex-col gap-3">
          <p className="text-sm font-medium">
            <span className="mr-2 text-[var(--muted-ink)]">02</span>
            {copy.step2}
          </p>
          <div className="flex flex-1 flex-col rounded-[24px] border bg-[var(--paper-2)] p-3 sm:p-5">
            <div
              role="tablist"
              aria-label={
                tool === "hair" ? "Hairstyle source" : "Outfit source"
              }
              className="grid grid-cols-3 gap-1 rounded-full bg-[var(--canvas)] p-1"
            >
              {modeOrder.map((id, index) => {
                const item = {
                  id,
                  icon:
                    id === "reference" && tool === "hair"
                      ? ScissorsIcon
                      : modeIcons[id],
                  ...copy.modeLabels[id],
                };
                return (
                  <button
                    key={item.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    id={`${formId}-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={mode === item.id}
                    aria-controls={`${formId}-panel`}
                    aria-label={item.label}
                    tabIndex={mode === item.id ? 0 : -1}
                    onClick={() => setMode(item.id)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-full px-1.5 py-2 text-[13px] transition-colors sm:px-3 sm:text-sm",
                      mode === item.id
                        ? "bg-[var(--brand)] font-medium text-[var(--ink-deep)]"
                        : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
                    )}
                  >
                    <item.icon
                      className="hidden size-4 shrink-0 sm:block"
                      aria-hidden
                    />
                    <span className="truncate">{item.short}</span>
                  </button>
                );
              })}
            </div>

            <div
              id={`${formId}-panel`}
              role="tabpanel"
              aria-labelledby={`${formId}-tab-${mode}`}
              className="mt-5 flex-1"
            >
              {mode === "reference" ? (
                <div className="grid h-full gap-4">
                  <PhotoDrop
                    key={copy.referenceId}
                    id={copy.referenceId}
                    title={copy.referenceTitle}
                    hint={copy.referenceHint}
                    preview={garment.preview}
                    invalidMessage={errorMessages.invalid_garment}
                    onFile={garment.setFile}
                    disabled={busy}
                    className="min-h-48"
                  />
                  {tool === "clothes" ? (
                    <div>
                      <p className="mb-2 text-sm text-[var(--muted-ink)]">
                        Replace my
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {garmentTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            aria-pressed={garmentType === type.id}
                            onClick={() => setGarmentType(type.id)}
                            className={cn(
                              "rounded-full border px-4 py-1.5 text-sm transition-colors",
                              garmentType === type.id
                                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--ink-deep)]"
                                : "hover:bg-[color-mix(in_oklch,var(--ink),transparent_92%)]",
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mode === "prompt" ? (
                <div className="grid gap-4">
                  <Textarea
                    aria-label={copy.promptLabel}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={
                      mock
                        ? `e.g. "${copy.promptExample}" — mock mode: include FAIL to simulate an error and refund`
                        : `e.g. "${copy.promptExample}"`
                    }
                    maxLength={300}
                    disabled={busy}
                    className="min-h-36 rounded-[18px] bg-[var(--canvas)]"
                  />
                  <div className="flex flex-wrap gap-2">
                    {copy.promptIdeas.map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        className="rounded-full border px-3.5 py-1.5 text-sm text-[var(--muted-ink)] transition-colors hover:text-[var(--ink)]"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {mode === "style" ? (
                <div className="grid gap-3">
                  <div
                    role="group"
                    aria-label="Filter by style"
                    className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
                  >
                    {["All", ...copy.categories].map((category) => (
                      <button
                        key={category}
                        type="button"
                        aria-pressed={styleFilter === category}
                        onClick={() => setStyleFilter(category)}
                        className={cn(
                          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                          styleFilter === category
                            ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--ink-deep)]"
                            : "text-[var(--muted-ink)] hover:text-[var(--ink)]",
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="grid max-h-[26rem] gap-5 overflow-y-auto pr-1">
                    {copy.categories
                      .filter(
                        (category) =>
                          styleFilter === "All" || styleFilter === category,
                      )
                      .map((category) => (
                        <div key={category}>
                          <p className="mb-2 text-sm text-[var(--muted-ink)]">
                            {category}
                          </p>
                          <div
                            className={cn(
                              "grid gap-2",
                              tool === "hair"
                                ? "grid-cols-3 sm:grid-cols-5"
                                : "grid-cols-2 sm:grid-cols-3",
                            )}
                          >
                            {copy.presets
                              .filter((preset) => preset.category === category)
                              .map((preset) =>
                                tool === "hair" ? (
                                  // Hairstyles: a photo card (preview image
                                  // once generated in /admin, else the tint).
                                  <button
                                    key={preset.id}
                                    type="button"
                                    aria-pressed={styleId === preset.id}
                                    onClick={() => setStyleId(preset.id)}
                                    className={cn(
                                      "overflow-hidden rounded-[14px] border text-left text-xs transition-colors",
                                      styleId === preset.id
                                        ? "border-[var(--brand)] bg-[var(--brand-soft)] ring-2 ring-[var(--brand)]"
                                        : "hover:border-[var(--muted-ink)]",
                                    )}
                                  >
                                    <span
                                      aria-hidden
                                      className="relative block aspect-[3/4]"
                                      style={{ background: preset.tint }}
                                    >
                                      {previews[preset.id] ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- small stored JPEG
                                        <img
                                          src={`/api/preset-previews/hair/${preset.id}?v=${previews[preset.id]}`}
                                          alt=""
                                          loading="lazy"
                                          className="absolute inset-0 size-full object-cover"
                                        />
                                      ) : null}
                                    </span>
                                    <span className="block truncate px-2 py-1.5">
                                      {preset.name}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    aria-pressed={styleId === preset.id}
                                    onClick={() => setStyleId(preset.id)}
                                    className={cn(
                                      "flex items-center gap-3 rounded-[14px] border p-2 text-left text-sm transition-colors",
                                      styleId === preset.id
                                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                                        : "hover:bg-[color-mix(in_oklch,var(--ink),transparent_95%)]",
                                    )}
                                  >
                                    <span
                                      aria-hidden
                                      className="h-10 w-7 shrink-0 rounded-t-full rounded-b-sm"
                                      style={{ background: preset.tint }}
                                    />
                                    {preset.name}
                                  </button>
                                ),
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BusyButton
          ref={submitRef}
          type="submit"
          busy={busy}
          busyLabel={copy.busyLabel}
          disabled={outOfCredits || !ready}
          className="h-auto min-h-12 w-full rounded-full px-6 py-2 text-base whitespace-normal sm:w-auto sm:px-8"
        >
          {`${tools[tool].action} — ${cost} credit`}
        </BusyButton>
        {outOfCredits ? (
          <p className="text-sm text-[var(--muted-ink)]">
            You&apos;re out of credits —{" "}
            <Link href="/billing" className="underline underline-offset-4">
              top up in Billing
            </Link>
            .
          </p>
        ) : missing ? (
          <p className="text-sm text-[var(--brand)]" aria-live="polite">
            {missing}
          </p>
        ) : (
          <p className="text-sm text-[var(--muted-ink)]">
            Takes about 10–20 seconds. Failed runs are refunded automatically.
          </p>
        )}
      </div>

      {auth ? (
        <AuthDialog
          open={dialogOpen}
          onOpenChange={(open) => (open ? setAuthOpen(true) : closeDialog())}
          options={auth}
          returnFocusRef={submitRef}
          onAuthenticated={() => {
            closeDialog();
            submit();
            router.refresh();
          }}
        />
      ) : null}

      {latest && person.preview ? (
        <section className="max-w-3xl rounded-[24px] border bg-[var(--paper-2)] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2
              ref={resultRef}
              tabIndex={-1}
              className="font-sans text-base font-medium tracking-normal outline-none"
            >
              Your new look
            </h2>
            {showHistoryLink ? (
              <Link
                href={tools[tool].studio}
                className="mr-auto text-sm text-[var(--muted-ink)] underline underline-offset-4 hover:text-[var(--ink)]"
              >
                All my looks
              </Link>
            ) : null}
            <a
              href={downloadHref(latest.imageUrl)}
              download
              className="pill pill-brand px-5 py-2 text-sm"
            >
              Download
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { src: person.preview, caption: "Before" },
              { src: latest.imageUrl, caption: latest.label },
            ].map((item) => (
              <figure key={item.caption} className="grid min-w-0 gap-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[var(--canvas)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob + API-served images */}
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="absolute inset-0 size-full object-contain"
                  />
                </div>
                <figcaption className="truncate text-sm text-[var(--muted-ink)]">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </form>
  );
}
