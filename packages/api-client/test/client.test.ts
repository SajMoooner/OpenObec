import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, api, loadRelated, formatMoney } from "../src/index.ts";
import { AGENDAS, toWritePayload } from "../src/agendas.ts";

test("preserves structured server errors", async () => {
  const fetcher = async () =>
    new Response(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Neplatné údaje",
          details: [{ field: "cislo", code: "REQUIRED", message: "Vyplňte číslo" }],
          request_id: "req_test",
        },
      }),
      { status: 422 },
    );
  await assert.rejects(
    () => api("/faktury", {}, fetcher),
    (e: unknown) =>
      e instanceof ApiError &&
      e.status === 422 &&
      e.details[0].field === "cislo" &&
      e.requestId === "req_test",
  );
});
test("combines related pages and deduplicates the repeated root/edges", async () => {
  let calls = 0;
  const fetcher = async (url: string | URL | Request) => {
    calls++;
    const cursor = String(url).includes("cursor=");
    return new Response(
      JSON.stringify({
        data: {
          root: { typ: "zmluvy", zaznam: { id: "zml_1", cislo: "Z1" } },
          suvisiace_zaznamy: cursor
            ? [{ typ: "objednavky", zaznam: { id: "obj_2" } }]
            : [{ typ: "objednavky", zaznam: { id: "obj_1" } }],
          vazby: [
            {
              from: { typ: "zmluvy", id: "zml_1" },
              to: { typ: "objednavky", id: "obj_1" },
              owners: [{ typ: "zmluvy", id: "zml_1" }],
            },
          ],
          pagination: {
            related_page_size: 1,
            total: 2,
            next_cursor: cursor ? null : "page2",
            complete: cursor,
          },
        },
        projection: { status: "ready" },
      }),
      { status: 200 },
    );
  };
  const result = await loadRelated("zmluvy", "zml_1", true, undefined, fetcher);
  assert.equal(calls, 2);
  assert.equal(result.data.suvisiace_zaznamy.length, 2);
  assert.equal(result.data.vazby.length, 1);
  assert.equal(result.data.pagination.complete, true);
});
test("repeated cursor fails instead of an endless network loop", async () => {
  const fetcher = async () =>
    new Response(
      JSON.stringify({
        data: {
          root: { typ: "zmluvy", zaznam: { id: "1" } },
          suvisiace_zaznamy: [],
          vazby: [],
          pagination: { next_cursor: "same", complete: false },
        },
        projection: { status: "ready" },
      }),
    );
  await assert.rejects(() => loadRelated("zmluvy", "1", true, undefined, fetcher), /stránkovan/);
});
test("formats exact money without losing large decimal digits", () => {
  assert.equal(formatMoney("9007199254740993.25"), "9 007 199 254 740 993,25 €");
});
test("write payload excludes server fields and emits optional date null", () => {
  const value = toWritePayload("objednavky", {
    id: "do-not-send",
    obec_id: "zilina",
    cislo: "OBJ-1",
    predmet: "Služby",
    dodavatel: { nazov: "Ukážkový dodávateľ", ico: "" },
    datum_objednania: "2026-11-01",
    termin_dodania: "",
    suma_s_dph: "123,00",
    mena: "EUR",
    zverejnene: false,
    suvisiace_zaznamy: [],
  });
  assert.equal(value.id, undefined);
  assert.equal(value.termin_dodania, null);
  assert.equal(value.suma_s_dph, "123.00");
  assert.deepEqual(value.dodavatel, { nazov: "Ukážkový dodávateľ", ico: null });
});
test("six explicit agendas preserve customer versus supplier", () => {
  assert.equal(AGENDAS.length, 6);
  assert.equal(AGENDAS.find((x) => x.slug === "faktury")?.party, "odberatel");
  assert.equal(AGENDAS.find((x) => x.slug === "dodavatelske-faktury")?.party, "dodavatel");
});
