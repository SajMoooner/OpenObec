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
import {
  documentPresentation,
  safeReturnTo,
  type Agenda,
  agendaFor,
  formatDate,
  formatMoney,
  titleOf,
  type RecordNode,
} from "@openobec/api-client";
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
          <Button variant="outline" size="sm" onClick={retry} className="mt-3 min-h-11">
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
  returnTo,
  dateContext = "document",
  agenda,
}: {
  nodes: RecordNode[];
  office?: boolean;
  showAgenda?: boolean;
  returnTo?: string;
  dateContext?: "document" | "updated";
  agenda?: Agenda;
}) {
  const single =
    agenda ??
    (nodes.length && nodes.every((n) => n.typ === nodes[0].typ)
      ? agendaFor(nodes[0].typ)
      : undefined);
  const headings = single ? documentPresentation(single, {}) : undefined;
  const money = !single || !!headings?.amount;
  return (
    <Table className="table-fixed @min-[66rem]:table-auto">
      <TableHeader>
        <TableRow>
          <TableHead>Dokument</TableHead>
          {showAgenda && <TableHead className="hidden @min-[66rem]:table-cell">Agenda</TableHead>}
          {(!single || headings?.party) && (
            <TableHead className="hidden @min-[66rem]:table-cell">
              {headings?.party?.label ?? "Organizácia / stav obstarávania"}
            </TableHead>
          )}
          <TableHead className="hidden @min-[66rem]:table-cell">
            {dateContext === "updated" ? "Upravené" : (headings?.date.label ?? "Dátum dokumentu")}
          </TableHead>
          {money && (
            <TableHead className="hidden text-right @min-[66rem]:table-cell">
              {headings?.amount?.label ?? "Suma"}
            </TableHead>
          )}
          {single?.slug === "vzn" && (
            <TableHead className="hidden @min-[66rem]:table-cell">Dátum účinnosti</TableHead>
          )}
          {office && <TableHead className="hidden @min-[66rem]:table-cell">Zverejnenie</TableHead>}
          <TableHead className="w-16">
            <span className="sr-only">Detail</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map(({ typ, zaznam: r }) => {
          const presentation = documentPresentation(agendaFor(typ)!, r);
          const date =
            dateContext === "updated"
              ? { label: "Upravené", value: r.updated_at }
              : presentation.date;
          const href =
            `/${office ? "uradnik" : "obcan"}/${typ}/${r.id}` +
            (returnTo
              ? `?returnTo=${encodeURIComponent(safeReturnTo(returnTo, `/${office ? "uradnik" : "obcan"}/${typ}`))}`
              : "");
          return (
            <TableRow key={`${typ}/${r.id}`}>
              <TableCell className="whitespace-normal py-4 [overflow-wrap:anywhere] @min-[66rem]:max-w-xs">
                <Link
                  className="block min-h-11 content-center font-medium text-primary underline-offset-4 hover:underline"
                  href={href}
                >
                  {titleOf(r)}
                </Link>
                <div className="text-xs text-muted-foreground">{r.cislo}</div>
                <div className="mt-2 space-y-1 text-sm @min-[66rem]:hidden">
                  {showAgenda && <Badge variant="outline">{agendaFor(typ)?.title}</Badge>}
                  {presentation.party && (
                    <p>
                      {presentation.party.label}: {presentation.party.value}
                    </p>
                  )}
                  <p>
                    {date.label}: {formatDate(date.value)}
                  </p>
                  {presentation.secondaryDate && (
                    <p>
                      {presentation.secondaryDate.label}:{" "}
                      {formatDate(presentation.secondaryDate.value)}
                    </p>
                  )}
                  {presentation.amount && (
                    <p className="tabular-nums">
                      {presentation.amount.label}: {formatMoney(presentation.amount.value)}
                    </p>
                  )}
                  {office && <Published value={r.zverejnene} />}
                </div>
              </TableCell>
              {showAgenda && (
                <TableCell className="hidden @min-[66rem]:table-cell">
                  <Badge variant="outline">{agendaFor(typ)?.title}</Badge>
                </TableCell>
              )}
              {(!single || headings?.party) && (
                <TableCell className="hidden whitespace-normal @min-[66rem]:table-cell">
                  {!single && presentation.party && (
                    <span className="block text-xs text-muted-foreground">
                      {presentation.party.label}
                    </span>
                  )}
                  {presentation.party?.value ?? "—"}
                </TableCell>
              )}
              <TableCell className="hidden @min-[66rem]:table-cell">
                {!single && (
                  <span className="block text-xs text-muted-foreground">{date.label}</span>
                )}
                {formatDate(date.value)}
              </TableCell>
              {money && (
                <TableCell className="hidden text-right tabular-nums @min-[66rem]:table-cell">
                  {!single && presentation.amount && (
                    <span className="block text-xs text-muted-foreground">
                      {presentation.amount.label}
                    </span>
                  )}
                  {presentation.amount ? formatMoney(presentation.amount.value) : "—"}
                </TableCell>
              )}
              {single?.slug === "vzn" && (
                <TableCell className="hidden @min-[66rem]:table-cell">
                  {formatDate(presentation.secondaryDate?.value)}
                </TableCell>
              )}
              {office && (
                <TableCell className="hidden @min-[66rem]:table-cell">
                  <Published value={r.zverejnene} />
                </TableCell>
              )}
              <TableCell>
                <Button variant="ghost" size="icon" className="size-11" asChild>
                  <Link aria-label={`Otvoriť ${r.cislo}`} href={href}>
                    <ArrowRight />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function countLabel(count: number, forms: [string, string, string]): string {
  return `${count} ${forms[count === 1 ? 0 : count >= 2 && count <= 4 ? 1 : 2]}`;
}
