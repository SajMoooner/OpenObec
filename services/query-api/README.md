# Query API

Sixteen read operations backed only by the shared Mongo read model: five joined lists, five full joined details, five `/suvislosti` graphs and `/rest/v1/vyber-zaznamov`. VZN remains on its owner's API. Default port: **8090**. Java21, Mongo read replica set and domain HTTP APIs for root existence checks are required. Pairing populates the read model.

From the root:

```sh
./mvnw -pl services/query-api -am -DskipTests package
services/query-api/run.sh
```

From this directory: `./run.sh`. The script uses the project-local JDK21 if JAVA_HOME is unset and builds a missing JAR; rerun the Maven command after source changes. Stop this Java process independently with Ctrl-C.

Configuration:

| Variable | Host default |
| --- | --- |
| SERVER_PORT | 8090 |
| MONGODB_URI | mongodb://localhost:27023/openobec_read?replicaSet=rs-read&directConnection=true&serverSelectionTimeoutMS=2000 |
| QUERY_CURSOR_SECRET | openobec-local-cursor-key-change-outside-demo (minimum32characters) |
| INVOICES_SERVICE_URL | http://localhost:8081 |
| SUPPLIER_INVOICES_SERVICE_URL | http://localhost:8082 |
| CONTRACTS_SERVICE_URL | http://localhost:8083 |
| ORDERS_SERVICE_URL | http://localhost:8084 |
| PROCUREMENT_SERVICE_URL | http://localhost:8085 |

For Docker use `mongo-read:27017` with replicaSet=rs-read and owner service DNS names. Build from root: `docker build -f services/query-api/Dockerfile -t openobec/query-api .`; run with those server-side variables and port8090. Cursor secrets stay on the server. Every REST call requires `X-Obec-Id: zilina`. `/actuator/health` is unauthenticated local health.

Lists preserve all source DTO fields and exact string amounts. Missing zverejnene includes drafts; true/false filters are applied throughout the graph and nested own references. Summary graphs verify the root through its owner's HTTP API and contain at most100nodes, depth1–3. Existing joined roots use local state; only absent joined roots call their owner. Existing but unprojected roots return202/Retry-After2, absent/deleted/filtered404, failed dependency503. Known missing targets are pending and never become placeholder full records.

Joined details snapshot the entire visible bidirectional component under Mongo snapshot isolation, including every full DTO and canonical edge. Header, related rows and edge chunks commit atomically. Each chunk stores a bounded single source document/edge, avoiding Mongo's16MiB document limit. Related rows sort by typ/id and page at1–100; the full root appears on every page. Each page returns edges incident to its records; the first also returns all root edges. Clients merge/deduplicate endpoints across pages and continue until `next_cursor:null`.

Snapshots last ten minutes. HMAC cursors bind tenant, agenda, root, publication filter, page size, position and expiry. A valid expired token returns410 even if Mongo TTL already removed its snapshot; malformed/forged/mismatched tokens return400. Rebuilding gates new and continuation reads with503 while the new projection/offset handoff is incomplete.

Verification: `./mvnw -pl services/query-api -am test` with real infra. Tests own random Mongo DBs and run actual HTTP requests; they exercise all selector combinations, all five roots, hidden intermediates, cycles,105related documents, stable continuations across deletes, bound signatures, and410expiry.
