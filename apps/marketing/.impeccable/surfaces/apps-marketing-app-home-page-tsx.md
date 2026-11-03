---
version: 1
slug: "apps-marketing-app-home-page-tsx"
primary_target: "apps/marketing/app/home/page.tsx"
related_targets: ["apps/marketing/app/vyhody/page.tsx", "apps/marketing/app/o-nas/page.tsx", "apps/marketing/app/pricing/page.tsx", "apps/marketing/app/kontakt/page.tsx", "apps/marketing/app/demo/page.tsx"]
---

# Current marketing contract — 2026-11-03

Mode: Persuade. Audience: municipal officer. The explicit approved MetaFi replacement overrides every historical visual instruction below. See apps/marketing/DESIGN.md and apps/marketing/PRODUCT.md for active tokens, typography, composition, truthful copy and controls. Reference evidence lives in docs/design/2026-11-03-metafi/reference. Hero is white, Inter, centered 68px/500, real dashboard. Purple CTA and near-black footer. No navy panorama; no IDSK3 marketing identity. Shared citizen/office styles and facts are untouched.

Home: product statement → dashboard → six agendas → feature panels → agenda grid → three-step workflow → FAQ → editorial links → CTA. Benefits owns manual vertical screenshot tabs; /demo owns functional citizen search and guided role entry. Video stays in documentation. Theme persistence, Sheet navigation, Accordion FAQ and native links remain functional. Local CSS/fonts/logo are marketing-only.

# Historical record — superseded, not implementation instructions



# Marketing OpenObec

Mode: Persuade. Audience: municipal decision maker evaluating a local demo. Primary action: open citizen or office demo. Approved comp: `.impeccable/mocks/marketing-navy.png`, user choice `navy`, 2026-11-01. Quality reference explicitly chosen by user: standard shadcn/ui examples. All typography/components/spacing are shadcn/ui; IDSK3 contributes colors ONLY.

## Current direction contract — latest user authority

This section supersedes the historical comp geometry and register instructions below. After the centered marketing refinement and real product previews, the user explicitly requested actual platform screenshots with a nice animation on the homepage, and moved the completed workflow video to GitHub. The homepage must not return to the illustrative register or embed the video.

THESIS: Show how one real demo document moves from office preparation to publication and citizen access, then make either role's demo easy to enter. Product credibility comes from actual working-interface captures and useful copy, not invented customers, savings, charts or legal guarantees.

