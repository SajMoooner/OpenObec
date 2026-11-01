Podrobný návrh kontraktu pre 46 dátových endpointov OpenObec: 30 pôvodných, 6 pre výber a súvislosti a 10 pre zoznamy a kompletné prepojené detaily z joined view. Nadväzuje na [API Definiton](https://chatgpt.com/space/page_770f55727c0081918bf54e26130bf30f). JSON príklady používajú fiktívne údaje.

Cesty a metódy nadväzujú na existujúcu definíciu. Polia, validačné pravidlá a odpovede nižšie tvoria navrhovaný kontrakt, nie opis overenej implementácie. Agenda Faktúry je v tomto návrhu chápaná ako odberateľské faktúry.

# Spoločné pravidlá

## Formát a prístup

Všetky odpovede majú `Content-Type: application/json`; klient posiela `Accept: application/json`. Pri vytvorení a úprave posiela aj `Content-Type: application/json`. GET a delete nemajú telo požiadavky. Zápis používa POST vrátane ciest `/update` a `/delete` podľa existujúcej definície.

Všetky dátové endpointy zatiaľ fungujú bez autentifikácie a bez kontrol používateľských oprávnení. GET aj POST vrátane vytvorenia, úpravy a mazania nevyžadujú token ani hlavičku Authorization. Povinná hlavička `X-Obec-Id`, napríklad `obec_001`, iba určuje obec pre čítanie alebo zápis. Server vyhľadáva záznamy v tejto obci; neexistujúci alebo zmazaný detail vráti 404.

## Spoločné polia záznamu

| Pole | Typ | Pravidlo |
| --- | --- | --- |
| `id` | string | Generuje server; nemeniteľný identifikátor agendy. |
| `obec_id` | string | Server odvodí z hlavičky X-Obec-Id. |
| `zverejnene` | boolean | Voliteľné pri vytvorení, predvolene false; upraviteľné úradníkom. |
| `created_at` | string | Čas vytvorenia v ISO 8601 UTC; iba odpoveď. |
| `updated_at` | string | Čas poslednej zmeny v ISO 8601 UTC; iba odpoveď. |

Polia `id`, `obec_id`, `created_at` a `updated_at` sa neposielajú v tele zápisu. Neznáme a iba výstupné polia v požiadavke vrátia 422. Občiansky portál pri zoznamoch posiela zverejnene=true. Tento filter nie je kontrola používateľských oprávnení; API zatiaľ umožňuje aj čítanie nezverejnených záznamov. Príklady protistrán predstavujú organizácie.

## Parametre zoznamov

| Query parameter | Typ | Povinný | Predvolená hodnota a pravidlo |
| --- | --- | --- | --- |
| `page` | integer | Nie | 1; minimálne 1. |
| `page_size` | integer | Nie | 20; rozsah 1 až 100. |
| `q` | string | Nie | Hľadá v cislo, predmet a nazov, ak agenda názov má; max. 200 znakov. |
| `sort` | string | Nie | `-created_at`; povolené created_at, -created_at, updated_at, -updated_at. Pri zhode server zoradí podľa id vzostupne. |
| `zverejnene` | boolean | Nie | Bez filtra vráti všetky nezmazané záznamy danej obce; true iba zverejnené, false iba nezverejnené. |

Filtre sa kombinujú pomocou AND. `total` je počet záznamov po filtrovaní v rámci obce, `total_pages = ceil(total / page_size)`. Prázdny výsledok alebo stránka za koncom vracia 200, `data: []`; pri total 0 je total_pages 0. Neplatný query parameter vracia 400. Zoznamy vracajú rovnaké polia záznamu ako detail.

## Pravidlá zápisu

Pri vytvorení sú povinné polia uvedené v tabuľke agendy; voliteľné dátumy sa pri vynechaní uložia ako null. Pri update je telo čiastočné: musí obsahovať aspoň jedno upraviteľné pole, vynechané polia sa nemenia, null je povolené iba pri nullable poliach. Vnorený objekt protistrany sa nahrádza celý a musí obsahovať nazov. Platí validácia výsledného celého záznamu. Textové polia musia byť neprázdne; cislo má najviac 100 znakov, nazov 500, predmet 5000 a názov protistrany 500. Ak sú prítomné sumy bez DPH, DPH a s DPH, ich súčet musí presne súhlasiť. Dátum platnost_do nesmie predchádzať datum_ucinnosti.

Navrhované mazanie je logické: záznam sa prestane vracať v zoznamoch a detaile, audit zostane zachovaný. Prvé zmazanie vráti 200 s JSON potvrdením; ďalšie mazanie rovnakého záznamu vráti 404. Vytvorenie vráti 201 a hlavičku Location s cestou detailu; update vráti 200 a celý aktualizovaný záznam. Zápis je atómový. Pre päť agend s väzbami transakcia zahŕňa aj zvýšenie `entity_version` a zápis udalosti do outboxu vrátane delete; úspech nečaká na publikovanie do MQ ani aktualizáciu read modelu. Výpadok MQ už potvrdený zápis neruší.

# Kontrakt výberu a súvislostí

Rozšírenie platí pre `faktury`, `dodavatelske-faktury`, `zmluvy`, `objednavky` a `verejne-obstaravanie`. Používa rovnakú hlavičku `X-Obec-Id` a aktuálny režim API bez autentifikácie; identita sa týmto návrhom nemení. Pôvodných 30 endpointov zostáva; tento kontrakt pridáva 1 spoločný výberový a 5 endpointov `/suvislosti`. Samostatný kontrakt Joined view API nižšie pridáva ďalších 10 read endpointov s plnými údajmi.

| Agenda formulára | Výber súvisiacich záznamov |
| --- | --- |
| Verejné obstarávanie | Objednávky, zmluvy, faktúry a dodávateľské faktúry |
| Objednávky | Verejné obstarávania, zmluvy, faktúry a dodávateľské faktúry |
| Zmluvy | Verejné obstarávania, objednávky, faktúry a dodávateľské faktúry |
| Faktúry | Verejné obstarávania, objednávky a zmluvy |
| Dodávateľské faktúry | Verejné obstarávania, objednávky a zmluvy |

## Zápis vybraných odkazov

`suvisiace_zaznamy` je voliteľné pole najviac 100 objektov, každý obsahuje iba `typ` a `id`. `typ` používa presný názov agendy z ciest API; `id` je neprázdny string s najviac 200 znakmi. Povolené kombinácie určuje tabuľka vyššie; VZN, väzby v rovnakej agende a väzby medzi dvoma fakturačnými agendami sú mimo rozsahu. Duplicita dvojice `(typ, id)` je chyba. Toto je záväzný JSON tvar odkazov v API; názvy ako `zmluva_id` v high-level príkladoch vyjadrujú význam vzťahu, neposielajú sa ako ďalšie polia.

| Operácia | Vynechané pole | Zaslané pole | `[]` | `null` |
| --- | --- | --- | --- | --- |
| Create | Uloží `[]` | Uloží celý zoznam | Bez odkazov | 422 |
| Update | Zachová vlastné odkazy | Nahradí celý vlastný zoznam | Odstráni vlastné odkazy | 422 |

Výber jedného aj viacerých dokumentov funguje pri vytvorení i úprave. Záznam môže vzniknúť bez odkazu a priradenie možno doplniť neskôr. Bežný zoznam, detail a odpoveď create/update vracajú `suvisiace_zaznamy` a iba výstupné `entity_version` (začína 1, pri zmene rastie). Existujúce záznamy bez odkazov vracajú `[]`. Update obsahujúci iba zmenu odkazov je platný. Na odstránenie jedného odkazu sa odošle celý zostávajúci vlastný zoznam.

Vlastníkom odkazu je upravovaný zdrojový záznam. Napríklad výber objednávky pri obstarávaní uloží odkaz v obstarávaní; nezapisuje sa súčasne do databázy objednávok. Projekcia ho zobrazí aj zo strany objednávky. Spätné odkazy sú v detaile formulára len na čítanie s odkazom na úpravu ich vlastníka. Ak obe strany nezávisle uložia odkaz, projekcia zobrazí jednu hranu s oboma vlastníkmi; odstránenie jedného tvrdenia nezruší druhé.

## Overenie a uloženie

Služba najprv overí štruktúru a povolené typy. Pri create overí všetky odkazy, pri update iba novo pridané dvojice; ponechané odkazy na neskôr zmazaný cieľ neblokujú nesúvisiacu úpravu. Existenciu a príslušnosť k obci overuje cez detailové API vlastníka cieľa s rovnakým `X-Obec-Id`, nie JOINom do cudzej databázy ani iba podľa oneskorenej projekcie. Cieľ mimo obce, neexistujúci alebo zmazaný znamená 422 s `details[].code = INVALID_REFERENCE`; chyba nedostupnej závislosti znamená 503 bez uloženia zdrojového záznamu. Strukturálne chyby používajú `INVALID_TYPE`, `DUPLICATE_REFERENCE` alebo `INVALID_VALUE`.

Po overení uloží doménová služba záznam, vlastné odkazy, novú verziu a udalosť do outboxu v jednej lokálnej transakcii. Create vráti 201 + Location, update 200. Kontrola cieľa a zápis zdroja netvoria distribuovanú transakciu: ak sa cieľ medzičasom zmaže, udalosť o zmazaní označí väzbu v projekcii ako nedostupnú, bez kaskádového mazania zdroja.

## Vyhľadávanie možností pre výber

`GET /rest/v1/vyber-zaznamov` — query služba vyhľadáva v CQRS read databáze. Povinná hlavička `X-Obec-Id`; GET nemá telo.

| Query | Povinné | Pravidlo |
| --- | --- | --- |
| `zdroj_typ` | Áno | Agenda vytváraného alebo upravovaného záznamu z tabuľky povolených kombinácií. |
| `typ` | Áno | Jedna cieľová agenda povolená pre zdroj. Pre viac typov formulár vykoná samostatné volania. |
| `q` | Nie | Najviac 200 znakov; vyhľadáva bez rozlíšenia veľkosti písmen v `cislo`, `nazov` a `predmet`. Prázdne znamená bez textového filtra. |
| `page` | Nie | Predvolene 1, celé číslo minimálne 1. |
| `page_size` | Nie | Predvolene 20, celé číslo 1 až 100. |
| `zverejnene` | Nie | Rovnaká sémantika ako existujúce zoznamy; občiansky portál posiela true. |

Výsledok obsahuje iba nezmazané záznamy z danej obce. Stabilné radenie je `cislo`, potom `id` vzostupne. Obal `pagination` má rovnakú sémantiku ako existujúce zoznamy. Neplatné query alebo kombinácia typov vráti 400, prázdny výsledok 200 s `data: []`. Výber môže chvíľu zaostávať za zápisom; po vytvorení cieľa možno dočasne použiť jeho ID z úspešnej create odpovede a následne obnoviť možnosti. Zápis aj tak overuje cieľ cez jeho doménové API.

```http
GET /rest/v1/vyber-zaznamov?zdroj_typ=faktury&typ=zmluvy&q=ZML-2026&page=1&page_size=20
Accept: application/json
X-Obec-Id: obec_001
```

```json
{"data":[{"typ":"zmluvy","id":"zml_001","cislo":"ZML-2026-001","label":"ZML-2026-001 — Zmluva o prenájme","zverejnene":true}],"pagination":{"page":1,"page_size":20,"total":1,"total_pages":1}}
```

`data[]` vždy obsahuje `typ`, `id`, `cislo`, `label` a `zverejnene`; `label` skladá číslo a názov, prípadne predmet. Pri uložení formulár posiela iba `typ` a `id`, nie zobrazovaný text. Výber nikdy automaticky nespája záznamy podľa dodávateľa.

## Čítanie prepojeného prehľadu

`GET /rest/v1/{agenda}/{id}/suvislosti` má päť konkrétnych ciest pre podporované agendy; VZN nemá tento endpoint. Povinné sú `X-Obec-Id` a neprázdne `id`. Voliteľné query: `hlbka` (integer 1 až 3, predvolene 3), `zverejnene` (ako zoznamy). Bez tela. Cieľom je zobraziť aj reťazec obstarávanie → objednávka → zmluva → faktúra.

Query API overí koreň cez jeho doménové API: ak neexistuje, je zmazaný alebo nevyhovuje filtru zverejnenia, vráti 404. Pri nedostupnej závislosti vráti 503. Ak koreň existuje, ale jeho projekcia ešte chýba, vráti 202, `Retry-After: 2`, `data` s `root`, prázdnymi `nodes` a `edges`, `truncated: false` a `projection` so `status: "pending"`, `root_entity_version: null`, `as_of: null`. Chýbajúca projekcia sa nezamieňa s neexistujúcim záznamom.

Pri dostupnej projekcii vráti 200 s `data.root`, `nodes`, `edges`, `truncated` a `projection`. Uzly majú rovnaký súhrnný tvar ako položky výberu. Hrana obsahuje `from`, `to` a `owners` (všetky odkazy na záznamy, ktoré túto priamu väzbu uložili), každý odkaz v tvare `{typ,id}`. Ide o všeobecnú súvislosť, nie dôkaz poradia obchodného procesu. Nepriame súvislosti sa skladajú z explicitných hrán; nevytvára sa nová priama hrana len preto, že záznamy majú spoločný dokument.

Prechod grafom je obojsmerný, s množinou už navštívených uzlov a limitom 100 uzlov vrátane koreňa; pri prekročení sa vracia `truncated: true`. Hrany nesmú odkazovať mimo vrátených uzlov. Filtre obce, zmazania a zverejnenia platia aj pre priechod; cez odfiltrovaný uzol sa nepokračuje. `projection.status` je `ready`, ak lokálne známe odkazy v rozsahu pohľadu sú vyriešené, inak `pending`; nie je to záruka globálnej aktuálnosti všetkých služieb. `root_entity_version` a `as_of` uvádzajú verziu koreňa a čas poslednej zmeny projekcie.

```json
{"data":{"root":{"typ":"faktury","id":"fak_001"},"nodes":[{"typ":"faktury","id":"fak_001","cislo":"FV-2026-001","label":"FV-2026-001 — Prenájom obecnej sály","zverejnene":true},{"typ":"zmluvy","id":"zml_001","cislo":"ZML-2026-001","label":"ZML-2026-001 — Zmluva o prenájme","zverejnene":true}],"edges":[{"from":{"typ":"faktury","id":"fak_001"},"to":{"typ":"zmluvy","id":"zml_001"},"owners":[{"typ":"faktury","id":"fak_001"}]}],"truncated":false,"projection":{"status":"ready","root_entity_version":1,"as_of":"2026-10-01T08:00:02Z"}}}
```

## Udalosti pre zmenu väzieb

Udalosti vytvorenia, zmeny a logického zmazania obsahujú `event_id`, `event_type`, `schema_version`, `entity_type`, `entity_id`, `entity_version`, `obec_id`, `occurred_at` a úplný aktuálny stav potrebný pre projekciu vrátane `suvisiace_zaznamy`. Publisher odosiela až potvrdené outbox záznamy. Konzument ignoruje duplicitné `event_id` a staršie verzie, nahrádza iba tvrdenia vlastníka udalosti a atómovo uloží projekciu aj evidenciu spracovania pred ACK. Chýbajúce ciele čakajú na ďalšie udalosti; opakované chyby smerujú po retry do DLQ podľa high-level návrhu.

Nové výberové API používa 400, 429, 500, 503; `/suvislosti` navyše 404 a úspešný stav 202 pri chýbajúcej projekcii. Create/update podporovaných agend navyše používa 503 pri nedostupnej validácii väzieb. Existujúce error obaly a ostatné stavové kódy zostávajú.

# Faktúry

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `odberatel` | object | Áno | Objekt s povinným `nazov` (string) a voliteľným `ico` (8 číslic alebo null). |
| `datum_vystavenia` | string | Áno | Dátum vystavenia, YYYY-MM-DD. |
| `datum_splatnosti` | string | Áno | Dátum splatnosti, YYYY-MM-DD; nesmie predchádzať vystaveniu. |
| `suma_bez_dph` | string | Áno | Nezáporná suma bez DPH, desatinný reťazec s 2 miestami. |
| `suma_dph` | string | Áno | Nezáporná suma DPH, desatinný reťazec s 2 miestami. |
| `suma_s_dph` | string | Áno | Nezáporná suma s DPH, desatinný reťazec s 2 miestami. |
| `mena` | string | Áno | Trojpísmenový kód meny; v tomto návrhu iba EUR. |
| `zverejnene` | boolean | Nie | Predvolene false. |
| `suvisiace_zaznamy` | array objektov `{typ, id}` | Nie | Voliteľný viacnásobný výber podľa spoločného kontraktu väzieb; pri vytvorení predvolene `[]`. |

## Zoznam

`GET /rest/v1/faktury`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/faktury?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "fak_001",
      "obec_id": "obec_001",
      "cislo": "FV-2026-001",
      "predmet": "Prenájom obecnej sály",
      "odberatel": {
        "nazov": "Ukážkový odberateľ",
        "ico": "12345678"
      },
      "datum_vystavenia": "2026-10-01",
      "datum_splatnosti": "2026-10-15",
      "suma_bez_dph": "100.00",
      "suma_dph": "23.00",
      "suma_s_dph": "123.00",
      "mena": "EUR",
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z",
      "suvisiace_zaznamy": [
        {
          "typ": "zmluvy",
          "id": "zml_001"
        }
      ],
      "entity_version": 1
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/faktury/{id}`

Povinné: id v ceste (neprázdny string, napr. fak_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/faktury/fak_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "fak_001",
    "obec_id": "obec_001",
    "cislo": "FV-2026-001",
    "predmet": "Prenájom obecnej sály",
    "odberatel": {
      "nazov": "Ukážkový odberateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Vytvorenie

`POST /rest/v1/faktury`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "FV-2026-001",
  "predmet": "Prenájom obecnej sály",
  "odberatel": {
    "nazov": "Ukážkový odberateľ",
    "ico": "12345678"
  },
  "datum_vystavenia": "2026-10-01",
  "datum_splatnosti": "2026-10-15",
  "suma_bez_dph": "100.00",
  "suma_dph": "23.00",
  "suma_s_dph": "123.00",
  "mena": "EUR",
  "zverejnene": true,
  "suvisiace_zaznamy": [
    {
      "typ": "zmluvy",
      "id": "zml_001"
    }
  ]
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/faktury/fak_001`:

```json
{
  "data": {
    "id": "fak_001",
    "obec_id": "obec_001",
    "cislo": "FV-2026-001",
    "predmet": "Prenájom obecnej sály",
    "odberatel": {
      "nazov": "Ukážkový odberateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Úprava

`POST /rest/v1/faktury/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/faktury/fak_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Prenájom obecnej sály na podujatie",
  "suvisiace_zaznamy": [
    {
      "typ": "zmluvy",
      "id": "zml_001"
    }
  ]
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "fak_001",
    "obec_id": "obec_001",
    "cislo": "FV-2026-001",
    "predmet": "Prenájom obecnej sály na podujatie",
    "odberatel": {
      "nazov": "Ukážkový odberateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 2
  }
}
```

## Vymazanie

`POST /rest/v1/faktury/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/faktury/fak_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "fak_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# Dodávateľské faktúry

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `dodavatel` | object | Áno | Objekt s povinným `nazov` (string) a voliteľným `ico` (8 číslic alebo null). |
| `datum_vystavenia` | string | Áno | Dátum vystavenia, YYYY-MM-DD. |
| `datum_splatnosti` | string | Áno | Dátum splatnosti, YYYY-MM-DD; nesmie predchádzať vystaveniu. |
| `suma_bez_dph` | string | Áno | Nezáporná suma bez DPH, desatinný reťazec s 2 miestami. |
| `suma_dph` | string | Áno | Nezáporná suma DPH, desatinný reťazec s 2 miestami. |
| `suma_s_dph` | string | Áno | Nezáporná suma s DPH, desatinný reťazec s 2 miestami. |
| `mena` | string | Áno | Trojpísmenový kód meny; v tomto návrhu iba EUR. |
| `zverejnene` | boolean | Nie | Predvolene false. |
| `suvisiace_zaznamy` | array objektov `{typ, id}` | Nie | Voliteľný viacnásobný výber podľa spoločného kontraktu väzieb; pri vytvorení predvolene `[]`. |

