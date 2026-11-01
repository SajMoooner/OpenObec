import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { DemoLinks } from "../components/demo-links";
export const metadata = { title: "Demo" };
export default function Demo() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-5xl space-y-10 px-6 py-12 sm:py-20">
        <section className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Spoznajte OpenObec v praxi.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Vyberte si pohľad občana alebo pracovný portál. Na vstup do dema nepotrebujete heslo.
          </p>
        </section>
        <DemoLinks />
        <p className="max-w-prose text-sm leading-6 text-muted-foreground">
          Ukážkové údaje slúžia na vyskúšanie aplikácie. Nejde o oficiálne dokumenty ani oficiálny
          portál mesta Žilina.
        </p>
      </main>
      <MarketingFooter />
    </>
  );
}