OWN-WORLD: Genuine installed shadcn/ui New York controls, self-hosted Geist, and IDSK3 colors ONLY. Preserve the navy opening (#072c66), the approved civic panorama, white work surfaces and restrained blue actions. IDSK3 does not supply typography, components or a layout system. The panorama is a decorative approved asset, not a claim of geographic accuracy.

CURRENT COMPOSITION: A centered maximum 1280px shell, including 24px side gutters, aligns navigation, hero, showcase and later sections. Keep the bounded 36–56px headline, natural desktop grid and stacked mobile layout. Backgrounds may span the viewport; content does not scale with ultrawide monitors. The original 1536×1024 coordinates, right 61% panorama rule, 61px font-matcher measurement and fixed register/offer positions are no longer layout targets. Check 390/768/1440px widths without page overflow and keep the same bounded center at 2560/3440px.

HOMEPAGE SHOWCASE: `apps/marketing/app/home/publication-showcase.tsx` presents three unaltered 1280×800 screenshots from the successful real invoice FV/2026/0057 workflow: filled form → published office detail → citizen detail. All three show the same owned document, id `fak_d0f2b5d6-7a8a-422e-a71f-c5698c32aae4`; no fabricated save/publication success. Public assets are `apps/marketing/public/showcase/preparation.png`, `apps/marketing/public/showcase/published.png` and `apps/marketing/public/showcase/citizen.png`. Their provenance is `apps/marketing/public/showcase/README.md`; original captures, matching PDF and identity/download-hash proof are under `docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/`.

MOTION: One gentle focal sequence carries continuity between those three stages. Use installed shadcn Tabs/triggers with clear selected state, meaningful accessible names, descriptive image alt and concise role-specific captions. Provide visible pause/play controls. Manual touch/keyboard selection stops automatic advance, and keyboard focus remains with the selected control. A stable 8:5 frame and reserved caption space avoid layout shift; the default first screenshot is visible in server-rendered HTML before JavaScript. The authored transition is 280ms opacity plus 6px translation, with a readable six-second cadence. Pause advance offscreen and while the document is hidden. Reduced motion starts static and removes spatial transitions; manual selection remains useful. No parallax, tilt, bounce, animation dependency or fake loading.

VIDEO PLACEMENT: The finished real 39.24-second recording is documentation/GitHub media: `docs/media/showcase/publication.webm`, `docs/media/showcase/poster.jpg`, `docs/media/showcase/captions.sk.vtt` and `docs/media/showcase/README.md`. The homepage has no video element, video network request, video preload or video download, and marketing public assets contain screenshots only. `scripts/showcase/record.mjs` defaults to documentation output; a video rerun does not silently replace the approved homepage screenshots or alter incumbent records.

SEARCH AND ROLE ACTIONS: Keep a compact real search row that submits to citizen document discovery across agendas, plus both citizen and office demo CTAs. Do not replace the search with decorative screenshot controls. The screenshot tabs describe preparation/publication/citizen access; they are not the superseded agenda-filter tabs or three-row illustrative register.

PRODUCT STORY: Retain the actual labeled citizen and office product previews added to the homepage and reused in Benefits/Demo. `apps/marketing/app/components/product-preview.tsx` uses `apps/marketing/public/previews/citizen-contract.png` (library contract detail, PDF and related documents) and `apps/marketing/public/previews/office-overview.png` (office overview and draft/publication state). They are static examples with the visible caption “Snímka ukážkového prostredia”, not interactive screenshots or customer metrics. Preserve their scenario copy, provenance at `apps/marketing/public/previews/README.md`, and genuine links into the portals. The retained office image documents its capture-time 72-record state; current live totals may differ. `tests/e2e/support/capture-marketing-previews.mjs` waits for complete actual totals rather than hardcoding 72/24/48.

READING PATH: Product problem and both roles → real screenshot sequence and functional search → citizen/office scenarios with actual previews → six supported agendas → workflow → proposed 199€/year → FAQ → both demos. Demo status, fictional Žilina data, simulated integration, and unspecified setup fee/VAT remain explicit. No invented reference, address, live integration or compliance promise.

FINISH: Preserve raster provenance and the historical comp record; describe the current implementation in `DESIGN.md`. Verify real screenshots, selection/captions, motion pause/reduced-motion behavior, compact search, both demo destinations and bounded responsive composition. This is a surface-direction update, not permission to change engine state, rewrite historical raster evidence or repair drift by suppressing findings.

## Historical comp record — superseded layout and register

The following contract preserves the original approved comp record. Its absolute geometry, illustrative register, agenda tabs, three rows and font-matcher measurements are historical evidence only; they do not instruct the current surface. The latest contract above governs implementation.

### Original direction contract

THESIS: A conventional, polished software product page demonstrates document discovery immediately and makes both demo paths obvious.

OWN-WORLD: Standard shadcn/ui New York components and Geist. IDSK3 navy #072c66 owns the opening, white controls and blue actions sit above a pale register. The synthetic civic panorama is the one decorative asset; it never claims geographic accuracy.

STORY: The visitor sees the document problem, tries a real search that opens the citizen portal, then chooses either public reading or office publishing. Illustrative rows are explicitly synthetic; no invented customer, metric or legal claim.

FIRST VIEWPORT: At1536x1024, navigation sits at the top, the two-line61px headline starts near x125/y95 with support and two actions below; the panorama spans the right61%. The white register begins near x94/y391, contains search, agenda tabs and three sample rows; the offer begins near y753. Common desktop widths scale fluidly, mobile stacks naturally.

FORM: Category standard chosen deliberately (canon), then navy composition selected. seed:bf2abb90da53d612. The font matcher ranked Google Sans Flex nearest, but user explicitly pinned shadcn; use Geist, measured candidate61px. Genuine comp defects corrected in semantic UI: remove decorative eyebrow labels, remove unsupported word “bezpečné”, align initial active agenda with displayed rows. All ordinary control styles remain shadcn.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Earlier narrowing decision — retained history

The centered-width decision below remains part of the current contract. References to a register, its tabs/table, no new assets and frozen design documentation were superseded by the later real-product-preview and screenshot-sequence instructions above.

Používateľ po vyskúšaní žiada: „ma byt tak na strede ako je ten komponen vyskušajte obe strany obce“ a „pridaj tam vaic informácií na tu prvu uvodnu stránku“. Táto novšia požiadavka nahrádza absolútne súradnice a škálovanie pôvodného compu. Pôvodný obraz ostáva referenciou pre identitu (navy, panorama, register), nie autoritou pre šírku ani počet sekcií.

Spatial thesis: jeden stredový stĺpec max1280px vrátane24px bočných okrajov, spoločné hrany navigácie, úvodu, registra aj spodných sekcií. Nadpis clamp36–56px, žiadne zväčšovanie celej stránky podľa šírky monitora. Čítacia cesta: čo produkt rieši → funkčná ukážka → prínosy pre oba typy používateľa → agendy → postup → navrhovaná cena → FAQ → obe demá. Pozadia môžu byť celoplošné; obsah zostáva ohraničený. Mobil skladá stĺpce, stockshadcn taby/tabuľka majú lokálny posun; jadrovépoliaobčan/úradník sa nemenia.

Ide o rozšírenie existujúceho sveta, bez nových farieb, fontov alebo aktív. DESIGN.md/sidecar sa zachovajú; miestna displayveľkosť a rozloženie sa riadia týmto novším surfacebriefom. Inšpirácia štruktúrou: ShadcnStore landingtemplate a Shadcnblocks SaaS landing/pricing/FAQ; kód a texty sú vlastné, obrázok je pôvodne schválený.
