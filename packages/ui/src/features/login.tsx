"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Brand, Failure } from "./shared";
export function OfficeLogin({ marketingUrl }: { marketingUrl: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error>();
  async function enter() {
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (!res.ok) throw new Error("Demo sa nepodarilo otvoriť. Skúste to znova.");
      router.push("/uradnik/home");
      router.refresh();
    } catch (e) {
      setError(e as Error);
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-svh flex-col bg-secondary/40">
      <header className="border-b bg-background px-6 py-5">
        <Link href={`${marketingUrl}/home`}>
          <Brand />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-12">
        <section className="space-y-5 rounded-xl border bg-background p-6">
          <h1 className="text-3xl leading-tight font-semibold tracking-tight">
            Vstup pre úradníka
          </h1>
          <p className="text-muted-foreground">
            Vyskúšajte evidenciu a publikovanie dokumentov na jednom mieste. Demo je pripravené pre
            mesto Žilina s ukážkovými údajmi.
          </p>
          <p className="text-sm font-medium">Žilina · ukážkové prostredie</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Môžete pridávať dokumenty, nahrávať prílohy a zverejňovať ich v občianskom portáli. Na
            vstup do dema nepotrebujete heslo.
          </p>
          <Button size="lg" className="w-full" onClick={enter} disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}Vstúpiť do dema
          </Button>
        </section>
        {error && <Failure error={error} retry={enter} />}
        <p className="text-center text-sm text-muted-foreground">
          Všetky dokumenty aj organizácie v deme sú fiktívne.
        </p>
      </main>
    </div>
  );
}
