import Link from "next/link";
import { ArrowRight, FilePenLine, Paperclip, Send } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import {
  AgendaStrip,
  AgendaGrid,
  Cta,
  DemoActions,
  ProductImage,
  SectionHeading,
} from "../components/sections";
import { ProductDetail } from "../components/product-detail";
import { HeroGrid } from "../components/hero-grid";
import { ShowcaseMotion } from "../components/showcase-motion";
import { Faq } from "../components/faq";
const features = [
  {
    title: "Rozpracujte teraz. Zverejnite, keď je čas.",
    text: "Koncepty majú vlastné miesto. Údaje si pripravíte a skontrolujete skôr, než ich sprístupníte občanom.",
    src: "/illustrations/preparation.png",
    detail: "preparation" as const,
    alt: "Príprava konceptu faktúry v pracovnom portáli.",
  },
  {
    title: "PDF aj údaje patria k sebe.",
    text: "Prílohu otvoríte priamo pri zázname. Názov dokumentu, dátumy a sumy zostávajú v prehľadnom detaile.",
    src: "/illustrations/attachment.png",
    detail: "attachment" as const,
    alt: "Detail zverejnenej faktúry s údajmi a prílohou PDF.",
  },
  {
    title: "Súvislosti na jedno otvorenie.",
    text: "Prepojte faktúru so zmluvou či objednávkou. Súvisiace dokumenty nemusíte opäť hľadať od začiatku.",
    src: "/illustrations/relations.png",
    detail: "relations" as const,
    alt: "Detail zmluvy a zoznam jej súvisiacich dokumentov.",
  },
  {
    title: "Výsledok dostupný občanom.",
    text: "Zverejnený dokument má vlastný verejný detail. Občan v ňom nájde údaje, prílohy aj súvislosti.",
    src: "/illustrations/publication.png",
    detail: "citizen" as const,
    alt: "Verejný detail ukážkovej faktúry.",
  },
];
export default function Home() {
  return (
    <main id="obsah">
      <ShowcaseMotion />
      <section className="home-hero">
        <HeroGrid />
        <div className="m-container">
          <div className="hero-copy">
            <h1>
              Zverejňovanie dokumentov,
              <br className="desktop-break" /> v ktorom máte poriadok.
            </h1>
            <p>
              Od prvého konceptu po verejný dokument. Pripravte údaje, priložte PDF a prepojte
              súvislosti v jednom pracovnom portáli.
            </p>
            <DemoActions />
          </div>
          <figure className="hero-product">
            <div>
              <ProductImage
                priority
                src="/previews/office-overview.png"
                alt="Pracovný portál OpenObec: prehľad ukážkových konceptov, zverejnených dokumentov a šiestich agend."
              />
            </div>
            <figcaption>Pracovný portál OpenObec · ukážkové údaje</figcaption>
          </figure>
        </div>
      </section>
      <AgendaStrip />
      <section className="section m-container">
        <SectionHeading title="Všetko, čo dokument potrebuje. Na jednom mieste.">
          Jeden postup pre každodennú prácu úradu. Od prípravy údajov až po prehľadný výsledok pre
          občanov.
        </SectionHeading>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <ProductDetail src={feature.src} alt={feature.alt} detail={feature.detail} />
            </article>
          ))}
        </div>
        <p className="image-caption center">
          Ilustrácie približujú prácu s dokumentmi. Skutočný portál si môžete vyskúšať v deme.
        </p>
      </section>
      <section className="section m-container">
        <SectionHeading title="Šesť agend. Rovnaký spôsob práce.">
          Zmluvy, faktúry aj nariadenia majú svoje miesto. Medzi agendami prechádzate v jednom
          prostredí.
        </SectionHeading>
        <AgendaGrid />
        <div className="section-link">
          <Button asChild className="m-button">
            <Link href="/vyhody">
              Preskúmať výhody <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <section className="workflow-section section" id="ako-to-funguje">
        <div className="m-container">
          <SectionHeading title="Od konceptu k občanovi v troch krokoch">
            Dokument pripravíte v pracovnom portáli. Zverejnený výsledok si overíte z pohľadu
            občana.
          </SectionHeading>
          <div className="workflow-grid">
            {[
              {
                icon: FilePenLine,
                title: "Pripravte dokument",
                text: "Vyberte agendu, vyplňte údaje a uložte rozpracovaný koncept.",
              },
              {
                icon: Paperclip,
                title: "Priložte a prepojte",
                text: "Pridajte PDF a vyberte záznamy, ktoré s dokumentom súvisia.",
              },
              {
                icon: Send,
                title: "Zverejnite výsledok",
                text: "Sprístupnite pripravený dokument a pozrite si jeho verejný detail.",
              },
            ].map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <div className="workflow-top">
                  <span>Krok {index + 1}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="section-link">
            <Link className="text-link" href="/demo">
              Prejsť celým postupom v deme <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <Faq />
      <section className="section m-container">
        <SectionHeading title="Spoznajte OpenObec bližšie">
          Pozrite si jednotlivé pohľady aj možnosti otvoreného projektu.
        </SectionHeading>
        <div className="editorial-grid">
          {[
            {
              title: "Celý postup zverejnenia",
              text: "Vyskúšajte si prácu s jedným dokumentom od začiatku do konca.",
              href: "/demo",
              image: "/illustrations/preparation.png",
            },
            {
              title: "Čo vidí občan",
              text: "Údaje, prílohy a prepojené záznamy vo verejnom detaile.",
              href: "/vyhody",
              image: "/illustrations/publication.png",
            },
            {
              title: "Prečo vzniká OpenObec",
              text: "Otvorený nástroj pre každodenné dokumenty samosprávy.",
              href: "/o-nas",
              image: "/illustrations/preparation.png",
            },
            {
              title: "Možnosti prevádzky",
              text: "Vlastné prostredie alebo pripravovaná spravovaná služba.",
              href: "/pricing",
              image: "/illustrations/relations.png",
            },
          ].map((item) => (
            <Link className="editorial-item" href={item.href} key={item.title}>
              <div>
                <ProductImage src={item.image} alt="" />
              </div>
              <article>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="text-link">
                  Pozrieť viac <ArrowRight size={14} />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>
      <Cta />
    </main>
  );
}
