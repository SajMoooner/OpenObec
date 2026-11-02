# CI initialization-readiness repair

Base: `2fa3338`. Implementation commit: `41f7d79` (`fix(dev): inspect completed infrastructure init jobs`). One scoped startup repair; no push performed.

## Root cause and evidence

The supplied `ci-first-failure.log` records run `41404577570`. Both init containers were created and started: `rustfs-init` at `07:11:51.8766292Z`, `kafka-init` at `07:11:53.0668695Z`. All nine daemon health checks completed by `07:11:58.3508821Z`. The next operation at `07:11:58.4507293Z` failed with `no containers for project "openobec"`; its traceback identifies `docker compose ... wait kafka-init rustfs-init` returning 1.

The existing script started everything, waited separately for daemon health, then invoked Compose `wait` before its `ps -a` exit-code validation. Older Compose `wait` selects only running containers: [official v2.39.4 wait.go](https://github.com/docker/compose/blob/v2.39.4/pkg/compose/wait.go#L24-L30) passes `all=false` to container discovery, and [containers.go](https://github.com/docker/compose/blob/v2.39.4/pkg/compose/containers.go#L39-L45) forwards that as Docker's `ListOptions.All`. Therefore jobs that finish during daemon health checks disappear from the wait selection, causing the exact observed error before our validation can inspect them. Current Compose main includes an explicit exited-container fallback, further identifying the compatibility boundary; this repair does not require that newer behavior.

The exact runner Compose version and init exit codes were not printed in the supplied log. The log alone cannot establish successful init exit codes; the repair explicitly checks them rather than treating the old wait failure as success. [Docker's ps reference](https://docs.docker.com/reference/cli/docker/compose/ps/) documents `--all` for stopped containers and the JSON state/exit-code fields.

## Change

- `scripts/dev/infra.sh` invokes a small standard-library helper instead of the inline `compose wait` and subsequent single snapshot assertion.
- `scripts/dev/wait_init.py` polls `docker compose -p openobec -f <same compose.yaml> ps -a --format json kafka-init rustfs-init`. It accepts both JSON arrays and JSON Lines, including already-exited successful jobs, and succeeds only with exactly one named container for each required job, both exited with integer exit code 0.
- Missing/duplicate/unexpected jobs, dead containers, invalid exit status, and nonzero exited jobs fail immediately. A failed job is detected even if its peer is still running. Nonterminal states share one 240-second monotonic deadline, including per-command timeouts and bounded poll sleeps. Docker subprocess failures and timeouts propagate unchanged with their original details; stderr remains visible. There is no error-swallowing retry or `wait`-error success fallback.
- Both manual and Docker launch modes already call `infra.sh`; no other launch path changed. Credentials remain resolved through the existing service-owned Compose environment. No configuration, volumes, initialization scripts, data, Java, frontend, CI workflow, repository settings, or user research files changed.

## Regression evidence (test first)

1. Before modifying production behavior, ran `python3 -m unittest discover -s tests/runtime -p test_infra_readiness.py -v` against the original shell script. Result: `Ran 1 test in 0.935s`, `FAILED (failures=2)`: both JSON array and JSON Lines subcases failed with the exact `no containers for project "openobec"` error. The fixture runs the actual shell launcher and stubs only Docker, modeling the documented older selection behavior.
2. Extracted the existing wait/check block without changing its behavior, then added all readiness cases before implementing the new polling behavior. Same command: `Ran 11 tests in 0.718s`, `FAILED (failures=6, errors=9)`. Transitions and nonterminal states hit the old immediate `SystemExit`; missing jobs hit the old assertion; duplicate rows incorrectly succeeded. Tests for propagation of existing Docker failures and malformed JSON already passed, preserving those behaviors.
3. Implemented the polling repair. Same focused command: `Ran 11 tests in 1.290s`, `OK`.

The 11 tests cover the real full-shell success path in both output formats, created/running to completion with reordered results, either init job failing while its peer runs, dead state, empty/partial missing jobs, duplicate service rows, bounded created/running/restarting/paused states, remaining-deadline subprocess timeouts, unchanged Docker error/timeout objects, malformed JSON, and missing exit code. Docker I/O and clock are the only unit-test substitutes; readiness decisions execute the production helper.

## Final checks and exact outcomes

- `python3 -m unittest discover -s tests/runtime -v` — final rerun: `Ran 19 tests in 0.848s`, `OK` (exit 0). An initial restricted run had 2 errors: `test_renamed_node_process_is_stopped_and_releases_its_port` and `test_closed_reusable_listener_does_not_block_immediate_restart`, both `PermissionError: [Errno 1] Operation not permitted` while binding temporary local ports. An approved rerun allowing those test ports passed all 19; no production change was made to address the restriction.
- `python3 -m unittest discover -s tests/contracts -v` — `Ran 12 tests in 4.282s`, `OK` (exit 0), including all three real-Compose infrastructure credential-resolution checks.
- `bash -n scripts/dev/infra.sh scripts/dev/up.sh scripts/dev/down.sh scripts/dev/doctor.sh` — no output, exit 0.
- `PYTHONPYCACHEPREFIX=/private/tmp/openobec-ci-pycache python3 -m py_compile scripts/dev/wait_init.py tests/runtime/test_infra_readiness.py` — no output, exit 0. Initial compilation without the override failed because the macOS Python cache path was outside writable roots; the temporary-cache rerun passed.
- `docker compose -p openobec -f compose.yaml config --quiet` — no output, exit 0.
- `docker compose -p openobec -f compose.yaml -f compose.apps.yaml config --quiet` — no output, exit 0.
- `git diff --check` — no output, exit 0.

## Validation limits and handoff

Local `docker compose version`: `Docker Compose version v5.1.4`. Local `docker info` cannot connect because the Docker socket is absent; Docker Desktop was not started and no existing services or volumes were touched. There is no local live-container proof and no claim that GitHub CI has passed. Controller must independently review, push the scoped commit, and inspect the next actual fresh CI run. Unrelated frontend, browser, Java, and network integration suites were intentionally outside this repair's authorized validation scope.

Only implementation/test files are committed. This ignored task report remains in the workspace for the controller to archive. Controller-authored public plan/evidence documents and the three root research files remain outside the implementation commit.
