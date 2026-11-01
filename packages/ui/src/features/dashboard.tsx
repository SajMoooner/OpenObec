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
import { Alert, AlertTitle, AlertDescription } from "@openobec/ui/components/alert";
import { Loading, RecordsTable, Empty } from "./shared";
type Dataset = { total: number; nodes: RecordNode[] };
const kinds = ["all", "draft", "published"] as const;
export function OfficeDashboard() {
  const [attempt, setAttempt] = useState(0);
  const [datasets, setDatasets] = useState<Record<string, Dataset>>({});
  const [failures, setFailures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Successful sections survive retries. Only absent/failed requests are repeated.
  useEffect(() => {
    const controller = new AbortController();
    const tasks = AGENDAS.flatMap((agenda) =>
      kinds.map((kind) => ({ agenda, kind, key: `${agenda.slug}/${kind}` })),
    ).filter(({ key }) => !datasets[key]);
    void Promise.allSettled(
      tasks.map(async ({ agenda, kind, key }) => {
        try {
          const params = new URLSearchParams({
            page_size: kind === "published" ? "1" : "5",
            sort: "-updated_at",
          });
          if (kind !== "all") params.set("zverejnene", String(kind === "published"));
          const result = await api<{ data: DocumentRecord[]; pagination: { total: number } }>(
            `/${agenda.slug}?${params}`,
            { signal: controller.signal },
          );
          if (!controller.signal.aborted) {
            setDatasets((old) => ({
              ...old,
              [key]: {
                total: result.pagination.total,
                nodes: result.data.map((zaznam) => ({ typ: agenda.slug, zaznam })),
              },
            }));
            setFailures((old) => old.filter((item) => item !== key));
          }
        } catch {
          if (!controller.signal.aborted) setFailures((old) => [...new Set([...old, key])]);
        }
      }),
    ).then(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
    // datasets is the retained cache; changing it must not abort sibling requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);
  const summaries = kinds.map((kind) => {
    const available = AGENDAS.flatMap((agenda) =>
      datasets[`${agenda.slug}/${kind}`] ? [datasets[`${agenda.slug}/${kind}`]] : [],
    );
    return {
      kind,
      total: available.reduce((sum, data) => sum + data.total, 0),
      available: available.length,
    };
  });
  const rowsFor = (kind: string, limit: number) =>
    Object.entries(datasets)
      .filter(([key]) => key.endsWith(`/${kind}`))
      .flatMap(([, data]) => data.nodes)
      .sort((a, b) => b.zaznam.updated_at.localeCompare(a.zaznam.updated_at))
      .slice(0, limit);
  const rows = rowsFor("all", 10);
  const drafts = rowsFor("draft", 6);
  const failedAgendas = useMemo(
    () => AGENDAS.filter((agenda) => failures.some((key) => key.startsWith(`${agenda.slug}/`))),
    [failures],
  );
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
            {AGENDAS.map((agenda) => (
              <DropdownMenuItem key={agenda.slug} asChild>
                <a
                  href={`/uradnik/${agenda.slug}/novy?returnTo=${encodeURIComponent("/uradnik/home")}`}
                >
                  {agenda.singular}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {loading && !Object.keys(datasets).length ? (
        <Loading />
      ) : (
        <>
          {failures.length > 0 && (
            <Alert>
              <AlertTitle>Neúplné údaje</AlertTitle>
              <AlertDescription>
                <p>
                  Nedostupné údaje: {failedAgendas.map((agenda) => agenda.title).join(", ")}. Súhrny
                  uvádzajú iba načítané agendy, dostupné dokumenty zostávajú zobrazené.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    setAttempt((n) => n + 1);
                  }}
                >
                  Obnoviť nedostupné údaje
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <dl className="grid grid-cols-1 divide-y rounded-lg border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {summaries.map(({ kind, total, available }) => (
              <div key={kind} className="p-5">
                <dt className="text-sm text-muted-foreground">
                  {kind === "all"
                    ? "Všetky dokumenty"
                    : kind === "draft"
                      ? "Koncepty"
                      : "Zverejnené"}
                </dt>
                <dd className="mt-2 text-3xl font-semibold tabular-nums">
                  {available ? total : "—"}
                </dd>
                {available < AGENDAS.length && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {available} zo {AGENDAS.length} agend · {loading ? "načítavam" : "neúplné"}
                  </p>
                )}
              </div>
            ))}
          </dl>
          <nav
            aria-label="Počty podľa agendy"
            className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {AGENDAS.map((agenda) => (
              <Link
                key={agenda.slug}
                href={`/uradnik/${agenda.slug}`}
                className="flex min-h-11 items-center justify-between gap-2 border-b py-3 text-sm hover:text-primary"
              >
                <span>{agenda.title}</span>
                <span className="flex items-center gap-3 tabular-nums">
                  {datasets[`${agenda.slug}/all`]?.total ??
                    (failures.includes(`${agenda.slug}/all`) ? "Nedostupné" : "Načítavam…")}
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </nav>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Pokračovať v rozpracovaných</h2>
            {drafts.length ? (
              <div className="divide-y rounded-lg border">
                {drafts.map(({ typ, zaznam }) => (
                  <a
                    key={`${typ}/${zaznam.id}`}
                    href={`/uradnik/${typ}/${zaznam.id}/upravit?returnTo=${encodeURIComponent("/uradnik/home")}`}
                    className="flex min-h-11 items-center justify-between gap-4 p-4 hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium">
                        {zaznam.nazov || zaznam.predmet}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {agendaForTitle(typ)} · {zaznam.cislo} · Koncept
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-primary">
                      Upraviť <ArrowRight className="ml-2 inline size-4" />
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {summaries[1].available === AGENDAS.length
                  ? "Nemáte rozpracované koncepty."
                  : "V načítaných agendách nie sú rozpracované koncepty."}
              </p>
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Posledné zmeny</h2>
            {rows.length ? (
              <div className="overflow-hidden rounded-lg border">
                <RecordsTable nodes={rows} office dateContext="updated" returnTo="/uradnik/home" />
              </div>
            ) : (
              <Empty
                title={
                  summaries[0].available === AGENDAS.length
                    ? "Pripravené na prvý dokument"
                    : "Zatiaľ nie sú načítané dokumenty"
                }
                text="Vyberte agendu a pridajte ukážkový záznam alebo obnovte nedostupné údaje."
              />
            )}
          </section>
        </>
      )}
    </>
  );
}
function agendaForTitle(slug: string) {
  return AGENDAS.find((agenda) => agenda.slug === slug)?.title;
}
