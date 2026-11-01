# Task 5 — animated real screenshots; finished video retained for GitHub

Base e20f6d0. **Final behavior follows the latest user steering:** the homepage shows three real platform screenshots with a gentle step transition. It has no video element, video request, video preload or video download. The completed real video, poster, Slovak captions and provenance are retained in `docs/media/showcase/` for the controller's GitHub/README task. No push or root README/license change performed by this task.

## Final homepage

`publication-showcase.tsx` uses installed genuine shadcn Tabs/Tab triggers and Button, self-hosted Geist and existing IDSK3 palette. Three same-invoice stages: **Príprava → Zverejnenie → Pre občana**, with meaningful full accessible names, selected state, descriptive alt and role-specific captions. Selected PNGs are byte-identical to successful real captures:

- `apps/marketing/public/showcase/preparation.png` = proof `03-invoice-fields.png`.
- `published.png` = `05-published.png`.
- `citizen.png` = `07-public-detail.png`.

The default first image is present and visible in server-rendered HTML before JavaScript. All three local images load eagerly in hidden/active native Tab panels; inactive panels remain hidden from accessibility navigation. The stable 8:5 frame and reserved caption height prevent layout shift. The only authored motion is a bounded 280ms opacity/6px reveal between the same document's stages. No parallax, tilt, bounce or animation package.

Six-second advance runs only when the figure is at least 25% visible and the document is visible. IntersectionObserver and document visibility subscription pause the timer, resume with a fresh readable interval, and clean up on unmount. A visible pause/play control supports explicit choice. Manual selection and keyboard focus in the tabs stop automatic advance. Reduced-motion preference starts static; CSS removes spatial transitions entirely, while manual choice remains useful (explicit play is still available). Auto changes do not move keyboard focus or add intrusive live announcements.

Hero/search retains the navy/panorama, centered max 1280 shell, two demo CTAs and a compact real search to citizen home across agendas. Only the illustrative old table/tabs and their obsolete assertions were removed. Existing screenshot/FAQ/demo/agenda/copy sections remain. DESIGN and the marketing brief now describe the latest screenshot direction, distinguishing it from the earlier superseded video candidate.

## Real recording, invoice ownership and same-file proof

Finished `docs/media/showcase/publication.webm`: **39.24 seconds, 3,458,209 bytes, VP9/WebM, 1280×800, 25fps, silent**. Continuous actual Google Chrome UI capture, not AI-generated media, mock publication, fabricated loading/success or an API-created stand-in: office entry → Faktúry → new document → meaningful fields → actual matching PDF → Uložiť a zverejniť → citizen search → same invoice/detail → actual PDF download. No cuts. Encoded frames at 0.2s, 17.5s, 31s were decoded and visually inspected: real entry, published office detail and public detail. No leading blank. Eight original representative PNGs remain with proof.

Final exclusively owned invoice **FV/2026/0057**, “Prenájom sály na komunitné podujatie”, fictional customer “Spolok Rodinná lúka”; dates 2026-11-02 / 2026-12-02; exact monetary strings **245.50 + 56.47 = 301.97 EUR**. Source/public id **fak_d0f2b5d6-7a8a-422e-a71f-c5698c32aae4**; source version 2 = ready query root version 2. Attachment **file_2aae9bfc-56a1-4a9b-a4a3-e118811bf9ca**, `faktura-0057.pdf`, 52,999 bytes.

Authored PDF, source attachment download and actual citizen UI download all SHA-256 **472a316ee2868bd85f50e2fe329dfc447bb840702fe9992af45073060824b149**. Exact payload, source/query/file snapshots and original PDF: `docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/`. `proof.json`, `ownership.json`, `invoice.json`, matching PDF and eight captures make publication and identity reviewable. PDF rendered via bundled Poppler and visually inspected: correct number/title/customer/dates/amounts, embedded Slovak font, readable fictional footer, no clipping/glyph defects.

Invoice 0057 stays published because video/provenance link to it. Existing 72 seed IDs were never write targets. The user's 0052 was verified read-only after all recording work: original id, **entity_version 5**, VAT 38.14 / total 203.94 preserved (`showcase/preserved-user-record.json`). The steering change created no new record and did not alter the successful invoice/PDF.

Earlier exclusively owned attempts 0053/0054/0055/0056 were verified by exact created id and payload then soft-deleted after capture failures/refinement. Compact exact ownership/cleanup history is `showcase/attempts.json`; repeated failed images remain ignored under `.run/showcase-attempts/`. No number-based adoption, resets, existing-record edits or backend changes. Reruns skip reserved attempt numbers and current source matches; on a conflict/proof failure they stop.

