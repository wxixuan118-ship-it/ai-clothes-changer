import { expect, test } from "@playwright/test";

import { PASSWORD, creditBalance, uniqueEmail } from "./helpers";

test("signup → studio → sign out → login → dashboard shows 10 welcome credits", async ({
  page,
}) => {
  const email = uniqueEmail("auth");

  // Signup through the real form.
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  // New accounts land in the studio — the tool is why they signed up.
  await page.waitForURL("**/generate");
  await expect(creditBalance(page)).toHaveText("10");
  // The welcome grant shows up in the dashboard credit history.
  await page.goto("/dashboard");
  await expect(page.getByRole("cell", { name: "Credits added" })).toBeVisible();

  // Sign out via the user menu.
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("**/login**");

  // Log back in with the same credentials.
  await page.getByLabel("Email").first().fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  await expect(creditBalance(page)).toHaveText("10");

  // Signed-in marketing nav collapses to a single "Open studio" button.
  await page.goto("/");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Open studio" }),
  ).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Sign Up" }),
  ).toHaveCount(0);

  // Signed-in visitors skip the auth forms.
  await page.goto("/signup");
  await page.waitForURL("**/generate");
  await page.goto("/login");
  await page.waitForURL("**/dashboard");
});
