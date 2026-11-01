import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { DemoLinks } from "../components/demo-links";
import { ProductPreview } from "../components/product-preview";
import "../home/marketing.css";
export const metadata = { title: "Výhody" };
export default function Benefits() {
  return (
    <>
      <MarketingHeader />
      <main className="marketing-container marketing-page">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Dokumenty, v ktorých sa dá vyznať.
          </h1>
          <p className="marketing-section-copy text-lg">
            Občan potrebuje odpoveď. Úradník potrebuje dokončiť záznam. OpenObec dáva každému
            vlastný pohľad na spoločnú evidenciu.
          </p>
        </section>
        <section className="product-story">
          <div>
            <h2 className="marketing-section-title">Čo patrí k obnove knižnice?</h2>
            <p className="marketing-section-copy">
              Občan otvorí zmluvu, overí zmluvnú stranu, účinnosť a sumu s DPH. Znenie nájde v PDF
              prílohe. Vybrané súvislosti ho dovedú k objednávke, faktúram a obstarávaniu.
            </p>
            <p className="marketing-section-copy">
              Súvislosť je výslovne vybraný odkaz medzi dokumentmi; nevzniká iba preto, že majú
              rovnakého dodávateľa.
            </p>
          </div>
          <ProductPreview role="citizen" />
        </section>
        <section className="product-story product-story-reverse border-t pt-12">
          <div>
            <h2 className="marketing-section-title">Čo ešte treba doplniť pred zverejnením?</h2>
            <p className="marketing-section-copy">
              Úradník sa z prehľadu vráti do konceptu. Doplní údaje podľa agendy, priloží súbor a
              uloží záznam. Až zverejnený dokument je dostupný občanom.
            </p>
            <p className="marketing-section-copy">
              Pri obstarávaní sleduje lehotu ponúk a hodnotu bez DPH. Pri VZN dátum schválenia a
              účinnosť; táto agenda sa vedie samostatne.
            </p>
          </div>
          <ProductPreview role="office" />
        </section>
        <section className="grid gap-8 border-y py-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Údaje podľa významu dokumentu</h2>
            <p className="marketing-section-copy">
              Odberateľské faktúry ukazujú odberateľa, dodávateľské faktúry dodávateľa. Objednávky
              dopĺňajú dátum objednania, zmluvy účinnosť. Nemusíte hľadať význam v rovnakých
              všeobecných stĺpcoch.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Verejný obsah aj rozpracovaná evidencia</h2>
            <p className="marketing-section-copy">
              Občan prezerá publikované dokumenty bez účtu. Úradník má aj koncepty, úpravy a správu
              príloh. Demo umožňuje vyskúšať oba pohľady bez hesla.
            </p>
          </div>
        </section>
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-secondary p-6 sm:p-8">
          <div>
            <h2 className="text-2xl font-semibold">Navrhovaná cena služby: 199 € / rok</h2>
            <p className="mt-3 max-w-prose leading-7 text-foreground/80">
              Implementačný poplatok a režim DPH zatiaľ nie sú určené.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/home#cena">
              Podrobnosti cenového návrhu <ArrowRight />
            </Link>
          </Button>
        </section>
        <DemoLinks />
      </main>
      <MarketingFooter />
    </>
  );
}
