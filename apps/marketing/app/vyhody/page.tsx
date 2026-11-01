import { AGENDAS } from "@openobec/api-client";
import { Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@openobec/ui/components/table";
import { MarketingHeader, MarketingFooter } from "../components/site-shell";
import { DemoLinks } from "../components/demo-links";
export const metadata = { title: "Výhody" };
export default function Benefits() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-7xl space-y-16 px-6 py-12 sm:py-16">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Dokumenty, v ktorých sa dá vyznať.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Povinné dokumenty bývajú roztrúsené medzi stránkami a portálmi. OpenObec ich spája do
            prehľadnej evidencie s jednoduchou cestou od vytvorenia po zverejnenie.
          </p>
        </section>
        <div className="grid gap-12 border-y py-10 md:grid-cols-2">
          {[
            {
              title: "Občan nájde, čo hľadá",
              items: [
                "Vyhľadanie podľa názvu, čísla alebo kľúčového slova.",
                "Prehľadné zoznamy podľa agendy.",
                "Súvisiace faktúry, objednávky a zmluvy na jednom mieste.",
                "Prílohy dostupné priamo pri zverejnenom dokumente.",
              ],
            },
            {
              title: "Úradník má poriadok v evidencii",
              items: [
                "Jedno miesto na vytvorenie a úpravu dokumentov.",
                "Uloženie konceptu pred zverejnením.",
                "Výber súvislostí a správa príloh.",
                "Prehľad posledných zmien a záznamov v jednotlivých agendách.",
              ],
            },
          ].map((group) => (
            <section key={group.title}>
              <h2 className="text-2xl font-semibold tracking-tight">{group.title}</h2>
              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight">Šesť agend, spoločný prehľad</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agenda</TableHead>
                  <TableHead>V ukážke môžete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {AGENDAS.map((a) => (
                  <TableRow key={a.slug}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>Vytvoriť koncept, pridať prílohy a zverejniť dokument</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <section className="grid gap-6 rounded-xl bg-secondary p-6 sm:p-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Navrhovaná cena služby</h2>
            <p className="mt-4 text-3xl font-semibold text-primary">
              199 € <span className="text-lg font-normal text-foreground">/ rok</span>
            </p>
          </div>
          <p className="max-w-prose self-center leading-7 text-foreground/80">
            Ročný cenový návrh dopĺňa implementačný poplatok podľa rozsahu nasadenia. Jeho výška a
            režim DPH zatiaľ nie sú určené.
          </p>
        </section>
        <DemoLinks />
      </main>
      <MarketingFooter />
    </>
  );
}
