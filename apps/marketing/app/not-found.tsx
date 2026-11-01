import Link from "next/link";
import { Button } from "@openobec/ui/components/button";
export default function Missing() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Stránka sa nenašla</h1>
      <p className="text-muted-foreground">
        Skontrolujte adresu alebo sa vráťte na úvodnú stránku.
      </p>
      <Button asChild>
        <Link href="/">Späť na úvod</Link>
      </Button>
    </main>
  );
}