## Zoznam

`GET /rest/v1/dodavatelske-faktury`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/dodavatelske-faktury?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "dfak_001",
      "obec_id": "obec_001",
      "cislo": "DF-2026-001",
      "predmet": "Dodávka kancelárskych potrieb",
      "dodavatel": {
        "nazov": "Ukážkový dodávateľ",
        "ico": "12345678"
      },
      "datum_vystavenia": "2026-10-01",
      "datum_splatnosti": "2026-10-15",
      "suma_bez_dph": "100.00",
      "suma_dph": "23.00",
      "suma_s_dph": "123.00",
      "mena": "EUR",
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z",
      "suvisiace_zaznamy": [
        {
          "typ": "zmluvy",
          "id": "zml_001"
        }
      ],
      "entity_version": 1
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/dodavatelske-faktury/{id}`

Povinné: id v ceste (neprázdny string, napr. dfak_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/dodavatelske-faktury/dfak_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "dfak_001",
    "obec_id": "obec_001",
    "cislo": "DF-2026-001",
    "predmet": "Dodávka kancelárskych potrieb",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Vytvorenie

`POST /rest/v1/dodavatelske-faktury`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "DF-2026-001",
  "predmet": "Dodávka kancelárskych potrieb",
  "dodavatel": {
    "nazov": "Ukážkový dodávateľ",
    "ico": "12345678"
  },
  "datum_vystavenia": "2026-10-01",
  "datum_splatnosti": "2026-10-15",
  "suma_bez_dph": "100.00",
  "suma_dph": "23.00",
  "suma_s_dph": "123.00",
  "mena": "EUR",
  "zverejnene": true,
  "suvisiace_zaznamy": [
    {
      "typ": "zmluvy",
      "id": "zml_001"
    }
  ]
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/dodavatelske-faktury/dfak_001`:

