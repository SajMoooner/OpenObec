# Task 6 implementation and acceptance report

Status: delegated backend scope complete; final controller verification remains explicitly pending below. Base `4b198b3`. Delegated commit `4c20d2e` (`Add API-only demo seed and live recovery acceptance`). No push/merge.

## Ownership and coverage

The delegated implementer owns only `scripts/{seed,smoke,rebuild}/`, `tests/integration/`, root `README.md`, `docs/runbook.md`, and this report. The controller owns all frontend/Playwright files, CI, root runtime scripts, Dockerfiles/Compose, launch-mode changes, whole-stack restart/persistence, resource measurements and final independent whole-branch review. Their checks are recorded below only when actual results are supplied. No unrelated changes or user `OpenObec-*` research files are staged. This `.superpowers/sdd` working report follows the existing ignored-report convention; the controller will copy a concise durable verification report after final Docker/persistence checks.

Delivered:

- API-only two-pass seed: 12 records per each of six agendas (72), stable synthetic numbers, mixed drafts/published, two separate five-node branching contract components (degree4), actual readable PDF for every record. IDs and per-record progress persist immediately in `.run/seed-manifest.json`. Completed records are never rewritten; an edited unfinished record is preserved; deleted identities are not recreated. Foreign number conflicts fail rather than being adopted. Projection readiness checks actual source versions. No source-domain Mongo reads.
- Rebuild entry point delegates to the existing Task3 algorithm, using actual authoritative HTTP exports and env URL overrides. Stops only the verified pairing process from this checkout or the single Compose pairing service. Failure leaves it stopped; successful rebuild restarts it. No all-Java kill, topic purge, direct source DB rebuild or generation deletion.
- Live HTTP schema fixtures cover every one of the checked-in 70 operations, including all six attachment upload/list/download/delete paths, CRUD, five Query list/detail/summary groups and selector. Every JSON response validates against the actual OpenAPI Draft2020-12 schemas; uploads/downloads compare real PDF bytes and SHA256. Evidence contains actual requests/status/headers/JSON or PDF bytes at `.run/contract-fixtures.json`.
- Safe normal smoke and separate disruptive recovery scripts. Test-created records have UUID-owned synthetic numbers and are logically deleted only through source APIs, producing genuine owner tombstones. No fabricated cleanup event, broad purge, historical Kafka mutation or user overwrite.

## RED / GREEN and exact checks

Superpowers TDD was used for seed and rebuild entry points. Test-first seed smoke failed because the seed script did not exist. `/tmp/task6-seed-red.log`: **1 test, 1 failure**, missing `scripts/seed/seed.py`. After implementation the same live test passed: `/tmp/task6-seed-green.log`, **1 test, 0 failures/errors, 6.706s**. It checks 72 source records, two degree>=3 graphs, actual PDF bytes/SHA and source timestamps unchanged on the second seed pass.

```sh
.tools/venv/bin/python -m unittest discover -s tests/integration -p test_seed.py -v
```

Rebuild command test first failed on missing `scripts/rebuild/rebuild.py` (`/tmp/task6-rebuild-red.log`, **1 failure**). The same command passed after implementation (`/tmp/task6-rebuild-help-green.log`, **1 test, 0 failures/errors, .048s**). This RED concerns the executable entry point; the algorithm's export/concurrent replay/tombstone RED/GREEN is independently recorded in Task3 and the actual owner recovery check is reported separately below.

```sh
.tools/venv/bin/python -m unittest discover -s tests/integration -p test_rebuild_command.py -v
.tools/venv/bin/python -m unittest discover -s tests/integration -p test_contract_http.py -v
scripts/smoke/run.sh
.tools/venv/bin/python -m unittest discover -s tests/contracts -v
```

Actual results:

- Initial HTTP fixture run `/tmp/task6-contract-http.log`: **1 test PASS, 1.650s; exactly70 distinct operations**. All success responses checked; these fixtures do not claim every possible error/status branch.
- Combined live acceptance `/tmp/task6-live-smoke.log`: **4 tests PASS, 6.085s**. Includes all70 operations, seed graph/PDF/idempotency, rebuild CLI help and a separate six-record owned seed namespace where a genuine user edit and actual contract deletion survived rerun. Those owned records were subsequently deleted normally. The main72 demo records remain.
- Existing repository contract/infra suite `/tmp/task6-contracts.log`: **12 tests PASS, 1.639s**. Exact operation count, reference resolution, event shape, strict updates, tenant wrappers, read-only Query and effective env behavior.
- `python -m py_compile` for all owned Python scripts/tests and scoped `git diff --check`: exit0.
- Runtime bootstrap was performed by controller before seed: `.run/bootstrap.log`, active generation `rebuild-903726cd-e427-451d-be71-f247bc646ed1`, exported0/replayed0, offsets partitions0/1/2 =19/16/20. This excludes55 earlier synthetic historical events without consuming/purging/rewriting them. Pairing healthUP, processed0/dlq0; Query/gateway empty ready200 before seed. Six source lists total0.

Actual PDF parser evidence `/tmp/task6-readable-pdf.log`: native macOS PDFKit parsed the actual downloaded PDF as **1 page** and extracted `DEMO-2026-01-001` plus `Synthetic data - no real personal information.` No synthetic header-only file was substituted. Downloaded first invoice seed PDF is653bytes with SHA256 `2ff3a6f9653d871136835945d12111d94da30a4d25bc882b6f416184a6cdfabb`.

