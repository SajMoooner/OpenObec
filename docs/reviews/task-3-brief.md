### Task 3: Pairing and Query API

**Files:** `services/{pairing-service,query-api}/`, shared event/schema imports only, projection/query tests.

**Interfaces:** Consumes Task 2 Kafka event and domain detail REST. Shared read collections `records`, `reference_claims`, `edges`, `processed_events`, `pending_references`, `query_snapshots`, `query_snapshot_chunks`, `projection_metadata`. Projected records retain full source payload; keys include municipality/type/id; no direct domain DB reads. Query provides all 16 existing query/selector/relations operations. `projection` wrapper and `data` shapes match API snapshot. Query snapshot HMAC key from `QUERY_CURSOR_SECRET`.

- [ ] Write failing projector tests for duplicate/event ordering/delete, late target, both owners and reference replacement. Implement full-state atomic projector with ACK after Mongo commit, retry and confirmed DLQ publishing.
- [ ] Write failing graph tests for all five roots, cycles, two owners, hidden intermediates and dangling targets. Implement bidirectional traversal and visible full-record serialization.
- [ ] Write failing query tests for page/sort/q validation, all selector type combinations, summary graph depth/100-node limit, pending-root 202/404/503 behavior.
- [ ] Write failing cursor tests with 105 related documents, stable snapshot across edits, full root each page, incident edges, bound filters, signature rejection, expiry 410 even after snapshot cleanup. Implement transaction-consistent chunked snapshots and HMAC cursors.
- [ ] Add Dockerfiles, manual launch and READMEs; run unit + actual Mongo/Kafka integration tests, commit task files.
