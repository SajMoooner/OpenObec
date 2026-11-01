"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { Button } from "@openobec/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@openobec/ui/components/tabs";

const steps = [
  {
    label: "Príprava",
    name: "Príprava faktúry",
    image: "preparation.png",
    alt: "Vyplnený formulár faktúry FV/2026/0057 za prenájom sály so sumami 245,50 €, 56,47 € DPH a 301,97 € spolu.",
    caption:
      "Úradník doplní údaje faktúry. Číslo, odberateľ aj presné sumy patria k tomu istému dokumentu.",
  },
  {
    label: "Zverejnenie",
    name: "Zverejnenie faktúry",
    image: "published.png",
    alt: "Pracovný detail tej istej faktúry FV/2026/0057 so stavom Zverejnené a nahratou prílohou faktura-0057.pdf.",
    caption:
      "Po priložení PDF úradník uloží a zverejní faktúru. Stav aj príloha sú viditeľné v pracovnom detaile.",
  },
  {
    label: "Pre občana",
    name: "Prístup občana",
    image: "citizen.png",
    alt: "Občiansky detail zverejnenej faktúry FV/2026/0057 s rovnakými údajmi a PDF na stiahnutie.",
    caption:
      "Občan nájde zverejnenú faktúru a stiahne rovnaké PDF. Bez prihlásenia do pracovného portálu.",
  },
];
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}
export function PublicationShowcase() {
  const [stage, setStage] = useState(0);
  const [playback, setPlayback] = useState<"auto" | "playing" | "paused">("auto");
  const [inView, setInView] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  );
  const playing = playback === "playing" || (playback === "auto" && !reduced);
  const advancing = playing && visible && inView;
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25] },
    );
    if (figure.current) observer.observe(figure.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!advancing) return;
    const timer = window.setInterval(
      () => setStage((current) => (current + 1) % steps.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [advancing]);
  return (
    <figure
      ref={figure}
      className="publication-showcase"
      aria-labelledby="showcase-title"
      data-advancing={advancing}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="showcase-title" className="text-2xl font-semibold tracking-tight">
          Od faktúry k zverejnenému dokumentu
        </h2>
        <p className="text-sm text-muted-foreground">Obrazovky funkčného dema · fiktívne údaje</p>
      </div>
      <Tabs
        value={String(stage)}
        onValueChange={(value) => {
          setStage(Number(value));
          setPlayback("paused");
        }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <TabsList
            aria-label="Postup zverejnenia faktúry"
            onFocusCapture={() => setPlayback("paused")}
          >
            {steps.map((step, index) => (
              <TabsTrigger key={step.name} value={String(index)} aria-label={step.name}>
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={playing}
            onClick={() => setPlayback(playing ? "paused" : "playing")}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            {playing ? "Pozastaviť ukážku" : "Spustiť ukážku"}
          </Button>
        </div>
        {steps.map((step, index) => (
          <TabsContent key={step.name} value={String(index)} forceMount hidden={stage !== index}>
            <div className="publication-frame">
              <Image
                className="publication-image"
                src={`/showcase/${step.image}`}
                width={1280}
                height={800}
                alt={step.alt}
                loading="eager"
                unoptimized
              />
            </div>
            <p className="publication-caption mt-4 text-sm leading-6 text-muted-foreground">
              {step.caption}
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </figure>
  );
}
