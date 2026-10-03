import path from "node:path";

import { expect, test } from "@playwright/test";

import { PASSWORD, uniqueEmail } from "./helpers";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

test("a visitor picks a selfie and hairstyle on the home page, signs up in the dialog, and gets the result without leaving", async ({
  page,
}) => {
  await page.goto("/");
  const studio = page.locator("#studio");
  await studio.locator("#person-photo").setInputFiles(fixture("person.jpg"));
  await studio.getByRole("tab", { name: "Hairstyles" }).click();
  await studio.getByRole("button", { name: "Pixie cut" }).click();
  await studio.getByRole("button", { name: /^Change hairstyle/ }).click();

  // Signed out → sign-up dialog, not a redirect.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Get 10 free credits");
  await dialog.getByLabel("Name").fill("Home Visitor");
  await dialog.getByLabel("Email").fill(uniqueEmail("home"));
  await dialog.getByLabel("Password").fill(PASSWORD);
  await dialog.getByRole("button", { name: "Create account" }).click();

  // The run continues with the same photo and hairstyle.
  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    studio.getByText("Your new look", { exact: true }),
  ).toBeVisible();
  await expect(
    studio.getByRole("img", { name: "Hairstyle · Pixie cut" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("link", { name: "All my looks" }),
  ).toHaveAttribute("href", "/generate");
});

test("the clothes changer page runs the outfit tool", async ({ page }) => {
  await page.goto("/ai-clothes-changer");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AI Clothes Changer",
  );
  const studio = page.locator("#studio");
  await expect(
    studio.getByRole("tab", { name: "Garment photo" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    studio.getByRole("button", { name: /^Change outfit/ }),
  ).toBeVisible();
  // Cross-link back to the primary tool.
  await expect(
    page.getByRole("link", { name: /Open AI Hairstyle Changer/ }),
  ).toHaveAttribute("href", "/");
});
