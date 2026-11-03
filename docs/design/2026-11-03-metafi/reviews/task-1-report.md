# Task 1 completion report

Commit: `484c73a` — Replace marketing with MetaFi-inspired OpenObec design.
Base: `5cf1907`, branch `codex/openobec-demo`.
Candidate remains running on http://127.0.0.1:3100 (Next dev session 2167). Controller owns production Docker deployment.

## Completed

Implemented all five requested marketing routes (/home, /vyhody, /o-nas, /pricing, /kontakt), retained / redirect and useful /demo. Original React/shadcn composition follows the rendered MetaFi reference: bounded 1152px layout, 68px/500 Inter heading, white/near-black system, purple CTA, fading grid behind the real dashboard, distinct features/about/pricing/contact compositions and shared header/footer. Template purchase banner omitted as directed.

Local light/dark themes include saved preference before paint, cross-tab synchronization, mobile Sheet navigation with active route/focus/Escape behavior, keyboard Accordion FAQ and vertical workflow Tabs. Working portal URLs come from publicLinks(). Search is on /demo and submits to the actual citizen portal. Contact offers genuine GitHub/project/issue-composer and demo links; no invented email or pretending to deliver a message. Pricing clearly identifies managed service as a 199 €/year proposal, without checkout, VAT invention or implementation-price invention.

Created original circular geometric identity, dark/light symbols and favicon, and licensed self-hosted Inter. Retained authentic screenshots and provenance. Removed seven obsolete marketing composition/component files; original panorama asset remains archival media, unreferenced in the new pages. No changes to citizen/office/shared styles/backend/data.

Documentation: apps/marketing/DESIGN.md and PRODUCT.md; updated active app-local surface contract while preserving historical record; added explicit marketing-only supersession notice to root PRODUCT.md. The ignored local .impeccable/build/state.json has historical/supersededBy metadata rather than a fabricated new comp claim. Root DESIGN.md remains untouched.

## Checks and exact results

- RED: `pnpm exec playwright test tests/e2e/marketing.spec.ts -g 'all five' --reporter=list` against incumbent3000 failed for missing Domov/all-five navigation as expected. First restricted browser attempt failed to launch; authorized retry reached the product assertion.
- `pnpm --filter @openobec/marketing typecheck` — PASS after implementation and again after final refinements.
- `pnpm exec eslint apps/marketing/app tests/e2e/marketing*.spec.ts tests/e2e/review-regressions.spec.ts` — PASS. Environment emitted a React-version autodetection warning at monorepo root, no lint findings.
- `pnpm --filter @openobec/marketing build` — PASS, including final theme/accessibility code. Nine routes generated, all required pages present. Initial restricted build stalled and was interrupted; authorized build completed successfully. Final compile636ms, TypeScript1460ms.
- `MARKETING_URL=http://127.0.0.1:3100 pnpm exec playwright test tests/e2e/marketing.spec.ts tests/e2e/marketing-layout.spec.ts tests/e2e/marketing-showcase.spec.ts --reporter=list` — 33 PASS in16.9s. Six routes at390/768/1440/2560, container bounds, Inter typography, theme, keyboard/menu, FAQ, tabs, image hashes, no-JavaScript usefulness, runtime destinations and real search.
- After final dark-theme/skip-link refinement: `MARKETING_URL=http://127.0.0.1:3100 pnpm exec playwright test tests/e2e/marketing.spec.ts tests/e2e/review-regressions.spec.ts -g 'marketing|skip link' --reporter=list` — 7 PASS in6.9s, including new skip-link focus test and retained mobile word-spacing regression. In total35 distinct marketing tests exercised (some repeated).
- `git diff --check` — PASS.
- Scope diff for apps/citizen, apps/office, packages, services — EMPTY.
- Impeccable detector (once after composition complete) — one advisory: grid-line background. Retained deliberately because the user pinned the exact MetaFi hero and its fading dashboard grid; no banned kicker labels or fabricated illustrations.

## Visual review and evidence

Inspected all five earlier reference desktop captures and home mobile; after checkout restoration, inspected fresh reference home fullpage, pricing/contact hero and home mobile. Inspected candidate home hero/fullpage, features fullpage and dark reference. Controller independently captured all five desktop/mobile routes and reported faithful composition, no mobile overflow, functional theme/menu and final visual ship verdict. Dark background was corrected from near-black to the measured blue-gray `oklch(.23 .02 265)`.

Fullpage screenshot stitching exposed the offscreen fixed skip link; corrected with opacity0/pointer-eventsnone default and opacity1 on focus, keeping it keyboard focusable. Dedicated Tab/Enter test passed.

## Assets and license

- InterVariable.woff2: https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/InterVariable.woff2; license https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt downloaded2026-11-03 and retained at apps/marketing/public/fonts/OFL.txt (SIL OFL1.1). Local next/font/local, no browser third-party font request.
- Original authored SVG mark in public/brand; provenance README there.
- Existing public/showcase/*.png and public/previews/*.png, their existing README provenance unchanged. Three workflow screenshot hashes compared successfully with original proof files.
- No template source, paid blocks, fabricated staff portraits or remote unlicensed images copied.

## Limitations / deliberate adaptations

Slovak copy and OpenObec content replace the finance product, logos, customer testimonials and team section. Genuine product captures replace photography where no authorized team imagery exists. Workflow has three truthful steps rather than invented customer quotes. Template purchase strip omitted. Dark screenshots retain the authentic light product UI. GitHub is a public project channel requiring an account to post; no private contact endpoint was supplied. Current service is demo/proposed pricing, not an active paid subscription.

Parent owns native screenshots/reference evidence and final Docker smoke; these untracked directories are not included in this implementation commit. Three unrelated root research files remain untouched/untracked. The local historical build-state marker is ignored and is not newly force-added.
