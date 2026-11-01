### Task 1: Reproducible infrastructure and build contracts

**Files:** `compose.yaml`, `.env.example`, `.gitignore`, `infra/{mongo,kafka,rustfs}/`, `pom.xml`, `mvnw`, `.mvn/`, `scripts/dev/{infra,java}.sh`, `contracts/{openapi.yaml,events/document-event.schema.json}`, `tests/contracts/test_contracts.py`.

**Interfaces:** Produces independent replica set hosts `mongo-invoices`, `mongo-supplier-invoices`, `mongo-contracts`, `mongo-orders`, `mongo-procurement`, `mongo-ordinances`, `mongo-read`; corresponding host ports 27017–27023. Kafka INTERNAL `kafka:29092`, EXTERNAL `localhost:9092`. RustFS `rustfs:9000`, host `localhost:9000`. Root Maven group `sk.openobec`, version `0.1.0-SNAPSHOT`, Java package `sk.openobec`; aggregator lists modules as created. API schema derives from source tables, response wrappers unchanged.

- [ ] Write contract verification asserting exactly 70 operations, unique operationIds, six domain schemas, 16 query operations, and strict write/read separation; run before generation and observe missing contract failure.
- [ ] Write pinned Compose infrastructure with bounded caches, readiness/init and persistent volumes; verify `docker compose config --quiet`.
- [ ] Create Maven parent and official wrapper; generate complete OpenAPI and event schema from supplied contracts.
- [ ] Start infrastructure, verify all seven replica sets accept a transaction, Kafka metadata exposes correct listeners, and RustFS supports bucket/write/read.
- [ ] Run contract checks green; commit this deliverable.
