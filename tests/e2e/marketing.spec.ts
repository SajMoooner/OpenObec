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

test("guided demos expose real role destinations and static product images", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/demo");
  await expect(page.locator("main ol")).toHaveCount(2);
  for (const steps of await page.locator("main ol").all())
    await expect(steps.locator("li")).toHaveCount(3);
  await expect(page.locator("main figure")).toHaveCount(2);
  for (const figure of await page.locator("main figure").all()) {
    await expect(figure.locator("figcaption")).toContainText("Snímka ukážkového prostredia");
    await expect(figure.getByRole("button")).toHaveCount(0);
    const img = figure.locator("img");
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
  await page.getByRole("link", { name: "Otvoriť občianske demo", exact: true }).click();
  await expect(page).toHaveURL(/:3001\/obcan\/home/);
  await page.goto("http://127.0.0.1:3000/demo");
  await page.getByRole("link", { name: "Otvoriť pracovné demo", exact: true }).click();
  await expect(page).toHaveURL(/:3002\/uradnik\/prihlasenie/);
});

test("mobile navigation closes after selecting a page and identifies the current route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000/home");
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await page
    .getByRole("navigation", { name: "Mobilná navigácia" })
    .getByRole("link", { name: "Výhody" })
    .click();
  await expect(page).toHaveURL(/\/vyhody$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Mobilná navigácia" })
      .getByRole("link", { name: "Výhody" }),
  ).toHaveAttribute("aria-current", "page");
});

test("marketing search submits the user's query to the selected agenda", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/home");
  await page.getByRole("tab", { name: "Zmluvy", exact: true }).click();
  await page.getByRole("searchbox").fill("knižnice");
  await page.getByRole("button", { name: "Hľadať", exact: true }).click();
  await expect(page).toHaveURL(/:3001\/obcan\/zmluvy\?q=/);
  expect(new URL(page.url()).searchParams.get("q")).toBe("knižnice");
  await expect(page.getByRole("searchbox")).toHaveValue("knižnice");
});
