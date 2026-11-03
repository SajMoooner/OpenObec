# Assessment A — independent design review

Reviewer: marketing_critique_design. Target: apps/marketing. Mode: Persuade. Date: 2026-11-03. This is the independent A input to the parent's dual-agent synthesis, not a standalone detector report. No detector output was consulted. Baseline inspected before parent demo changes.

Evidence: PRODUCT.md, DESIGN.md, all six route files, all shared marketing components, CSS and error/not-found states; live localhost:3000 inspection of /home, /vyhody, /o-nas, /pricing, /kontakt and /demo in a fresh private background IAB tab. Live FAQ expansion and workflow tab selection confirmed. Mobile composition reviewed from committed candidate/home-mobile.jpg, features-mobile.jpg and pricing-mobile.jpg; those full-page captures are historical evidence, not a new mobile interaction test. No viewport or shared theme changes. Own tab closed. No server started. No ignore file found at .impeccable/critique/ignore.md.

## Design specificity

Product-grounded content inside a deliberately familiar SaaS visual system. The black/white Inter typography, thin borders, purple emphasis, generous spacing and shadcn controls form a coherent MetaFi interpretation worth preserving. The real office/citizen screenshots, six municipal agendas and concept→publication story make the content specific. However, repeating the same small set of screenshots and agenda cards weakens that specificity on subsequent pages: the reader sees a template rhythm more often than a new piece of product evidence. Improve editorial selection and image framing, not the visual language.

## Heuristic scores

Scores describe baseline marketing, not the portals themselves. No formal screen-reader/contrast certification implied.

| # | Heuristic | Score | Evidence / issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Active navigation, selected tabs and expanded FAQ exposed; demo handoff is less explicit than the surrounding content. |
| 2 | Match with real world | 3 | Strong municipal document language; GitHub contact requires a technical mental model. |
| 3 | User control and freedom | 3 | Normal anchors, clear home links, collapsible FAQ; no forced funnel on marketing. |
| 4 | Consistency and standards | 2 | Cohesive controls, but “demo” actions alternate between guide and officer login, bypassing role choice. |
| 5 | Error prevention | 3 | Synthetic-data and public-issue warnings are honest; proposed-price limitations are visually secondary. |
| 6 | Recognition rather than recall | 3 | Clear roles and workflow labels; mobile comparison requires carrying row context across a horizontal scroll. |
| 7 | Flexibility and efficiency | n/a | Persuade surface, not a repetitive work tool. |
| 8 | Aesthetic and minimalist design | 3 | Restrained hierarchy; repeated agenda and screenshot sections lengthen decision path. |
| 9 | Error recognition/recovery | 3 | Retry and home recovery exist; marketing error reassurance about saved documents is contextually misplaced. |
| 10 | Help and documentation | 3 | Applicable because trial guidance is a core purpose: useful FAQ and demo steps, but readiness answers are scattered. |

Total **26/36 (72%, Good)**. One excluded heuristic: 7. No P0 blocker identified in marketing-only review.

## Priority issues

1. **P1 — Demo intent has inconsistent destinations.** Header, hero and closing CTA lead directly to /uradnik/prihlasenie, while workflow and pricing demo links lead to /demo. The baseline /demo first viewport at approximately 1265×710 shows two role descriptions and instructions but no role entry buttons yet. A user choosing “demo” should make one obvious role choice, then enter the selected sandbox. Route generic demo actions through /demo; show two adjacent role cards with concise outcomes and entry buttons before long instructions/screenshots. Keep citizen and officer choices equally discoverable. Direct officer entry should be limited to the demo path. Parent is already implementing this authorized change; do not treat the baseline issue as still open after validation.

2. **P2 — Product screenshots often show the entire interface at an unreadable scale.** In the benefits hero, dense UI text is tiny relative to the marketing paragraph; mobile full-page evidence shows the same issue across feature cards. Two workflow stages also use exactly the same published.png, so changing tabs does not strongly communicate a new step. Retain authentic captures, but use purposeful crops of the relevant field/state/relationship, a short factual caption and optional accessible “Zobraziť celú snímku”. Pair each stage with evidence of that stage. Do not simulate a clickable screenshot or invent functionality.

3. **P2 — Long repeated sections delay decision-relevant information.** Home repeats six agenda names, six large agenda blocks and four editorial teasers after four feature panels; pricing inserts six agenda cards between plan cards and the comparison. Mobile home capture is roughly 8,900px tall. Keep the homepage workflow and proof prominent; make agenda repetition compact. On pricing move the comparison directly after plan cards, with a compact shared-feature line below. Preserve MetaFi spacing between major chapters while reducing repeated chapters.

4. **P2 — Pricing highlights the unavailable service more strongly than its status.** The purple 199 €/year plan correctly says “Pripravujeme”, but a skimmer sees a familiar purchasable pricing card and “Mám záujem”; implementation and VAT uncertainties live below the cards. Keep the purple card but group “Navrhovaná cena · službu pripravujeme” beside the price, and use a CTA such as “Informovať sa o pripravovanej službe”. Bring the existing cost qualification into the relevant card. On mobile the 620px comparison table hides the planned-service column; provide a visible scroll cue and retained row labels, or stacked comparisons.

5. **P2 — Contact invitation and available contact channel have different expectations.** “Porozprávajme sa” suggests a direct conversation, but the only actual contact is a public GitHub issue requiring an account. The current warning is excellent and must stay. Make the channel explicit earlier (“Otázky a podnety cez GitHub”) and make “Pripraviť verejný podnet” the strongest action; the repository-opening button is currently the visually dominant lower action although it does not start contact. A private channel could help later only if the project owner supplies a real one; never fabricate it.

