import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { DemoLinks } from "../components/demo-links";
export function HomeSections() {
  return (
    <>
      <section aria-labelledby="workflow-title" className="marketing-workflow-body">
        <p className="max-w-prose leading-7 text-muted-foreground">
          Od rozpracovaného záznamu po dokument dostupný občanom. Údaje aj prílohy spravujete v
          jednej evidencii.
        </p>
        <ol className="grid gap-8 sm:grid-cols-3">
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
          ].map((step) => (
            <li key={step.title}>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="mx-auto max-w-7xl space-y-8 px-6 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Vyskúšajte obe strany obce</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
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
