# SDD ledger — plan: docs/superpowers/plans/2026-11-01-openobec-implementation.md

Spec approved and implementation explicitly authorized by user on 2026-11-01. Baseline commit 58a6646 has documentation only; no executable tests existed.

Ruling: reuse current checkout on codex/openobec-demo rather than create a new worktree — desktop instructions prefer reuse and user research stays untouched — cost if wrong: implementation shares this checkout but is isolated from main by branch.
Ruling: execute the saved implementation plan without an additional plan-review stop — user explicitly said start implementation after approving the full design — cost if wrong: reversible implementation choices remain reviewable in the branch.

## Pre-flight

| Tasks | Shared interface | Check |
|---|---|---|
| 1,2 | Maven group, env, topics, source schemas | Exact sk.openobec and JSON contract specified; parent modules added only when present. |
| 2,3 | Full event data and outbox | Consumers must inspect produced event shape before coding; complete payload, tombstones, numeric versions fixed. |
| 2,4 | 54 domain/file routes | Explicit method/path routing; internal export excluded. |
| 3,4 | 16 read routes | Query routes precede domain paths. |
| 4,5 | Runtime gateway URL and browser rewrites | Browser sees same origin, no Docker DNS. |
| 1,5 | OpenAPI client types | Client generated after contract accepted. |
| 2,3,6 | Versioned export/rebuild | Inspect internal export contract before recovery code; no foreign DB reads. |
| 5,6 | Portal routes and public checks | E2E uses approved Slovak paths. |
| 1–6 | Own tests versus specified behavior | All have red/green or configuration/runtime checks; exact contracts derive from source snapshots. |

Task 1: in progress.

User amendment: frontend uses shadcn/ui exclusively; only colors from IDSK3. Source Sans Pro requirement revoked; use shadcn standard typography Geist and its component/spacing conventions. Applies to Task5 and all comps. No backend impact.

Task5: independent portal/client work begins inline by controller against accepted source contract while Task1 reviewer runs. Only frontend files; no backend/infra overlap. Marketing code remains gated on selected comp. User amendment applied before any UI edits.

Task 1: fix round 1/5 (1 addressed, 0 open — .env verifier parity; commits 0ecc620..9c70873).
Task 1: complete (commits 4808f5f..9c70873, spec and quality review clean;12 contract tests, actual7 replica sets/Kafka/S3 verified).
Task 2: in progress.

Task 2: fix round1/5 (2 addressed,0 open — retain S3 on indeterminate commit; strict trailing JSON; commits0d8c962..2cf0577).
Task 2: complete (commits9c70873..2cf0577, fresh spec/quality gate clean;113Java+48live+12contract tests).
Task 3: in progress.

Task5 inline checkpoint: typed OpenAPI client generated with compatible TypeScript5.9.3 (TS7 compiler removed factory required by openapi-typescript);13 client tests RED→GREEN, all workspace typechecks green, citizen navigation browser test RED→GREEN. Genuine shadcn CLI components added with Geist; IDSK3 only colors. Full citizen/office screens implemented, awaiting actual gateway/query integration and final visual checks.
Marketing: user chose canon then navy composition; approved image now .impeccable/mocks/marketing-navy.png. Spec/metrics measured; skyline asset checked score0.7736 with alpha/provenance, plan+asset review awaiting user. No marketing page code before asset gate.

Ruling: bootstrap initial demo read generation through current-offset capture plus authoritative exports before seed — safer alternative to auto-review-rejected synthetic cleanup tombstones; shared Kafka history is preserved — cost if wrong: incomplete projection, caught by rebuild/seed acceptance tests. Historical task-only offsets0:19,1:16,2:20; normal demo DBs empty. Future tests use isolated topics.

Task4 gateway begins inline, independent of Task3. Source70 routes fixed; controller owns gateway directory and module registration only after Task3 agent confirmed its rootpom edits finished.

Task3 review found Q3-1 boundary pending count and Q3-2 copied test fixtures; fix round1 dispatched to original agent, basef816428. Q3-3 minor test JVM notice deferred for final triage (agent may resolve cheaply). Cannot-verify: source70ops/outbox/money already covered by Task1/2 accepted evidence; rootpom registrations intentionally controller-owned and will be committed with Task4. Docker/runtime/bootstrap remains explicit Task6 acceptance, no contradictory claim.
Marketing assets approved through component-review receipt. Hero after3captures passes85% match; no first-viewport approval override needed. Main differences intentional under brief: Geist per user, IDSK3 exact navy, remove unsupported “bezpečné” and eyebrow, correct mixed-row active tab to Všetky. Sections built, moving to motion/responsive.
Task4 inline:7gateway tests GREEN, full root138tests GREEN with Task3 finalbase; runtime Compose overlay validates,12Dockerfiles provided with pinned bases and nonroot runtimes. Manual/Docker orchestration preserves volumes; actual runtime/bootstrap/seed stillpending.

