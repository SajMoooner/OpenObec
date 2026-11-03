"use client";
import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@openobec/ui/components/button";

export function DemoEntryButton() {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const restore = () => setBusy(false);
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);
  return (
    <Button
      type="submit"
      className="m-button demo-role-action"
      aria-disabled={busy}
      onClick={(event) => {
        if (busy) event.preventDefault();
        else setBusy(true);
      }}
    >
      {busy ? "Otváram pracovný portál…" : "Vyskúšať ako úradník"}
      {busy ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight aria-hidden="true" />
      )}
    </Button>
  );
}
