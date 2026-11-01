# OpenObec

Lokálne demo evidencie a zverejňovania dokumentov mesta Žilina. Tri samostatné portály, šesť Java služieb pre agendy, API gateway a oddelená čítacia projekcia. Dáta sú syntetické; demo neobsahuje reálne prihlásenie ani integráciu mestského IS.

## Spustenie

Potrebujete Docker s Compose v2. Pre ručný režim aj Java 21, Node.js 26 a pnpm 11.25.0. Konfiguráciu skopírujte z `.env.example` do `.env`. Lokálny JDK v `.tools/jdk-21.0.9+10/Contents/Home` sa použije automaticky, ak nie je nastavené `JAVA_HOME`.

```sh
cp .env.example .env
scripts/dev/up.sh docker
# Alternatíva: infraštruktúra v Dockeri, Java a portály na hostiteľovi
scripts/dev/up.sh manual
```

Používajte naraz jeden režim. Príkaz zostaví aplikácie, počká na ich pripravenosť, pri prvom štarte obnoví projekciu zo skutočných HTTP exportov a cez API vytvorí demo dáta. Bežné opakované spustenie zachová dáta, používateľské úpravy aj zmazané seed záznamy. Vlastnícke ID seedu sú v `.run/seed-manifest.json`; súbor ponechajte spolu s dátami. Čísla existujúcich cudzích záznamov sa nepreberajú do seedu.

| Aplikácia | Adresa |
|---|---|
| Úvodná stránka | [localhost:3000](http://localhost:3000) |
| Portál občana | [localhost:3001](http://localhost:3001) |
| Portál úradníka | [localhost:3002](http://localhost:3002) |
| API gateway | [localhost:8080](http://localhost:8080/rest/v1/faktury) |

Každá API požiadavka vyžaduje `X-Obec-Id: zilina`. Zdrojové služby majú porty 8081–8086, Query 8090 a pairing 8091. Predvolené portály volajú skutočnú gateway; úložisko aj databázy sú súkromné. Podrobnosti a nastavenia: [prevádzkový postup](docs/runbook.md), [OpenAPI so 70 operáciami](contracts/openapi.yaml), [produktový kontext](PRODUCT.md).

```sh
scripts/dev/doctor.sh docker
scripts/dev/down.sh docker
# Pri ručnom režime použite namiesto docker slovo manual.
```

Bežné vypnutie zachová všetky zväzky. Deštruktívny reset je samostatný `scripts/dev/reset.sh`, ktorý bez výslovného argumentu `--confirm-reset-openobec` odmietne zmazať dáta. Reset nepoužívajte pri bežnom reštarte.

## Overenie

Na spustenom stacku:

```sh
python3 -m venv .tools/venv
.tools/venv/bin/pip install -r tests/integration/requirements.txt
scripts/smoke/run.sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B test
pnpm test:e2e
```

Smoke overuje 12 záznamov v každej agende, dve vetvené siete súvislostí, skutočné PDF s kontrolným súčtom, idempotenciu aj zachovanie úprav/zmazania a úspešné odpovede všetkých 70 operácií podľa schémy. Dočasné akceptačné záznamy sa mažú iba vlastnými zdrojovými API; Kafka históriu ani cudzie dáta testy nečistia. Konkrétne odpovede sa ukladajú do `.run/contract-fixtures.json`.

Koordinované skúšky výpadkov a obnovy sa spúšťajú samostatne podľa [runbooku](docs/runbook.md); počas nich nebežia browser testy. Lokálne dôkazové artefakty sa ukladajú do `.run/`.

## Návrh a orientácia

- [Realizačný návrh](docs/superpowers/specs/2026-11-01-openobec-design.md)
- [Analýza podkladov a mapa pôvodných 46 operácií](docs/analysis/2026-11-01-source-review.md)
- [Pôvod vstupných dokumentov](docs/references/2026-11-01/manifest.json)
- Rozhrania, exporty a prílohy: [common-api](libs/java/common-api/README.md)
- Čítacia projekcia: [read-model](libs/java/read-model/README.md), [Query](services/query-api/README.md), [pairing](services/pairing-service/README.md)
