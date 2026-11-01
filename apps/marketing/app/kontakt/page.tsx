import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { DemoLinks } from "../components/demo-links";
import "../home/marketing.css";
export const metadata = { title: "Kontakt" };
export default function Contact() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-container marketing-page">
        <section className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Kontakt k projektu OpenObec
          </h1>
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
        <section className="grid gap-8 border-y py-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Čo si môžete overiť už dnes</h2>
            <p className="marketing-section-copy">
              Vyhľadávanie, prílohy a súvislosti v občianskom pohľade. V pracovnom deme celý postup
              od konceptu po zverejnenie vlastného ukážkového dokumentu.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/demo">
                Sprievodca vyskúšaním <ArrowRight />
              </Link>
            </Button>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Čo zatiaľ nie je nastavené</h2>
            <p className="marketing-section-copy">
              Kontaktný kanál ani objednávanie služby nie sú dostupné. Cena 199 € ročne je návrh;
              implementačný poplatok a DPH nie sú určené. Prepojenie na mestský IS je v deme
              simulované.
            </p>
            <Button className="mt-5" variant="link" asChild>
              <Link href="/home#otazky">
                Odpovede na časté otázky <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
        <DemoLinks />
      </main>
      <MarketingFooter />
    </>
  );
}
