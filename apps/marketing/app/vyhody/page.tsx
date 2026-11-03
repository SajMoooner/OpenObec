import { FilePenLine, Paperclip, Network } from "lucide-react";
import { AgendaGrid, Cta, DemoActions, ProductImage, SectionHeading } from "../components/sections";
import { FeatureTabs } from "../components/feature-tabs";
export const metadata = { title: "Výhody" };
export default function Benefits() {
  return (
    <main id="obsah">
      <section className="m-container feature-hero">
        <div>
          <h1>
            Dokumenty obce.
            <br />
            Pod kontrolou.
          </h1>
          <p>
            Koncepty, prílohy a súvislosti v jednom pracovnom prostredí. Jasný postup pre vás,
            prehľadný výsledok pre občana.
          </p>
          <DemoActions secondary="Sprievodca demom" href="/demo" />
        </div>
        <figure className="feature-hero-image">
          <ProductImage
            priority
            src="/showcase/published.png"
            alt="Zverejnená faktúra v OpenObec s údajmi, prílohou a súvislosťami."
          />
          <figcaption>Snímka pracovného dema · ukážkové údaje</figcaption>
        </figure>
      </section>
      <section className="m-container benefit-highlights">
        {[
          {
            icon: FilePenLine,
            title: "Priestor na prípravu",
            text: "Rozpracované koncepty zostávajú oddelené od zverejnených dokumentov.",
          },
          {
            icon: Paperclip,
            title: "Príloha pri zázname",
            text: "PDF a údaje dokumentu nájdete spolu, bez hľadania v ďalšom priečinku.",
          },
          {
            icon: Network,
            title: "Viditeľné súvislosti",
            text: "Prepojte záznamy, ktoré k sebe patria. Vyberáte ich priamo z evidencie.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <div className="icon-box">
              <Icon aria-hidden="true" />
            </div>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="section m-container">
        <SectionHeading left title="Jeden dokument. Celý postup.">
          Pripravte, skontrolujte a sprístupnite. Pozrite si jednotlivé kroky na skutočných
          obrazovkách dema.
        </SectionHeading>
        <FeatureTabs />
      </section>
      <section className="section m-container split-section">
        <div>
          <h2>
            Úrad pripravuje.
            <br />
            Občan nachádza.
          </h2>
          <p>
            Pracovný portál slúži na evidenciu a zverejňovanie. Občiansky portál ukazuje dokumenty,
            ktoré už majú byť dostupné verejnosti.
          </p>
          <p>
            Občan môže vyhľadávať, prečítať si údaje, stiahnuť PDF a otvoriť súvisiace dokumenty.
            Každá strana má prostredie pre svoju úlohu.
          </p>
          <DemoActions secondary="Obe strany dema" href="/demo" />
        </div>
        <figure className="soft-image">
          <ProductImage
            src="/previews/citizen-contract.png"
            alt="Občiansky detail zmluvy s prílohou a súvisiacimi dokumentmi."
          />
          <figcaption>Občiansky portál · ukážkové údaje</figcaption>
        </figure>
      </section>
      <section className="section m-container">
        <SectionHeading title="Každá agenda má svoje miesto">
          Od faktúry po VZN. Spoločné prostredie, údaje podľa typu dokumentu.
        </SectionHeading>
        <AgendaGrid />
        <div className="integration-note">
          <Network aria-hidden="true" />
          <div>
            <h3>Prepojenie s mestským IS pripravujeme</h3>
            <p>
              Aktuálne demo funguje samostatne. Reálne integrácie s informačnými systémami obcí sú
              plánovaným rozšírením.
            </p>
          </div>
        </div>
      </section>
      <Cta />
    </main>
  );
}
