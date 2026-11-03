# Marketing audit and demo entry — 2026-11-03

Method: dual-agent (A: marketing_critique_design · B: marketing_critique_evidence). Six live routes and shared components independently inspected before synthesis. Baseline score26/36 (Good), not a post-change rescore. See design-assessment.md for all ten heuristics, component inventory, cognitive load and persona findings; evidence-assessment.md for detector/browser details.

## Synthesis

Keep the coherent MetaFi/shadcn typography, restrained purple emphasis, authentic product images and truthful planned-service disclosures. Product specificity comes from municipal workflows; repetition and tiny screenshots weaken it on subsequent pages. The detector's single decorative-grid advisory matches the pinned reference and is retained deliberately; it is not a functional accessibility finding. Sampled muted text on white measured4.67:1; this was not a full contrast certification.

| Page | Priority refinement | Status |
| --- | --- | --- |
| Home | Consistent demo destination; reduce duplicated agenda content and improve screenshot framing | Demo routing fixed; editorial refinement recommended |
| Benefits | Distinct readable screenshots per stage; no duplicated demo CTAs | Duplicate CTAs removed; imagery recommendation remains |
| About | Add an evaluator-oriented demo action beside contributor GitHub action | Recommendation |
| Pricing | Comparison immediately after plans, stronger planned-service status beside price, mobile scroll cue | Recommendation |
| Contact | Name GitHub channel early; make public issue composer primary rather than repository root | Recommendation; no real private channel supplied |
| Demo | Two clear roles and direct entry, no repeated marketing CTA | Implemented |

Shared component recommendations: keep Sheet/Accordion/Tabs semantics; tailor image sizes/crops to placement; keep selected workflow evidence near its label on mobile; avoid repeating six-agenda grids. Header and generic CTA destinations are now consistent. Marketing error copy no longer claims anything about saved documents.

## Delivered behavior

All generic Vyskúšať demo actions lead to marketing /demo. Two side-by-side blocks show citizen and officer outcomes, actual product screenshots, and one clear action each; they stack on mobile. Citizen goes directly to its public home. Officer uses a native POST to the configured office /api/demo/enter, sets the existing HttpOnly/SameSite=Lax demo cookie and receives303 to /uradnik/home. No intermediary login screen, and no JavaScript required. Legacy /uradnik/prihlasenie redirects to marketing /demo. Existing JSON POST /api/demo remains compatible. No portal redesign, data mutations or reseed.

Office Docker health now checks dedicated GET /api/health: following the old root redirect inside its container would attempt the public marketing hostname. This keeps health independent of marketing routing.

## Verification

RED: new CTA routing test failed against incumbent because it went to officer login. Final Docker builds passed. Marketing/office typechecks and scoped lint passed. Final browser suite39passed in12.8s: role choice, clean-cookie direct officer entry, citizen entry, legacy redirect, no-JavaScript form, health endpoint, six routes at390/768/1440/2560, FAQ/tabs/theme and real search. Old guide ordered-list assertion replaced with named role-region checks because the requested page is now a chooser. Native desktop/mobile screenshots saved beside this report. Data creation/publication tests were not rerun because this change concerns entry/navigation and must preserve the existing demo data.

## Priorities for another iteration

1. Readable product evidence: purposeful crops and separate workflow-stage captures.
2. Shorter decision path: compact repeated agenda sections, comparison closer to pricing.
3. Clearer offer/contact wording: proposal status near price; honest public GitHub contact action.

Cognitive load baseline moderate: repetition and mobile comparison memory burden; no critical blocker. Emotional journey starts with credible real UI, loses momentum in repeated content and originally ended at an unnecessary login gate. The delivered chooser removes that gate. Skeptical evaluators still benefit most from clearer image evidence and price readiness. No alternate visual identity is proposed.

Run notes: slug apps-marketing-app; no ignore file; assessments independent; detector ran once with1advisory; both agents inspected separate background native tabs and closed them. Read-only browser evaluation prohibited mutable overlays, so CLI plus native visual/DOM evidence was used; no overlay or live server claimed/started. Existing Docker services remain running by user request. No temporary server created.
