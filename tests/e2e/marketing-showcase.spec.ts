import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const home = "http://127.0.0.1:3000/home";
const proof = "docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/";
const stages = [
  ["Príprava faktúry", "preparation.png", "03-invoice-fields.png", "Úradník doplní údaje faktúry."],
  [
    "Zverejnenie faktúry",
    "published.png",
    "05-published.png",
    "Po priložení PDF úradník uloží a zverejní faktúru.",
  ],
  [
    "Prístup občana",
    "citizen.png",
    "07-public-detail.png",
    "Občan nájde zverejnenú faktúru a stiahne rovnaké PDF.",
  ],
] as const;
const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");

test("actual screenshots replace homepage video and preserve compact search and demos", async ({
  page,
  request,
}) => {
  const mediaRequests: string[] = [];
  page.on("request", (request) => {
    if (/\.(webm|mp4)(?:\?|$)/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(home);
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator('a[href$=".webm"], link[href$=".webm"]')).toHaveCount(0);
  await expect(page.getByRole("tab", { name: stages[0][0], exact: true })).toBeVisible();
  for (const [name, asset, original, caption] of stages) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const panel = page.getByRole("tabpanel");
    await expect(panel).toContainText(caption);
    const img = panel.getByRole("img");
    await expect(img).toHaveAttribute("src", `/showcase/${asset}`);
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 1280))
      .toBe(true);
    expect(hash(await (await request.get(`http://127.0.0.1:3000/showcase/${asset}`)).body())).toBe(
      hash(await readFile(proof + original)),
    );
  }
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const frame = await page.locator(".publication-frame:visible").boundingBox();
    expect(frame!.x).toBeGreaterThanOrEqual(0);
    expect(frame!.x + frame!.width).toBeLessThanOrEqual(width);
    expect(Math.abs(frame!.height / frame!.width - 800 / 1280)).toBeLessThan(0.01);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
  expect(mediaRequests).toEqual([]);
  expect((await request.get("http://127.0.0.1:3000/showcase/publication.webm")).status()).toBe(404);
  await expect(page.getByRole("link", { name: "Občianske demo", exact: true })).toHaveAttribute(
    "href",
    /:3001\/obcan\/home$/,
  );
  await expect(page.getByRole("link", { name: "Demo pre úradníka", exact: true })).toHaveAttribute(
    "href",
    /:3002\/uradnik\/prihlasenie$/,
  );
  // This published invoice exists in the standard 72-record seed, including fresh CI environments.
  await page.getByRole("searchbox").fill("FV/2026/0041");
  await page.getByRole("button", { name: "Hľadať", exact: true }).click();
  expect(new URL(page.url()).searchParams.get("q")).toBe("FV/2026/0041");
  await expect(
    page.getByRole("link", {
      name: "Preúčtovanie príspevku na obnovu interiéru mestskej knižnice",
      exact: true,
    }),
  ).toBeVisible();
});

test("reduced motion starts static and keyboard selection stays useful without spatial motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(home);
  await page.locator(".publication-showcase").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Spustiť ukážku", exact: true })).toBeVisible();
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[0][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: stages[0][0], exact: true }).focus();
  await page.getByRole("tab", { name: stages[0][0], exact: true }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(
    await page
      .getByRole("tabpanel")
      .getByRole("img")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("gentle six-second advance pauses manually, offscreen and when the document is hidden", async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(home);
  const figure = page.locator(".publication-showcase");
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-advancing", "true");
  await page.clock.runFor(6100);
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Pozastaviť ukážku", exact: true }).click();
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Spustiť ukážku", exact: true }).click();
  await page
    .getByRole("heading", { name: "Vyskúšajte obe strany obce", exact: true })
    .scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-advancing", "false");
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await figure.scrollIntoViewIfNeeded();
  await expect(figure).toHaveAttribute("data-advancing", "true");
  // Emulate the browser lifecycle event; no application response or publication is mocked.
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(figure).toHaveAttribute("data-advancing", "false");
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[1][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "visibilityState");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(figure).toHaveAttribute("data-advancing", "true");
  await page.clock.runFor(6100);
  await expect(page.getByRole("tab", { name: stages[2][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: stages[0][0], exact: true }).click();
  await expect(page.getByRole("button", { name: "Spustiť ukážku", exact: true })).toBeVisible();
  await page.clock.runFor(13000);
  await expect(page.getByRole("tab", { name: stages[0][0], exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("the first real screen and compact search are present before JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(home);
    const panel = page.getByRole("tabpanel");
    await expect(panel.getByRole("img")).toHaveAttribute("src", "/showcase/preparation.png");
    await expect
      .poll(() =>
        panel
          .getByRole("img")
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 1280),
      )
      .toBe(true);
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.locator("video")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
