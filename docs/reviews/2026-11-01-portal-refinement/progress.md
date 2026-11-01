# SDD ledger — plan: docs/superpowers/plans/2026-11-01-portal-refinement.md

Start: 2026-11-01. Baseline 4a3f798. User approved all design and UX changes; no approval pending. Reuse current codex/openobec-demo checkout. Root research artifacts are unrelated and remain untouched.

## Preflight

| Tasks | Shared file/interface or self-check | Resolution |
| --- | --- | --- |
| 1 | Domain metadata, URL state, safety tests agree with files | Safe context limited to current portal list/home; presentation pure, no monetary conversion. |
| 2 | Dirty guard, workflow tests and preserved API semantics | No destructive resets; own test fixtures. Separate helper permitted to keep editor readable. |
| 3 | Real product examples, typography, four pages | Only own screenshots or genuine rendered shared components; no template copying. |
| 1–2 | shared.tsx/table, detail/editor context, shell | Sequential; task 2 retains task 1 signatures and safe return context. |
| 1–3 | shared design system, citizen previews | Task 3 consumes completed task 1 UI; no theme token replacement. |
| 2–3 | office previews and design documentation | Task 3 begins after task 2 review, screenshots from current version. |

Ruling: reuse this suitable branch checkout rather than create a second worktree — desktop instruction and existing running environment — mistakes remain reversible locally.
Ruling: proceed directly under the user's explicit implementation approval — no redundant design/plan gate — reviewable plan is committed before code.
Ruling: run existing browser suite once at the integrated end in addition to focused per-task tests; changed shared workflows run relevant regression tests at task 2 — avoid repeated unrelated suites — final evidence must target fresh app builds.

## Tasks

- Task 1: COMPLETE c17055b; report task-1-report.md; review task-1-review.md. Frontend23, browser8, builds/type/lint pass. Reviewer /root/review_browsing approved spec and quality, zero findings. Native390/desktop visual confirmed; initial grid/scroll findings fixed before commit.
- Task 2: COMPLETE 2265a3a, BASE 5e64971, report task-2-report.md and review task-2-review.md. Frontend23, workflow12, existingbrowser32, type/lint/builds pass. Reviewer approved spec/quality zero findings. Native manual guard/validation/detail and notebook findings fixed before commit.
- Task 3: COMPLETE 26f57a0, BASE 2265a3a, report task-3-report.md, review task-3-review.md. Marketing28/unit23/type/lint/3builds pass,20captures. Reviewer passed zero findings. New user requests Task4 data and Task5 video supersede captured fixture text/static hero; refresh required.
- Task 4: COMPLETE (commits15f669e..e20f6d0, review clean). report task-4-report.md; review task-4-review.md by /root/review_realistic_records, spec/quality approved zero findings. Initially all72 refreshed; later user's differing version5 preserved (71baseline exact+1preserved).
- Task 5: COMPLETE (commitse20f6d0..413b520, spec/quality approved). Report task-5-report.md; review task-5-review.md by /root/review_publication_showcase. No blocking findings; one minor inheritedNO_COLOR/FORCE_COLOR test-output warning, final suite already running with NO_COLOR unset. Final homepage is3actualscreenshots+animation;39.24svideo retained underdocs/media/showcase forGitHub. Noexisting72writes.
- Task 6: documentation COMPLETE (commits413b520..a53b8c4, review clean). report task-6-report.md; review task-6-review.md by /root/review_open_source_readme, zero findings. MIT/README/contributing/thirdparty/seedguide delivered. Controller owns actualpush afterfinalreview.
- Integrated verification and final review: pending.

Ruling: editor routes use full-document navigation boundaries so native beforeunload reliably covers browser traversal; shadcn dialog covers explicit in-app exits — Next App Router offers Link onNavigate but no stable general traversal blocker; avoiding global history mutation — cost is a full page load entering/leaving an editor, while browsing retains soft navigation. Official Next installed link.md and https://developer.chrome.com/docs/web-platform/navigation-api document the distinction.

## Extended preflight after direct user requests

