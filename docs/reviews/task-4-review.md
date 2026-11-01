### Spec Compliance

- ✅ **Spec compliant for the Task 4 gate.** The explicit route set totals 70 operations (one selector + 15 query/relations + 54 owner/file operations), keeps Query routes separate from owner routes, and provides no internal-export route (`services/api-gateway/src/main/java/sk/openobec/gateway/GatewayRoutes.java:21`, `:45`). Municipality enforcement, request identity normalization, 429/Retry-After, bounded limiter state, streamed body limits, and connection/response timeouts are implemented (`services/api-gateway/src/main/java/sk/openobec/gateway/GatewayWebFilter.java:29`, `:52`, `:64`, `:79`; `services/api-gateway/src/main/java/sk/openobec/gateway/WindowLimiter.java:24`; `services/api-gateway/src/main/resources/application.yml:10`).
- ✅ Runtime wiring uses the required ports and owning Mongo databases, with Query and Pairing configured for the shared read database; host publication is loopback-only (`compose.apps.yaml:24`, `:267`, `:313`, `:359`). Each Java Dockerfile has pinned base images, an independent module build, the shared health probe, and UID10001 (representative: `services/api-gateway/Dockerfile:1`, `:8`, `:13`). Manual and Docker launch paths, readiness checks, first-generation rebuild ordering, diagnostics, volume-preserving down, and an explicit reset flag are present (`scripts/dev/stack.py:117`, `:181`, `:231`, `:236`; `scripts/dev/reset.sh:4`).
- ⚠️ **Cannot verify from this diff:** Task 3's authoritative HTTP export/captured-offset rebuild internals and all existing business/schema behavior are unchanged outside this patch. The new launcher invokes rebuild before starting the normal consumer, but its correctness depends on that earlier implementation (`scripts/dev/stack.py:189`, `:210`). Keep the earlier Task 3 gate as a prerequisite.
- ⚠️ **Cross-task dependency:** the overlay and manual launcher reference Task 5's three Next applications and Dockerfiles, which are absent from this diff (`compose.apps.yaml:408`, `:438`, `:468`; `scripts/dev/stack.py:215`). Existing workspace runtime evidence supports the integration; a checkout of this head alone does not establish the final frontend delivery. Task 5 source/visual approval and Task 6 combined verification remain separate gates (`.superpowers/sdd/2026-11-01-openobec-implementation/task-4-report.md:24`).

### Strengths

- Automatic Reactor Netty retry is explicitly disabled, and a real TCP-reset regression asserts exactly one POST connection attempt (`services/api-gateway/src/main/java/sk/openobec/gateway/GatewayRoutes.java:14`; `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayPostRetryTest.java:56`).
- Request identity is request-local rather than thread-local, is reused across async dispatch and error handling, and is normalized to one response header at gateway commit. Tests exercise real ECS output as well as async file bytes and failures before interceptor completion (`libs/java/common-api/src/main/java/sk/openobec/common/RequestDiagnosticsInterceptor.java:19`, `:48`; `libs/java/common-api/src/test/java/sk/openobec/common/RequestDiagnosticsTest.java:130`; `libs/java/common-api/src/test/java/sk/openobec/common/StructuredRequestLoggingTest.java:26`; `services/api-gateway/src/main/java/sk/openobec/gateway/GatewayWebFilter.java:52`).
- Manual process ownership tracks PID plus start time, and ordinary shutdown never adds the destructive volume option. Reset is explicitly gated and project-scoped (`scripts/dev/stack.py:44`, `:78`, `:234`; `scripts/dev/reset.sh:4`, `:13`).

### Issues

#### Critical (Must Fix)

- None identified in the reviewed Task 4 patch.

#### Important (Should Fix)

- None identified in the reviewed Task 4 patch.

#### Minor (Nice to Have)

- **M1 — Route tests cannot distinguish the destination service.** `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayRoutingTest.java:51` assigns all seven upstream properties to the same HTTP server. The assertions at `:77` verify path/header forwarding but would still pass if a Query route were accidentally sent to an owner. Use distinguishable query/owner stubs or responses and assert the selected destination. The production mapping is correct on inspection, so this is a coverage weakness rather than a blocking routing defect.
- **M2 — Expected failure tests leave warning noise in successful output.** `/tmp/openobec-header-dedup-green.log:64` contains the intentionally induced Reactor Netty connection-reset warning from `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayPostRetryTest.java:56`. The full-reactor run also records expected invalid-topic and unavailable-broker warnings (`/tmp/openobec-task4-identity-verify.log:720`, `:1104`). Capture/assert the intentional diagnostics or suppress only the expected fixture logger during those tests, preserving unexpected warnings. This does not contradict the passing test counts or show a runtime failure.

### Checks and Evidence

- Reviewed the supplied two-commit diff, requirements, and both implementation reports. Recovered only the Compose section truncated by the first tool response; no changed source file was separately opened. Exact citation locations were extracted mechanically from the diff. No unrelated source inspection, git commands, test reruns, runtime stops, resets, or source edits were performed; only this review report was written.
- Existing full-reactor summaries total **148 tests, zero failures/errors/skips**; final gateway evidence reports **8 passing tests** and successful packaging (`/tmp/openobec-task4-identity-verify.log:1966`; `/tmp/openobec-header-dedup-green.log:134`, `:170`). Existing runtime and contract results show **2** and **12** passing tests respectively (`/tmp/openobec-runtime-green.log:5`; `/tmp/openobec-final-contracts.log:15`).
- Existing manual readiness plus five browser checks and Docker readiness across all 12 applications were inspected (`/tmp/openobec-manual-full-up.log:57`; `/tmp/openobec-manual-e2e.log:11`; `/tmp/openobec-docker-trace-build-up.log:2193`). Seven saved API samples each show HTTP200 and exactly one supplied request ID (`.run/request-identity-proof.json:1`).
- Saved persistence proof records **72 unchanged documents**, the original PDF SHA256, and a valid pre-restart signed cursor; restart reached readiness (`.run/persistence-proof.json:2`; `/tmp/openobec-persistence-final-up.log:396`). This verifies recorded evidence, not an independently repeated restart.

### Assessment

**Task quality: Approved.**

The Task 4 implementation has no identified material defect, and its recorded verification supports the gateway/runtime behavior. Approval is scoped to this task and retains the explicit Task 3 and Task 5 dependencies above; M1 and M2 are nonblocking improvements.
