"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import {
  AGENDAS,
  api,
  type RecordNode,
  type DocumentRecord,
  type Pagination,
} from "@openobec/api-client";
import { Button } from "@openobec/ui/components/button";
import { Badge } from "@openobec/ui/components/badge";
import { SearchBox, RecordsTable, Loading, Failure, Empty } from "./shared";
type List = { data: (RecordNode | DocumentRecord)[]; pagination: Pagination };
export function CitizenHome({ query = "" }: { query?: string }) {
  const [q, setQ] = useState(query);
  const [committed, setCommitted] = useState(query);
  const [attempt, setAttempt] = useState(0);
  const key = useMemo(() => ({ query: committed, attempt }), [committed, attempt]);
  type Result = { typ: (typeof AGENDAS)[number]["slug"]; total: number; nodes: RecordNode[] };
  const [state, setState] = useState<{ key: typeof key; results: Result[]; errors: string[] }>();
  useEffect(() => {
    const c = new AbortController();
    const calls = AGENDAS.map(async (a) => {
      const path = `${a.slug === "vzn" ? "" : "/query"}/${a.slug}?page_size=5&zverejnene=true&q=${encodeURIComponent(key.query)}`;
      const r = await api<List>(path, { signal: c.signal });
      return {
        typ: a.slug,
        total: r.pagination.total,
        nodes: r.data.map((x) =>
          "zaznam" in x ? (x as RecordNode) : { typ: a.slug, zaznam: x as DocumentRecord },
        ),
      };
    });
    Promise.allSettled(calls).then((all) => {
      if (c.signal.aborted) return;
      setState({
        key,
        results: all.flatMap((x) => (x.status === "fulfilled" ? [x.value] : [])),
        errors: all.flatMap((x, i) => (x.status === "rejected" ? [AGENDAS[i].title] : [])),
      });
    });
    return () => c.abort();
  }, [key]);
  const current = state?.key === key ? state : undefined;
  const results = current?.results ?? [];
  const errors = current?.errors ?? [];
  const loading = !current;
  const search = () => {
    setCommitted(q.trim());
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  };
  const nodes = results
    .flatMap((r) => r.nodes)
    .sort((a, b) => b.zaznam.created_at.localeCompare(a.zaznam.created_at))
    .slice(0, 10);
  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Dokumenty mesta Žilina
        </h1>
        <p className="text-lg text-muted-foreground">
          Faktúry, zmluvy, objednávky a ďalšie dokumenty. Prehľadne na jednom mieste.
        </p>
        <SearchBox value={q} onChange={setQ} onSearch={search} />
      </section>
      <nav
        aria-label="Výber agendy"
        className="grid divide-y rounded-lg border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3"
      >
        {AGENDAS.map((a) => (
          <Link
            key={a.slug}
            href={`/obcan/${a.slug}`}
            className="flex items-center justify-between gap-4 p-5 text-sm font-medium transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex items-center gap-3">
              <FileText className="size-4 text-primary" />
              {a.title}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {committed ? `Výsledky pre „${committed}“` : "Naposledy zverejnené"}
          </h2>
          <Badge variant="outline">Ukážkové údaje</Badge>
        </div>
        {errors.length > 0 && (
          <Failure
            error={
              new Error(
                `Nie sú dostupné všetky agendy: ${errors.join(", ")}. Výsledky môžu byť neúplné.`,
              )
            }
            retry={() => setAttempt((n) => n + 1)}
          />
        )}
        {loading ? (
          <Loading />
        ) : committed ? (
          <div className="space-y-6">
            {results.map((r) => (
              <section key={r.typ} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {AGENDAS.find((a) => a.slug === r.typ)?.title}{" "}
                    <span className="text-muted-foreground">({r.total})</span>
                  </h3>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/obcan/${r.typ}?q=${encodeURIComponent(committed)}`}>
                      Všetky výsledky
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
                {r.nodes.length ? (
                  <RecordsTable nodes={r.nodes} showAgenda={false} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    V tejto agende sa nenašli žiadne zhody.
                  </p>
                )}
              </section>
            ))}
          </div>
        ) : nodes.length ? (
          <div className="rounded-lg border">
            <RecordsTable nodes={nodes} />
          </div>
        ) : !errors.length ? (
          <Empty
            title="Zatiaľ nie sú zverejnené žiadne dokumenty"
            text="Zverejnené dokumenty sa objavia po spracovaní údajov."
          />
        ) : null}
      </section>
    </div>
  );
}