```json
{
  "data": {
    "id": "dfak_001",
    "obec_id": "obec_001",
    "cislo": "DF-2026-001",
    "predmet": "Dodávka kancelárskych potrieb",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Úprava

`POST /rest/v1/dodavatelske-faktury/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/dodavatelske-faktury/dfak_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Dodávka kancelárskych potrieb pre obecný úrad",
  "suvisiace_zaznamy": [
    {
      "typ": "zmluvy",
      "id": "zml_001"
    }
  ]
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "dfak_001",
    "obec_id": "obec_001",
    "cislo": "DF-2026-001",
    "predmet": "Dodávka kancelárskych potrieb pre obecný úrad",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_vystavenia": "2026-10-01",
    "datum_splatnosti": "2026-10-15",
    "suma_bez_dph": "100.00",
    "suma_dph": "23.00",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "zmluvy",
        "id": "zml_001"
      }
    ],
    "entity_version": 2
  }
}
```

## Vymazanie

`POST /rest/v1/dodavatelske-faktury/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/dodavatelske-faktury/dfak_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "dfak_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# Zmluvy

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `zmluvna_strana` | object | Áno | Objekt s povinným `nazov` (string) a voliteľným `ico` (8 číslic alebo null). |
| `datum_podpisu` | string | Áno | Dátum podpisu, YYYY-MM-DD. |
| `datum_ucinnosti` | string | Áno | Dátum účinnosti, YYYY-MM-DD; hodnota zadaná úradníkom. |
| `platnost_do` | string alebo null | Nie | Koniec platnosti, YYYY-MM-DD alebo null pre neurčitú dobu. |
| `suma_s_dph` | string | Áno | Nezáporná suma s DPH, desatinný reťazec s 2 miestami. |
| `mena` | string | Áno | Trojpísmenový kód meny; v tomto návrhu iba EUR. |
| `zverejnene` | boolean | Nie | Predvolene false. |
| `suvisiace_zaznamy` | array objektov `{typ, id}` | Nie | Voliteľný viacnásobný výber podľa spoločného kontraktu väzieb; pri vytvorení predvolene `[]`. |

## Zoznam

`GET /rest/v1/zmluvy`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/zmluvy?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "zml_001",
      "obec_id": "obec_001",
      "cislo": "Z-2026-001",
      "predmet": "Servis obecnej techniky",
      "zmluvna_strana": {
        "nazov": "Ukážkový servis",
        "ico": "12345678"
      },
      "datum_podpisu": "2026-10-01",
      "datum_ucinnosti": "2026-10-05",
      "platnost_do": null,
      "suma_s_dph": "1230.00",
      "mena": "EUR",
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z",
      "suvisiace_zaznamy": [
        {
          "typ": "objednavky",
          "id": "obj_001"
        }
      ],
      "entity_version": 1
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/zmluvy/{id}`

Povinné: id v ceste (neprázdny string, napr. zml_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/zmluvy/zml_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "zml_001",
    "obec_id": "obec_001",
    "cislo": "Z-2026-001",
    "predmet": "Servis obecnej techniky",
    "zmluvna_strana": {
      "nazov": "Ukážkový servis",
      "ico": "12345678"
    },
    "datum_podpisu": "2026-10-01",
    "datum_ucinnosti": "2026-10-05",
    "platnost_do": null,
    "suma_s_dph": "1230.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Vytvorenie

`POST /rest/v1/zmluvy`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "Z-2026-001",
  "predmet": "Servis obecnej techniky",
  "zmluvna_strana": {
    "nazov": "Ukážkový servis",
    "ico": "12345678"
  },
  "datum_podpisu": "2026-10-01",
  "datum_ucinnosti": "2026-10-05",
  "platnost_do": null,
  "suma_s_dph": "1230.00",
  "mena": "EUR",
  "zverejnene": true,
  "suvisiace_zaznamy": [
    {
      "typ": "objednavky",
      "id": "obj_001"
    }
  ]
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/zmluvy/zml_001`:

```json
{
  "data": {
    "id": "zml_001",
    "obec_id": "obec_001",
    "cislo": "Z-2026-001",
    "predmet": "Servis obecnej techniky",
    "zmluvna_strana": {
      "nazov": "Ukážkový servis",
      "ico": "12345678"
    },
    "datum_podpisu": "2026-10-01",
    "datum_ucinnosti": "2026-10-05",
    "platnost_do": null,
    "suma_s_dph": "1230.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Úprava

`POST /rest/v1/zmluvy/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/zmluvy/zml_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Servis a údržba obecnej techniky",
  "suvisiace_zaznamy": [
    {
      "typ": "objednavky",
      "id": "obj_001"
    }
  ]
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "zml_001",
    "obec_id": "obec_001",
    "cislo": "Z-2026-001",
    "predmet": "Servis a údržba obecnej techniky",
    "zmluvna_strana": {
      "nazov": "Ukážkový servis",
      "ico": "12345678"
    },
    "datum_podpisu": "2026-10-01",
    "datum_ucinnosti": "2026-10-05",
    "platnost_do": null,
    "suma_s_dph": "1230.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 2
  }
}
```

## Vymazanie

`POST /rest/v1/zmluvy/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/zmluvy/zml_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "zml_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# Objednávky

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `dodavatel` | object | Áno | Objekt s povinným `nazov` (string) a voliteľným `ico` (8 číslic alebo null). |
| `datum_objednania` | string | Áno | Dátum objednania, YYYY-MM-DD. |
| `termin_dodania` | string alebo null | Nie | Dátum dodania, YYYY-MM-DD alebo null; nesmie predchádzať objednaniu. |
| `suma_s_dph` | string | Áno | Nezáporná suma s DPH, desatinný reťazec s 2 miestami. |
| `mena` | string | Áno | Trojpísmenový kód meny; v tomto návrhu iba EUR. |
| `zverejnene` | boolean | Nie | Predvolene false. |
| `suvisiace_zaznamy` | array objektov `{typ, id}` | Nie | Voliteľný viacnásobný výber podľa spoločného kontraktu väzieb; pri vytvorení predvolene `[]`. |

