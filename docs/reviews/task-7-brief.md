# Úprava marketingovej titulnej stránky

Používateľ 1.11.2026 výslovne požiadal zúžiť obsah na stred podľa sekcie „Vyskúšajte obe strany obce“ a doplniť viac marketingových informácií s inšpiráciou shadcn šablónami. Táto požiadavka nahrádza pôvodnú neobmedzene škálovanú kompozíciu hero; farby, shadcn/ui, Geist a schválená panoráma ostávajú.

Použije sa spoločný max-width1280px s24px bočnými okrajmi pre navigáciu, hero, ukážku aj ostatné sekcie; pozadia môžu prechádzať celou šírkou. Typografia sa prestane zväčšovať podľa celého viewportu. Namiesto úpravy jednotlivých absolútnych súradníc vznikne prirodzený grid/flex layout, ktorý sa na mobile skladá. Identita sa nemení a DESIGN.md sa neprepisuje.

Domov: stručné hero + oba demovstupy, zachovaný funkčný register, prínosy pre občana/úradníka, šesť podporovaných agend, pracovný postup, vysvetlená navrhovaná cena199EUR/rok, FAQ a konečné demovstupy. Bez vymyslených referencií, metrík, kontaktov, právnych garancií či reálnej integrácieIS.

Inšpirácia štruktúrou (nekopíruje sa kód ani platené aktíva): https://github.com/shadcnstore/shadcn-dashboard-landing-template#-landing-page-template ; https://www.shadcnblocks.com/templates ; komponenty https://ui.shadcn.com/docs/components/accordion. Použijú sa existujúce pravé shadcn Button/Input/Tabs/Table/Accordion/Separator.

Overenie: široký2560/3440pxviewport má najviac1280px stredový obsah a spoločné hrany, čitateľná typografia;390/768/1440 bez pretŕčania; funkčnýFAQ/odkazy/hľadanie; existujúce21marketingové odkazy zostanú funkčné. Typy/lint/build, skutočné snímky a nezávislé vizuálne posúdenie po úprave.
