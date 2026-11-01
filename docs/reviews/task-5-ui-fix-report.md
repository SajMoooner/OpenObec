# Task 5 — one targeted finish-review repair round

Date: 2026-11-01. Scope: exactly the three material findings in `.impeccable/review/finish-review.md`, plus the same record-table failure at tablet width found while checking the responsive result. The parent owns the full suite, canonical captures, fresh finish review and final build-state decision. No commit or staging was performed.

## Authority and investigation

Read the exact finish-review report first, PRODUCT.md, all three relevant surface briefs, application AGENTS.md, current shared table, marketing hero/CSS, portal consumers, existing e2e tests, the relevant bundled Next.js CSS guide, and Impeccable craft-floor immediately before UI edits. Read and followed systematic-debugging, TDD (including writing-good-tests) and verification-before-completion. Context and detector were not rerun; no review/build-state artifacts were mutated.

The approved navy/raster panorama/overlapping register composition remains. Genuine shadcn/ui components, self-hosted Geist and the existing IDSK3 colors are retained; no new dependency, color, asset, typography system or component library was introduced.

Root causes:

1. Marketing fixed examples forward their illustrative titles as exact citizen `q` values. The current published API returns zero matches for these examples.
2. RecordsTable keeps agenda, amount and status as separate mobile columns. Existing local overflow containment does not make the title, action and state readable together. With the office sidebar open at 768 px, restoring all columns also makes the document wider than the viewport.
3. The marketing stylesheet hides desktop `<br>` elements below 768 px. JSX has no adjacent whitespace at those boundaries, so the rendered words concatenate.

## Changes

Only production sources changed:

- `packages/ui/src/features/shared.tsx`: use a fixed two-column table below 1024 px (document plus existing open action). Give the title/number the available width, and regroup agenda, publication badge and amount below the title. Keep the primary document link, named open action, amount and explicit Koncept/Zverejnené state. At 1024 px and above, restore the original automatic table layout and separate desktop columns. No content or record navigation changes.
- `apps/marketing/app/home/hero.tsx`: send illustrative row actions to their populated citizen agenda without a fabricated title query; label the agenda destination explicitly. Add real spaces before the four desktop line breaks whose removal used to join text.

New regression file: `tests/e2e/review-regressions.spec.ts` (14 cases, real running browser/API, no mocks). `apps/marketing/app/home/marketing.css` is byte-for-byte unchanged from the captured task baseline: source whitespace solves the issue while preserving desktop line breaks.

Exact visible word changes:

| Before | After | Reason |
| --- | --- | --- |
| Názov dokumentu | Príklad dokumentu | Identify illustrative examples honestly. |
| Detail | Ukážka agendy | State that the destination is an agenda preview. |
| Zobraziť | Otvoriť agendu | Name the actual navigation action on all rows/tabs. |

The existing “Ukážkové dáta · Žilina” label, illustrative titles and dates remain. Intro, price and structure-benefit wording is unchanged; only the missing spaces are restored at `občanov. Jednoduchšia`, `evidenciu dokumentov`, `agend obce` and `zrozumiteľným zobrazením`.

## RED evidence

Command against unchanged Docker frontends:

```sh
env -u NO_COLOR pnpm exec playwright test tests/e2e/review-regressions.spec.ts
```

The first attempt revealed a test-only address assumption (marketing links use `localhost`, while tests enter through `127.0.0.1`). The test was corrected to accept those equivalent local demo hosts, then rerun before any production edit. Confirmed RED: **13 failed**, each for the intended defect:

- All seven marketing tab cases: API `pagination.total` was 0 (expected >0).
- Citizen home: table container horizontal overflow 26 px.
- Office dashboard: table container horizontal overflow 122 px.
- Office agenda: title cell 132.921875 px (expected >=240 at 390 px).
- Intro: `občanov.Jednoduchšia`.
- Price: `evidenciudokumentov`.
- Structure: `agendobce` and `zrozumiteľnýmzobrazením`.

