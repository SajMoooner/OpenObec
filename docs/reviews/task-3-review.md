### Fix Round 1 — Current Task Gate

**Spec compliance: Approved within Task 3 scope. Task quality: Approved.** All original findings are addressed in `f816428..4b198b3`; the original Cannot Verify items remain integration responsibilities, not open fix findings. The original review below is retained as history.

### Finding Verdicts

- **Q3-1 — Boundary-node unresolved claims: ADDRESSED.** `services/query-api/src/main/java/sk/openobec/query/QueryService.java:278` now counts each returned node's pending references before the depth cutoff at line 283. Edge expansion remains below the cutoff. `services/query-api/src/test/java/sk/openobec/query/QueryIntegrationTest.java:219` exercises a returned boundary node with both missing and projected outward targets, checks pending status/count against joined detail, checks that traversal remains bounded, and verifies ready status after the missing target arrives.
- **Q3-2 — Copied event fixture builder: ADDRESSED.** One test-only builder now lives at `libs/java/read-model/src/test/java/sk/openobec/read/fixtures/DocumentEvents.java:8`. The inline projector copy and application copies are removed; all four test classes import the shared builder at line 4. `libs/java/read-model/pom.xml:24` attaches only the fixture package at `process-test-classes`; `services/pairing-service/pom.xml:18` and `services/query-api/pom.xml:18` consume the classifier in test scope. This avoids production coupling and supports clean reactor test execution.
- **Q3-3 — Owned-suite Mockito/JDK warnings: ADDRESSED.** Each application's `src/test/resources/mockito-extensions/org.mockito.plugins.MockMaker:1` selects `mock-maker-proxy`, and `org.mockito.plugins.MemberAccessor:1` selects `member-accessor-reflection`. These suites use real infrastructure and no mocks; the configuration is restricted to test resources. Existing focused verification `/tmp/task3-review-noagent-focused.log:645`, `:709`, `:726` shows both covering tests passing and BUILD SUCCESS, and a read-only scan found zero self-attachment/dynamic-agent/CDS notices in that log.

### New Breakage in the Fix Diff

- None identified. The production change is the pending-count/cutoff reorder; the remaining changes are test-fixture sharing, test-only configuration, and documentation.

### Out-of-Scope Observations

- None newly identified. Controller-owned root registrations/Dockerfile changes, Task 6 runtime/bootstrap, and other-task source/attachment requirements retain the original review's Cannot Verify status and do not block this scoped fix gate.

### Checks

- Reviewed the appended fix report and supplied `review-f816428..4b198b3.diff`; recovered the genuinely truncated report tail/diff beginning from the same files. No source crawl, suite rerun, Git operation, subagent, or modification beyond this report.
- Existing regression evidence: `/tmp/task3-review-q31-red.log:163` shows expected pending versus actual ready, with BUILD FAILURE at `:193`; `/tmp/task3-review-q31-green.log:162` reports one passing test and `:178` BUILD SUCCESS.
- Existing full-run evidence: the appended report names the covering tests, commands, clean-reactor fixture check, 139-test full reactor result, and package result. `/tmp/task3-review-root-test.log:1085` and `:1150` confirm the affected pairing and ten-query-test suites pass; `:2238` reports BUILD SUCCESS. `/tmp/task3-review-package.log:417` reports BUILD SUCCESS. These are inspected prior execution records, not independently rerun tests.

### Verdict

**Fix round: All findings addressed, no new Critical/Important breakage. Task 3 gate: Approved.**

---

## Original Review (superseded by fix-round verdict above)

### Spec Compliance

- ❌ Issues found: the summary graph can report `ready` despite a known missing target referenced by a returned boundary node (Q3-1, `services/query-api/src/main/java/sk/openobec/query/QueryService.java:278`). The remaining inspected Task 3 behavior matches the brief.
- ⚠️ Cannot verify from this diff: preservation of all 46 source operations, the separate 24 attachment operations, source-side BigDecimal arithmetic and transactional outbox; these are unchanged or other-task responsibilities. Task 3 preserves source monetary strings (`libs/java/read-model/src/main/java/sk/openobec/read/ProjectionEngine.java:47`, `services/query-api/src/main/java/sk/openobec/query/QueryService.java:57`).
- ⚠️ Cannot verify from this diff: successful Docker runtime, genuine owner-service bootstrap and initial production-topic handoff. The report explicitly assigns these to Task 6; no production consumer has been started. Dockerfiles/manual scripts are present (`services/pairing-service/Dockerfile:1`, `services/query-api/Dockerfile:1`, both `run.sh:1`).
- ⚠️ Cannot verify a self-contained committed reactor from this task commit: the current root `pom.xml:27`–29 registers read-model/pairing/query, while the controller owns those unstaged registrations and gateway wiring. Preserve and commit them in the shared integration step. This is the coordinated dependency described by the report, not an unexpected omission.

### Strengths

