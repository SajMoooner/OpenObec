import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { AgendaGrid, Cta, SectionHeading } from "../components/sections";
import { Faq } from "../components/faq";
export const metadata = { title: "Cenník" };
export default function Pricing() {
  return (
    <main id="obsah">
      <section className="m-container pricing-hero">
        <div className="hero-copy">
          <h1>
            Otvorený kód.
            <br />
            Jednoduché možnosti.
          </h1>
          <p>
            Vlastná prevádzka bez licenčného poplatku. Alebo pripravovaná služba pre obec, ktorá
            chce prevádzku zveriť nám.
          </p>
        </div>
        <div className="pricing-grid">
          <article className="price-card price-featured">
            <div className="price-description">
              <h2>Spravovaná služba</h2>
              <span className="plan-status">Pripravujeme</span>
              <p>Plánovaná prevádzka OpenObec ako služby pre vašu samosprávu.</p>
              <div className="price">
                199 €<span> / rok</span>
              </div>
              <p className="price-note">Navrhovaná cena služby.</p>
            </div>
            <ul>
              {[
                "Šesť dokumentových agend",
                "Pracovný a občiansky portál",
                "Plánovaná správa prevádzky",
                "Implementácia individuálne",
              ].map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="m-button">
              <Link href="/kontakt">
                Mám záujem <ArrowRight />
              </Link>
            </Button>
          </article>
          <article className="price-card">
            <div className="price-description">
              <h2>Vlastná prevádzka</h2>
              <span className="plan-status">Otvorený kód</span>
              <p>Zdrojový kód a dokumentácia pre spustenie vo vlastnom prostredí.</p>
              <div className="price">Bez poplatku</div>
              <p className="price-note">Za licenciu. Prevádzku zabezpečujete vy.</p>
            </div>
            <ul>
              {[
                "Rovnaké funkcie projektu",
                "Prístup k zdrojovému kódu",
                "Vlastná infraštruktúra",
                "Vlastná správa a aktualizácie",
              ].map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="m-button">
              <a href="https://github.com/SajMoooner/OpenObec">
                Pozrieť zdrojový kód <ArrowRight />
              </a>
            </Button>
          </article>
        </div>
        <p className="pricing-disclaimer">
          Spravovaná služba je obchodný zámer, zatiaľ bez objednávania a platieb. Implementačný
          poplatok a režim DPH nie sú určené.
        </p>
      </section>
      <section className="section m-container">
        <SectionHeading title="Čo si môžete vyskúšať už dnes">
          Funkcie dema sú dostupné bez predplatného. V každej agende si overíte prácu s dokumentmi.
        </SectionHeading>
        <AgendaGrid />
        <div className="section-link">
          <Button asChild className="m-button">
            <Link href="/demo">
              Vyskúšať demo <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
      <section className="section m-container comparison-section">
        <SectionHeading title="Vyberte si spôsob prevádzky">
          Rozdiel je v tom, kto sa stará o prostredie. Otvorený produkt ostáva základom oboch
          možností.
        </SectionHeading>
        <div className="comparison-wrap">
          <table>
            <caption className="sr-only">
              Porovnanie vlastnej prevádzky a plánovanej spravovanej služby
            </caption>
            <thead>
              <tr>
                <th scope="col">Oblasť</th>
                <th scope="col">Vlastná prevádzka</th>
                <th scope="col">Plánovaná služba</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Zdrojový kód", "Otvorený", "Otvorený"],
                ["Pracovný a občiansky portál", "Súčasť projektu", "Súčasť zámeru"],
                ["Infraštruktúra a údržba", "Vo vašej réžii", "Plánovaná súčasť služby"],
                ["Cena", "Bez licenčného poplatku", "Návrh 199 € / rok"],
                ["Implementácia", "Vlastnými kapacitami", "Individuálne"],
                ["Dostupnosť", "Repozitár a lokálne demo", "Pripravujeme"],
              ].map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Faq />
      <Cta />
    </main>
  );
}
