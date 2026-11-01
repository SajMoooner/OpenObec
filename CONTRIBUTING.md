# Prispievanie do OpenObec

Ďakujeme za opravy aj návrhy. Projekt je lokálne demo s fiktívnymi dátami; najprv si prečítajte [README](README.md), [produktový kontext](PRODUCT.md) a [prevádzkový postup](docs/runbook.md).

## Postup

1. Pri väčšej zmene najprv otvorte issue s problémom, očakávaným správaním a rozsahom.
2. Vytvorte fork a pracovnú vetvu z aktuálneho `main` (napríklad `fix/document-filter`).
3. Urobte sústredenú zmenu. Pri zmene API upravte [OpenAPI](contracts/openapi.yaml), klienta cez `pnpm generate:client` a príslušnú dokumentáciu.
4. Overte správanie dotknutej časti. V pull requeste popíšte problém, výsledok a skutočne vykonané kontroly; pri UI priložte snímky desktopu aj mobilu.

Nevkladajte osobné údaje, skutočné obecné dokumenty, prístupové údaje, `.env` ani lokálne databázy. Zachovajte cudzie dáta: integračné skúšky majú vytvárať a upratovať iba vlastné záznamy cez príslušné API. Reset dát nie je bežný testovací krok.

## Lokálne kontroly

Po inštalácii nástrojov podľa README:

```sh
pnpm install --frozen-lockfile
python3 -m unittest discover -s tests/contracts -v
python3 -m unittest discover -s tests/runtime -v
./mvnw -B verify
pnpm typecheck
pnpm lint
pnpm test:frontend
pnpm build
```

Pre integračné a browser testy najprv spustite lokálny stack podľa README, nainštalujte Python závislosti a Chromium:

```sh
python3 -m venv .tools/venv
.tools/venv/bin/pip install -r tests/integration/requirements.txt
pnpm exec playwright install chromium
scripts/smoke/run.sh
pnpm test:e2e
```

Koordinované testy výpadkov a obnovy majú vlastný postup v runbooku; nespúšťajte ich súbežne s browser testami. Úplný existujúci postup automatických kontrol je v [GitHub Actions](.github/workflows/verify.yml).

Príspevky sa poskytujú pod [MIT licenciou projektu](LICENSE). Pri preberaní cudzieho materiálu zachovajte jeho pôvodné oznámenia a doplňte [prehľad licencií](THIRD_PARTY_NOTICES.md).
