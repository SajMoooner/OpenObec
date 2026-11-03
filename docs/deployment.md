# Verejné demo OpenObec

## Adresy

- Marketing: https://openobec.sk
- Občiansky portál: https://obcan.openobec.sk
- Pracovné demo: https://uradnik.openobec.sk

Ide o spoločné verejné demo pre Žilinu s fiktívnymi dátami. Návštevníci môžu meniť ukážkové dokumenty. Nepoužívajte osobné, dôverné ani skutočné úradné dokumenty.

## Oddelenie od ostatných aplikácií

Samostatný Compose projekt `openobec-public`, sieť `openobec-public`, vlastné pomenované zväzky a adresár `/opt/openobec`. Verejný web obsluhuje existujúci Nginx cez samostatný vhost; reštart celého Nginxu nie je potrebný.

`compose.public.yaml` odstráni pôvodné publikované porty. Portály počúvajú iba na loopback portoch 13000, 13001 a 13002. Gateway 18080 je dostupná iba lokálne pre seed a diagnostiku. MongoDB, Kafka a RustFS nemajú publikované hostiteľské porty.

Všetky nové kontajnery vrátane inicializácie patria do `openobec.slice`: MemoryHigh 3 GiB, MemoryMax 3584 MiB a CPUQuota 200 %. Tento limit chráni ostatné projekty, ale pri jeho prekročení môže byť ukončená služba OpenObec. Pred zvýšením limitu skontrolujte skutočnú voľnú kapacitu hostiteľa. Java používa menšie heap limity a 2 logické procesory; Next.js má obmedzený heap.

## Verzie a nastavenia

`/opt/openobec/releases/<release>` obsahuje konfiguráciu vydania. `/opt/openobec/shared/.env` obsahuje verejné adresy, release tag a samostatne vygenerované heslo S3 a podpisový kľúč kurzorov (práva 0600). Tajomstvá nepatria do GitHubu. Zdrojové Docker obrazy aplikácií sa zostavujú mimo produkčného servera pre `linux/amd64` a prenášajú cez `docker save` / `docker load`.

Java JAR sa zostaví cez `./mvnw -B -DskipTests package` (testy treba vykonať samostatne pri zmenách backendu). `infra/deploy/JavaRuntime.Dockerfile` zabalí `app.jar` a `healthcheck.sh` do serverového runtime. Next.js používa Dockerfile pri každom portáli a `docker buildx build --platform linux/amd64 --load`.

Po načítaní obrazov a nastavení `.env`:

```sh
cd /opt/openobec/releases/<release>
docker compose -p openobec-public -f compose.yaml -f compose.apps.yaml -f compose.public.yaml config --quiet
docker compose -p openobec-public -f compose.yaml -f compose.apps.yaml -f compose.public.yaml up -d --no-build --wait --wait-timeout 360
```

Prvý seed na prázdnom projekte:

```sh
API_BASE_URL=http://127.0.0.1:18080 python3 scripts/seed/seed.py --manifest /opt/openobec/shared/seed-manifest.json
```

Manifest zachovajte medzi vydaniami. Opakované spustenie nemá prepisovať záznamy, ktoré návštevníci upravili.

## HTTPS

Konfigurácia je v `infra/deploy/nginx.conf`. Pred aktiváciou musí každý uvedený hostname smerovať na server cez všetky jeho A aj AAAA záznamy. `www.openobec.sk` je alias smerujúci na kanonickú adresu; aktivujte ho až po oprave jeho DNS a zahrnutí do certifikátu. `www.open.obec.sk` je iná doména a nie je súčasťou tohto nasadenia.

Certifikát používa webroot `/var/www/openobec-acme` a existujúci ACME účet. Overenie konfigurácie vždy predchádza `systemctl reload nginx`. Nikdy nenahrádzajte konfigurácie ostatných webov.

Na tomto hostiteľovi má predvolený Certbot konflikt Python balíkov. Služba `openobec-cert-renew.service` preto používa `PYTHONPATH=/usr/lib/python3/dist-packages`, obnovuje iba certifikát `openobec.sk` a po úspechu validuje a znovu načíta Nginx. Timer kontroluje obnovu dvakrát denne. Ostatné certifikáty ani systémové balíky nemení.

## Kontrola a návrat

```sh
docker compose -p openobec-public -f compose.yaml -f compose.apps.yaml -f compose.public.yaml ps
systemctl show openobec.slice -p MemoryCurrent -p MemoryMax -p CPUQuotaPerSecUSec
systemctl list-timers openobec-cert-renew.timer
curl -fsS http://127.0.0.1:18080/actuator/health
```

Pri aktualizácii najprv vytvorte zálohu databáz a príloh; aplikácie s nekompatibilnou migráciou nevracajte bez obnovy dát. Pre čisto aplikačný rollback nastavte predchádzajúce obrazové tagy a spustite rovnaký Compose projekt. Zväzky nikdy nemažte cez `down -v`. Pri probléme s proxy obnovte iba zálohu vhostu OpenObec, otestujte `nginx -t` a urobte reload. Nepoužívajte globálne `docker prune` ani reštart Docker démona.
