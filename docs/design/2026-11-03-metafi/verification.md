# Marketing verification — 2026-11-03

Implementation commit: 484c73a. Approved scope: marketing only, in the restored Desktop/Projekty/OpenObec checkout.

- Marketing production build and Docker image build succeeded. New marketing container is healthy on localhost:3000.
- All21 running services healthy; six marketing routes and both operational portal entry points returnedHTTP200.
- Native browser checks covered five marketing pages at1440px/390px, overflow at768px/1920px, menu/Escape and saved theme. Visual reviewer approved composition and confirmed final dark/doc corrections.
- Citizen invoice FV/2026/0057 detail and office demo login/dashboard work. Original73 documents remain (22concepts/51published). Attachment downloadHTTP200/application/pdf,52999bytes,SHA256472a316ee2868bd85f50e2fe329dfc447bb840702fe9992af45073060824b149.
-279 tracked operational/shared/backend/config files compared unchanged against preimplementation hashes.
- Restored-folder repair: seven Mongo containers referenced stale host directory bind mounts, causing ready.js ENOENT. Recreated those containers with existing named volumes; all seven healthy. No reseed or data reset.

Reference screenshots are research evidence, not shipped product assets. Candidate screenshots are actual local browser captures. Native fullpage stitching initially painted an offscreen fixed skip link; focus-preserving opacity rules and keyboard regression resolved it. Final home/contact captures confirmed clean.

Decisions: reuse the restored checkout at the user’s request; execute the approved design without another permission round; follow pinned MetaFi rather than offer alternative directions. If any interpretation is wrong, the cost is a reversible design revision in the same checkout.

Final production interaction suite: MARKETING_URL=http://localhost:3000 pnpm exec playwright test tests/e2e/marketing.spec.ts --reporter=list —6passed in5.6s. A color-environment warning (NO_COLOR/FORCE_COLOR) did not affect tests. Implementer additionally passed35 distinct candidate regressions, marketing typecheck/lint/build.
