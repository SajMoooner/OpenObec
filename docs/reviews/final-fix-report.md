# Final review fix wave

Implemented commit: `5f24195b477602302d54721bfb3a0d592546b625` (`fix: preserve deleted seed targets and accurate inverse links`). Reviewed findings were the complete I1/I2/M1 list in `final-review.md`, reviewed head `f66a124`. This wave did not hunt for additional findings.

## Scope and result

- **I1 corrected:** seed readiness now verifies delivery of every live manifest source version to its Query root. Graph `pending` may legitimately remain after a referenced target is deleted, so it no longer blocks an otherwise caught-up seed. A 404 from the source alone preserves a user deletion; a Query 404 for a still-live source retries rather than skipping initial event delivery. Existing sources, links, files, and manifest entries are not rewritten.
- **I2 corrected:** the office inverse-link view uses a small pure API-client helper that selects only edges incident to the edited `{typ,id}`, excludes the root owner, and deduplicates genuine incoming owners. Query boundary edges remain unchanged. Triangle A→B, A→C, B→C returns no inverse owner for A; adding B→A shows B once for either edge orientation.
- **M1 corrected:** test-only gateway fixtures now use seven independent local HTTP servers, each returning its own destination identity. Assertions cover all six domain destinations, all five Query agenda paths, relations and selector precedence, POST and attachment download. No production gateway mapping changed.

Only the seven committed owned files changed: `scripts/seed/seed.py`, `tests/integration/test_seed_preservation.py`, `tests/runtime/test_seed_projection.py`, `packages/api-client/src/index.ts`, `packages/api-client/test/client.test.ts`, `packages/ui/src/features/reference-picker.tsx`, and `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayRoutingTest.java`. This ignored SDD report is the requested evidence artifact. Marketing, styles, package configuration, Impeccable state, other documentation, and other backend source were left to the controller.

## Root cause and RED evidence

Systematic debugging traced seed's `projection.status` to Query's unresolved-reference count over the complete connected graph. A retained claim to a deleted target produces `pending` even when all live source versions have arrived. Inverse-link extraction flattened owners of all summary edges, including valid neighbor-to-neighbor boundary edges.

1. `python3 -m unittest discover -s tests/runtime -p test_seed_projection.py` against the original seed wait: 3 tests, 1 failure + 1 expected reproduction error. A caught-up pending graph timed out, and a Query 404 incorrectly skipped the live source (1 read rather than the expected 3). Log: `/tmp/openobec-final-fix-seed-unit-red.log`.
2. `python3 -m unittest discover -s tests/integration -p test_seed_preservation.py` against the original seed wait: 2 tests, 1 expected reproduction error, 6.550 seconds. The added regression created six records and attachments using an isolated `TARGET-<uuid>` prefix/temp manifest, deleted its first invoice TARGET through the normal source delete API, retained its owning contract and references, waited for actual Query `pending` with the unchanged/caught-up contract version, then reran real seed logic. It raised `Projection did not catch up` for the surviving connected component. Only the rerun failure deadline was shortened to 2 seconds; source/query/seed behavior remained real. Log: `/tmp/openobec-final-fix-seed-live-red.log`.
3. `pnpm test:frontend`: extracted the original owner-selection expression without changing its behavior; triangle regression failed with actual `[B]` versus expected `[]`. Suite: 20 passed, 1 failed. The subsequent root-incidence filter fixes this behavior. Log: `/tmp/openobec-final-fix-client-red.log`.
4. `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/api-gateway test -Dtest=GatewayRoutingTest`: destination assertions against the former shared stub failed as expected (5 tests, 2 failures: missing destination identity). Distinct stubs were then introduced. Log: `/tmp/openobec-final-fix-gateway-red.log`.

## GREEN verification

- `python3 -m unittest discover -s tests/runtime -p 'test_*.py'`: **6 passed**, 0.076 seconds, including caught-up pending graph, Query 404/stale root retry, null pending root retry, and initial caught-up owner whose seeded target still needs delivery. Log: `/tmp/openobec-final-fix-runtime-green.log`.
- `python3 -m unittest discover -s tests/integration -p test_seed_preservation.py`: **2 passed**, 3.659 seconds. Existing edited-invoice/deleted-owner regression remains green; new deleted-target regression verifies surviving contract DTO and reference list, attachment metadata, and manifest equality, target GET 404 and no replacement under its stable number. Log: `/tmp/openobec-final-fix-seed-live-green.log`.
- `pnpm test:frontend`: **21 passed**, 0 failed, latest duration 178.609 ms. Log: `/tmp/openobec-final-fix-client-green.log`.
- `pnpm typecheck`: **exit 0**, API client, shared UI, all three apps. Log: `/tmp/openobec-final-fix-typecheck.log`.
- `pnpm lint`: **exit 0**. Log: `/tmp/openobec-final-fix-lint.log`.
- `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl services/api-gateway test`: **BUILD SUCCESS, 8 tests, 0 failures, 0 errors, 0 skipped**, 10.755 seconds. Expected connection-close warning from the unchanged `GatewayPostRetryTest` fault scenario remains present; no warning suppression added. Log: `/tmp/openobec-final-fix-gateway-green.log`.
- `git diff --check` and staged diff check: **exit 0**. Only owned paths were staged and committed. No push or merge.

## State and limits

All live fixtures from both RED and GREEN preservation runs were logically deleted by ordinary source APIs in test cleanup; main demo targets and manifest were untouched. No direct database writes, Kafka reset, fabricated tombstones, service stop/rebuild, volume reset, or destructive cleanup occurred. All shell execution used the required escalated profile because the provided cwd aliases the physical Desktop checkout.

The controller owns final whole-branch builds, Docker refresh, rendered browser capture/triangle acceptance, and full integration acceptance. This wave establishes focused real-stack deletion/rerun behavior, client logic and static frontend checks, and gateway routing fixture behavior; it does not claim those controller-owned final checks or remote CI. No further review finding remains open within I1/I2/M1.
