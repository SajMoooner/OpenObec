import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AGENDAS } from "@openobec/api-client";
import { publicLinks } from "@openobec/api-client/server";
import { Button } from "@openobec/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@openobec/ui/components/accordion";
import { ProductPreview } from "../components/product-preview";
import { DemoLinks } from "../components/demo-links";
const agendaDescriptions = [
  "Prehľad vystavených faktúr, odberateľov a vyúčtovaných súm.",
  "Prijaté faktúry s údajmi o dodávateľovi, sumách a súvislostiach.",
  "Zmluvné strany, predmet, platnosť aj priložené znenie zmluvy.",
  "Čo obec objednala, u koho a za akú cenu.",
  "Predmet zákazky, stav, predpokladaná hodnota a lehota ponúk.",
  "Všeobecne záväzné nariadenia prehľadne na jednom mieste.",
];
const questions = [
  [
    "Pre koho je OpenObec určená?",
    "Pre obce a mestá, ktoré chcú zjednodušiť evidenciu a sprístupniť dokumenty občanom. Úradník pracuje v pracovnom portáli, občan vo verejnom prehľade.",
  ],
  [
    "Musí sa občan prihlásiť?",
    "Nie. Publikované dokumenty, ich údaje a prílohy si občan môže prezerať bez účtu. Koncepty zostávajú mimo občianskeho portálu.",
  ],
  [
    "Ako spolu súvisia dokumenty?",
    "Úradník vyberá súvislosti priamo pri dokumente. Pri finančných a obstarávacích agendách tak môžete prejsť napríklad zo zmluvy k objednávke či faktúre. VZN sa vedú samostatne.",
  ],
  [
    "Aké prílohy možno pridať?",
    "PDF, PNG alebo JPEG, najviac 10 príloh k dokumentu a do 20 MiB na súbor. Občan si prílohu publikovaného dokumentu môže stiahnuť.",
  ],
  [
    "Dá sa OpenObec prepojiť s informačným systémom obce?",
    "Prepojenie s mestským IS patrí do plánovaného smerovania produktu. V tomto deme je pripojenie iba simulované; skutočný prenos dát z IS ani externých registrov nie je zapojený.",
  ],
  [
    "Čo znamená cena 199 € ročne?",
    "Je to navrhovaný ročný paušál produktu. Implementačný poplatok a režim DPH zatiaľ nie sú určené. Táto stránka slúži na predstavenie a vyskúšanie produktu, neobsahuje objednávku ani platbu.",
  ],
];
export function HomeSections() {
  const links = publicLinks();
  return (
    <>
      <section className="marketing-container marketing-section" aria-labelledby="benefits-title">
        <div className="max-w-3xl">
          <h2 id="benefits-title" className="marketing-section-title">
            Menej hľadania. Viac prehľadu.
          </h2>
          <p className="marketing-section-copy">
            Dva pohľady na jednu evidenciu: občan číta zverejnené dokumenty, úradník pripravuje
            ďalšie.
          </p>
        </div>
        <div className="product-story mt-10">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Od zmluvy k jej prílohe a súvislostiam
            </h3>
            <p className="marketing-section-copy">
              Pri obnove knižnice občan vidí, s kým obec uzavrela zmluvu, odkedy je účinná a aká je
              suma s DPH. Z toho istého detailu stiahne PDF a prejde na prepojenú objednávku či
              faktúru.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <a href={`${links.citizen}/obcan/zmluvy`}>
                Preskúmať zmluvy <ArrowRight />
              </a>
            </Button>
          </div>
          <ProductPreview role="citizen" />
        </div>
        <div className="product-story product-story-reverse mt-16 border-t pt-16">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Pokračujte tam, kde práca zostala
            </h3>
            <p className="marketing-section-copy">
              Úradník po otvorení prehľadu rozlíši koncepty od zverejnených dokumentov. Rozpracovaný
              záznam otvorí priamo, doplní prílohu a rozhodne o zverejnení.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <a href={`${links.office}/uradnik/prihlasenie`}>
                Vyskúšať pracovný prehľad <ArrowRight />
              </a>
            </Button>
          </div>
          <ProductPreview role="office" />
        </div>
      </section>
      <section className="border-y bg-secondary" aria-labelledby="agendas-title">
        <div className="marketing-container marketing-section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="agendas-title" className="marketing-section-title">
                Šesť agend na jednom mieste
              </h2>
              <p className="marketing-section-copy">
                Od faktúr a zmlúv až po pravidlá obce. Každá agenda má vlastné údaje, jednotný
                spôsob prezerania a priestor pre prílohy.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/vyhody">
                Pozrieť všetky výhody
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <dl className="mt-9 grid gap-x-12 md:grid-cols-2">
            {AGENDAS.map((a, i) => (
              <div className="border-t border-foreground/15 py-6" key={a.slug}>
                <dt>
                  <a
                    className="group inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                    href={`${links.citizen}/obcan/${a.slug}`}
                  >
                    {a.title}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </dt>
                <dd className="mt-2 max-w-prose text-sm leading-6 text-foreground/75">
                  {agendaDescriptions[i]}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section
        id="postup"
        className="marketing-container marketing-section"
        aria-labelledby="workflow-title"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="workflow-title" className="marketing-section-title">
              Jednoduché v 3 krokoch
            </h2>
            <p className="marketing-section-copy">
              Od rozpracovaného záznamu po dokument dostupný občanom. Údaje aj prílohy spravujete v
              jednej evidencii.
            </p>
          </div>
          <ol className="grid gap-7 sm:grid-cols-3">
            {[
              {
                title: "Vyberte dokument",
                text: "Zvoľte jednu zo šiestich agend a vytvorte nový záznam.",
              },
              {
                title: "Doplňte údaje",
                text: "Vyplňte potrebné polia, vyberte súvislosti a priložte súbor.",
              },
              { title: "Zverejnite", text: "Hotový dokument sprístupnite v občianskom portáli." },
            ].map((step, i) => (
              <li key={step.title}>
                <span
                  className="mb-5 flex size-10 items-center justify-center rounded-full bg-secondary font-semibold text-primary"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section id="cena" className="border-y bg-secondary" aria-labelledby="offer-title">
        <div className="marketing-container marketing-section">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <h2 id="offer-title" className="marketing-section-title">
                Navrhovaná cena služby
              </h2>
              <p className="marketing-price-copy marketing-section-copy !text-foreground/75">
                Jeden ročný paušál za evidenciu dokumentov a ich verejné sprístupnenie. Cena je
                návrh, nie záväzná ponuka.
              </p>
              <p className="mt-6 text-5xl font-semibold tracking-tight">
                <span className="text-primary">199 €</span>
                <span className="text-2xl"> / rok</span>
              </p>
              <p className="mt-4 max-w-lg text-sm leading-6 text-foreground/75">
                Návrh ročného paušálu. Implementačný poplatok a DPH zatiaľ nie sú určené.
              </p>
              <Button asChild className="mt-6">
                <Link href="/demo">
                  Najprv si OpenObec vyskúšajte
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="rounded-xl border bg-background p-6 sm:p-8">
              <h3 className="text-xl font-semibold">Čo si môžete v deme vyskúšať</h3>
              <ul className="mt-6 space-y-4">
                {[
                  "Verejný portál pre občanov",
                  "Pracovný portál a šesť agend",
                  "Záznamy s údajmi a súborovými prílohami",
                  "Explicitne vybrané súvislosti dokumentov",
                  "Celý postup od konceptu po zverejnenie",
                ].map((text) => (
                  <li key={text} className="flex gap-3 text-sm leading-6">
                    <Check className="mt-1 size-4 shrink-0 text-primary" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section
        id="otazky"
        className="marketing-container marketing-section"
        aria-labelledby="faq-title"
      >
        <div className="grid gap-9 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 id="faq-title" className="marketing-section-title">
              Časté otázky
            </h2>
            <p className="marketing-section-copy">
              Čo OpenObec dnes vie a čo patrí do ďalšieho rozvoja.
            </p>
          </div>
          <Accordion type="single" collapsible>
            {questions.map(([q, a], i) => (
              <AccordionItem key={q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent className="max-w-prose leading-7 text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <section
        className="marketing-container marketing-section border-t"
        aria-labelledby="demo-title"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <h2 id="demo-title" className="marketing-section-title">
              Vyskúšajte obe strany obce
            </h2>
            <p className="marketing-section-copy">
              Ukážkové dokumenty Žiliny vám priblížia vyhľadávanie aj publikovanie. Všetky údaje a
              organizácie sú fiktívne.
            </p>
          </div>
          <Button variant="link" asChild>
            <Link href="/vyhody">
              Čo OpenObec prináša
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <DemoLinks />
      </section>
    </>
  );
}
