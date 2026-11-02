import { test, expect, type Page } from "@playwright/test";
const office = "http://127.0.0.1:3002";
async function enter(page: Page) {
  await page.context().addCookies([
    {
      name: "openobec-demo",
      value: "zilina",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto(`${office}/uradnik/faktury`);
  await page.getByRole("link", { name: /Pridať/ }).click();
  await expect(page.getByLabel("Evidenčné číslo")).toBeVisible();
}
test("dirty cancel and sidebar require one confirmation; stay preserves fields and files", async ({
  page,
}) => {
  await enter(page);
  await page.getByLabel("Evidenčné číslo").fill("WORKFLOW-UNSAVED");
  await page.locator("#new-files").setInputFiles({
    name: "selected.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Zostať a pokračovať" }).click();
  await expect(page.getByLabel("Evidenčné číslo")).toHaveValue("WORKFLOW-UNSAVED");
  expect(
    await page.locator("#new-files").evaluate((e: HTMLInputElement) => e.files?.[0]?.name),
  ).toBe("selected.pdf");
  await page.getByRole("link", { name: "Prehľad", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(1);
  await page.getByRole("button", { name: "Odísť bez uloženia" }).click();
  await expect(page).toHaveURL(/uradnik\/home$/);
});
test("editor browser back uses native unload; stay retains work, leave and forward cross documents", async ({
  page,
}) => {
  await enter(page);
  await page.getByLabel("Evidenčné číslo").fill("HISTORY-UNSAVED");
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs++;
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss();
  });
  // A canceled native navigation never commits; await the dialog rather than a load event.
  const canceledBack = page.goBack({ waitUntil: "commit", timeout: 1500 }).catch((error) => {
    if (!/Timeout|ERR_ABORTED/.test(String(error))) throw error;
  });
  await expect.poll(() => dialogs).toBe(1);
  await canceledBack;
  await expect(page.getByLabel("Evidenčné číslo")).toHaveValue("HISTORY-UNSAVED");
  page.removeAllListeners("dialog");
  page.once("dialog", (dialog) => dialog.accept());
  await page.goBack();
  await expect(page).toHaveURL(/uradnik\/faktury$/);
  await page.goForward();
  await expect(page.getByLabel("Evidenčné číslo")).toBeVisible();
});
test("reverted field is clean; failed validation remains guarded and select describes its error", async ({
  page,
}) => {
  await enter(page);
  await page.getByLabel("Evidenčné číslo").fill("revert");
  await page.getByLabel("Evidenčné číslo").fill("");
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page).toHaveURL(/uradnik\/faktury$/);
  await page.goto(`${office}/uradnik/verejne-obstaravanie/novy`);
  await page.getByLabel("Evidenčné číslo").fill("INVALID");
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page.locator("#stav")).toHaveAttribute("aria-describedby", "stav-error");
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
});
test("dashboard uses pagination totals and keeps successful sections when one service fails", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
  let failed = true;
  await page.route("**/api/rest/v1/*?*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/vzn") && failed)
      return route.fulfill({
        status: 503,
        json: { error: { message: "Owned unavailable fixture" } },
      });
    const total =
      url.searchParams.get("zverejnene") === "false"
        ? 12
        : url.searchParams.get("zverejnene") === "true"
          ? 25
          : 37;
    return route.fulfill({ json: { data: [], pagination: { total, total_pages: 8 } } });
  });
  await page.goto(`${office}/uradnik/home`);
  await expect(page.getByText("Neúplné údaje")).toBeVisible();
  await expect(page.getByText("185", { exact: true })).toBeVisible();
  await expect(page.getByText("60", { exact: true })).toBeVisible();
  await expect(page.getByText("125", { exact: true })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Obnoviť nedostupné údaje" }).click();
  await expect(page.getByText("222", { exact: true })).toBeVisible();
  await expect(page.getByText("Neúplné údaje")).toHaveCount(0);
});

