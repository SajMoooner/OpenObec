disposition: fix

Inputs/scope: no separate QUALITY BAR image/card was supplied; the explicit user-selected standard shadcn/ui reference governs. All 32 named route/state captures were opened across the evidence rounds, including the corrected expanded office desktop capture; source was sampled, not exhaustively audited, and supplied behavior tests were not rerun.

## persistence

Pass. PRODUCT.md exists and records the final shadcn/ui + Geist / IDSK3-colors-only instruction. The marketing surface names the selected navy comp; marketing-navy.png.json records approved=true and the user's selection. Build state is in review: comps, spec, plates, hero, sections, motion and responsive are closed, with no forced records. Hero score is 0.8541; responsive score is 0.8557. The responsive checksum predates the current capture/source set, so it is historical evidence and must be refreshed by the final gate after repairs. The supplied actual diff directory is desktop, not final. FORM contains the reference seed:bf2abb90da53d612, independently confirmed by concept-seed --check-seed (exit 0). The corrected office-detail-expanded-desktop.png now shows its sidebar from the document top; evidence no longer requires recapture. The 28-entry standard capture manifest reports HTTP 200, no body overflow, console errors or warnings; the four expanded captures were additionally inspected.

## fidelity

The approved comp's salient inventory is a navy opening, top wordmark/navigation, large two-line white proposition on the left, two contrasting demo actions, a blue illustrated church/bridge/river panorama on the right, an overlapping white register with search/tabs/three rows, then a pale offer with price and three icon benefits, followed by the beginning of the workflow. Hero and desktop reports contain match/drift regions and no final missing or contradicted measurement. The paired skyline/headline crops and desktop comparison were opened. Numerical match does not excuse the responsive findings below.

| Element | Judgment | Evidence and authority |
| --- | --- | --- |
| TYPE | adaptation | Geist retains the comp's bold, broad sans-serif character, two-line hierarchy and dominant scale. Its finer lettering differences from the matcher-selected Google Sans Flex are authorized by the user's explicit Geist/shadcn instruction and marketing FORM. |
| MATERIAL | adaptation | The visible skyline remains a raster illustration with architecture, organic tree edges, bridge and water; it is not CSS geometry. The approved components/asset plan and source /assets/plates/skyline.png establish the shipped plate. The produced plate simplifies the distant hills and uses brighter blues, while retaining the focal scene and medium. |
| GROUND | adaptation | Pixel palette evidence reports the comp's navy cluster near #08386a versus the build near #082868, with cooler pale fields. Source uses the exact required #072c66 / #eff5fe / white palette. The user's colors-only IDSK3 requirement overrides the image model's hue drift; this is not an unauthorized warm/blue-black restyling. |
| Header and navigation | match | Wordmark, benefits, contact and white demo action retain desktop order and placement. |
| Headline and introductory hierarchy | match | Proposition remains the leading element above the two demo paths; panorama does not obscure it. |
| Primary actions | match | Blue citizen and white office controls retain rectangular shadcn treatment, readable labels and arrows. |
| Panorama placement and overlap | match | Right-side illustrated scene bleeds at the edge and sits above the register; mobile moves it below the actions without changing reading order. |
| White register, search and three rows | match | Dominant width, overlap, search heading/control and three-row density remain. Semantic controls replace image lettering. |
| Preview row actions | contradicted | Zobraziť sends the fixed sample title as a citizen search query rather than opening a represented document. Parent verified against 72 current API DTOs and seed payloads that none of the three initial preview titles exists, so all three initial row actions lead to empty results. This breaks the promised immediate demonstration of document discovery. |
| Agenda selection | adaptation | Initial Všetky tab agrees with the mixed sample rows; marketing FORM explicitly records correction of the comp's inconsistent active Faktúry tab. |
| Offer, price and benefit sequence | adaptation | Price and three benefits retain order and hierarchy. Removal of decorative eyebrows and unsupported bezpečné is recorded in FORM and required by craft floor/product truth. |
| Workflow and lower demo choices | adaptation | The comp's workflow beginning becomes the complete three-step sequence and two portal choices required by the product's demo objective. |
| Marketing mobile copy reflow | contradicted | Hiding line breaks concatenates words/sentences in the visible intro, price copy and structure benefit; this fails readable responsive translation, not the chosen composition. |
| Operate TYPE / MATERIAL / GROUND | match | Self-hosted Geist, real shadcn tables/forms, white and neutral surfaces, navy sidebar and pale-blue states match the code-led OWN-WORLD. No imitation physical material or comp obligation applies to these portals. |
| Citizen/office desktop task hierarchy | match | Search, document titles, metadata, downloads, related-document expansion, explicit publication state and grouped editor fields remain conventional and findable. |
| Operate mobile record lists | contradicted | Citizen home and office dashboard squeeze document names into narrow vertical strips; the office status/action and citizen action fall beyond the initial visible table edge. Office agenda list similarly spends most row width on amount/status and gives long names only a narrow column. Local overflow containment is present, but readability and state-at-a-glance fail the Operate promise. |
| Detail, expanded detail, login, editor and simulated IS screens | match | Fields reflow legibly, related records retain labels and full-document actions, attachments retain named downloads, and the one-button demo / simulated connection are explicit. |

