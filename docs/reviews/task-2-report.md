# Task 2 implementation report

Status: complete. Commit: `0d8c9626fff98cb86f718e2fbb10530bbe0706c0`. Scope: the six owning Java domain applications, `libs/java/{common-api,event-contracts,file-storage}` and root Maven module registration only. No frontend, approved plan/spec, infrastructure, contracts or user research files were edited by this task. No push or merge.

## Delivered behavior

- Six independent Java 21 / Boot 3.5.16 applications on ports 8081–8086, each with its own concrete editable DTO record, domain field/validation definition, repository, controller, configuration, executable jar, non-root Dockerfile, manual launcher and README. All 30 original domain operations and all 24 attachment operations work: **54 concrete operations**, no business CRUD placeholders.
- Concrete domain distinctions preserved: invoices use `odberatel`; supplier invoices use `dodavatel`; contracts own signature/effective/expiry dates and `zmluvna_strana`; orders own order/delivery dates; procurement owns CPV, UTC deadline and state; VZN owns approval/effective/expiry dates and has no public references, money or entity_version.
- Strict scalar checks before typed decoding; unknown/read-only JSON fields return 422; malformed JSON 400; incorrect media 415. Partial update retains omitted fields, supports explicit nullable clearing and replaces a counterparty as a whole. The merged result is validated, including exact BigDecimal sum and source date ordering. Money uses canonical two-decimal strings on the wire, Decimal128 in ordinary Mongo records, and exact canonical string storage when a valid amount exceeds Decimal128 precision. No float/double arithmetic or undocumented amount cap.
- Tenant enforcement in every domain. Prefixed UUID IDs and UTC timestamps are server-owned. Ordinary responses hide internal CAS/attachment counters and deleted/deleted_at. Missing legacy reference arrays normalize to [] in source responses and deletion/export events. Unique municipality/number index reserves numbers after logical deletion.
- Snapshot/majority Mongo transactions commit document, CAS version, audit and full nested `outbox.event` together. Update conflict retries reread current state and reapply the original patch, preserving concurrent changes to other fields. Five retries then 409; VZN retains internal CAS and local audit transactions without projection events.
- New reference pairs alone are checked through actual authoritative owner HTTP detail, with tenant verification, eight concurrent requests, one-second per-request timeout and twenty-second batch deadline. Invalid/missing/deleted/foreign targets are field INVALID_REFERENCE 422; unavailable dependencies are 503 without saving the source. Unchanged references to subsequently deleted targets permit unrelated updates.
- Leased at-least-once outbox publisher, full approved envelope and complete versioned state, key `zilina:agenda:id`, broker ACK before published_at, durable attempts/backoff/lease/error state. Normal topic remains `openobec.documents.v1`. Test-only property injection supports isolated broker tests without changing the production default.
- Real private RustFS path-style uploads/downloads. Streaming to a bounded temporary file computes SHA-256 without buffering the whole upload in Java heap. PDF/PNG/JPEG MIME/signatures, 20 MiB, safe display names, ten active attachments and parent ownership enforced. A parent transaction serializes file additions/deletions and parent deletion races. Failed metadata persistence compensates the uploaded S3 object; failed compensation is recorded for recovery. Logical deletion retains audited blobs. Read-only executable orphan inventory is supplied in file-storage.
- Five domain-only internal consistent tombstone exports, unavailable for VZN. Exact wire contract and Query reuse instructions are in `libs/java/common-api/README.md`. Initial GET `/internal/v1/export?page_size=100` freezes all owner rows in one snapshot transaction, storing one row per export chunk. Responses contain schema_version, entity_type, obec_id, snapshot_id, created_at, expires_at, total, data[] of full approved document events, next_cursor. Cursor pages retain immutable state for ten minutes; application expiry independent of TTL. Each data row carries full source version; live states export as document.updated, tombstones as document.deleted. No export event is published to Kafka.

## RED / GREEN evidence

All commands ran from the shared project with `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home"` (Java 21.0.9+10). The required escalated execution profile was used because the workspace alias resolves to the physical Desktop/Projekty checkout.

