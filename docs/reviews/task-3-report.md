# Task 3 implementation report

Status: complete. Base: `2cf0577`. Head: `f816428` (`Implement atomic pairing and complete query read pipeline`). Commit owns only `libs/java/read-model`, `services/pairing-service`, `services/query-api`. Root Maven registrations were added first and coordinated with the parent; root `pom.xml` deliberately remains unstaged for the parent's shared registration/wiring commit. No frontend, source specifications, infra, contracts or user research changes are in this commit. No push/merge.

## Delivered behavior

- Two independent Boot3.5.16/Java21 applications: Query8090, Pairing8091. Each has executable jar, pinned/non-root Dockerfile, manual launcher and README. Docker builds include unchanged contract resources. Query imports API error handling only and never scans domain-only common beans.
- All16 requested reads: five joined lists, five full joined details, five summary graph routes and selector. Exact `{typ,zaznam,detail_url}` list shape, full DTOs/string amounts; deletion internals stripped. Selector checks all source/target combinations, sorts number/id, supports strict source pagination/search/filter semantics. Lists preserve tie-break ID sort and literal/case-insensitive q. Unknown/duplicate parameters fail400; tenant required; source error envelopes preserve details arrays/request IDs.
- Shared read-model library imports the checked-in v1 event schema as a Maven resource. Validates full envelope, all per-agenda fields/strict primitive types/amount strings, reference matrices/uniqueness, date formats, tenant and envelope/data identity/tombstones. No schema source edits or duplicate DTO business definitions.
- Full-state projector uses snapshot/majority Mongo transactions, driver transient transaction/unknown-commit retries, a generation writer fence, versioned full record/tombstone, replacement only of source-owned claims, canonical independent edge owners, pending references and processed-event identity in one commit. Explicit municipality/type/ID compound keys. Late targets resolve claims from either direction. Duplicate events and old versions cannot roll back state or resurrect tombstones. A failure at a late edge insert rolls back all earlier record/claim/processed mutations.
- Kafka listener ACKs only after projection commit. Invalid data retries twice after first delivery then publishes original raw input/topic/partition/offset/key to configured DLQ, awaiting actual broker acknowledgement before source-offset commit. Infrastructure failures retry indefinitely at1second intervals, do not become DLQ or silently drop, and make health DOWN. Failed DLQ publication also retains the source offset and reports DOWN. Health exposes processed/retry/DLQ counters without record bodies.
- Graph reads traverse bidirectionally with visited sets and canonical edges. All five roots return the same component through cycles. Publication filters apply to every node, traversal and nested own references; hidden intermediates stop traversal. Deleted/missing/filtered targets never become fake full records. Summary verifies the root through owner HTTP, honors depth1–3 and100nodes including root, and returns only in-scope edge endpoints with truthful truncated. Projection metadata is nested inside `data` for summary and top-level for joined shapes.
- Existing joined roots read locally; absent roots alone call owner HTTP:202/Retry-After2 for existing but unprojected,404 for missing/deleted/filtered,503 for failed dependency. Known missing targets give200/pending with full available records and unresolved count. Joined lists also report pending references among returned roots. Ready remains a statement about local known state.
- Joined details traverse the whole visible component with no100-node truncation. One Mongo transaction reads consistent records/edges and commits immutable snapshot header, one bounded record per chunk and one bounded edge per chunk. Related rows sort typ/id and page1–100; full root is returned each page, incident edges on each page and root edges on first. Snapshot lifetime600seconds, TTL indexes plus independent application expiry. HMAC cursor binds snapshot, municipality, root agenda/ID, publication filter, size, position and expiry; mismatches/forgery400, verified expiry410 even without a Mongo header. New and continuation reads are gated503 during rebuild.
- Standalone offline rebuild reuses exactly `ProjectionEngine.apply(generation,event)`: verifies inactive consumer group, gates Query, captures Kafka end offsets BEFORE all five independent authoritative HTTP exports, imports every stable export page/tombstone, replays subsequent Kafka to a fixed post-export barrier, verifies exported identity/versions and edge endpoints, rechecks inactive group, installs/verifies exact group offsets, then atomically activates generation. Durable metadata/gate prevent serving a partial generation if interrupted. Historical shared-topic fixtures before capture are excluded without tombstones/topic cleanup. Old generations remain retained.

