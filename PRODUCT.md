# OpenObec

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Potvrdené používateľom: tri samostatné aplikácie Next.js, komponenty shadcn/ui, fonty a farby IDSK. Backendové doménové služby, párovanie a Query API v Jave. Každá služba má vlastnú MongoDB databázu. RustFS ako S3 úložisko a Kafka ako MQ. Výber technológie API gateway používateľ delegoval.

## Users

- Občan hľadá zverejnené dokumenty mesta, chce pochopiť ich údaje a súvislosti a stiahnuť prílohy.
- Úradník eviduje, upravuje a zverejňuje dokumenty na jednom mieste.
- Zástupca samosprávy na marketingovej stránke posudzuje produkt a otvorí demo.

## Product Purpose

Zjednodušiť vyhľadanie povinne zverejňovaných dokumentov a prácu úradníka pri ich publikovaní. Prvá verzia je funkčné lokálne demo výhradne pre Žilinu so skutočným ukladaním dát a súborov. Toto používateľ výslovne potvrdil 1. 11. 2026.

## Positioning

Jedno miesto pre faktúry, dodávateľské faktúry, objednávky, zmluvy, verejné obstarávanie a VZN. Občan vidí aj explicitne prepojené dokumenty. Budúce prepojenie na mestský IS je zamýšľaný smer; demo ho neimplementuje.

## Operating Context

Tri samostatné portály v jednom repozitári. Úradník do dema vstúpi tlačidlom bez hesla. Každá Java a Next.js aplikácia sa má dať spustiť samostatne aj cez Docker; databázy bežia v Dockeri. Demo dáta sú fiktívne, označené ako ukážkové a patria iba Žiline.

## Capabilities and Constraints

- Šesť dokumentových agend; Faktúry znamenajú odberateľské faktúry.
- Zoznamy, textové vyhľadanie, stránkovanie, detaily, vytvorenie, úprava, logické vymazanie, koncept a zverejnenie.
- Výber viacerých explicitných súvisiacich záznamov v piatich agendách; VZN má samostatnú evidenciu bez párovania.
- Doménové databázy sú zdroj pravdy, Kafka prenáša udalosti do odvodeného čítacieho modelu.
- Reálne prihlásenie, mestské integrácie, externé registre a inteligentné vyhľadávanie sú mimo potvrdeného rozsahu.
- Lokálne demo nie je potvrdením zákonného splnenia zverejňovania v externých registroch.
- Správa účtov a open-data stránky zo širšej API definície majú neurčené správanie; realizačný návrh navrhuje ich vynechanie z prvého dema.
- Cieľové produkčné nasadenie nebolo zadané.

## Brand Commitments

Názov OpenObec. Rozhranie v slovenčine. Primárne komponenty shadcn/ui; písmo a farebná paleta podľa IDSK. Pre marketing používateľ zvolil najprv obrazový návrh a až potom jeho implementáciu; pracovné portály vznikajú priamo v kóde. Konkrétna kompozícia marketingu ešte nebola vybraná.

## Evidence on Hand

- Štyri návrhové Pages: lokálne snímky v `docs/references/2026-11-01/`.
- `OpenObec-analyza-systemov.md`, `OpenObec-mapa-systemov.csv`, `OpenObec-predpoklady.md`: pracovná rešerš a hypotézy, nie doklad úspechu produktu.
- Cena 199 € ročne je používateľov obchodný zámer. Implementačný poplatok nemá zadanú sumu; režim DPH nie je určený.
- Úspora 1–2 hodín, úspora 45 % a dostupnosť 50 zákazníkov nie sú overené výsledky. Neprezentovať ich ako dosiahnuté.
- Neboli dodané logo, oficiálne oprávnenie zastupovať mesto, fotografie ani kontaktné údaje. Nevymýšľať referencie, adresy či čísla.
- JSON príklady a budúce demo záznamy sú fiktívne; nejde o reálne mestské záznamy.

## Product Principles

1. Občan vie dokument nájsť, pochopiť a otvoriť jeho prílohy.
2. Úradník vždy rozlíši uložený koncept, zverejnenie a spracovanie prepojeného prehľadu.
3. Súvislosti vyplývajú z explicitného výberu, nie zo zhodného dodávateľa.
4. Úspech potvrdeného zápisu nezávisí od okamžitej dostupnosti Kafka.
5. Funkčné demo sa posudzuje priechodom od vytvorenia dokumentu po jeho zobrazenie občanovi.