`scripts/showcase/record.mjs` now defaults to **docs/media/showcase**, never marketing public. It prepares a fresh unique fictional invoice/PDF, writes ownership, records real actions, verifies source/public identity and meaningful exact fields/customer, ready query version and all three PDF hashes, saves video/poster/timed captions and removes duplicate raw video. New recording runs intentionally create one new owned record; they never update/delete incumbent records. The approved homepage 0057 PNGs are not silently replaced by a video rerun. `SHOWCASE_OUTPUT`, `CHROME_PATH`, `PDF_PYTHON`, `OPENOBEC_PDF_FONTS` and macOS sips are documented.

## Focused RED/GREEN and final checks

Revised RED, before replacing the deployed video candidate:

```sh
pnpm exec playwright test tests/e2e/marketing-showcase.spec.ts -g 'actual screenshots'
```

Expected homepage video count 0, received 1 (10s timeout). This directly captured the latest required change; the earlier candidate's expected missing-video RED and passing player tests are historical, not final acceptance.

Revised final build and checks:

```sh
pnpm typecheck
pnpm lint
python3 scripts/dev/docker_env.py docker compose -p openobec -f compose.yaml -f compose.apps.yaml up -d --build --no-deps marketing
pnpm exec playwright test tests/e2e/marketing*.spec.ts tests/e2e/review-regressions.spec.ts
pnpm exec playwright test tests/e2e/marketing-showcase.spec.ts
node --check scripts/showcase/record.mjs
git diff --check
```

Fresh marketing production build passed. Typecheck all apps/packages and lint passed. **28/28 marketing+retained regression tests passed (12.6s)**: all four marketing routes at 390/768/1440, wide centered/max 1280/demo alignment at 2560/3440, actual screenshot file hashes/loading/selection/captions, no video element/download/network request and removed public asset 404, keyboard selection, reduced-motion static default/no spatial animation, six-second advance/pause, offscreen and hidden-document timer pause/resume, manual stop, stable bounds/aspect, real search to 0057, both demo links, FAQ/mobile navigation and retained portal/spacing regressions. Hidden document lifecycle is simulated by the browser visibility property/event; no application response or publication is mocked. A further explicit no-JavaScript initial-screen test was added; **4/4 focused tests passed (2.8s)**, including the explicit no-JavaScript initial-screen/search test.

The earlier final-candidate run had identified two accidentally removed still-used base URL references in retained regressions; restored and passed. A remaining old `.marketing-table` wide-layout selector was replaced with actual visible `.publication-frame` while preserving centering/alignment assertions. The old focused video test is removed entirely. Seven old static-table/tab assertions remain intentionally superseded; all other existing behavior coverage stays.

The same Task5 implementation already passed **23/23 frontend unit tests**, frontend type/lint and all three app production builds before the user's placement-only steering. Citizen/office/shared core is unchanged afterward; those valid checks were not repeated unnecessarily. Revised code warranted and received new type/lint/marketing build/browser coverage. Runner emits only inherited NO_COLOR/FORCE_COLOR warning. No unchanged backend/Java suites rerun. Apps-only rebuilds preserve all data/backend services; all 21 reported healthy after the three-app refresh.

Task4→5 capture dependency: `capture-marketing-previews.mjs` waits for all six agendas in all three states, resolved numeric totals and no error, rather than 72/24/48 constants. `PREVIEW_OUTPUT=/tmp/task5-current-previews node tests/e2e/support/capture-marketing-previews.mjs` passed at 73/24/49 without overwriting the retained honest 72-record screenshot. Provenance explains that snapshot and current-count readiness.

## Manual inspection and historical video candidate

Final manual CUA checks: real screenshot selection and keyboard ArrowRight select publication with the correct caption, preserving focus; no video element. Native mobile controller independently confirmed the three 1280px images loaded, tabs fit, touch/manual selection stops advance, keyboard selects citizen and no overflow. Final desktop/mobile native hero captures are `showcase/hero-1440.png` and `hero-390.png`; viewport overrides reset after capture. These tall composition captures supplement, not replace, viewport tests. Actual motion/reduced-motion properties and timing are covered by focused browser checks.

Prior video player playback was manually verified via CUA (play advanced, Space paused, ended at 39.24s with no loop, Slovak track showing); `native-playback.png` and media metadata explicitly refer to this **historical player candidate/documentation video proof**, not the final homepage. Invalid responsive-paint tiny screenshot was removed. Earlier video hero captures moved to ignored `.run/showcase-video-candidate/`; new final captures describe screenshots only.