1. `./mvnw -B -fae test`: initial file safety suite **4 tests, 4 assertion failures**, because unimplemented file validation accepted signatures, unsafe names and over-limit files. Log `/tmp/openobec-task2-red.log`.
2. `./mvnw -B -fae test '-Dtest=FakturaValidationTest,DodavatelskaFakturaValidationTest,ZmluvaValidationTest,ObjednavkaValidationTest,VerejneObstaravanieValidationTest,VznValidationTest' -Dsurefire.failIfNoSpecifiedTests=false`: **43 tests, 24 assertion failures + 19 expected unimplemented-stub errors**. Positive paths hit deliberately minimal UnsupportedOperationException stubs; rejection assertions saw the wrong exception type. No compiler failure was counted as a behavioral RED. Log `/tmp/openobec-domain-red.log`.
3. After concrete DTO/validation and file safety implementation, `./mvnw -B test`: **47 tests, zero failures/errors**. Log `/tmp/openobec-task2-validation-green.log`.
4. Before endpoint implementation, `./mvnw -B -pl services/invoices-service -am test -Dtest=FakturaIntegrationTest -Dsurefire.failIfNoSpecifiedTests=false`: **7 integration tests, 7 assertion failures**, expected 201/400 but real HTTP returned missing-route 404. Log `/tmp/openobec-integration-red.log`.
5. Implemented routes, Mongo transactions/outbox, attachments and exports. The complete reactor passed against real Mongo/RustFS. Expanded verification includes actual broker ACK/lease/outage; exact S3 bytes/digest; 413 over 20 MiB; MIME mismatch; ten files; metadata rejection compensation; two simultaneous patches; duplicate number after delete; audit rejection rollback; immutable export with tombstones; owner concurrency/missing/foreign/unavailable and unchanged legacy targets.
6. Schema-valid monetary precision regression initially errored with validation rejection (**9 tests, 1 error**), `/tmp/openobec-money-red.log`; removing the undocumented precision restriction and storing wider decimals exactly made all 9 pass (`/tmp/openobec-money-green.log`).
7. Existing-record reference-array regression: **1 test, 1 assertion failure** (`expected true but was false`), `/tmp/openobec-legacy-red.log`. Source and event normalization fixed it; final complete suite includes this passing regression.

## Final verification

- `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B verify`: **BUILD SUCCESS, 108 Java tests, 0 failures, 0 errors, 0 skipped**. Six executable service jars packaged. Latest log `/tmp/openobec-task2-final.log`.
- `.tools/venv/bin/python libs/java/common-api/src/test/python/verify_live_domains.py`: **48 passing real cross-service/schema checks**. Starts all six packaged Java applications, six isolated real Mongo DBs, owner-to-owner HTTP checks, deleted-target legacy edit, stopped-owner 503/no source mutation; validates actual responses and full outbox events against the published OpenAPI/event JSON Schema. Latest log `/tmp/openobec-live-final.log`.
- `python3 -m unittest discover -s tests/contracts -p 'test_*.py'`: **12 tests, 0 failures/errors**, `/tmp/openobec-task2-contracts-final.log`.
- `DOCKER_CONFIG=/tmp/openobec-docker DOCKER_HOST=unix:///Users/simonochotnicky/.docker/run/docker.sock docker build -f services/invoices-service/Dockerfile -t openobec/invoices-service:task2 .`: success. Actual non-root user10001 container ran on openobec_default with Docker-DNS Mongo transaction and internal Kafka ACK, then its owned temporary container/database were removed. Build/smoke logs `/tmp/openobec-task2-docker.log`, `/tmp/openobec-task2-container.log`.
- `bash -n` all six run.sh wrappers and `git diff --check`: exit0. Google Java Format applied to all owned Java source. All Dockerfiles share the verified build/runtime pattern with each module/port selected independently.
- Read-only `reconcile_orphans.py --agenda faktury --mongodb-uri <owning-default-uri> --grace-seconds 0` successfully inventoried real RustFS metadata/object differences without deleting anything. Default one-hour grace protects uploads in flight.

## Fixture isolation and retained history

Integration databases are uniquely named `task2_{invoices,supplierinvoices,contracts,orders,procurement,ordinances}_<uuid>`; live app databases are `task2_live_<agenda>_<uuid>`; Docker smoke uses `task2_docker_<uuid>`. Tests drop only their own databases. Final actual inventory found **no task2_* database remains** and **all six default demo domain databases contain0 documents**. Actual demo/user records were untouched.

Current Java tests remove their own S3 objects by attachments.object_key before dropping their database. Early development runs before that cleanup was added left small synthetic PDF bytes only, with no metadata/API visibility. Read-only invoice inventory found11 candidates. No broad object purge was performed; the read-only tool and documented reconciliation procedure support deliberate cleanup.

Earlier real Kafka verification published synthetic fixtures to the shared topic before test-topic isolation was added. Automatic approval review **rejected** publishing synthetic cleanup tombstones because that could mutate downstream read models and safer isolation exists. The rejected call performed no edits or shared-topic writes; no workaround or retry occurred. Parent chose the safer approved authoritative-export rebuild before demo seed, capturing current Kafka offsets and starting a dedicated consumer group/read generation, so old synthetic history cannot appear in the public demo. No user permission request remains necessary for that safer path.

Read-only history inventory (before final isolated tests): shared `openobec.documents.v1` beginning offsets `{0:0,1:0,2:0}`, captured next offsets **`{0:19,1:16,2:20}`**. All55 observed historical events match task-owned fixtures: `TEST-<canonical UUID>`35 events, `LIVE-cislo-<32 hex>`19, `DOCKER-<32 hex>`1. Synthetic offset ranges p0:0–18, p1:0–15, p2:0–19. Retained messages were not deleted or changed.

All subsequent broker tests and the packaged live harness inject uniquely owned `openobec.task2.*` topics, create/delete only those temporary topics, and leave normal publication's default unchanged. Integration tests still exercise the actual broker rather than a fake Kafka implementation.