## Reusable interfaces / parent integration

`libs/java/read-model/README.md` documents APIs in detail:

- `new ProjectionStore(MongoClient,databaseName)`, `transaction(Function<ClientSession,T>)`, `activeGeneration(session)`, `record(session,generation,Ref)`, `ProjectionStore.live(record)`.
- `new ProjectionEngine(store).apply(generation,JsonNode)` and `.applyActive(JsonNode)`: strict full-state projection; boolean false for duplicate/older state; same implementation for ordinary delivery and rebuild.
- `ProjectionStore.setReady(false)` and `.activateGeneration(generation)`; coordinator must capture/import/replay/verify/handoff before activation. Public Query reads generation metadata in the same transaction as records/edges.
- `Ref(typ,id)`, `.bson()`, `.key()`, `.allowed(source,target)`; canonical type/id sorting.

Authoritative bootstrap before demo seed (pairing stopped):

```sh
services/pairing-service/run.sh rebuild
services/pairing-service/run.sh
```

The CLI is also `java -jar services/pairing-service/target/pairing-service-0.1.0-SNAPSHOT.jar rebuild`. It consumes configuration exclusively from env: `MONGODB_URI` (read replica set), `KAFKA_BOOTSTRAP_SERVERS`, `OPENOBEC_EVENTS_TOPIC`, `PAIRING_CONSUMER_GROUP`, and the same `INVOICES_SERVICE_URL`, `SUPPLIER_INVOICES_SERVICE_URL`, `CONTRACTS_SERVICE_URL`, `ORDERS_SERVICE_URL`, `PROCUREMENT_SERVICE_URL` used by Query. Default owners are host ports8081–8085; Docker uses owner service DNS names. `OPENOBEC_EVENTS_DLQ` configures ordinary listener quarantine. Query HMAC key is `QUERY_CURSOR_SECRET` (at least32characters), default local demo value exactly matches `.env.example`.

Parent must preserve the order: domains available → pairing stopped → authoritative rebuild/fresh-offset bootstrap successful → start pairing → demo seed → wait for source versions in Query. Never start the default listener against historical fixture offsets before that bootstrap. No production source topic was consumed or mutated by this task's tests.

## RED / GREEN evidence

All verification used real running Mongo read replica set and Kafka, with JDK21.0.9+10 from `.tools`, no embedded DB/repository mocks/Testcontainers substitutions. Broker tests inject unique `openobec.task3.*` source/DLQ topics and random own database names; cleanup removes only these owned resources. HTTP query tests use actual HTTP requests and a local owner HTTP transport fixture for controlled existence/error behavior; rebuild also uses real HTTP export transport.