Official FFmpeg 1013 was needed because installed 1011 encoded VP8 but Playwright 1.64 requests VP9. The incompatible workspace alias was abandoned; `pnpm exec playwright install ffmpeg` installed the official 1.4MiB dependency. Installer normal GC removed older unused Playwright browser caches; recording/tests use installed Chrome. README documents task-local browser path or PLAYWRIGHT_SKIP_BROWSER_GC. No global package or player library installed. PDF skill and authoring marker ran once before first PDF authoring; bundled ReportLab/embedded Liberation/Poppler used, no new startup dependency. The successful workflow was executed before final strict proof guards/poster-caption/raw-cleanup additions; corresponding post-processing was run separately and strict final guards replayed successfully against captured evidence. No extra invoice was created just to rerun development-artifact guards.

## Self-review and scope

Reviewed image identity/source provenance, publication/PDF evidence, ownership and failed-attempt cleanup, exact decimal/date semantics, server-first visibility, focus/selected state, timing/subscriptions/cleanup, reduced motion, stable frame, compact search and wide bounds. No fabricated UI or misleading claim. Final PNGs match original captures; video SHA remains unchanged after moving. No outstanding correctness concern. Recorder assumes documented local macOS/Chrome/PDF tooling unless paths are overridden; WebM/VP9 is the available real video format, no MP4 encoder added.

Stage only Task5 implementation/tests/assets/related design/provenance/proof; leave controller verification/plan/critique/archive files, Task4 reports, root research and new README/license work untouched. Controller owns final integrated suite/native matrix/detector/review and GitHub publication. No subagents or reviewers spawned.

Final native composition images were opened and visually inspected after responsive paint settled. Viewport reset completed. Final self-review found no remaining issue; no further scope changes.

Committed Task5 only: **413b520** — `feat(marketing): explain publication with real animated screenshots` (39 files). Controller documents, critique, Task4 reports/detectors/matrix, root research and README/license remained unstaged. Final verdict: **DONE**, no outstanding correctness concern; homepage is the animated real screenshot sequence and video remains documentation-only for GitHub.

## Fix round 1 — clean-seed portability (base a53b8c4)

Controller found that the actual-screenshots browser test searched the capture-only0057 invoice, absent from a fresh standard72-record seed. Changed only `tests/e2e/marketing-showcase.spec.ts` to search **FV/2026/0041**, the catalog's published index0 invoice, and retain the exact real-result assertion for **Preúčtovanie príspevku na obnovu interiéru mestskej knižnice**. Seed catalog proof: invoices start at0041 and index0 is published (`index %3 !=2`); no need to create the recording invoice in CI. Screenshot byte/provenance assertions still describe the authentic0057 captures, independently of the compact-search fixture.

Checks:

- `env -u NO_COLOR pnpm exec playwright test tests/e2e/marketing-showcase.spec.ts -g 'actual screenshots'` — **1 passed (1.8s)**; browser output pristine, real result found.
- `pnpm exec eslint tests/e2e/marketing-showcase.spec.ts` — exit0, no lint finding. Existing React-plugin detect fallback warning when linting the isolated non-React test from root (React is installed in apps, not root); no code/config change needed.
- `git diff --check` — passed.

No mocks, record mutations, seed changes,0057 recreation, production rebuild or full-suite repeat. Self-reviewed the single-file diff: both query and URL assertion use0041, and real-result assertion remains exact. No outstanding concern.

Fix commit: **22dc757** — `test(marketing): search a standard seed invoice in showcase check` (only the single requested test file).

## Fix round 2 — actual Impeccable surface brief (base 22dc757)

Controller identified that the exact tracked surface brief `apps/marketing/.impeccable/surfaces/apps-marketing-app-home-page-tsx.md` still led with the historical register/agenda tabs/three-row comp and had no current product previews or screenshot sequence. Updated that exact file with an authoritative current contract: centered 1280px/shadcn/Geist/IDSK3 colors-only/navy identity; the three real 0057 captures and provenance; gentle 280ms/6px motion with six-second cadence, manual/pause/hidden/offscreen/reduced-motion behavior; server-first stable image; no homepage video and documentation/GitHub video paths; compact search, both roles, actual labeled citizen/office product previews and current reading path. Original comp geometry/font/form records remain verbatim under clearly superseded history; earlier narrowing is retained with its register/assets wording explicitly superseded. YAML/frontmatter was preserved unchanged. No engine state, raster history, UI, test or runtime behavior changed.

Validation: a read-only Python validator extracted all backtick-quoted internal paths and asserted they exist, compared frontmatter to `git show HEAD:<brief>`, and checked original FIRST VIEWPORT/FORM records remain verbatim. **18 internal paths exist; frontmatter unchanged; historical geometry/form records retained verbatim.** `git diff --check` passed. Self-reviewed the single-file diff and current-vs-historical hierarchy. No suites or rebuilds run for this documentation-only correction. Commit only the surface brief; report remains the ignored task report.

Fix round2 commit: **5f402ee** — `docs(marketing): align surface brief with real screenshot showcase` (only the requested tracked surface brief). No outstanding concern.