- Full-state projection, owned-claim replacement, edge refresh and processed-event identity share a snapshot/majority transaction; version checks retain tombstones against older deliveries (`ProjectionStore.java:79`, `ProjectionEngine.java:29`, `ProjectionEngine.java:45`, under `libs/java/read-model/src/main/java/sk/openobec/read/`). The actual-Mongo rollback test checks that a late edge-write rejection leaves both the old record version and processed-marker count intact (`libs/java/read-model/src/test/java/sk/openobec/read/ProjectionIntegrationTest.java:151`).
- ACK follows the projection call, and DLQ recovery waits for broker confirmation before recovered offsets can commit (`services/pairing-service/src/main/java/sk/openobec/pairing/PairingListener.java:47`, `services/pairing-service/src/main/java/sk/openobec/pairing/KafkaConfiguration.java:51`). Broker tests exercise both actual Mongo rejection and failed DLQ publication (`services/pairing-service/src/test/java/sk/openobec/pairing/PairingKafkaIntegrationTest.java:122`, `:164`).
- Full connected-component snapshots use independent record/edge chunks and a single transaction; cursors bind request filters and verify signature before expiry (`services/query-api/src/main/java/sk/openobec/query/QueryService.java:427`, `:479`, `services/query-api/src/main/java/sk/openobec/query/CursorCodec.java:42`). The 105-related-record test checks stable continuation after source deletions, full root and incident edges (`services/query-api/src/test/java/sk/openobec/query/QueryIntegrationTest.java:217`).
- Read paths use only the shared read store; authoritative checks/export use tenant-bearing HTTP (`services/query-api/src/main/java/sk/openobec/query/QueryService.java:202`, `services/pairing-service/src/main/java/sk/openobec/pairing/RebuildRunner.java:190`). Rebuild captures offsets before exports and verifies exact handoff before activation (`RebuildRunner.java:61`, `:99`).

### Issues

#### Critical (Must Fix)

- None identified.

#### Important (Should Fix)

- **Q3-1 — Count unresolved claims for returned depth-boundary nodes.** `services/query-api/src/main/java/sk/openobec/query/QueryService.java:278` skips a dequeued node at the requested depth before the pending-reference count at lines 279–283. Example: projected A references projected B, and B references missing C. `/A/suvislosti?hlbka=1` returns A and B but reports `projection.status=ready` and zero unresolved references, although B has a known unresolved claim. The same component's joined detail correctly reports pending. Move pending counting before the depth cutoff (while still limiting expansion), and add this boundary regression. The current dangling-target test checks only a missing target directly owned by the root (`services/query-api/src/test/java/sk/openobec/query/QueryIntegrationTest.java:198`).

- **Q3-2 — Consolidate the copied full-event fixture builder.** The same approximately 60-line five-agenda event-construction logic appears in `services/pairing-service/src/test/java/sk/openobec/pairing/TestEvents.java:8`, `services/query-api/src/test/java/sk/openobec/query/TestEvents.java:8`, and `libs/java/read-model/src/test/java/sk/openobec/read/ProjectionIntegrationTest.java:33`. All three encode business field defaults, type switching, tombstone fields and envelope construction. Changes to the event contract can drift independently between the integration suites. Provide one test-only fixture utility (for example, a read-model test artifact consumed by the two application test scopes) and leave scenario-specific changes in each test. Severity follows the supplied reviewer rubric's explicit treatment of verbatim duplicated logic as Important; no production abstraction is needed.

#### Minor (Nice to Have)

- **Q3-3 — Clean up known test-run noise.** `/tmp/task3-final-root.log:784` and `:1168` show Mockito self-attachment notices, with dynamic-agent warnings at `:792`–795 and `:1170`–1173 during the owned pairing/query suites. Both services introduce `spring-boot-starter-test` (`services/pairing-service/pom.xml:18`, `services/query-api/pom.xml:18`). Configure test tooling explicitly or avoid unnecessary inline-mock initialization so successful output is clean. Expected fault-injection diagnostics may remain deliberately scoped; these warnings do not contradict the successful assertions.

### Checks and Evidence

- Read requirements/report first, then the supplied `review-2cf0577..f816428.diff`. The initial tool output was genuinely truncated; recovered the omitted middle in bounded diff-file ranges. No changed source file was separately read and no tests or Git commands were rerun.
- Named risk: the custom schema walker does not itself interpret general JSON Schema composition. Checked `contracts/events/document-event.schema.json` against its branch selection and existing `libs/java/event-contracts/src/main/java/sk/openobec/events/DocumentEvent.java:19`. For the current schema, agenda branch checks plus constructor identity/tombstone checks cover the relevant `oneOf` and `allOf` rules; no additional validator finding.
- Named risk: generic Query serializers/defaults could diverge from the frozen API. Checked the relevant `contracts/openapi.yaml:10458`–10648 response definitions and `:10850`–10930 parameters, plus existing `libs/java/common-api/src/main/java/sk/openobec/common/ListQuery.java:6`. Joined/pending/summary/selector shapes and page/depth defaults match the inspected contract.
- Named risk: Task 3 build depends on controller-owned root registrations. Focused check of current `pom.xml:27`–29 confirms all three registrations exist; no Git inspection or mutation performed.
- Read existing final test evidence: `/tmp/task3-final-root.log:143`, `:572`, `:1100`, `:1180`, `:1182` report the 18 Task 3 tests passing with zero failures/errors/skips; `:2321` reports BUILD SUCCESS. This is existing implementer-run evidence, not a fresh independent execution.

### Assessment

**Task quality: Needs fixes.**

**Reasoning:** The transactional projector, confirmed DLQ path and immutable graph pagination are well structured and backed by real-infrastructure tests. Correct the summary boundary pending-state bug and consolidate the duplicated event fixtures before accepting this task; retain Task 6 runtime/bootstrap checks as explicit integration work.
