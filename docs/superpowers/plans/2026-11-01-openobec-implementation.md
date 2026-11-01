# OpenObec Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement and run the complete local Žilina demo, from document entry to public search and file download.

**Architecture:** Six independent Java document services own six Mongo databases and transactional outboxes. Kafka feeds a Java projector and shared read Mongo used by Query API. Three Next.js portals use one Java gateway; RustFS holds private attachments.

**Tech Stack:** Java 21, Spring Boot 3.5.x, Spring Cloud 2025.0.x, Mongo 8 replica sets, Kafka KRaft, RustFS, Next.js 16, React 19, TypeScript, shadcn/ui, IDSK.

**Spec:** docs/superpowers/specs/2026-11-01-openobec-design.md (approved by user 2026-11-01).

## Global Constraints

- Municipality is `zilina`; every data call requires `X-Obec-Id: zilina`.
- Preserve all 46 source operations and Slovak field names; add 24 attachment operations separately.
- No real authentication, external registries, real city integration, or intelligent search.
- Three independent Next.js apps; nine Java processes including gateway, six domains, pairing, query.
- Mongo transaction + outbox; ACK after commit; entity version and event ID deduplication; tombstones retained.
- Explicit multi-links `{typ,id}`, allowed type matrix, no inferred vendor matches.
- Query graph snapshots live 10 minutes; related pages 1–100; graph summary depth 1–3, max 100 nodes.
- Decimal monetary strings with two places; exact BigDecimal arithmetic, not floats.
- UI: genuine shadcn components, standard shadcn/ui typography (Geist), ONLY IDSK3 colors, Slovak copy, labeled synthetic data.
- Marketing image comp approved before marketing code. Backend work continues while visual decisions are pending.
- All apps run manually and in Docker; dependencies pinned, named persistent volumes; no automatic reset.

## Review Focus

1. Partial nested updates and concurrent changes must not lose unrelated data; test merged-state validation and compare-and-set retries (Task 2).
2. Hidden/deleted intermediate nodes must stop public traversal and remove nested reference IDs; test cyclic and filtered graphs (Task 3).
3. Kafka retries, duplicate delivery, and tombstones must preserve a later version; test real broker outage and replay (Tasks 3, 6).
4. Cursor replay after TTL deletion must still distinguish valid expired tokens from forged tokens; test signature, binding, and expiry (Task 3).
5. Docker DNS, host listeners, non-root volumes, and browser URLs must work in both launch modes; smoke both endpoints and S3 bytes (Tasks 1, 6).

## File ownership and execution

Reuse the current checkout on `codex/openobec-demo`; no new worktree is needed. Preserve user-owned untracked source research. The user's instruction to start implementation authorizes continuous execution; no additional plan-approval round. Delegate one implementer at a time, fresh task review afterward. Controller owns infra/integration and visual selection; implementers own their explicitly listed files. Reports live in the plan workspace. Scope boundaries prevent incidental changes.

### Task 1: Reproducible infrastructure and build contracts

**Files:** `compose.yaml`, `.env.example`, `.gitignore`, `infra/{mongo,kafka,rustfs}/`, `pom.xml`, `mvnw`, `.mvn/`, `scripts/dev/{infra,java}.sh`, `contracts/{openapi.yaml,events/document-event.schema.json}`, `tests/contracts/test_contracts.py`.

**Interfaces:** Produces independent replica set hosts `mongo-invoices`, `mongo-supplier-invoices`, `mongo-contracts`, `mongo-orders`, `mongo-procurement`, `mongo-ordinances`, `mongo-read`; corresponding host ports 27017–27023. Kafka INTERNAL `kafka:29092`, EXTERNAL `localhost:9092`. RustFS `rustfs:9000`, host `localhost:9000`. Root Maven group `sk.openobec`, version `0.1.0-SNAPSHOT`, Java package `sk.openobec`; aggregator lists modules as created. API schema derives from source tables, response wrappers unchanged.

