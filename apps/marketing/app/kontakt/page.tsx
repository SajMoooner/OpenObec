import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { DemoLinks } from "../components/demo-links";
export const metadata = { title: "Kontakt" };
export default function Contact() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12 sm:py-20">
        <section className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Kontakt k projektu OpenObec</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            OpenObec je v tejto verzii lokálne demo pre mesto Žilina. Kontaktná adresa zatiaľ nie je
            nastavená.
          </p>
          <p className="mt-4 max-w-prose leading-7 text-muted-foreground">
            Riešenie si môžete priamo vyskúšať ako občan alebo úradník. Demo obsahuje fiktívne
            dokumenty a organizácie.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/vyhody">
              Pozrieť výhody riešenia
              <ArrowRight />
            </Link>
          </Button>
        </section>
        <DemoLinks />
      </main>
      <MarketingFooter />
    </>
  );
}
