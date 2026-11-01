# OpenObec – analýza vstupných podkladov

Dátum: 1. 11. 2026. Stav: analýza návrhu, nie správa o implementácii.

## Podklady a ich váha

| Podklad | Rozsah | Použitie |
| --- | --- | --- |
| [API Definiton](https://chatgpt.com/space/page_770f55727c0081918bf54e26130bf30f) | 35 blokov, 8 367 znakov v lokálnej snímke | api-definition.md |
| [API detail](https://chatgpt.com/space/page_6ae6110469408191a2399b407bb11f3c) | 316 blokov, 91 339 znakov v lokálnej snímke | api-detail.md |
| [Api sekvenčný diagram](https://chatgpt.com/space/page_6ae612adfe2881919b1258940a2d1305) | 136 blokov, 62 474 znakov v lokálnej snímke | api-sequences.md |
| [High level schéma](https://chatgpt.com/space/page_5e88771846b08191bdd0f434aa0bfb85) | 31 blokov, 9 693 znakov v lokálnej snímke | high-level.md |

Presné snímky sú v [references/2026-11-01](../references/2026-11-01/manifest.json). Stránky používateľa sa nemenili. Pri implementácii treba prípadnú novšiu revíziu porovnať so snímkou.

Poradie pri rozpore: výslovné rozhodnutia používateľa v tomto chate → podrobný API kontrakt a jeho rozšírenia → API zoznam ciest → sekvenčné diagramy → high-level ilustrácie. Nesmie sa potichu meniť zmluvný JSON ani HTTP metódy.

Používateľ potvrdil lokálne demo s tlačidlom vstupu bez hesla, marketing najprv obrazovým návrhom a výnimku, že párovanie a Query API môžu zdieľať odvodenú čítaciu databázu. Šesť doménových databáz zostáva oddelených.

## Čo návrh skutočne predpisuje

- 30 pôvodných operácií: šesť agend krát zoznam, detail, create, update a logické delete.
- 6 operácií výberu a súvislostí: jeden výberový endpoint a päť grafových detailov.
- 10 joined-view operácií: päť zoznamov a päť plných prepojených detailov.
- Spolu 46 operácií (dvojica metóda + cesta); počet ciest je nižší, pretože GET a POST zdieľajú cestu.
- 57 JSON príkladov v API detail je syntakticky platných. To samo osebe nedokazuje úplnosť schémy ani správnu implementáciu.
- Päť príkladov plného joined detailu obsahuje rovnakých päť dokumentov: vždy jeden koreň a štyri súvisiace záznamy, štyri hrany. Poradie názvov agend v príklade nie je nové záväzné radenie.
- Sekvenčné diagramy opakujú spoločný transakčný tok; rozdiely sú validačné pravidlá jednotlivých agend. VZN ostáva bez outboxového párovania.
- Služby vlastnia referencie; projekcia je obojsmerná. Rovnaký pár môže mať dvoch vlastníkov, preto vymazanie jedného tvrdenia nesmie odstrániť druhé.
- Výber povoľuje najviac 100 explicitných dvojíc. Nepáruje sa podľa IČO, podobného názvu alebo sumy.
- Čítanie `/suvislosti` má hĺbku 1–3 a najviac 100 uzlov. Joined detail prechádza celú dosiahnuteľnú časť a stránkuje súvisiace dokumenty cez 10-minútový snapshot. Tieto mechanizmy sa nesmú zameniť.
- Zápis potvrdzuje iba lokálny commit, nie okamžité premietnutie do občianskeho portálu.

## Medzery, rozpory a navrhnuté riešenia

| Zistenie | Dopad | Rozhodnutie v realizačnom návrhu |
| --- | --- | --- |
| Definícia stránok spomína prihlásenie a účty, dátové API je výslovne bez autentifikácie. | Nejasný režim dema. | Potvrdené používateľom: demo vstup bez hesla; reálna identita a účty mimo rozsahu. |
| Samostatná DB pre každý servis verzus spoločný read model v schéme. | Dvojité projekcie alebo spoločné úložisko. | Používateľ dovolil spoločnú read DB pre pairing + query. Iné DB sa nezdieľajú. |
| High-level príklady hovoria `zmluva_id`, `objednavka_id`; API detail určuje iný JSON. | Nesúlad modelu a formulárov. | Jediný vstup je `suvisiace_zaznamy: [{typ,id}]`. Jednoúčelové cudzie kľúče sa nepridávajú. |
| Šípky DB → S3 nechávajú prenos súborov otvorený; nie je definovaný upload. | Samotné CRUD API nedokáže uchovať prílohu. | Súbory nahráva a číta vlastniaca Java služba cez S3 klienta; doplniť samostatné prílohové endpointy. |
| Outbox vyžaduje atómový zápis dvoch kolekcií. | MongoDB standalone nesplní transakčný návrh. | Každý Mongo uzol lokálneho dema bude jednočlenný replica set. |
| Nie sú dané Kafka topicy, ACK, retry, DLQ a obnova. | Strata alebo opakované spracovanie udalostí. | Úplné verziované stavy, outbox publisher, idempotentný konzument, DLQ a overený rebuild. |
| VZN `datum_schvalenia` má v tabuľke význam `undefined`. | Neurčitá dátumová validácia. | Návrh: povinný dátum YYYY-MM-DD; žiadna automatická právna kalkulácia účinnosti. |
| Unique `cislo` po logickom zmazaní nie je doriešené. | Nové ID môže znovu použiť staré evidenčné číslo. | Návrh: číslo zostane rezervované aj po zmazaní, zhodne s jedinečnosťou v obci a agende. |
| Nie je určená súbežná úprava rovnakého záznamu. | Môže sa stratiť zmena alebo vyrobiť rovnaká verzia. | Interné optimistické verziovanie, CAS a opakovanie na najnovšom stave; rovnaké pole mení posledný potvrdený zápis. API vstup sa nemení. |
| Nie je dané spoločné vyhľadanie naprieč agendami. | Jedno občianske vyhľadávacie okno bez serverového cieľa. | Paralelné volania existujúcich piatich query zoznamov a VZN; výsledky zoskupené podľa agendy. |
| Sú uvedené open-data a settings stránky, no bez správania či API. | Neopodstatnené rozšírenie rozsahu. | Návrh pre prvé demo: vynechať open-data a občiansky účet; nastavenia úradu použiť na požadovanú ukážku pripojenia IS. |
| Kontakt nemá dodané adresy, formulár nemá príjemcu. | Falošný kontakt alebo nefunkčné odoslanie. | Kontaktná stránka s jasne označeným demo stavom a vstupom do dema, bez predstieraného odoslania. |
| Business text sľubuje úsporu času, trhový podiel a percentuálnu úsporu. | Nepodložené marketingové tvrdenia. | Cena 199 €/rok je zámer zadávateľa; výsledky a počty zákazníkov sa nevymýšľajú. |
| Automatické právne lehoty a externé publikovanie nemajú pravidlá. | Dashboard by mohol predstierať právnu garanciu. | Zobrazovať dodané dátumy a technický stav publikovania v OpenObec; termíny IS/CRZ/CUET nesimulovať ako splnené. |

## Mapovanie 46 operácií na služby

Tabuľka je sledovateľnosť návrhu, nie tvrdenie, že endpointy už existujú. Päť konkrétnych `/suvislosti` ciest je v API detail definovaných spoločným vzorom `/{agenda}/{id}/suvislosti`; nejde o chýbajúce operácie.

| # | Metóda | Cesta | Vlastník |
| --- | --- | --- | --- |
| 1 | GET | `/rest/v1/faktury` | invoices-service |
| 2 | GET | `/rest/v1/faktury/{id}` | invoices-service |
| 3 | POST | `/rest/v1/faktury` | invoices-service |
| 4 | POST | `/rest/v1/faktury/{id}/update` | invoices-service |
| 5 | POST | `/rest/v1/faktury/{id}/delete` | invoices-service |
| 6 | GET | `/rest/v1/dodavatelske-faktury` | supplier-invoices-service |
| 7 | GET | `/rest/v1/dodavatelske-faktury/{id}` | supplier-invoices-service |
| 8 | POST | `/rest/v1/dodavatelske-faktury` | supplier-invoices-service |
| 9 | POST | `/rest/v1/dodavatelske-faktury/{id}/update` | supplier-invoices-service |
| 10 | POST | `/rest/v1/dodavatelske-faktury/{id}/delete` | supplier-invoices-service |
| 11 | GET | `/rest/v1/zmluvy` | contracts-service |
| 12 | GET | `/rest/v1/zmluvy/{id}` | contracts-service |
| 13 | POST | `/rest/v1/zmluvy` | contracts-service |
| 14 | POST | `/rest/v1/zmluvy/{id}/update` | contracts-service |
| 15 | POST | `/rest/v1/zmluvy/{id}/delete` | contracts-service |
| 16 | GET | `/rest/v1/objednavky` | orders-service |
| 17 | GET | `/rest/v1/objednavky/{id}` | orders-service |
| 18 | POST | `/rest/v1/objednavky` | orders-service |
| 19 | POST | `/rest/v1/objednavky/{id}/update` | orders-service |
| 20 | POST | `/rest/v1/objednavky/{id}/delete` | orders-service |
| 21 | GET | `/rest/v1/verejne-obstaravanie` | procurement-service |
| 22 | GET | `/rest/v1/verejne-obstaravanie/{id}` | procurement-service |
| 23 | POST | `/rest/v1/verejne-obstaravanie` | procurement-service |
| 24 | POST | `/rest/v1/verejne-obstaravanie/{id}/update` | procurement-service |
| 25 | POST | `/rest/v1/verejne-obstaravanie/{id}/delete` | procurement-service |
| 26 | GET | `/rest/v1/vzn` | ordinances-service |
| 27 | GET | `/rest/v1/vzn/{id}` | ordinances-service |
| 28 | POST | `/rest/v1/vzn` | ordinances-service |
| 29 | POST | `/rest/v1/vzn/{id}/update` | ordinances-service |
| 30 | POST | `/rest/v1/vzn/{id}/delete` | ordinances-service |
| 31 | GET | `/rest/v1/vyber-zaznamov` | query-api |
| 32 | GET | `/rest/v1/faktury/{id}/suvislosti` | query-api |
| 33 | GET | `/rest/v1/query/faktury` | query-api |
| 34 | GET | `/rest/v1/query/faktury/{id}` | query-api |
| 35 | GET | `/rest/v1/dodavatelske-faktury/{id}/suvislosti` | query-api |
| 36 | GET | `/rest/v1/query/dodavatelske-faktury` | query-api |
| 37 | GET | `/rest/v1/query/dodavatelske-faktury/{id}` | query-api |
| 38 | GET | `/rest/v1/zmluvy/{id}/suvislosti` | query-api |
| 39 | GET | `/rest/v1/query/zmluvy` | query-api |
| 40 | GET | `/rest/v1/query/zmluvy/{id}` | query-api |
| 41 | GET | `/rest/v1/objednavky/{id}/suvislosti` | query-api |
| 42 | GET | `/rest/v1/query/objednavky` | query-api |
| 43 | GET | `/rest/v1/query/objednavky/{id}` | query-api |
| 44 | GET | `/rest/v1/verejne-obstaravanie/{id}/suvislosti` | query-api |
| 45 | GET | `/rest/v1/query/verejne-obstaravanie` | query-api |
| 46 | GET | `/rest/v1/query/verejne-obstaravanie/{id}` | query-api |

## Existujúce lokálne súbory

Prečítané `OpenObec-predpoklady.md`, závery a metodika `OpenObec-analyza-systemov.md`; CSV má 181 záznamov a 165 jedinečných samospráv. Riadok Žilina uvádza historický doklad CG DISS z roku 2023. Tieto dáta sa neimportujú ako dokumenty aplikácie a nedokazujú dostupnosť dnešnej mestskej databázy.

Pôvodné tri pracovné súbory sú ponechané bez zmeny. Ich tvrdenia neboli v tejto technickej analýze nanovo overované na všetkých externých odkazoch.

## Overené technické podklady

- [IDSK typografia](https://idsk.gov.sk/zaklady-principy/typografia): Source Sans Pro.
- [IDSK farebná paleta](https://idsk.gov.sk/zaklady-principy/farebna-paleta): základ #126dff, tmavá #072c66; nepomiešať ich so staršími paletami.
- [Spring Cloud kompatibilita](https://github.com/spring-cloud/spring-cloud-release/wiki/Supported-Versions): pre Boot 3.5.x sa použije Cloud 2025.0.x.
- [Spring Cloud Gateway](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webflux.html): vhodný Java gateway komponent.
- [MongoDB transakcie](https://www.mongodb.com/docs/v8.0/data-modeling/enforce-consistency/transactions/): vyžadujú replica set alebo sharded cluster.
- [RustFS kontajner](https://docs.rustfs.com/en/installation/container): S3 kompatibilita, perzistencia, používateľ kontajnera UID 10001.
- [RustFS status](https://docs.rustfs.com/en/operations/status-check): S3 9000, konzola 9001.
- [shadcn monorepo](https://ui.shadcn.com/docs/monorepo): spoločný UI balík a tri samostatné Next.js aplikácie.
- [Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16): samostatne overovať lint aj build.
- [Kafka broker konfigurácia](https://kafka.apache.org/41/configuration/broker-configs/): osobitne overiť dostupné advertised listeners z hostiteľa a kontajnerov.

Systém na tomto počítači: Docker engine odpovedal verziou 29.5.3; Node odpovedal v26.3.1. Java príkaz existuje len ako systémový spúšťač, použiteľný JDK sa nenašiel; Maven sa v PATH nenašiel. Docker umožní backend zostaviť bez lokálneho JDK; ručný Java režim bude vyžadovať JDK 21 a dodaný Maven Wrapper. Nič sa zatiaľ neinštalovalo.

## Čo ešte nie je overené

Neexistuje aplikačný kód, Docker Compose ani bežiace OpenObec služby. Nebol vykonaný build, integračné testy ani vizuálna kontrola aplikácie. Overené sú vstupné kontrakty, dostupnosť podkladov a základné nástroje. Skutočné spustenie, konkrétne uzamknuté verzie závislostí a spotreba pamäte patria do implementácie.

## Kontrola návrhu pred odovzdaním

- Nezávislý builder check podľa Superpowers prečítal realizačný návrh, analýzu a API snímky. Výsledok: „nothing important left“; neuviedol zásadný rozpor s podkladmi. Ide o kontrolu plánovateľnosti návrhu, nie o test aplikácie.
- Spätné načítanie overilo dĺžky všetkých štyroch uložených snímok; manifest obsahuje SHA-256 a počty bajtov.
- Všetkých 57 JSON blokov sa úspešne parsovalo. Päť plných joined príkladov má jedinečné dokumenty, správny počet súvisiacich záznamov a hrany smerujúce na prítomné uzly.
- Mapa obsahuje 46 jedinečných dvojíc metóda + cesta. Pokrytie bolo porovnané so všetkými tromi API podkladmi; päť generických ciest súvislostí bolo rozbalených na konkrétne agendy.
- Lokálne odkazy, párovanie kódových blokov a záznam potvrdenej Impeccable voľby boli overené.

Tieto kontroly nepreukazujú funkčnosť budúceho backendu, Docker stacku ani portálov. Implementácia a jej akceptačné testy zostávajú ďalšou etapou po schválení návrhu.
