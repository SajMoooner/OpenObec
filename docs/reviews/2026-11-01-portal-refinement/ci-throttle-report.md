# Clean-CI seed transport throttling repair

Base: `e65d6a9`. Focused implementation commit: `aaeb130` (`fix(seed): retry explicit gateway rate-limit rejections`). No push performed.

## Root cause and source evidence

The supplied `ci-second-failure.log` records CI run `41406073384`: infrastructure, contracts, runtime, Java, frontend checks, full manual startup and initial seed passed. Smoke validated 70 concrete HTTP operations and seed acceptance/preservation before `LiveRefreshPreservation.test_owned_refresh_preserves_edit_delete_extra_and_ordinary_rerun` failed with HTTP 429. Its stack points from `refresh.refresh` through `refresh.inspect` to the single `urllib.request.urlopen` in `seed.request`. The finally-cleanup POST then failed with the same status. The existing client failed immediately on 429 and left the terminal error available to its caller.

Source investigation established why explicit 429 mutation retries are safe in this repository:

- `services/api-gateway/src/main/java/sk/openobec/gateway/GatewayWebFilter.java`, lines 33–35 and 69–78: this highest-precedence filter obtains the peer limiter result and returns the contract `RATE_LIMITED` 429 plus `Retry-After` before body decoration or the final `chain.filter` call. The owner service has not processed the rejected request.
- `services/api-gateway/src/main/java/sk/openobec/gateway/WindowLimiter.java`, lines 24–35: a bounded direct-peer bucket admits 1200 requests per fixed minute under the unchanged default configuration; rejected requests receive the rounded-up number of seconds until the next window, from 1 through 60. Forwarded client headers do not bypass the bucket. Rejected requests do not consume an additional admitted slot.
- `services/api-gateway/src/main/resources/application.yml` retains `GATEWAY_RATE_LIMIT:1200` unchanged.
- A repository search for `429`, `TOO_MANY_REQUESTS`, `RATE_LIMITED`, and `retryAfter` found no other service producer of HTTP 429. Existing `GatewayFailureTest` also exercises a POST rejected with 429 after two admitted requests fail upstream.

Transport audit: `scripts/seed/seed.py::request` is the only `urlopen` boundary in `scripts/seed`. Initial creation, reads, updates, attachment listing/deletion, projection polling, and owned cleanup use it. `seed.upload` constructs buffered multipart bytes and delegates to `request`; binary PDF GET/downloads also use that function. Every refresh request in `scripts/seed/refresh.py`, including `inspect`, upload, updates and retirement, delegates to those seed functions. PDF generation has no gateway transport. No separate upload/download retry implementation is needed.

## Implemented behavior

Only `scripts/seed/seed.py` and `tests/runtime/test_seed_transport.py` are committed.

- A small stdlib `open_request` wrapper retries only an `HTTPError` with code 429 from opening the request. At most three attempts are made.
- Valid `Retry-After` integer seconds and HTTP dates are honored when the remaining delay is at most 60 seconds, including a legitimate zero delay. This covers the gateway's entire actual fixed window. Missing/malformed headers use 1-second and then 2-second fallback waits.
- A valid delay above 60 seconds terminates immediately with the original error rather than retrying earlier than the server requested. Across the two possible retries, intentional sleep is bounded to 120 seconds. Each opening retains the preexisting 30-second timeout.
- Each retried POST reuses the same already-buffered request body, method, URL and headers. Multipart boundaries and bytes remain identical between attempts.
- Connection failures, timeouts, reset connections, 5xx responses, and other HTTP statuses are never retried. Reading/parsing a successful response stays outside the retry loop, so a possibly committed mutation with a lost response body is never blindly repeated.
- Only discarded 429 errors are closed. The final original HTTPError object remains open and unchanged, preserving URL, code, reason, response headers and readable body for normal caller handling. Successful responses retain the existing request context manager lifecycle.
- No gateway changes, new dependency, manifest/default-data change, fixture edit, reset, skip, readiness/UI modification or unrelated service operation was made. Controller documentation and the three root research files remain untouched.

