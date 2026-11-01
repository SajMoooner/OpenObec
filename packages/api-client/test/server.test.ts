import test from "node:test";
import assert from "node:assert/strict";
import { proxyApi } from "../src/server.ts";
const base = "http://gateway.test:8080";
test("public adapter forces published filter and municipality", async () => {
  let called = false;
  const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
    called = true;
    assert.equal(new URL(String(url)).searchParams.get("zverejnene"), "true");
    assert.equal(new Headers(init?.headers).get("X-Obec-Id"), "zilina");
    return Response.json({ data: [] });
  };
  const res = await proxyApi(
    new Request("http://portal.test/api/rest/v1/query/zmluvy?zverejnene=false"),
    ["rest", "v1", "query", "zmluvy"],
    true,
    fetcher,
    base,
  );
  assert.equal(res.status, 200);
  assert.equal(called, true);
});
test("public adapter denies writes and internal routes without fetching", async () => {
  const fetcher = async () => {
    throw new Error("must not fetch");
  };
  assert.equal(
    (
      await proxyApi(
        new Request("http://portal.test/api/rest/v1/faktury", { method: "POST", body: "{}" }),
        ["rest", "v1", "faktury"],
        true,
        fetcher,
        base,
      )
    ).status,
    405,
  );
  assert.equal(
    (
      await proxyApi(
        new Request("http://portal.test/api/internal/v1/export"),
        ["internal", "v1", "export"],
        false,
        fetcher,
        base,
      )
    ).status,
    404,
  );
});
test("unpublished VZN and its file remain hidden", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return Response.json({ data: { id: "vzn_1", zverejnene: false } });
  };
  const res = await proxyApi(
    new Request("http://portal.test/api/rest/v1/vzn/vzn_1"),
    ["rest", "v1", "vzn", "vzn_1"],
    true,
    fetcher,
    base,
  );
  assert.equal(res.status, 404);
  const file = await proxyApi(
    new Request("http://portal.test/api/rest/v1/vzn/vzn_1/prilohy/file_1/download"),
    ["rest", "v1", "vzn", "vzn_1", "prilohy", "file_1", "download"],
    true,
    fetcher,
    base,
  );
  assert.equal(file.status, 404);
  assert.equal(calls, 2);
});
test("forbids encoded path traversal", async () => {
  const fetcher = async () => {
    throw new Error("must not fetch");
  };
  assert.equal(
    (
      await proxyApi(
        new Request("http://portal.test/api/rest/v1/vzn/x"),
        ["rest", "v1", "vzn", ".."],
        true,
        fetcher,
        base,
      )
    ).status,
    404,
  );
});
