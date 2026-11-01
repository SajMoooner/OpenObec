# Lokálna prevádzka OpenObec

## Bežný štart a vypnutie

Z koreňa repozitára spustite `scripts/dev/up.sh docker` alebo `scripts/dev/up.sh manual`. Režimy nespúšťajte súčasne; najskôr vypnite ten aktívny pomocou `scripts/dev/down.sh docker` alebo `scripts/dev/down.sh manual`. Stav overí `scripts/dev/doctor.sh [docker|manual]`. Ručné procesy a ich logy sú v `.run/processes.json` a `.run/*.log`. Docker logy zobrazí `docker compose -p openobec -f compose.yaml -f compose.apps.yaml logs --tail=100 SERVICE`.

Štart zachová perzistentné zväzky aj existujúcu projekciu. Poradie prvého štartu je infraštruktúra → vlastnícke služby → obnova s vypnutým pairingom → pairing → seed cez API → kontrola verzií v Query. Interné exporty sa neposkytujú cez verejnú gateway. Nikdy nespúšťajte nový pairing proti historickým testovacím offsetom bez autoritatívnej obnovy.

`API_BASE_URL` pre seed a HTTP testy predvolene ukazuje na `http://localhost:8080`. Všetky požiadavky používajú `X-Obec-Id: zilina`. URL vlastníkov pri obnove možno nastaviť pomocou `INVOICES_SERVICE_URL`, `SUPPLIER_INVOICES_SERVICE_URL`, `CONTRACTS_SERVICE_URL`, `ORDERS_SERVICE_URL` a `PROCUREMENT_SERVICE_URL`. Ručný obal preloží efektívne Docker URL na hostiteľské porty a rešpektuje tieto explicitné premenné aj `MONGODB_URI`, `KAFKA_BOOTSTRAP_SERVERS`, `OPENOBEC_EVENTS_TOPIC`, `PAIRING_CONSUMER_GROUP`.

## Seed bez prepisovania

```sh
python3 scripts/seed/seed.py
```

Prvý priechod vytvorí 12 syntetických záznamov na agendu so stabilnými číslami `DEMO-2026-*` a okamžite uloží pridelené ID do `.run/seed-manifest.json`. Druhý doplní súvislosti dvoch komponentov a čitateľné PDF. Čaká na verzie v Query, nestačí iba HTTP health. Súčasťou dát sú koncepty aj publikované záznamy.

Existujúci dokončený seed sa pri opakovaní nemení. Používateľská úprava nedokončeného záznamu sa zachová; zmazaný záznam sa nevytvára znovu. Manifest nemažte pri bežnom vypnutí. Ak sa manifest stratí, číselný konflikt skončí chybou a cudzí záznam sa neprevezme ani neprepíše. Ak proces zlyhá medzi vytvorením a zápisom manifestu, takýto konflikt vyžaduje manuálne posúdenie; nedochádza k tichému prepísaniu. Seed nespúšťajte súbežne z viacerých terminálov.

## Obnova čítacej projekcie

Poškodenú alebo nedokončenú projekciu obnovte so zachovaním zdrojov a starej generácie:

```sh
scripts/rebuild/run.sh docker
# Alebo pre aktívny ručný režim:
scripts/rebuild/run.sh manual
```

Obal zastaví iba OpenObec pairing. Nezastaví ostatné Java služby ani iné Docker projekty. Existujúci Task 3 algoritmus zachytí Kafka end offsets pred piatimi konzistentnými HTTP exportmi vrátane tombstone záznamov, importuje ich do novej generácie, prehrá udalosti po zachytených offsetoch s kontrolou `entity_version`, overí výsledok a presné skupinové offsety a až potom atomicky prepne generáciu. Zdrojové databázy nečíta. VZN nemá párovaciu projekciu ani interný export.

Počas obnovy Query vracia 503. Zlyhanie po otvorení obnovy ponechá Query nedostupné a pairing vypnutý; opravte príčinu a zopakujte rovnaký príkaz. Nespúšťajte listener ručne pred úspešným dokončením. Staré generácie ani nemenné používateľské snapshoty sa nemažú. Bežné procesy bez overiteľného vlastníctva obal nezastaví; živú konzumentskú skupinu nezávisle odmietne samotný algoritmus.

## Výpadky a zachovanie dát

- **Kafka:** zápis vlastníka sa potvrdí spolu s outboxom. Pri nedostupnom brokeri outbox zostáva nepublikovaný; po obnove služby publisher čaká na potvrdenie Kafka a až potom označí udalosť za publikovanú. Query môže dovtedy obsahovať staršiu verziu. Nevyrábajte umelé čistiace tombstones a nemažte históriu hlavného topicu.
- **Nedostupný vlastník referencie:** nová referencia končí 503 a celá zdrojová transakcia sa vráti späť. Používateľ môže po obnove služieb opakovať uloženie.
- **RustFS:** neúspešný upload končí 503, záznam a existujúce prílohy zostanú zachované. Logické zmazanie prílohy skryje stiahnutie, ale auditné bajty ponechá. Nejasný výsledok Mongo commitu nesmie viesť k automatickému vymazaniu blobu; postup zosúladenia je v [common-api](../libs/java/common-api/README.md) a [file-storage](../libs/java/file-storage/README.md).

Cielené testy spúšťajte až po zastavení browser testov, na ručne spustených službách. Pozastavia iba konkrétne OpenObec zdroje a v `finally` ich obnovia:

```sh
.tools/venv/bin/python tests/integration/faults.py -v
.tools/venv/bin/python tests/integration/recovery.py -v
```

Prvý test overí 503 rollback pri nedostupnom vlastníkovi, chybu uploadu s nezmenenými metadátami, identické PDF po návrate úložiska, auditné S3 bajty po logickom zmazaní a potvrdený outbox/projekciu po návrate Kafka. Druhý používa skutočné HTTP exporty; transparentný lokálny relay zmrazí export a následne cez bežné API vytvorí súbežnú novšiu verziu a skutočné zmazanie. Overí replay, tombstone, Query gate aj nemennosť starého snapshotu. Technické Mongo dôkazy čítajú iba outbox a metadáta presných vlastných testovacích ID. Žiadna obnova/Query nečíta zdrojové doménové databázy.

Výsledky: `.run/fault-acceptance.json`, `.run/rebuild-acceptance.json`, `.run/rebuild-acceptance.log`. Testy vytvárajú vlastné UUID čísla, potom svoje záznamy logicky zmažú bežným API. Tieto skutočné udalosti zostávajú v histórii.

## Úplné vymazanie dema

`scripts/dev/reset.sh` bez potvrdzovacieho argumentu skončí s vysvetlením. Iba výslovne vyžiadaný `scripts/dev/reset.sh --confirm-reset-openobec` vymaže všetky OpenObec dáta, prílohy a Kafka históriu. Tento príkaz nie je súčasťou bežného štartu, obnovy ani testov. Pred jeho použitím skontrolujte, že ide o správny projekt a dáta, ktoré naozaj chcete zahodiť.