## Zoznam

`GET /rest/v1/objednavky`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/objednavky?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "obj_001",
      "obec_id": "obec_001",
      "cislo": "OBJ-2026-001",
      "predmet": "Objednávka kancelárskych potrieb",
      "dodavatel": {
        "nazov": "Ukážkový dodávateľ",
        "ico": "12345678"
      },
      "datum_objednania": "2026-10-01",
      "termin_dodania": "2026-10-15",
      "suma_s_dph": "123.00",
      "mena": "EUR",
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z",
      "suvisiace_zaznamy": [
        {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        }
      ],
      "entity_version": 1
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/objednavky/{id}`

Povinné: id v ceste (neprázdny string, napr. obj_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/objednavky/obj_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "obj_001",
    "obec_id": "obec_001",
    "cislo": "OBJ-2026-001",
    "predmet": "Objednávka kancelárskych potrieb",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_objednania": "2026-10-01",
    "termin_dodania": "2026-10-15",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "verejne-obstaravanie",
        "id": "vo_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Vytvorenie

`POST /rest/v1/objednavky`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "OBJ-2026-001",
  "predmet": "Objednávka kancelárskych potrieb",
  "dodavatel": {
    "nazov": "Ukážkový dodávateľ",
    "ico": "12345678"
  },
  "datum_objednania": "2026-10-01",
  "termin_dodania": "2026-10-15",
  "suma_s_dph": "123.00",
  "mena": "EUR",
  "zverejnene": true,
  "suvisiace_zaznamy": [
    {
      "typ": "verejne-obstaravanie",
      "id": "vo_001"
    }
  ]
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/objednavky/obj_001`:

```json
{
  "data": {
    "id": "obj_001",
    "obec_id": "obec_001",
    "cislo": "OBJ-2026-001",
    "predmet": "Objednávka kancelárskych potrieb",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_objednania": "2026-10-01",
    "termin_dodania": "2026-10-15",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "verejne-obstaravanie",
        "id": "vo_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Úprava

`POST /rest/v1/objednavky/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/objednavky/obj_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Objednávka papiera a kancelárskych potrieb",
  "suvisiace_zaznamy": [
    {
      "typ": "verejne-obstaravanie",
      "id": "vo_001"
    }
  ]
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "obj_001",
    "obec_id": "obec_001",
    "cislo": "OBJ-2026-001",
    "predmet": "Objednávka papiera a kancelárskych potrieb",
    "dodavatel": {
      "nazov": "Ukážkový dodávateľ",
      "ico": "12345678"
    },
    "datum_objednania": "2026-10-01",
    "termin_dodania": "2026-10-15",
    "suma_s_dph": "123.00",
    "mena": "EUR",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "verejne-obstaravanie",
        "id": "vo_001"
      }
    ],
    "entity_version": 2
  }
}
```

## Vymazanie

`POST /rest/v1/objednavky/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/objednavky/obj_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "obj_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# Verejné obstarávanie

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `nazov` | string | Áno | Názov záznamu. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `cpv` | string | Áno | CPV kód vo formáte 8 číslic, pomlčka, kontrolná číslica. |
| `predpokladana_hodnota_bez_dph` | string | Áno | Nezáporný odhad bez DPH, desatinný reťazec s 2 miestami. |
| `mena` | string | Áno | Trojpísmenový kód meny; v tomto návrhu iba EUR. |
| `lehota_predkladania` | string | Áno | Termín predkladania v ISO 8601 s časovým pásmom. |
| `stav` | string | Áno | Jedna z hodnôt otvorene, vyhodnocovanie, ukoncene, zrusene. |
| `zverejnene` | boolean | Nie | Predvolene false. |
| `suvisiace_zaznamy` | array objektov `{typ, id}` | Nie | Voliteľný viacnásobný výber podľa spoločného kontraktu väzieb; pri vytvorení predvolene `[]`. |

## Zoznam

`GET /rest/v1/verejne-obstaravanie`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/verejne-obstaravanie?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "vo_001",
      "obec_id": "obec_001",
      "cislo": "VO-2026-001",
      "nazov": "Oprava miestnej komunikácie",
      "predmet": "Stavebné práce na miestnej komunikácii",
      "cpv": "45233142-6",
      "predpokladana_hodnota_bez_dph": "50000.00",
      "mena": "EUR",
      "lehota_predkladania": "2026-11-30T11:00:00Z",
      "stav": "otvorene",
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z",
      "suvisiace_zaznamy": [
        {
          "typ": "objednavky",
          "id": "obj_001"
        }
      ],
      "entity_version": 1
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/verejne-obstaravanie/{id}`

Povinné: id v ceste (neprázdny string, napr. vo_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/verejne-obstaravanie/vo_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vo_001",
    "obec_id": "obec_001",
    "cislo": "VO-2026-001",
    "nazov": "Oprava miestnej komunikácie",
    "predmet": "Stavebné práce na miestnej komunikácii",
    "cpv": "45233142-6",
    "predpokladana_hodnota_bez_dph": "50000.00",
    "mena": "EUR",
    "lehota_predkladania": "2026-11-30T11:00:00Z",
    "stav": "otvorene",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Vytvorenie

`POST /rest/v1/verejne-obstaravanie`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "VO-2026-001",
  "nazov": "Oprava miestnej komunikácie",
  "predmet": "Stavebné práce na miestnej komunikácii",
  "cpv": "45233142-6",
  "predpokladana_hodnota_bez_dph": "50000.00",
  "mena": "EUR",
  "lehota_predkladania": "2026-11-30T11:00:00Z",
  "stav": "otvorene",
  "zverejnene": true,
  "suvisiace_zaznamy": [
    {
      "typ": "objednavky",
      "id": "obj_001"
    }
  ]
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/verejne-obstaravanie/vo_001`:

```json
{
  "data": {
    "id": "vo_001",
    "obec_id": "obec_001",
    "cislo": "VO-2026-001",
    "nazov": "Oprava miestnej komunikácie",
    "predmet": "Stavebné práce na miestnej komunikácii",
    "cpv": "45233142-6",
    "predpokladana_hodnota_bez_dph": "50000.00",
    "mena": "EUR",
    "lehota_predkladania": "2026-11-30T11:00:00Z",
    "stav": "otvorene",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 1
  }
}
```

## Úprava

`POST /rest/v1/verejne-obstaravanie/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/verejne-obstaravanie/vo_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Oprava povrchu miestnej komunikácie",
  "suvisiace_zaznamy": [
    {
      "typ": "objednavky",
      "id": "obj_001"
    }
  ]
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vo_001",
    "obec_id": "obec_001",
    "cislo": "VO-2026-001",
    "nazov": "Oprava miestnej komunikácie",
    "predmet": "Oprava povrchu miestnej komunikácie",
    "cpv": "45233142-6",
    "predpokladana_hodnota_bez_dph": "50000.00",
    "mena": "EUR",
    "lehota_predkladania": "2026-11-30T11:00:00Z",
    "stav": "otvorene",
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z",
    "suvisiace_zaznamy": [
      {
        "typ": "objednavky",
        "id": "obj_001"
      }
    ],
    "entity_version": 2
  }
}
```

## Vymazanie

