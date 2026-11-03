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
  await page.getByRole("button", { name: "Vyskúšať ako úradník" }).click();
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

for (const portal of ["obcan", "uradnik"]) {
  test(`retained out-of-range ${portal} page offers truthful recovery with context and no history trap`, async ({
    page,
  }) => {
    if (portal === "uradnik")
      await page
        .context()
        .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
    let requests = 0;
    await page.route("**/api/rest/v1/**", async (route) => {
      const url = new URL(route.request().url());
      if (url.searchParams.has("page")) requests++;
      const pageNumber = Number(url.searchParams.get("page"));
      await route.fulfill({
        json: {
          data:
            pageNumber === 1
              ? [
                  {
                    ...(portal === "obcan" ? { typ: "faktury" } : {}),
                    ...(portal === "obcan" ? { zaznam: recentRecord(1) } : recentRecord(1)),
                  },
                ]
              : [],
          pagination: { page: pageNumber, page_size: 10, total: 8, total_pages: 1 },
        },
      });
    });
    const origin = portal === "obcan" ? "http://127.0.0.1:3001" : "http://127.0.0.1:3002";
    await page.goto(`${origin}/${portal}/home`);
    await page.goto(`${origin}/${portal}/faktury?q=owned&sort=updated_at&state=true&page=999`);
    await expect(page.getByRole("status").filter({ hasText: "8 dokumentov" })).toBeVisible();
    await expect(page.getByText("Zatiaľ tu nie sú žiadne dokumenty", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: "Prejsť na poslednú dostupnú stranu" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Prejsť na poslednú dostupnú stranu" }).click();
    await expect(page).toHaveURL(
      `${origin}/${portal}/faktury?q=owned&sort=updated_at&state=true&page=1`,
    );
    await expect(page.getByRole("link", { name: "Otvoriť NEW-1" })).toBeVisible();
    expect(requests).toBe(2);
    await page.goBack();
    await expect(page).toHaveURL(`${origin}/${portal}/home`);
  });
}

function recentRecord(index: number, older = false) {
  return {
    id: `owned-final-${index}`,
    cislo: `${older ? "OLD" : "NEW"}-${index}`,
    predmet: `${older ? "Older" : "Newest"} ${index}`,
    zverejnene: true,
    created_at: older
      ? "2025-01-01T00:00:00Z"
      : `2026-11-01T10:${String(59 - index).padStart(2, "0")}:00Z`,
    updated_at: older
      ? "2025-01-01T00:00:00Z"
      : `2026-11-01T10:${String(59 - index).padStart(2, "0")}:00Z`,
  };
}

test("citizen latest ten includes ten newest records from one busy agenda", async ({ page }) => {
  await page.route("**/api/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const busy = url.pathname.endsWith("/faktury");
    const rows = busy
      ? Array.from({ length: 12 }, (_, i) => recentRecord(i + 1))
      : [recentRecord(1, true)];
    await route.fulfill({
      json: {
        data: rows
          .slice(0, Number(url.searchParams.get("page_size")))
          .map((zaznam) =>
            url.pathname.includes("/query/")
              ? { typ: busy ? "faktury" : url.pathname.split("/").at(-1), zaznam }
              : zaznam,
          ),
        pagination: { total: rows.length, total_pages: 1 },
      },
    });
  });
  await page.goto("/obcan/home");
  const rows = page.locator("main tbody tr");
  await expect(rows).toHaveCount(10);
  for (let i = 1; i <= 10; i++) await expect(rows.nth(i - 1)).toContainText(`NEW-${i}`);
});

for (const portal of ["obcan", "uradnik"]) {
  test(`cross-agenda related ${portal} detail labels the originating list and editor continuation`, async ({
    page,
  }) => {
    if (portal === "uradnik")
      await page
        .context()
        .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
    await page.route("**/api/rest/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const invoice = path.includes("/faktury/");
      const record = { ...recentRecord(invoice ? 2 : 1), suvisiace_zaznamy: [] };
      const data = path.endsWith("/prilohy")
        ? []
        : path.endsWith("/suvislosti")
          ? { nodes: [], edges: [] }
          : path.includes("/query/")
            ? {
                root: { typ: invoice ? "faktury" : "zmluvy", zaznam: record },
                suvisiace_zaznamy: invoice ? [] : [{ typ: "faktury", zaznam: recentRecord(2) }],
                vazby: [],
                pagination: { next_cursor: null },
              }
            : record;
      await route.fulfill({ json: { data, projection: { status: "ready" } } });
    });
    const origin = portal === "obcan" ? "http://127.0.0.1:3001" : "http://127.0.0.1:3002";
    const returnTo = `/${portal}/zmluvy?q=owned&sort=updated_at&page=2`;
    await page.goto(
      `${origin}/${portal}/zmluvy/owned-final-1?returnTo=${encodeURIComponent(returnTo)}`,
    );
    await page.getByRole("button", { name: /Newest 2/ }).click();
    await page.getByRole("link", { name: "Otvoriť celý dokument" }).click();
    await expect(page).toHaveURL(new RegExp(`/${portal}/faktury/owned-final-2\\?`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Newest 2");
    const back = page.locator("main").getByRole("link", { name: "Zmluvy", exact: true });
    await expect(back).toHaveAttribute("href", returnTo);
    if (portal === "uradnik") {
      await page.getByRole("link", { name: "Upraviť", exact: true }).click();
      await expect(page.getByLabel("Evidenčné číslo")).toHaveValue("NEW-2");
      await expect(back).toHaveAttribute("href", returnTo);
    }
  });
}