Initial mobile repair passed all 13. The batched render also checked the intermediate width and exposed the inherited 768 px office-table failure. Added a fourteenth test before completing that same responsive correction:

```sh
env -u NO_COLOR pnpm exec playwright test tests/e2e/review-regressions.spec.ts --grep 'tablet width'
```

Tablet RED: document width **907** at viewport **768**. The full table was appearing at `md`; completing the same fix moved its full-column threshold to `lg`.

Logs: `/private/tmp/openobec-ui-fix-red-confirmed.log`, `/private/tmp/openobec-ui-fix-tablet-red.log`.

## GREEN and production verification

Final command and result:

```sh
env -u NO_COLOR pnpm exec playwright test tests/e2e/review-regressions.spec.ts
# 14 passed (13.6s), exit 0

env -u NO_COLOR pnpm typecheck
# All 6 participating workspace projects Done, exit 0

env -u NO_COLOR pnpm lint
# exit 0

env -u NO_COLOR pnpm test:frontend
# tests 13, pass 13, fail 0, exit 0

python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml build marketing citizen office
# Image openobec/citizen:demo Built
# Image openobec/office:demo Built
# Image openobec/marketing:demo Built
# exit 0

python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --no-deps --wait marketing citizen office
# All three frontends Healthy, exit 0
```

The final 14 browser cases exercise all three initial marketing actions and all 18 agenda-tab actions, verify populated actual published API results and visible citizen document links, and verify the labels describe agenda navigation. Three 390 px record-list cases and one 768 px office-dashboard case check usable title/number width, no horizontal scrolling, visible status/action, and actual detail navigation. Three mobile marketing cases inspect rendered text to catch missing spaces.

Only marketing/citizen/office containers were rebuilt/recreated. No backend, infrastructure or pairing container was stopped or restarted. No seed/backend/POM/Compose/runtime/documentation source was changed by this repair.

Final logs: `/private/tmp/openobec-ui-fix-green-final.log`, `/private/tmp/openobec-ui-fix-typecheck-final.log`, `/private/tmp/openobec-ui-fix-lint-final.log`, `/private/tmp/openobec-ui-fix-frontend-final.log`, `/private/tmp/openobec-ui-fix-build-final.log`, `/private/tmp/openobec-ui-fix-up-final.log`.

## Batched rendered verification

Opened temporary rendered images for citizen home mobile, office list mobile, marketing mobile/desktop, office dashboard at 768 and 1024 px. The approved marketing composition and three-row preview density hold; desktop copy retains its line breaks. The marketing preview retains its existing contained horizontal table scroll on mobile; this review asked the core citizen/office fields to fit without scrolling.

Office dashboard and agenda list were measured at all four requested widths:

| Viewport | Dashboard title cell | Agenda-list title cell | Document width | Furthest open action edge |
| --- | ---: | ---: | ---: | ---: |
| 390 | 308 | 308 | 390 | 369 |
| 768 | 414 | 414 | 768 | 739 |
| 1024 | 188.9375 | 337.1875 | 1024 | 983 |
| 1440 | 429.4375 | 537.015625 | 1440 | 1381.15625 |

At 1024 px the full desktop dashboard table fits: titles occupy 2–3 readable lines and amount/status/action remain visible. This capture was opened and inspected. At 768 px the grouped layout fits beside the standard sidebar. All eight office route/width measurements have document width equal to viewport width. Citizen home at 390 px likewise has a 308 px title cell, open-action right edge 369 px, and no table/body overflow. The initial eight-view batch reported no browser errors or warnings.

Temporary render evidence: `/private/tmp/openobec-ui-fix-render/`; final office geometry: `final-office-geometry.json`. These are inspection aids; the parent will refresh canonical review images.

## Limits and handoff

This report supplies focused repair verification. The parent still owns the repository-wide/full browser suite, canonical capture refresh, any responsive score/checksum update and independent finish-review verdict. No ship verdict, build-state transition, commit, staging, push or merge was performed. No extra detector or context run was performed. No unresolved failure remains in the assigned focused tests or final frontend checks.