## Self-review and practical limits

- Rechecked all six schemas, exact output fields, source wrappers, input coercion, nullable/replacement patches, chronology, tenant, enum/reference matrices, Decimal128/exact-string conversion, CAS retry semantics, transaction sessions, outbox ACK ordering, private file streams, compensation, limits and export consistency. No known functional failure remains in this task's verified scope.
- Domain definitions explicitly own paired/unpaired participation. Common helpers are technical mechanics, not a shared universal business schema. Query should import ApiErrors/Json/ListQuery/ReferenceValidator individually and configure its own read DB/tenant controls; scanning the whole common package would also register domain-only beans that expect a RecordStore. Exact reusable signatures and export wire contract are documented.
- Mongo+S3 deliberately has no distributed transaction; process crashes can leave orphan bytes. Recovery is an explicit read-only inventory and operator reconciliation, never an automatic broad purge. Logical deletion intentionally retains blobs.
- Export capture uses one Mongo snapshot transaction, suitable for the approved local demo. Production-scale operational sizing is not claimed.
- Upstream Spring Boot test listeners initialize Mockito's inline agent even though these tests use no mocks, producing Java21 dynamic-agent/CDS notices; intentional rollback and dependency outage tests also log the induced errors/warnings. No test or runtime assertion failed. Production service startup has no test agent dependency.
- Root frontend/plan/spec/research changes belong to the parent and were excluded from this task's commit. Infrastructure stays running for subsequent tasks.


## Review fix round 1: indeterminate commit safety and complete JSON input

Review findings P1/P2 reproduced before changing production code. Scope of this round: those two fixes, focused regressions and the relevant common-api documentation only. No main Kafka topic cleanup/retry and no frontend/infra/contract edits.

- `RecordStore.transaction()` now distinguishes an indeterminate commit from a confirmed failure after the three existing commit-acknowledgement attempts. `IndeterminateCommitException` reports503 and bypasses abort/replay logic; attempting to abort does not establish that a successful commit rolled back.
- `AttachmentStore.upload()` never compensates by deleting S3 bytes after that indeterminate outcome. It reconciles the generated stable file ID, owner and exact object key with a primary/majority metadata read. A confirmed matching committed row returns its public metadata, retaining the bytes. If absence or an unavailable metadata check cannot establish the outcome, bytes remain preserved, the response is503, and an `attachment_reconciliation` record retains stable file/document/object identity for a later authoritative check. That record is not a deletion request. Confirmed metadata rejection still takes the existing compensating-delete path.
- `Json.mapper()` enables `FAIL_ON_TRAILING_TOKENS`. Both a second JSON root value and trailing invalid text are rejected by the MVC JSON reader with400 before create/update reaches any document/version/outbox mutation.

RED command:

`JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/invoices-service -am test '-Dtest=FakturaIntegrationTest#trailing*+realCommittedAttachmentRetainsBytesWhenCommitAcknowledgementStaysUnknown' -Dsurefire.failIfNoSpecifiedTests=false`

Result: **5 tests, 5 assertion failures, 0 errors/skips**, exit1. The four independent HTTP cases showed both suffix types accepted: create returned201 and added document/outbox; update returned200, changed the document/version and added outbox. The attachment fault case performed a real Mongo commit and then faulted only its acknowledgements; committed metadata existed but the referenced RustFS bytes had been deleted. Log `/tmp/openobec-task2-review-red.log`.

Focused GREEN command:

`JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/invoices-service -am test '-Dtest=FakturaIntegrationTest#trailing*+realCommittedAttachmentRetainsBytesWhenCommitAcknowledgementStaysUnknown+metadataFailureCompensatesPrivateS3Object' -Dsurefire.failIfNoSpecifiedTests=false`

Result: **6 tests, 0 failures/errors/skips**, exit0. The fault injection wraps the actual MongoClient/ClientSession only at the commit acknowledgement boundary: first commit really succeeds, all three acknowledgement attempts then report UnknownTransactionCommitResult. Assertions confirm real committed metadata, exact retained S3 bytes, stable-ID success reconciliation and no explicit abort. The pre-existing confirmed-rejection compensation regression also passes. Log `/tmp/openobec-task2-review-green.log`.

Final complete reactor command `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B verify`: **BUILD SUCCESS, 113 tests, 0 failures, 0 errors, 0 skipped**, six application jars repackaged; log `/tmp/openobec-task2-review-full.log`. Repository contract suite `python3 -m unittest discover -s tests/contracts -p 'test_*.py'`: **12/12 passing**, log `/tmp/openobec-task2-review-contracts.log`. `git diff --check`: exit0.

All broker tests in this round used uniquely owned temporary `openobec.task2.*` topics, removed by test cleanup. Owning Mongo test databases and S3 objects were isolated/cleaned by the existing fixture teardown. No shared-topic messages or default demo records were changed. Commit recorded below.

Review fix round 1 commit: `2cf05778a23858ac98d0ddcb064585c7e092604e`.