## Coordinated actual recovery and faults

Executed after controller explicitly opened a safe test window with browser checks idle:

```sh
.tools/venv/bin/python tests/integration/faults.py -v
.tools/venv/bin/python tests/integration/recovery.py -v
```

Actual `faults.py` GREEN `/tmp/task6-faults-green.log`: **1 test PASS,45.265s**. It checks real owner503 create/update rollback, RustFS upload503 with retained metadata/source state, identical prior attachment after recovery, retained audit S3 bytes after logical deletion, committed source/outbox while Kafka is paused, broker acknowledgement and projected exact version after recovery. It reads only owned attachment/outbox technical metadata. Each pause has a `finally` resume.

Actual `recovery.py` GREEN `/tmp/task6-recovery.log`: **1 test PASS,5.876s**. It forwards unchanged real owner HTTP export bytes through a local relay. After snapshot freeze it performs a normal source update/delete and waits for real Kafka publisher acknowledgements, then lets the existing coordinator import/replay/verify/activate. It verifies Query503 during gate, actual replay>=1, new version, absent deleted record, and an immutable pre-existing joined cursor after activation. Old generations are retained. Actual result: generation `rebuild-1a2da478-6c62-433f-aa62-aa4495388f4b`, **exported83/replayed2**, barrier offsets partitions0/1/2 =67/54/63. Concurrent source version2 won over the frozen export, the actual deleted source remained absent, and a pre-rebuild cursor retained version1 after activation. Evidence `.run/rebuild-acceptance.{json,log}`.

The first fault harness run `/tmp/task6-faults.log` correctly passed owner/RustFS checks but then failed on the test's wrong204 logical-delete assumption; contract/API correctly returned200. Corrected the harness and ran the entire scenario again, additionally requiring a recorded failed publish before unpausing Kafka. Final evidence `.run/fault-acceptance.json` confirms source committed version2, pending outbox and non-null publish failure while Kafka was paused, followed by broker ACK and projection version2 after recovery. No product bug was found in that initial failed test.

After both runs all9 Java services were explicitly checked **200UP**, gateway Query **200ready**, pairing listener **UP,DLQ0,retries0**, and Kafka/RustFS unpaused/healthy. Post-recovery fast suite `/tmp/task6-post-recovery-smoke.log`: **4 tests PASS,6.039s**. No dependency remained paused. The controller was informed that launch-mode switching was safe; delegated runtime checks stopped before its Docker switch.

Task3's existing real-Mongo/Kafka tests already cover >100 graph pagination (105related documents), hidden intermediates, cycles, signed/expired cursors, page consistency after concurrent source edit/delete, projector transactional rollback, old/duplicate events, DLQ publication failure and exact consumer offsets. See `task-3-report.md`; no claim is made that its controlled owner HTTP fixture is this task's actual owner export check.

## Controller evidence / pending boundaries

- Nine Java Docker images built successfully by controller: `/tmp/openobec-docker-java-build.log` (message supplied); not yet switched to Docker runtime at this point.
- Controller browser evidence supplied: **3 flows PASS,19.3s**: real PDF byte hash, link/edit/publish/citizen search/unpublish, upload-failure retry preserving same ID and inputs, mobile close/navigation. Full final Playwright run after Docker switch remains controller-owned.
- Frontend Docker images and whole-stack Docker health/default API URL verification: pending controller.
- Ordinary restart persistence and host Java connection evidence: host Java APIs and seed are actually live; whole-stack restart preservation pending controller.
- Final Java/frontend/Playwright/CI results and fresh independent whole-branch review: pending controller. Earlier base all-Java suite was139GREEN per Task3; it is not claimed as a new run by this delegate.
- Resource use: no new measurement claimed by delegated implementer. Live checks above have measured wall-clock runtimes only.

## Operational limits

Local unauthenticated demo only. Manifest must remain with data; loss or a crash between POST and manifest persistence can produce a safe number conflict requiring operator inspection, never silent adoption. Run only one seed process at a time. Failure after rebuild gate keeps Query unavailable until a successful rerun. Old snapshots/generations and logically deleted audit blobs are intentionally retained. No reset has been run by this task. No production-scale throughput/HA claim is made.

## Controller completion evidence (2026-11-01)

Default Docker up succeeded without alternate env/config flags, all12imagesbuilt,21runninghealthy. Complete manual production startup previously passed5E2E18.1s; finalDocker22E2E32.3s including14reviewregressions andkeyboard. All3finalhostNextbuildspassed. Typecheck/lint+13clienttestsGREEN. FullJava148/0/0/0 log/tmp/openobec-task4-identity-verify.log andfinalgateway8/tmp/openobec-header-dedup-green.log;12contract+2runtimetestsGREEN. Dockerfast4HTTPtests/all70schemasPASS6.824s. OrdinaryDockerdown/up .run/persistence-proof.json proves72unchangedDTOs,identicalPDFSHA,oldcursorvalid. Current21runninghealthy .run/docker-status-final.json; ownmemory2.92GiB with8GiBVM, prior2.69GiB. Finalcapturematrix28standard+4expanded noerrors/overflow; visualfixverdictpendingseparategate. Durable docs/verification.md recordsverifiedboundaries. CIworkflowpinnedofficialactions, equivalentlocalcommandsverified; remoteCInotrun(noauthorizedpush). Task6quality/specgateandfinalwholebranchreviewpending, notinferredfromtests.