## Route and component inventory

| Surface | Keep | Practical refinement |
|---|---|---|
| /home | Clear outcome headline, authentic overview, 3-step workflow, FAQ, decisive purple ending | Shorten duplicated agenda/editorial content; show a compact factual demo-status note near first CTA. |
| /vyhody | Split hero, three benefits, four-stage tabs, clear citizen/office distinction | More legible crops; distinct evidence per stage; avoid two adjacent CTAs that both go to /demo after routing changes. |
| /o-nas | Honest project story, verifiable 6/2/open-code facts, no fictional team | Primary hero GitHub action suits contributors more than municipal evaluators; add a secondary trial action. “2 portály” is clearer than “2 pracovné pohľady”. |
| /pricing | Two understandable operating models, explicit planned status, truthful qualifications | Put comparison sooner; strengthen status next to price; improve mobile comparison discoverability. |
| /kontakt | Genuine destination, public visibility warning, no pretend form | Align conversation wording with GitHub; prioritize issue composer over repository root. |
| /demo | Two roles, concise walkthroughs, real search, synthetic-data note | Make this a fast chooser first, guide second; avoid generic closing CTA that loops back to the same chooser. |
| Header/mobile Sheet | Clear brand, active page, labeled theme/menu, standard Sheet | Generic trial CTA should always share /demo destination. Five nav choices are manageable, no need to add dropdown complexity. |
| Footer | Three named link groups, project honesty | Consider role-anchor links to chooser for consistent demo routing; retain GitHub/docs as explicit external destinations. |
| CTA / DemoActions | Black primary/outlined secondary, purple terminal section | Keep one primary intent; don't render two synonymous links to same /demo destination. Adapt or omit terminal CTA on /demo itself. |
| FAQ | Five meaningful questions, real accordion state, good limitations | Pricing could emphasize operation/cost questions first; readiness caveats should not exist only behind collapsed items. |
| FeatureTabs | Four manageable stages, real selected state, no autoplay | Mobile puts selected image after all four triggers; keep selected text/image visually close or use an accordion-style presentation at narrow widths. |
| ProductImage | Authentic imagery, descriptive alt text, explicit synthetic captions, preload only priority | Support per-placement sizes/crops rather than one broad size hint; use narrower image request sizes in small cards. |
| AgendaStrip/Grid | Familiar municipal categories, consistent icons | Six categories are inventory, not six competing actions; compact duplicates rather than arbitrarily hiding agendas. Expand VZN once for non-officer readers. |
| Error / not found | Plain Slovak, retry/home recovery | Remove marketing error claim “Uložené dokumenty zostávajú zachované”; marketing does not manage saved documents. |

## Cognitive load

Moderate: **2/8 failed checklist items**. Single focus passes (one strong primary CTA); chunking fails (repeated six-card agenda blocks and five FAQ choices); grouping passes; hierarchy passes; one thing at a time passes within each section; minimal choices passes for conversion decisions (two roles/two plans); working memory fails for narrow comparison and separated mobile tab/image context; progressive disclosure passes through FAQ/tabs.

More-than-four visible choice points: five top-level navigation links plus separate trial action; five FAQ questions. These are recognizable browsing groups, not a critical “wall of options”. Six agendas and six principles are informational inventories, not action menus. Footer has nine links but groups them into three sets of three. Avoid using a simplistic four-item rule to damage this useful information architecture.

## Emotional journey

Entry: calm, confident typography and familiar municipal language establish order. First proof peak: real UI gives credibility. Mid-page valley: repeated cards, screenshots too small to inspect, and repeated claims of “poriadok” become a long scroll without new reassurance. Readiness valley: discover that the commercial offer and integrations are still planned. Terminal CTA restores direction, but baseline officer login interrupts the promised easy trial. The role chooser can create a stronger ending by leading immediately to an actual task; show synthetic-data reassurance at that decision, not another promotional pitch.

## Strengths

- Truthful, inspectable product proof instead of invented logos, savings, customer counts or testimonials.
- Consistent MetaFi/shadcn composition, restrained accent color, clear buttons and useful spacing.
- Sensible disclosure: FAQ, clear workflow, real source links, public-issue warning and planned-integration boundaries.

## Persona red flags

- Jordan, first-time municipal evaluator: “demo” changing destinations creates uncertainty; GitHub account requirement is an unexpected last step after a conversational CTA.
- Casey, distracted mobile visitor: long repeated agenda blocks and tiny whole-screen captures demand scrolling without helping choose; side-scrolling comparison conceals half the decision.
- Riley, skeptical evaluator: proposed 199 € price looks more settled than its qualification; two identical workflow captures can weaken confidence that stages were demonstrated separately. Existing candid limitations significantly reduce this risk.

## Minor observations and follow-up questions

No radical redesign is warranted. Keep typography, neutrals/purple, border radii, original mark and shadcn primitives. Make marketing more specific through one coherent sample-document story and evidence, not additional decorative effects. Do not infer legal compliance, customers, real integrations or operational service from the polish.

Questions for synthesis: Which single document should a first-time officer be able to publish in their first demo visit? Should the site's next conversion remain trying a sandbox, or registering interest in a future service? Would fewer whole-screen images and one readable annotated document communicate capability more convincingly?

Questions skipped: this is delegated Assessment A; the parent owns user-facing synthesis and final questions.
