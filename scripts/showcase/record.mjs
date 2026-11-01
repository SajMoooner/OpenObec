// Real local UI recording. Run the PDF skill's create marker once before authoring.
// Every run creates a NEW owned record; it never updates or deletes existing records.
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
const office = "http://127.0.0.1:3002",
  citizen = "http://127.0.0.1:3001";
const output = path.resolve(process.env.SHOWCASE_OUTPUT ?? "docs/media/showcase");
const run = new Date().toISOString().replace(/[:.]/g, "-");
const evidence = path.resolve(`docs/reviews/2026-11-01-portal-refinement/showcase/${run}`);
await mkdir(evidence, { recursive: true });
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: evidence, size: { width: 1280, height: 800 } },
  locale: "sk-SK",
  timezoneId: "Europe/Bratislava",
});
const recordingStartedAt = Date.now();
const page = await context.newPage();
const api = context.request;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const stages = [];
let start;
async function hold(name, ms) {
  stages.push({ name, seconds: (Date.now() - recordingStartedAt) / 1000 });
  await page.screenshot({ path: path.join(evidence, `${name}.png`) });
  await page.waitForTimeout(ms);
}
async function json(url) {
  const response = await api.get(url);
  if (!response.ok()) throw new Error(`${response.status()} ${url}`);
  return response.json();
}
try {
  // Check source, including unpublished invoices; never adopt a record by its number.
  const previousNumbers = new Set();
  try {
    for (const attempt of JSON.parse(
      await readFile(path.join(path.dirname(evidence), "attempts.json"), "utf8"),
    ))
      previousNumbers.add(attempt.number);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  for (const entry of await readdir(path.dirname(evidence), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      previousNumbers.add(
        JSON.parse(
          await readFile(path.join(path.dirname(evidence), entry.name, "invoice.json"), "utf8"),
        ).cislo,
      );
    } catch {
      /* No prepared payload in interrupted preflight. */
    }
  }
  let number;
  for (let n = 53; n < 1000; n++) {
    const candidate = `FV/2026/${String(n).padStart(4, "0")}`;
    if (previousNumbers.has(candidate)) continue;
    const result = await json(`${office}/api/rest/v1/faktury?q=${encodeURIComponent(candidate)}`);
    if (result.pagination.total === 0) {
      number = candidate;
      break;
    }
  }
  if (!number) throw new Error("No unused invoice number");
  const payload = {
    cislo: number,
    predmet: "Prenájom sály na komunitné podujatie",
    odberatel: { nazov: "Spolok Rodinná lúka" },
    datum_vystavenia: "2026-11-02",
    datum_splatnosti: "2026-12-02",
    suma_bez_dph: "245.50",
    suma_dph: "56.47",
    suma_s_dph: "301.97",
    mena: "EUR",
    zverejnene: true,
  };
  const payloadPath = path.join(evidence, "invoice.json");
  const pdf = path.join(evidence, `faktura-${number.split("/").at(-1)}.pdf`);
  await writeFile(payloadPath, JSON.stringify(payload, null, 2) + "\n");
  execFileSync(
    process.env.PDF_PYTHON ??
      "/Users/simonochotnicky/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
    [
      "scripts/seed/generate_pdfs.py",
      "--agenda",
      "faktury",
      "--payload",
      payloadPath,
      "--output",
      pdf,
    ],
  );
  await writeFile(
    path.join(evidence, "ownership.json"),
    JSON.stringify(
      {
        owner: "OpenObec Task 5 publication showcase",
        run,
        number,
        payload,
        createdId: null,
        cleanup:
          "Keep published: linked by provenance. Delete only the exact createdId after verifying this payload and PDF hash; never touch seed records.",
      },
      null,
      2,
    ),
  );
  start = Date.now();
  await page.goto(`${office}/uradnik/prihlasenie`);
  await hold("01-entry", 1800);
  await page.getByRole("button", { name: "Vstúpiť do dema" }).click();
  await expect(page.getByRole("heading", { name: "Prehľad dokumentov" })).toBeVisible();
  await page.getByRole("link", { name: "Faktúry", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Faktúry", exact: true })).toBeVisible();
  await hold("02-invoices", 1400);
  await page.getByRole("link", { name: /Pridať/ }).click();
  await page.locator("#cislo").pressSequentially(number, { delay: 70 });
  await page.locator("#predmet").pressSequentially(payload.predmet, { delay: 45 });
  for (const id of ["suma_bez_dph", "suma_dph", "suma_s_dph"]) {
    await page
      .locator(`[id="${id}"]`)
      .pressSequentially(payload[id].replace(".", ","), { delay: 80 });
  }
  await page.locator("#cislo").scrollIntoViewIfNeeded();
  await hold("03-invoice-fields", 2500);
  await page.locator("#datum_vystavenia").fill(payload.datum_vystavenia);
  await page.locator("#datum_splatnosti").fill(payload.datum_splatnosti);
  await page
    .locator('[id="odberatel.nazov"]')
    .pressSequentially(payload.odberatel.nazov, { delay: 45 });
  await hold("03b-dates-customer", 2000);
  await page.locator("#new-files").setInputFiles(pdf);
  await page.locator("#new-files").scrollIntoViewIfNeeded();
  await hold("04-pdf-upload", 3000);
  const created = page.waitForResponse(
    (r) => r.url() === `${office}/api/rest/v1/faktury` && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Uložiť a zverejniť", exact: true }).click();
  const createdResponse = await created;
  const createdBody = await createdResponse.json();
  if (!createdResponse.ok()) throw new Error(JSON.stringify(createdBody));
  const id = createdBody.data.id;
  await writeFile(
    path.join(evidence, "ownership.json"),
    JSON.stringify(
      {
        owner: "OpenObec Task 5 publication showcase",
        run,
        number,
        payload,
        createdId: id,
        pdfSha256: hash(await readFile(pdf)),
        cleanup:
          "Keep published. Only this createdId is owned by this recording; never modify any seed record.",
      },
      null,
      2,
    ),
  );
  await expect(page).toHaveURL(new RegExp(`/uradnik/faktury/${id}\\?returnTo=`));
  await expect(page.getByText("Zverejnené", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: path.basename(pdf), exact: true })).toBeVisible();
  await hold("05-published", 3000);
  await page.goto(`${citizen}/obcan/home`);
  await page.getByRole("searchbox").fill(number);
  await page.getByRole("button", { name: "Vyhľadať", exact: true }).click();
  await expect(page.getByRole("link", { name: payload.predmet, exact: true })).toBeVisible({
    timeout: 15000,
  });
  await hold("06-public-search", 2700);
  await page.getByRole("link", { name: payload.predmet, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: payload.predmet })).toBeVisible();
  const link = page.getByRole("link", { name: path.basename(pdf), exact: true });
  await expect(link).toBeVisible();
  await hold("07-public-detail", 3200);
  const downloadEvent = page.waitForEvent("download");
  await link.click();
  const download = await downloadEvent;
  const downloaded = await readFile(await download.path());
  const source = await json(`${office}/api/rest/v1/faktury/${id}`);
  const publicRecord = await json(`${citizen}/api/rest/v1/query/faktury/${id}?zverejnene=true`);
  const attachments = await json(`${office}/api/rest/v1/faktury/${id}/prilohy`);
  const attachment = attachments.data.find(
    (f) => f.nazov === path.basename(pdf) || f.filename === path.basename(pdf),
  );
  if (!attachment) throw new Error("Matching source PDF metadata missing");
  const sourceBytes = await (
    await api.get(`${office}/api/rest/v1/faktury/${id}/prilohy/${attachment.id}/download`)
  ).body();
  if (hash(downloaded) !== hash(await readFile(pdf)) || hash(sourceBytes) !== hash(downloaded))
    throw new Error("PDF hash mismatch");
  const publicInvoice = publicRecord.data.root.zaznam;
  const publicId = publicInvoice.id;
  if (
    source.data.odberatel.nazov !== payload.odberatel.nazov ||
    publicInvoice.odberatel.nazov !== payload.odberatel.nazov
  )
    throw new Error("Customer mismatch");
  if (
    publicRecord.projection.status !== "ready" ||
    publicRecord.projection.root_entity_version !== source.data.entity_version
  )
    throw new Error("Projection not caught up");
  for (const key of [
    "cislo",
    "predmet",
    "datum_vystavenia",
    "datum_splatnosti",
    "suma_bez_dph",
    "suma_dph",
    "suma_s_dph",
    "mena",
    "zverejnene",
  ]) {
    if (source.data[key] !== payload[key] || publicInvoice[key] !== payload[key])
      throw new Error(`Field mismatch: ${key}`);
  }
  if (publicId !== id || source.data.id !== id) throw new Error("Source/public identity mismatch");
  await writeFile(
    path.join(evidence, "proof.json"),
    JSON.stringify(
      {
        id,
        source,
        publicRecord,
        attachments,
        sourcePdfSha256: hash(sourceBytes),
        publicPdfSha256: hash(downloaded),
        fixturePdfSha256: hash(await readFile(pdf)),
        citizenUrl: page.url(),
        stages,
        elapsedSeconds: (Date.now() - start) / 1000,
      },
      null,
      2,
    ) + "\n",
  );
  await page.waitForTimeout(Math.max(1500, 36000 - (Date.now() - start)));
  const video = page.video();
  await context.close();
  await video.saveAs(path.join(output, "publication.webm"));
  await video.delete();
  await browser.close();
  execFileSync("sips", [
    "-s",
    "format",
    "jpeg",
    path.join(evidence, "03-invoice-fields.png"),
    "--out",
    path.join(output, "poster.jpg"),
  ]);
  const time = (seconds) => new Date(Math.round(seconds * 1000)).toISOString().slice(11, 23);
  const at = (name) => stages.find((stage) => stage.name === name).seconds;
  const cues = [
    [0, at("02-invoices"), "Úradník vstúpi do pracovného dema."],
    [at("02-invoices"), at("02-invoices") + 1.4, "Otvorí agendu Faktúry a pridá dokument."],
    [
      at("02-invoices") + 1.4,
      at("03-invoice-fields") + 2.5,
      "Vyplní číslo, predmet a presné sumy faktúry.",
    ],
    [at("03-invoice-fields") + 2.5, at("04-pdf-upload"), "Doplní dátumy a odberateľa."],
    [at("04-pdf-upload"), at("05-published"), "Priloží PDF s rovnakým číslom a údajmi."],
    [at("05-published"), at("06-public-search"), "Uloží a zverejní faktúru aj prílohu."],
    [at("06-public-search"), at("07-public-detail"), "Občan vyhľadá faktúru podľa čísla."],
    [at("07-public-detail"), 45, "Otvorí ten istý zverejnený dokument a stiahne rovnaké PDF."],
  ];
  await writeFile(
    path.join(output, "captions.sk.vtt"),
    "WEBVTT\n\n" +
      cues.map(([from, to, text]) => `${time(from)} --> ${time(to)}\n${text}\n`).join("\n"),
  );
  console.log(JSON.stringify({ evidence, output, id, number, stages }, null, 2));
} catch (error) {
  await context.close();
  await browser.close();
  throw error;
}
