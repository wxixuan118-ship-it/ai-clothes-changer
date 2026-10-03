import path from "node:path";

import { expect, test } from "@playwright/test";

import { creditBalance, signUp, uniqueEmail } from "./helpers";

test("draining to 0 credits blocks the form with a Billing link and no spend", async ({
  page,
}) => {
  await signUp(page, uniqueEmail("drain"));
  await page.goto("/generate?tool=clothes");
  await page
    .locator("#person-photo")
    .setInputFiles(path.join(__dirname, "fixtures", "person.jpg"));
  await page.getByRole("tab", { name: "Describe it" }).click();

  const prompt = page.getByLabel("Describe the outfit");
  const change = page.getByRole("button", { name: /^Change outfit/ });

  // 10 welcome credits, 1 per run, rate limit allows exactly 10/min.
  for (let remaining = 9; remaining >= 0; remaining--) {
    await prompt.fill(`outfit number ${9 - remaining}`);
    await change.click();
    await expect(creditBalance(page)).toHaveText(String(remaining));
  }

  // At zero the form blocks client-side — no server call, no 11th spend.
  await expect(change).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "top up in Billing" }),
  ).toBeVisible();
  await expect(page.locator("li img")).toHaveCount(10);
});
