# Consolidated final-review fixes

Base: `d40e517a084b19fa1d2b5b5055f29d9815da6816`. One focused wave resolves I1, I2, M1 and M2. No subagents, push, backend, fixture/default seed, data, recording or marketing asset changes. Root research files and controller rulings remain untouched/untracked. Commit contains implementation and browser tests only; this report/evidence are controller workspace artifacts.

## Investigation and root causes

Read complete `final-fix-brief.md` and `final-review.md`, affected source, both full browser suites, app AGENTS, installed Next linking/navigation docs (native history integration), Superpowers systematic debugging, TDD/writing-good-tests/verification references, and Impeccable/polish/craft-floor. Existing context was not rerun. Preserved incumbent shadcn/ui, Geist, IDSK3 palette and layout.

### I1 — Fixed

The list only rendered pagination when rows existed. Empty pages therefore used empty-dataset/search copy despite a positive `pagination.total`, and offered no valid-page navigation. `useResource` already keys each request and aborts old requests, so recovery did not require changing fetching or adding automatic effects.

The positive-total empty-page branch now explains “Na tejto strane už nie sú dokumenty”. For out-of-range pages its action is **“Prejsť na poslednú dostupnú stranu”**, which changes only page and replaces the invalid browser-history entry. Existing query, sort, state and other URL parameters survive. It uses the latest successful response; there is no automatic request/navigation loop. If a positive-total response has an unexpectedly empty valid page, a manual “Obnoviť zoznam” retry is honest and bounded by user action. Zero-total responses keep existing genuinely empty copy and filter/reset behavior; there is no valid page to recover to.

Coverage: direct page999 citizen/office URLs; exact preserved q/sort/state/page after recovery; browser back skips the invalid entry; only two list requests (initial and recovery); both deletion and unpublishing of the sole row on page2 under a publication filter with page1 still containing records. Mutation requests are intercepted by the browser, with owned in-memory fixtures and no persistent writes. Existing search reset/history case also passes.

### I2 — Fixed

An editor `fieldset` kept its intrinsic min-content minimum, and selected filename text had no anywhere-wrapping constraint. The observed 107-character stem plus `.pdf` reproduced **929px scrollWidth at390px**.

Added `min-w-0` to the fieldset/attachment section/list and `overflow-wrap:anywhere` to the list. The filename remains complete DOM/accessibility text; no clipping/truncation or file/dirty-state behavior changed. Existing attachment detail presentation already uses wrapping/shrink constraints: its full-name download/remove controls, deletion dialog and selected detail upload were characterized at390px and passed without requiring presentation changes there.

Coverage: long selected PDF at390px, pending selection, validation error, save/cancel interaction, dirty Stay retaining the original filename. Extended the existing partial-upload retry test to390px and the same long filename, checking failed pending upload text/width and existing exact-once remaining-file retry behavior. Existing full-name remove action is visible and within390px; confirmation preserves the complete filename.

### M1 — Fixed

`returnTo` was safely validated by detail/editor callers but `returnLabel` only recognized home/search; other destinations used the current agenda title. It now looks up the agenda in that validated destination path, preserving fallback and existing home/global-search wording.

Coverage: contract detail to related invoice for both portals, invoice URL/heading settlement, exact originating contract-list href and label; office continuation into the hydrated invoice editor retains that label. An early exploratory case could race against the old contract DOM; final tests explicitly wait for invoice URL/heading and editor hydration. Existing home/search wording case also passes.

### M2 — Fixed

Five candidates per agenda could never populate a globally correct latest-ten list (or draft-six list) when one agenda dominated. Office now requests10 candidates per agenda for recent changes,6 for drafts, and retains1 for publication-total requests. Citizen default home requests10 with explicit descending creation sort; search keeps its separate five-row previews. Actual pagination totals, unavailable sections, successful-section cache and failure/retry handling remain unchanged.

Coverage: fixtures honor requested page_size with12 newer invoice records and one older row per other agenda. Citizen and office recent tables must showNEW-1–NEW-10 in order; office drafts showNEW-1–NEW-6. Existing pagination-total/partial-failure/retry test passes.

## RED evidence and test hardening

Initial restricted Chrome launch failed before page execution; the normal justified escalation allowed Chrome and localhost access. This was an execution restriction, not a regression verdict. No unresolved capability limitation remains.

Commands before rebuilding (old served application):

