# Úprava marketingovej titulnej stránky

Používateľ 1.11.2026 výslovne požiadal zúžiť obsah na stred podľa sekcie „Vyskúšajte obe strany obce“ a doplniť viac marketingových informácií s inšpiráciou shadcn šablónami. Táto požiadavka nahrádza pôvodnú neobmedzene škálovanú kompozíciu hero; farby, shadcn/ui, Geist a schválená panoráma ostávajú.

Použije sa spoločný max-width1280px s24px bočnými okrajmi pre navigáciu, hero, ukážku aj ostatné sekcie; pozadia môžu prechádzať celou šírkou. Typografia sa prestane zväčšovať podľa celého viewportu. Namiesto úpravy jednotlivých absolútnych súradníc vznikne prirodzený grid/flex layout, ktorý sa na mobile skladá. Identita sa nemení a DESIGN.md sa neprepisuje.

Domov: stručné hero + oba demovstupy, zachovaný funkčný register, prínosy pre občana/úradníka, šesť podporovaných agend, pracovný postup, vysvetlená navrhovaná cena199EUR/rok, FAQ a konečné demovstupy. Bez vymyslených referencií, metrík, kontaktov, právnych garancií či reálnej integrácieIS.

Inšpirácia štruktúrou (nekopíruje sa kód ani platené aktíva): https://github.com/shadcnstore/shadcn-dashboard-landing-template#-landing-page-template ; https://www.shadcnblocks.com/templates ; komponenty https://ui.shadcn.com/docs/components/accordion. Použijú sa existujúce pravé shadcn Button/Input/Tabs/Table/Accordion/Separator.

Overenie: široký2560/3440pxviewport má najviac1280px stredový obsah a spoločné hrany, čitateľná typografia;390/768/1440 bez pretŕčania; funkčnýFAQ/odkazy/hľadanie; existujúce21marketingové odkazy zostanú funkčné. Typy/lint/build, skutočné snímky a nezávislé vizuálne posúdenie po úprave.

## Najnovšie používateľské spresnenie: obrazovky a animácia

Používateľ po dokončení skutočného videozáznamu zmenil umiestnenie: video patrí na GitHub, nie na titulnú stránku. Titulná stránka používa tri nezmenené snímky toho istého skutočného demo workflow faktúry FV/2026/0057: vyplnenie → zverejnenie → občiansky detail. Jemný prechod zachováva kontinuitu, shadcn Tabs umožňujú ručný výber kroku a viditeľné tlačidlo pozastaví/spustí šesťsekundové prepínanie. Ručný výber zastaví automatiku; mimo obrazovky a pri skrytom dokumente sa postup pozastaví. Obmedzený pohyb začína staticky a vypína priestorový prechod. Rám je stabilný 8:5, bez parallaxu či novej knižnice.

Kompaktné funkčné hľadanie vo všetkých agendách a oba demovstupy ostávajú. Navy, panoráma, Geist, shadcn a max 1280px ostávajú. Video 39,24s, jeho titulky, poster a dôkaz totožnosti/PDF ostávajú v dokumentácii pre GitHub; marketing neposiela požiadavku na video ani ho nesťahuje. Žiadne predstierané uloženie, zákaznícke metriky či generované rozhranie.
