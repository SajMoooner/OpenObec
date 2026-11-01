import { test, expect } from "@playwright/test";
test("občan má jedno vyhľadávanie a všetkých šesť agend", async ({ page }) => {
  await page.goto("/obcan/home");
  await expect(
    page.getByRole("heading", { level: 1, name: "Dokumenty mesta Žilina" }),
  ).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Vyhľadať dokumenty" })).toBeVisible();
  for (const title of [
    "Faktúry",
    "Dodávateľské faktúry",
    "Zmluvy",
    "Objednávky",
    "Verejné obstarávanie",
    "VZN",
  ])
    await expect(page.getByRole("link", { name: title, exact: true }).first()).toBeVisible();
});

test("občanovi ostanú dostupné výsledky pri výpadku jednej agendy", async ({ page }) => {
  await page.route("**/api/rest/v1/query/objednavky?**", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "DEPENDENCY_UNAVAILABLE",
          message: "Agenda nie je dostupná.",
          details: [],
          request_id: "req_partial_browser",
        },
      }),
    }),
  );
  await page.goto("/obcan/home?q=DEMO-2026");
  await expect(page.getByText(/Nie sú dostupné všetky agendy: Objednávky/)).toBeVisible();
  await expect(page.locator('main a[href^="/obcan/faktury/fak_"]').first()).toBeVisible();
  await page.unroute("**/api/rest/v1/query/objednavky?**");
  await page.getByRole("button", { name: "Skúsiť znova" }).click();
  await expect(page.getByText(/Nie sú dostupné všetky agendy/)).toHaveCount(0);
  await expect(page.locator('main a[href^="/obcan/objednavky/obj_"]').first()).toBeVisible();
});

test("občan vyhľadá dokumenty klávesnicou cez odkaz na preskočenie navigácie", async ({ page }) => {
  await page.goto("/obcan/home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Preskočiť na obsah" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  const search = page.getByRole("searchbox", { name: "Vyhľadať dokumenty" });
  await expect(search).toBeFocused();
  await search.fill("DEMO-2026");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Výsledky pre „DEMO-2026“" })).toBeVisible();
});
