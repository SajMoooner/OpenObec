"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  agendaFor,
  type AgendaSlug,
  type RecordNode,
  type DocumentRecord,
  type Pagination,
} from "@openobec/api-client";
import { useResource } from "@openobec/ui/hooks/use-resource";
import { Button } from "@openobec/ui/components/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@openobec/ui/components/select";
import { SearchBox, RecordsTable, Loading, Failure, Empty } from "./shared";
export function DocumentList({
  agenda,
  office = false,
  initialQuery = "",
}: {
  agenda: AgendaSlug;
  office?: boolean;
  initialQuery?: string;
}) {
  const def = agendaFor(agenda)!;
  const [q, setQ] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("-created_at");
  const [state, setState] = useState(office ? "all" : "true");
  const params = new URLSearchParams({ q: query, page: String(page), page_size: "10", sort });
  if (state !== "all") params.set("zverejnene", state);
  const path = `${office || agenda === "vzn" ? "" : "/query"}/${agenda}?${params}`;
  const { data, error, loading, reload } = useResource<{
    data: (RecordNode | DocumentRecord)[];
    pagination: Pagination;
  }>(path);
  const nodes =
    data?.data.map((r) =>
      "zaznam" in r ? (r as RecordNode) : { typ: agenda, zaznam: r as DocumentRecord },
    ) ?? [];
  const change = (fn: () => void) => {
    fn();
    setPage(1);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{def.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {office
              ? "Evidencia, úprava a zverejňovanie dokumentov."
              : "Zverejnené dokumenty mesta Žilina. Údaje v tomto deme sú ukážkové."}
          </p>
        </div>
        {office && (
          <Button asChild>
            <Link href={`/uradnik/${agenda}/novy`}>
              <Plus />
              Pridať dokument
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <SearchBox value={q} onChange={setQ} onSearch={() => change(() => setQuery(q.trim()))} />
        </div>
        <div className="flex flex-wrap gap-3">
          {office && (
            <Select value={state} onValueChange={(v) => change(() => setState(v))}>
              <SelectTrigger className="h-11 w-44" aria-label="Stav zverejnenia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky stavy</SelectItem>
                <SelectItem value="false">Koncepty</SelectItem>
                <SelectItem value="true">Zverejnené</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => change(() => setSort(v))}>
            <SelectTrigger className="h-11 w-52" aria-label="Zoradenie dokumentov">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Najnovšie vytvorené</SelectItem>
              <SelectItem value="created_at">Najstaršie vytvorené</SelectItem>
              <SelectItem value="-updated_at">Naposledy upravené</SelectItem>
              <SelectItem value="updated_at">Najdávnejšie upravené</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : nodes.length ? (
        <>
          <div className="overflow-hidden rounded-lg border">
            <RecordsTable nodes={nodes} office={office} showAgenda={false} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {data?.pagination.total} {query ? "výsledkov" : "dokumentov"} · strana {page} z{" "}
              {data?.pagination.total_pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
                Predchádzajúca
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= (data?.pagination.total_pages ?? 0)}
                onClick={() => setPage((p) => p + 1)}
              >
                Nasledujúca
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Empty
          title={query ? "Nenašli sa žiadne výsledky" : "Zatiaľ tu nie sú žiadne dokumenty"}
          text={
            query
              ? "Skúste kratší výraz alebo iné číslo dokumentu."
              : office
                ? "Začnite pridaním prvého dokumentu."
                : "Zverejnené dokumenty sa zobrazia po spracovaní."
          }
        >
          {office && !query && (
            <Button asChild>
              <Link href={`/uradnik/${agenda}/novy`}>Pridať prvý dokument</Link>
            </Button>
          )}
        </Empty>
      )}
    </div>
  );
}