| Tasks | Shared file/interface | Resolution |
| --- | --- | --- |
| 4 self | catalog, explicit migration, PDF outputs and tests | Ordinary rerun still no-op. Only demonstrably owned untouched fixtures refreshed; identities/relations retained; generated PDFs bundled for stdlib seed runtime. |
| 5 self | actual recorded UI, media player and tests | Real source/public same-id/PDF proof. Static register replacement explicitly requested by user; compact real search retained. |
| 1–4 | data-dependent browser queries/numbers | Replace obsolete DEMO assumptions without weakening history/search/domain tests. |
| 1–5 | homepage search destination | Compact search keeps real citizen query route and navigation state. |
| 2–4 | domain summaries/attachment names/reference labels | IDs/relations unchanged, human data changes only. Confirm precision and actual-file behavior. |
| 2–5 | native editor guard/save publication | Record actual path using existing app; no staged success or bypassing persistence. |
| 3–4 | two product screenshot assets/provenance | Refresh after migration, source IDs stay stable. |
| 3–5 | hero/static-register tests/designbrief | User explicitly superseded register with video; replace obsolete tests with media + actual search/links. |
| 4–5 | realistic invoice/PDF/capture content | Sequential, video after data. Own showcase invoice remains available, snapshot provenance stays accurate. |

Native route matrix first sweep made120 observations but browser viewport override did not consistently target intended tab: actual unique route/width pairs53 (citizen1440=26observations,citizen768=13,office390=81). Zero overflow/loading/console failures in actual observations, but NOT120unique checks. Final matrix must use one owned tab or verify expected viewport for each observation; redo after Task4/5 fresh realistic content. body.textContent error detector initially matched serialized Next boundary strings, corrected to rendered innerText; no actual visible errors.

Ruling: allow explicit realistic refresh of invoice fak_1f75c3a0-1859-4ecc-b7a4-a1d7e8f0a6c3 when its entire editable payload, expected relations and owned PDF exactly equal the legacy fixture despite entity_version3 — user requested replacing default demo content and there is no differing user content to preserve; keep backup/current-version evidence and strict protection for any differing content/attachments/resumed writes — if the restoration was intentional, old fixture content remains recoverable from the migration backup. Task2 author was asked for precise edit/revert evidence; no ownership assertion is inferred merely from timing.

Later at19:25:07Z the same invoice changed to version5 (DPH+0.01, total+0.01, optional ICO null). No controller/test ownership evidence; preserved as a user's edit. All72 migrated successfully before that edit; final71baseline exact+1preserved, PDFs retained. Task4 report documents evidence and ordinary/explicit rerun protection.

Final native matrix first completed portion: after Task4 fresh data, one owned tab6 across all ports, actual innerWidth asserted on every row. All40 citizen/office routes at390/768/1440 =120unique route-width pairs, zero page/table overflow, no stuck loading, no missing h1, no rendered failure. Fresh finalRows array in CUA is authoritative; old auditRows is not. All6 blank forms show8/8/6/5/7/5 linked errors, focus alert summary; VZN summary link focuses effective-date field at y315–352 above sticky actions. Console warnings/errors empty. Marketing12pairs and wide sizes pending Task5.

Task4 cannot-verify-from-text-diff note resolved: report records all72 PDF parse/representative render inspections and live72hash/identity checks; reviewer read actual final log, controller independently viewed both fresh product screenshots and all40 portal pages. No residual evidence gap.

Additional native390 checks: zero-result search is honest and offers reset; reset restores10recent rows/emptyquery. Citizen mobile Sheet Escape closes dialog and restores focus to Otvoriť navigáciu (after awaiting close animation). Visual inspection confirms readable empty/result/form layouts.

Task5 final candidate media:39.24s VP9 1280×800, source/public/fixturePDF hash same, owned FV/2026/0057. Parent inspected poster/form/publication/publicdetail frames and nativekeyboardplay/pause (time9.5367 advancing, pause26.6394), SKtrackshowing/readystate4/noautoplay/no loop/noerror. Requested only mobilecue size0.875rem because native default shrinks with smallvideo. Task5 implementer handles beforefinalcommit.

Native matrix COMPLETE132unique route-width pairs after Task5 freshappbuild, zero failedchecks; additionally8wide observations (all4marketingroutes at2560/3440), allcontent1280px and exactcenterrelativeclientwidth. Initial secondarywide selector excluded main itself; corrected targetedselector measuredremaining6, not assumed. Results transcribed docs/reviews/2026-11-01-portal-refinement/native-route-matrix.json. Finalcaptionadjustment and finalcodechecks pending.

Impeccable critique-storage latest apps helper automatically closed historicalsnapshot because localtargetcontent is no longer current; oldscore75/116 is preserved, no rescoring or forcedpass. All5original priorities have independent implementation/test/nativeevidence; finaldetector stillpending.

