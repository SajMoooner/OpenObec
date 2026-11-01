// Run deliberately after confirming the local dataset contains only owned demo records.
// Does not create or modify records. Review both images and update provenance before commit.
import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const output = process.env.PREVIEW_OUTPUT ?? "apps/marketing/public/previews";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1040 },
    deviceScaleFactor: 1,
  });
  await page
    .context()
    .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
  for (const [name, url] of [
    [
      "citizen-contract",
      "http://127.0.0.1:3001/obcan/zmluvy/zml_df1176d5-248d-40fd-b737-4d2f78b1b885",
    ],
    ["office-overview", "http://127.0.0.1:3002/uradnik/home"],
  ]) {
    await page.goto(url);
    await page.locator("main h1").waitFor();
    await page
      .getByText(
        name === "citizen-contract" ? "Súvisiace dokumenty" : "Pokračovať v rozpracovaných",
        { exact: true },
      )
      .waitFor();
    if (name === "office-overview") {
      // All 18 agenda/state requests must resolve before capturing honest totals.
      // They can legitimately change when users or the showcase add records.
      await expect(page.locator("main dl dd")).toHaveText([
        /^\d[\d\s]*$/,
        /^\d[\d\s]*$/,
        /^\d[\d\s]*$/,
      ]);
      await expect(page.locator('main [role="alert"]')).toHaveCount(0);
      await expect(page.getByText(/zo 6 agend ·/)).toHaveCount(0);
    } else {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Obnova interiéru mestskej knižnice",
      );
      await expect(page.getByText("4 súvisiace dokumenty", { exact: false })).toBeVisible();
      await expect(page.getByText("zmluvy-01.pdf", { exact: true })).toBeVisible();
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/${name}.png` });
  }
} finally {
  await browser.close();
}
