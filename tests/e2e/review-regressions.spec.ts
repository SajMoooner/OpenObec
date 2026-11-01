import { test, expect } from "@playwright/test";

const marketing = "http://127.0.0.1:3000";
const citizen = "http://127.0.0.1:3001";
const office = "http://127.0.0.1:3002";
const agendas = [
  ["Všetky", null],
  ["Faktúry", "faktury"],
  ["Dodávateľské faktúry", "dodavatelske-faktury"],
  ["Zmluvy", "zmluvy"],
  ["Objednávky", "objednavky"],
  ["Verejné obstarávanie", "verejne-obstaravanie"],
  ["VZN", "vzn"],
] as const;

// A fabricated title query must not turn any of the three preview actions into empty results.
for (const [tab, agenda] of agendas) {
  test(`marketing preview ${tab} opens populated published agendas from all three rows`, async ({
    page,
    request,
  }) => {
    for (let index = 0; index < 3; index++) {
      await page.goto(`${marketing}/home`);
      await page.getByRole("tab", { name: tab, exact: true }).click();
      const rows = page.locator(".marketing-table tbody tr");
      await expect(rows).toHaveCount(3);
      const action = rows.nth(index).getByRole("link");
      await action.click();
      await expect(page).toHaveURL(/http:\/\/(?:localhost|127\.0\.0\.1):3001\/obcan\//);
      const destination = new URL(page.url());
      const slug = destination.pathname.split("/")[2];
      if (agenda) expect(slug).toBe(agenda);
      const apiPath = slug === "vzn" ? "/vzn" : `/query/${slug}`;
      const params = new URLSearchParams({
        zverejnene: "true",
        page_size: "1",
        q: destination.searchParams.get("q") ?? "",
      });
      const response = await request.get(`${citizen}/api/rest/v1${apiPath}?${params}`);
      expect(response.ok()).toBe(true);
      const result = await response.json();
      expect(
        result.pagination.total,
        `preview row ${index + 1} must lead to actual records`,
      ).toBeGreaterThan(0);
      const published = result.data[0].zaznam ?? result.data[0];
      expect(published.zverejnene).toBe(true);
      const record = page.locator(`main tbody a[href^="/obcan/${slug}/"]`).first();
      await expect(record).toBeVisible();
      await page.goto(`${marketing}/home`);
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(
        page.locator(".marketing-table tbody tr").nth(index).getByRole("link"),
      ).toHaveText(/Otvoriť agendu/);
    }
  });
}

// Separate narrow columns must not squeeze titles or place the state/open control off screen.
for (const [name, url, isOffice, hasAgenda, width] of [
  ["citizen home", `${citizen}/obcan/home`, false, true, 390],
  ["office dashboard", `${office}/uradnik/home`, true, true, 390],
  ["office agenda list", `${office}/uradnik/faktury`, true, false, 390],
  ["office dashboard at tablet width", `${office}/uradnik/home`, true, true, 768],
] as const) {
  test(`responsive ${name} keeps readable record titles, metadata and open actions without horizontal scrolling`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    if (isOffice)
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
    await page.goto(url);
    const table = page.locator("main table").first();
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
    const container = table.locator("..");
    expect(
      await container.evaluate((element) => element.scrollWidth - element.clientWidth),
    ).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    for (const row of await rows.all()) {
      const documentCell = row.locator("td").first();
      expect((await documentCell.boundingBox())!.width).toBeGreaterThanOrEqual(240);
      const primary = documentCell.getByRole("link").first();
      await expect(primary).toBeVisible();
      expect((await primary.boundingBox())!.width).toBeGreaterThanOrEqual(190);
      await expect(documentCell.getByText(/DEMO-2026-/)).toBeVisible();
      const action = row.getByRole("link", { name: /^Otvoriť / });
      await action.scrollIntoViewIfNeeded();
      const actionBox = (await action.boundingBox())!;
      expect(actionBox.x).toBeGreaterThanOrEqual(0);
      expect(actionBox.x + actionBox.width).toBeLessThanOrEqual(width);
      if (isOffice) {
        const status = row
          .locator('[data-slot="badge"]:visible')
          .filter({ hasText: /^(Koncept|Zverejnené)$/ });
        await expect(status).toHaveCount(1);
        const statusBox = (await status.boundingBox())!;
        expect(statusBox.x + statusBox.width).toBeLessThanOrEqual(width);
      }
      if (hasAgenda) await expect(row.locator('[data-slot="badge"]:visible').first()).toBeVisible();
      await expect(row).toContainText(/€|—/);
    }
    const title = await rows.first().locator("td").first().getByRole("link").first().innerText();
    await rows
      .first()
      .getByRole("link", { name: /^Otvoriť / })
      .click();
    await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  });
}

// Removing a desktop line break on mobile must keep the words on either side separated.
for (const [name, selector, text] of [
  ["intro", ".marketing-intro", "Jedno miesto pre občanov. Jednoduchšia evidencia pre úradníkov."],
  [
    "price",
    ".marketing-price-copy",
    "Jeden ročný paušál za evidenciu dokumentov a ich verejné sprístupnenie. Cena je návrh, nie záväzná ponuka.",
  ],
] as const) {
  test(`mobile marketing ${name} preserves spaces when desktop line breaks disappear`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${marketing}/home`);
    expect((await page.locator(selector).innerText()).replace(/\s+/g, " ").trim()).toBe(text);
  });
}
