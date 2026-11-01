import test from "node:test";
import assert from "node:assert/strict";
import { agendaFor, documentPresentation, safeReturnTo } from "../src/index.ts";
test("agenda presentation uses document semantics and preserves exact values", () => {
  const p = (slug: string, data: Record<string, unknown> = {}) =>
    documentPresentation(agendaFor(slug)!, data);
  assert.deepEqual(
    p("faktury", { odberatel: { nazov: "Mesto" }, datum_vystavenia: "2026-01-01" }).party,
    { label: "Odberateľ", value: "Mesto" },
  );
  assert.equal(p("dodavatelske-faktury").party?.label, "Dodávateľ");
  assert.equal(p("faktury").date.label, "Dátum vystavenia");
  assert.equal(p("zmluvy").date.label, "Dátum účinnosti");
  assert.equal(p("objednavky").date.label, "Dátum objednania");
  assert.equal(
    p("verejne-obstaravanie", { predpokladana_hodnota_bez_dph: "99999999999999.99" }).amount?.value,
    "99999999999999.99",
  );
  assert.equal(p("verejne-obstaravanie").amount?.label, "Predpokladaná hodnota bez DPH");
  assert.equal(p("verejne-obstaravanie").date.label, "Lehota predkladania ponúk");
  assert.equal(p("verejne-obstaravanie", { stav: "otvorene" }).party?.value, "Otvorené");
  assert.equal(p("vzn").amount, undefined);
  assert.equal(p("vzn").secondaryDate?.label, "Dátum účinnosti");
  assert.equal(p("faktury").party?.value, "—");
  assert.equal(p("faktury").date.value, undefined);
});
test("return context only accepts same portal list and home paths", () => {
  const fallback = "/obcan/zmluvy";
  assert.equal(safeReturnTo("/obcan/home?q=park", fallback), "/obcan/home?q=park");
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/uradnik/home",
    "/obcan/zmluvy/123",
    "/obcan/../home",
    "/obcan/%2e%2e/home",
    "/obcan/zmluvy#x",
    "/obcan/zmluvy?q=%ZZ",
    "/obcan\\home",
  ])
    assert.equal(safeReturnTo(value, fallback), fallback, value);
});
