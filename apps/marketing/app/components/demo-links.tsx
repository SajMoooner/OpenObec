import { ArrowRight, FileSearch, Files } from "lucide-react";
import { publicLinks } from "@openobec/api-client/server";
import { Button } from "@openobec/ui/components/button";
export function DemoLinks() {
  const links = publicLinks();
  return (
    <div className="grid divide-y rounded-xl border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <section className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <FileSearch className="size-7 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Pre občana</h2>
          <p className="mt-3 max-w-prose leading-7 text-muted-foreground">
            Vyhľadajte dokument, prezrite si jeho údaje, súvislosti a stiahnite prílohu.
          </p>
        </div>
        <Button asChild className="mt-auto">
          <a href={`${links.citizen}/obcan/home`}>
            Otvoriť občianske demo
            <ArrowRight />
          </a>
        </Button>
      </section>
      <section className="flex flex-col items-start gap-5 p-6 sm:p-8">
        <Files className="size-7 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Pre úradníka</h2>
          <p className="mt-3 max-w-prose leading-7 text-muted-foreground">
            Pridajte dokument s prílohou, prepojte ho so záznamami a zverejnite pre občanov.
          </p>
        </div>
        <Button asChild variant="outline" className="mt-auto">
          <a href={`${links.office}/uradnik/prihlasenie`}>
            Otvoriť pracovné demo
            <ArrowRight />
          </a>
        </Button>
      </section>
    </div>
  );
}