Task3: fix round1/5 (3 addressed,0open — summary boundary pending count, shared test fixtures, owned-suite JVM notices; commitsf816428..4b198b3).
Task3: complete (commits2cf0577..4b198b3, spec and quality review clean;139rootJava tests,19read-side). Source70operations/outbox/money verified in acceptedTask1/2 reports; coordinated rootpom present and will be committed by controller; whole-stack Docker/bootstrap belongs Task6 and remains explicitly unclaimed until checked.
Task6: independent seed/rebuild/smoke work begins by a fresh implementer; controller continues Task4 runtime and Task5 portals. Ownership: agent scripts/{seed,smoke,rebuild},tests/integration,README.md,docs/runbook.md; controller tests/e2e,CI,frontend and Docker/runtime scripts. Fault tests require coordination with controller before pausing shared OpenObec dependencies.

Task6 backend scope delivered by seed_acceptance in4c20d2e: fast4PASS,70schema-valid real operation responses; fault1PASS45.265s; actual owner-export+Kafka rebuild1PASS5.876s exported83/replayed2; allresourcesrestored. DONE_WITH_CONCERNS interpreted as explicit delegated controller checks, not backend uncertainty; Docker/persistence/finalreview remain open.
Task4/5 proof: manual full production up succeeded (all12apps+seed), manual5Playwright PASS18.1s. Docker default `scripts/dev/up.sh docker` now built and started all12apps successfully (no specialenv flags), seed preserved12each. Docker7Playwright PASS19.4s, fast4APIchecks PASS6.824s, all70again validated. Source DBs populated only by APIs. Dockerimages12 built frompinnedbases, nonroot. Resource snapshot/finalrestartpending.
Ruling: fixed shared-stack Kafka topic/DLQ/group names in Compose and removed advanced overrides from.env.example — contracts declare onefixedstream, a newgroup without a rebuild could replay historicalfixtures; standalone service env knobs remain for isolatedtests — cost if wrong: operators needing custom sharedtopics must deliberately extend orchestration.
Actual local Docker credential helper stalled public pulls; default launcher now uses an isolated auth-empty projectconfig for localUnix engines while preserving realendpoint and discoveredCompose/Buildxplugin dirs; explicitDOCKER_CONFIG andremotecontexts stayunchanged. `docker buildx imagetools inspect` with this default helper succeeded; no globalDockerconfig/credentials altered.
Runtimebug RED→GREEN: Next changes process.title, so argv signature missedownNodeprocesses. Lifecycle guard now recordsUTCstarttime withPID, accepts renamedownedprocess, rejectsreusedPID, reapschildren; realNodeTCPtest1PASS andportreleased. Old3portalprocesses verified byPID/starttime/exactstandalonecwd andstopped; unrelatedprocessesuntouched.
Task4 integrationfix: common-api regeneratedrequestID instead of preservinggatewayvalue. Originaldomainagent owns scopedsharedinterceptor/Queryreuse/structuredlogsfix; REDvalidIDloss reproduced,8focusedGREEN, fullrootpackagepending. Controller gateway now adds equivalent structuredHTTPcompletion fields viaresponsebeforeCommit, ECSdefault. RootgatewayTCPresetregressionpassed withonePOSTattempt; disableRetry(true) explicitly set. RootfullJava140PASS beforeidentityaddition. Frontendtypecheck/lint/13clienttests/buildallGREEN.

Task4: complete (commits4c20d2e..4571edb, fresh spec and quality review Approved;148Java0fail/0error/0skip, final8gateway,2runtime,12contracts). Minor route-destination test coverage and expected failure warning noise remain nonblocking. Cannot-verify resolved: Task3 HTTP-export/captured-offset implementation accepted in Task3 and actual Task6 recovery exported83/replayed2; Task5 frontend/Dockerfiles remain its separate gate, real manual andDocker12app builds/health already verified.
Task4 persistence: ordinary down/up preserves all72 source DTOs, identical PDF SHA256 and pre-restart signed graph cursor (.run/persistence-proof.json). All21 OpenObec running daemons measured~2.69GiB inside8GiB Docker VM; unrelated resources untouched. Live seven source/query routes preserve exactlyone request-ID responseheader (.run/request-identity-proof.json).
Task5 finish fix round1: original ui_review_fixes repaired3material findings in onebatch (readable mobile+tablet record metadata, truthful populated marketing agenda previews, mobile whitespace);14focused browser regressionsGREEN. Controller full22browser testsGREEN32.3s; current host production builds all3GREEN; canonical capture refresh underway. Detector stays its single original run.

