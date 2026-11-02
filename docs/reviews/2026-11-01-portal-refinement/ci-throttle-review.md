# Clean-CI seed throttling review

Reviewed immutable package `review-e65d6a9..aaeb130.diff`, brief and implementation report against base `e65d6a9` and HEAD `aaeb1304395c56173bc172efcb94124f145376e2`.

**Specification verdict: PASS. Quality verdict: PASS. No actionable P0–P3 findings in this task's scope.** This approves the focused implementation for the controller's fresh remote CI proof; it does not establish a complete CI or live-stack pass.

## Safety and specification checks

- **The POST safety premise holds in the actual gateway.** `GatewayWebFilter.java:33–35` gives the filter highest precedence. Its `:69–78` branch writes the 429 and returns, before the body decorator and the only downstream `chain.filter` at `:102`. Therefore a rate-rejected request has not reached its owning service. `WindowLimiter.java:24–33` computes a rounded-up 1–60 second delay for the unchanged fixed-minute bucket, without admitting the rejected request. The service-source search found no other HTTP 429 producer. `GatewayFailureTest.java:45–57` also checks a rejected POST's 429/Retry-After/RATE_LIMITED contract. No gateway retry, quota, peer-key, body-limit or configuration change is included.
- **Only known rejection responses are retried.** `scripts/seed/seed.py:49–59` catches only `HTTPError` from `urlopen` and requires status 429. Non-429 HTTP errors and connection/timeout/reset failures propagate immediately. The same `Request` is resubmitted; the JSON serialization and request construction occur once at `:62–66`, preserving method, URL, body, tenant header and content type. The pre-dispatch guarantee above supports this for POST as well as GET.
- **Delays and exhaustion are bounded.** `seed.py:23–38` accepts ASCII integer seconds or parsed HTTP dates, supports a valid zero/past date, and uses 1/2-second fallback waits for absent or malformed values. A supported delay above 60 seconds returns no retry rather than sleeping less than the advertised delay. `:49–59` allows three openings and at most two 60-second sleeps, with the existing 30-second per-open timeout. That covers the gateway's actual response range without suppressing persistent throttling.
- **Terminal error identity, details and lifecycle are retained.** `seed.py:53–58` uses bare `raise` before closing for a non-429 error, final attempt or excessive supported server delay. The original HTTPError object, URL/status/reason/headers and readable body remain available. Only a discarded rejection is closed. `:67–69` retains context-manager closure of successful responses and keeps response reading/JSON parsing outside the retry loop, so a write whose response body is lost is not resubmitted.
- **Uploads and downloads use the same policy.** `seed.py:92–96` constructs multipart bytes and its boundary once, then delegates to `request`; binary reads also pass through `request`. Repository search confirms the new helper is the only `urlopen` boundary in `scripts/seed`, and `refresh.py:53–180` delegates HTTP operations to `seed.request`/`seed.upload`. No separate unprotected refresh transport was left behind.
- **Ownership behavior stays intact.** The commit changes only `seed.py`'s transport boundary and the new focused test file. It does not alter manifest adoption, IDs, timestamps, preservation/resumption comparisons, refresh cleanup choices, default data, payload limits, gateway limits, readiness or UI code.

## Regression quality and evidence

The eight focused methods exercise the real `seed.request`/`seed.upload` code with deterministic substitutes at the external transport/sleep/clock boundaries, using actual HTTPError objects and readable response bodies. They assert identical rejected/retried POST payloads and headers (`test_seed_transport.py:31–50`); 60/0/date delays (`:52–61`); malformed/missing fallback, bounded attempts, discarded-error closure and final error identity/body/header availability (`:63–92`); excessive-delay terminal behavior (`:94–106`); unrelated statuses and ambiguous mutation transport failures (`:108–123`); unchanged multipart/binary data (`:125–144`); and no retry after a successful POST's body-read failure (`:146–156`). These assertions directly protect the reported CI failure mode and the duplicate-write boundary.

Fresh reviewer checks:

1. `PYTHONDONTWRITEBYTECODE=1 .tools/venv/bin/python -m unittest discover -s tests/runtime -p test_seed_transport.py -v` — exit 0, **8/8 passed**.
2. `git diff --check e65d6a9..aaeb130` — exit 0.
3. `git diff --quiet aaeb130 -- scripts/seed/seed.py tests/runtime/test_seed_transport.py` — exit 0; reviewed working files match the fixed commit.
4. Read the actual commit diff/stat and immutable package; both contain only the focused transport additions and test file, 201 insertions/one deletion.

The report's commands select the intended suites: runtime discovery includes the eight new methods plus 19 existing methods; contracts contain 12 methods; the explicit `RefreshTests`/`test_rebuild_command` selection covers seven offline preservation/resumption methods and rebuild help, excluding the live class. Inspected assertions match those claims. The report records 27/27 runtime, 12/12 contracts and 8/8 offline checks, including the approved runtime rerun after local port-binding restrictions. Those broad commands were not repeated for this review, as instructed. The reported RED is consistent with the base implementation's single unhandled `urlopen`, but was not independently replayed here.

## Remaining proof

The supplied CI failure log concretely shows 70 HTTP contract operations and seed acceptance/preservation succeeding before a 429 in `refresh.inspect`, followed by a 429 from its POST cleanup. `.github/workflows/verify.yml` uses Python 3.12, discovers the new runtime tests and still runs the full smoke suite and browser checks. A fresh remote run must now verify the complete workflow, especially live refresh/cleanup and browser checks. No live local tests, services, default data, push, index or HEAD changes were performed in this review.

The mutation-retry conclusion is specific to this repository's current pre-dispatch gateway 429. If an owning service or a different configured API endpoint later introduces a post-processing 429, that premise must be reconsidered; this is an explicit scope assumption, not a current finding.
