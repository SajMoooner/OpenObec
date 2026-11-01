# Stránky troch portálov

Návrh ciest rozdeľuje OpenObec na marketingový, občiansky a úradnícky portál. Marketing používa existujúce cesty bez prefixu, občiansky portál prefix `/obcan` a úradnícky portál prefix `/uradnik`. Všetky cesty stránok používajú `GET`; dátové operácie sú definované samostatne pod `/rest/v1`.

Občianske prehľady zobrazujú zverejnené údaje. Úradnícky portál a nastavenia účtu vyžadujú prihlásenie a príslušné oprávnenia. `{id}` označuje konkrétny záznam.

## Marketingový portál

| Metóda | Endpoint | Účel |
| --- | --- | --- |
| `GET` | `/home` | Domovská stránka |
| `GET` | `/kontakt` | Kontaktná stránka |
| `GET` | `/vyhody` | Stránka výhod |
| `GET` | `/demo` | Demo stránka |

## Občiansky portál

| Metóda | Cesta stránky | Účel |
| --- | --- | --- |
| `GET` | `/obcan/home` | Domovská stránka občana |
| `GET` | `/obcan/faktury` | Faktúry — zoznam |
| `GET` | `/obcan/faktury/{id}` | Faktúry — detail |
| `GET` | `/obcan/dodavatelske-faktury` | Dodávateľské faktúry — zoznam |
| `GET` | `/obcan/dodavatelske-faktury/{id}` | Dodávateľské faktúry — detail |
| `GET` | `/obcan/zmluvy` | Zmluvy — zoznam |
| `GET` | `/obcan/zmluvy/{id}` | Zmluvy — detail |
| `GET` | `/obcan/objednavky` | Objednávky — zoznam |
| `GET` | `/obcan/objednavky/{id}` | Objednávky — detail |
| `GET` | `/obcan/verejne-obstaravanie` | Verejné obstarávanie — zoznam |
| `GET` | `/obcan/verejne-obstaravanie/{id}` | Verejné obstarávanie — detail |
| `GET` | `/obcan/vzn` | VZN — zoznam |
| `GET` | `/obcan/vzn/{id}` | VZN — detail |
| `GET` | `/obcan/open-data` | Katalóg otvorených dát |
| `GET` | `/obcan/settings` | Nastavenia občianskeho účtu |

## Úradnícky portál

| Metóda | Cesta stránky | Účel |
| --- | --- | --- |
| `GET` | `/uradnik/home` | Pracovná domovská stránka úradníka |
| `GET` | `/uradnik/faktury` | Faktúry — zoznam |
| `GET` | `/uradnik/faktury/{id}` | Faktúry — detail |
| `GET` | `/uradnik/dodavatelske-faktury` | Dodávateľské faktúry — zoznam |
| `GET` | `/uradnik/dodavatelske-faktury/{id}` | Dodávateľské faktúry — detail |
| `GET` | `/uradnik/zmluvy` | Zmluvy — zoznam |
| `GET` | `/uradnik/zmluvy/{id}` | Zmluvy — detail |
| `GET` | `/uradnik/objednavky` | Objednávky — zoznam |
| `GET` | `/uradnik/objednavky/{id}` | Objednávky — detail |
| `GET` | `/uradnik/verejne-obstaravanie` | Verejné obstarávanie — zoznam |
| `GET` | `/uradnik/verejne-obstaravanie/{id}` | Verejné obstarávanie — detail |
| `GET` | `/uradnik/vzn` | VZN — zoznam |
| `GET` | `/uradnik/vzn/{id}` | VZN — detail |
| `GET` | `/uradnik/open-data` | Správa zverejňovania otvorených dát |
| `GET` | `/uradnik/settings` | Nastavenia účtu a portálu podľa oprávnení |

# Dátové API

## Faktúry

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/faktury` |
| Detail záznamu | `GET` | `/rest/v1/faktury/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/faktury` |
| Úprava záznamu | `POST` | `/rest/v1/faktury/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/faktury/{id}/delete` |
| Súvisiace záznamy a reťazec | `GET` | `/rest/v1/faktury/{id}/suvislosti` |

## Dodávateľské faktúry

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/dodavatelske-faktury` |
| Detail záznamu | `GET` | `/rest/v1/dodavatelske-faktury/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/dodavatelske-faktury` |
| Úprava záznamu | `POST` | `/rest/v1/dodavatelske-faktury/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/dodavatelske-faktury/{id}/delete` |
| Súvisiace záznamy a reťazec | `GET` | `/rest/v1/dodavatelske-faktury/{id}/suvislosti` |

## Zmluvy

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/zmluvy` |
| Detail záznamu | `GET` | `/rest/v1/zmluvy/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/zmluvy` |
| Úprava záznamu | `POST` | `/rest/v1/zmluvy/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/zmluvy/{id}/delete` |
| Súvisiace záznamy a reťazec | `GET` | `/rest/v1/zmluvy/{id}/suvislosti` |

## Objednávky

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/objednavky` |
| Detail záznamu | `GET` | `/rest/v1/objednavky/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/objednavky` |
| Úprava záznamu | `POST` | `/rest/v1/objednavky/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/objednavky/{id}/delete` |
| Súvisiace záznamy a reťazec | `GET` | `/rest/v1/objednavky/{id}/suvislosti` |

