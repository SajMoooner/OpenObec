import { test, expect } from "@playwright/test";
test("marketing fits mobile and keeps its document preview above the offer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000/home");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dokumenty obce");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const preview = await page.locator(".marketing-table").boundingBox();
  const offer = await page.locator('section[aria-labelledby="offer-title"]').boundingBox();
  expect(preview).not.toBeNull();
  expect(offer).not.toBeNull();
  expect(preview!.y + preview!.height).toBeLessThanOrEqual(offer!.y);
});
