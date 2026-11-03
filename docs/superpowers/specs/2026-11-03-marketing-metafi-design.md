# OpenObec marketing podľa MetaFi — schválený návrh

Používateľ schválil 3. 11. 2026 úplnú prerábku marketingu podľa https://metafi-nextjs-template.vercel.app/ a následne potvrdil prácu v obnovenom priečinku Plocha/Projekty/OpenObec, spustenie a testovanie. Toto obnovuje návrh z predchádzajúcej dočasnej kópie, ktorú nahradil obnoveným projektom.

Iba marketing mení vizuálnu identitu. Občiansky a úradnícky portál, zdieľané štýly, backend, dáta a prílohy zostávajú bez zmien. IDSK3 už pre marketing neplatí. Next.js a shadcn/ui zostávajú.

Zvolený prístup: presná rekonštrukcia rozloženia a vizuálneho systému MetaFi s obsahom OpenObec; voľná adaptácia starého modrého marketingu nezodpovedá požiadavke. Referencia používa biele pozadie, takmer čierne tlačidlá, Inter, sivé hranice, fialové akcenty a svetlú/tmavú tému. Základné tokeny z verejného CSS: background oklch(1 0 89.88), foreground/primary oklch(.172 .006 286.3), muted-foreground oklch(.61 .03 270), border oklch(.924 .003 255.9), tagline oklch(.57 .223 275.64). Rozmery overiť na skutočných snímkach.

Hlavná myšlienka: Zverejňovanie dokumentov, v ktorom máte poriadok. Hlavné CTA: Vyskúšať pracovný portál. Obsah vysvetlí prípravu, PDF, súvislosti a zverejnenie. Bez vymyslených referencií, tímu, používateľských počtov, meranej úspory či právnej garancie. Mestské integrácie sú plánované.

- /home: centrovaný úvod, dvojica CTA, veľký skutočný dashboard, šesť agend namiesto cudzích zákazníckych log, funkcie s produktovými detailmi, tri kroky zverejnenia, FAQ, CTA a päta. Referenčnú kompozíciu zachovať. Video zostáva v dokumentácii.
- /vyhody: features kompozícia so striedaním textu a obrazoviek, koncepty, prílohy, súvislosti, výsledok pre občana.
- /o-nas: about kompozícia, dôvod vzniku, otvorený projekt, hodnoty, reálne produktové snímky alebo poctivo ilustračné vizuály, GitHub.
- /pricing: bezplatný otvorený kód pre vlastnú prevádzku a plánovaná služba 199 eur/rok; implementácia individuálne. Neurčený režim DPH nevymýšľať, žiadny falošný checkout.
- /kontakt: contact kompozícia, reálne odkazy na GitHub a demo. Bez vymysleného emailu a formulára predstierajúceho odoslanie.
- / a /demo zachovajú funkčné smerovanie; navigácia má päť stránok a pracovné demo.

Vlastné geometrické logo OpenObec s optickým spracovaním podľa referencie, SVG a favicon. Nekopírovať označenie MetaFi. Rovnaké kompozičné roly obrázkov, ale obrazovky a tvrdenia patria OpenObec. Nepreberať platené bloky bez licencie. Marketingové tokeny, Inter a téma izolované v apps/marketing, bez úprav zdieľaných tokenov alebo značky portálov.

Funkčná mobilná navigácia, klávesnica, FAQ, prepínanie témy, správne runtime URL portálov. Jemný pohyb s reduced-motion a viditeľným obsahom bez JS. Vizuálne porovnať všetkých päť stránok na desktop/mobile, overiť aj 768 a širokú obrazovku. Typy, lint, marketingový build a regresie; krátky smoke portálov. Nakoniec zostaviť a spustiť iba marketingový kontajner, bez seedu. Presné texty a výrezy sú delegované implementácii.
