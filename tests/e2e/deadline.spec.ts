import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const office = "http://127.0.0.1:3002";
const endpoint = "http://127.0.0.1:8080/rest/v1/verejne-obstaravanie";
const headers = { "X-Obec-Id": "zilina" };

for (const [name, deadline] of [
  ["ordinary fractional deadline", "2026-11-01T09:30:45.123456Z"],
  ["first autumn overlap occurrence", "2026-10-25T00:30:45.123456Z"],
  ["second autumn overlap occurrence", "2026-10-25T01:30:45.123456Z"],
]) {
  test(`procurement edit preserves ${name} and accepts a deliberate date edit`, async ({
    page,
    request,
  }) => {
    const title = `E2E deadline ${randomUUID()}`;
    const created = await request.post(endpoint, {
      headers,
      data: {
        cislo: title,
        nazov: title,
        predmet: "Pôvodný predmet",
        cpv: "45000000-7",
        predpokladana_hodnota_bez_dph: "1000.00",
        mena: "EUR",
        lehota_predkladania: deadline,
        stav: "otvorene",
        suvisiace_zaznamy: [],
        zverejnene: false,
      },
    });
    expect(created.ok()).toBeTruthy();
    const id = (await created.json()).data.id as string;
    try {
      const before = (await (await request.get(`${endpoint}/${id}`, { headers })).json()).data;
      expect(before.lehota_predkladania).toBe(deadline);
      await page.goto(`${office}/uradnik/prihlasenie`);
      await page.getByRole("button", { name: "Vstúpiť do dema" }).click();
      await expect(page.getByRole("heading", { name: "Prehľad dokumentov" })).toBeVisible();
      await page.goto(`${office}/uradnik/verejne-obstaravanie/${id}/upravit`);
      await page.locator("#predmet").fill("Upravený predmet bez zmeny lehoty");
      await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/uradnik/verejne-obstaravanie/${id}\\?returnTo=`));
      const after = (await (await request.get(`${endpoint}/${id}`, { headers })).json()).data;
      expect(after.predmet).toBe("Upravený predmet bez zmeny lehoty");
      expect(after.lehota_predkladania).toBe(deadline);

      await page.goto(`${office}/uradnik/verejne-obstaravanie/${id}/upravit`);
      await page.locator("#lehota_predkladania").fill("2026-03-29T02:30:45.123");
      await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
      await expect(page.locator("#form-error")).toContainText("neexistuje");
      expect(
        (await (await request.get(`${endpoint}/${id}`, { headers })).json()).data
          .lehota_predkladania,
      ).toBe(deadline);
      await page.locator("#lehota_predkladania").fill("2026-11-01T11:31:46.12");
      await page.getByRole("button", { name: "Uložiť koncept", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/uradnik/verejne-obstaravanie/${id}\\?returnTo=`));
      expect(
        (await (await request.get(`${endpoint}/${id}`, { headers })).json()).data
          .lehota_predkladania,
      ).toBe("2026-11-01T10:31:46.120Z");
    } finally {
      expect((await request.post(`${endpoint}/${id}/delete`, { headers })).ok()).toBeTruthy();
    }
  });
}
