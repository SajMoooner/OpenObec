import { test, expect } from "@playwright/test";
const marketing = process.env.MARKETING_URL ?? "http://localhost:3000";
const office = process.env.OFFICE_URL ?? "http://localhost:3002";
test("marketing demo CTA opens the two-role chooser", async ({ page }) => {
  await page.goto(`${marketing}/home`);
  await page.locator("header").getByRole("link", { name: "Vyskúšať demo", exact: true }).click();
  await expect(page).toHaveURL(`${marketing}/demo`);
  await expect(page.getByRole("heading", { name: "Pohľad občana" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pohľad úradníka" })).toBeVisible();
});
test("officer selection enters the dashboard without a login step", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto(`${marketing}/demo`);
  await page.getByRole("button", { name: "Vyskúšať ako úradník" }).click();
  await expect(page).toHaveURL(/:3002\/uradnik\/home$/);
  await expect(
    page.getByRole("heading", { name: "Prehľad dokumentov", exact: true }),
  ).toBeVisible();
  expect((await context.cookies()).find((c) => c.name === "openobec-demo")?.httpOnly).toBe(true);
});
test("citizen selection opens the public portal and legacy entry returns to chooser", async ({
  page,
}) => {
  await page.goto(`${office}/uradnik/prihlasenie`);
  await expect(page).toHaveURL(/:3000\/demo$/);
  await page.getByRole("link", { name: "Vyskúšať ako občan" }).click();
  await expect(page).toHaveURL(/:3001\/obcan\/home$/);
  await expect(
    page.getByRole("heading", { name: "Dokumenty mesta Žilina", exact: true }),
  ).toBeVisible();
});
test("role selection works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${marketing}/demo`);
  await page.getByRole("button", { name: "Vyskúšať ako úradník" }).click();
  await expect(page).toHaveURL(/:3002\/uradnik\/home$/);
  await context.close();
});

test("office health is independent of marketing redirects", async ({ request }) => {
  const response = await request.get(`${office}/api/health`, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