- Projector tests were written first; initial RED failed compilation because ProjectionStore/ProjectionEngine/Ref did not exist (`/tmp/task3-red.log`). Implemented and got GREEN (`/tmp/task3-projection.log`). They now verify dedup/out-of-order/tombstone/generation isolation, late targets, both owners, replacement/removal, malformed schema, rollback after late edge-write failure,20concurrent owners and explicit tenant keys: **6tests**.
- Query tests first RED: no application configuration existed (`/tmp/task3-query-red.log`). GREEN actual HTTP/live Mongo (`/tmp/task3-query.log`). **9integration tests** cover full lists/string amounts, literal search, all25selector pairs, invalid/duplicate params, all five graph roots/cycles, hidden intermediate/nested ref filtering, root202/404/503/Retry-After, missing target pending/late resolution,105related documents, stable pages across source edits/deletes, root every page/incident edges, bound/tampered/missing-snapshot cursors, summary depth/100-node cap. **1cursor unit test** independently proves signed expired token410 without any database and signature/binding400.
- Kafka first RED missing listener implementation (`/tmp/task3-kafka-red.log`), GREEN (`/tmp/task3-kafka.log`). **1actual-broker integration test** proves duplicates/old events, unknownschema99 quarantine, actual Mongo write rejection without source ACK, restored DB recovery and exact offsets. Strengthened failed-DLQ test RED showed health incorrectly UP (`/tmp/task3-hardening-red.log`); fixed health degradation after unconfirmed publication. Final test verifies failed DLQ does not increment confirmed count or advance offset, then recovers successfully after restoring its valid destination.
- Rebuild first RED missing coordinator APIs (`/tmp/task3-rebuild-red.log`), GREEN (`/tmp/task3-rebuild.log`). **1integration test** seeds an earlier topic fixture and obsolete prior read generation, captures fresh offsets, imports five owner exports with a two-page invoice export/tombstone, publishes a newer event during export, verifies new version/edge state, excludes historical fixture and verifies exact consumer-group barrier offset/active generation.
- Pending-list regression RED: expected pending but got ready (`/tmp/task3-list-red.log`); fixed and focused GREEN (`/tmp/task3-list-green.log`). Explicit tenant-key regression RED (`/tmp/task3-tenant-red.log`), fixed and complete owned package GREEN (`/tmp/task3-final-owned.log`).

Final verification:

```sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B package
```

**BUILD SUCCESS, all14reactor modules,138tests,0failures,0errors,0skipped,48.434seconds.** Includes all six existing domain suites and parent's7gateway tests, and **18Task3 tests**. Final log `/tmp/task3-final-root.log`. Earlier full root test/package also green; final result is after all production changes. Owned package run22.492seconds. Both executable jars generated; event-schema resource verified inside read-model jar. All owned Java formatted with google-java-format1.27. `git diff --cached --check` exit0 before commit.

## Limits / follow-up operational checks

- Full Docker image/runtime and the genuine owner-service authoritative-bootstrap/demo-seed browser smoke are the parent's Task6 whole-stack verification. This task built executable jars and supplied pinned Dockerfiles; it did not start a production-topic consumer or run the production bootstrap itself.
- Rebuild deliberately stops pairing and gates Query. Failed runs retain generation/offset metadata and keep Query unavailable; fix the cause and rerun with listener stopped, as documented. Old generations are retained for audit/recovery rather than purged automatically.
- Snapshot/rebuild work uses real Mongo transactions and materializes the visible graph in process while storing bounded BSON chunks. This is appropriate to the approved local demo; no production-scale graph or cross-system availability guarantee is claimed.
- Intentional schema/DB/DLQ rejection tests log their induced errors. Spring Boot test machinery also prints the Java21 Mockito-agent/CDS notice despite no repository mocks. Final test assertions/build are green.

## Review fix round 1 — Q3-1, Q3-2 and scoped Q3-3

Fix base `f816428`; fix head `4b198b3` (`Fix summary boundary status and share read-side test fixtures`). Only fix-owned read-model/query/pairing source/tests/POM/README paths are committed. The controller's root POM registrations and Dockerfile healthcheck-copy edits remain unstaged and untouched. No production-topic writes/consumption and no runtime bootstrap.

**Q3-1: returned depth-boundary nodes now contribute unresolved claims.** In `QueryService.graph`, pending-reference counting precedes the depth cutoff, while edge expansion still follows it. New `QueryIntegrationTest.summaryCountsMissingClaimsOnDepthBoundaryWithoutExpandingIt` uses actual Mongo/HTTP: invoice A → projected contract B; B → missing order C and projected procurement D. At depth1 only A/B and their one edge are returned, pending/count1 agrees with joined detail, and the projected D beyond the boundary remains excluded. After C arrives the same depth-limited summary becomes ready/count0 while still returning only A/B.

