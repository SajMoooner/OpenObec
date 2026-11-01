# Overenie úpravy portálov

Základ úpravy: `4a3f798`. Schválený návrh: `docs/design/2026-11-01-portal-review/navrh.md`. Tento záznam sa priebežne dopĺňa; neoverené body nie sú výsledky.

## Dokončené kontroly

- Task1 `c17055b`: 23 frontendových testov, 8 testov prehliadača, typová kontrola, lint a tri produkčné zostavenia prešli. Nezávislá kontrola schválila zhodu s návrhom aj kvalitu bez nálezov. Podrobnosti v `task-1-report.md` a `task-1-review.md`.
- Manuálna kontrola aktuálneho občianskeho portálu cez natívne CUA: čitateľná úvodná stránka na desktope, VZN s doménovými dátumami bez sumy na mobile, viditeľné označenie Žilina/demo. Po oprave sa vyhľadávanie `knižnice` pri 390 × 844 zobrazilo bez výberu agend nad výsledkami, prvý výsledok mal y713,5 a stránka nepresahovala šírku.

## Záverečná kontrola — zatiaľ čaká

- [ ] Task2 implementácia a nezávislá kontrola.
- [ ] Task3 implementácia a nezávislá kontrola.
- [ ] Aktuálne frontendové jednotkové testy, typy, lint, tri produkčné zostavenia.
- [ ] Celá aktuálna sada testov prehliadača na čerstvom zostavení.
- [ ] 44 hlavných ciest × 390/768/1440; široký marketing 2560/3440.
- [ ] Vizuálna kontrola šablón vrátane dlhých názvov, prázdnych stavov a chýb.
- [ ] Klávesnica, mobilná navigácia a prepojenie chýb so všetkými poľami šiestich formulárov.
- [ ] Uloženie, príloha a zverejnenie vlastného testovacieho záznamu; ochrana neuložených zmien a návrat k filtrom.
- [ ] Impeccable kontrola aktuálneho UI a pravdivý záznam finálneho stavu.
- [ ] Záverečná kontrola rozsahu úpravy voči `4a3f798` a vyriešenie závažných nálezov.

Staré obrazové porovnanie s pôvodným širokým marketingovým návrhom nie je podkladom prijatia tejto používateľom schválenej úpravy. Jeho historický stav sa nemení ani neoznačuje za úspešný.
