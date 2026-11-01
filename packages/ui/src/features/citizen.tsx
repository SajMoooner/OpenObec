"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Receipt, Files, FileText, ShoppingBag, Gavel, BookOpen } from "lucide-react";
import {
  AGENDAS,
  api,
  type RecordNode,
  type DocumentRecord,
  type Pagination,
} from "@openobec/api-client";
import { Button } from "@openobec/ui/components/button";
import { Badge } from "@openobec/ui/components/badge";
import { countLabel, SearchBox, RecordsTable, Loading, Failure, Empty } from "./shared";
type List = { data: (RecordNode | DocumentRecord)[]; pagination: Pagination };
export function CitizenHome({}: { query?: string }) {
  const searchParams = useSearchParams();
  const committed = searchParams.get("q") ?? "";
  const [draft, setDraft] = useState<{ url: string; value: string }>();
  const q = draft?.url === searchParams.toString() ? draft.value : committed;
  const setQ = (value: string) => setDraft({ url: searchParams.toString(), value });
  const [attempt, setAttempt] = useState(0);
  const key = useMemo(() => ({ query: committed, attempt }), [committed, attempt]);
  type Result = { typ: (typeof AGENDAS)[number]["slug"]; total: number; nodes: RecordNode[] };
  const [state, setState] = useState<{ key: typeof key; results: Result[]; errors: string[] }>();
  useEffect(() => {
    const c = new AbortController();
    const calls = AGENDAS.map(async (a) => {
      const path = `${a.slug === "vzn" ? "" : "/query"}/${a.slug}?page_size=${key.query ? 5 : 10}&sort=-created_at&zverejnene=true&q=${encodeURIComponent(key.query)}`;
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
    setDraft(undefined);
    const url = new URL(window.location.href);
    if (q.trim()) url.searchParams.set("q", q.trim());
    else url.searchParams.delete("q");
    window.history.pushState(null, "", url);
  };
  const nodes = results
    .flatMap((r) => r.nodes)
    .sort((a, b) => b.zaznam.created_at.localeCompare(a.zaznam.created_at))
    .slice(0, 10);
  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-lg bg-accent p-5 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-3xl">
          Dokumenty mesta Žilina
        </h1>
        <p className="text-lg text-muted-foreground">
          Faktúry, zmluvy, objednávky a ďalšie dokumenty. Prehľadne na jednom mieste.
        </p>
        <div className="max-w-3xl">
          <SearchBox value={q} onChange={setQ} onSearch={search} />
        </div>
        <p className="text-sm text-muted-foreground">
          Skúste napríklad: knižnice, stromov, osvetlenia.
        </p>
        {committed && (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => {
              setDraft(undefined);
              window.history.pushState(null, "", "/obcan/home");
            }}
          >
            Zrušiť vyhľadávanie
          </Button>
        )}
      </section>
      {!committed && (
        <nav
          aria-label="Výber agendy"
          className="grid divide-y rounded-lg border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3"
        >
          {AGENDAS.map((a, i) => {
            const Icon = [Receipt, Files, FileText, ShoppingBag, Gavel, BookOpen][i];
            return (
              <Link
                key={a.slug}
                onNavigate={() => window.scrollTo(0, 0)}
                href={`/obcan/${a.slug}`}
                className="flex items-center justify-between gap-4 p-5 text-sm font-medium transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-5 shrink-0 text-primary" />
                  <span>
                    {a.slug === "vzn" ? "Všeobecne záväzné nariadenia" : a.title}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {
                        [
                          "Odberatelia, vystavené faktúry a sumy.",
                          "Dodávatelia a prijaté faktúry.",
                          "Zmluvné strany, sumy a účinnosť.",
                          "Objednané služby a dodávky.",
                          "Zákazky, lehoty a priebeh obstarávania.",
                          "Schválenie a účinnosť nariadení.",
                        ][i]
                      }
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </nav>
      )}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {committed ? `Výsledky pre „${committed}“` : "Najnovšie dokumenty"}
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
            <p role="status" className="text-sm">
              Spolu{" "}
              {countLabel(
                results.reduce((sum, r) => sum + r.total, 0),
                ["výsledok", "výsledky", "výsledkov"],
              )}
              {errors.length ? " v dostupných agendách" : ""}.
            </p>
            {results
              .filter((r) => r.total > 0)
              .map((r) => (
                <section key={r.typ} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {AGENDAS.find((a) => a.slug === r.typ)?.title}{" "}
                      <span className="text-muted-foreground">({r.total})</span>
                    </h3>
                    <Button variant="link" className="min-h-11" size="sm" asChild>
                      <Link
                        onNavigate={() => window.scrollTo(0, 0)}
                        href={`/obcan/${r.typ}?q=${encodeURIComponent(committed)}`}
                      >
                        Všetky výsledky
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                  {r.nodes.length ? (
                    <RecordsTable
                      nodes={r.nodes}
                      showAgenda={false}
                      returnTo={`/obcan/home?q=${encodeURIComponent(committed)}`}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      V tejto agende sa nenašli žiadne zhody.
                    </p>
                  )}
                </section>
              ))}
            {results.some((r) => !r.total) && (
              <p className="text-sm text-muted-foreground">
                Bez zhody:{" "}
                {results
                  .filter((r) => !r.total)
                  .map((r) => AGENDAS.find((a) => a.slug === r.typ)?.title)
                  .join(", ")}
                .
              </p>
            )}
          </div>
        ) : nodes.length ? (
          <div className="rounded-lg border">
            <RecordsTable nodes={nodes} returnTo="/obcan/home" />
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
