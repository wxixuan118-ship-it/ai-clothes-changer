import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    DASHSCOPE_API_KEY: "sk-test",
    DASHSCOPE_BASE_URL: "https://dashscope-intl.aliyuncs.com",
    AI_EDIT_MODEL: "qwen-image-edit-plus",
  },
}));

import { buildMessageContent, dashscopeProvider } from "./dashscope";
import { ContentBlockedError, ProviderBusyError } from "./errors";

const person = { bytes: Buffer.from("person"), mediaType: "image/jpeg" };
const reference = { bytes: Buffer.from("ref"), mediaType: "image/png" };

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("dashscope provider", () => {
  it("puts the reference first and the person last, with one text item", () => {
    const content = buildMessageContent({
      prompt: "Give the person the hairstyle.",
      userId: "u",
      task: "hair",
      personImage: person,
      referenceImage: reference,
    });
    expect(content).toHaveLength(3);
    expect(content[0]).toEqual({
      image: `data:image/png;base64,${Buffer.from("ref").toString("base64")}`,
    });
    expect(content[1]).toEqual({
      image: `data:image/jpeg;base64,${Buffer.from("person").toString("base64")}`,
    });
    const text = (content[2] as { text: string }).text;
    expect(text).toMatch(/^The person must stay fully clothed/);
    expect(text).toContain(
      "Image 1 is the hairstyle reference photo. Image 2 is the person",
    );
    expect(text).toContain("fully clothed");
  });

  it("sends one image when there is no reference", () => {
    const content = buildMessageContent({
      prompt: "Change the hair to a bob.",
      userId: "u",
      personImage: person,
    });
    expect(content).toHaveLength(2);
    expect((content[1] as { text: string }).text).toMatch(
      /^Change the hair to a bob\. /,
    );
  });

  it("calls the sync endpoint and normalizes the result", async () => {
    const fetchMock = mockFetch(200, {
      output: {
        choices: [
          {
            message: {
              content: [{ image: "https://oss.example/out.png?Expires=1" }],
            },
          },
        ],
      },
      usage: { width: 1024, height: 1360, image_count: 1 },
      request_id: "r1",
    });

    const result = await dashscopeProvider.generateImage({
      prompt: "x",
      userId: "u",
      personImage: person,
    });

    expect(result).toEqual({
      url: "https://oss.example/out.png?Expires=1",
      width: 1024,
      height: 1360,
      model: "qwen-image-edit-plus",
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe(
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    );
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer sk-test",
    );
    expect(
      (init.headers as Record<string, string>)["X-DashScope-Async"],
    ).toBeUndefined();
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe("qwen-image-edit-plus");
    expect(body.input.messages).toHaveLength(1);
    expect(body.parameters).toMatchObject({
      n: 1,
      watermark: false,
      prompt_extend: false,
    });
  });

  it.each([
    "DataInspectionFailed",
    "IPInfringementSuspect",
    "CustomRoleBlocked",
  ])("maps %s to ContentBlockedError", async (code) => {
    mockFetch(400, {
      code,
      message: "Input data may contain inappropriate content.",
      request_id: "r",
    });
    await expect(
      dashscopeProvider.generateImage({
        prompt: "x",
        userId: "u",
        personImage: person,
      }),
    ).rejects.toBeInstanceOf(ContentBlockedError);
  });

  it("throws a descriptive error for other failures", async () => {
    mockFetch(400, {
      code: "InvalidParameter",
      message: "image format error",
      request_id: "r9",
    });
    await expect(
      dashscopeProvider.generateImage({
        prompt: "x",
        userId: "u",
        personImage: person,
      }),
    ).rejects.toThrow(/400 InvalidParameter.*request r9/);
  });

  it("retries throttling, then reports the provider as busy", async () => {
    vi.useFakeTimers();
    const fetchMock = mockFetch(429, {
      code: "Throttling.RateQuota",
      message: "Requests rate limit exceeded",
    });
    const run = dashscopeProvider.generateImage({
      prompt: "x",
      userId: "u",
      personImage: person,
    });
    const assertion = expect(run).rejects.toBeInstanceOf(ProviderBusyError);
    await vi.runAllTimersAsync();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("succeeds when a retry gets through", async () => {
    vi.useFakeTimers();
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ++calls === 1
          ? new Response(JSON.stringify({ code: "Throttling.BurstRate" }), {
              status: 429,
            })
          : new Response(
              JSON.stringify({
                output: {
                  choices: [
                    { message: { content: [{ image: "https://oss/x.png" }] } },
                  ],
                },
                usage: { width: 512, height: 512 },
              }),
              { status: 200 },
            ),
      ),
    );
    const run = dashscopeProvider.generateImage({
      prompt: "x",
      userId: "u",
      personImage: person,
    });
    await vi.runAllTimersAsync();
    await expect(run).resolves.toMatchObject({ url: "https://oss/x.png" });
    vi.useRealTimers();
  });

  it("throws when the response has no image", async () => {
    mockFetch(200, {
      output: { choices: [{ message: { content: [] } }] },
      request_id: "r2",
    });
    await expect(
      dashscopeProvider.generateImage({
        prompt: "x",
        userId: "u",
        personImage: person,
      }),
    ).rejects.toThrow(/no image in response/);
  });
});
