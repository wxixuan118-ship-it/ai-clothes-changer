import { expect, test } from "@playwright/test";

// Turbopack's first compile of the home page (the hero embeds the whole
// studio) can race a second request in dev and 500 once. Warm it until two
// loads in a row succeed so the assertions test the page, not the bundler.
test.beforeAll(async ({ request }) => {
  let streak = 0;
  for (let attempt = 0; attempt < 10 && streak < 2; attempt++) {
    streak = (await request.get("/")).ok() ? streak + 1 : 0;
  }
});

test("home is the hairstyle changer with signed-out CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AI Hairstyle Changer",
  );
  // Signed-out nav: Log In + Sign Up; the hero CTA opens the studio.
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Sign Up" }),
  ).toHaveAttribute("href", "/signup");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Log In" }),
  ).toBeVisible();
  // The tool sits in the hero — usable before signing up.
  await expect(page.locator("#studio #person-photo")).toBeAttached();
  await expect(
    page.locator("#studio").getByRole("tab", { name: "Styles" }),
  ).toBeVisible();
  await expect(page.locator("#how-it-works")).toContainText("Upload a selfie");
  await expect(page.locator("#styles img")).toHaveCount(4);
  // Pricing reads from config/plans.ts.
  await expect(page.locator("#pricing")).toContainText("$9");
  await expect(page.locator('details[name="faq"]').first()).toBeVisible();
});

test("the site is night-only: dark theme without a toggle", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(
    0,
  );
});

test("a hairstyle card preselects that style in the hero tool", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#styles")
    .getByRole("link", { name: /Copper bob/ })
    .click();
  await expect(page).toHaveURL(/style=copper-bob/);
  const studio = page.locator("#studio");
  await expect(studio.getByRole("tab", { name: "Hairstyles" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    studio.getByRole("button", { name: "Copper bob" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("nav marks the current page and pricing CTAs send visitors to sign up", async ({
  page,
}) => {
  await page.goto("/pricing");
  const nav = page
    .getByRole("banner")
    .getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Pricing" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    nav.getByRole("link", { name: "Hairstyle changer" }),
  ).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "credit-based pricing",
  );
  await expect(page.getByRole("link", { name: "Get Pro" })).toHaveAttribute(
    "href",
    "/signup?next=%2Fbilling",
  );
});
