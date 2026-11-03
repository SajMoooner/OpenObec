# Verejné demo OpenObec

## Adresy

- Marketing: https://openobec.sk
- Občiansky portál: https://obcan.openobec.sk
- Pracovné demo: https://uradnik.openobec.sk

Ide o spoločné verejné demo pre Žilinu s fiktívnymi dátami. Návštevníci môžu meniť ukážkové dokumenty. Nepoužívajte osobné, dôverné ani skutočné úradné dokumenty.

## Oddelenie od ostatných aplikácií

Samostatný Compose projekt `openobec-public`, sieť `openobec-public`, vlastné pomenované zväzky a adresár `/opt/openobec`. Verejný web obsluhuje existujúci Nginx cez samostatný vhost; reštart celého Nginxu nie je potrebný.

`compose.public.yaml` odstráni pôvodné publikované porty. Portály počúvajú iba na loopback portoch 13000, 13001 a 13002. Gateway 18080 je dostupná iba lokálne pre seed a diagnostiku. MongoDB, Kafka a RustFS nemajú publikované hostiteľské porty.

Všetky nové kontajnery vrátane inicializácie patria do `openobec.slice`: MemoryHigh 3400 MiB, MemoryMax 3584 MiB a CPUQuota 200 %. Tento limit chráni ostatné projekty, ale pri jeho prekročení môže byť ukončená služba OpenObec. Pred zvýšením limitu skontrolujte skutočnú voľnú kapacitu hostiteľa. Java používa heap 64 MiB, Serial GC a 2 logické procesory; Kafka má heap 256 MiB; Next.js má obmedzený heap.

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

## Overenie nasadenia 3. novembra 2026

- Vydanie `20261103-1`, všetky tri portály dostupné cez HTTPS. `www.openobec.sk` presmerúva na hlavnú doménu.
- Certifikát pre všetky štyri názvy platí do 1. februára 2027. Timer obnovy je aktívny; ručné spustenie služby prešlo (obnova ešte nebola potrebná). Simulácia obnovy narazila na reset spojenia so staging serverom Let's Encrypt, preto nie je považovaná za úspešne overenú. Produkčné vydanie aj rozšírenie certifikátu prešli.
- Seed dokončil 72 dokumentov, po 12 v každej agende, s prílohami.
- Identifikátory všetkých 40 pôvodných kontajnerov zostali nezmenené. Kontrolované existujúce weby vracali rovnaké HTTP stavy ako pred nasadením.
- Limitovanie požiadaviek vylučuje statické Next.js skripty a ikony: ich blokovanie spôsobovalo neúplné načítanie ovládania. Dynamické stránky a API zostávajú limitované. Pri zmene kľúča `limit_req_zone` použite nový názov zóny: samotné `nginx -t` tento konflikt so starou bežiacou konfiguráciou nezachytí; po reloade kontrolujte aj error log.
- Ide o demo na zdieľanom hostiteľovi s malou pamäťovou rezervou, nie o overenie kapacity pre produkčnú záťaž.

Verejný E2E test používa adresy `OFFICE_URL`, `CITIZEN_URL` a `API_BASE_URL`. Pre vzdialené demo čaká na asynchrónne premietnutie do verejného vyhľadávania najviac 60 sekúnd (lokálne 15 sekúnd). Pri tomto nasadení prvé overenie prekročilo 15 sekúnd; nejde o garanciu okamžitého zverejnenia ani o záťažový test.

Záverečný verejný E2E test po schválenej úprave limitu na 20 požiadaviek/s a burst 120 prešiel za 6,3 sekundy: vytvorenie, príloha PDF, prepojenie, publikovanie, verejné vyhľadanie, zhodný SHA-256 stiahnutého PDF, úprava, stiahnutie zo zverejnenia aj vyčistenie vlastného záznamu. Všetkých 21 služieb bolo healthy.

Prvý GitHub CI beh mal 76 úspešných a 10 neúspešných E2E testov. Prihlasovací presun používal `localhost`, zatiaľ čo testy pokračovali na `127.0.0.1`, kde nebol demo cookie. CI spúšťanie teraz používa konzistentné adresy `127.0.0.1`; nový kompletný beh treba overiť pred zlúčením.
