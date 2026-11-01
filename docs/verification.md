# Overenie lokálneho dema OpenObec

Dátum: 1. 11. 2026. Overené na macOS s Java21 (Temurin21.0.9), Node26.3.1, pnpm11.25.0 a Docker Desktop29.5.3. Všetky záznamy sú syntetické pre obec `zilina`. Výsledky popisujú lokálne demo; vzdialená CI sa bez pushu nespúšťala.

## Výsledky

| Kontrola | Skutočný výsledok |
|---|---|
| Celý Java reaktor, `./mvnw -B verify` | 148 testov, 0 chýb, 0 zlyhaní, 0 preskočených |
| Finálne cielené testy gateway | 8 úspešných; zahŕňajú jediné odoslanie POST pri TCP chybe a práve jednu hlavičku request ID |
| Schémy a konfigurácia, `python3 -m unittest discover -s tests/contracts -v` | 12 úspešných |
| Vlastníctvo a životný cyklus ručných procesov, `python3 -m unittest discover -s tests/runtime -v` | 6 úspešných; skutočný Node proces, otvorenie a uvoľnenie portu |
| `pnpm typecheck`, `pnpm lint` | Bez chýb |
| `pnpm test:frontend` | 21 úspešných: presné sumy, dátumy/DST, formuláre, chyby API, úplné načítanie súvislostí |
| `pnpm build` | Všetky tri samostatné produkčné aplikácie zostavené |
| `pnpm test:e2e` proti Docker stacku | 28 úspešných, 24,4 s |
| `scripts/smoke/run.sh` | 5 úspešných živých HTTP skúšok; všetkých 70 operácií podľa OpenAPI |
| `tests/integration/faults.py -v` v ručnom režime | 1 úspešná koordinovaná skúška, 45,265 s |
| `tests/integration/recovery.py -v` v ručnom režime | 1 úspešná skúška obnovy, 5,876 s; 83 exportovaných záznamov, 2 prehrané udalosti |
| Ručný produkčný štart | 9 Java procesov a 3 portály, skutočné API a súbory; browser postupy úspešné |
| Predvolený Docker štart | Všetkých 12 obrazov aplikácií zostavených; 21 služieb beží a je zdravých |
| Bežné vypnutie a opätovný Docker štart | 72 zdrojových dokumentov bez zmeny, rovnaké PDF a platné pokračovanie starého prehľadu |

Browser skúšky overujú vytvorenie dokumentu, pripojenie skutočného PDF, výber súvisiaceho dokumentu, publikovanie, vyhľadanie občanom a zhodu stiahnutých bajtov. Pokrývajú aj editáciu, zrušenie publikovania, zachovanie formulára pri chybe uploadu alebo validácie, opakovanie uploadu bez duplikátu, čiastočný výpadok vyhľadávania, klávesnicu a mobilnú navigáciu. Úprava obstarávania zachováva nezmenený termín vrátane zlomkov sekundy a oboch výskytov jesenného prechodu času; zámerná zmena používa Bratislavu a neexistujúci jarný čas sa odmietne. Ďalšie prípady overujú všetkých 21 odkazov marketingovej ukážky, čitateľné mobilné/tabuľkové zoznamy a medzery v responzívnom texte.

Java výpisy obsahujú očakávané varovania pri úmyselných skúškach nedostupného brokera, neplatného DLQ topicu a prerušenej TCP prípojky. Výsledné počty zlyhaní a chýb zostali nulové; nejde o tvrdenie, že výpis testov je bez varovaní.

## Dáta, súbory a obnova

Seed vytvoril 12 dokumentov v každej zo šiestich agend, dve vetvené siete súvislostí a skutočné čitateľné PDF. Opakovanie nemení hotové záznamy a zachováva používateľské úpravy aj zmazania. Native PDFKit potvrdil jednu stranu a čitateľný obsah súboru. SHA256 prvej prílohy je `2ff3a6f9653d871136835945d12111d94da30a4d25bc882b6f416184a6cdfabb`; po reštarte zostal rovnaký.

Skúška výpadkov skutočne pozastavila vlastníka referencie, RustFS a Kafka, vždy s obnovením v `finally`. Overila 503 a rollback pri neoveriteľnej novej referencii, zachované prílohy po zlyhaní uploadu, auditné bajty po logickom zmazaní a doručenie potvrdeného outboxu po návrate brokera. Žiadna závislosť nezostala pozastavená.

