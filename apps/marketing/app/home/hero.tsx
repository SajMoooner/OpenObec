"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Input } from "@openobec/ui/components/input";
import { Label } from "@openobec/ui/components/label";
import { MarketingHeader } from "../components/site-shell";
import { PublicationShowcase } from "./publication-showcase";
export function MarketingHero({ citizen, office }: { citizen: string; office: string }) {
  const [q, setQ] = useState("");
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
          <PublicationShowcase />
          <h2 id="register-title" className="mt-7 text-lg font-semibold">
            Vyhľadať dokumenty v deme
          </h2>
          <form action={`${citizen}/obcan/home`} method="get" className="mt-3 flex gap-3">
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
        </div>
      </section>
    </>
  );
}
