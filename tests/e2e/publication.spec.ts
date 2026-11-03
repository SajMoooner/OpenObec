import { test, expect, type Page } from "@playwright/test";
import { randomUUID, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
const office = process.env.OFFICE_URL ?? "http://127.0.0.1:3002",
  citizen = process.env.CITIZEN_URL ?? "http://127.0.0.1:3001",
  gateway = process.env.API_BASE_URL ?? "http://127.0.0.1:8080";
const fixture = path.resolve("tests/e2e/fixtures/publication.pdf");
const owned: string[] = [];
async function enter(page: Page) {
  await page.goto(`${office}/uradnik/prihlasenie`);
  await page.getByRole("button", { name: "Vyskúšať ako úradník" }).click();
  await expect(page.getByRole("heading", { name: "Prehľad dokumentov" })).toBeVisible();
}
async function invoice(page: Page, number: string, title: string) {
  await page.goto(`${office}/uradnik/faktury/novy`);
  await page.locator("#cislo").fill(number);
  await page.locator("#predmet").fill(title);
  await page.locator("#datum_vystavenia").fill("2026-10-01");
  await page.locator("#datum_splatnosti").fill("2026-10-31");
  for (const [id, value] of [
    ["suma_bez_dph", "100,00"],
    ["suma_dph", "23,00"],
    ["suma_s_dph", "123,00"],
    ["odberatel.nazov", "Fiktívna organizácia – browser demo"],
    ["odberatel.ico", "12345678"],
  ])
    await page.locator(`[id="${id}"]`).fill(value);
  await page.locator("#new-files").setInputFiles(fixture);
}
test.afterEach(async ({ request }) => {
  for (const id of owned.splice(0))
    await request.post(`${gateway}/rest/v1/faktury/${id}/delete`, {
      headers: { "X-Obec-Id": "zilina" },
    });
});
test("create PDF, link, publish, search, edit and unpublish", async ({ page, request }) => {
  test.setTimeout(process.env.OFFICE_URL ? 180000 : 90000);
  const key = randomUUID().slice(0, 8),
    title = `E2E ${key} – údržba verejného priestoru`;
  await enter(page);
  await invoice(page, `E2E-${key}`, title);
  await page.getByRole("button", { name: "Vybrať dokumenty" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Cieľová agenda" }).click();
  await page.getByRole("option", { name: "Zmluvy", exact: true }).click();
  await dialog
    .locator("li")
    .filter({ hasText: "Zverejnené" })
    .first()
    .getByRole("checkbox")
    .check();
  await dialog.getByRole("button", { name: "Hotovo" }).click();
  const created = page.waitForResponse(
    (r) => r.url() === `${office}/api/rest/v1/faktury` && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Uložiť a zverejniť" }).click();
  const id = (await (await created).json()).data.id as string;
  owned.push(id);
  await expect(page).toHaveURL(new RegExp(`/uradnik/faktury/${id}\\?returnTo=`));
  await expect(page.getByText("Zverejnené", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "publication.pdf", exact: true })).toBeVisible();
  await expect(async () => {
    await page.goto(`${citizen}/obcan/home?q=${key}`);
    await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
  }).toPass({ timeout: process.env.OFFICE_URL ? 60000 : 15000 });
  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByRole("link", { name: "publication.pdf", exact: true })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await page.getByRole("link", { name: "publication.pdf", exact: true }).click();
  const download = await downloading;
  const downloaded = await readFile((await download.path())!);
  const original = await readFile(fixture);
  expect(createHash("sha256").update(downloaded).digest("hex")).toBe(
    createHash("sha256").update(original).digest("hex"),
  );
  await page.goto(`${office}/uradnik/faktury/${id}/upravit`);
  await expect(page.getByText("Zmluvy", { exact: true }).last()).toBeVisible();
  await page.locator("#predmet").fill(title + " – upravené");
  await page.getByRole("button", { name: "Uložiť zmeny" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title + " – upravené" })).toBeVisible();
  await page.getByRole("button", { name: "Stiahnuť zo zverejnenia" }).click();
  await expect(page.getByText("Koncept", { exact: true })).toBeVisible();
  const files = await request.get(`${office}/api/rest/v1/faktury/${id}/prilohy`);
  const file = (await files.json()).data[0];
  await expect
    .poll(async () =>
      (
        await request.get(`${citizen}/api/rest/v1/faktury/${id}/prilohy/${file.id}/download`)
      ).status(),
    )
    .toBe(404);
  await expect
    .poll(async () =>
      (await request.get(`${citizen}/api/rest/v1/query/faktury/${id}?zverejnene=true`)).status(),
    )
    .toBe(404);
});
test("upload failure retains inputs and retries the same saved document", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  const key = randomUUID().slice(0, 8),
    number = `E2E-RETRY-${key}`,
    title = `E2E ${key} – zachovanie rozpracovaného dokumentu`;
  await enter(page);
  await invoice(page, number, title);
  await page.route("**/api/rest/v1/faktury/*/prilohy", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "DEPENDENCY_UNAVAILABLE",
          message: "Súbor sa nepodarilo nahrať. Skúste to znova.",
          details: [],
          request_id: "req_browser_fault",
        },
      }),
    }),
  );
  const created = page.waitForResponse(
    (r) => r.url() === `${office}/api/rest/v1/faktury` && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  const id = (await (await created).json()).data.id as string;
  owned.push(id);
  await expect(page.locator("#form-error")).toContainText("Záznam je uložený");
  await expect(page.locator("#cislo")).toHaveValue(number);
  await expect(page.locator("#predmet")).toHaveValue(title);
  await page.unroute("**/api/rest/v1/faktury/*/prilohy");
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page).toHaveURL(new RegExp(`/uradnik/faktury/${id}\\?returnTo=`));
  await expect(page.getByRole("link", { name: "publication.pdf", exact: true })).toBeVisible();
  const response = await request.get(`${office}/api/rest/v1/faktury?q=${number}`);
  const result = await response.json();
  expect(result.pagination.total).toBe(1);
  expect(result.data[0].id).toBe(id);
});
test("mobile citizen and office navigation stay within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${citizen}/obcan/home`);
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Zmluvy", exact: true }).click();
  await expect(page).toHaveURL(`${citizen}/obcan/zmluvy`);
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await enter(page);
  await page.getByRole("button", { name: "Prepnúť navigáciu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Objednávky", exact: true }).click();
  await expect(page).toHaveURL(`${office}/uradnik/objednavky`);
  await expect(page.getByRole("dialog")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("server validation preserves the form without creating a record", async ({
  page,
  request,
}) => {
  const key = randomUUID().slice(0, 8),
    number = `E2E-INVALID-${key}`,
    title = `E2E ${key} – kontrola dátumov`;
  await enter(page);
  await invoice(page, number, title);
  await page.locator("#datum_splatnosti").fill("2026-09-01");
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page.locator("#form-error")).toBeVisible();
  await expect(page.locator("#datum_splatnosti")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#cislo")).toHaveValue(number);
  await expect(page.locator("#predmet")).toHaveValue(title);
  const result = await request.get(`${office}/api/rest/v1/faktury?q=${number}`);
  expect((await result.json()).pagination.total).toBe(0);
});
