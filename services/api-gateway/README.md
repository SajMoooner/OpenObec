# API gateway

Samostatná Java21 / Spring Cloud Gateway aplikácia na porte8080. Smeruje presne70kontraktovaných operácií na šesť agendových služieb a QueryAPI. Interný export nie je verejnou trasou. Zdroj pravdy: `contracts/openapi.yaml`.

Z koreňa spustite infra `scripts/dev/infra.sh up`, následne konkrétne zdrojové služby, Query a `services/api-gateway/run.sh`. Z vlastného priečinka funguje `./run.sh`. Po zmene zdrojov zostavte z koreňa `./mvnw -pl services/api-gateway -am -DskipTests package`. Manuálny aj kontajnerový celý stack spustí `scripts/dev/up.sh manual|docker`.

Každé dátové volanie potrebuje `X-Obec-Id: zilina`. Platné `X-Request-Id` sa prenesie, inak vznikne nové. JSON má limit1MiB, multipart21MiB; samotné prílohy kontroluje vlastník na20MiB. Zápisové požiadavky sa automaticky neopakujú ani pri prerušení spojenia. Pripojenie má timeout2s, odpoveď60s; nedostupná služba vracia503 s obalom a `Retry-After: 2`.

`GATEWAY_RATE_LIMIT` nastavuje počet požiadaviek za minútu a priamu IPadresu, predvolene1200; v pamäti je najviac4096košíkov. Portály používajú serverový adaptér, takže v lokálnom deme môžu zdieľať IPadresu. Obmedzenie preto nie je používateľskou kvótou.

Adresy vlastníkov: `INVOICES_URL`, `SUPPLIER_INVOICES_URL`, `CONTRACTS_URL`, `ORDERS_URL`, `PROCUREMENT_URL`, `ORDINANCES_URL` (predvolene localhost8081–8086) a `QUERY_URL` (localhost8090). Compose nastavuje vnútorné DNSadresy. Health: `GET /actuator/health`.

Docker build z koreňa: `docker build -f services/api-gateway/Dockerfile -t openobec/api-gateway:demo .`. Konkrétny kontajner aj ostatné aplikácie zapojí `compose.apps.yaml`; beží ako UID10001 bez oprávneníroot.

Overenie: `./mvnw -pl services/api-gateway -am test`. Testy používajú skutočné lokálne HTTP/TCP servery: smerovanie, tenant, veľkosť, výpadok, limit a jedno spojenie pri prerušenom POST.
