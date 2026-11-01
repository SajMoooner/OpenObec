"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Globe, EyeOff, Trash2, RefreshCw } from "lucide-react";
import {
  safeReturnTo,
  agendaFor,
  api,
  loadRelated,
  formatDate,
  formatMoney,
  titleOf,
  type AgendaSlug,
  type DocumentRecord,
  type Joined,
  type RecordNode,
} from "@openobec/api-client";
import { useResource } from "@openobec/ui/hooks/use-resource";
import { Button } from "@openobec/ui/components/button";
import { Badge } from "@openobec/ui/components/badge";
import { Separator } from "@openobec/ui/components/separator";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@openobec/ui/components/accordion";
import { Alert, AlertTitle, AlertDescription } from "@openobec/ui/components/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@openobec/ui/components/alert-dialog";
import { Loading, Failure, Published } from "./shared";
import { Attachments } from "./attachments";
export function RecordFields({ agenda, record }: { agenda: AgendaSlug; record: DocumentRecord }) {
  const def = agendaFor(agenda)!;
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {def.fields.map((f) => (
        <div key={f.key} className={f.kind === "textarea" ? "sm:col-span-2" : ""}>
          <dt className="mb-1 text-sm text-muted-foreground">{f.label}</dt>
          <dd className="break-words whitespace-pre-wrap text-sm leading-6">
            {record[f.key] == null
              ? "Neurčené"
              : f.kind === "money"
                ? formatMoney(record[f.key])
                : f.kind === "date" || f.kind === "datetime"
                  ? formatDate(record[f.key])
                  : (f.options?.find((x) => x.value === record[f.key])?.label ??
                    String(record[f.key]))}
          </dd>
        </div>
      ))}
      {def.party && (
        <div className="sm:col-span-2">
          <dt className="mb-1 text-sm text-muted-foreground">{def.partyLabel}</dt>
          <dd className="text-sm leading-6">
            {String((record[def.party] as Record<string, unknown>)?.nazov ?? "—")}
            <span className="ml-3 text-muted-foreground">
              IČO: {String((record[def.party] as Record<string, unknown>)?.ico ?? "neuvedené")}
            </span>
          </dd>
        </div>
      )}
    </dl>
  );
}
function useJoined(agenda: AgendaSlug, id: string, publicOnly: boolean) {
  const [attempt, setAttempt] = useState(0);
  const key = useMemo(
    () => ({ agenda, id, publicOnly, attempt }),
    [agenda, id, publicOnly, attempt],
  );
  const [state, setState] = useState<{ key: typeof key; data?: Joined; error?: Error }>();
  useEffect(() => {
    if (key.agenda === "vzn") return;
    const c = new AbortController();
    loadRelated(key.agenda, key.id, key.publicOnly, c.signal)
      .then((data) => {
        if (!c.signal.aborted) setState({ key, data });
      })
      .catch((error) => {
        if (!c.signal.aborted) setState({ key, error });
      });
    return () => c.abort();
  }, [key]);
  const current = state?.key === key ? state : undefined;
  const reload = useCallback(() => setAttempt((a) => a + 1), []);
  return {
    data: current?.data,
    error: current?.error,
    loading: agenda !== "vzn" && !current,
    reload,
  };
}
export function DocumentDetail({
  agenda,
  id,
  office = false,
}: {
  agenda: AgendaSlug;
  id: string;
  office?: boolean;
}) {
  const router = useRouter();
  const contextParams = useSearchParams();
  const returnTo = safeReturnTo(
    contextParams.get("returnTo"),
    `/${office ? "uradnik" : "obcan"}/${agenda}`,
  );
  const def = agendaFor(agenda)!;
  const source = useResource<{ data: DocumentRecord }>(
    office || agenda === "vzn" ? `/${agenda}/${encodeURIComponent(id)}` : null,
  );
  const joined = useJoined(agenda, id, !office);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<Error>();
  const [confirm, setConfirm] = useState(false);
  const [retries, setRetries] = useState(0);
  const record = office || agenda === "vzn" ? source.data?.data : joined.data?.data.root.zaznam;
  const reloadJoined = joined.reload;
  const pending =
    agenda !== "vzn" &&
    Boolean(joined.data) &&
    (joined.data!.projection.status === "pending" ||
      (office &&
        Number(joined.data!.projection.root_entity_version ?? 0) <
          Number(record?.entity_version ?? 0)));
  useEffect(() => {
    if (!pending || retries >= 5) return;
    const timer = setTimeout(() => {
      setRetries((n) => n + 1);
      reloadJoined();
    }, 2000);
    return () => clearTimeout(timer);
  }, [pending, retries, joined.data, reloadJoined]);
  async function publish() {
    if (!record) return;
    setBusy(true);
    setActionError(undefined);
    try {
      await api(`/${agenda}/${id}/update`, {
        method: "POST",
        body: JSON.stringify({ zverejnene: !record.zverejnene }),
      });
      source.reload();
      setRetries(0);
      joined.reload();
    } catch (e) {
      setActionError(e as Error);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setActionError(undefined);
    try {
      await api(`/${agenda}/${id}/delete`, { method: "POST" });
      router.push(returnTo);
      router.refresh();
    } catch (e) {
      setActionError(e as Error);
      setBusy(false);
    }
  }
  const loading = office || agenda === "vzn" ? source.loading : joined.loading;
  const error = office || agenda === "vzn" ? source.error : joined.error;
  if (loading && !record) return <Loading />;
  if (error)
    return (
      <Failure error={error} retry={office || agenda === "vzn" ? source.reload : joined.reload} />
    );
  if (!record)
    return (
      <Alert>
        <AlertTitle>Dokument sa pripravuje</AlertTitle>
        <AlertDescription>
          <p>Dokument je uložený. Prehľad sa ešte aktualizuje.</p>
          <Button className="mt-3" variant="outline" size="sm" onClick={joined.reload}>
            <RefreshCw />
            Obnoviť prehľad
          </Button>
        </AlertDescription>
      </Alert>
    );
  const prefix = office ? "uradnik" : "obcan";
  return (
    <div className="space-y-8">
      <div>
        <Button variant="link" className="px-0" asChild>
          <Link href={returnTo}>
            <ArrowLeft />
            {def.title}
          </Link>
        </Button>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{def.singular}</Badge>
              <Published value={record.zverejnene} />
            </div>
            <h1 className="break-words text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
              {titleOf(record)}
            </h1>
            <p className="text-sm text-muted-foreground">{record.cislo} · Žilina</p>
          </div>
          {office && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link
                  href={`/uradnik/${agenda}/${id}/upravit?returnTo=${encodeURIComponent(returnTo)}`}
                >
                  <Pencil />
                  Upraviť
                </Link>
              </Button>
              <Button disabled={busy} onClick={publish}>
                {record.zverejnene ? <EyeOff /> : <Globe />}
                {record.zverejnene ? "Stiahnuť zo zverejnenia" : "Zverejniť"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Vymazať dokument"
                onClick={() => setConfirm(true)}
              >
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
      </div>
      {actionError && <Failure error={actionError} />}
      {pending && (
        <Alert>
          <AlertTitle>Záznam je uložený, prehľad sa aktualizuje</AlertTitle>
          <AlertDescription>
            <p>Súvisiace dokumenty sa doplnia po spracovaní zmeny.</p>
            {retries >= 5 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setRetries(0);
                  joined.reload();
                }}
              >
                Obnoviť prehľad
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      <section className="rounded-lg border p-5 sm:p-6">
        <h2 className="mb-6 text-xl font-semibold">Údaje dokumentu</h2>
        <RecordFields agenda={agenda} record={record} />
      </section>
      <Attachments agenda={agenda} id={id} office={office} />
      {agenda !== "vzn" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Súvisiace dokumenty</h2>
            <Button variant="ghost" size="sm" onClick={joined.reload} disabled={joined.loading}>
              <RefreshCw />
              Obnoviť
            </Button>
          </div>
          {joined.error ? (
            <Failure error={joined.error} retry={joined.reload} />
          ) : joined.loading && !joined.data ? (
            <Loading />
          ) : joined.data?.data.suvisiace_zaznamy.length ? (
            <>
              <p className="text-sm text-muted-foreground">
                {joined.data.data.suvisiace_zaznamy.length} dokumentov v prepojenom prehľade.
                Súvislosti vychádzajú z vybraných odkazov.
              </p>
              <Accordion type="multiple" className="rounded-lg border px-4">
                {joined.data.data.suvisiace_zaznamy.map((node: RecordNode) => (
                  <AccordionItem
                    value={`${node.typ}/${node.zaznam.id}`}
                    key={`${node.typ}/${node.zaznam.id}`}
                  >
                    <AccordionTrigger>
                      <div className="text-left">
                        <p className="font-medium">{titleOf(node.zaznam)}</p>
                        <p className="mt-1 text-xs font-normal text-muted-foreground">
                          {agendaFor(node.typ)?.title} · {node.zaznam.cislo}
                        </p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-5">
                      <RecordFields agenda={node.typ} record={node.zaznam} />
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/${prefix}/${node.typ}/${node.zaznam.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        >
                          Otvoriť celý dokument
                          <ArrowRight />
                        </Link>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Zatiaľ nie sú dostupné žiadne súvisiace dokumenty.
            </p>
          )}
          {joined.data?.projection.as_of && (
            <p className="text-xs text-muted-foreground">
              Prehľad aktualizovaný: {formatDate(joined.data.projection.as_of)}
              {joined.data.projection.status === "pending"
                ? " · niektoré odkazy čakajú na spracovanie"
                : ""}
            </p>
          )}
        </section>
      )}
      <Separator />
      <Accordion type="single" collapsible>
        <AccordionItem value="metadata">
          <AccordionTrigger>Podrobnosti evidencie</AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Vytvorené</dt>
                <dd>{formatDate(record.created_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Upravené</dt>
                <dd>{formatDate(record.updated_at)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Identifikátor</dt>
                <dd className="break-all">{record.id}</dd>
              </div>
              {record.entity_version != null && (
                <div>
                  <dt className="text-muted-foreground">Verzia údajov</dt>
                  <dd>{record.entity_version}</dd>
                </div>
              )}
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vymazať dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokument {record.cislo} a jeho prílohy sa prestanú zobrazovať v evidencii. Súvisiace
              dokumenty sa nezmažú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void remove();
              }}
            >
              Vymazať dokument
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