## Verejné obstarávanie

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/verejne-obstaravanie` |
| Detail záznamu | `GET` | `/rest/v1/verejne-obstaravanie/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/verejne-obstaravanie` |
| Úprava záznamu | `POST` | `/rest/v1/verejne-obstaravanie/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/verejne-obstaravanie/{id}/delete` |
| Súvisiace záznamy a reťazec | `GET` | `/rest/v1/verejne-obstaravanie/{id}/suvislosti` |

## VZN

| Operácia | Metóda | Endpoint |
| --- | --- | --- |
| Zoznam so stránkovaním | `GET` | `/rest/v1/vzn` |
| Detail záznamu | `GET` | `/rest/v1/vzn/{id}` |
| Vytvorenie záznamu | `POST` | `/rest/v1/vzn` |
| Úprava záznamu | `POST` | `/rest/v1/vzn/{id}/update` |
| Vymazanie záznamu | `POST` | `/rest/v1/vzn/{id}/delete` |

## Pravidlá zápisových operácií

Navrhované zápisové endpointy používajú `POST` pre vytvorenie, úpravu aj vymazanie. Parameter `{id}` označuje identifikátor konkrétneho záznamu. Všetky dátové GET a POST endpointy zatiaľ fungujú bez autentifikácie a bez kontrol používateľských oprávnení; token sa nevyžaduje.

- **Vytvorenie:** telo požiadavky obsahuje údaje nového záznamu.

- **Update:** telo požiadavky obsahuje upravované polia; vynechané polia zostávajú nezmenené.

- **Delete:** záznam určuje `{id}` v ceste; telo požiadavky nie je potrebné.

Konkrétne polia, validácie a príklady sú v [API detail](https://chatgpt.com/space/page_6ae6110469408191a2399b407bb11f3c). Výber a uloženie väzieb je súčasťou create/update pre faktúry, dodávateľské faktúry, zmluvy, objednávky a verejné obstarávanie.

# Výber a prepojenie súvisiacich záznamov

| Agenda formulára | Výber súvisiacich záznamov |
| --- | --- |
| Verejné obstarávanie | Objednávky, zmluvy, faktúry a dodávateľské faktúry |
| Objednávky | Verejné obstarávania, zmluvy, faktúry a dodávateľské faktúry |
| Zmluvy | Verejné obstarávania, objednávky, faktúry a dodávateľské faktúry |
| Faktúry | Verejné obstarávania, objednávky a zmluvy |
| Dodávateľské faktúry | Verejné obstarávania, objednávky a zmluvy |

Výber je voliteľný a podporuje viac záznamov. Create/update prijíma pole `suvisiace_zaznamy` s položkami `{ "typ": "zmluvy", "id": "zml_001" }`. Pri vytvorení vynechané pole znamená `[]`; pri update vynechanie zachová väzby, zaslané pole ich nahradí a `[]` odstráni odkazy vlastnené upravovaným záznamom. `null` nie je povolené. VZN zostáva bez tohto rozšírenia.

| Metóda | Endpoint | Účel |
| --- | --- | --- |
| `GET` | `/rest/v1/vyber-zaznamov` | Vyhľadávanie možností pre výber podľa `zdroj_typ`, `typ`, `q`, `page`, `page_size`; povinná hlavička `X-Obec-Id`. |
| `GET` | `/rest/v1/{agenda}/{id}/suvislosti` | Priame aj odvodené súvislosti z CQRS read modelu; konkrétne cesty sú v tabuľkách agend. |

Existujúce POST cesty zostávajú zachované. Služba overí zvolené odkazy cez API vlastníkov dát, uloží záznam aj udalosť do outboxu v jednej transakcii a odpovie bez čakania na MQ. Prepojenia v read modeli sa aktualizujú asynchrónne. Bežný detail vracia vlastné uložené odkazy; `/suvislosti` vracia aj spätné a nepriame súvislosti. Tieto cesty dopĺňa 10 read endpointov joined view uvedených nižšie; spolu ide o 46 dátových endpointov.

# Joined view API pre celé dokumenty

| Agenda | Zoznam z joined view | Kompletný prepojený detail |
| --- | --- | --- |
| Faktúry | `GET /rest/v1/query/faktury` | `GET /rest/v1/query/faktury/{id}` |
| Dodávateľské faktúry | `GET /rest/v1/query/dodavatelske-faktury` | `GET /rest/v1/query/dodavatelske-faktury/{id}` |
| Zmluvy | `GET /rest/v1/query/zmluvy` | `GET /rest/v1/query/zmluvy/{id}` |
| Objednávky | `GET /rest/v1/query/objednavky` | `GET /rest/v1/query/objednavky/{id}` |
| Verejné obstarávanie | `GET /rest/v1/query/verejne-obstaravanie` | `GET /rest/v1/query/verejne-obstaravanie/{id}` |
