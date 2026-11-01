"use client";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import { countLabel, SearchBox, RecordsTable, Loading, Failure, Empty } from "./shared";
export function DocumentList({
  agenda,
  office = false,
}: {
  agenda: AgendaSlug;
  office?: boolean;
  initialQuery?: string;
}) {
  const def = agendaFor(agenda)!;
  const [draft, setDraft] = useState<{ url: string; value: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.get("q") ?? "";
  const rawPage = Number(searchParams.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const sorts = ["-created_at", "created_at", "-updated_at", "updated_at"];
  const sort = sorts.includes(searchParams.get("sort") ?? "")
    ? searchParams.get("sort")!
    : "-created_at";
  const state =
    office && ["all", "true", "false"].includes(searchParams.get("state") ?? "")
      ? searchParams.get("state")!
      : office
        ? "all"
        : "true";
  const navigate = (changes: Record<string, string>) => {
    setDraft(undefined);
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    window.history.pushState(null, "", `${pathname}${next.size ? `?${next}` : ""}`);
  };
  const q = draft?.url === searchParams.toString() ? draft.value : query;
  const setQ = (value: string) => setDraft({ url: searchParams.toString(), value });
  const returnTo = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;
  const reset = () => {
    setDraft(undefined);
    window.history.pushState(null, "", pathname);
  };
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
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {agenda === "vzn" ? "Všeobecne záväzné nariadenia" : def.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {office
              ? "Evidencia, úprava a zverejňovanie dokumentov."
              : agenda === "faktury"
                ? "Odberateľské faktúry mesta Žilina. Údaje v tomto deme sú ukážkové."
                : "Zverejnené dokumenty mesta Žilina. Údaje v tomto deme sú ukážkové."}
          </p>
        </div>
        {office && (
          <Button className="min-h-11" asChild>
            <a href={`/uradnik/${agenda}/novy?returnTo=${encodeURIComponent(returnTo)}`}>
              <Plus />
              Pridať dokument
            </a>
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <SearchBox
            value={q}
            onChange={setQ}
            onSearch={() => navigate({ q: q.trim(), page: "1" })}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {office && (
            <Select value={state} onValueChange={(v) => navigate({ state: v, page: "1" })}>
              <SelectTrigger className="h-11 min-h-11 w-44" aria-label="Stav zverejnenia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky stavy</SelectItem>
                <SelectItem value="false">Koncepty</SelectItem>
                <SelectItem value="true">Zverejnené</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => navigate({ sort: v, page: "1" })}>
            <SelectTrigger className="h-11 min-h-11 w-52" aria-label="Zoradenie dokumentov">
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
      {(query || sort !== "-created_at" || (office && state !== "all")) && (
        <Button variant="outline" className="min-h-11" onClick={reset}>
          Zrušiť filtre
        </Button>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {loading
          ? "Načítavam dokumenty…"
          : error
            ? "Počet dokumentov nie je dostupný."
            : countLabel(data?.pagination.total ?? 0, ["dokument", "dokumenty", "dokumentov"])}
      </p>
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : nodes.length ? (
        <>
          <div className="overflow-hidden rounded-lg border">
            <RecordsTable
              nodes={nodes}
              agenda={def}
              office={office}
              showAgenda={false}
              returnTo={returnTo}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {countLabel(
                data?.pagination.total ?? 0,
                query
                  ? ["výsledok", "výsledky", "výsledkov"]
                  : ["dokument", "dokumenty", "dokumentov"],
              )}{" "}
              · strana {page} z {data?.pagination.total_pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={page <= 1}
                onClick={() => navigate({ page: String(page - 1) })}
              >
                <ChevronLeft />
                Predchádzajúca
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={page >= (data?.pagination.total_pages ?? 0)}
                onClick={() => navigate({ page: String(page + 1) })}
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
        ></Empty>
      )}
    </div>
  );
}
