"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Globe, LoaderCircle } from "lucide-react";
import {
  safeReturnTo,
  agendaFor,
  api,
  toWritePayload,
  localBratislavaInput,
  ApiError,
  FormValidationError,
  type AgendaSlug,
  type DocumentRecord,
  type FieldError,
  type Reference,
} from "@openobec/api-client";
import { useResource } from "@openobec/ui/hooks/use-resource";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Label } from "@openobec/ui/components/label";
import { Textarea } from "@openobec/ui/components/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@openobec/ui/components/select";
import { Alert, AlertTitle, AlertDescription } from "@openobec/ui/components/alert";
import { Separator } from "@openobec/ui/components/separator";
import { Loading, Failure } from "./shared";
import { useEditorGuard } from "./navigation-guard";
import { returnLabel } from "./document-fields";
import { Published } from "./shared";
import { attachmentType } from "./attachments";
import { ReferencePicker, InverseLinks } from "./reference-picker";
export function EditorPage({ agenda, id }: { agenda: AgendaSlug; id?: string }) {
  const { data, error, loading, reload } = useResource<{ data: DocumentRecord }>(
    id ? `/${agenda}/${encodeURIComponent(id)}` : null,
  );
  if (id && loading) return <Loading />;
  if (error) return <Failure error={error} retry={reload} />;
  return <DocumentForm key={id ?? "new"} agenda={agenda} initial={data?.data} />;
}

