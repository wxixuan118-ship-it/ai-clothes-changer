import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stored: null as string | null,
  features: { nbility: false, dashscope: true },
}));

vi.mock("@/lib/env", () => ({
  env: { AI_EDIT_MODEL: "qwen-image-edit-plus" },
  features: state.features,
}));

// Minimal stand-in for the one select getSetting runs.
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => (state.stored ? [{ value: state.stored }] : []),
        }),
      }),
    }),
  },
}));

async function freshGetEditModel() {
  vi.resetModules();
  return (await import("./settings")).getEditModel();
}

beforeEach(() => {
  state.stored = null;
  state.features.nbility = false;
  state.features.dashscope = true;
});

describe("getEditModel", () => {
  it("falls back to AI_EDIT_MODEL with only DashScope", async () => {
    expect(await freshGetEditModel()).toBe("qwen-image-edit-plus");
  });

  it("defaults to gpt-image-2 once Nbility has a key", async () => {
    state.features.nbility = true;
    expect(await freshGetEditModel()).toBe("gpt-image-2");
  });

  it("uses the admin's choice when its provider is configured", async () => {
    state.features.nbility = true;
    state.stored = "qwen-image-edit-max";
    expect(await freshGetEditModel()).toBe("qwen-image-edit-max");
  });

  it("ignores a stored model whose provider lost its key", async () => {
    state.stored = "gpt-image-2";
    expect(await freshGetEditModel()).toBe("qwen-image-edit-plus");
  });
});
