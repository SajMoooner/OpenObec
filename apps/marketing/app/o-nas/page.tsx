import {
  ArrowUpRight,
  Code2,
  FileSearch,
  Fingerprint,
  GitPullRequest,
  Monitor,
  Scale,
} from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { AgendaStrip, Cta, ProductImage, SectionHeading } from "../components/sections";
export const metadata = { title: "O nás" };
export default function About() {
  return (
    <main id="obsah">
      <section className="m-container about-hero">
        <div className="hero-copy">
          <h1>
            Otvorený nástroj
            <br />
            pre otvorenú obec.
          </h1>
          <p>
            OpenObec vzniká pre jednoduchšiu prácu s dokumentmi samosprávy. Aby úrad vedel, čo
            zverejňuje, a občan našiel to, čo potrebuje.
          </p>
          <Button asChild className="m-button">
            <a href="https://github.com/SajMoooner/OpenObec">
              Pozrieť projekt na GitHube <ArrowUpRight />
            </a>
          </Button>
        </div>
        <figure className="about-panorama">
          <ProductImage
            priority
            src="/previews/office-overview.png"
            alt="Pracovné prostredie OpenObec s prehľadom dokumentov a samostatnými agendami."
          />
          <figcaption>OpenObec v praxi · skutočný produkt, ukážkové údaje</figcaption>
        </figure>
      </section>
      <section className="section m-container split-section about-story">
        <div>
          <h2>
            Poriadok začína
            <br />
            pri jednom dokumente.
          </h2>
          <p>
            Faktúra súvisí s objednávkou. Objednávka so zmluvou. A ku každému dokumentu patrí
            príloha, ktorú niekto potrebuje nájsť.
          </p>
          <p>
            OpenObec dáva týmto údajom spoločné miesto. Úradník dokument pripraví, vyberie
            súvislosti a rozhodne o zverejnení. Občan vidí prehľadný výsledok.
          </p>
          <p>
            Projekt je dnes funkčným demom pre Žilinu s fiktívnymi dátami. Jeho možnosti si môžete
            overiť priamo v portáloch aj v otvorenom kóde.
          </p>
          <div className="project-facts">
            <div>
              <strong>6</strong>
              <span>dokumentových agend</span>
            </div>
            <div>
              <strong>2</strong>
              <span>pracovné pohľady</span>
            </div>
            <div>
              <Code2 />
              <span>otvorený zdrojový kód</span>
            </div>
          </div>
        </div>
        <figure className="about-detail">
          <ProductImage
            src="/showcase/citizen.png"
            alt="Verejný detail ukážkovej faktúry: výsledok práce úradníka dostupný občanovi."
          />
          <figcaption>Jeden dokument z pohľadu občana.</figcaption>
        </figure>
      </section>
      <section className="section principles-section">
        <div className="m-container">
          <SectionHeading title="Princípy, na ktorých staviame">
            Otvorenosť je viac než dostupný kód. Znamená tiež povedať jasne, čo produkt robí a kam
            smeruje.
          </SectionHeading>
          <div className="principles-grid">
            {[
              {
                icon: Code2,
                title: "Otvorený kód",
                text: "Implementáciu aj postup spustenia nájdete v repozitári. Projekt môžete preskúmať a prevádzkovať vo vlastnom prostredí.",
              },
              {
                icon: FileSearch,
                title: "Zrozumiteľné dokumenty",
                text: "Údaje, PDF a súvislosti tvoria jeden celok. Čitateľ nemusí poznať vnútorné postupy úradu.",
              },
              {
                icon: Fingerprint,
                title: "Vedomé zverejnenie",
                text: "Koncept je koncept. Zverejnenie je samostatný krok a stav dokumentu je v pracovnom portáli viditeľný.",
              },
              {
                icon: Monitor,
                title: "Vyskúšateľný produkt",
                text: "Ukazujeme funkčné demo s ukladaním dokumentov a príloh. Obrázky na webe pochádzajú z tohto prostredia.",
              },
              {
                icon: Scale,
                title: "Jasné hranice",
                text: "Demo sa nevydáva za oficiálny portál mesta ani za potvrdenie splnenia zákonných povinností.",
              },
              {
                icon: GitPullRequest,
                title: "Priestor na spoluprácu",
                text: "Podnety a návrhy môžete otvoriť na GitHube. Rozvoj projektu je možné sledovať pri zdrojovom kóde.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <AgendaStrip />
      <Cta />
    </main>
  );
}