1. `pnpm exec playwright test tests/e2e/browsing-ux.spec.ts tests/e2e/workflow-ux.spec.ts --grep 'retained out-of-range|citizen latest ten|cross-agenda|deleting the last row|long selected|existing and pending|dashboard recent ten' > /tmp/openobec-final-red.log 2>&1`
   Approved run: **7 failed, 2 passed (2.1m)**. Expected failures: missing recovery action in both portals; NEW-6 replaced byOLD-1 in both latest surfaces; wrong related destination label in office;929px selected-file overflow. Existing detail attachment characterization passed. Initial deletion assertion hit two transient loading status elements rather than the intended branch, so this was corrected to filter the settled total and rerun. Initial citizen label case passed because it could still see the old contract DOM; added navigation/hydration waits and reran label regression.
2. `pnpm exec playwright test tests/e2e/browsing-ux.spec.ts --grep 'cross-agenda' > /tmp/openobec-final-label-red.log 2>&1`
   **2 failed**, missing the originating Zmluvy link on related invoice details. Final cases additionally wait for invoice URL/heading and editor values to make the navigation boundary explicit.
3. `pnpm exec playwright test tests/e2e/workflow-ux.spec.ts --grep 'deleting the last row|unpublishing the last row' --timeout 15000 > /tmp/openobec-final-shrink-red.log 2>&1`
   **2 failed**, both at missing valid-page recovery after the settled positive10-document response. All mutation fixtures stayed in memory.

The saved logs preserve intermediate test source line-number drift while files were being hardened; final compiled suite is the GREEN evidence below.

## Final validation commands and exact outcomes

- `pnpm typecheck > /tmp/openobec-final-typecheck.log 2>&1` — exit 0; recursive scope reports “6 of 7 workspace projects”; all five available typecheck scripts completed (`packages/api-client`, `packages/ui`, `apps/marketing`, `apps/citizen`, `apps/office`). Each emitted `Done`.
- `pnpm lint > /tmp/openobec-final-lint.log 2>&1` — exit 0; output `$ eslint apps packages tests/e2e`, no warnings/errors. Repeated once after final test navigation-wait hardening; same clean result.
- `pnpm test:frontend > /tmp/openobec-final-frontend.log 2>&1` — exit 0; `tests 23`, `pass 23`, `fail 0`, `cancelled 0`, `skipped 0`, `todo 0`, `duration_ms 169.720333` (runner spaces retained in saved log). Existing decimal, source/query, publication and date/attachment contracts unchanged.
- `python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build --no-deps citizen office > /tmp/openobec-final-build.log 2>&1` — exit 0; both Next.js 16.4.3 production builds compiled/typechecked/generated routes, both images `Built`, both containers recreated/started. Only these two affected frontend services were rebuilt; no dependencies/backend reset or rebuild. Full production build output retained.
- `env -u NO_COLOR pnpm exec playwright test tests/e2e/browsing-ux.spec.ts tests/e2e/workflow-ux.spec.ts > /tmp/openobec-final-green.log 2>&1` — exit 0; **30 passed (21.6s)**, one full amended-suite run against those fresh production builds.13 browsing + 17 workflow cases;10 new cases plus one extended existing partial-upload case. This run has no color-environment warnings.
- `git diff --check` — exit 0, no output.

Complete output copies: `final-fix-evidence/{red,label-red,shrink-red,green,typecheck,lint,frontend,build}.log`. Current source SHA-256 values: `final-fix-evidence/source-sha256.txt` (five implementation and two test files). They supplement, rather than overwrite, the controller's earlier32-source verification record.

## Scope and limitations

Controller owns final native narrow/out-of-range inspection, any updated durable source/capture verification archive and one consolidated re-review. Agent browser cases verify rendered widths, control reachability, exact retained destinations and user-visible ordering against production apps; no broad native matrix was repeated. Both affected Docker frontend containers were independently checked healthy after the suite. Edge datasets and mutations use isolated browser API response fixtures; they do not claim a fresh real-backend delete/unpublish experiment. Existing live read-only browsing cases passed. No unrelated Java/infrastructure suite, full59-test suite, recording or media regeneration was repeated, as explicitly directed. No outstanding functional concern identified in this focused wave. No push performed.

## Delivery

Commit: `75dd3f6` (`fix(portal): recover retained pages and refine document workflows`). Exactly seven implementation/test files, 334 insertions and 10 deletions. Post-commit tracked working tree is clean; controller-owned untracked research/review/rulings artifacts remain unstaged. No push.
