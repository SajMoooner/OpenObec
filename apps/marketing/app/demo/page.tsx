import { publicLinks } from "@openobec/api-client/server";
import { ArrowRight, Search, Check, FilePenLine } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { ProductImage } from "../components/sections";
import { DemoEntryButton } from "./entry-button";
export const metadata = { title: "Vyskúšať demo" };
export default function Demo() {
  const links = publicLinks();
  return (
    <main id="obsah">
      <section className="section m-container demo-section">
        <div className="hero-copy demo-intro">
          <h1>Jedna obec. Dva pohľady.</h1>
          <p>
            Vyberte si, z ktorej strany chcete OpenObec spoznať. Oba portály si vyskúšate bez
            registrácie.
          </p>
        </div>
        <div className="demo-grid" aria-label="Vyberte si pohľad na demo">
          <section className="demo-role" aria-labelledby="obcan-title">
            <div className="demo-role-copy">
              <Search className="demo-role-icon" aria-hidden="true" />
              <h2 id="obcan-title">Pohľad občana</h2>
              <p>Pozrite sa, čo uvidia obyvatelia vašej obce.</p>
              <ul>
                <li>
                  <Check aria-hidden="true" />
                  Vyhľadanie faktúr, zmlúv a ďalších dokumentov
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Údaje, prílohy PDF a súvisiace dokumenty
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Verejne dostupné zverejnené záznamy
                </li>
              </ul>
              <Button asChild variant="outline" className="m-button demo-role-action">
                <a href={`${links.citizen}/obcan/home`}>
                  Vyskúšať ako občan <ArrowRight />
                </a>
              </Button>
            </div>
            <figure>
              <ProductImage
                src="/previews/citizen-contract.png"
                alt="Čo vidí občan: detail zmluvy s údajmi, prílohami a súvislosťami."
                priority
              />
              <figcaption>Občiansky portál · skutočná snímka dema</figcaption>
            </figure>
          </section>
          <section className="demo-role" id="uradnik" aria-labelledby="uradnik-title">
            <div className="demo-role-copy">
              <FilePenLine className="demo-role-icon" aria-hidden="true" />
              <h2 id="uradnik-title">Pohľad úradníka</h2>
              <p>Vyskúšajte si každodennú prácu s dokumentmi.</p>
              <ul>
                <li>
                  <Check aria-hidden="true" />
                  Prehľad šiestich agend a rozpracovaných konceptov
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Pridanie údajov, PDF a prepojení na iné záznamy
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Zverejnenie dokumentu do občianskeho portálu
                </li>
              </ul>
              <form method="post" action={`${links.office}/api/demo/enter`}>
                <DemoEntryButton />
              </form>
            </div>
            <figure>
              <ProductImage
                src="/previews/office-overview.png"
                alt="Čo vidí úradník: pracovný prehľad konceptov, zverejnených dokumentov a agend."
                priority
              />
              <figcaption>Pracovný portál · skutočná snímka dema</figcaption>
            </figure>
          </section>
        </div>
        <p className="demo-note">
          Spoločné ukážkové prostredie pre Žilinu. Dokumenty a organizácie sú fiktívne; na skúšanie
          použite ukážkové súbory.
        </p>
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
    </main>
  );
}
