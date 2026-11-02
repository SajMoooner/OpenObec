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
- Integrated verification and final review: COMPLETE; all scoped reviews clean, final full remote CI41410124949 passed on60530be. Earlier pending lines below are historical observations.

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

Final review DISPATCHED /root/final_refinement_review (gpt-6-astra), range625fc6d..d40e517; immutable package review-625fc6d..d40e517.diff. All6 tasks and2Task5fixrounds clean. User browser viewport reset and finalhomepage marked deliverable.

Fresh publication preflight d40e517:816trackedfiles, only.env.example tracked; .env/.env.ssh/.run manifest ignored.923unpublishedblobs, largest3,458,209B, none100MiB. Current+history high-confidence private-key/GitHub/AWS/OpenAI-token patterns had zero candidates. Scoped hygiene check only, not full security audit. GitHub read reconfirmed existing public repo/defaultmain d36084cfec953f4011c71ae3176d31ff67dcc7b5, unprotected. Final ancestry check required immediately before push.

Final whole-refinement review COMPLETE d40e517 by /root/final_refinement_review: I1 empty retained list page recovery and I2 long pending filename mobile overflow Important; M1 cross-agenda return label and M2 insufficient recent-record candidate sampling Minor. All four are in ONE final fix wave /root/final_refinement_fixes, BASEd40e517, brief final-fix-brief.md; no earlier finding is parked.

Ruling: accept each explicitly declined judgment scope from final review — (1) real auth/integrations/intelligent search/multiple municipalities/production hardening remain outside the authorized local demo, (2) original Java audit/CAS contract changes remain outside frontend refinement and maintenance requires no concurrent edits, (3) detail-page immediate-upload panel retains existing pending-file navigation behavior while active editor protection is fixed, (4) optional PDF/video authoring remains documented macOS/Chrome with overrides rather than a new cross-platform tool, (5) superseded comp/register/video-home requirements remain historical, (6) unrelated research/repository visibility/deployment stay untouched — these boundaries match the approved scope; costs if wrong are respectively additional production work, concurrent-maintenance protection work, reselecting an unuploaded file after leaving detail, porting authoring tools, visual rework, and separately authorizing research/publication/deployment changes. Every line is adjudicated rather than silently dropped.

Final fix wave COMPLETE d40e517..75dd3f6: I1/I2/M1/M2 all addressed; exactly one scoped re-review by /root/review_final_refinement_fixes, no new breakage.30 amended browsing/workflow tests passed21.6s, frontend23, type/lint and citizen/office production builds pass; covering hashes matched by reviewer. No data/asset writes. Controller native390 recovery confirmed both portals and preserved q/sort/state, zerooverflow; final filename chooser was interrupted before completion, no independent native result claimed for it (automated pending/validation/failed-upload/dirty tests pass).

Resume2026-11-02: all fix work was committed before interruption. Fresh Docker health attempt failed because Docker daemon socket is absent; current live readiness is not claimed. Earlier21healthy status and final frontend/30-test success remain dated evidence. Browser temporary viewport reset; no tabs remain. Final changed-file Impeccable detector exit0, no findings. Ready for authorized GitHub transfer after remote ancestry check.

Publication SUCCEEDED:2fa3338c5e3c8b181c71b690bd6189dd3b89cf6d atomically pushed to main and codex/openobec-demo. Remote main SHA, README/LICENSE/video blob SHAs and MIT recognition independently verified. First GitHub CI41404577570 found a new clean-run infrastructure waiting failure after healthy daemons: compose wait on completed init jobs reported no containers. Narrow post-publication CI repair is required; this is new execution evidence, not a second broad UI-review fix wave. Original UI findings are all closed.

CI readiness task implementation COMPLETE41f7d79 (base2fa3338). Three files only:infra.sh, standard-library wait_init.py, runtime regressions.11focused/19runtime/12contracts plus syntax/compile/Composeconfig pass. Root cause matches older Compose selecting only running containers; exact runner version not printed, no unsupported version claim. Review /root/review_ci_init_readiness running with immutable13KBpackage. LocalDocker remains unavailable; remote fresh run required.

CI readiness task REVIEW CLEAN41f7d79: spec/qualityPASS, zero findings. Atomic repair push SUCCEEDED e65d6a9 to main and codex/openobec-demo. New actual CI run pending. Earlier documentation-copy command failed before writing; these files are now archived correctly.

Remote run41406073384/e65d6a9: repaired infrastructure startup SUCCESS, contracts SUCCESS, runtime SUCCESS; Java verification currently running. This is actual clean-run proof for the init-readiness repair, not local simulation. Overall CI verdict still pending.

Remote run41406073384/e65d6a9 proves init repair, Java/frontend verification and actual full startup successful. Smoke failed one live seed-refresh case plus cleanup with gatewayHTTP429;70operation/seed/preservation checks and7offline refresh cases passed. New seed-client throttling repair will respect unchanged API limits and explicitly safe429 rejection, with bounded transport regressions and fresh remotevalidation. No hiding/skipping of tests.

Seed throttling implementation COMPLETEaaeb130, basee65d6a9. Gatewayhighestprecedence429 rejects before dispatch; same-buffer retries safe only for explicit429. At most3attempts, validRetry-After0..60 seconds/date,1/2second fallback, maximum120seconds intentional wait; network/5xx/body-read failures never retried, terminal originalHTTPError preserved.8focused/27runtime/12contracts/8offline refresh tests passed. Review /root/review_ci_seed_throttling running. No API limit/config/data/UI changes.

Seed throttling review CLEANaaeb130 by /root/review_ci_seed_throttling: spec/qualityPASS, no findings. Explicit predispatch429 safety confirmed; reviewer also ran focused8/8. Ready for next atomic push and actual whole-CI proof.

Run41408422911/d994d7f passed all real infra/startup/Java/frontend/smoke checks; browser67/69passed. Two test-only strict-locator ambiguities atworkflow-ux231/429 saw both success paragraph and transient Loading status. Narrow test selector repair required; no runtime or fixture changes. CI failure is directRED evidence.

CI status-selector repair COMPLETE29b4e7a, based994d7f: two qualified success-message locators only; all scenario assertions retained.69testcollection/projectlint/strictTS/format pass; disposable realbrowser harness confirms old ambiguity, fixed presence and negative missing/duplicate behavior. Review /root/review_ci_status_selectors spec/qualityPASS zero findings. Next fresh complete CI required; no application changes.

Final remote verification COMPLETE: run41410124949 on60530be6ec1e018b9a4c3414158e3c1680fc249f concludedSUCCESS on2026-11-02T08:11:11Z.12contracts/27runtime/148Java/23frontend/13smoke/69browserpassed; all3productionfrontends, types, lint and cleanstartup passed.70concreteHTTPfixtures validated. Remote receipt and unmodified concise log excerpts archived. All application/source/capture hashes match reviewed evidence; final commit is documentation/verificationmetadata only, so its archival push uses[skip ci] without changing the successfully tested code.

Finish: all7rulings archived inrulings.md, all23report/reviewfiles archived byte-identical; this final ledger is archived before deleting only this plan scratch directory. Existingcheckout/featurebranch and unrelatedresearchfiles remain. LocalDocker stilloff, so current localreadiness is not claimed. AuthorizedGitHubpublication complete; final documentationpush and exactremoteSHAverification conclude the handoff.
