"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Link2, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { agendaFor, type AgendaSlug, type Reference } from "@openobec/api-client";
import { useResource } from "@openobec/ui/hooks/use-resource";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Checkbox } from "@openobec/ui/components/checkbox";
import { Badge } from "@openobec/ui/components/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@openobec/ui/components/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@openobec/ui/components/dialog";
import { Loading, Failure } from "./shared";
interface Option extends Reference {
  cislo: string;
  label: string;
  zverejnene: boolean;
}
export function ReferencePicker({
  agenda,
  value,
  onChange,
}: {
  agenda: AgendaSlug;
  value: Reference[];
  onChange: (r: Reference[]) => void;
}) {
  const def = agendaFor(agenda)!;
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<AgendaSlug>(def.related[0]);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [labels, setLabels] = useState<Record<string, string>>({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);
  const params = new URLSearchParams({
    zdroj_typ: agenda,
    typ: target ?? "",
    q: query,
    page: String(page),
    page_size: "10",
  });
  const { data, error, loading, reload } = useResource<{
    data: Option[];
    pagination: { total_pages: number; total: number };
  }>(open ? `/vyber-zaznamov?${params}` : null);
  function toggle(option: Option) {
    const key = `${option.typ}/${option.id}`;
    setLabels((old) => ({ ...old, [key]: option.label }));
    if (value.some((r) => r.typ === option.typ && r.id === option.id))
      onChange(value.filter((r) => r.typ !== option.typ || r.id !== option.id));
    else if (value.length < 100) onChange([...value, { typ: option.typ, id: option.id }]);
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Súvisiace dokumenty</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Voliteľne vyberte dokumenty, ktoré s týmto záznamom súvisia.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <Plus />
              Vybrať dokumenty
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vybrať súvisiace dokumenty</DialogTitle>
              <DialogDescription>
                Vyberte jeden alebo viac záznamov. Najviac 100 súvislostí.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select
                value={target}
                onValueChange={(v) => {
                  setTarget(v as AgendaSlug);
                  setPage(1);
                }}
              >
                <SelectTrigger className="sm:w-56" aria-label="Cieľová agenda">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {def.related.map((t) => (
                    <SelectItem key={t} value={t}>
                      {agendaFor(t)?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="search"
                aria-label="Vyhľadať súvisiaci dokument"
                placeholder="Číslo, názov alebo predmet…"
                maxLength={200}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <Loading />
              ) : error ? (
                <Failure error={error} retry={reload} />
              ) : data?.data.length ? (
                <ul className="divide-y">
                  {data.data.map((option) => {
                    const checked = value.some((r) => r.typ === option.typ && r.id === option.id);
                    return (
                      <li key={`${option.typ}/${option.id}`}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-accent">
                          <Checkbox
                            checked={checked}
                            disabled={!checked && value.length >= 100}
                            onCheckedChange={() => toggle(option)}
                            aria-label={`Vybrať ${option.cislo}`}
                          />
                          <span className="min-w-0 text-sm">
                            <span className="block font-medium">{option.label}</span>
                            <span className="mt-1 block text-muted-foreground">
                              {option.zverejnene ? "Zverejnené" : "Koncept"}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Žiadne zodpovedajúce dokumenty.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <span className="text-sm text-muted-foreground">Vybrané: {value.length} / 100</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Predchádzajúce možnosti"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Nasledujúce možnosti"
                  disabled={page >= (data?.pagination.total_pages ?? 0)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight />
                </Button>
                <Button type="button" onClick={() => setOpen(false)}>
                  Hotovo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {value.length ? (
        <ul className="space-y-2">
          {value.map((r) => (
            <li key={`${r.typ}/${r.id}`} className="flex items-center gap-3 rounded-md border p-3">
              <Link2 className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="break-all text-sm">{labels[`${r.typ}/${r.id}`] ?? r.id}</p>
                <Badge variant="outline" className="mt-1">
                  {agendaFor(r.typ)?.title}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Odobrať súvislosť ${r.id}`}
                onClick={() => onChange(value.filter((x) => x.typ !== r.typ || x.id !== r.id))}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nie sú vybrané žiadne súvislosti. Dokument môžete uložiť aj samostatne.
        </p>
      )}
    </section>
  );
}
export function InverseLinks({ agenda, id }: { agenda: AgendaSlug; id: string }) {
  const { data, error } = useResource<{
    data: { nodes: Option[]; edges: { from: Reference; to: Reference; owners: Reference[] }[] };
  }>(`/${agenda}/${id}/suvislosti?hlbka=1`);
  const inverse =
    data?.data.edges
      .flatMap((e) => e.owners.filter((o) => o.typ !== agenda || o.id !== id))
      .filter((r, i, all) => all.findIndex((x) => x.typ === r.typ && x.id === r.id) === i) ?? [];
  if (error)
    return (
      <p className="text-sm text-muted-foreground">
        Spätné súvislosti teraz nie je možné načítať. Vlastné odkazy môžete upraviť.
      </p>
    );
  if (!inverse.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Spätné súvislosti</h2>
      <p className="text-sm text-muted-foreground">
        Tieto odkazy spravujú iné dokumenty. Ich zmenu vykonajte pri príslušnom dokumente.
      </p>
      <ul className="space-y-2">
        {inverse.map((r) => (
          <li key={`${r.typ}/${r.id}`}>
            <Link
              className="text-sm text-primary underline-offset-4 hover:underline"
              href={`/uradnik/${r.typ}/${r.id}/upravit`}
            >
              {data?.data.nodes.find((n) => n.typ === r.typ && n.id === r.id)?.label ??
                `${agendaFor(r.typ)?.title} · ${r.id}`}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
