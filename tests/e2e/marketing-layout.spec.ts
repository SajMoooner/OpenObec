import { test, expect } from "@playwright/test";
const base = process.env.MARKETING_URL ?? "http://127.0.0.1:3000";
for (const width of [390, 768, 1440, 2560]) {
  for (const route of ["home", "vyhody", "o-nas", "pricing", "kontakt", "demo"]) {
    test(`${route} remains readable and bounded at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${base}/${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      for (const figure of await page.locator("main figure").all()) {
        const bounds = (await figure.boundingBox())!;
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      const container = await page.locator("header .m-container").boundingBox();
      expect(container!.width).toBeLessThanOrEqual(1152);
      expect(Math.abs(container!.x + container!.width / 2 - width / 2)).toBeLessThan(2);
    });
  }
}
test("homepage uses the approved Inter, near-black and purple system", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/home`);
  const heading = await page
    .locator("h1")
    .evaluate((el) => ({
      size: getComputedStyle(el).fontSize,
      weight: getComputedStyle(el).fontWeight,
      font: getComputedStyle(el).fontFamily,
    }));
  expect(heading.size).toBe("68px");
  expect(heading.weight).toBe("500");
  expect(heading.font.toLowerCase()).toContain("inter");
  await expect(page.locator(".hero-product img")).toBeVisible();
  await expect(page.locator(".feature-card")).toHaveCount(4);
  await expect(page.locator(".agenda-grid article")).toHaveCount(6);
  await expect(page.locator(".workflow-grid article")).toHaveCount(3);
  await expect(page.locator(".cta-section")).toBeVisible();
});
