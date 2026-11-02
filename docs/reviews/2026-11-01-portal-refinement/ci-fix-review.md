# Scoped CI readiness review

Reviewed immutable package `review-2fa3338..41f7d79.diff`, brief, implementation report, supplied first-failure log, and corresponding checked-out source. HEAD is `41f7d79567b4b1235f909042bf9420297bcb278f`. The commit changes only `scripts/dev/infra.sh`, `scripts/dev/wait_init.py`, and `tests/runtime/test_infra_readiness.py`.

Spec compliance: **PASS**. Code quality: **PASS**. No actionable findings or severity/file:line findings in the authorized three-file scope.

## Reviewed behavior

- `scripts/dev/wait_init.py:20` queries stopped as well as running containers and parses both JSON arrays and JSON Lines. It no longer depends on Compose `wait` selecting an already-completed job. Success requires both expected services, one row each, in `exited` state with an integer zero exit code.
- `scripts/dev/wait_init.py:25` rejects duplicate and unexpected service rows. Missing jobs fail immediately with their names. Malformed JSON, missing status, and invalid exit-code types fail closed. A failed exited job or dead job aborts even while its peer remains running.
- `scripts/dev/wait_init.py:12` uses one monotonic deadline. Each Docker query receives only its remaining time; pending-state sleeps are capped by that same remaining time. Repeated nonterminal states cannot restart the deadline. Docker process errors and timeout exceptions propagate, with stderr inherited rather than hidden or reclassified as successful initialization.
- `scripts/dev/infra.sh:31` invokes the helper with the same absolute Compose file, working directory, project name, and inherited resolved environment. Existing `set -e` makes helper failures stop startup. `scripts/dev/stack.py:183` remains the shared manual/Docker startup path. Credentials, volumes, init scripts, backend/frontend/seed/API behavior, and workflow checks are unchanged by this commit.

## Evidence and limits

The supplied log confirms both init containers started before daemon health completed, followed by the previous Compose `wait` failure. It does not establish their actual exit codes or the runner's exact Compose version. This repair appropriately inspects the real exit statuses instead of assuming those earlier jobs succeeded.

The test source meaningfully exercises the actual shell launcher for the original already-exited regression in both output formats, then production helper decisions for transitions, either job failing with a running peer, dead/missing/duplicate jobs, nonterminal deadline exhaustion, per-command remaining timeout, preserved Docker failures/timeouts, malformed JSON, and missing exit code. Only Docker I/O and elapsed time are substituted in helper tests. The implementation report records test-first failures and passing focused 11, runtime 19, contracts 12, Compose configuration, syntax, and whitespace checks.

No suites were rerun during this read-only review: no concrete uncovered doubt required an additional focused test. The report's execution evidence is distinguished from this review's source inspection. Docker daemon is unavailable locally, so this verdict is scoped source/test approval; the next fresh remote CI run remains the actual live startup proof. No unrelated user changes or research files were modified.
