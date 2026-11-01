import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, api, loadRelated, formatMoney, inverseReferenceOwners } from "../src/index.ts";
import type { Edge, Reference } from "../src/index.ts";
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

test("unrelated procurement edits preserve the original exact deadline through payload conversion", () => {
  const original = { lehota_predkladania: "2026-10-25T00:30:45.123456Z" };
  const values = {
    cislo: "VO-EDIT",
    nazov: "Oprava",
    predmet: "Upravený predmet",
    cpv: "45000000-7",
    predpokladana_hodnota_bez_dph: "1000.00",
    stav: "otvorene",
    lehota_predkladania: "2026-10-25T02:30:45.123",
    zverejnene: false,
  };
  assert.equal(
    toWritePayload("verejne-obstaravanie", values, original).lehota_predkladania,
    "2026-10-25T00:30:45.123456Z",
  );
  assert.equal(
    toWritePayload(
      "verejne-obstaravanie",
      { ...values, lehota_predkladania: "2026-11-01T10:30:45.123" },
      original,
    ).lehota_predkladania,
    "2026-11-01T09:30:45.123Z",
  );
});

test("null error JSON uses the structured Slovak API fallback", async () => {
  await assert.rejects(
    () => api("/faktury", {}, async () => new Response("null", { status: 503 })),
    (e: unknown) =>
      e instanceof ApiError &&
      e.status === 503 &&
      e.code === "INTERNAL_ERROR" &&
      e.message === "Požiadavku sa nepodarilo dokončiť." &&
      e.details.length === 0,
  );
});
test("malformed API error details cannot escape the declared shape", async () => {
  for (const details of [
    null,
    "broken",
    {},
    [null],
    [{ field: 42, code: "REQUIRED", message: "Invalid" }],
  ]) {
    await assert.rejects(
      () =>
        api(
          "/faktury",
          {},
          async () =>
            new Response(
              JSON.stringify({
                error: {
                  code: "VALIDATION_ERROR",
                  message: "Neplatné údaje",
                  details,
                  request_id: "req_test",
                },
              }),
              { status: 422 },
            ),
        ),
      (e: unknown) =>
        e instanceof ApiError &&
        e.code === "VALIDATION_ERROR" &&
        e.message === "Neplatné údaje" &&
        e.requestId === "req_test" &&
        Array.isArray(e.details) &&
        e.details.length === 0,
    );
  }
});

test("malformed API error scalar fields use typed fallbacks", async () => {
  await assert.rejects(
    () =>
      api(
        "/faktury",
        {},
        async () =>
          new Response(JSON.stringify({ error: { code: 42, message: {}, request_id: [] } }), {
            status: 422,
          }),
      ),
    (e: unknown) =>
      e instanceof ApiError &&
      e.code === "INTERNAL_ERROR" &&
      e.message === "Požiadavku sa nepodarilo dokončiť." &&
      e.requestId === undefined,
  );
});

test("inverse owners exclude neighbor-to-neighbor claims in a triangle", () => {
  const a: Reference = { typ: "zmluvy", id: "a" };
  const b: Reference = { typ: "objednavky", id: "b" };
  const c: Reference = { typ: "faktury", id: "c" };
  const edges: Edge[] = [
    { from: a, to: b, owners: [a] },
    { from: a, to: c, owners: [a] },
    { from: b, to: c, owners: [b] },
  ];
  assert.deepEqual(inverseReferenceOwners(edges, a), []);
  assert.deepEqual(
    inverseReferenceOwners(
      [...edges, { from: b, to: a, owners: [a, b] }, { from: a, to: b, owners: [b] }],
      a,
    ),
    [b],
    "genuine incoming owners appear once for either endpoint orientation",
  );
});
