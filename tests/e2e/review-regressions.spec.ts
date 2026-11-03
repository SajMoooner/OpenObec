import { test, expect } from "@playwright/test";

const marketing = process.env.MARKETING_URL ?? "http://127.0.0.1:3000";
const citizen = "http://127.0.0.1:3001";
const office = "http://127.0.0.1:3002";
// The user-directed animated real screenshots supersedes the illustrative table and its agenda tabs.

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
      await expect(
        documentCell.getByText(/(?:FV|DF|ZM|OBJ|VO)\/2026\/\d{4}|\d+\/2026/),
      ).toBeVisible();
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

// A hidden desktop line break must retain word separation on the mobile hero.
test("mobile marketing headline preserves spaces", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${marketing}/home`);
  expect((await page.locator("h1").innerText()).replace(/\s+/g, " ").trim()).toBe(
    "Zverejňovanie dokumentov, v ktorom máte poriadok.",
  );
});
