# OpenObec — final UI review input

Review all three finished portals. User requested a runnable local single-city Žilina demo, with three independent Next.js apps and real APIs/files. Latest binding frontend instruction: genuine shadcn/ui; IDSK3 contributes ONLY colors, never fonts/components/spacing. User explicitly chose standard shadcn/ui as the quality reference. Typography is self-hosted Geist. Slovak copy, honest synthetic data, no invented contact/customer/legal/savings claims.

Marketing is Persuade and image-led: user selected canon (standard product page), then navy composition, then approved skyline/stock-icon asset plan. Office and citizen are Operate and code-led. Do not apply persuasive novelty as an Operate goal. Primary jobs: citizen finds a published document, reads all fields/related records and downloads PDF; office enters demo, creates/edits/links/uploads/publishes/unpublishes/deletes documents. Six agendas. Login is a one-button demo, IS connection is explicitly simulated; real auth, real city IS/registries and intelligent search are out of scope. Price199€/year is a proposal; setup/DPH undetermined. Contact has no supplied address and honestly opens demos.

## Files and direction

- Product: PRODUCT.md
- Marketing artifact: apps/marketing/app/home/page.tsx (hero.tsx, marketing.css, hero-geometry.css, sections.tsx); other marketing routes /vyhody,/kontakt,/demo.
- Portals: apps/citizen/app/obcan; apps/office/app; shared UI features packages/ui/src/features; typed client packages/api-client/src.
- Three surface briefs: apps/{marketing,citizen,office}/.impeccable/surfaces/*.md. These carry direction contracts and modes.
- Comp and approvals: .impeccable/mocks/marketing-navy.png and .json sidecar; .impeccable/concepts/{marketing-options.json,marketing-compositions.json}; plan/asset receipt in .impeccable/review/components.json and its captured session metadata.
- Quality bar: user's explicit standard shadcn/ui reference; canon choice, not the declined grounded concept.
- Measured build: .impeccable/build/{state.json,spec.json,regions.json}; hero85%/responsive86% passed. Source font matcher ranked Google Sans Flex but explicit user font/system choice is Geist. Actual production matches user colors, rather than slight image-model color drift.
- Intentional comp corrections recorded before code: remove decorative eyebrow labels, remove unsupported “bezpečné”, align mixed preview rows with active Všetky tab. Header/hero/art/register/offer topology retained.
- Fidelity evidence: .impeccable/review/diff/{hero,desktop}/ (reports,side-by-side,heatmap,regions). Responsive state checksum predates subsequent mobile-overflow repair/format/icon changes; current screenshots below are fresh from latest Docker build. Final finish command will re-open/recheck responsive if the checksum requires it; no gate override/user acceptance bypass was used.
- Craft floor: /Users/simonochotnicky/.codex/skills/impeccable/reference/craft-floor.md.

## Required visual evidence

All paths relative to `.impeccable/review/`. Every screen has actual live API data, not a visual mock. Capture-manifest.json records route/status/dimensions/console results. All28 route/viewport captures: HTTP200, no console errors/warnings, no body overflow. Marketing `desktop.png` is1440x960 viewport/fullpage; `mobile.png` is390x844/fullpage. Portals use same viewports.

- Marketing home: desktop.png,mobile.png.
- Marketing benefits/contact/demo: marketing-benefits-{desktop,mobile}.png,marketing-contact-{desktop,mobile}.png,marketing-demo-{desktop,mobile}.png.
- Citizen: citizen-home-{desktop,mobile}.png,citizen-list-{desktop,mobile}.png,citizen-detail-{desktop,mobile}.png, plus citizen-detail-expanded-{desktop,mobile}.png (first related document expanded).
- Office: office-login-{desktop,mobile}.png,office-dashboard-{desktop,mobile}.png,office-list-{desktop,mobile}.png,office-detail-{desktop,mobile}.png,office-detail-expanded-{desktop,mobile}.png,office-edit-{desktop,mobile}.png,office-procurement-new-{desktop,mobile}.png,office-settings-{desktop,mobile}.png.

## Checks and behavior evidence

- One detector run only: .impeccable/review/detector.json is[] (no findings); no automatic hook. Do not run another detector.
- Workspace typecheck/lint, all3productionNext builds,20client tests pass. Current host production builds of all3apps passed again after the repairs.
- Docker Playwright25tests passed (24.4s): navigation; marketing mobile containment; partial search failure preserves other agendas; createPDF+link+publish+citizen search+exactdownloadSHA+edit+unpublish; upload failure retains inputs and retries same ID; mobile menus close; server validation retains inputs without creating row. Keyboard skip/search and14 review regression cases are included and passed.
- All70API operation responses schema validated; actual files and12synthetic records per agenda. Both complete manual production and Docker launch passed. HTTP trace/logging/backend final checks continue independently.

Review source/behavior where it bears on usability, errors, native expectations and truthfulness. Return the shipped finish review's five-section contract and one disposition (ship/fix/rebuild/recapture). The initial full review returned three material fixes. They were repaired in one batch; see docs/reviews/task-5-ui-fix-report.md for causes, exact wording changes, RED/GREEN and tablet measurements. Current captures include those repairs. This continuation is the verdict pass on those three fixes; score each resolved/partial/unresolved. Save report to .impeccable/review/finish-review.md; no source mutations, git/index changes or subagents.

Subsequent code-review repair preserves exact untouched procurement instants (seconds/fractions/DST fold), allows intentional seconds/millisecond edit and retains springgap rejection; native datetimeinput only gained step0.001. Malformed APIerrorenvelopes normalized. All3productionbuilds/Dockerfrontendimages updatedhealthy, full25browser+20client+4smoke/all70GREEN. Same32captures refreshed, responsive86%match/finishshipcurrent. No detector rerun or design restyling.
