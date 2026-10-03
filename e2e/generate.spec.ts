import path from "node:path";

import { expect, test } from "@playwright/test";

import { creditBalance, signUp, uniqueEmail } from "./helpers";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

test.beforeEach(async ({ page }) => {
  await signUp(page, uniqueEmail("gen"));
  await page.goto("/generate?tool=clothes");
  await page.locator("#person-photo").setInputFiles(fixture("person.jpg"));
});

test("style mode: changes the outfit, spends 1 credit, serves the image", async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Styles" }).click();
  await page.getByRole("button", { name: "Navy business suit" }).click();
  await page.getByRole("button", { name: /^Change outfit/ }).click();

  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(creditBalance(page)).toHaveText("9");
  await expect(page.getByText("Your new look")).toBeVisible();

  const image = page.locator('li img[src^="/api/images/"]').first();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("alt", "Style · Navy business suit");
  const served = await page.request.get(
    (await image.getAttribute("src")) as string,
  );
  expect(served.status()).toBe(200);
  expect(served.headers()["content-type"]).toMatch(/^image\//);
});

test("garment mode: uploads the garment and labels the result", async ({
  page,
}) => {
  await page.locator("#garment-photo").setInputFiles(fixture("garment.jpg"));
  await page.getByRole("button", { name: "Top", exact: true }).click();
  await page.getByRole("button", { name: /^Change outfit/ }).click();

  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(
    page.locator('li img[alt="Garment photo · top"]').first(),
  ).toBeVisible();
});

test('a description containing "FAIL" refunds the credit and marks the row failed', async ({
  page,
}) => {
  await page.getByRole("tab", { name: "Describe it" }).click();
  await page
    .getByLabel("Describe the outfit")
    .fill("a navy suit, but make it FAIL");
  await page.getByRole("button", { name: /^Change outfit/ }).click();

  await expect(
    page.getByText("Outfit change failed — credit refunded."),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("10");
  await expect(
    page.locator("section li").filter({ hasText: "Failed" }).first(),
  ).toBeVisible();
});

test("a non-image or undecodable file is rejected with a message, not a crash", async ({
  page,
}) => {
  // Wrong type: rejected on pick, nothing selected.
  await page.locator("#person-photo").setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  await expect(page.getByText("Use a JPG, PNG, or WebP photo")).toBeVisible();

  // Right label, broken bytes: accepted on pick, rejected when decoded.
  await page.locator("#person-photo").setInputFiles({
    name: "broken.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("definitely not a jpeg"),
  });
  await page.getByRole("tab", { name: "Styles" }).click();
  await page.getByRole("button", { name: /^Change outfit/ }).click();
  await expect(
    page.getByText("Use a JPG, PNG, or WebP photo").last(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AI Clothes Changer" }),
  ).toBeVisible();
  await expect(creditBalance(page)).toHaveText("10");
});

test("the same photo can be re-picked after removing it", async ({ page }) => {
  await page.getByRole("button", { name: "Remove upload your photo" }).click();
  await page.locator("#person-photo").setInputFiles(fixture("person.jpg"));
  await expect(
    page.getByRole("button", { name: "Remove upload your photo" }),
  ).toBeVisible();
});

test("a result can be deleted from history", async ({ page }) => {
  await page.getByRole("tab", { name: "Styles" }).click();
  await page.getByRole("button", { name: /^Change outfit/ }).click();
  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(page.locator("li img")).toHaveCount(1);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /^Delete Style/ }).click();
  await expect(page.getByText("Look deleted.")).toBeVisible();
  await expect(page.locator("li img")).toHaveCount(0);
  await expect(creditBalance(page)).toHaveText("9"); // spend stays on the ledger
});

test("the studio defaults to the hairstyle changer", async ({ page }) => {
  await page.goto("/generate");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AI Hairstyle Changer",
  );
  await page.locator("#person-photo").setInputFiles(fixture("person.jpg"));
  await page.locator("#hair-photo").setInputFiles(fixture("garment.jpg"));
  await page.getByRole("button", { name: /^Change hairstyle/ }).click();
  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(
    page.locator('li img[alt="Hairstyle photo"]').first(),
  ).toBeVisible();
});
