import sharp from "sharp";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    KIE_API_KEY: "kie-test",
    KIE_BASE_URL: "https://api.kie.test",
    KIE_UPLOAD_URL: "https://upload.kie.test",
  },
}));

import { ContentBlockedError, ProviderBusyError } from "./errors";
import { buildPrompt, checkKie, kieProvider, pickAspectRatio } from "./kie";

let portrait: { bytes: Buffer; mediaType: string };
const reference = { bytes: Buffer.from("ref"), mediaType: "image/png" };

beforeAll(async () => {
  const bytes = await sharp({
    create: { width: 600, height: 800, channels: 3, background: "#888" },
  })
    .jpeg()
    .toBuffer();
  portrait = { bytes, mediaType: "image/jpeg" };
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Routes by URL so parallel uploads don't depend on call order. */
function mockKie(handlers: {
  upload?: () => Response;
  create: Response[];
  poll?: Response[];
}) {
  const fn = vi.fn(async (url: string) => {
    if (url.includes("/api/file-base64-upload")) {
      return (
        handlers.upload?.() ??
        json({
          code: 200,
          data: {
            downloadUrl: `https://tmp.kie.test/${fn.mock.calls.length}.png`,
          },
        })
      );
    }
    if (url.includes("/createTask")) {
      const next = handlers.create.shift();
      if (!next) throw new Error("unexpected createTask");
      return next;
    }
    const next = handlers.poll?.shift();
    if (!next) throw new Error(`unexpected fetch ${url}`);
    return next;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function run(input: Parameters<typeof kieProvider.generateImage>[0]) {
  vi.useFakeTimers({ toFake: ["setTimeout"] });
  let settled = false;
  const promise = kieProvider.generateImage(input);
  promise.then(
    () => (settled = true),
    () => (settled = true),
  );
  for (let i = 0; i < 500 && !settled; i++) {
    await new Promise((resolve) => setImmediate(resolve));
    await vi.advanceTimersByTimeAsync(1_000);
  }
  return promise;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const base = {
  prompt: "Give the person a bob cut.",
  userId: "user_1",
  task: "hair" as const,
  model: "seedream/5-flash-image-to-image",
};

describe("kie provider", () => {
  it("picks the closest supported aspect ratio", async () => {
    expect(await pickAspectRatio(portrait)).toBe("3:4");
  });

  it("names the person image 1 and the reference image 2", () => {
    const prompt = buildPrompt({ ...base, referenceImage: reference });
    expect(prompt).toContain("Image 1 is the person to edit");
    expect(prompt).toContain("Image 2 is the hairstyle reference");
  });

  it("uploads both photos, creates a Seedream task and polls it", async () => {
    const fetchMock = mockKie({
      create: [json({ code: 200, data: { taskId: "t1" } })],
      poll: [
        json({ code: 200, data: { state: "generating" } }),
        json({
          code: 200,
          data: {
            state: "success",
            resultJson: JSON.stringify({
              resultUrls: ["https://cdn.kie.test/out.png"],
            }),
          },
        }),
      ],
    });
    const result = await run({
      ...base,
      personImage: portrait,
      referenceImage: reference,
    });
    expect(result).toEqual({
      url: "https://cdn.kie.test/out.png",
      width: 1536,
      height: 2048,
      model: "seedream/5-flash-image-to-image",
    });

    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][];
    const uploads = calls.filter(([url]) => url.includes("file-base64-upload"));
    expect(uploads).toHaveLength(2);
    expect(uploads[0]?.[1].headers).toMatchObject({
      Authorization: "Bearer kie-test",
    });

    const create = calls.find(([url]) => url.includes("createTask"));
    const payload = JSON.parse(String(create?.[1].body));
    expect(payload.model).toBe("seedream/5-flash-image-to-image");
    expect(payload.input).toMatchObject({
      aspect_ratio: "3:4",
      size: "2K",
      nsfw_checker: true,
    });
    expect(payload.input.image_urls).toHaveLength(2);
    expect(calls.at(-1)?.[0]).toBe(
      "https://api.kie.test/api/v1/jobs/recordInfo?taskId=t1",
    );
  });

  it("maps an NSFW task failure to ContentBlockedError", async () => {
    mockKie({
      create: [json({ code: 200, data: { taskId: "t2" } })],
      poll: [
        json({
          code: 200,
          data: { state: "fail", failMsg: "NSFW content detected" },
        }),
      ],
    });
    await expect(
      run({ ...base, personImage: portrait }),
    ).rejects.toBeInstanceOf(ContentBlockedError);
  });

  it("retries a 429 (sent as HTTP 200 + code) then reports busy", async () => {
    const fetchMock = mockKie({
      create: [
        json({ code: 429, msg: "rate limited" }),
        json({ code: 429, msg: "rate limited" }),
        json({ code: 429, msg: "rate limited" }),
      ],
    });
    await expect(
      run({ ...base, personImage: portrait }),
    ).rejects.toBeInstanceOf(ProviderBusyError);
    const creates = (fetchMock.mock.calls as unknown as [string][]).filter(
      ([url]) => url.includes("createTask"),
    );
    expect(creates).toHaveLength(3);
  });

  it("surfaces insufficient credits with kie's message", async () => {
    mockKie({ create: [json({ code: 402, msg: "Credits insufficient" })] });
    await expect(run({ ...base, personImage: portrait })).rejects.toThrow(
      /kie 402: Credits insufficient/,
    );
  });

  it("fails when the upload is rejected", async () => {
    mockKie({
      upload: () => json({ code: 401, msg: "Unauthorized" }),
      create: [],
    });
    await expect(run({ ...base, personImage: portrait })).rejects.toThrow(
      /kie 401/,
    );
  });
});

describe("checkKie", () => {
  it("reads remaining credits and their dollar value", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ code: 200, msg: "success", data: 200 })),
    );
    expect(await checkKie()).toMatchObject({
      keyValid: true,
      credits: 200,
      usd: 1,
    });
  });

  it("reports a rejected key", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ code: 401, msg: "Unauthorized" })),
    );
    expect(await checkKie()).toMatchObject({
      keyValid: false,
      error: "Unauthorized",
    });
  });
});
