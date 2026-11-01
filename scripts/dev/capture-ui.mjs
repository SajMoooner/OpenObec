import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { readFile, mkdir, writeFile } from "node:fs/promises";
const dir = ".impeccable/review";
await mkdir(dir, { recursive: true });
const manifest = JSON.parse(await readFile(".run/seed-manifest.json", "utf8"));
const invoice = manifest.records.faktury[0].id;
const macChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const executablePath =
  process.env.CHROME_PATH ??
  (process.platform === "darwin" && existsSync(macChrome) ? macChrome : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const targets = [
  ["marketing-home", 3000, "/home"],
  ["marketing-benefits", 3000, "/vyhody"],
  ["marketing-contact", 3000, "/kontakt"],
  ["marketing-demo", 3000, "/demo"],
  ["citizen-home", 3001, "/obcan/home"],
  ["citizen-list", 3001, "/obcan/faktury"],
  ["citizen-detail", 3001, `/obcan/faktury/${invoice}`],
  ["office-login", 3002, "/uradnik/prihlasenie"],
  ["office-dashboard", 3002, "/uradnik/home"],
  ["office-list", 3002, "/uradnik/faktury"],
  ["office-detail", 3002, `/uradnik/faktury/${invoice}`],
  ["office-edit", 3002, `/uradnik/faktury/${invoice}/upravit`],
  ["office-procurement-new", 3002, "/uradnik/verejne-obstaravanie/novy"],
  ["office-settings", 3002, "/uradnik/settings"],
];
const evidence = [];
for (const [name, port, route] of targets) {
  for (const [viewport, width, height] of [
    ["desktop", 1440, 960],
    ["mobile", 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      locale: "sk-SK",
      timezoneId: "Europe/Bratislava",
    });
    if (name.startsWith("office-") && name !== "office-login")
      await context.addCookies([
        {
          name: "openobec-demo",
          value: "zilina",
          domain: "127.0.0.1",
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        },
      ]);
    const page = await context.newPage(),
      errors = [],
      warnings = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
      if (message.type() === "warning") warnings.push(message.text());
    });
    const url = `http://127.0.0.1:${port}${route}`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () => document.querySelectorAll('[data-slot="skeleton"]').length === 0,
      undefined,
      { timeout: 15000 },
    );
    const filename = name === "marketing-home" ? `${viewport}.png` : `${name}-${viewport}.png`;
    await page.screenshot({ path: `${dir}/${filename}`, fullPage: true, animations: "disabled" });
    const geometry = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    evidence.push({
      name,
      viewport,
      url,
      filename,
      status: response?.status(),
      ...geometry,
      errors,
      warnings,
    });
    console.log(
      name,
      viewport,
      response?.status(),
      geometry.scrollWidth === width ? "fits" : `OVERFLOW ${geometry.scrollWidth}`,
      errors.length ? errors : "",
    );
    if (name === "citizen-detail" || name === "office-detail") {
      const accordion = page.locator('[data-slot="accordion-trigger"]').first();
      if (await accordion.count()) {
        await accordion.click();
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        await page.screenshot({
          path: `${dir}/${name}-expanded-${viewport}.png`,
          fullPage: true,
          animations: "disabled",
        });
      }
    }
    await context.close();
  }
}
await browser.close();
await writeFile(`${dir}/capture-manifest.json`, JSON.stringify(evidence, null, 2) + "\n");
if (evidence.some((e) => e.status !== 200 || e.errors.length || e.scrollWidth > e.width))
  process.exitCode = 1;
