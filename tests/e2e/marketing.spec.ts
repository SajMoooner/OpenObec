import { test, expect } from "@playwright/test";
const base = process.env.MARKETING_URL ?? "http://127.0.0.1:3000";
test("marketing exposes all five pages and persistent theme", async ({ page }) => {
  await page.goto(`${base}/home`);
  const nav = page.getByRole("navigation", { name: "Hlavná navigácia" });
  for (const [name, route] of [
    ["Domov", "/home"],
    ["Výhody", "/vyhody"],
    ["O nás", "/o-nas"],
    ["Cenník", "/pricing"],
    ["Kontakt", "/kontakt"],
  ]) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("href", route);
  }
  await page.getByRole("button", { name: "Prepnúť tému" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await nav.getByRole("link", { name: "Cenník" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Prepnúť tému" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
test("mobile navigation closes and marks active page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/home`);
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await page
    .getByRole("navigation", { name: "Mobilná navigácia" })
    .getByRole("link", { name: "O nás" })
    .click();
  await expect(page).toHaveURL(/\/o-nas$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Otvoriť navigáciu" }).click();
  await expect(
    page
      .getByRole("navigation", { name: "Mobilná navigácia" })
      .getByRole("link", { name: "O nás" }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Otvoriť navigáciu" })).toBeFocused();
});
test("FAQ and workflow are keyboard operable", async ({ page }) => {
  await page.goto(`${base}/home`);
  const question = page.getByRole("button", { name: "Je OpenObec bezplatný?" });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Zdrojový kód je otvorený", { exact: false })).toBeVisible();
  await page.goto(`${base}/vyhody`);
  const first = page.getByRole("tab").first();
  await first.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText("Snímka");
});
test("demo destinations and search preserve runtime portal addresses", async ({ page }) => {
  await page.goto(`${base}/demo`);
  await expect(
    page.getByRole("link", { name: "Otvoriť pracovné demo", exact: true }),
  ).toHaveAttribute("href", /:3002\/uradnik\/prihlasenie$/);
  await expect(
    page.getByRole("link", { name: "Otvoriť občianske demo", exact: true }),
  ).toHaveAttribute("href", /:3001\/obcan\/home$/);
  await page.getByRole("searchbox").fill("knižnice");
  await page.getByRole("button", { name: "Hľadať", exact: true }).click();
  await expect(page).toHaveURL(/:3001\/obcan\/home\?q=/);
  expect(new URL(page.url()).searchParams.get("q")).toBe("knižnice");
});
test("contact provides a real channel without pretending to send", async ({ page }) => {
  await page.goto(`${base}/kontakt`);
  await expect(
    page.locator("main").getByRole("link", { name: "Otvoriť GitHub projektu" }),
  ).toHaveAttribute("href", "https://github.com/SajMoooner/OpenObec");
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByText("Verejný podnet", { exact: false }).first()).toBeVisible();
});

test("skip link is hidden until keyboard focus and reaches main content", async ({ page }) => {
  await page.goto(`${base}/home`);
  const skip = page.getByRole("link", { name: "Preskočiť na obsah" });
  await expect(skip).toHaveCSS("opacity", "0");
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#obsah$/);
});