`POST /rest/v1/verejne-obstaravanie/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/verejne-obstaravanie/vo_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vo_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# VZN

## Polia požiadavky

| Pole | Typ | Povinné pri vytvorení | Význam |
| --- | --- | --- | --- |
| `cislo` | string | Áno | Evidenčné číslo; jedinečné v rámci obce a agendy. |
| `nazov` | string | Áno | Názov záznamu. |
| `predmet` | string | Áno | Opis predmetu záznamu. |
| `datum_schvalenia` | string | Áno | undefined |
| `datum_ucinnosti` | string | Áno | Dátum účinnosti, YYYY-MM-DD; hodnota zadaná úradníkom. |
| `platnost_do` | string alebo null | Nie | Koniec platnosti, YYYY-MM-DD alebo null pre neurčitú dobu. |
| `zverejnene` | boolean | Nie | Predvolene false. |

## Zoznam

`GET /rest/v1/vzn`

Parametre: povinná hlavička X-Obec-Id; voliteľné query page, page_size, q, sort, zverejnene podľa spoločnej tabuľky. Telo sa neposiela.

Ukážka požiadavky:

```http
GET /rest/v1/vzn?page=1&page_size=20&sort=-created_at&zverejnene=true
Accept: application/json
X-Obec-Id: obec_001
```

Odpoveď **200 OK**:

```json
{
  "data": [
    {
      "id": "vzn_001",
      "obec_id": "obec_001",
      "cislo": "3/2026",
      "nazov": "VZN o nakladaní s komunálnym odpadom",
      "predmet": "Pravidlá nakladania s komunálnym odpadom",
      "datum_schvalenia": "2026-10-01",
      "datum_ucinnosti": "2026-11-01",
      "platnost_do": null,
      "zverejnene": true,
      "created_at": "2026-10-01T08:00:00Z",
      "updated_at": "2026-10-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Detail

`GET /rest/v1/vzn/{id}`

Povinné: id v ceste (neprázdny string, napr. vzn_001) a hlavička X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `GET /rest/v1/vzn/vzn_001`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vzn_001",
    "obec_id": "obec_001",
    "cislo": "3/2026",
    "nazov": "VZN o nakladaní s komunálnym odpadom",
    "predmet": "Pravidlá nakladania s komunálnym odpadom",
    "datum_schvalenia": "2026-10-01",
    "datum_ucinnosti": "2026-11-01",
    "platnost_do": null,
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z"
  }
}
```

## Vytvorenie

`POST /rest/v1/vzn`

Povinné hlavičky: X-Obec-Id a Content-Type: application/json. Parametre cesty ani query sa neposielajú. Povinné polia tela určuje tabuľka tejto agendy.

Ukážkové telo požiadavky:

```json
{
  "cislo": "3/2026",
  "nazov": "VZN o nakladaní s komunálnym odpadom",
  "predmet": "Pravidlá nakladania s komunálnym odpadom",
  "datum_schvalenia": "2026-10-01",
  "datum_ucinnosti": "2026-11-01",
  "platnost_do": null,
  "zverejnene": true
}
```

Odpoveď **201 Created**, hlavička `Location: /rest/v1/vzn/vzn_001`:

```json
{
  "data": {
    "id": "vzn_001",
    "obec_id": "obec_001",
    "cislo": "3/2026",
    "nazov": "VZN o nakladaní s komunálnym odpadom",
    "predmet": "Pravidlá nakladania s komunálnym odpadom",
    "datum_schvalenia": "2026-10-01",
    "datum_ucinnosti": "2026-11-01",
    "platnost_do": null,
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-01T08:00:00Z"
  }
}
```

## Úprava

`POST /rest/v1/vzn/{id}/update`

Povinné: id v ceste, X-Obec-Id, Content-Type: application/json a aspoň jedno upraviteľné pole v tele. Query parametre sa neposielajú. Príklad: `POST /rest/v1/vzn/vzn_001/update`.

Ukážkové telo požiadavky:

```json
{
  "predmet": "Pravidlá zberu a nakladania s komunálnym odpadom"
}
```

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vzn_001",
    "obec_id": "obec_001",
    "cislo": "3/2026",
    "nazov": "VZN o nakladaní s komunálnym odpadom",
    "predmet": "Pravidlá zberu a nakladania s komunálnym odpadom",
    "datum_schvalenia": "2026-10-01",
    "datum_ucinnosti": "2026-11-01",
    "platnost_do": null,
    "zverejnene": true,
    "created_at": "2026-10-01T08:00:00Z",
    "updated_at": "2026-10-02T09:00:00Z"
  }
}
```

## Vymazanie

`POST /rest/v1/vzn/{id}/delete`

Povinné: id v ceste, X-Obec-Id. Query parametre ani telo sa neposielajú. Príklad: `POST /rest/v1/vzn/vzn_001/delete`.

Odpoveď **200 OK**:

```json
{
  "data": {
    "id": "vzn_001",
    "deleted": true,
    "deleted_at": "2026-10-03T10:00:00Z"
  }
}
```

# Chybové odpovede

| HTTP stav | Kód | Kedy |
| --- | --- | --- |
| 400 | BAD_REQUEST | Chýbajúca X-Obec-Id, chybný JSON alebo neplatné query parametre. |
| 404 | NOT_FOUND | Detail, update alebo delete neexistujúceho alebo zmazaného záznamu v zadanej obci. |
| 409 | CONFLICT | Vytvorenie alebo update porušuje jedinečnosť cislo v obci a agende. |
| 415 | UNSUPPORTED_MEDIA_TYPE | Vytvorenie alebo update nepoužíva application/json. |
| 422 | VALIDATION_ERROR | Chýbajúce alebo neplatné polia, neprípustné null či prázdny update. |
| 429 | RATE_LIMITED | Prekročený limit požiadaviek; hlavička Retry-After udáva sekundy do ďalšieho pokusu. |
| 500 | INTERNAL_ERROR | Neočakávaná chyba servera. |
| 422 | VALIDATION_ERROR | Neplatný typ/ID väzby, duplicitný výber, viac než 100 odkazov alebo cieľ nedostupný v zadanej obci; `details[].code` rozlišuje príčinu. |
| 503 | DEPENDENCY_UNAVAILABLE | Nedostupné API potrebné na overenie nových väzieb alebo query úložisko; `Retry-After` určuje odporúčaný odstup. |

GET zoznam používa 400, 429, 500; GET detail navyše 404. POST create používa 400, 409, 415, 422, 429, 500. POST update navyše 404. POST delete používa 400, 404, 429, 500. Všetky chyby majú rovnaký JSON obal; details je prázdne pole, ak sa chyba netýka konkrétneho poľa.

## Ukážka validačnej chyby

Odpoveď **422 Unprocessable Content** pri vytvorení faktúry bez cislo:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Požiadavka obsahuje neplatné údaje.",
    "details": [
      {
        "field": "cislo",
        "code": "REQUIRED",
        "message": "Pole cislo je povinné."
      }
    ],
    "request_id": "req_example_001"
  }
}
```

## Ukážka nenájdeného záznamu

Odpoveď **404 Not Found** pre neexistujúci detail, update alebo delete v ktorejkoľvek agende:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Záznam nebol nájdený.",
    "details": [],
    "request_id": "req_example_002"
  }
}
```

# Joined view API s kompletnými údajmi

Query API poskytuje samostatné read endpointy pre päť prepojených agend. Detail vracia plné polia koreňového záznamu aj plné polia všetkých dosiahnuteľných prepojených dokumentov. Nejde iba o ID alebo súhrny. Ide o návrh kontraktu; nové cesty nie sú potvrdením nasadenej implementácie.

| Agenda | Zoznam z joined view | Kompletný prepojený detail |
| --- | --- | --- |
| Faktúry | `GET /rest/v1/query/faktury` | `GET /rest/v1/query/faktury/{id}` |
| Dodávateľské faktúry | `GET /rest/v1/query/dodavatelske-faktury` | `GET /rest/v1/query/dodavatelske-faktury/{id}` |
| Zmluvy | `GET /rest/v1/query/zmluvy` | `GET /rest/v1/query/zmluvy/{id}` |
| Objednávky | `GET /rest/v1/query/objednavky` | `GET /rest/v1/query/objednavky/{id}` |
| Verejné obstarávanie | `GET /rest/v1/query/verejne-obstaravanie` | `GET /rest/v1/query/verejne-obstaravanie/{id}` |

## Rozdelenie zodpovedností

Doménové služby na pôvodných cestách /rest/v1/{agenda} vlastnia zápisy, validáciu a aktuálne zdrojové dáta. Ich detail zostáva použitý pri overovaní nových väzieb. Query API na /rest/v1/query/{agenda} obsluhuje portálové čítanie zo spoločnej read databázy. /suvislosti zostáva ľahkým grafovým pohľadom so súhrnmi; nový query detail ho na obrazovke úplného detailu nahrádza.

Služba párovania prijíma cez MQ úplné verziované stavy vrátane vlastných suvisiace_zaznamy. V read databáze ukladá plné kópie dokumentov pod kľúčom (obec_id, typ, id), vlastníkov väzieb a obojsmerný graf. Joined view je tento logicky spojený model; nemusí byť jednou SQL tabuľkou. Query API spája lokálne kópie a graf bez volania API každej súvisiacej agendy. Zmena jedného dokumentu sa preto prejaví aj pri čítaní detailu ostatných dokumentov v jeho reťazci.

## Rozsah prepojenia

Dokumenty sa prepájajú iba podľa explicitných suvisiace_zaznamy, nie podľa podobného názvu, sumy alebo času vytvorenia. Priechod je obojsmerný a zahŕňa celú dosiahnuteľnú súvislú časť grafu bez limitu hĺbky 3 používaného na /suvislosti. Cykly sa zastavia evidenciou navštívených dvojíc (typ, id); každý dokument sa vracia raz. Poradie krokov obchodného procesu sa z väzieb nevyvodzuje.

Príklad: objednávka odkazuje na obstarávanie, faktúra na objednávku aj zmluvu. Query detail obstarávania, objednávky, faktúry aj zmluvy vráti všetky štyri dokumenty; mení sa len root. VZN nemá v existujúcom kontrakte väzby a zostáva na pôvodných endpointoch.

## Hlavičky a parametre

