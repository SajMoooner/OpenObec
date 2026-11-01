"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
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
  const [savedId, setSavedId] = useState(initial?.id);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<FieldError[]>([]);
  const [error, setError] = useState<Error>();
  const [saved, setSaved] = useState(false);
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
      router.push(`/uradnik/${agenda}/${id}?returnTo=${encodeURIComponent(returnTo)}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError || e instanceof FormValidationError) setDetails(e.details);
      setError(e instanceof Error ? e : new Error("Dokument sa nepodarilo uložiť."));
      requestAnimationFrame(() => document.getElementById("form-error")?.focus());
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button variant="link" className="px-0" asChild>
          <Link href={returnTo}>
            <ArrowLeft />
            {def.title}
          </Link>
        </Button>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {initial ? "Upraviť dokument" : "Pridať dokument"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {def.singular}. Povinné polia sú označené hviezdičkou.
        </p>
      </div>
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
        <fieldset disabled={busy} className="space-y-8">
          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Údaje dokumentu</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {def.fields.map((f) => (
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
                    <p className="text-xs text-muted-foreground">Čas v pásme Europe/Bratislava.</p>
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
          <section className="space-y-3">
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
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {files.map((f, i) => (
                  <li key={`${f.name}/${i}`}>{f.name}</li>
                ))}
              </ul>
            )}
            {initial && (
              <p className="text-sm">
                <Link
                  className="text-primary underline underline-offset-4"
                  href={`/uradnik/${agenda}/${initial.id}?returnTo=${encodeURIComponent(returnTo)}`}
                >
                  Existujúce prílohy spravovať v detaile dokumentu
                </Link>
              </p>
            )}
          </section>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
            <Button type="button" variant="ghost" asChild>
              <Link
                href={
                  savedId
                    ? `/uradnik/${agenda}/${savedId}?returnTo=${encodeURIComponent(returnTo)}`
                    : returnTo
                }
              >
                Zrušiť
              </Link>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="outline" disabled={busy}>
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
