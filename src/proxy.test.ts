import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const envState: { SITE_URL?: string } = {};
vi.mock("@/lib/env", () => ({
  env: new Proxy({}, { get: (_t, key) => envState[key as "SITE_URL"] }),
}));
vi.mock("@/lib/site-url", () => ({ siteUrl: "https://stylemirrorai.com" }));

import { proxy } from "./proxy";

function request(url: string, host: string, cookie?: string) {
  const headers = new Headers({ host });
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(url, { headers });
}

beforeEach(() => {
  delete envState.SITE_URL;
});

describe("proxy — canonical host", () => {
  it("sends www to the apex, keeping path and query", () => {
    const res = proxy(
      request(
        "https://www.stylemirrorai.com/pricing?x=1",
        "www.stylemirrorai.com",
      ),
    );
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://stylemirrorai.com/pricing?x=1",
    );
  });

  it("leaves the platform subdomain alone until SITE_URL is set", () => {
    const host = "ai-clothes-changer-aa26c2.anysites.app";
    expect(proxy(request(`https://${host}/`, host)).status).toBe(200);

    envState.SITE_URL = "https://stylemirrorai.com";
    const res = proxy(request(`https://${host}/ai-clothes-changer`, host));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://stylemirrorai.com/ai-clothes-changer",
    );
  });

  it("never redirects /api (Stripe webhooks don't follow redirects)", () => {
    envState.SITE_URL = "https://stylemirrorai.com";
    const host = "ai-clothes-changer-aa26c2.anysites.app";
    const res = proxy(request(`https://${host}/api/stripe/webhook`, host));
    expect(res.status).toBe(200);
  });

  it("serves the canonical host and local health checks as-is", () => {
    envState.SITE_URL = "https://stylemirrorai.com";
    expect(
      proxy(request("https://stylemirrorai.com/", "stylemirrorai.com")).status,
    ).toBe(200);
    expect(
      proxy(request("http://localhost:3000/", "localhost:3000")).status,
    ).toBe(200);
  });
});

describe("proxy — signed-out app routes", () => {
  it("bounces to login with next", () => {
    const res = proxy(
      request("https://stylemirrorai.com/generate", "stylemirrorai.com"),
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://stylemirrorai.com/login?next=%2Fgenerate",
    );
  });

  it("lets marketing pages through without a session", () => {
    expect(
      proxy(request("https://stylemirrorai.com/pricing", "stylemirrorai.com"))
        .status,
    ).toBe(200);
  });
});
