import { publicLinks } from "@openobec/api-client/server";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { ProductImage, Cta } from "../components/sections";
export const metadata = { title: "Vyskúšať demo" };
export default function Demo() {
  const links = publicLinks();
  return (
    <main id="obsah">
      <section className="section m-container demo-section">
        <div className="hero-copy">
          <h1>
            Vyskúšajte obe
            <br />
            strany obce.
          </h1>
          <p>
            Pripravte dokument ako úradník. Potom si ho pozrite ako občan. Demo používa fiktívne
            dokumenty a organizácie mesta Žilina.
          </p>
        </div>
        <div className="demo-grid">
          <section>
            <h2>Pre úradníka</h2>
            <p>Od rozpracovaného konceptu po zverejnený dokument.</p>
            <ol>
              <li>Vstúpte do pracovného dema bez hesla.</li>
              <li>Vytvorte dokument, priložte PDF a vyberte súvislosti.</li>
              <li>Zverejnite ho a overte verejný výsledok.</li>
            </ol>
            <Button asChild className="m-button">
              <a href={`${links.office}/uradnik/prihlasenie`}>
                Otvoriť pracovné demo <ArrowRight />
              </a>
            </Button>
            <figure>
              <ProductImage
                src="/previews/office-overview.png"
                alt="Pracovný prehľad dokumentov OpenObec."
              />
              <figcaption>Snímka ukážkového prostredia · pracovný portál</figcaption>
            </figure>
          </section>
          <section>
            <h2>Pre občana</h2>
            <p>Nájdite dokument, jeho prílohu aj ďalšie súvislosti.</p>
            <ol>
              <li>Otvorte občiansky portál a vyhľadajte dokument.</li>
              <li>Pozrite si údaje a stiahnite prílohu PDF.</li>
              <li>Prejdite na súvisiacu zmluvu alebo objednávku.</li>
            </ol>
            <Button asChild variant="outline" className="m-button">
              <a href={`${links.citizen}/obcan/home`}>
                Otvoriť občianske demo <ArrowRight />
              </a>
            </Button>
            <figure>
              <ProductImage
                src="/previews/citizen-contract.png"
                alt="Detail zmluvy v občianskom portáli OpenObec."
              />
              <figcaption>Snímka ukážkového prostredia · občiansky portál</figcaption>
            </figure>
          </section>
        </div>
        <div className="demo-search">
          <h2>Hľadajte rovno v dokumentoch</h2>
          <p>Skúste napríklad „knižnice“. Výsledky sa otvoria v občianskom portáli.</p>
          <form role="search" action={`${links.citizen}/obcan/home`}>
            <label className="sr-only" htmlFor="demo-query">
              Hľadať dokumenty
            </label>
            <Input
              id="demo-query"
              type="search"
              name="q"
              placeholder="Názov alebo text dokumentu"
            />
            <Button className="m-button" type="submit">
              <Search />
              Hľadať
            </Button>
          </form>
        </div>
        <p className="demo-note">
          Demo nie je oficiálnym portálom mesta Žilina. Reálne integrácie s mestským IS ani
          externými registrami nie sú súčasťou tejto verzie.
        </p>
      </section>
      <Cta />
    </main>
  );
}
