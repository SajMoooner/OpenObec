# Task 3 — product-led marketing refinement

Implemented against approved Task 3 brief, global constraints and Slovak design proposal. Base: `2265a3a97151a249968bcab303122af0e2c53ea0`. No shared portal/backend/data edits; no external assets or invented commercial/contact claims. Existing navy hero, panorama, functional search and three-row agenda preview remain intact.

## Delivered

- Home replaces repetitive benefit lists with two illustrated scenarios: contract → PDF/relations and office overview → draft completion. Retains six differentiated agendas, three-step publication, explicitly proposed price, practical FAQ and both role CTAs.
- Benefits replaces six identical table sentences with two concrete illustrated workflows plus correct agenda distinctions (customer/supplier, contract effectiveness, procurement value without VAT, separate VZN).
- Demo shows both real application screenshots and a three-step try-it path per role; discloses persistence, fictitious data and simulated municipal integration.
- Contact honestly states missing contact/ordering and offers a guided demo and FAQ rather than a fake form.
- Shared marketing header exposes current route and closes its genuine shadcn Sheet after selection. Four pages use centered 1280px maximum, consistent spacing and Geist. Existing footer and demo-link semantics preserved.
- New ProductPreview uses Next Image with stable 1440×1040 dimensions, responsive sizes, useful alt text and explicit static/synthetic captions. Source PNGs total ~227KB.
- DESIGN.md and marketing surface brief now describe approved actual bounded geometry. Historical comp gate/evidence untouched; no unrelated sidecar drift repair.

## Assets and pending Task 4 refresh

`apps/marketing/public/previews/README.md` records source routes, date, version, fixture scope and browser dimensions. Both captured and visually inspected from current live local portals; only owned seeded synthetic records visible. Citizen fixture has a real demo PDF plus four relationships; office shows 72 / 24 / 48 with drafts.

Reproduction: `node tests/e2e/support/capture-marketing-previews.mjs`, optionally CHROME_PATH. Script only reads local pages and captures, never mutates records. Exact citizen fixture ID preserved in script and provenance.

**Latest user steering is intentionally handed off to Task 4:** realistic fictional document names, numbers, organizations and files will replace the current synthetic/DEMO naming in stored data. Controller will refresh these PNGs after that ID-preserving migration, visually inspect and update provenance/alt text as needed. Task 3 screenshots accurately represent present state, not the future fixture content.

## Verification

- `pnpm typecheck`: passed across all packages/apps.
- `pnpm lint`: passed, including final added tests/capture helper.
- `pnpm test:frontend`: all 23 passed.
- Initial local `pnpm build` without escalation failed on Turbopack port binding (`Operation not permitted`), an environment restriction, not a source compilation failure. Did not repeat that blocked mode.
- Approved Docker refresh command rebuilt all three production frontends successfully (marketing/citizen/office), then recreated only those three services. Backend/data untouched. All three Next builds succeeded, including TypeScript and static generation.
- `pnpm exec playwright test marketing.spec.ts marketing-layout.spec.ts review-regressions.spec.ts --grep marketing`: **28 passed (18.7s)** against fresh Docker applications. Includes all 21 sample-row destination checks, actual selected-agenda query navigation, both demo entry links, image loading/static semantics, mobile Sheet close/current page, FAQ, wide centered bounds and all four pages at 390/768/1440.
- Updated only obsolete marketing prose expectations in review-regressions. Removed assertion targeting deleted repeated benefit text; preserved behavioral register tests unchanged.
- Separate Chrome capture sweep: all four pages at 390, 768, 1440, 2560, 3440, 1000px viewport height. All 20 routes had document scrollWidth equal to viewport width, no page exceptions. Images fully decoded before screenshots. Files: `/tmp/task3-{home,vyhody,demo,kontakt}-{390,768,1440,2560,3440}.png`.
- Rendered visual inspection: desktop home, desktop demo/contact, mobile home/benefits, tablet demo, 3440-wide home. Bounded content, legible headings, stable product frames, correct alternating desktop/staked narrow ordering. Mobile screenshot detail is illustrative at thumbnail scale, with explanatory copy and actual demo entry available.
- `git diff --check`: passed. Self-review covered scope, copy truth, alt/caption semantics, route sources, CSS breakpoints and provenance. Controller owns final all-route matrix, full E2E, detector and whole-branch review; none represented as complete here.

## Remaining concerns

No known blocking Task 3 implementation defect. Product image refresh after Task 4 is required by newer user steering. Historical Impeccable sidecar values remain outside this task's authorized drift-repair scope; current DESIGN.md and marketing brief record the authoritative geometry. Full-page mobile home is necessarily long because all required agendas, workflow, offer, FAQ and product examples are present; sections stack with 3rem spacing and no page overflow.
