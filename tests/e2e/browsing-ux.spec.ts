import { test, expect } from "@playwright/test";
test("list context survives detail and browser history and clears filters", async ({ page }) => {
  await page.goto("/obcan/zmluvy?q=knižnice&sort=created_at&page=1");
  await expect(page.getByRole("combobox", { name: "Zoradenie dokumentov" })).toContainText(
    "Najstaršie",
  );
  await page
    .getByRole("link", { name: /Otvoriť/ })
    .first()
    .click();
  await expect(page).toHaveURL(/returnTo=/);
  await page.locator("main").getByRole("link", { name: "Zmluvy", exact: true }).first().click();
  await expect(page).toHaveURL(/q=kni/);
  await page.getByRole("button", { name: "Zrušiť filtre" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("knižnice");
});
test("search summary prioritizes matches and exposes clear action", async ({ page }) => {
  await page.goto("/obcan/home?q=rekonštrukcia");
  await expect(page.getByText(/Spolu .*výsled/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Zrušiť vyhľadávanie" })).toBeVisible();
});
test("mobile shows document date and current agenda", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/obcan/zmluvy");
  await expect(
    page
      .locator("tbody")
      .getByText(/Dátum účinnosti/)
      .first(),
  ).toBeVisible();
  expect(
    await page
      .getByRole("combobox", { name: "Zoradenie dokumentov" })
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await expect(
    page.getByRole("dialog").locator('a[aria-current="page"]', { hasText: "Zmluvy" }),
  ).toBeVisible();
});
test("global search puts its single matching agenda before compact empty groups", async ({
  page,
}) => {
  await page.route("**/api/rest/v1/**", async (route) => {
    const match = new URL(route.request().url()).pathname.endsWith("/zmluvy");
    await route.fulfill({
      json: {
        data: match
          ? [
              {
                typ: "zmluvy",
                zaznam: {
                  id: "single-match",
                  cislo: "SEARCH-1",
                  predmet: "Jediná zhoda",
                  zverejnene: true,
                  created_at: "2026-10-01T00:00:00Z",
                  updated_at: "2026-10-01T00:00:00Z",
                  datum_ucinnosti: "2026-10-01",
                  suma_s_dph: "123.00",
                },
              },
            ]
          : [],
        pagination: { page: 1, page_size: 5, total: match ? 1 : 0, total_pages: match ? 1 : 0 },
      },
    });
  });
  await page.goto("/obcan/home?q=jedina");
  await expect(page.getByText("Spolu 1 výsledok.")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Výber agendy" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 3 })).toContainText("Zmluvy");
  await expect(page.getByText(/Bez zhody:/)).toBeVisible();
  await expect(page.getByText("V tejto agende sa nenašli žiadne zhody.")).toHaveCount(0);
});
test("office retains query, page, sort and publication state through detail and history", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:3002/uradnik/prihlasenie");
  await page.getByRole("button", { name: "Vstúpiť do dema" }).click();
  await expect(page).toHaveURL(/uradnik\/home/);
  await page.route("**/api/rest/v1/zmluvy?*", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: "context-test",
            cislo: "CTX-1",
            predmet: "Kontext",
            zverejnene: false,
            created_at: "2026-10-01T00:00:00Z",
            updated_at: "2026-10-01T00:00:00Z",
          },
        ],
        pagination: { page: 2, page_size: 10, total: 31, total_pages: 4 },
      },
    }),
  );
  const url = "http://127.0.0.1:3002/uradnik/zmluvy?q=kontext&page=2&sort=updated_at&state=false";
  await page.goto(url);
  await expect(page.getByRole("combobox", { name: "Stav zverejnenia" })).toContainText("Koncepty");
  await page.getByRole("link", { name: "Otvoriť CTX-1" }).click();
  await expect(page).toHaveURL(/returnTo=.*state%3Dfalse/);
  await page.goBack();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("searchbox")).toHaveValue("kontext");
  await expect(page.getByRole("combobox", { name: "Zoradenie dokumentov" })).toContainText(
    "Najdávnejšie",
  );
  await page.reload();
  await expect(page.getByText(/strana 2 z/)).toBeVisible();
});
test("browsing fits responsive widths and VZN has no money column", async ({ page }) => {
  for (const width of [390, 768, 1440, 3440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/obcan/vzn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Všeobecne záväzné");
    await expect(page.locator("tbody tr").first()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    await expect(page.getByRole("columnheader", { name: /Suma/ })).toHaveCount(0);
    if (width === 390 || width === 1440)
      await page.screenshot({ path: `/tmp/openobec-task1-vzn-${width}.png`, fullPage: true });
  }
});

test("opening a lower mobile agenda starts at the page heading", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/obcan/home");
  const link = page
    .getByRole("navigation", { name: "Výber agendy" })
    .getByRole("link", { name: /Všeobecne záväzné/ });
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/obcan\/vzn/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect
    .poll(() =>
      page.getByRole("heading", { level: 1 }).evaluate((el) => el.getBoundingClientRect().top),
    )
    .toBeGreaterThanOrEqual(0);
});
test("all six agenda tables expose their domain columns and fit mobile", async ({ page }) => {
  const agendas = [
    ["faktury", "Odberateľ", "Dátum vystavenia", "Suma s DPH"],
    ["dodavatelske-faktury", "Dodávateľ", "Dátum vystavenia", "Suma s DPH"],
    ["zmluvy", "Zmluvná strana", "Dátum účinnosti", "Suma s DPH"],
    ["objednavky", "Dodávateľ", "Dátum objednania", "Suma s DPH"],
    [
      "verejne-obstaravanie",
      "Stav obstarávania",
      "Lehota predkladania ponúk",
      "Predpokladaná hodnota bez DPH",
    ],
    ["vzn", "Dátum schválenia", "Dátum účinnosti"],
  ];
  for (const [agenda, ...labels] of agendas) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/obcan/${agenda}`);
    await expect(page.locator("tbody tr").first()).toBeVisible();
    for (const label of labels)
      await expect(page.getByRole("columnheader", { name: label, exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    if (agenda === "verejne-obstaravanie")
      await page.screenshot({ path: "/tmp/openobec-task1-procurement-390.png", fullPage: true });
  }
});
