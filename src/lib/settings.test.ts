import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  rows: [] as { key: string; value: string }[],
  features: { nbility: false, kie: false, dashscope: true },
}));

vi.mock("@/lib/env", () => ({
  env: { AI_EDIT_MODEL: "qwen-image-edit-plus" },
  features: state.features,
}));

// Minimal stand-in for the one select allSettings() runs.
vi.mock("@/db", () => ({
  db: { select: () => ({ from: async () => state.rows }) },
}));

async function fresh() {
  vi.resetModules();
  return import("./settings");
}

function store(values: Record<string, string>) {
  state.rows = Object.entries(values).map(([key, value]) => ({ key, value }));
}

beforeEach(() => {
  state.rows = [];
  state.features.nbility = false;
  state.features.kie = false;
  state.features.dashscope = true;
});

describe("getEditModel", () => {
  it("falls back to AI_EDIT_MODEL with only DashScope", async () => {
    expect(await (await fresh()).getEditModel()).toBe("qwen-image-edit-plus");
  });

  it("prefers Nbility, then kie.ai, when no model was chosen", async () => {
    state.features.nbility = true;
    state.features.kie = true;
    expect(await (await fresh()).getEditModel()).toBe("gpt-image-2");
    store({ provider_nbility: "off" });
    expect(await (await fresh()).getEditModel()).toBe(
      "seedream/5-flash-image-to-image",
    );
  });

  it("uses the admin's choice when its provider is usable", async () => {
    state.features.kie = true;
    store({ ai_edit_model: "seedream/5-flash-image-to-image" });
    expect(await (await fresh()).getEditModel()).toBe(
      "seedream/5-flash-image-to-image",
    );
  });

  it("skips a chosen model whose provider is off or has no key", async () => {
    state.features.kie = true;
    store({
      ai_edit_model: "seedream/5-flash-image-to-image",
      provider_kie: "off",
    });
    expect(await (await fresh()).getEditModel()).toBe("qwen-image-edit-plus");
    // Nbility has no key → the next usable provider (kie.ai) takes over.
    store({ ai_edit_model: "gpt-image-2" });
    expect(await (await fresh()).getEditModel()).toBe(
      "seedream/5-flash-image-to-image",
    );
  });

  it("returns null when every provider is off", async () => {
    state.features.kie = true;
    store({ provider_kie: "off", provider_dashscope: "off" });
    expect(await (await fresh()).getEditModel()).toBeNull();
  });

  it("ignores invalid stored values", async () => {
    store({ ai_edit_model: "made-up-model", provider_dashscope: "maybe" });
    expect(await (await fresh()).getEditModel()).toBe("qwen-image-edit-plus");
  });
});
