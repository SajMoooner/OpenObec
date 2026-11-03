import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Receipt,
  ShoppingBag,
  Landmark,
  Scale,
  Files,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { publicLinks } from "@openobec/api-client/server";
export { ProductImage } from "./product-image";
export function DemoActions({
  secondary = "Ako to funguje",
  href = "/vyhody",
}: {
  secondary?: string;
  href?: string;
}) {
  const links = publicLinks();
  return (
    <div className="action-row">
      <Button asChild className="m-button">
        <a href={`${links.office}/uradnik/prihlasenie`}>
          Vyskúšať pracovný portál <ArrowRight size={16} />
        </a>
      </Button>
      <Button asChild variant="outline" className="m-button">
        <Link href={href}>{secondary}</Link>
      </Button>
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
  { title: "Faktúry", icon: Receipt, text: "Odberateľské faktúry s údajmi, stavom a prílohami." },
  {
    title: "Dodávateľské faktúry",
    icon: Files,
    text: "Prijaté faktúry v súvislosti so zmluvami a objednávkami.",
  },
  {
    title: "Objednávky",
    icon: ShoppingBag,
    text: "Predmet objednávky, dodávateľ a súvisiace dokumenty.",
  },
  {
    title: "Zmluvy",
    icon: FileText,
    text: "Zmluvné strany, dátumy, prílohy a nadväzujúce záznamy.",
  },
  {
    title: "Verejné obstarávanie",
    icon: Landmark,
    text: "Samostatná agenda pre dokumenty verejného obstarávania.",
  },
  { title: "VZN", icon: Scale, text: "Nariadenia obce vo vlastnej prehľadnej evidencii." },
];
export function AgendaStrip() {
  return (
    <section className="agenda-strip m-container" aria-label="Podporované agendy">
      <p>Jedno miesto pre každodenné agendy obce</p>
      <div>
        {agendas.map(({ title, icon: Icon }) => (
          <span key={title}>
            <Icon aria-hidden="true" />
            {title}
          </span>
        ))}
      </div>
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