RED command (before changing production code):

```sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/query-api -am test -Dtest=QueryIntegrationTest#summaryCountsMissingClaimsOnDepthBoundaryWithoutExpandingIt -Dsurefire.failIfNoSpecifiedTests=false
```

Actual output: **Tests run:1, Failures:1, Errors:0, Skipped:0; expected pending but was ready; BUILD FAILURE**. Log `/tmp/task3-review-q31-red.log`. Same command after the one-line reorder: **Tests run:1, Failures:0, Errors:0, Skipped:0; BUILD SUCCESS**. Log `/tmp/task3-review-q31-green.log`.

**Q3-2: one test-only event builder.** `libs/java/read-model/src/test/java/sk/openobec/read/fixtures/DocumentEvents.java` is the sole full five-agenda fixture builder. `ProjectionIntegrationTest`, Query's `QueryIntegrationTest`, Pairing's `PairingKafkaIntegrationTest` and `RebuildIntegrationTest` statically import `DocumentEvents.event`; all scenario-specific data changes remain in each test. Both copied application `TestEvents` classes and the inline projector builder are removed. No production abstraction was introduced.

Read-model attaches a fixtures-only test jar at `process-test-classes`; both applications consume the `tests` classifier strictly in test scope. Attaching before the test phase makes clean `-am test` work without a previous package/install. Jar inspection confirmed that the only class in the test artifact is `sk/openobec/read/fixtures/DocumentEvents.class`, with no integration suites duplicated into downstream discovery.

Verification from clean outputs:

```sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/query-api,services/pairing-service -am clean test
```

Actual output: **BUILD SUCCESS,27tests,0failures/errors/skips,23.623seconds** (8existing common/file tests +19Task3 tests). Log `/tmp/task3-review-focused-clean.log`. Covering test files: `ProjectionIntegrationTest.java` (6), `PairingKafkaIntegrationTest.java` (1), `RebuildIntegrationTest.java` (1), `QueryIntegrationTest.java` (10), `CursorCodecTest.java` (1).

**Q3-3: small explicit no-mocks configuration removes owned-suite notices.** Initial proxy MockMaker alone did not stop instrumentation initialization; that intermediate clean-run log still shows the known notices. Inspected the installed Mockito plugin aliases and also selected `member-accessor-reflection`, using one-line `mockito-extensions/org.mockito.plugins.MockMaker` and `.MemberAccessor` resources in each application test scope. No dependency changes or suppressed JVM warnings. These real Mongo/Kafka/HTTP suites create no mocks. Focused verification:

```sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/pairing-service,services/query-api -am test -Dtest=PairingKafkaIntegrationTest,QueryIntegrationTest#summaryCountsMissingClaimsOnDepthBoundaryWithoutExpandingIt -Dsurefire.failIfNoSpecifiedTests=false
```

Actual output: **BUILD SUCCESS,2tests,0failures/errors/skips,10.643seconds**; no self-attachment, dynamic-agent or CDS notice. Log `/tmp/task3-review-noagent-focused.log`. The final full-reactor Surefire XML for both owned Spring suites also contains none of those notice strings. Existing domain/gateway suite notices remain outside this Task3 fix scope.

Final reactor/lifecycle verification:

```sh
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B test
JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -DskipTests package
```

Actual results: first command **BUILD SUCCESS,139tests,0failures,0errors,0skipped,47.559seconds**, all14modules, including19Task3 tests. Log `/tmp/task3-review-root-test.log`. Second command **BUILD SUCCESS,3.425seconds**, restoring every executable jar after the clean test run; log `/tmp/task3-review-package.log`. Query executable inspection contains only the production `read-model` jar, with no fixture test artifact/DocumentEvents/Mockito extensions or Mockito core. `git diff --cached --check` exit0 before fix commit. All review changes are verified; Task6 runtime/bootstrap checks remain controller-owned.
