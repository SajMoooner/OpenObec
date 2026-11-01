// Run deliberately after confirming the local dataset contains only owned demo records.
// Does not create or modify records. Review both images and update provenance before commit.
import { chromium } from "@playwright/test";
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
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `apps/marketing/public/previews/${name}.png` });
  }
} finally {
  await browser.close();
}
