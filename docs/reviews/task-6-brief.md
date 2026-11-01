### Task 6: Seed, rebuild and full acceptance

**Files:** `scripts/{seed,smoke,rebuild}/`, `tests/{integration,e2e}/`, `README.md`, `docs/runbook.md`, CI and verification report.

**Interfaces:** Seed uses existing REST and multipart API only, stable synthetic numbers, manifest of owned seed IDs, no user overwrite. Rebuild captures Kafka offsets before consistent source exports, projects into new generation, replays with entity-version checks and activates only verified result. Old snapshots remain immutable. No direct domain DB reads by consumer/query/rebuild.

- [ ] Write failing smoke for 12 records per agenda, two branches of links and actual PDF download; implement two-pass idempotent seed and projection readiness.
- [ ] Write failing recovery test covering export, concurrent event replay and deleted records; implement rebuild command and fault recovery procedure.
- [ ] Write Playwright tests for create + PDF + publish + citizen search, linked edit, unpublish, error retention and mobile navigation; run against whole stack.
- [ ] Verify Kafka outage/recovery, unknown reference 503 rollback, S3 failure retention, all 70 operation contract fixtures, >100 graph pagination, persistence after ordinary restart, host Java connection and all Docker images.
- [ ] Run one fresh whole-branch code review, fix Important/Critical findings with reproducing tests, document exact checks and resource use. Update every README with tested commands; final commit, keep branch for user review without merge/push.
