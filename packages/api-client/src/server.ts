import type { Fetcher } from "./index";
import { AGENDAS } from "./agendas";
const agendas = new Set(AGENDAS.map((a) => a.slug as string));
function failure(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message, details: [], request_id: crypto.randomUUID() } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
function allowed(parts: string[], method: string): boolean {
  if (
    parts[0] !== "rest" ||
    parts[1] !== "v1" ||
    parts.some((x) => !x || x.length > 200 || x === "." || x === ".." || /[\\/\0]/.test(x))
  )
    return false;
  const p = parts.slice(2);
  if (p[0] === "query")
    return (
      method === "GET" && agendas.has(p[1]) && p[1] !== "vzn" && (p.length === 2 || p.length === 3)
    );
  if (p[0] === "vyber-zaznamov") return method === "GET" && p.length === 1;
  if (!agendas.has(p[0])) return false;
  if (p.length === 1) return method === "GET" || method === "POST";
  if (p.length === 2) return method === "GET";
  if (p.length === 3) {
    if (p[2] === "update" || p[2] === "delete") return method === "POST";
    if (p[2] === "suvislosti") return method === "GET" && p[0] !== "vzn";
    if (p[2] === "prilohy") return method === "GET" || method === "POST";
  }
  return (
    p.length === 5 &&
    p[2] === "prilohy" &&
    ((p[4] === "download" && method === "GET") || (p[4] === "delete" && method === "POST"))
  );
}
export async function proxyApi(
  request: Request,
  parts: string[],
  publicOnly: boolean,
  fetcher: Fetcher = fetch,
  base = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8080",
): Promise<Response> {
  if (publicOnly && request.method !== "GET")
    return failure(405, "METHOD_NOT_ALLOWED", "Občiansky portál poskytuje iba čítanie dokumentov.");
  if (!allowed(parts, request.method))
    return failure(404, "NOT_FOUND", "Požadovaná operácia neexistuje.");
  const p = parts.slice(2);
  const attachment = agendas.has(p[0]) && p[2] === "prilohy";
  if (publicOnly && agendas.has(p[0]) && p[0] !== "vzn" && !attachment && p[2] !== "suvislosti")
    return failure(404, "NOT_FOUND", "Použite verejný prehľad dokumentov.");
  const url = new URL("/" + parts.map(encodeURIComponent).join("/"), base);
  url.search = new URL(request.url).search;
  const headers = new Headers({
    "X-Obec-Id": "zilina",
    Accept: request.headers.get("Accept") ?? "application/json",
  });
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  try {
    if (publicOnly && (attachment || (p[0] === "vzn" && p.length === 2))) {
      const parent = await fetcher(
        new URL(`/rest/v1/${encodeURIComponent(p[0])}/${encodeURIComponent(p[1])}`, base),
        { headers, cache: "no-store", signal: AbortSignal.timeout(15000) },
      );
      if (!parent.ok) {
        if (parent.status === 404) return failure(404, "NOT_FOUND", "Dokument nebol nájdený.");
        return failure(
          503,
          "DEPENDENCY_UNAVAILABLE",
          "Dokument teraz nie je možné overiť. Skúste to znova.",
        );
      }
      const data = (await parent.json()) as { data?: { zverejnene?: boolean } };
      if (data.data?.zverejnene !== true)
        return failure(404, "NOT_FOUND", "Dokument nebol nájdený.");
    }
    if (publicOnly && !attachment && !(p[0] === "vzn" && p.length === 2))
      url.searchParams.set("zverejnene", "true");
    const init: RequestInit & { duplex?: "half" } = {
      method: request.method,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    };
    if (request.method === "POST" && request.body) {
      init.body = request.body;
      init.duplex = "half";
    }
    const upstream = await fetcher(url, init);
    const outHeaders = new Headers({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    for (const k of [
      "Content-Type",
      "Content-Disposition",
      "Content-Length",
      "ETag",
      "Retry-After",
      "X-Request-Id",
      "Location",
    ]) {
      const value = upstream.headers.get(k);
      if (value) outHeaders.set(k, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: outHeaders });
  } catch {
    return failure(
      503,
      "DEPENDENCY_UNAVAILABLE",
      "Služba momentálne nie je dostupná. Skúste to znova.",
    );
  }
}
export function publicLinks() {
  return {
    marketing: process.env.MARKETING_PUBLIC_URL ?? "http://localhost:3000",
    citizen: process.env.CITIZEN_PUBLIC_URL ?? "http://localhost:3001",
    office: process.env.OFFICE_PUBLIC_URL ?? "http://localhost:3002",
  };
}
