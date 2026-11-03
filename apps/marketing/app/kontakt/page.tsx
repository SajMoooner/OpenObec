import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, MessageSquare, Monitor } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
export const metadata = { title: "Kontakt" };
export default function Contact() {
  return (
    <main id="obsah">
      <section className="contact-section m-container">
        <div className="section-heading">
          <h1>Porozprávajme sa.</h1>
          <p>
            Zaujíma vás OpenObec pre vašu obec? Máte nápad na zlepšenie? Projekt je otvorený aj
            vašim podnetom.
          </p>
        </div>
        <div className="contact-panel">
          <h2>Začnime tým, čo potrebujete.</h2>
          <p>
            Aktuálne nás nájdete pri projekte na GitHube. Vyberte si, či chcete produkt najprv
            vyskúšať alebo otvoriť konkrétnu tému.
          </p>
          <div className="contact-options">
            <section>
              <MessageSquare aria-hidden="true" />
              <div>
                <h3>Verejný podnet</h3>
                <p>
                  Otázka k používaniu, návrh funkcie alebo záujem o plánovanú službu. Na GitHube
                  môžete založiť nový podnet.
                </p>
                <a className="text-link" href="https://github.com/SajMoooner/OpenObec/issues/new">
                  Pripraviť podnet na GitHube <ArrowUpRight size={16} />
                </a>
                <p className="contact-note">
                  Vyžaduje účet GitHub. Podnet je verejný; nevkladajte osobné údaje ani interné
                  dokumenty obce.
                </p>
              </div>
            </section>
            <section>
              <Monitor aria-hidden="true" />
              <div>
                <h3>Najprv si OpenObec vyskúšam</h3>
                <p>
                  Prejdite si prípravu dokumentu a jeho zverejnenie. Bez objednávania, s ukážkovými
                  údajmi.
                </p>
                <Link href="/demo" className="text-link">
                  Otvoriť sprievodcu demom <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
          <Button asChild className="m-button">
            <a href="https://github.com/SajMoooner/OpenObec">
              <Code2 />
              Otvoriť GitHub projektu
            </a>
          </Button>
          <p className="contact-footnote">
            Odkazy vás prevedú na GitHub alebo do dema. Z tejto stránky sa žiadna správa automaticky
            neodosiela.
          </p>
        </div>
      </section>
    </main>
  );
}
