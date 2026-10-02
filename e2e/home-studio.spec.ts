import path from "node:path";

import { expect, test } from "@playwright/test";

import { PASSWORD, uniqueEmail } from "./helpers";

test("a visitor picks a photo and style on the home page, signs up in the dialog, and gets the result without leaving", async ({
  page,
}) => {
  await page.goto("/");
  const studio = page.locator("#studio");
  await studio
    .locator("#person-photo")
    .setInputFiles(path.join(__dirname, "fixtures", "person.jpg"));
  await studio.getByRole("tab", { name: "Styles" }).click();
  await studio.getByRole("button", { name: "Red cocktail dress" }).click();
  await studio.getByRole("button", { name: /^Change outfit/ }).click();

  // Signed out → sign-up dialog, not a redirect.
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Get 10 free credits");
  await dialog.getByLabel("Name").fill("Home Visitor");
  await dialog.getByLabel("Email").fill(uniqueEmail("home"));
  await dialog.getByLabel("Password").fill(PASSWORD);
  await dialog.getByRole("button", { name: "Create account" }).click();

  // The run continues with the same photo and style.
  await expect(page.getByText("New look ready! 1 credit spent.")).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    studio.getByText("Your new look", { exact: true }),
  ).toBeVisible();
  await expect(
    studio.getByRole("img", { name: "Style · Red cocktail dress" }),
  ).toBeVisible();
  await expect(
    studio.getByRole("link", { name: "All my looks" }),
  ).toHaveAttribute("href", "/generate");
});
