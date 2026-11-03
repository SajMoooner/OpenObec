import Link from "next/link";
import {
  ArrowRight,
  FileOutput,
  FileInput,
  ClipboardList,
  FileSignature,
  ListChecks,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@openobec/ui/components/button";
export { ProductImage } from "./product-image";
export function DemoActions({
  secondary = "Ako to funguje",
  href = "/vyhody",
}: {
  secondary?: string;
  href?: string;
}) {
  return (
    <div className="action-row">
      <Button asChild className="m-button">
        <Link href="/demo">
          Vyskúšať demo <ArrowRight size={16} />
        </Link>
      </Button>
      {href !== "/demo" && (
        <Button asChild variant="outline" className="m-button">
          <Link href={href}>{secondary}</Link>
        </Button>
      )}
    </div>
  );
}
export function SectionHeading({
  title,
  children,
  left = false,
}: {
  title: string;
  children?: React.ReactNode;
  left?: boolean;
}) {
  return (
    <div className={`section-heading${left ? " left" : ""}`}>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Cta() {
  return (
    <section className="cta-section">
      <div className="m-container">
        <h2>
          Menej hľadania.
          <br />
          Viac poriadku v dokumentoch.
        </h2>
        <p>Začnite jedným dokumentom. Celý postup si vyskúšate v deme.</p>
        <DemoActions secondary="Porozprávajme sa" href="/kontakt" />
      </div>
    </section>
  );
}
export const agendas: { title: string; icon: LucideIcon; text: string }[] = [
  {
    title: "Faktúry",
    icon: FileOutput,
    text: "Odberateľské faktúry s údajmi, stavom a prílohami.",
  },
  {
    title: "Dodávateľské faktúry",
    icon: FileInput,
    text: "Prijaté faktúry v súvislosti so zmluvami a objednávkami.",
  },
  {
    title: "Objednávky",
    icon: ClipboardList,
    text: "Predmet objednávky, dodávateľ a súvisiace dokumenty.",
  },
  {
    title: "Zmluvy",
    icon: FileSignature,
    text: "Zmluvné strany, dátumy, prílohy a nadväzujúce záznamy.",
  },
  {
    title: "Verejné obstarávanie",
    icon: ListChecks,
    text: "Samostatná agenda pre dokumenty verejného obstarávania.",
  },
  { title: "VZN", icon: ScrollText, text: "Nariadenia obce vo vlastnej prehľadnej evidencii." },
];
export function AgendaStrip() {
  return (
    <section className="agenda-strip m-container" aria-label="Podporované agendy">
      <p>Jedno miesto pre každodenné agendy obce</p>
      <ul className="agenda-index">
        {agendas.map(({ title, icon: Icon }) => (
          <li key={title}>
            <Icon aria-hidden="true" strokeWidth={1.6} />
            <span>{title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
export function AgendaGrid() {
  return (
    <div className="agenda-grid">
      {agendas.map(({ title, text, icon: Icon }) => (
        <article key={title}>
          <div className="icon-box">
            <Icon aria-hidden="true" />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
