# Final whole-branch review

Reviewed base `58a6646` (main) through head `f66a124`, using the supplied authoritative `review-58a6646..f66a124.diff` package and the current authored source. Requirements: approved design including the superseding shadcn/Geist amendment, PRODUCT.md, and all six implementation-plan tasks.

## Strengths

- The source/write and derived/read boundaries are coherent. Concrete agenda definitions validate merged state, `RecordStore` commits source/audit/outbox together, compare-and-set retries reread current state, and the publisher marks an event sent only after the Kafka acknowledgement. VZN remains outside the event/read graph.
- Attachments use private S3 keys, bounded streamed uploads, content/signature checks, ownership checks, and careful compensation. In particular, an indeterminate Mongo commit does not cause deletion of a potentially committed attachment's bytes.
- Projection uses full snapshots, event and entity-version deduplication, retained tombstones, independently owned canonical edges, and one transactional writer fence. Public traversal filters intermediate nodes and nested own references. Joined continuations use immutable full-component snapshots with signed, bound, independently expiring cursors.
- The executable rebuild captures offsets before HTTP owner exports, reuses the projection engine, verifies exported versions/edge endpoints, hands off offsets with the consumer stopped, and gates Query through activation. Ordinary startup/shutdown preserves volumes; the Docker and manual environment translations and runtime browser URLs are wired consistently.
- Portals call the real APIs, expose partial search failure and bounded projection polling, retain form/file state after errors, and verify public attachment publication at the owner. The recent procurement deadline correction preserves the original instant on unrelated edits.

## Issues

### Critical (Must Fix)

None identified.

### Important (Should Fix)

**I1 — A valid deletion of a linked seed target makes subsequent normal startup fail.**

- Location: `scripts/seed/seed.py:88`; integration call site `scripts/dev/stack.py:220`; relevant projection behavior `libs/java/read-model/src/main/java/sk/openobec/read/ProjectionEngine.java:121`.
- Trigger: start the seeded demo, delete the first seeded invoice (or another target of a surviving seeded contract), then rerun seed or the documented normal `up` command. Logical deletion deliberately retains other documents' own reference claims. `refreshPair` records the surviving contract's reference to the tombstone as pending. Its source and projected entity versions can be equal and all events delivered, yet its joined projection remains `pending`.
- Effect: `wait_projection` requires `status == ready` as well as a caught-up version, so it times out after 90 seconds and makes `up` exit unsuccessfully. This contradicts the promised normal restart and preservation of user deletions. It does not lose data, but it reports a healthy, fully caught-up demo as unable to start after an ordinary supported action.
- Fix: distinguish source-version delivery from graph unresolved-reference status in seed readiness. Accept a caught-up root when retained links point to authoritatively deleted/unavailable targets, while preserving the initial seed completeness check and never rewriting the user's references. Add a regression that deletes a **target**, keeps the owning contract, and reruns seed/startup; the existing preservation test deletes the owning contract and misses this case.
- Evidence: traced the actual projection/readiness paths and ran a read-only, in-memory focused reproduction against the real `wait_projection` function with equal source/query version 2 and one retained missing target. It deterministically raised `Projection did not catch up`. No live records or runtime state were changed.

**I2 — The editor labels neighbor-to-neighbor links as inverse links to the edited document.**

- Location: `packages/ui/src/features/reference-picker.tsx:225` (especially line 227); summary contract implementation `services/query-api/src/main/java/sk/openobec/query/QueryService.java:313`.
- Trigger: contract A owns links to order B and invoice C; B also owns a link to C; neither B nor C references A. The depth-1 summary correctly includes all edges among returned nodes, including B–C. `InverseLinks` flattens every edge's owners and merely excludes A, so B appears under “Spätné súvislosti” while editing A.
- Effect: the office UI incorrectly tells the user that another document owns an incoming relationship to A and directs them to edit B to change it. This violates the explicit own-versus-inverse relationship distinction and misrepresents the actual graph.
- Fix: first restrict summary edges to those incident to `{typ: agenda, id}`, then retain only their owners other than the root and deduplicate. Keep boundary edges in the Query response; they are correct there. Add a triangle regression proving a B→C edge alone is not an inverse reference to A, and that a genuine B→A claim is shown.
- Evidence: inspected the producer and consumer of this graph response and evaluated the current extraction expression against that triangle in memory. It returned B despite zero incoming claims to A. No browser or data mutation was needed to establish this deterministic error.

### Minor (Nice to Have)

**M1 — Gateway route tests cannot distinguish seven upstream destinations (retained deferred item).**

- Location: `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayRoutingTest.java:51` and `:77`.
- Every owner and Query URL points to the same stub. Path/header assertions would pass if a valid Query path were sent to the wrong service.
- Action: give the upstreams distinct response identities or stubs and assert destination as well as forwarded path. Production route mapping and Compose destination URLs are correct on inspection, and the recorded real-stack 70-operation checks provide complementary integration evidence; this remains nonblocking test coverage debt.

## Deferred-item disposition

- Gateway destination test coverage: retained as nonblocking M1 above.
- Intentional failure-test warning noise: accepted as documented diagnostic output, not a production defect or a failed test. `docs/verification.md` explicitly explains it, and the inspected final Java log ends in `BUILD SUCCESS`. Optional future fixture-specific log capture may improve readability; broad warning suppression is not recommended.
- Earlier frontend error-normalization/documentation notes: the current API client parses malformed envelopes into `ApiError`, and the current app documentation describes the demo entry honestly. No additional finding raised.