Všetky nové endpointy sú GET bez tela a bez autentifikácie. Povinné X-Obec-Id určuje obec; Accept je application/json. Detail vyžaduje id v ceste (neprázdny string, max. 200 znakov). Filtre obce, logického zmazania a zverejnenia platia na každý uzol; cez odfiltrovaný uzol sa nepokračuje. Odkazy v plných záznamoch sa vo verejnom filtrovanom výstupe obmedzia na viditeľné ciele, aby neodhalili skryté dokumenty.

| Parameter | Zoznam | Detail |
| --- | --- | --- |
| `page` | Integer od 1, predvolene 1. | Nepoužíva sa. |
| `page_size` | Integer 1 až 100, predvolene 20. | Nepoužíva sa. |
| `q` | Max. 200 znakov; vyhľadáva v čísle, názve a predmete koreňových záznamov danej agendy. | Nepoužíva sa. |
| `sort` | created_at, -created_at, updated_at, -updated_at; predvolene -created_at, pri zhode id vzostupne. | Nepoužíva sa. |
| `zverejnene` | Voliteľné true/false; vynechané znamená oba stavy. | Rovnaké pravidlo pre koreň aj celú prechádzanú časť grafu. |
| `related_page_size` | Nepoužíva sa. | Integer 1 až 100, predvolene 100; počet súvisiacich plných dokumentov na stránku, bez koreňa. |
| `cursor` | Nepoužíva sa. | Nepriehľadný next_cursor z predchádzajúcej odpovede; pokračovanie rovnakého snapshotu. |

## Tvar úspešnej odpovede

Zoznam vracia data ako pole plných koreňových záznamov zabalených do {typ, zaznam, detail_url}, pagination a projection. Súvislé grafy sa v zozname neopakujú pri každom riadku; na ich načítanie slúži detail_url. total počíta iba záznamy viditeľné v aktuálnej projekcii po filtrovaní, nie počet dokumentov v celom reťazci. Prázdny zoznam je 200 s data: [].

Detail vracia data.root ako {typ, zaznam} s celým koreňovým dokumentom, data.suvisiace_zaznamy ako pole {typ, zaznam} s celými súvisiacimi dokumentmi, data.vazby ako hrany from/to/owners a data.pagination pre súvisiace dokumenty. Každý zaznam obsahuje všetky výstupné polia svojej agendy vrátane súm, protistrán, dátumov, vlastných odkazov a entity_version; množina polí sa riadi tabuľkami agend vyššie. Vlastné odkazy zaznam.suvisiace_zaznamy sú stále len {typ,id}; plné dokumenty sú o úroveň vyššie v data.suvisiace_zaznamy.

Pri viac než 100 súvisiacich dokumentoch klient pokračuje cez next_cursor, až kým nie je null. Pole pagination.complete znamená, že odpoveď je poslednou stránkou; všetky informácie sú získané po spojení všetkých stránok. Zoznam súvisiacich dokumentov je radený podľa typ a id. Každá stránka obsahuje celý root a hrany incidentné k dokumentom na danej stránke; prvá aj hrany koreňa. Hrany sa pri spájaní stránok deduplikujú podľa neusporiadanej dvojice koncov. Koniec hrany môže byť v inej stránke toho istého výsledku. Žiadna hrana nesmie smerovať k odfiltrovanému dokumentu.

Prvé detailové volanie vytvorí konzistentný snapshot výsledku s platnosťou 10 minút. Cursor je viazaný na obec, agendu, id, zverejnene a related_page_size; pri pokračovaní klient tieto hodnoty nemení. Zmeny cez MQ sa prejavia až v novom prvom volaní. Neplatný alebo nezhodný cursor vráti 400; vypršaný 410 CURSOR_EXPIRED a klient začne od prvej stránky. Ani veľký výsledok sa potichu neoreže.

## Oneskorenie a chybové stavy

Query čítanie je asynchrónne voči zápisom. Existujúca projekcia sa obslúži lokálne. Ak koreň v read databáze ešte nie je, Query API overí iba jeho existenciu cez doménový detail: neexistujúci, zmazaný, mimo obce alebo nevyhovujúci filtru znamená 404; existujúci znamená 202 a Retry-After: 2. Pri nedostupnosti overenia alebo read databázy vráti 503. Toto overenie sa nepoužíva na získavanie detailov všetkých prepojených dokumentov.

projection obsahuje status (ready alebo pending), as_of (čas snapshotu read modelu), root_entity_version (pri detaile; pri zozname null) a unresolved_references_count. ready znamená vyriešené lokálne známe odkazy, nie záruku, že dorazili všetky udalosti. Ak koreň existuje, ale známy cieľ ešte čaká na projekciu, odpoveď je 200 s pending, plnými dostupnými dokumentmi a počtom čakajúcich odkazov. Neúplné polia dokumentov sa nenahrádzajú vymyslenými údajmi. Po doručení udalosti o delete zmizne dokument a jeho hrany; do jej spracovania môže byť projekcia staršia.

Nové zoznamy používajú chyby 400, 429, 500, 503. Nové detaily navyše 404 a 410; stav 202 je čakanie na projekciu, nie chyba. Chyby zachovávajú obal error s code, message, details a request_id. Úspešný zápis na pôvodnom POST stále vracia 201/200 bez čakania na query projekciu.

Príklad odpovede 202 pri chýbajúcej projekcii:

```json
{
  "data": {
    "root": {
      "typ": "faktury",
      "id": "fak_001",
      "zaznam": null
    },
    "suvisiace_zaznamy": [],
    "vazby": [],
    "pagination": {
      "related_page_size": 100,
      "total": null,
      "next_cursor": null,
      "complete": false
    }
  },
  "projection": {
    "status": "pending",
    "root_entity_version": null,
    "as_of": null,
    "unresolved_references_count": null
  }
}
```

## Udržiavanie úplného read modelu

Udalosť musí obsahovať celý aktuálny stav dokumentu, nie iba zmenené polia; delete obsahuje identitu, verziu a príznak zmazania. Párovacia služba v jednej transakcii uloží plný stav, aktuálne tvrdenia vlastníka väzieb, spätné väzby a evidenciu event_id/verzie. Duplicity a staršie verzie ignoruje; ACK odošle až po commite. Pri zmene väzieb odstráni iba tvrdenia ich vlastníka. Pri zmazaní vylúči dokument z čítania a priechodu, ale nezmaže ostatné dokumenty. Čakajúci cieľ po príchode doplní do grafu. Párovanie je v rámci jednej obce.

Existujúce dáta treba pri prvom zavedení naplniť verziovaným backfillom z doménových služieb cez rovnaký projekčný postup; súbežné udalosti sa porovnávajú podľa entity_version. Read model možno znovu zostaviť bez zmeny zdrojových dát. Pre akceptáciu treba overiť čítanie rovnakého reťazca zo všetkých koreňov, cykly, oneskorený cieľ, update cieľa, odstránenie väzby, delete, duplicity a prehodené udalosti, izoláciu obcí, filtre a pokračovanie cez cursor.

## Faktúry z joined view

`GET /rest/v1/query/faktury?page=1&page_size=20`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre zoznamu určuje spoločná tabuľka. Odpoveď 200 obsahuje plné záznamy danej agendy a odkazy na ich prepojené detaily.

