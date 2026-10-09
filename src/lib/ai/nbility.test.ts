import sharp from "sharp";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    NBILITY_API_KEY: "sk-test",
    NBILITY_BASE_URL: "https://api.nbility.test",
  },
}));

import { ContentBlockedError, ProviderBusyError } from "./errors";
import {
  buildPrompt,
  checkNbility,
  nbilityProvider,
  pickSize,
} from "./nbility";

let portrait: { bytes: Buffer; mediaType: string };
const reference = { bytes: Buffer.from("ref"), mediaType: "image/png" };

beforeAll(async () => {
  const bytes = await sharp({
    create: { width: 600, height: 900, channels: 3, background: "#888" },
  })
    .jpeg()
    .toBuffer();
  portrait = { bytes, mediaType: "image/jpeg" };
});

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Queue of responses, one per fetch call. */
function mockFetch(...responses: Response[]) {
  const fn = vi.fn(async () => {
    const next = responses.shift();
    if (!next) throw new Error("unexpected fetch");
    return next;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

async function run(input: Parameters<typeof nbilityProvider.generateImage>[0]) {
  vi.useFakeTimers({ toFake: ["setTimeout"] });
  let settled = false;
  const promise = nbilityProvider.generateImage(input);
  promise.then(
    () => (settled = true),
    () => (settled = true),
  );
  // sharp works off-thread, so timers appear later: keep advancing until
  // the run settles (setImmediate stays real and lets I/O finish).
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
  model: "gpt-image-2",
};

describe("nbility provider", () => {
  it("keeps the person photo's orientation", async () => {
    expect((await pickSize(portrait)).size).toBe("1024x1536");
  });

  it("names the person image 1 and the reference image 2", () => {
    const prompt = buildPrompt({ ...base, referenceImage: reference });
    expect(prompt).toContain("Image 1 is the person to edit");
    expect(prompt).toContain("Image 2 is the hairstyle reference photo");
    expect(prompt).toContain("fully clothed");
  });

  it("submits an async edit with both images and polls the task", async () => {
    const fetchMock = mockFetch(
      json(200, {
        code: "success",
        data: { task_id: "task_1", status: "submitted" },
      }),
      json(200, {
        code: "success",
        data: { task_id: "task_1", status: "in_progress" },
      }),
      json(200, {
        code: "success",
        data: {
          task_id: "task_1",
          status: "succeeded",
          result_url: "https://cdn.test/out.png",
        },
      }),
    );
    const result = await run({
      ...base,
      personImage: portrait,
      referenceImage: reference,
    });
    expect(result).toEqual({
      url: "https://cdn.test/out.png",
      width: 1024,
      height: 1536,
      model: "gpt-image-2",
    });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.nbility.test/v1/images/edits");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer sk-test",
      "X-New-Api-Async-Task": "true",
    });
    const form = init.body as FormData;
    expect(form.get("model")).toBe("gpt-image-2");
    expect(form.get("size")).toBe("1024x1536");
    const images = form.getAll("image[]") as File[];
    expect(images.map((file) => file.name)).toEqual([
      "image-1.jpg",
      "image-2.png",
    ]);
    const pollCall = fetchMock.mock.calls[2] as unknown as [string];
    expect(pollCall[0]).toBe("https://api.nbility.test/v1/images/tasks/task_1");
  });

  it("accepts a synchronous image response", async () => {
    mockFetch(json(200, { data: [{ b64_json: "aGVsbG8=" }] }));
    const result = await run({ ...base, personImage: portrait });
    expect(result.url).toBe("data:image/png;base64,aGVsbG8=");
  });

  it("maps a safety refusal to ContentBlockedError", async () => {
    mockFetch(
      json(400, {
        error: {
          message:
            "Your request was rejected as a result of our safety system.",
          code: "moderation_blocked",
        },
      }),
    );
    await expect(
      run({ ...base, personImage: portrait }),
    ).rejects.toBeInstanceOf(ContentBlockedError);
  });

  it("maps a failed task with a policy reason to ContentBlockedError", async () => {
    mockFetch(
      json(200, { data: { task_id: "t", status: "submitted" } }),
      json(200, {
        data: {
          task_id: "t",
          status: "failed",
          fail_reason: "content_policy_violation",
        },
      }),
    );
    await expect(
      run({ ...base, personImage: portrait }),
    ).rejects.toBeInstanceOf(ContentBlockedError);
  });

  it("retries 429 on submit, then reports busy", async () => {
    const fetchMock = mockFetch(
      json(429, { error: { message: "rate limited" } }),
      json(429, { error: { message: "rate limited" } }),
      json(429, { error: { message: "rate limited" } }),
    );
    await expect(
      run({ ...base, personImage: portrait }),
    ).rejects.toBeInstanceOf(ProviderBusyError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("surfaces other errors with the gateway message", async () => {
    mockFetch(json(401, { error: { message: "Invalid token" } }));
    await expect(run({ ...base, personImage: portrait })).rejects.toThrow(
      /nbility 401: Invalid token/,
    );
  });
});

describe("checkNbility", () => {
  it("reports key, model and balance in yuan", async () => {
    mockFetch(
      json(200, { data: [{ id: "gpt-image-2" }, { id: "gpt-5" }] }),
      json(200, {
        data: {
          total_available: 5_000_000,
          total_used: 250_000,
          unlimited_quota: false,
        },
      }),
    );
    const status = await checkNbility("gpt-image-2");
    expect(status).toMatchObject({
      ok: true,
      keyValid: true,
      modelAvailable: true,
      imageModels: ["gpt-image-2"],
      remaining: 10,
      used: 0.5,
    });
  });

  it("reports a rejected key", async () => {
    mockFetch(
      json(401, { error: { message: "Invalid token" } }),
      json(401, { message: "Token not provided" }),
    );
    const status = await checkNbility("gpt-image-2");
    expect(status).toMatchObject({
      ok: false,
      keyValid: false,
      error: "Invalid token",
    });
  });
});
