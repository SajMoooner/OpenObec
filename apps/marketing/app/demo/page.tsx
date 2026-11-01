import { ArrowRight } from "lucide-react";
import { publicLinks } from "@openobec/api-client/server";
import { Button } from "@openobec/ui/components/button";
import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { ProductPreview } from "../components/product-preview";
import "../home/marketing.css";
export const metadata = { title: "Demo" };
export default function Demo() {
  const links = publicLinks();
  return (
    <>
      <MarketingHeader />
      <main className="marketing-container marketing-page">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Spoznajte OpenObec v praxi.
          </h1>
          <p className="marketing-section-copy text-lg">
            Vyberte si pohľad občana alebo pracovný portál. Na vstup do dema nepotrebujete heslo.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Všetky údaje a organizácie sú fiktívne. Nejde o oficiálne dokumenty ani oficiálny portál
            mesta Žilina.
          </p>
        </section>
        {(
          [
            {
              role: "citizen",
              title: "Pre občana",
              description: "Nájdite dokument a pochopte jeho súvislosti.",
              steps: [
                "Vyhľadajte napríklad knižnicu alebo otvorte agendu Zmluvy.",
                "V detaile si pozrite zmluvnú stranu, účinnosť a sumu s DPH.",
                "Stiahnite dostupnú prílohu a otvorte súvisiaci dokument.",
              ],
              href: `${links.citizen}/obcan/home`,
              action: "Otvoriť občianske demo",
            },
            {
              role: "office",
              title: "Pre úradníka",
              description: "Prejdite od konceptu k verejnému dokumentu.",
              steps: [
                "Vstúpte do dema a z prehľadu zvoľte Pridať dokument.",
                "Vyplňte údaje, priložte súbor a uložte vlastný koncept.",
                "Zverejnite dokument a overte ho v občianskom portáli.",
              ],
              href: `${links.office}/uradnik/prihlasenie`,
              action: "Otvoriť pracovné demo",
            },
          ] as const
        ).map((item) => (
          <section key={item.role} className="product-story border-t pt-10">
            <div>
              <h2 className="marketing-section-title">{item.title}</h2>
              <p className="marketing-section-copy">{item.description}</p>
              <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-6 marker:font-semibold marker:text-primary">
                {item.steps.map((step) => (
                  <li key={step} className="pl-2">
                    {step}
                  </li>
                ))}
              </ol>
              <Button asChild className="mt-7">
                <a href={item.href}>
                  {item.action}
                  <ArrowRight />
                </a>
              </Button>
              {item.role === "office" && (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  Zmeny sa v deme ukladajú. Na skúšanie vytvorte vlastný ukážkový záznam. Pripojenie
                  mestského IS je iba simulácia.
                </p>
              )}
            </div>
            <ProductPreview role={item.role} />
          </section>
        ))}
      </main>
      <MarketingFooter />
    </>
  );
}
