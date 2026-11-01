import { test, expect } from "@playwright/test";
for (const width of [2560, 3440]) {
  test(`marketing content remains centered and bounded at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto("http://127.0.0.1:3000/home");
    const preview = await page.locator(".marketing-table").boundingBox();
    expect(preview).not.toBeNull();
    expect(preview!.width).toBeLessThanOrEqual(1280);
    expect(Math.abs(preview!.x + preview!.width / 2 - width / 2)).toBeLessThan(2);
    const demo = await page
      .getByRole("heading", { name: "Vyskúšajte obe strany obce", exact: true })
      .boundingBox();
    expect(demo).not.toBeNull();
    expect(Math.abs(preview!.x - demo!.x)).toBeLessThanOrEqual(32);
    expect(
      await page.locator("h1").evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeLessThanOrEqual(60);
  });
}
test("homepage explains the product and answers practical questions", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/home");
  for (const name of [
    "Menej hľadania. Viac prehľadu.",
    "Šesť agend na jednom mieste",
    "Jednoduché v 3 krokoch",
    "Navrhovaná cena služby",
    "Časté otázky",
    "Vyskúšajte obe strany obce",
  ]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Dá sa OpenObec prepojiť s informačným systémom obce?" })
    .click();
  await expect(page.getByText(/V tomto deme je pripojenie iba simulované/)).toBeVisible();
});
