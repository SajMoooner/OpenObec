"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Search, FileText, Users, Shield } from "lucide-react";
import { AGENDAS, type AgendaSlug } from "@openobec/api-client";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Label } from "@openobec/ui/components/label";
import { Tabs, TabsList, TabsTrigger } from "@openobec/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@openobec/ui/components/table";
const examples = [
  { title: "Zmluva o dielo", agenda: "zmluvy", date: "12. 3. 2024" },
  { title: "Projektové práce", agenda: "objednavky", date: "5. 2. 2024" },
  { title: "Údržba zelene", agenda: "faktury", date: "18. 1. 2024" },
] as const;
const byAgenda: Record<AgendaSlug, string[]> = {
  faktury: ["Údržba zelene", "Komunálne služby", "Správa verejných priestorov"],
  "dodavatelske-faktury": [
    "Dodávka kancelárskych potrieb",
    "Oprava verejného osvetlenia",
    "Údržba mestského parku",
  ],
  zmluvy: ["Zmluva o dielo", "Nájom mestských priestorov", "Správa športoviska"],
  objednavky: ["Projektové práce", "Sadovnícke práce", "Servis výpočtovej techniky"],
  "verejne-obstaravanie": [
    "Obnova verejných priestorov",
    "Revitalizácia mestského parku",
    "Rekonštrukcia chodníka",
  ],
  vzn: [
    "Nakladanie s komunálnym odpadom",
    "Miestne dane a poplatky",
    "Prevádzka verejného trhoviska",
  ],
};
export function MarketingHero({ citizen, office }: { citizen: string; office: string }) {
  const [q, setQ] = useState("");
  const [agenda, setAgenda] = useState("vsetky");
  const rows =
    agenda === "vsetky"
      ? examples
      : byAgenda[agenda as AgendaSlug].map((title, i) => ({
          title,
          agenda: agenda as AgendaSlug,
          date: examples[i].date,
        }));
  const searchTarget = agenda === "vsetky" ? `${citizen}/obcan/home` : `${citizen}/obcan/${agenda}`;
  return (
    <div className="comp-frame marketing-opening">
      <div className="r-navigation-ground navy-ground" />
      <div className="r-hero-ground navy-ground" />
      <div className="r-offer-ground offer-ground" />
      <div className="r-register-panel register-panel" />
      <div className="r-skyline skyline">
        <Image
          src="/assets/plates/skyline.png"
          width={2172}
          height={724}
          alt=""
          priority
          unoptimized
        />
      </div>
      <header>
        <Link href="/home" className="r-masthead marketing-brand" aria-label="OpenObec – úvod">
          OpenObec
        </Link>
        <nav aria-label="Hlavná navigácia">
          <Link className="r-nav-benefits marketing-nav-link" href="/vyhody">
            Výhody
          </Link>
          <Link className="r-nav-contact marketing-nav-link" href="/kontakt">
            Kontakt
          </Link>
          <Button className="r-nav-demo marketing-demo" variant="secondary" asChild>
            <Link href="/demo">
              Otvoriť demo
              <ExternalLink />
            </Link>
          </Button>
        </nav>
      </header>
      <section aria-labelledby="headline">
        <h1 id="headline" className="r-headline marketing-headline">
          Dokumenty obce
          <br />
          jednoducho dostupné.
        </h1>
        <p className="r-intro marketing-intro">
          Jedno miesto pre občanov. <br />
          Jednoduchšia evidencia pre úradníkov.
        </p>
        <Button className="r-citizen-demo marketing-action" asChild>
          <a href={`${citizen}/obcan/home`}>
            Občianske demo
            <ArrowRight />
          </a>
        </Button>
        <Button className="r-office-demo marketing-action" variant="secondary" asChild>
          <a href={`${office}/uradnik/prihlasenie`}>
            Demo pre úradníka
            <ArrowRight />
          </a>
        </Button>
      </section>
      <section aria-labelledby="register-title">
        <h2 id="register-title" className="r-search-heading marketing-search-heading">
          Vyhľadať dokumenty
        </h2>
        <p className="r-sample-label marketing-sample">Ukážkové dáta · Žilina</p>
        <form action={searchTarget} method="get">
          <div className="r-search-input marketing-search">
            <Search aria-hidden="true" />
            <Label className="sr-only" htmlFor="marketing-search">
              Názov, kľúčové slovo alebo číslo dokumentu
            </Label>
            <Input
              id="marketing-search"
              name="q"
              value={q}
              maxLength={200}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zadajte názov, kľúčové slovo alebo číslo dokumentu…"
              type="search"
            />
          </div>
          <Button type="submit" className="r-search-button marketing-action">
            Hľadať
          </Button>
        </form>
        <Tabs value={agenda} onValueChange={setAgenda} className="r-agenda-tabs marketing-tabs">
          <TabsList variant="line" aria-label="Agendy ukážkových dokumentov">
            <TabsTrigger value="vsetky">Všetky</TabsTrigger>
            {AGENDAS.map((a) => (
              <TabsTrigger key={a.slug} value={a.slug}>
                {a.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="marketing-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Príklad dokumentu</TableHead>
                <TableHead>Agenda</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead>Ukážka agendy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.title}>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell>{AGENDAS.find((a) => a.slug === row.agenda)?.title}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <a
                      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      href={`${citizen}/obcan/${row.agenda}`}
                    >
                      Otvoriť agendu
                      <ArrowRight className="size-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
      <section aria-labelledby="offer-title">
        <h2 id="offer-title" className="r-price-title marketing-price-title">
          Navrhovaná cena služby
        </h2>
        <p className="r-price-copy marketing-price-copy">
          Moderné riešenie pre zverejňovanie a evidenciu <br />
          dokumentov obce. Prehľadné a ľahko použiteľné.
        </p>
        <p className="r-price-value marketing-price">
          <span>199 €</span> / rok
        </p>
        <div className="r-benefit-citizens-icon marketing-benefit-icon">
          <FileText />
        </div>
        <h3 className="r-benefit-citizens-title marketing-benefit-title">Prehľad pre občanov</h3>
        <p className="r-benefit-citizens-copy marketing-benefit-copy">
          Rýchle vyhľadávanie dokumentov z viacerých agend na jednom mieste.
        </p>
        <div className="r-benefit-office-icon marketing-benefit-icon">
          <Users />
        </div>
        <h3 className="r-benefit-office-title marketing-benefit-title">Menej administratívy</h3>
        <p className="r-benefit-office-copy marketing-benefit-copy">
          Jednoduchšia evidencia a zverejňovanie pre úradníkov.
        </p>
        <div className="r-benefit-structure-icon marketing-benefit-icon">
          <Shield />
        </div>
        <h3 className="r-benefit-structure-title marketing-benefit-title">Prehľadná štruktúra</h3>
        <p className="r-benefit-structure-copy marketing-benefit-copy">
          Usporiadané podľa agend <br />
          obce, s jasným a zrozumiteľným <br />
          zobrazením.
        </p>
      </section>
      <section
        className="r-next-section-start marketing-workflow-start"
        aria-labelledby="workflow-title"
      >
        <h2 id="workflow-title">Jednoduché v 3 krokoch</h2>
        <ol aria-hidden="true">
          {["Vyberte dokument", "Doplňte údaje a prílohy", "Zverejnite"].map((step, i) => (
            <li key={step}>
              <span>{i + 1}</span>
              <span className="sr-only">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
