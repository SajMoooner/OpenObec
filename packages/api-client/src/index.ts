import type { AgendaSlug, FieldError, Reference } from "./agendas";
export type { components, paths, operations } from "./schema";
export * from "./agendas";
export interface DocumentRecord {
  id: string;
  obec_id: string;
  cislo: string;
  predmet: string;
  nazov?: string;
  zverejnene: boolean;
  created_at: string;
  updated_at: string;
  entity_version?: number;
  suvisiace_zaznamy?: Reference[];
  [key: string]: unknown;
}
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
export interface RecordNode {
  typ: AgendaSlug;
  zaznam: DocumentRecord;
}
export interface Edge {
  from: Reference;
  to: Reference;
  owners: Reference[];
}
export function inverseReferenceOwners(edges: Edge[], root: Reference): Reference[] {
  const isRoot = (reference: Reference) => reference.typ === root.typ && reference.id === root.id;
  return edges
    .filter((edge) => isRoot(edge.from) || isRoot(edge.to))
    .flatMap((edge) =>
      edge.owners.filter((owner) => owner.typ !== root.typ || owner.id !== root.id),
    )
    .filter(
      (owner, index, all) =>
        all.findIndex((other) => other.typ === owner.typ && other.id === owner.id) === index,
    );
}
export interface Projection {
  status: "ready" | "pending";
  root_entity_version: number | null;
  as_of: string | null;
  unresolved_references_count: number | null;
}
export interface Joined {
  data: {
    root: { typ: AgendaSlug; id?: string; zaznam: DocumentRecord | null };
    suvisiace_zaznamy: RecordNode[];
    vazby: Edge[];
    pagination: {
      related_page_size: number;
      total: number | null;
      next_cursor: string | null;
      complete: boolean;
    };
  };
  projection: Projection;
}
export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  sha256: string;
  created_at: string;
}
export type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: FieldError[] = [],
    public requestId?: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
  fetcher: Fetcher = fetch,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetcher(`/api/rest/v1${path}`, { ...init, headers, cache: "no-store" });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw e;
    throw new ApiError(
      503,
      "DEPENDENCY_UNAVAILABLE",
      "Služba momentálne nie je dostupná. Skúste to znova.",
    );
  }
  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      response.ok ? 502 : response.status,
      "INVALID_RESPONSE",
      "Služba vrátila neplatnú odpoveď. Skúste to znova.",
    );
  }
  if (!response.ok) {
    const envelope = result !== null && typeof result === "object" ? result : {};
    const candidate = "error" in envelope ? envelope.error : undefined;
    const error = candidate !== null && typeof candidate === "object" ? candidate : {};
    const details =
      "details" in error && Array.isArray(error.details)
        ? error.details.filter(
            (detail): detail is FieldError =>
              detail !== null &&
              typeof detail === "object" &&
              typeof detail.field === "string" &&
              typeof detail.code === "string" &&
              typeof detail.message === "string",
          )
        : [];
    throw new ApiError(
      response.status,
      "code" in error && typeof error.code === "string" ? error.code : "INTERNAL_ERROR",
      "message" in error && typeof error.message === "string"
        ? error.message
        : "Požiadavku sa nepodarilo dokončiť.",
      details,
      "request_id" in error && typeof error.request_id === "string" ? error.request_id : undefined,
      Number(response.headers.get("Retry-After")) || undefined,
    );
  }
  return result as T;
}
export async function loadRelated(
  agenda: AgendaSlug,
  id: string,
  published: boolean,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<Joined> {
  let cursor: string | null = null;
  let result: Joined | undefined;
  const seen = new Set<string>();
  const records = new Map<string, RecordNode>();
  const edges = new Map<string, Edge>();
  do {
    const params = new URLSearchParams({ related_page_size: "100" });
    if (published) params.set("zverejnene", "true");
    if (cursor) params.set("cursor", cursor);
    const page = await api<Joined>(
      `/query/${agenda}/${encodeURIComponent(id)}?${params}`,
      { signal },
      fetcher,
    );
    result = page;
    for (const n of page.data.suvisiace_zaznamy) records.set(`${n.typ}/${n.zaznam.id}`, n);
    for (const e of page.data.vazby) {
      const key = [`${e.from.typ}/${e.from.id}`, `${e.to.typ}/${e.to.id}`].sort().join("|");
      const previous = edges.get(key);
      const owners = new Map(
        [...(previous?.owners ?? []), ...e.owners].map((o) => [`${o.typ}/${o.id}`, o]),
      );
      edges.set(key, { ...e, owners: [...owners.values()] });
    }
    cursor = page.data.pagination.next_cursor;
    if (cursor) {
      if (seen.has(cursor))
        throw new ApiError(
          502,
          "INVALID_RESPONSE",
          "Služba zopakovala stránkovanie. Obnovte prehľad.",
        );
      seen.add(cursor);
    }
  } while (cursor);
  return {
    ...result!,
    data: { ...result!.data, suvisiace_zaznamy: [...records.values()], vazby: [...edges.values()] },
  };
}
export function formatMoney(value: unknown): string {
  if (typeof value !== "string" || !/^\d+\.\d{2}$/.test(value)) return "—";
  const [whole, fraction] = value.split(".");
  return `${BigInt(whole).toLocaleString("sk-SK")},${fraction}\u00a0€`;
}
export function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value.length === 10 ? value + "T12:00:00Z" : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "medium",
    timeZone: "Europe/Bratislava",
    ...(value.length > 10 ? { timeStyle: "short" as const } : {}),
  }).format(date);
}
export function titleOf(record: DocumentRecord): string {
  return record.nazov || record.predmet || record.cislo;
}

export { localBratislavaInput, bratislavaInstant } from "./dates";