- [x] Write contract verification asserting exactly 70 operations, unique operationIds, six domain schemas, 16 query operations, and strict write/read separation; run before generation and observe missing contract failure.
- [x] Write pinned Compose infrastructure with bounded caches, readiness/init and persistent volumes; verify `docker compose config --quiet`.
- [x] Create Maven parent and official wrapper; generate complete OpenAPI and event schema from supplied contracts.
- [x] Start infrastructure, verify all seven replica sets accept a transaction, Kafka metadata exposes correct listeners, and RustFS supports bucket/write/read.
- [x] Run contract checks green; commit this deliverable.

### Task 2: Six independent domain APIs, transactions and files

**Files:** `services/{invoices-service,supplier-invoices-service,contracts-service,orders-service,procurement-service,ordinances-service}/`, `libs/java/{common-api,event-contracts,file-storage}/`, domain-specific tests; root Maven module registration only.

**Interfaces:** REST exact source `/rest/v1/{agenda}` paths. Shared `ApiException(status,code,message,details)` and error envelope; document events use the approved JSON fields and complete `data` snapshot including `deleted` and version. Persist domain records in collection `documents` with Slovak JSON field names, IDs and `deleted_at`; outbox has nested `event` (full envelope), `published_at`, lease/retry metadata. API-only fields remain source-compatible. Services use `MONGODB_URI`, `KAFKA_BOOTSTRAP_SERVERS`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `SERVER_PORT`; common municipality config fixed to `zilina`. Publish `openobec.documents.v1`. VZN has no public version/references or Kafka projection. Internal `/internal/v1/export` returns paginated consistent versioned exports including tombstones for rebuild; not routed by gateway.

- [x] Write failing tests for six field schemas: decimal exact sum, date ordering, nullable fields, unknown/read-only fields, replacement counterparty, selective patch, duplicate number even after delete, allowed reference matrix and unchanged invalid legacy links.
- [x] Run focused Maven tests red, then implement typed domain DTO/validation, repositories, controllers and technical shared libraries. Domain behavior must remain in each service; shared mechanics may be extracted without a universal business CRUD schema.
- [x] Write failing integration tests for transaction rollback, optimistic version increments and outbox commit atomicity; implement Mongo transaction/CAS and leased outbox publisher.
- [x] Implement reference validation through owner detail HTTP only, with timeout and bounded concurrency, INVALID_REFERENCE versus DEPENDENCY_UNAVAILABLE distinction.
- [x] Write file tests for PDF/PNG/JPEG signatures, 20 MiB, 10 active files, digest, unsafe names, deleted parent, S3/DB compensation. Implement four separate attachment operations per agenda and private S3 streaming.
- [x] Add individual Dockerfiles, manual wrappers and READMEs; run unit + real Mongo/S3 integration tests, report exact results, commit only task files.

### Task 3: Pairing and Query API

**Files:** `services/{pairing-service,query-api}/`, shared event/schema imports only, projection/query tests.

**Interfaces:** Consumes Task 2 Kafka event and domain detail REST. Shared read collections `records`, `reference_claims`, `edges`, `processed_events`, `pending_references`, `query_snapshots`, `query_snapshot_chunks`, `projection_metadata`. Projected records retain full source payload; keys include municipality/type/id; no direct domain DB reads. Query provides all 16 existing query/selector/relations operations. `projection` wrapper and `data` shapes match API snapshot. Query snapshot HMAC key from `QUERY_CURSOR_SECRET`.

- [x] Write failing projector tests for duplicate/event ordering/delete, late target, both owners and reference replacement. Implement full-state atomic projector with ACK after Mongo commit, retry and confirmed DLQ publishing.
- [x] Write failing graph tests for all five roots, cycles, two owners, hidden intermediates and dangling targets. Implement bidirectional traversal and visible full-record serialization.
- [x] Write failing query tests for page/sort/q validation, all selector type combinations, summary graph depth/100-node limit, pending-root 202/404/503 behavior.
- [x] Write failing cursor tests with 105 related documents, stable snapshot across edits, full root each page, incident edges, bound filters, signature rejection, expiry 410 even after snapshot cleanup. Implement transaction-consistent chunked snapshots and HMAC cursors.
- [x] Add Dockerfiles, manual launch and READMEs; run unit + actual Mongo/Kafka integration tests, commit task files.

