import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Action-level tests against real Postgres: real ledger, real rate limiter
// (in-memory fallback), real storage (./.generated). Only the session, the
// image provider, and Next's cache revalidation are mocked.

let currentUserId = "unset";
let signedOut = false;
const fakeSession = () => ({
  user: {
    id: currentUserId,
    name: "Gen Test",
    email: `${currentUserId}@test.local`,
  },
});
vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(async () => (signedOut ? null : fakeSession())),
  requireSession: vi.fn(async () => fakeSession()),
}));

const providerGenerate = vi.fn();
vi.mock("@/lib/ai/provider", () => ({
  getImageProvider: () => ({
    modelId: "mock/placeholder",
    generateImage: providerGenerate,
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Real credits module, but through a spread so individual functions can be
// spied on (the unknown-spend-failure test below).
vi.mock("@/lib/credits", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/credits")>()),
}));

import { GENERATION_COST_CREDITS } from "@/config/plans";
import { db } from "@/db";
import {
  creditTransactions,
  generations,
  subscriptions,
  users,
} from "@/db/schema";
import { readStoredImage } from "@/lib/ai/storage";
import { ContentBlockedError } from "@/lib/ai/errors";
import { mockProvider } from "@/lib/ai/mock";
import * as credits from "@/lib/credits";
import { grantCredits, grantWelcomeCredits } from "@/lib/credits";
import { closeDb, ensureTestDatabase } from "@/test/db";

import {
  deleteGenerationAction,
  generateImageAction,
  type GenerateResult,
} from "./actions";

const initialState: GenerateResult = { ok: true };
const runAction = (form: FormData) => generateImageAction(initialState, form);

beforeAll(async () => {
  await ensureTestDatabase();
}, 60_000);

afterAll(async () => {
  await closeDb();
});

beforeEach(() => {
  signedOut = false;
  providerGenerate.mockReset();
  // A real PNG, like DashScope returns — free-plan results get watermarked.
  providerGenerate.mockResolvedValue({
    url: `data:image/png;base64,${PNG_BYTES.toString("base64")}`,
    width: 1024,
    height: 1024,
    model: "mock/placeholder",
  });
});

/** Creates a user holding enough purchased credits for `images` runs. */
async function createUser(images: number): Promise<string> {
  const startingCredits = images * GENERATION_COST_CREDITS;
  const id = `gen_test_${randomUUID()}`;
  await db.insert(users).values({
    id,
    name: "Gen Test",
    email: `${id}@test.local`,
  });
  if (startingCredits > 0) {
    await grantCredits({
      userId: id,
      amount: startingCredits,
      type: "topup",
      ref: { type: "checkout_session", id: `cs_${id}` },
      idempotencyKey: `topup_cs_${id}`,
    });
  }
  currentUserId = id;
  return id;
}

// 1x1 PNG — enough to pass the type/size checks.
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const photo = (name = "person.png") =>
  new File([PNG_BYTES], name, { type: "image/png" });

function promptForm(prompt = "a navy tailored suit"): FormData {
  const form = new FormData();
  form.set("mode", "prompt");
  form.set("personImage", photo());
  form.set("prompt", prompt);
  return form;
}

async function balanceOf(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: users.creditBalance })
    .from(users)
    .where(eq(users.id, userId));
  return row?.balance ?? -1;
}

async function expectInvariant(userId: string): Promise<void> {
  const [ledger] = await db
    .select({
      total: sql<number>`coalesce(sum(${creditTransactions.amount}), 0)::int`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));
  expect(await balanceOf(userId)).toBe(ledger?.total);
}

async function rowsFor(userId: string) {
  return {
    generations: await db
      .select()
      .from(generations)
      .where(eq(generations.userId, userId)),
    spends: await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .then((rows) => rows.filter((row) => row.type === "spend")),
    refunds: await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .then((rows) => rows.filter((row) => row.type === "refund")),
  };
}

describe("generateImageAction", () => {
  it("happy path: spends one image's credits, stores the image, marks completed", async () => {
    const userId = await createUser(5);

    const result = await runAction(promptForm());

    expect(result).toMatchObject({ ok: true });
    expect(await balanceOf(userId)).toBe(4 * GENERATION_COST_CREDITS);
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("completed");
    expect(rows[0]?.imageUrl).toMatch(/^\/api\/images\//);
    expect(rows[0]?.model).toBe("mock/placeholder");
    expect(spends).toHaveLength(1);
    expect(spends[0]?.idempotencyKey).toBe(`spend_${rows[0]?.id}`);
    await expectInvariant(userId);
  });

  it("insufficient credits: clean error, no row left pending, no spend", async () => {
    const userId = await createUser(0);

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "insufficient_credits" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(0); // deleted, not left pending
    expect(spends).toHaveLength(0);
    expect(providerGenerate).not.toHaveBeenCalled();
    await expectInvariant(userId);
  });

  it("provider failure: refunds, marks failed, balance restored", async () => {
    const userId = await createUser(3);
    providerGenerate.mockRejectedValueOnce(new Error("provider down"));

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "generation_failed" });
    expect(await balanceOf(userId)).toBe(3 * GENERATION_COST_CREDITS); // spend + refund cancel out
    const { generations: rows, spends, refunds } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("failed");
    expect(spends).toHaveLength(1);
    expect(refunds).toHaveLength(1);
    expect(refunds[0]?.idempotencyKey).toBe(`refund_${rows[0]?.id}`);
    await expectInvariant(userId);
  });

  it("rate limit: the 11th call in a minute is rejected without a spend", async () => {
    const userId = await createUser(20);

    for (let i = 0; i < 10; i++) {
      expect((await runAction(promptForm())).ok).toBe(true);
    }
    const eleventh = await runAction(promptForm());

    expect(eleventh).toEqual({ ok: false, error: "rate_limited" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(10); // no 11th record either
    expect(spends).toHaveLength(10);
    expect(await balanceOf(userId)).toBe(10 * GENERATION_COST_CREDITS);
    await expectInvariant(userId);
  });

  it("FAIL prompt through the REAL mock provider: spend + refund, balance unchanged, marked failed", async () => {
    const userId = await createUser(5);
    // Delegate to the real mock provider so its failure switch is exercised
    // end to end through the action (the M7 Playwright suite drives the
    // same string through the browser).
    providerGenerate.mockImplementationOnce((input) =>
      mockProvider.generateImage(input),
    );

    const result = await runAction(promptForm("a suit, but make it FAIL"));

    expect(result).toEqual({ ok: false, error: "generation_failed" });
    expect(await balanceOf(userId)).toBe(5 * GENERATION_COST_CREDITS); // round-trip: unchanged
    const { generations: rows, spends, refunds } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("failed");
    expect(spends).toHaveLength(1);
    expect(refunds).toHaveLength(1);
    await expectInvariant(userId);
  });

  it("unknown spend failure keeps the pending row — the reconciliation signal", async () => {
    const userId = await createUser(5);
    const spendSpy = vi
      .spyOn(credits, "spendCredits")
      .mockRejectedValueOnce(new Error("connection reset"));

    await expect(runAction(promptForm())).rejects.toThrow("connection reset");
    spendSpy.mockRestore();

    // The spend MAY have committed server-side (lost ack). The record must
    // survive as pending so "pending + spend without refund" is queryable —
    // deleting it would orphan a possible charge.
    const { generations: rows } = await rowsFor(userId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("pending");
    expect(providerGenerate).not.toHaveBeenCalled();
    await expectInvariant(userId);
  });

  it("rejects an invalid prompt before any side effect", async () => {
    const userId = await createUser(2);

    const result = await runAction(promptForm("ab"));

    expect(result).toEqual({ ok: false, error: "invalid_prompt" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(0);
    expect(spends).toHaveLength(0);
  });
});

describe("generateImageAction — clothes changer inputs", () => {
  it("passes the person photo and the instruction to the provider", async () => {
    await createUser(2);

    const result = await runAction(promptForm("a red satin gown"));

    expect(result).toMatchObject({ ok: true });
    const input = providerGenerate.mock.calls[0]?.[0];
    expect(input.personImage.mediaType).toBe("image/png");
    expect(input.personImage.bytes.equals(PNG_BYTES)).toBe(true);
    expect(input.prompt).toContain("a red satin gown");
  });

  it("garment mode sends the garment photo and records a readable label", async () => {
    const userId = await createUser(2);
    const form = new FormData();
    form.set("mode", "garment");
    form.set("personImage", photo());
    form.set("garmentImage", photo("garment.png"));
    form.set("garmentType", "top");

    const result = await runAction(form);

    expect(result).toMatchObject({ ok: true });
    const input = providerGenerate.mock.calls[0]?.[0];
    expect(input.referenceImage.mediaType).toBe("image/png");
    expect(input.garmentType).toBe("top");
    const { generations: rows } = await rowsFor(userId);
    expect(rows[0]?.prompt).toBe("Garment photo · top");
  });

  it("style mode expands the preset into the instruction", async () => {
    const userId = await createUser(2);
    const form = new FormData();
    form.set("mode", "style");
    form.set("personImage", photo());
    form.set("styleId", "navy-suit");

    const result = await runAction(form);

    expect(result).toMatchObject({ ok: true });
    expect(providerGenerate.mock.calls[0]?.[0].prompt).toContain(
      "navy two-piece business suit",
    );
    const { generations: rows } = await rowsFor(userId);
    expect(rows[0]?.prompt).toBe("Style · Navy business suit");
  });

  it.each([
    ["no person photo", { mode: "prompt", prompt: "a suit" }, "invalid_photo"],
    [
      "a non-image person file",
      { mode: "prompt", prompt: "a suit", personText: true },
      "invalid_photo",
    ],
    ["garment mode without a garment", { mode: "garment" }, "invalid_garment"],
    ["an unknown style", { mode: "style", styleId: "nope" }, "invalid_style"],
  ] as const)(
    "rejects %s before any side effect",
    async (_name, fields, error) => {
      const userId = await createUser(2);
      const form = new FormData();
      form.set("mode", fields.mode);
      if ("prompt" in fields) form.set("prompt", fields.prompt);
      if ("styleId" in fields) form.set("styleId", fields.styleId);
      if (fields.mode !== "prompt") form.set("personImage", photo());
      if ("personText" in fields) {
        form.set(
          "personImage",
          new File(["hello"], "notes.txt", { type: "text/plain" }),
        );
      }

      const result = await runAction(form);

      expect(result).toEqual({ ok: false, error });
      const { generations: rows, spends } = await rowsFor(userId);
      expect(rows).toHaveLength(0);
      expect(spends).toHaveLength(0);
      expect(providerGenerate).not.toHaveBeenCalled();
    },
  );
});

describe("generateImageAction — hardening", () => {
  it("returns unauthenticated (no redirect, no side effects) without a session", async () => {
    const userId = await createUser(2);
    signedOut = true;

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "unauthenticated" });
    const { generations: rows, spends } = await rowsFor(userId);
    expect(rows).toHaveLength(0);
    expect(spends).toHaveLength(0);
    expect(providerGenerate).not.toHaveBeenCalled();
  });

  it("rejects non-image bytes even when declared image/jpeg", async () => {
    const userId = await createUser(2);
    const form = new FormData();
    form.set("mode", "prompt");
    form.set("prompt", "a navy suit");
    form.set(
      "personImage",
      new File(["<html><script>alert(1)</script></html>"], "x.jpg", {
        type: "image/jpeg",
      }),
    );

    const result = await runAction(form);

    expect(result).toEqual({ ok: false, error: "invalid_photo" });
    const { spends } = await rowsFor(userId);
    expect(spends).toHaveLength(0);
  });

  it("derives the media type from the bytes, not the declared type", async () => {
    await createUser(2);
    const form = promptForm();
    form.set(
      "personImage",
      new File([PNG_BYTES], "x.jpg", { type: "image/jpeg" }),
    );

    await runAction(form);

    expect(providerGenerate.mock.calls[0]?.[0].personImage.mediaType).toBe(
      "image/png",
    );
  });
});

describe("deleteGenerationAction", () => {
  it("deletes the owner's finished result and leaves the ledger untouched", async () => {
    const userId = await createUser(2);
    await runAction(promptForm());
    const { generations: before, spends } = await rowsFor(userId);
    const id = before[0]?.id as string;

    expect(await deleteGenerationAction(id)).toEqual({ ok: true });

    const after = await rowsFor(userId);
    expect(after.generations).toHaveLength(0);
    expect(after.spends).toHaveLength(spends.length); // append-only ledger
    await expectInvariant(userId);
  });

  it("refuses another user's result and pending rows", async () => {
    const owner = await createUser(2);
    await runAction(promptForm());
    const { generations: rows } = await rowsFor(owner);
    const id = rows[0]?.id as string;

    await createUser(0); // switch the session to someone else
    expect(await deleteGenerationAction(id)).toEqual({ ok: false });
    expect((await rowsFor(owner)).generations).toHaveLength(1);

    currentUserId = owner;
    await db
      .update(generations)
      .set({ status: "pending" })
      .where(eq(generations.id, id));
    expect(await deleteGenerationAction(id)).toEqual({ ok: false });
    expect(await deleteGenerationAction("not-a-uuid")).toEqual({ ok: false });
  });
});

describe("generateImageAction — hairstyle changer", () => {
  const hairForm = (fields: Record<string, string>, reference = false) => {
    const form = new FormData();
    form.set("tool", "hair");
    form.set("personImage", photo());
    for (const [key, value] of Object.entries(fields)) form.set(key, value);
    if (reference) form.set("referenceImage", photo("hair.png"));
    return form;
  };

  it("preset: hair-only instruction, hair task, readable label", async () => {
    const userId = await createUser(2);

    const result = await runAction(
      hairForm({ mode: "style", styleId: "pixie-cut" }),
    );

    expect(result).toMatchObject({ ok: true });
    const input = providerGenerate.mock.calls[0]?.[0];
    expect(input.task).toBe("hair");
    expect(input.prompt).toContain("pixie cut");
    expect(input.prompt).toContain("Keep the face");
    const { generations: rows } = await rowsFor(userId);
    expect(rows[0]?.prompt).toBe("Hairstyle · Pixie cut");
  });

  it("reference photo: sends it as the reference image", async () => {
    const userId = await createUser(2);

    const result = await runAction(hairForm({ mode: "reference" }, true));

    expect(result).toMatchObject({ ok: true });
    expect(providerGenerate.mock.calls[0]?.[0].referenceImage.mediaType).toBe(
      "image/png",
    );
    const { generations: rows } = await rowsFor(userId);
    expect(rows[0]?.prompt).toBe("Hairstyle photo");
  });

  it("text: wraps the description in the hair-only instruction", async () => {
    await createUser(2);

    await runAction(
      hairForm({ mode: "prompt", prompt: "long beach waves, honey blonde" }),
    );

    expect(providerGenerate.mock.calls[0]?.[0].prompt).toMatch(
      /^Change only the person's hair to: long beach waves, honey blonde/,
    );
  });

  it.each([
    [
      "a clothes preset id",
      { mode: "style", styleId: "navy-suit" },
      false,
      "invalid_style",
    ],
    [
      "reference mode without a photo",
      { mode: "reference" },
      false,
      "invalid_garment",
    ],
  ] as const)("rejects %s", async (_name, fields, reference, error) => {
    const userId = await createUser(2);

    const result = await runAction(hairForm(fields, reference));

    expect(result).toEqual({ ok: false, error });
    expect((await rowsFor(userId)).spends).toHaveLength(0);
  });
});

describe("generateImageAction — content safety", () => {
  it.each([
    ["clothes", "remove her clothes", "blocked_prompt"],
    ["hair", "make her look 15 years old", "blocked_prompt"],
    ["clothes", "red bikini", "unsupported_prompt"],
  ] as const)(
    "%s prompt %j is refused before any side effect",
    async (tool, prompt, error) => {
      const userId = await createUser(2);
      const form = promptForm(prompt);
      form.set("tool", tool);

      const result = await runAction(form);

      expect(result).toEqual({ ok: false, error });
      const { generations: rows, spends } = await rowsFor(userId);
      expect(rows).toHaveLength(0);
      expect(spends).toHaveLength(0);
      expect(providerGenerate).not.toHaveBeenCalled();
    },
  );

  it("a provider safety refusal refunds and reports blocked_result", async () => {
    const userId = await createUser(3);
    providerGenerate.mockRejectedValueOnce(
      new ContentBlockedError("DataInspectionFailed"),
    );

    const result = await runAction(promptForm());

    expect(result).toEqual({ ok: false, error: "blocked_result" });
    expect(await balanceOf(userId)).toBe(3 * GENERATION_COST_CREDITS);
    const { generations: rows, refunds } = await rowsFor(userId);
    expect(rows[0]?.status).toBe("failed");
    expect(refunds).toHaveLength(1);
    await expectInvariant(userId);
  });
});

describe("generateImageAction — watermark entitlement", () => {
  async function storedBytesFor(userId: string) {
    const { generations: rows } = await rowsFor(userId);
    const file = rows[0]?.imageUrl?.split("/").pop() as string;
    return Buffer.from((await readStoredImage(file)) ?? new Uint8Array());
  }

  async function grayPng() {
    const sharp = (await import("sharp")).default;
    return sharp({
      create: { width: 400, height: 500, channels: 3, background: "#777777" },
    })
      .png()
      .toBuffer();
  }

  async function runWith(original: Buffer) {
    providerGenerate.mockResolvedValueOnce({
      url: `data:image/png;base64,${original.toString("base64")}`,
      width: 400,
      height: 500,
      model: "mock/placeholder",
    });
    return runAction(promptForm());
  }

  /** Fetches the result through /api/images as the signed-in owner. */
  async function serve(userId: string, query: string) {
    const { GET } = await import("@/app/api/images/[file]/route");
    const { generations: rows } = await rowsFor(userId);
    const file = rows[0]?.imageUrl?.split("/").pop() as string;
    const response = await GET(
      new Request(`http://test.local/api/images/${file}${query}`),
      { params: Promise.resolve({ file }) },
    );
    return {
      status: response.status,
      bytes: Buffer.from(await response.arrayBuffer()),
    };
  }

  it("free users: stored clean, served watermarked, clean download refused", async () => {
    // Only the free sign-up credits — nothing bought.
    const userId = await createUser(0);
    await grantWelcomeCredits(userId);
    const original = await grayPng();
    expect(await runWith(original)).toMatchObject({
      ok: true,
      result: { watermarkFree: false },
    });

    expect((await storedBytesFor(userId)).equals(original)).toBe(true);
    const { generations: rows } = await rowsFor(userId);
    expect(rows[0]?.watermarkFree).toBe(false);

    const shown = await serve(userId, "");
    expect(shown.status).toBe(200);
    expect(shown.bytes.equals(original)).toBe(false);
    expect((await serve(userId, "?variant=clean")).status).toBe(402);
    const free = await serve(userId, "?variant=watermarked&download=1");
    expect(free.status).toBe(200);
    expect(free.bytes.equals(original)).toBe(false);
  });

  it("paid users get clean results and clean downloads", async () => {
    const userId = await createUser(2);
    await db.insert(subscriptions).values({
      userId,
      stripeCustomerId: `cus_${userId}`,
      status: "active",
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY as string,
    });
    const original = await grayPng();
    expect(await runWith(original)).toMatchObject({
      ok: true,
      result: { watermarkFree: true },
    });

    const clean = await serve(userId, "?variant=clean&download=1");
    expect(clean.status).toBe(200);
    expect(clean.bytes.equals(original)).toBe(true);
    // The free version is still available on request.
    const free = await serve(userId, "?variant=watermarked");
    expect(free.bytes.equals(original)).toBe(false);
  });

  it("runs made after buying credits are watermark-free", async () => {
    const userId = await createUser(2);
    await grantCredits({
      userId,
      amount: 100,
      type: "topup",
      idempotencyKey: `topup_${userId}`,
    });
    const original = await grayPng();
    expect(await runWith(original)).toMatchObject({
      ok: true,
      result: { watermarkFree: true },
    });
    const clean = await serve(userId, "?variant=clean");
    expect(clean.status).toBe(200);
    expect(clean.bytes.equals(original)).toBe(true);
    await expectInvariant(userId);
  });
});
