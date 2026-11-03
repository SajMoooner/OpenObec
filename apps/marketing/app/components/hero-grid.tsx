"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "@openobec/ui/components/button";

export function HeroGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    const onVisibility = () => setForeground(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return (
    <>
      <div ref={ref} className="hero-grid" aria-hidden="true">
        <div
          className="hero-grid-lines"
          style={{ animationPlayState: visible && foreground && !paused ? "running" : "paused" }}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="hero-motion-control"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Spustiť animáciu mriežky" : "Pozastaviť animáciu mriežky"}
        aria-pressed={paused}
      >
        {paused ? <Play size={15} /> : <Pause size={15} />}
      </Button>
    </>
  );
}
