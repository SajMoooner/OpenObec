"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
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
import { MarketingHeader } from "../components/site-shell";
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
    <>
      <div className="bg-foreground text-background">
        <MarketingHeader />
        <section aria-labelledby="headline" className="marketing-container marketing-hero-layout">
          <div className="relative z-10">
            <h1 id="headline" className="marketing-headline">
              Dokumenty obce
              <br />
              jednoducho dostupné.
            </h1>
            <p className="marketing-intro mt-6 max-w-xl text-lg leading-8 text-background/85">
              Jedno miesto pre občanov. Jednoduchšia evidencia pre úradníkov.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={`${citizen}/obcan/home`}>
                  Občianske demo
                  <ArrowRight />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={`${office}/uradnik/prihlasenie`}>
                  Demo pre úradníka
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
          <Image
            className="marketing-skyline"
            src="/assets/plates/skyline.png"
            width={2172}
            height={724}
            alt=""
            priority
            unoptimized
          />
        </section>
      </div>
      <section
        aria-labelledby="register-title"
        className="marketing-container marketing-register-wrap"
      >
        <div className="marketing-register rounded-xl border bg-background p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="register-title" className="text-2xl font-semibold tracking-tight">
              Vyhľadať dokumenty
            </h2>
            <p className="text-sm text-muted-foreground">Ukážkové dáta · Žilina</p>
          </div>
          <form action={searchTarget} method="get" className="mt-5 flex gap-3">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Label className="sr-only" htmlFor="marketing-search">
                Názov, kľúčové slovo alebo číslo dokumentu
              </Label>
              <Input
                id="marketing-search"
                name="q"
                value={q}
                maxLength={200}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Názov, kľúčové slovo alebo číslo dokumentu…"
                type="search"
                className="h-10 pl-9"
              />
            </div>
            <Button type="submit" className="h-10">
              Hľadať
            </Button>
          </form>
          <Tabs value={agenda} onValueChange={setAgenda} className="marketing-tabs mt-5">
            <TabsList variant="line" aria-label="Agendy ukážkových dokumentov">
              <TabsTrigger value="vsetky">Všetky</TabsTrigger>
              {AGENDAS.map((a) => (
                <TabsTrigger key={a.slug} value={a.slug}>
                  {a.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="marketing-table mt-4">
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
        </div>
      </section>
    </>
  );
}