```json
{
  "data": [
    {
      "typ": "faktury",
      "zaznam": {
        "id": "fak_001",
        "obec_id": "obec_001",
        "cislo": "FV-2026-001",
        "predmet": "Prenájom obecnej sály",
        "odberatel": {
          "nazov": "Ukážkový odberateľ",
          "ico": "12345678"
        },
        "datum_vystavenia": "2026-10-01",
        "datum_splatnosti": "2026-10-15",
        "suma_bez_dph": "100.00",
        "suma_dph": "23.00",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          },
          {
            "typ": "zmluvy",
            "id": "zml_001"
          }
        ],
        "entity_version": 1
      },
      "detail_url": "/rest/v1/query/faktury/fak_001"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  },
  "projection": {
    "status": "ready",
    "root_entity_version": null,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

`GET /rest/v1/query/faktury/fak_001`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre detailu určuje spoločná tabuľka. Odpoveď 200 obsahuje celý koreň a celé prepojené dokumenty z rovnakého ilustračného reťazca.

```json
{
  "data": {
    "root": {
      "typ": "faktury",
      "zaznam": {
        "id": "fak_001",
        "obec_id": "obec_001",
        "cislo": "FV-2026-001",
        "predmet": "Prenájom obecnej sály",
        "odberatel": {
          "nazov": "Ukážkový odberateľ",
          "ico": "12345678"
        },
        "datum_vystavenia": "2026-10-01",
        "datum_splatnosti": "2026-10-15",
        "suma_bez_dph": "100.00",
        "suma_dph": "23.00",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          },
          {
            "typ": "zmluvy",
            "id": "zml_001"
          }
        ],
        "entity_version": 1
      }
    },
    "suvisiace_zaznamy": [
      {
        "typ": "dodavatelske-faktury",
        "zaznam": {
          "id": "dfak_001",
          "obec_id": "obec_001",
          "cislo": "DF-2026-001",
          "predmet": "Dodávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "zmluvy",
        "zaznam": {
          "id": "zml_001",
          "obec_id": "obec_001",
          "cislo": "Z-2026-001",
          "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
          "zmluvna_strana": {
            "nazov": "Ukážkový servis",
            "ico": "12345678"
          },
          "datum_podpisu": "2026-10-01",
          "datum_ucinnosti": "2026-10-05",
          "platnost_do": null,
          "suma_s_dph": "1230.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      },
      {
        "typ": "objednavky",
        "zaznam": {
          "id": "obj_001",
          "obec_id": "obec_001",
          "cislo": "OBJ-2026-001",
          "predmet": "Objednávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_objednania": "2026-10-01",
          "termin_dodania": "2026-10-15",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "verejne-obstaravanie",
              "id": "vo_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "verejne-obstaravanie",
        "zaznam": {
          "id": "vo_001",
          "obec_id": "obec_001",
          "cislo": "VO-2026-001",
          "nazov": "Zabezpečenie obecného podujatia",
          "predmet": "Služby pre obecné podujatie",
          "cpv": "79952000-2",
          "predpokladana_hodnota_bez_dph": "50000.00",
          "mena": "EUR",
          "lehota_predkladania": "2026-11-30T11:00:00Z",
          "stav": "otvorene",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      }
    ],
    "vazby": [
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "zmluvy",
          "id": "zml_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "dodavatelske-faktury",
          "id": "dfak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "dodavatelske-faktury",
            "id": "dfak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "to": {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        },
        "owners": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ]
      }
    ],
    "pagination": {
      "related_page_size": 100,
      "total": 4,
      "next_cursor": null,
      "complete": true
    }
  },
  "projection": {
    "status": "ready",
    "root_entity_version": 1,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

## Dodávateľské faktúry z joined view

`GET /rest/v1/query/dodavatelske-faktury?page=1&page_size=20`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre zoznamu určuje spoločná tabuľka. Odpoveď 200 obsahuje plné záznamy danej agendy a odkazy na ich prepojené detaily.

```json
{
  "data": [
    {
      "typ": "dodavatelske-faktury",
      "zaznam": {
        "id": "dfak_001",
        "obec_id": "obec_001",
        "cislo": "DF-2026-001",
        "predmet": "Dodávka služieb pre obecné podujatie",
        "dodavatel": {
          "nazov": "Ukážkový dodávateľ",
          "ico": "12345678"
        },
        "datum_vystavenia": "2026-10-01",
        "datum_splatnosti": "2026-10-15",
        "suma_bez_dph": "100.00",
        "suma_dph": "23.00",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ],
        "entity_version": 1
      },
      "detail_url": "/rest/v1/query/dodavatelske-faktury/dfak_001"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  },
  "projection": {
    "status": "ready",
    "root_entity_version": null,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

`GET /rest/v1/query/dodavatelske-faktury/dfak_001`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre detailu určuje spoločná tabuľka. Odpoveď 200 obsahuje celý koreň a celé prepojené dokumenty z rovnakého ilustračného reťazca.

```json
{
  "data": {
    "root": {
      "typ": "dodavatelske-faktury",
      "zaznam": {
        "id": "dfak_001",
        "obec_id": "obec_001",
        "cislo": "DF-2026-001",
        "predmet": "Dodávka služieb pre obecné podujatie",
        "dodavatel": {
          "nazov": "Ukážkový dodávateľ",
          "ico": "12345678"
        },
        "datum_vystavenia": "2026-10-01",
        "datum_splatnosti": "2026-10-15",
        "suma_bez_dph": "100.00",
        "suma_dph": "23.00",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ],
        "entity_version": 1
      }
    },
    "suvisiace_zaznamy": [
      {
        "typ": "faktury",
        "zaznam": {
          "id": "fak_001",
          "obec_id": "obec_001",
          "cislo": "FV-2026-001",
          "predmet": "Prenájom obecnej sály",
          "odberatel": {
            "nazov": "Ukážkový odberateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            },
            {
              "typ": "zmluvy",
              "id": "zml_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "zmluvy",
        "zaznam": {
          "id": "zml_001",
          "obec_id": "obec_001",
          "cislo": "Z-2026-001",
          "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
          "zmluvna_strana": {
            "nazov": "Ukážkový servis",
            "ico": "12345678"
          },
          "datum_podpisu": "2026-10-01",
          "datum_ucinnosti": "2026-10-05",
          "platnost_do": null,
          "suma_s_dph": "1230.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      },
      {
        "typ": "objednavky",
        "zaznam": {
          "id": "obj_001",
          "obec_id": "obec_001",
          "cislo": "OBJ-2026-001",
          "predmet": "Objednávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_objednania": "2026-10-01",
          "termin_dodania": "2026-10-15",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "verejne-obstaravanie",
              "id": "vo_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "verejne-obstaravanie",
        "zaznam": {
          "id": "vo_001",
          "obec_id": "obec_001",
          "cislo": "VO-2026-001",
          "nazov": "Zabezpečenie obecného podujatia",
          "predmet": "Služby pre obecné podujatie",
          "cpv": "79952000-2",
          "predpokladana_hodnota_bez_dph": "50000.00",
          "mena": "EUR",
          "lehota_predkladania": "2026-11-30T11:00:00Z",
          "stav": "otvorene",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      }
    ],
    "vazby": [
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "zmluvy",
          "id": "zml_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "dodavatelske-faktury",
          "id": "dfak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "dodavatelske-faktury",
            "id": "dfak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "to": {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        },
        "owners": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ]
      }
    ],
    "pagination": {
      "related_page_size": 100,
      "total": 4,
      "next_cursor": null,
      "complete": true
    }
  },
  "projection": {
    "status": "ready",
    "root_entity_version": 1,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

## Zmluvy z joined view

`GET /rest/v1/query/zmluvy?page=1&page_size=20`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre zoznamu určuje spoločná tabuľka. Odpoveď 200 obsahuje plné záznamy danej agendy a odkazy na ich prepojené detaily.

```json
{
  "data": [
    {
      "typ": "zmluvy",
      "zaznam": {
        "id": "zml_001",
        "obec_id": "obec_001",
        "cislo": "Z-2026-001",
        "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
        "zmluvna_strana": {
          "nazov": "Ukážkový servis",
          "ico": "12345678"
        },
        "datum_podpisu": "2026-10-01",
        "datum_ucinnosti": "2026-10-05",
        "platnost_do": null,
        "suma_s_dph": "1230.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [],
        "entity_version": 1
      },
      "detail_url": "/rest/v1/query/zmluvy/zml_001"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  },
  "projection": {
    "status": "ready",
    "root_entity_version": null,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

`GET /rest/v1/query/zmluvy/zml_001`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre detailu určuje spoločná tabuľka. Odpoveď 200 obsahuje celý koreň a celé prepojené dokumenty z rovnakého ilustračného reťazca.

```json
{
  "data": {
    "root": {
      "typ": "zmluvy",
      "zaznam": {
        "id": "zml_001",
        "obec_id": "obec_001",
        "cislo": "Z-2026-001",
        "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
        "zmluvna_strana": {
          "nazov": "Ukážkový servis",
          "ico": "12345678"
        },
        "datum_podpisu": "2026-10-01",
        "datum_ucinnosti": "2026-10-05",
        "platnost_do": null,
        "suma_s_dph": "1230.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [],
        "entity_version": 1
      }
    },
    "suvisiace_zaznamy": [
      {
        "typ": "faktury",
        "zaznam": {
          "id": "fak_001",
          "obec_id": "obec_001",
          "cislo": "FV-2026-001",
          "predmet": "Prenájom obecnej sály",
          "odberatel": {
            "nazov": "Ukážkový odberateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            },
            {
              "typ": "zmluvy",
              "id": "zml_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "dodavatelske-faktury",
        "zaznam": {
          "id": "dfak_001",
          "obec_id": "obec_001",
          "cislo": "DF-2026-001",
          "predmet": "Dodávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "objednavky",
        "zaznam": {
          "id": "obj_001",
          "obec_id": "obec_001",
          "cislo": "OBJ-2026-001",
          "predmet": "Objednávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_objednania": "2026-10-01",
          "termin_dodania": "2026-10-15",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "verejne-obstaravanie",
              "id": "vo_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "verejne-obstaravanie",
        "zaznam": {
          "id": "vo_001",
          "obec_id": "obec_001",
          "cislo": "VO-2026-001",
          "nazov": "Zabezpečenie obecného podujatia",
          "predmet": "Služby pre obecné podujatie",
          "cpv": "79952000-2",
          "predpokladana_hodnota_bez_dph": "50000.00",
          "mena": "EUR",
          "lehota_predkladania": "2026-11-30T11:00:00Z",
          "stav": "otvorene",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      }
    ],
    "vazby": [
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "zmluvy",
          "id": "zml_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "dodavatelske-faktury",
          "id": "dfak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "dodavatelske-faktury",
            "id": "dfak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "to": {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        },
        "owners": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ]
      }
    ],
    "pagination": {
      "related_page_size": 100,
      "total": 4,
      "next_cursor": null,
      "complete": true
    }
  },
  "projection": {
    "status": "ready",
    "root_entity_version": 1,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

## Objednávky z joined view

`GET /rest/v1/query/objednavky?page=1&page_size=20`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre zoznamu určuje spoločná tabuľka. Odpoveď 200 obsahuje plné záznamy danej agendy a odkazy na ich prepojené detaily.

```json
{
  "data": [
    {
      "typ": "objednavky",
      "zaznam": {
        "id": "obj_001",
        "obec_id": "obec_001",
        "cislo": "OBJ-2026-001",
        "predmet": "Objednávka služieb pre obecné podujatie",
        "dodavatel": {
          "nazov": "Ukážkový dodávateľ",
          "ico": "12345678"
        },
        "datum_objednania": "2026-10-01",
        "termin_dodania": "2026-10-15",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "verejne-obstaravanie",
            "id": "vo_001"
          }
        ],
        "entity_version": 1
      },
      "detail_url": "/rest/v1/query/objednavky/obj_001"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  },
  "projection": {
    "status": "ready",
    "root_entity_version": null,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

`GET /rest/v1/query/objednavky/obj_001`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre detailu určuje spoločná tabuľka. Odpoveď 200 obsahuje celý koreň a celé prepojené dokumenty z rovnakého ilustračného reťazca.

```json
{
  "data": {
    "root": {
      "typ": "objednavky",
      "zaznam": {
        "id": "obj_001",
        "obec_id": "obec_001",
        "cislo": "OBJ-2026-001",
        "predmet": "Objednávka služieb pre obecné podujatie",
        "dodavatel": {
          "nazov": "Ukážkový dodávateľ",
          "ico": "12345678"
        },
        "datum_objednania": "2026-10-01",
        "termin_dodania": "2026-10-15",
        "suma_s_dph": "123.00",
        "mena": "EUR",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [
          {
            "typ": "verejne-obstaravanie",
            "id": "vo_001"
          }
        ],
        "entity_version": 1
      }
    },
    "suvisiace_zaznamy": [
      {
        "typ": "faktury",
        "zaznam": {
          "id": "fak_001",
          "obec_id": "obec_001",
          "cislo": "FV-2026-001",
          "predmet": "Prenájom obecnej sály",
          "odberatel": {
            "nazov": "Ukážkový odberateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            },
            {
              "typ": "zmluvy",
              "id": "zml_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "dodavatelske-faktury",
        "zaznam": {
          "id": "dfak_001",
          "obec_id": "obec_001",
          "cislo": "DF-2026-001",
          "predmet": "Dodávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "zmluvy",
        "zaznam": {
          "id": "zml_001",
          "obec_id": "obec_001",
          "cislo": "Z-2026-001",
          "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
          "zmluvna_strana": {
            "nazov": "Ukážkový servis",
            "ico": "12345678"
          },
          "datum_podpisu": "2026-10-01",
          "datum_ucinnosti": "2026-10-05",
          "platnost_do": null,
          "suma_s_dph": "1230.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      },
      {
        "typ": "verejne-obstaravanie",
        "zaznam": {
          "id": "vo_001",
          "obec_id": "obec_001",
          "cislo": "VO-2026-001",
          "nazov": "Zabezpečenie obecného podujatia",
          "predmet": "Služby pre obecné podujatie",
          "cpv": "79952000-2",
          "predpokladana_hodnota_bez_dph": "50000.00",
          "mena": "EUR",
          "lehota_predkladania": "2026-11-30T11:00:00Z",
          "stav": "otvorene",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      }
    ],
    "vazby": [
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "zmluvy",
          "id": "zml_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "dodavatelske-faktury",
          "id": "dfak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "dodavatelske-faktury",
            "id": "dfak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "to": {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        },
        "owners": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ]
      }
    ],
    "pagination": {
      "related_page_size": 100,
      "total": 4,
      "next_cursor": null,
      "complete": true
    }
  },
  "projection": {
    "status": "ready",
    "root_entity_version": 1,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

## Verejné obstarávanie z joined view

`GET /rest/v1/query/verejne-obstaravanie?page=1&page_size=20`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre zoznamu určuje spoločná tabuľka. Odpoveď 200 obsahuje plné záznamy danej agendy a odkazy na ich prepojené detaily.

```json
{
  "data": [
    {
      "typ": "verejne-obstaravanie",
      "zaznam": {
        "id": "vo_001",
        "obec_id": "obec_001",
        "cislo": "VO-2026-001",
        "nazov": "Zabezpečenie obecného podujatia",
        "predmet": "Služby pre obecné podujatie",
        "cpv": "79952000-2",
        "predpokladana_hodnota_bez_dph": "50000.00",
        "mena": "EUR",
        "lehota_predkladania": "2026-11-30T11:00:00Z",
        "stav": "otvorene",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [],
        "entity_version": 1
      },
      "detail_url": "/rest/v1/query/verejne-obstaravanie/vo_001"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  },
  "projection": {
    "status": "ready",
    "root_entity_version": null,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```

`GET /rest/v1/query/verejne-obstaravanie/vo_001`

Hlavička: `X-Obec-Id: obec_001`. Voliteľné parametre detailu určuje spoločná tabuľka. Odpoveď 200 obsahuje celý koreň a celé prepojené dokumenty z rovnakého ilustračného reťazca.

```json
{
  "data": {
    "root": {
      "typ": "verejne-obstaravanie",
      "zaznam": {
        "id": "vo_001",
        "obec_id": "obec_001",
        "cislo": "VO-2026-001",
        "nazov": "Zabezpečenie obecného podujatia",
        "predmet": "Služby pre obecné podujatie",
        "cpv": "79952000-2",
        "predpokladana_hodnota_bez_dph": "50000.00",
        "mena": "EUR",
        "lehota_predkladania": "2026-11-30T11:00:00Z",
        "stav": "otvorene",
        "zverejnene": true,
        "created_at": "2026-10-01T08:00:00Z",
        "updated_at": "2026-10-01T08:00:00Z",
        "suvisiace_zaznamy": [],
        "entity_version": 1
      }
    },
    "suvisiace_zaznamy": [
      {
        "typ": "faktury",
        "zaznam": {
          "id": "fak_001",
          "obec_id": "obec_001",
          "cislo": "FV-2026-001",
          "predmet": "Prenájom obecnej sály",
          "odberatel": {
            "nazov": "Ukážkový odberateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            },
            {
              "typ": "zmluvy",
              "id": "zml_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "dodavatelske-faktury",
        "zaznam": {
          "id": "dfak_001",
          "obec_id": "obec_001",
          "cislo": "DF-2026-001",
          "predmet": "Dodávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_vystavenia": "2026-10-01",
          "datum_splatnosti": "2026-10-15",
          "suma_bez_dph": "100.00",
          "suma_dph": "23.00",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "objednavky",
              "id": "obj_001"
            }
          ],
          "entity_version": 1
        }
      },
      {
        "typ": "zmluvy",
        "zaznam": {
          "id": "zml_001",
          "obec_id": "obec_001",
          "cislo": "Z-2026-001",
          "predmet": "Zmluva o prenájme priestorov pre obecné podujatie",
          "zmluvna_strana": {
            "nazov": "Ukážkový servis",
            "ico": "12345678"
          },
          "datum_podpisu": "2026-10-01",
          "datum_ucinnosti": "2026-10-05",
          "platnost_do": null,
          "suma_s_dph": "1230.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [],
          "entity_version": 1
        }
      },
      {
        "typ": "objednavky",
        "zaznam": {
          "id": "obj_001",
          "obec_id": "obec_001",
          "cislo": "OBJ-2026-001",
          "predmet": "Objednávka služieb pre obecné podujatie",
          "dodavatel": {
            "nazov": "Ukážkový dodávateľ",
            "ico": "12345678"
          },
          "datum_objednania": "2026-10-01",
          "termin_dodania": "2026-10-15",
          "suma_s_dph": "123.00",
          "mena": "EUR",
          "zverejnene": true,
          "created_at": "2026-10-01T08:00:00Z",
          "updated_at": "2026-10-01T08:00:00Z",
          "suvisiace_zaznamy": [
            {
              "typ": "verejne-obstaravanie",
              "id": "vo_001"
            }
          ],
          "entity_version": 1
        }
      }
    ],
    "vazby": [
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "faktury",
          "id": "fak_001"
        },
        "to": {
          "typ": "zmluvy",
          "id": "zml_001"
        },
        "owners": [
          {
            "typ": "faktury",
            "id": "fak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "dodavatelske-faktury",
          "id": "dfak_001"
        },
        "to": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "owners": [
          {
            "typ": "dodavatelske-faktury",
            "id": "dfak_001"
          }
        ]
      },
      {
        "from": {
          "typ": "objednavky",
          "id": "obj_001"
        },
        "to": {
          "typ": "verejne-obstaravanie",
          "id": "vo_001"
        },
        "owners": [
          {
            "typ": "objednavky",
            "id": "obj_001"
          }
        ]
      }
    ],
    "pagination": {
      "related_page_size": 100,
      "total": 4,
      "next_cursor": null,
      "complete": true
    }
  },
  "projection": {
    "status": "ready",
    "root_entity_version": 1,
    "as_of": "2026-10-01T08:00:02Z",
    "unresolved_references_count": 0
  }
}
```
