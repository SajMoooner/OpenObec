"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AGENDAS, api, type DocumentRecord, type RecordNode } from "@openobec/api-client";
import { Button } from "@openobec/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@openobec/ui/components/dropdown-menu";
import { Loading, Failure, RecordsTable, Empty } from "./shared";
export function OfficeDashboard() {
  const [attempt, setAttempt] = useState(0);
  const key = useMemo(() => ({ attempt }), [attempt]);
  const [state, setState] = useState<{
    key: typeof key;
    rows: RecordNode[];
    counts: Record<string, number>;
    error?: Error;
  }>();
  useEffect(() => {
    const c = new AbortController();
    Promise.all(
      AGENDAS.map(async (a) => {
        const r = await api<{ data: DocumentRecord[]; pagination: { total: number } }>(
          `/${a.slug}?page_size=5&sort=-updated_at`,
          { signal: c.signal },
        );
        return {
          slug: a.slug,
          total: r.pagination.total,
          nodes: r.data.map((zaznam) => ({ typ: a.slug, zaznam })),
        };
      }),
    )
      .then((all) => {
        if (!c.signal.aborted)
          setState({
            key,
            counts: Object.fromEntries(all.map((x) => [x.slug, x.total])),
            rows: all
              .flatMap((x) => x.nodes)
              .sort((a, b) => b.zaznam.updated_at.localeCompare(a.zaznam.updated_at))
              .slice(0, 10),
          });
      })
      .catch((error) => {
        if (!c.signal.aborted) setState({ key, rows: [], counts: {}, error });
      });
    return () => c.abort();
  }, [key]);
  const current = state?.key === key ? state : undefined;
  const loading = !current;
  const error = current?.error;
  const rows = current?.rows ?? [];
  const counts = current?.counts ?? {};
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Prehľad dokumentov</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vaša evidencia a posledné zmeny na jednom mieste.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus />
              Pridať dokument
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {AGENDAS.map((a) => (
              <DropdownMenuItem key={a.slug} asChild>
                <Link href={`/uradnik/${a.slug}/novy`}>{a.singular}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={() => setAttempt((a) => a + 1)} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-3">
            {AGENDAS.map((a) => (
              <Link
                href={`/uradnik/${a.slug}`}
                key={a.slug}
                className="flex items-center justify-between gap-3 bg-background p-5 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <div>
                  <p className="text-sm text-muted-foreground">{a.title}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums">{counts[a.slug] ?? 0}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Posledné zmeny</h2>
            {rows.length ? (
              <div className="overflow-hidden rounded-lg border">
                <RecordsTable nodes={rows} office />
              </div>
            ) : (
              <Empty
                title="Pripravené na prvý dokument"
                text="Vyberte agendu a pridajte ukážkový záznam."
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