### Task 4: Gateway and complete runtime wiring

**Files:** `services/api-gateway/`, `compose.apps.yaml`, `scripts/dev/{up,down,doctor,reset}.sh`, root environment additions, gateway tests.

**Interfaces:** Gateway port 8080; six domains 8081–8086, query 8090, pairing actuator 8091. Routes only 70 known operations and health. Propagate X-Obec-Id, X-Request-Id; POST is never automatically retried. Memory limiter bounded, Retry-After on 429. Internal export paths never proxied. `compose.yaml` infra-only, `compose.apps.yaml` app overlay.

- [x] Write failing route tests for selector/query/relations precedence, attachments, blocked internal paths, missing municipality and upstream failure error envelope.
- [x] Implement Spring Cloud Gateway filters, request IDs, size/time limits and bounded limiter; run green tests.
- [x] Wire independently built nine Java containers with health and host-only ports; verify all health endpoints and round-trip create/query through gateway.
- [x] Implement diagnostic and explicit-confirmation reset scripts; standard up/down must preserve volumes. Commit.

### Task 5: Three complete portals and shared UI

**Files:** `apps/{marketing,citizen,office}/`, `packages/{ui,api-client,config}/`, frontend root workspace/lockfile, `.impeccable/` visual artifacts, `DESIGN.md`, frontend tests.

**Interfaces:** REST calls use gateway through same-origin server adapter, fixed municipality, no-store. Public adapter forces published=true, checks domain VZN publication and attachment parent state. Local browser addresses 3000/3001/3002, internal addresses runtime env only. API client types generated from OpenAPI. Forms use strict agenda-specific schemas, linked reference picker and actual upload; no mock persistence.

- [x] Complete Impeccable direction/comp selection with user, retain approval and prompt provenance. Read craft-floor immediately before UI edits.
- [x] Create genuine shadcn/ui components and local Geist fonts. IDSK3 contributes colors only, never components, typography or spacing. Write tests for API error parsing, typed form conversion, whole related cursor accumulation and partial search failure; observe red before implementation.
- [x] Implement citizen search across six lists, six agenda tables/details, published-only attachments and all pending/empty/error states. Run focused tests green.
- [x] Implement office demo entry, live dashboard, six create/update/delete/publish flows, own versus inverse links, file upload and simulated IS settings. Assert saved data survives navigation; keep dirty inputs on errors.
- [x] Implement marketing faithfully from approved comp, benefits/contact/demo routes with honest price and no invented contacts. Independent Dockerfile/README per app.
- [x] Build/typecheck/lint all three apps; desktop/mobile visual inspection, Impeccable detector and fresh visual review. Commit task files.

### Task 6: Seed, rebuild and full acceptance

**Files:** `scripts/{seed,smoke,rebuild}/`, `tests/{integration,e2e}/`, `README.md`, `docs/runbook.md`, CI and verification report.

**Interfaces:** Seed uses existing REST and multipart API only, stable synthetic numbers, manifest of owned seed IDs, no user overwrite. Rebuild captures Kafka offsets before consistent source exports, projects into new generation, replays with entity-version checks and activates only verified result. Old snapshots remain immutable. No direct domain DB reads by consumer/query/rebuild.

- [x] Write failing smoke for 12 records per agenda, two branches of links and actual PDF download; implement two-pass idempotent seed and projection readiness.
- [x] Write failing recovery test covering export, concurrent event replay and deleted records; implement rebuild command and fault recovery procedure.
- [x] Write Playwright tests for create + PDF + publish + citizen search, linked edit, unpublish, error retention and mobile navigation; run against whole stack.
- [x] Verify Kafka outage/recovery, unknown reference 503 rollback, S3 failure retention, all 70 operation contract fixtures, >100 graph pagination, persistence after ordinary restart, host Java connection and all Docker images.
- [ ] Run one fresh whole-branch code review, fix Important/Critical findings with reproducing tests, document exact checks and resource use. Update every README with tested commands; final commit, keep branch for user review without merge/push.