Task6: implementation/spec/quality gate complete (commits4b198b3..3d9e338 filteredTask6paths, Approved;minor doc/CI/outputnotes resolved3d9e338). CannotVerify resolved via acceptedTask3readside+actualrecovery,Task4launchers/health andTask5currentimage/sourcegate. RemoteCI intentionallyunrun/unclaimed; finalwholebranchreview remains nextglobalgate, not skipped. Finalfreshroot148Java/12contract/2runtime,13client,22browser31.6s,4smoke8.587s/all70schemas GREEN. Currentlogs /tmp/openobec-final-*.log.
Task5: freshImpeccablefullreview+oneverdictpass SHIP, all3materialfixesresolved, mechanicalresponsive86%match, noforce. Freshdocumenterwrotevalidated DESIGN.md andsidecarv2; currentfinishship recorded. Per-tasksource spec/qualityreviewpending.

Task5 material source review I1 confirmed: existingprocurementdeadline seconds/fractions andDSToverlapinstantcanchangeon unrelatedsave. Fixround1/5fresh scopedimplementer fix_portal_datetime dispatched (originalTask5controllerinline), baseb1ec1c1; requiredRED/GREENclientandrealofficeeditchecks. MinorM1malformedJSONApiErrornormalizationdeferredtofinaltriage. MinorM2reportcookieclaimcorrectionpendingafterworkerappend. FontCannotVerifyresolvedbyactualChromeCDPfont-proof: allSlovakdiacritics4weightsusecustomGeistonly, nofallback; nofontchangejustified.

Task5: fixround1/5 (I1deadlineprecision andM1malformedApiError addressed,M2reportcorrected,0open;commitsb1ec1c1..882d947). Freshscopedreview specCOMPLIANT/qualityAPPROVED; fontCannotVerifyresolvedactualChromeCDPallSlovak4weightsGeistonly. Historicalcraftfloor/initialRED recordedbycontroller/workerreports; cannotindependentlyderivecalltimingfromgitdiffbutnorealimplementationgap. Priorbackend/runtime/CIboundariesownacceptedgates; remoteciunrunexplicit.
Task5: complete (commits3d9e338..882d947, initialfulltaskreview+scopedfixroundApproved, visualSHIP/current86%mechanicalfinish,noopenfindings). Parentcurrent20client/25browser24.4s/4smoke6.356sall70fixturesGREEN;workerall3host/Dockerproductionbuildshealthy. Allsix taskimplementationgatescomplete;finalwholebranchreviewnext.

UsersteeringTask7: approvednarrowcenteredhome+moremarketinginfo, standardshadcntemplatesinspiration. Scopeonlymarketinghome/header ifneeded,FAQ/content/layouttests. No newworldorasset; priorcompabsolutegeometrysupersededbyexplicituserlayoutrequest. Controllerinlinewhileonefinalfixworkerownsseed/InverseLinks/gatewaytest. Initialnewlayout-scopeddetect[]; originalfulldetectornotrerun. SeeTask7brief/spec.
Finalreview returned2Importantseedtargetdeletionstartup/falseinverseboundaryowners+Minor7upstreamstubcoverage. Onefinalfixwave final_fix_wave dispatchedallfindings, basef66a124; noadditionalbroadreviewwave. Declined-to-judge list acceptedasexplicitapprovedscope(localunauthdemo,onecity,norealIS/registries/intelligentsearch/legalguarantees,notproductionHA).

Ruling: honorlatestexplicitcenteredwidth/morecontentinstructionascurrentordinaryrefinementauthority;preserveoldcomp'sfailed63%responsivegateOPEN andrecordcurrentsource/capturehashesseparately, nofakepass/noarchival/configmigration — neweruserinstructionoverridesskillgeometryguidelineandreviewcontractacceptsquoteduserdowngrade;engineEnglishreasonrejectedSlovakquotation — costifwrong: oldexactcompgeometryisnotcertifiedfornewpage,butcurrentnewbriefvisual/code/behaviorchecksremainreviewable.
Currentrecord .impeccable/review/current-refinement-finish.json. Oneautomaticapprovaltimeoutonforcewasretriedonceasallowed;retryexecutednormallyanddesignengine(notpermissionreview)refusedreason. No pendingpermissionrejection. Alltoolstate/failureevidencepreserved.

FinalwholebranchfixwaveI1/I2/M1allADDRESSED/no newbreakage, APPROVED5f24195; declinedscopeaccepted. Task7: complete (commits5f24195..8c7d992+finalcopycorrection, source spec/qualityAPPROVED, newbriefvisualSHIP afterconcretehashboundpersistence). HistoricalcompresponsiveOPEN63% retained, nofalsepass. Allrequireduserworkcomplete; rootfull148Java/12contracts/6runtime/21client/28browser24.4s/5smoke7.483s/all70GREEN,currentnormalupready72,21healthy4.44GiB. Reviews/evidence/rulingscopiedtodocs/reviewsbefore scratchcleanup; no furtherrequiredwork. Keepbranchperapprovedplan,nopush/merge.
