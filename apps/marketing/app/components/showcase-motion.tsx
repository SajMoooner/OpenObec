"use client";
import { useEffect } from "react";

/** Finite entrances: no animation loop, timer or hidden-page work. */
export function ShowcaseMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const stop = () => {
      if (preference.matches) animations.forEach((animation) => animation.cancel());
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (preference.matches) continue;
          const animation = entry.target.animate(
            [
              { transform: "translateY(24px)", opacity: 0.65, filter: "blur(2px)" },
              { transform: "translateY(0)", opacity: 1, filter: "blur(0)" },
            ],
            { duration: 850, easing: "cubic-bezier(.16,1,.3,1)" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(".feature-card .illustration-detail")
      .forEach((element) => observer.observe(element));
    preference.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", stop);
    };
  }, []);
  return null;
}