function DocumentForm({ agenda, initial }: { agenda: AgendaSlug; initial?: DocumentRecord }) {
  const contextParams = useSearchParams();
  const returnTo = safeReturnTo(contextParams.get("returnTo"), `/uradnik/${agenda}`);
  const def = agendaFor(agenda)!;
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {
      ...initial,
      zverejnene: initial?.zverejnene ?? false,
      suvisiace_zaznamy: initial?.suvisiace_zaznamy ?? [],
    };
    for (const f of def.fields) {
      if (f.kind === "datetime") v[f.key] = localBratislavaInput(v[f.key]);
      else if (v[f.key] == null) v[f.key] = "";
    }
    if (def.party && !v[def.party]) v[def.party] = { nazov: "", ico: "" };
    return v;
  });
  const snapshot = (current: Record<string, unknown>) =>
    JSON.stringify({
      fields: def.fields.map((field) => String(current[field.key] ?? "")),
      party: def.party
        ? ["nazov", "ico"].map((key) =>
            String((current[def.party!] as Record<string, unknown> | undefined)?.[key] ?? ""),
          )
        : null,
      references: ((current.suvisiace_zaznamy ?? []) as Reference[])
        .map((reference) => `${reference.typ}/${reference.id}`)
        .sort(),
    });
  const [baseline] = useState(() => snapshot(values));
  const [completionPending, setCompletionPending] = useState(false);
  const [savedId, setSavedId] = useState(initial?.id);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<FieldError[]>([]);
  const [error, setError] = useState<Error>();
  const [saved, setSaved] = useState(false);
  const navigation = useEditorGuard(
    snapshot(values) !== baseline || files.length > 0 || completionPending || busy,
  );
  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));
  const issue = (key: string) => details.find((d) => d.field === key)?.message;
  async function submit(publish: boolean) {
    setError(undefined);
    setDetails([]);
    setBusy(true);
    let id = savedId;
    try {
      const payload = toWritePayload(agenda, values, initial);
      payload.zverejnene = initial?.zverejnene ?? false;
      if (files.length > 10) throw new Error("Na dokument môžete pridať najviac 10 príloh.");
      for (const file of files)
        if (file.size > 20 * 1024 * 1024)
          throw new Error(`Súbor ${file.name} presahuje limit 20 MiB.`);
      const result = await api<{ data: DocumentRecord }>(`/${agenda}${id ? `/${id}/update` : ""}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      id = result.data.id;
      setSavedId(id);
      setSaved(true);
      setCompletionPending(true);
      let pending = [...files];
      for (const file of files) {
        const body = new FormData();
        body.set("file", file);
        await api(`/${agenda}/${id}/prilohy`, { method: "POST", body });
        pending = pending.filter((f) => f !== file);
        setFiles([...pending]);
      }
      if (publish && !result.data.zverejnene)
        await api(`/${agenda}/${id}/update`, {
          method: "POST",
          body: JSON.stringify({ zverejnene: true }),
        });
      navigation?.saved(
        `/uradnik/${agenda}/${id}?returnTo=${encodeURIComponent(returnTo)}&saved=${publish ? "published" : "true"}`,
      );
    } catch (e) {
      if (e instanceof ApiError || e instanceof FormValidationError) setDetails(e.details);
      setError(e instanceof Error ? e : new Error("Dokument sa nepodarilo uložiť."));
      requestAnimationFrame(() => document.getElementById("form-error")?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10 [&_input]:scroll-mb-44 [&_textarea]:scroll-mb-44 [&_[role=combobox]]:scroll-mb-44">
      <div>
        <Button variant="link" className="px-0" asChild>
          <a href={returnTo}>
            <ArrowLeft />
            {returnLabel(returnTo, def.title)}
          </a>
        </Button>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {initial ? "Upraviť dokument" : "Pridať dokument"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {def.singular}. Povinné polia sú označené hviezdičkou.
        </p>
        {!initial?.zverejnene && (
          <p className="mt-2 text-sm text-muted-foreground">
            Koncept zostáva v pracovnom portáli. Uložiť a zverejniť sprístupní dokument občanom.
          </p>
        )}
        {initial && (
          <p className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="min-w-0 break-words">
              {initial.cislo} · {initial.nazov || initial.predmet}
            </span>
            <Published value={initial.zverejnene} />
          </p>
        )}
      </div>
      {initial?.zverejnene && (
        <Alert>
          <Globe />
          <AlertTitle>Upravujete zverejnený dokument</AlertTitle>
          <AlertDescription>
            Uložením zmeníte obsah dostupný občanom. Dokument zostane zverejnený.
          </AlertDescription>
        </Alert>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit(false);
        }}
        className="space-y-8"
      >
        {error && (
          <Alert id="form-error" tabIndex={-1} variant="destructive" role="alert">
            <AlertTitle>
              {saved ? "Záznam je uložený, dokončenie neprebehlo" : "Skontrolujte vyplnené údaje"}
            </AlertTitle>
            <AlertDescription>
              <p>{error.message}</p>
              {saved && savedId && (
                <p>
                  Uložený záznam zostal zachovaný. Opravte chybu a pokračujte, nový dokument sa
                  nevytvorí.
                </p>
              )}
              {details.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                  {details.map((d, i) => (
                    <li key={`${d.field}/${i}`}>
                      <button
                        type="button"
                        className="text-left underline"
                        onClick={() => document.getElementById(d.field)?.focus()}
                      >
                        {d.message}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}
        <fieldset disabled={busy} className="min-w-0 space-y-8">
          {[
            {
              title: "Údaje dokumentu",
              fields: def.fields.filter((f) => !["money", "date", "datetime"].includes(f.kind)),
            },
            { title: "Finančné údaje", fields: def.fields.filter((f) => f.kind === "money") },
            {
              title: "Dátumy a termíny",
              fields: def.fields.filter((f) => f.kind === "date" || f.kind === "datetime"),
            },
          ]
            .filter((group) => group.fields.length > 0)
            .map((group) => (
              <section key={group.title} className="space-y-5 rounded-lg border p-4 sm:p-6">
                <h2 className="text-lg font-semibold">{group.title}</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {group.fields.map((f) => (
                    <div
                      key={f.key}
                      className={`space-y-2 ${f.kind === "textarea" ? "sm:col-span-2" : ""}`}
                    >
                      <Label htmlFor={f.key}>
                        {f.label}
                        {f.required ? " *" : ""}
                      </Label>
                      {f.kind === "textarea" ? (
                        <Textarea
                          id={f.key}
                          maxLength={5000}
                          rows={4}
                          value={String(values[f.key] ?? "")}
                          onChange={(e) => set(f.key, e.target.value)}
                          aria-invalid={Boolean(issue(f.key))}
                          aria-describedby={issue(f.key) ? `${f.key}-error` : undefined}
                        />
                      ) : f.kind === "select" ? (
                        <Select
                          value={String(values[f.key] ?? "")}
                          onValueChange={(v) => set(f.key, v)}
                        >
                          <SelectTrigger
                            id={f.key}
                            className="w-full"
                            aria-invalid={Boolean(issue(f.key))}
                            aria-describedby={issue(f.key) ? `${f.key}-error` : undefined}
                          >
                            <SelectValue placeholder="Vyberte stav" />
                          </SelectTrigger>
                          <SelectContent>
                            {f.options?.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={f.key}
                          type={
                            f.kind === "date"
                              ? "date"
                              : f.kind === "datetime"
                                ? "datetime-local"
                                : "text"
                          }
                          step={f.kind === "datetime" ? "0.001" : undefined}
                          inputMode={f.kind === "money" ? "decimal" : undefined}
                          maxLength={f.key === "cislo" ? 100 : f.key === "nazov" ? 500 : undefined}
                          value={String(values[f.key] ?? "")}
                          onChange={(e) => set(f.key, e.target.value)}
                          aria-invalid={Boolean(issue(f.key))}
                          aria-describedby={issue(f.key) ? `${f.key}-error` : undefined}
                        />
                      )}
                      {f.kind === "datetime" && (
                        <p className="text-xs text-muted-foreground">
                          Čas v pásme Europe/Bratislava.
                        </p>
                      )}
                      {issue(f.key) && (
                        <p id={`${f.key}-error`} className="text-xs text-destructive">
                          {issue(f.key)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          {def.party && (
            <section className="space-y-5">
              <Separator />
              <h2 className="text-lg font-semibold">{def.partyLabel}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  { key: "nazov", label: "Názov organizácie *" },
                  { key: "ico", label: "IČO" },
                ].map((f) => {
                  const party = (values[def.party!] ?? {}) as Record<string, unknown>;
                  const key = `${def.party}.${f.key}`;
                  return (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{f.label}</Label>
                      <Input
                        id={key}
                        value={String(party[f.key] ?? "")}
                        maxLength={f.key === "ico" ? 8 : 500}
                        inputMode={f.key === "ico" ? "numeric" : undefined}
                        onChange={(e) => set(def.party!, { ...party, [f.key]: e.target.value })}
                        aria-invalid={Boolean(issue(key))}
                        aria-describedby={issue(key) ? `${key}-error` : undefined}
                      />
                      {issue(key) && (
                        <p id={`${key}-error`} className="text-xs text-destructive">
                          {issue(key)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {def.related.length > 0 && (
            <>
              <Separator />
              <ReferencePicker
                agenda={agenda}
                value={(values.suvisiace_zaznamy ?? []) as Reference[]}
                onChange={(r) => set("suvisiace_zaznamy", r)}
              />
              {initial && <InverseLinks agenda={agenda} id={initial.id} />}
            </>
          )}
          <Separator />
          <section className="min-w-0 space-y-3">
            <h2 className="text-lg font-semibold">Prílohy</h2>
            <Label htmlFor="new-files">Pridať súbory k dokumentu</Label>
            <Input
              id="new-files"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            <p className="text-xs text-muted-foreground">
              PDF, PNG alebo JPEG, najviac 20 MiB na súbor a 10 príloh na dokument. Súbory sa
              nahrajú po uložení údajov.
            </p>
            {files.length > 0 && (
              <ul className="min-w-0 list-inside list-disc text-sm text-muted-foreground [overflow-wrap:anywhere]">
                {files.map((f, i) => (
                  <li key={`${f.name}/${i}`}>
                    {f.name} · {attachmentType(f.type)} ·{" "}
                    {new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 1 }).format(
                      f.size / 1024,
                    )}{" "}
                    kB ·{" "}
                    {error && saved
                      ? "Nenahraté, skúste znova"
                      : busy
                        ? "Nahrávam…"
                        : "Vybrané, čaká na nahratie"}
                  </li>
                ))}
              </ul>
            )}
            {initial && (
              <p className="text-sm">
                <a
                  className="text-primary underline underline-offset-4"
                  href={`/uradnik/${agenda}/${initial.id}?returnTo=${encodeURIComponent(returnTo)}`}
                >
                  Existujúce prílohy spravovať v detaile dokumentu
                </a>
              </p>
            )}
          </section>
          <Separator />
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t bg-background py-4 [&_button]:min-h-11 [&_a]:min-h-11">
            <Button type="button" variant="ghost" asChild>
              <a
                href={
                  savedId
                    ? `/uradnik/${agenda}/${savedId}?returnTo=${encodeURIComponent(returnTo)}`
                    : returnTo
                }
              >
                Zrušiť
              </a>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant={initial?.zverejnene ? "default" : "outline"}
                disabled={busy}
              >
                {busy ? <LoaderCircle className="animate-spin" /> : <Save />}
                {initial?.zverejnene ? "Uložiť zmeny" : "Uložiť koncept"}
              </Button>
              {!initial?.zverejnene && (
                <Button type="button" disabled={busy} onClick={() => void submit(true)}>
                  {busy ? <LoaderCircle className="animate-spin" /> : <Globe />}Uložiť a zverejniť
                </Button>
              )}
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