Obnova použila skutočné HTTP exporty vlastníkov, zachytila Kafka offsety pred exportom a prehrala súbežnú aktualizáciu aj zmazanie do novej generácie. Novšia verzia zvíťazila, zmazaný záznam sa nevrátil a starý podpísaný snapshot zachoval pôvodnú verziu. Query ani rebuild nečítajú zdrojové databázy. Java integračné skúšky navyše pokrývajú 105 súvisiacich dokumentov, cykly, skryté medzičlánky, duplicitné/staré udalosti, DLQ, rollback a platnosť podpisu/expirácie kurzorov.

## Vzhľad a prostredie

Tri portály používajú skutočné shadcn/ui komponenty, lokálne písmo Geist a výhradne farby z IDSK3. Marketing vychádza zo schváleného obrazového návrhu a schválenej rastrovanej panorámy. Impeccable kontrola zahŕňa 28 snímok trás pre desktop a mobil plus 4 rozbalené detaily. Všetky štandardné snímky majú HTTP200, nulové chyby či varovania prehliadača a šírku dokumentu v rámci obrazovky. Detector sa spustil raz a vrátil prázdny zoznam. Pôvodná záverečná kontrola je v `.impeccable/review/finish-review.md`; následnú požadovanú marketingovú úpravu schvaľuje aktuálny verdict v `.impeccable/review/marketing-refined-review.md`. Nový obsah má max1280px, typografiu obmedzenú na36–56px a samostatné snímky390/768/1440/3440px. Testy výslovne kontrolujú stredovú šírku pri2560/3440px a funkčné FAQ. Pôvodné geometrické porovnanie Impeccable ostáva otvorené na63% voči prekonaným súradniciam; jeho výsledok sa nemenil na úspech. Záznam aktuálneho vizuálneho schválenia a13 overených zdrojových/obrazových hashov je v `.impeccable/review/current-refinement-finish.json`.

Docker mal pridelených 8GiB pamäte. Po skúškach spotrebovali iba OpenObec kontajnery približne 4,4GiB (skoršie merania2,7–2,9GiB); ide o bodové meranie po akceptačných skúškach, nie maximum počas zostavovania alebo záťažovej skúšky. Pre kompletné lokálne demo je vhodné ponechať Dockeru 8GiB. Nemerala sa vysoká dostupnosť ani produkčná priepustnosť.

## Opakovanie a dôkazy

Príkazy sú v [hlavnom návode](../README.md) a [prevádzkovom postupe](runbook.md). Každá Java služba a každý Next.js portál majú vlastný README, spúšťač a Dockerfile. CI konfigurácia v `.github/workflows/verify.yml` používa pripnuté verzie nástrojov a action commitov; jej vzdialený beh zostáva neoverený.

Lokálne dôkazy sú v ignorovanom `.run/`: `contract-fixtures.json`, `seed-manifest.json`, `fault-acceptance.json`, `rebuild-acceptance.json`, `persistence-proof.json`, `request-identity-proof.json`, `docker-status-final.json` a `docker-resources-final.jsonl`. Dočasné skúšobné dokumenty sa logicky mažú iba cez ich vlastné API. Bežný štart ani testy nemažú zväzky alebo históriu Kafka; deštruktívny reset sa počas implementácie nespustil.

Reálne prihlásenie, napojenie mestského IS, externé registre a inteligentné vyhľadávanie sú mimo schváleného rozsahu.

## Záverečné posúdenie

Celý pôvodný projekt a jedna opravná vlna boli nezávisle schválené; [finálny report](reviews/final-review.md). Opravy overili zachovanie zmazaného cieľa pri opakovanom štarte, správne spätné súvislosti aj rozlíšenie siedmich cieľov gateway. Následná marketingová úprava má vlastný [schválený report](reviews/task-7-review.md). Bežný `scripts/dev/up.sh docker --skip-build` bol na finálnej verzii znovu úspešný, seedready72 a21 zdravých služieb. Po poslednej úprave textu prešlo18marketingových regresií aj celý aktuálny beh28browserových,21klientskych a5živých HTTP skúšok.

Jeden súbežný beh buildov/Java/browser skúšok zachytil dočasné503 pri dvoch automaticky reštartovaných vlastníkoch. Príčina reštartu nebola potvrdená; nevydáva sa za opravenú programovú chybu. Po návrate všetkých služieb a bez súbežných buildov prešla celá sada; aktuálne je všetkých21služieb zdravých.
