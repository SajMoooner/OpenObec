"use client";
import { Button } from "@openobec/ui/components/button";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Stránku sa nepodarilo načítať</h1>
      <p className="text-muted-foreground">
        Skúste to znova. Uložené dokumenty zostávajú zachované.
      </p>
      <Button onClick={reset}>Skúsiť znova</Button>
    </main>
  );
}
