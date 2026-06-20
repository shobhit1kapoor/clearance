import { test, expect } from "@playwright/test";
import { scenarios } from "../../src/lib/domain";

test("blocked flow proves the payment tool stopped before construction", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const prompt = page.getByLabel("Purchase request");
  await prompt.fill(scenarios.blocked);
  await expect(prompt).toHaveValue(scenarios.blocked);
  await page.getByRole("button", { name: "Evaluate request" }).click();
  await expect(page.locator(".blocked-copy").getByText("Blocked before transaction creation", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Vendor allowlist")).toBeVisible();
});

test("approved flow requires explicit human action", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Let AI agents spend. Keep the final say." })).toBeVisible();
  await page.getByRole("button", { name: "Evaluate request" }).click();
  await expect(page.getByText("Explicit approval required", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: /Approve 1 HBAR/ })).toBeVisible();
});
