"use client";
import { useState } from "react";
import { FileText, Download, Trash2, Upload, LoaderCircle } from "lucide-react";
import { api, type AgendaSlug, type Attachment } from "@openobec/api-client";
import { useResource } from "@openobec/ui/hooks/use-resource";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Label } from "@openobec/ui/components/label";
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
import { Loading, Failure } from "./shared";
export function Attachments({
  agenda,
  id,
  office = false,
}: {
  agenda: AgendaSlug;
  id: string;
  office?: boolean;
}) {
  const path = `/${agenda}/${encodeURIComponent(id)}/prilohy`;
  const { data, error, loading, reload } = useResource<{ data: Attachment[] }>(path);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<Error>();
  const [remove, setRemove] = useState<Attachment>();
  const [message, setMessage] = useState("");
  async function upload() {
    setBusy(true);
    setUploadError(undefined);
    setMessage("");
    let pending = [...files];
    try {
      for (const file of files) {
        if (file.size > 20 * 1024 * 1024)
          throw new Error(`Súbor ${file.name} presahuje limit 20 MiB.`);
        const body = new FormData();
        body.set("file", file);
        await api(path, { method: "POST", body });
        pending = pending.filter((f) => f !== file);
        setFiles([...pending]);
      }
      setMessage("Prílohy boli nahraté.");
    } catch (e) {
      setUploadError(e instanceof Error ? e : new Error("Súbor sa nepodarilo nahrať."));
    } finally {
      setBusy(false);
      reload();
    }
  }
  async function deleteFile() {
    if (!remove) return;
    setBusy(true);
    setUploadError(undefined);
    try {
      await api(`${path}/${encodeURIComponent(remove.id)}/delete`, { method: "POST" });
      setRemove(undefined);
      setMessage("Príloha bola odstránená.");
      reload();
    } catch (e) {
      setUploadError(e instanceof Error ? e : new Error("Prílohu sa nepodarilo odstrániť."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Prílohy</h2>
      {loading ? (
        <Loading />
      ) : error ? (
        <Failure error={error} retry={reload} />
      ) : data?.data.length ? (
        <ul className="divide-y rounded-lg border">
          {data.data.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center gap-3 p-4">
              <FileText className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <a
                  className="break-all text-sm font-medium text-primary underline-offset-4 hover:underline"
                  href={`/api/rest/v1${path}/${encodeURIComponent(file.id)}/download`}
                >
                  {file.filename}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  {file.content_type} ·{" "}
                  {new Intl.NumberFormat("sk-SK", { maximumFractionDigits: 1 }).format(
                    file.size_bytes / 1024,
                  )}{" "}
                  kB
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/api/rest/v1${path}/${encodeURIComponent(file.id)}/download`}
                  aria-label={`Stiahnuť ${file.filename}`}
                >
                  <Download />
                  <span className="hidden sm:inline">Stiahnuť</span>
                </a>
              </Button>
              {office && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRemove(file)}
                  aria-label={`Odstrániť ${file.filename}`}
                >
                  <Trash2 />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">K dokumentu nie sú priložené žiadne súbory.</p>
      )}
      {office && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <Label htmlFor="attachment-upload">Pridať prílohy</Label>
          <Input
            id="attachment-upload"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={busy}
            onChange={(e) => {
              setFiles(Array.from(e.target.files ?? []));
              setMessage("");
            }}
          />
          <p className="text-xs text-muted-foreground">
            PDF, PNG alebo JPEG. Najviac 20 MiB na súbor, 10 aktívnych príloh na dokument.
          </p>
          {files.length > 0 && (
            <Button size="sm" disabled={busy} onClick={upload}>
              {busy ? <LoaderCircle className="animate-spin" /> : <Upload />}Nahrať{" "}
              {files.length === 1 ? "prílohu" : `prílohy (${files.length})`}
            </Button>
          )}
        </div>
      )}
      {uploadError && <Failure error={uploadError} />}
      {message && (
        <p role="status" className="text-sm text-primary">
          {message}
        </p>
      )}
      <AlertDialog
        open={Boolean(remove)}
        onOpenChange={(open) => {
          if (!open && !busy) setRemove(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť prílohu?</AlertDialogTitle>
            <AlertDialogDescription>
              Príloha {remove?.filename} sa prestane zobrazovať pri dokumente. Ostatné súbory
              zostanú zachované.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void deleteFile();
              }}
            >
              Odstrániť prílohu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