Final scoped Impeccable detector ran once on apps +packages/ui/src +presentation.ts: exit0, one advisory only, existing selectionbackground #c3d9f9 at globals.css85 outside indexedfrontmatter. globals.css unchanged in this refinement; DESIGN.md201 explicitly preserves selection/scrollbarcolors. Intentional narrow existingcolor, no sourcechange or detectorrepeat. Full output archived impeccable-detector.json.

Finalcue adjustment verified natively at390: readable0.875rem SKcaption, video advances to8.7781 andSpacepauses, readyState4/noerror. InitialSpace during metadata buffering did not start; after readiness normalkeyboardplay succeeds. No fabricatedmedia/autoplay claim.

LATEST USER STEERING: replacehomepagevideo with realplatformscreenshots and niceanimation; keepvideo onGitHub. Pushwholeproject and polishedopensourceREADME. ExplicitlicenseanswerMIT. Task5brief/plan replaced, retaining completedmedia/proof and owned0057. Task6added. Existing native matrix remains valid for unchanged routes; changedhome must get fresh390/768/1440 andwide checks plusanimation/keyboard/reducedmotion evidence. Oldvideo-playerchecks are historical, notfinalhomepageproof.

GitHubpublication preflight: existingpublic SajMoooner/OpenObec, defaultmain d36084cfec953f4011c71ae3176d31ff67dcc7b5, no branchprotection. Auth works with normalnetworkpermissions; initial restrictedghauth error was environmental, notexpiredcredentials. gitpush --dry-run featurebranch succeeded (noactualpush). Tracked764files and unpublishedhistory secret-patternscan hadnocandidates; .env/.env.ssh ignored, only.env.example tracked. Unpublished860blobs largest1.62MB beforeTask5media, noneover100MiB. These are scopedprepublicationchecks, notasecurityaudit.

Ruling: afterfinalreview push currentprojecthistory to featurebranch and fast-forward existingdefaultmain, withoutforce — explicituser askswholeproject onexistingpublicGitHub andopensourceREADME; initialmaincontains no competingprojectwork and dryrunaccessverified — defaultbranch/CI becomespubliccurrentversion; recheckremoteancestry immediatelybeforewrite and preserveanyremotechanges.

Integrated browser suite on413b520: env -u NO_COLOR pnpm test:e2e →59/59pass50.0s, exit0, no runtime/environmentwarnings. Log archived browser-suite.log. Resolves Task5minor inheritedenvironmentwarning, no projectcode change needed.

Task5 additional controller finding after initialgate: marketing-showcase.spec.ts73–78 requires local-only recorded0057; freshCIseed only0041–0052, so this test is not portable. Fix round1/5 running original /root/publication_showcase afterTask6implementation finished, FIX_BASEa53b8c4. Change only realsearchtest to actual default publishedrecord, preserve fullresultassertion, no newseed/no mocks/no0057mutation. Focusedtest+lint then scopedreview required. Publication blocked until fixed/reviewed; other58tests unaffected.

Latest screenshot home independently checked:132unique route-width matrix retained with newhome390/768/1440 and2560/3440 remeasured;3PNG1280images loaded, no video, zerooverflow, exactwidecenter/max1280. Native selectedpublication→ArrowRightcitizen, manualstop;Play advancedthroughstages andPause heldselectedstage. Changed-home detector rerun justified by userreplacement:exit0,[]; priorwholeUI oneexistingselectioncolor advisory remains documented. Native reduce/offscreen/hidden behavior additionally covered by freshbrowser tests.

Task5 fix round1 COMPLETE a53b8c4..22dc757: standard published seed0041 used by actual search assertion; focused case1/1 passed. Scoped review task-5-fix-1-review.md ADDRESSED, no new breakage. Full project pnpm lint subsequently exit0 with no warnings; isolated warning resolved.

Task5 fix round2 COMPLETE 22dc757..5f402ee: exact Impeccable surface brief aligned with latest screenshot/motion authority; 18 paths verified, historical comp preserved. Scoped review task-5-fix-2-review.md ADDRESSED, no new breakage. No open findings.

Integrated verification COMPLETE: 59 browser tests on final application code, followed by one changed-test portability check;132 native route-width combinations plus8 wide, final screenshot home rechecked;21 Docker services running healthy. Final broad review is next.
