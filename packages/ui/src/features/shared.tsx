"use client";
import Link from "next/link";
import { ArrowRight, FileText, RefreshCw, Search, AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Badge } from "@openobec/ui/components/badge";
import { Alert, AlertTitle, AlertDescription } from "@openobec/ui/components/alert";
import { Skeleton } from "@openobec/ui/components/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@openobec/ui/components/table";
import { agendaFor, formatDate, formatMoney, titleOf, type RecordNode } from "@openobec/api-client";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`text-xl font-semibold tracking-tight ${light ? "text-white" : "text-foreground"}`}
    >
      Open<span className={light ? "text-white" : "text-primary"}>Obec</span>
    </span>
  );
}
export function Loading() {
  return (
    <div role="status" aria-label="Načítavam údaje" className="space-y-4 py-8">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <span className="sr-only">Načítavam údaje</span>
    </div>
  );
}
export function Failure({ error, retry }: { error: Error; retry?: () => void }) {
  return (
    <Alert variant="destructive" role="alert" className="my-6">
      <AlertCircle />
      <AlertTitle>Údaje sa nepodarilo načítať</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry} className="mt-3">
            <RefreshCw />
            Skúsiť znova
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
export function Empty({
  title = "Zatiaľ tu nie sú žiadne dokumenty",
  text = "Po pridaní sa dokumenty zobrazia na tomto mieste.",
  children,
}: {
  title?: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <FileText className="size-8 text-muted-foreground" />
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  onSearch,
  label = "Vyhľadať dokumenty",
  placeholder = "Názov, predmet alebo číslo dokumentu…",
  busy = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  label?: string;
  placeholder?: string;
  busy?: boolean;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="flex w-full gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          maxLength={200}
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pl-10"
        />
      </div>
      <Button type="submit" size="lg" disabled={busy} className="h-11">
        {busy ? <LoaderCircle className="animate-spin" /> : <Search className="sm:hidden" />}
        <span className="hidden sm:inline">Vyhľadať</span>
        <span className="sr-only sm:hidden">Vyhľadať</span>
      </Button>
    </form>
  );
}
export function Published({ value }: { value: boolean }) {
  return (
    <Badge variant={value ? "secondary" : "outline"}>{value ? "Zverejnené" : "Koncept"}</Badge>
  );
}
export function RecordsTable({
  nodes,
  office = false,
  showAgenda = true,
}: {
  nodes: RecordNode[];
  office?: boolean;
  showAgenda?: boolean;
}) {
  return (
    <Table className="table-fixed lg:table-auto">
      <TableHeader>
        <TableRow>
          <TableHead>Dokument</TableHead>
          {showAgenda && <TableHead className="hidden lg:table-cell">Agenda</TableHead>}
          <TableHead className="hidden lg:table-cell">Dátum</TableHead>
          <TableHead className="hidden text-right lg:table-cell">Suma</TableHead>
          {office && <TableHead className="hidden lg:table-cell">Stav</TableHead>}
          <TableHead className="w-12 lg:w-auto">
            <span className="sr-only">Detail</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map(({ typ, zaznam: r }) => (
          <TableRow key={`${typ}/${r.id}`}>
            <TableCell className="whitespace-normal py-4 [overflow-wrap:anywhere] lg:max-w-xs lg:[overflow-wrap:normal]">
              <Link
                className="block font-medium text-primary underline-offset-4 lg:inline hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                href={`/${office ? "uradnik" : "obcan"}/${typ}/${r.id}`}
              >
                {titleOf(r)}
              </Link>
              <div className="mt-1 text-xs text-muted-foreground">{r.cislo}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
                {showAgenda && <Badge variant="outline">{agendaFor(typ)?.title}</Badge>}
                {office && <Published value={r.zverejnene} />}
                <span className="text-muted-foreground tabular-nums">
                  <span className="sr-only">Suma: </span>
                  {formatMoney(r.suma_s_dph ?? r.predpokladana_hodnota_bez_dph)}
                </span>
              </div>
            </TableCell>
            {showAgenda && (
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{agendaFor(typ)?.title}</Badge>
              </TableCell>
            )}
            <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
              {formatDate(r.created_at)}
            </TableCell>
            <TableCell className="hidden text-right whitespace-nowrap tabular-nums lg:table-cell">
              {formatMoney(r.suma_s_dph ?? r.predpokladana_hodnota_bez_dph)}
            </TableCell>
            {office && (
              <TableCell className="hidden lg:table-cell">
                <Published value={r.zverejnene} />
              </TableCell>
            )}
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  aria-label={`Otvoriť ${r.cislo}`}
                  href={`/${office ? "uradnik" : "obcan"}/${typ}/${r.id}`}
                >
                  <ArrowRight />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
