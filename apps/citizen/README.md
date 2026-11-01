# Občiansky portál

Samostatná Next.js16 aplikácia, React19, TypeScript, skutočné komponenty shadcn/ui a lokálne fonty Geist. Z IDSK3 sa používajú iba farby. Žiadne IDSK komponenty, písmo ani rozloženie.

## Ručne

Potrebuje Node26.3.1 a pnpm11.25.0. Z koreňa repozitára najprv `pnpm install --frozen-lockfile`. Potom možno z tohto priečinka spustiť `pnpm dev`, alebo z koreňa `pnpm dev:citizen`. Otvorte http://localhost:3001.

Produkčný režim z tohto priečinka: `pnpm build` a `pnpm start`. Spúšťač doplní statické súbory do samostatného produkčného balíka a spustí ho na porte3001.

Spoločné spustenie všetkých aplikácií: `scripts/dev/up.sh manual` z koreňa. MongoDB, Kafka a RustFS ostávajú v Dockeri. Zastavenie: `scripts/dev/down.sh manual`; uložené dáta ostávajú zachované.

## Docker

Odporúčaný kompletný postup: `scripts/dev/up.sh docker` z koreňa, vrátane prvého naplnenia prehľadu a opakovateľného seedu. Aplikácia má vlastný Dockerfile a kontajner beží ako používateľnode.

Samostatné zostavenie z koreňa: `docker build -f apps/citizen/Dockerfile -t openobec/citizen:demo .`. Pri samostatnom spustení treba nastaviť serverovú adresu API a publikovať port len lokálne; spoločná Compose konfigurácia to nastavuje automaticky.

## Nastavenia

`API_INTERNAL_URL` je serverová adresa brány, predvolene `http://127.0.0.1:8080`, v Dockeri `http://api-gateway:8080`. Browser používa vlastnú cestu `/api/rest/v1`; interná Docker adresa sa do neho neposiela. Verejné prechody medzi portálmi používajú runtime `MARKETING_PUBLIC_URL`, `CITIZEN_PUBLIC_URL`, `OFFICE_PUBLIC_URL` (predvolene localhost3000/3001/3002). Compose ich odvodí z `.env` hodnôt `MARKETING_URL`, `CITIZEN_URL`, `OFFICE_URL`.

Ide o demo pre `zilina`. Dokumenty a organizácie sú fiktívne; úradnícky vstup jedným tlačidlom slúži na demo bez autentifikácie. Verejný adaptér poskytuje iba zverejnené záznamy a overuje vlastníka prílohy. Reálne pripojenie mestského IS ani odosielanie kontaktnej správy nie sú súčasťou tejto verzie.

## Overenie

Z koreňa: `pnpm typecheck`, `pnpm lint`, `pnpm test:frontend`, `pnpm test:e2e`. Prehliadačové testy vyžadujú spustený celý stack. `CHROME_PATH` môže nastaviť lokálny Chromium; inak sa použije Chrome na macOS.