Contract promises: THESIS holds on desktop and the main navigation/form paths, but mobile record scanning needs repair. OWN-WORLD holds: stock shadcn conventions are intentional, not a missing visual invention. STORY fails at the marketing sample-row actions, whose represented documents cannot be found; the citizen/office portion is supported by the displayed complete detail/download/linking flows and the supplied create/upload/publish/search/unpublish/error-recovery evidence; only sampled source and captured states were independently inspected. FIRST VIEWPORT communicates document access and both demo paths, while mobile text joining damages its finish. FORM is verified and its approved semantic corrections are implemented. Truth labels distinguish fictitious records, local demo and simulated IS; contact states the absent address and benefits states the undetermined setup fee/DPH. No invented customer, saving or legal compliance claim was found in reviewed screens. The one existing detector result is []; no second detector ran.

## ceiling

Reached for the intentionally conventional desktop shadcn reference and mobile forms/details. No extra ornament, custom lettering, decorative depth or motion is needed for the Operate portals. The unused native device that matters is responsive information grouping: metadata can sit beneath the document title instead of consuming separate narrow mobile columns. The marketing skyline and overlapping register already supply the approved persuasive commitment. Source confirms themed focus/selection/caret, named icon actions, loading/error/empty states, input retention and destructive confirmation; sampled palette contrast is sufficient (white on #126dff approximately 4.51:1; white on #0b4199 approximately 9.42:1). This is a sampled finish review, not a full accessibility certification.

## material_fixes

1. [Contract STORY / behavior truth] Repair the marketing preview row actions in apps/marketing/app/home/hero.tsx: examples Zmluva o dielo, Projektové práce and Údržba zelene are absent from the 72 current seeded API records, but Zobraziť searches their exact titles and lands in an empty state. Make every initial and agenda-tab row lead to an existing published demo document, or explicitly label it as an agenda preview and navigate to the populated agenda without a false title query. Preserve three-row density and honest synthetic labeling. Verify all three initial actions and each agenda-tab action against the actual running API; capture any changed preview labels/layout.
2. [Contract FIRST VIEWPORT / Operate readability] Reflow RecordsTable at mobile widths in packages/ui/src/features/shared.tsx:148–181 so document title and number have a usable width and agenda/status sit beneath or alongside them without hiding the open action or publication state; preserve amount where relevant. Apply to citizen home, office dashboard and office agenda list. Re-capture citizen-home-mobile.png, office-dashboard-mobile.png and office-list-mobile.png; acceptance is legible titles and visible state/action at 390 px without requiring horizontal scrolling for these core fields.
3. [Fidelity responsive translation / craft-floor copy] Preserve whitespace when marketing line breaks disappear: hero.tsx:97–100 and the price/structure copy combine with marketing.css:354–355,467–468,499–500 to render joined text. Use real inter-word/inter-sentence spaces or responsive spans; verify the mobile intro reads občanov. Jednoduchšia, the price copy reads evidenciu dokumentov, and all structure-benefit words remain separated. Re-capture mobile.png while retaining the approved desktop line breaks.

## keep

Keep the approved navy/raster/register composition, genuine shadcn + Geist conventions, exact IDSK3 palette, explicit synthetic/demo labels, full document/related-file information, and separate draft/published states.

---

## verdict

1. **Resolved — marketing preview actions.** The current desktop capture visibly labels the column “Príklad dokumentu”, the destination “Ukážka agendy” and each action “Otvoriť agendu”. Source now links directly to the corresponding citizen agenda without the nonexistent title query. The three-row composition remains intact. The supplied green regression evidence covers all 21 row actions across Všetky and the six agendas against populated published API results; the test source checks destination, nonzero results, publication state and visible record links.
2. **Resolved — mobile record readability and access.** Current citizen-home-mobile.png, office-dashboard-mobile.png and office-list-mobile.png show broad readable titles/numbers, agenda/status/amount grouped beneath them and the open action visible at the right edge. Publication state remains explicit. Source applies the two-column layout below 1024 px; supplied 390 px and 768 px regression evidence verifies fitting content and successful detail navigation. Reopened office-dashboard-desktop.png and citizen-list-mobile.png show no regression from the shared-table repair.
3. **Resolved — marketing mobile whitespace.** Current mobile.png visibly separates “občanov. Jednoduchšia”, “evidenciu dokumentov”, “agend obce” and “zrozumiteľným zobrazením”. Source preserves real spaces before the responsive breaks. Current desktop.png retains the approved desktop line breaks, navy scene and register hierarchy. Supplied rendered-text tests cover all three affected copy blocks.

## remaining

Clear. No regression from this repair batch was found in the reviewed captures and source. The original full-review record above is preserved as historical evidence. This ship verdict covers the three scored fixes, not a new full-surface review; final responsive measurement/checksum and build-state completion remain the controller's separate gates.

disposition: ship