## Review coverage and limits

Reviewed in bounded passes: requirement and full-package change map; source definitions/storage/files/export/outbox; event validation/projector/query/cursors/rebuild; gateway/runtime/Compose and launch instructions; server adapters, forms, links, publication, search/list/dashboard and attachments; pertinent regression/test code and recorded acceptance evidence. Generated OpenAPI/TypeScript declarations, lockfile mechanics, stock shadcn components, and large Impeccable measurements were not audited line-by-line. The authored cross-service implementations, not earlier approvals alone, drove the findings.

The final Java log was inspected for successful completion, and the recorded final contracts/browser/smoke outputs show 12, 25 (24.4 s), and 4 passing tests respectively. The supplied final context and verification report record 148 passing Java tests, 2 runtime checks, 20 client tests, three host/Docker portal builds, complete manual/Docker startup, persistence, and real Kafka/S3/owner-failure/rebuild evidence. I did not rerun those unchanged suites, restart services, mutate data, rederive a Git diff, or repeat visual/detector review. The two focused reproductions were ephemeral logic checks only, not substitutes for the requested regression tests after correction. I relied on the already completed visual review for visual fidelity and on the recorded logs for runtime/build claims. This review cannot establish a remote CI run or production capacity/security.

## Declined to judge

- Production authentication, roles, TLS and multi-user authorization: explicitly excluded by the approved localhost demo scope; the demo-entry button is not presented as a security boundary.
- Multi-municipality behavior: the approved implementation is deliberately fixed to `zilina`.
- Real city IS connections, external registry publication, intelligent search, automated anonymization and legal deadline/compliance guarantees: explicitly outside the approved functional scope.
- Production throughput, high availability and large-municipality operating capacity: the agreed acceptance target is a measured local demo, not a production service-level commitment.

## Assessment

**Ready to merge? With fixes — not yet approved.**

The architecture and principal data guarantees are substantially implemented and supported by extensive existing verification. Correct I1 and I2 and add their focused regressions before final approval; M1 can remain documented nonblocking debt. No Critical issue or additional material defect was identified in the reviewed paths.


---

# Scoped final fix re-review — authoritative disposition at `5f24195`

This appended assessment supersedes the earlier “With fixes” verdict for the original implementation and its complete I1/I2/M1 fix wave. Reviewed only the supplied `f66a124..5f24195` package and `final-fix-report.md`, following the scoped re-review template. The user's subsequent marketing-home width/information revision is outside this range and remains a separate review gate.

## Finding verdicts

- **I1 — Deleted linked seed target breaks normal startup: ADDRESSED.** `scripts/seed/seed.py:88` now treats only an authoritative source 404 as a preserved deletion; `:99` requires a non-null Query root whose version has caught up, independently of graph pending status. Query 404/null/stale roots continue waiting (`:95`, `:102`). Every live manifest record, including initial linked targets, remains in the delivery check. The real API regression at `tests/integration/test_seed_preservation.py:49` deletes the target, retains the owning contract, verifies actual pending state, reruns seed successfully, and asserts unchanged source DTO, references, attachment metadata and manifest. `tests/runtime/test_seed_projection.py:28` and `:52` guard against bypassing still-undelivered roots/initial targets.
- **I2 — False inverse links from boundary edges: ADDRESSED.** `packages/api-client/src/index.ts:35` filters edges to those incident to the exact root type/ID before extracting non-root owners and deduplicating. The actual editor calls this helper at `packages/ui/src/features/reference-picker.tsx:230`. The regression at `packages/api-client/test/client.test.ts:202` excludes the neighbor-only triangle claim and includes a genuine incoming claim exactly once under either endpoint orientation. Query's valid boundary-edge behavior is unchanged.
- **M1 — Indistinguishable gateway destination fixtures: ADDRESSED.** `services/api-gateway/src/test/java/sk/openobec/gateway/GatewayRoutingTest.java:18` creates seven distinct upstream servers. Destination assertions at `:113`, `:133` and `:143` cover the configured owner/Query read destinations, selector/relations, POST and attachment download. This is test-only; production routes are unchanged.

## New breakage in the fix diff

None identified. The seed change preserves a delivery wait rather than replacing it with unconditional success; the inverse helper preserves true incoming owners and root identity; the independent stubs are all stopped after the tests.

## Checks and evidence

Read the full seven-file fix diff once, the fix report, and recorded GREEN output: 6 runtime checks (`/tmp/openobec-final-fix-runtime-green.log`), 2 live preservation checks (`/tmp/openobec-final-fix-seed-live-green.log`), 21 client tests (`/tmp/openobec-final-fix-client-green.log`), and 8 gateway tests with BUILD SUCCESS (`/tmp/openobec-final-fix-gateway-green.log`). The report names the defect-specific RED runs and successful typecheck/lint runs; the new tests' assertions match the defects and amended behavior. No test suite was rerun, no Git operation was performed, and no source/runtime/data was mutated. Only this review appendix was written.

## Out-of-scope observations

None. The separately requested marketing revision was not inspected or judged in this fix re-review. The original declined-to-judge list and evidence limitations remain applicable.

## Authoritative verdict

**Fix round: All findings addressed, no new Critical/Important breakage.**

**Original implementation plus final fix wave: Spec compliance APPROVED; code quality APPROVED at `5f24195`.** No review finding remains open from I1/I2/M1. Expected fault-test warning noise remains accepted as documented. This approval closes the original whole-branch code-review gate; it does not approve the later marketing revision or claim fresh final builds/browser checks or a remote CI run.