## RED/GREEN and checks

The first tests were written before production edits. Real `seed.request`/`seed.upload` decisions were exercised with deterministic substitutes only for the external `urlopen`, sleep and wall clock boundaries; responses used actual `HTTPError`, message headers and buffered readable objects.

1. RED: `.tools/venv/bin/python -m unittest discover -s tests/runtime -p test_seed_transport.py -v`
   - Exit 1 before implementation: 8 test methods, 6 assertion failures and 5 errors across subcases. Expected recovery paths surfaced the original unhandled HTTP 429; bounded retry cases showed the first error rather than the final attempt. Existing terminal-error/no-ambiguous-retry paths already passed. This confirmed the missing retry behavior rather than a test import/setup failure.
2. GREEN: same command after the focused implementation.
   - Exit 0, all 8 test methods passed. Coverage includes explicit POST recovery with identical payload, Retry-After 60/0/date, malformed/missing header fallback, repeated valid throttling exhaustion, excessive integer/date rejection, original final error details/lifecycle, unrelated 400/404/409/500/503, ambiguous mutation transport failures, lost successful response body, multipart upload and binary download recovery.
3. `.tools/venv/bin/python -m unittest discover -s tests/runtime -v`
   - Initial restricted run: 27 tests, 25 passed, two existing process tests failed to bind loopback ports with `PermissionError: [Errno 1] Operation not permitted`: `test_renamed_node_process_is_stopped_and_releases_its_port` and `test_closed_reusable_listener_does_not_block_immediate_restart`. An existing socket ResourceWarning accompanied this permission failure.
   - Reran the exact complete command with approved permission for temporary local socket/process tests: exit 0, **27/27 passed**, including those two tests. No runtime case was skipped.
4. `.tools/venv/bin/python -m unittest discover -s tests/contracts -v`
   - Exit 0, **12/12 passed**, including the infrastructure configuration checks.
5. `PYTHONPATH=tests/integration .tools/venv/bin/python -m unittest test_seed_refresh.RefreshTests test_rebuild_command -v`
   - Exit 0, **8/8 passed**: all seven existing offline refresh preservation/resumption tests plus rebuild help. These cover user field/relation/PDF edits, extra attachments, stable identities, interruption after upload/remote update and safe reruns.
6. Initial plain `py_compile` could not write the macOS interpreter's default cache directory under the restricted environment. Corrected the cache destination without changing source:
   - `PYTHONPYCACHEPREFIX=/private/tmp/openobec-ci-throttle-pycache .tools/venv/bin/python -m py_compile scripts/seed/seed.py tests/runtime/test_seed_transport.py`
   - Exit 0, no output.
7. `git diff --cached --check` before the commit: exit 0. Commit contained exactly the two focused files, 201 insertions and one deletion.

The local `.tools/venv/bin/python` interpreter is Python 3.9; the CI workflow uses Python 3.12. The implementation and tests use compatible stdlib APIs and no new dependency. Java/frontend code was unchanged; their full pipelines were not redundantly rerun locally for this Python-only change.

## Remaining proof and limitations

Docker is unavailable locally as established by the task brief. No claim of a fresh live stack, live seed acceptance, live `SeedPreservation`/`LiveRefreshPreservation`, or complete CI pass is made here. Those tests need the real owning services, gateway, projection and storage and were not invoked against unavailable or unrelated services. The controller owns independent review, the authorized push and a fresh complete CI run, including all smoke/live preservation and browser checks.

The transport's POST safety relies on the inspected repository guarantee that the gateway's 429 rejects before dispatch. If future upstream services add 429 responses after processing mutations, that assumption must be reviewed. Exhausting three explicit rejections or receiving a valid server delay beyond the supported one-minute window intentionally remains a visible original HTTP error; the patch does not suppress persistent failure.
