import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: { ADMIN_EMAILS: ["boss@example.com"] } }));
vi.mock("@/lib/auth/session", () => ({ getSession: vi.fn() }));

import { isAdminEmail } from "./auth";

describe("isAdminEmail", () => {
  it("matches listed emails case-insensitively", () => {
    expect(isAdminEmail("Boss@Example.com")).toBe(true);
  });
  it.each([null, undefined, "", "other@example.com"])("rejects %s", (email) => {
    expect(isAdminEmail(email)).toBe(false);
  });
});
