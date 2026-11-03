import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = process.env.MARKETING_URL ?? "http://127.0.0.1:3000";
const proof = "docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/";
const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
test("real publication screenshots retain their source provenance", async ({ request }) => {
  for (const [asset, original] of [
    ["preparation.png", "03-invoice-fields.png"],
    ["published.png", "05-published.png"],
    ["citizen.png", "07-public-detail.png"],
  ]) {
    expect(hash(await (await request.get(`${base}/showcase/${asset}`)).body())).toBe(
      hash(await readFile(proof + original)),
    );
  }
});
test("workflow tabs display real images without requiring animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/vyhody`);
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    const img = page.getByRole("tabpanel").getByRole("img");
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    await expect(img).toHaveAttribute("alt", /faktúry|faktúra/);
  }
  await expect(page.locator("video")).toHaveCount(0);
});
test("homepage and demo remain useful before JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/home`);
    await expect(page.locator("h1")).toContainText("Zverejňovanie dokumentov");
    const img = page.locator(".hero-product img");
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
    await expect(
      page.locator(".hero-copy").getByRole("link", { name: "Vyskúšať demo" }),
    ).toBeVisible();
    await page.goto(`${base}/demo`);
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByRole("region", { name: "Pohľad občana", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Pohľad úradníka", exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