const synthetic = {
  id: "owned-workflow-fixture",
  obec_id: "zilina",
  cislo: "OWNED-WORKFLOW",
  predmet: "Vlastný testovací dokument",
  nazov: "Vlastný testovací dokument",
  zverejnene: true,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-11-01T10:00:00Z",
  datum_schvalenia: "2026-10-01",
  datum_ucinnosti: "2026-11-01",
  datum_podpisu: "2026-10-01",
  suma_s_dph: "12345678901234567890.12",
  zmluvna_strana: { nazov: "Fiktívna organizácia", ico: "12345678" },
  suvisiace_zaznamy: [],
};
test("published editor hydrates reference names and guards inverse edit entries", async ({
  page,
}) => {
  await enter(page);
  await page.route("**/api/rest/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/suvislosti"))
      return route.fulfill({
        json: {
          data: {
            nodes: [
              { typ: "objednavky", id: "inverse-fixture", label: "OBJ-OWNED · Spätná objednávka" },
            ],
            edges: [
              {
                from: { typ: "objednavky", id: "inverse-fixture" },
                to: { typ: "zmluvy", id: synthetic.id },
                owners: [{ typ: "objednavky", id: "inverse-fixture" }],
              },
            ],
          },
        },
      });
    return route.fulfill({
      json: {
        data: path.endsWith("/ref-fixture")
          ? { ...synthetic, cislo: "REF-OWNED", predmet: "Pomenovaná faktúra", nazov: "" }
          : { ...synthetic, suvisiace_zaznamy: [{ typ: "faktury", id: "ref-fixture" }] },
      },
    });
  });
  await page.goto(`${office}/uradnik/zmluvy/${synthetic.id}/upravit`);
  await expect(page.getByText("Upravujete zverejnený dokument")).toBeVisible();
  await expect(page.getByText("REF-OWNED · Pomenovaná faktúra")).toBeVisible();
  await page.locator("#predmet").fill("Zmenený predmet");
  await page.getByRole("link", { name: "OBJ-OWNED · Spätná objednávka" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Zostať a pokračovať" }).click();
  await expect(page.locator("#predmet")).toHaveValue("Zmenený predmet");
});
test("partial attachment save retries only remaining files on the same record and successful save bypasses unload", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  let creates = 0,
    updates = 0,
    uploads = 0;
  const filenames: string[] = [];
  await page.route("**/api/rest/v1/vzn**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === "POST") {
      if (path.endsWith("/prilohy")) {
        uploads++;
        filenames.push(
          route
            .request()
            .postDataBuffer()
            ?.toString()
            .match(/filename="([^"]+)"/)?.[1] ?? "",
        );
        if (uploads === 2)
          return route.fulfill({
            status: 503,
            json: { error: { message: "Owned upload failure" } },
          });
      } else if (path.endsWith("/update")) updates++;
      else creates++;
    }
    return route.fulfill({
      json: { data: path.endsWith("/prilohy") ? [] : { ...synthetic, zverejnene: false } },
    });
  });
  await page.goto(`${office}/uradnik/vzn/novy`);
  await page.locator("#cislo").fill("OWNED-NEW");
  await page.locator("#nazov").fill("Vlastný testovací dokument");
  await page.locator("#predmet").fill("Testovanie obnovy nahrávania");
  await page.locator("#datum_schvalenia").fill("2026-10-01");
  await page.locator("#datum_ucinnosti").fill("2026-11-01");
  await page.locator("#new-files").setInputFiles(
    ["first.pdf", longFilename].map((name) => ({
      name,
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
    })),
  );
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page.locator("#form-error")).toContainText("Záznam je uložený");
  await expect(page.getByText(longFilename, { exact: false }).last()).toContainText(
    "Nenahraté, skúste znova",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Zostať a pokračovať" }).click();
  let nativePrompts = 0;
  page.on("dialog", async (dialog) => {
    nativePrompts++;
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page).toHaveURL(new RegExp(`/uradnik/vzn/${synthetic.id}\\?`));
  await expect(page.getByRole("status").filter({ hasText: "Dokument bol uložený" })).toContainText(
    "Dokument bol uložený",
  );
  expect(creates).toBe(1);
  expect(updates).toBe(1);
  expect(filenames).toEqual(["first.pdf", longFilename, longFilename]);
  expect(nativePrompts).toBe(0);
});
test("file-only edits guard reload and logout while opening a new tab leaves work intact", async ({
  page,
}) => {
  await enter(page);
  await page.locator("#new-files").setInputFiles({
    name: "file-only.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  let prompts = 0;
  page.on("dialog", async (dialog) => {
    prompts++;
    await dialog.dismiss();
  });
  await page.locator("#cislo").click();
  const canceledReload = page.reload({ waitUntil: "commit", timeout: 1500 }).catch((error) => {
    if (!/Timeout|ERR_ABORTED/.test(String(error))) throw error;
  });
  await expect.poll(() => prompts).toBe(1);
  await canceledReload;
  const popup = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Občiansky portál", exact: true }).click();
  await (await popup).close();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  expect(await page.locator("#new-files").evaluate((e: HTMLInputElement) => e.files?.length)).toBe(
    1,
  );
  await page.getByRole("button", { name: "Opustiť demo" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Zostať a pokračovať" }).click();
  expect(prompts).toBe(1);
});
test("failed logout retains dirty guard and retryable message", async ({ page }) => {
  await enter(page);
  await page.locator("#cislo").fill("OWNED-LOGOUT");
  await page.route("**/api/demo/logout", (route) => route.fulfill({ status: 503, json: {} }));
  await page.getByRole("button", { name: "Opustiť demo" }).click();
  await page.getByRole("button", { name: "Odísť bez uloženia" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Neuložené zmeny" })).toContainText(
    "Neuložené zmeny zostali zachované",
  );
  await expect(page.locator("#cislo")).toHaveValue("OWNED-LOGOUT");
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
});
test("unavailable reference names retry honestly, without exposing UUIDs", async ({ page }) => {
  await enter(page);
  let fail = true;
  await page.route("**/api/rest/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/ref-unavailable"))
      return fail
        ? route.fulfill({
            status: 503,
            json: { error: { message: "Owned reference unavailable" } },
          })
        : route.fulfill({ json: { data: { ...synthetic, cislo: "REF-RECOVERED" } } });
    if (path.endsWith("/suvislosti"))
      return route.fulfill({ json: { data: { nodes: [], edges: [] } } });
    return route.fulfill({
      json: {
        data: { ...synthetic, suvisiace_zaznamy: [{ typ: "faktury", id: "ref-unavailable" }] },
      },
    });
  });
  await page.goto(`${office}/uradnik/zmluvy/${synthetic.id}/upravit`);
  await expect(page.getByText("Názov dokumentu nie je dostupný", { exact: true })).toBeVisible();
  await expect(page.getByText("ref-unavailable", { exact: true })).toHaveCount(0);
  fail = false;
  await page.getByRole("button", { name: "Obnoviť názvy dokumentov" }).click();
  await expect(page.getByText("REF-RECOVERED · Vlastný testovací dokument")).toBeVisible();
});
test("office dashboard fits notebook widths and keeps document actions visible", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
  for (const width of [390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${office}/uradnik/home`);
    const table = page.locator("main table");
    await expect(table.locator("tbody tr").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    expect(await table.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    const action = table.getByRole("link", { name: /^Otvoriť / }).first();
    await action.scrollIntoViewIfNeeded();
    const box = (await action.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }
});
test("clean editor exits are document boundaries and dirty forward prompts natively", async ({
  page,
}) => {
  await enter(page);
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page).toHaveURL(/uradnik\/faktury$/);
  await page.goBack();
  await expect(page.locator("#cislo")).toBeVisible();
  await page.locator("#cislo").fill("OWNED-FORWARD");
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs++;
    expect(dialog.type()).toBe("beforeunload");
    await dialog.dismiss();
  });
  const canceled = page.goForward({ waitUntil: "commit", timeout: 1500 }).catch((error) => {
    if (!/Timeout|ERR_ABORTED/.test(String(error))) throw error;
  });
  await expect.poll(() => dialogs).toBe(1);
  await canceled;
  await expect(page.locator("#cislo")).toHaveValue("OWNED-FORWARD");
  page.removeAllListeners("dialog");
  page.once("dialog", (dialog) => dialog.accept());
  await page.goForward();
  await expect(page).toHaveURL(/uradnik\/faktury$/);
});
test("published detail exposes configured public URL and early attachments; draft does not", async ({
  page,
}) => {
  await enter(page);
  let published = true;
  await page.route("**/api/rest/v1/vzn/**", (route) =>
    route.fulfill({
      json: {
        data: new URL(route.request().url()).pathname.endsWith("/prilohy")
          ? []
          : { ...synthetic, zverejnene: published },
      },
    }),
  );
  await page.goto(
    `${office}/uradnik/vzn/${synthetic.id}?returnTo=${encodeURIComponent("/uradnik/home?q=owned")}`,
  );
  await expect(page.getByRole("link", { name: "Späť na výsledky vyhľadávania" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Otvoriť verejný dokument" })).toHaveAttribute(
    "href",
    new RegExp(`^http://(?:localhost|127\\.0\\.0\\.1):3001/obcan/vzn/${synthetic.id}$`),
  );
  await expect(page.getByRole("button", { name: "Upraviť", exact: true })).toHaveCount(0);
  const attachments = await page
    .getByRole("heading", { name: "Prílohy", exact: true })
    .boundingBox();
  const fullDetails = await page
    .getByRole("heading", { name: "Ďalšie údaje dokumentu", exact: true })
    .boundingBox();
  expect(attachments!.y).toBeLessThan(fullDetails!.y);
  published = false;
  await page.reload();
  await expect(page.getByText("Koncept", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Otvoriť verejný dokument" })).toHaveCount(0);
});

for (const action of ["deleting", "unpublishing"]) {
  test(`${action} the last row on a retained office page recovers without losing filters`, async ({
    page,
  }) => {
    await enter(page);
    let deleted = false;
    await page.route("**/api/rest/v1/vzn**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/delete") || url.pathname.endsWith("/update")) {
        deleted = true;
        return route.fulfill({ json: {} });
      }
      const list = url.pathname.endsWith("/vzn");
      const pageNumber = Number(url.searchParams.get("page"));
      return route.fulfill({
        json: {
          data: list
            ? !deleted || pageNumber === 1
              ? [synthetic]
              : []
            : url.pathname.endsWith("/prilohy")
              ? []
              : { ...synthetic, zverejnene: !deleted },
          pagination: { total: deleted ? 10 : 11, total_pages: deleted ? 1 : 2 },
        },
      });
    });
    await page.goto(`${office}/uradnik/vzn?q=owned&sort=updated_at&state=true&page=2`);
    await page.getByRole("link", { name: "Otvoriť OWNED-WORKFLOW" }).click();
    if (action === "deleting") {
      await page.getByRole("button", { name: "Vymazať dokument", exact: true }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Vymazať dokument", exact: true })
        .click();
    } else {
      await page.getByRole("button", { name: "Stiahnuť zo zverejnenia", exact: true }).click();
      await expect(
        page.getByRole("status").filter({ hasText: "stiahnutý zo zverejnenia" }),
      ).toContainText("stiahnutý zo zverejnenia");
      await page.locator("main").getByRole("link", { name: "VZN", exact: true }).click();
    }
    await expect(page.getByRole("status").filter({ hasText: "10 dokumentov" })).toBeVisible();
    await expect(page.getByText("Zatiaľ tu nie sú žiadne dokumenty", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: "Prejsť na poslednú dostupnú stranu" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Prejsť na poslednú dostupnú stranu" }).click();
    await expect(page).toHaveURL(`${office}/uradnik/vzn?q=owned&sort=updated_at&state=true&page=1`);
    await expect(page.getByRole("link", { name: "Otvoriť OWNED-WORKFLOW" })).toBeVisible();
  });
}

const longFilename = `Faktura${"1234567890".repeat(10)}.pdf`;
test("long selected attachment fits mobile editor, validation and dirty confirmation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  await page.locator("#new-files").setInputFiles({
    name: longFilename,
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  await expect(page.getByText(longFilename, { exact: false }).last()).toContainText(
    "Vybrané, čaká na nahratie",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Uložiť koncept" }).click();
  await expect(page.locator("#form-error")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("link", { name: "Zrušiť", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Zostať a pokračovať" }).click();
  expect(
    await page.locator("#new-files").evaluate((e: HTMLInputElement) => e.files?.[0]?.name),
  ).toBe(longFilename);
});

test("existing and pending detail attachments keep full filenames and remove action reachable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  await page.route("**/api/rest/v1/vzn/**", (route) =>
    route.fulfill({
      json: {
        data: new URL(route.request().url()).pathname.endsWith("/prilohy")
          ? [
              {
                id: "owned-file",
                filename: longFilename,
                content_type: "application/pdf",
                size_bytes: 123,
              },
            ]
          : synthetic,
      },
    }),
  );
  await page.goto(`${office}/uradnik/vzn/${synthetic.id}`);
  const remove = page.getByRole("button", { name: `Odstrániť ${longFilename}`, exact: true });
  await expect(remove).toBeVisible();
  await remove.scrollIntoViewIfNeeded();
  const box = (await remove.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await remove.click();
  await expect(page.getByRole("alertdialog")).toContainText(longFilename);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("alertdialog").getByRole("button", { name: "Zrušiť", exact: true }).click();
  await page.locator("#attachment-upload").setInputFiles({
    name: longFilename,
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("dashboard recent ten and draft six include newest records concentrated in one agenda", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([{ name: "openobec-demo", value: "zilina", domain: "127.0.0.1", path: "/" }]);
  await page.route("**/api/rest/v1/*?*", async (route) => {
    const url = new URL(route.request().url());
    const busy = url.pathname.endsWith("/faktury");
    const records = Array.from({ length: busy ? 12 : 1 }, (_, i) => ({
      ...synthetic,
      id: `owned-recent-${i + 1}`,
      cislo: `${busy ? "NEW" : "OLD"}-${i + 1}`,
      predmet: `${busy ? "Newest" : "Older"} ${i + 1}`,
      nazov: "",
      zverejnene: url.searchParams.get("zverejnene") !== "false",
      updated_at: busy
        ? `2026-11-01T10:${String(59 - i).padStart(2, "0")}:00Z`
        : "2025-01-01T00:00:00Z",
    }));
    await route.fulfill({
      json: {
        data: records.slice(0, Number(url.searchParams.get("page_size"))),
        pagination: { total: records.length, total_pages: 1 },
      },
    });
  });
  await page.goto(`${office}/uradnik/home`);
  const rows = page.locator("main tbody tr");
  await expect(rows).toHaveCount(10);
  for (let i = 1; i <= 10; i++) await expect(rows.nth(i - 1)).toContainText(`NEW-${i}`);
  const drafts = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Pokračovať v rozpracovaných" }) })
    .getByRole("link");
  await expect(drafts).toHaveCount(6);
  for (let i = 1; i <= 6; i++) await expect(drafts.nth(i - 1)).toContainText(`NEW-${i}`);
});
