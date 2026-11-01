# Task4 — Gateway and runtime wiring

Base4c20d2e. Includes coordinated identity/logging commit0d2e035 and controller gateway/runtime changes. Task5frontend code is independently under final visual repair; shared Compose already ran all12apps from the current workspace. Node source/Dockerfiles are delivered with Task5 rather than this diff. Rootpom now registers every existing module, resolving Task3's coordinated uncommitted reactor registration.

## Behavior

SpringCloudGateway/Java21 explicitly routes70 known operations; Query/selector/relations before owners, no internalexport routing. X-Obec-Id fixedzilina, validated/generated X-Request-Id propagated exactly once. JSON1MiB/multipart21MiB streamed limits,2s connect/60s response timeout, bounded4096-peer fixed-window limiter1200/min default, contract-shaped errors/Retry-After. Underlying HttpClient retries explicitly disabled; actual reset test uses one upstream TCPconnection.

Common/source/Query request identity is shared, safe on async files and preHandle failures, no MDCleaks. Per-request structured ECS diagnostics contain service.name,request_id,method,path,status, no query/body/secrets. See task-4-identity-report.md for delegated exact RED/GREEN and testnames.

Nine Java Dockerfiles pinned to verified Temurin21 digests, nonroot UID10001. Sharedhealth script makes realHTTPhealth check. Appoverlay wires all9Java +3Next, ownMongoURIs/internalDNS and browserURLs separated, localhostpublishedports, heap/memorylimits and boundedlogs. Ordinary shutdown keepsvolumes. Explicitflag-only reset script provided; it has never been executed destructively.

Both launch modes are implemented by scripts/dev/{up,down,doctor}.sh and stack.py. Manual builds/runs independent executable jars and standaloneNext bundles, translates only known internal default hosts, keeps logs/PID/starttime registry. Default Docker builds/runs12images and calls an idempotent APIseed after readiness. First-generation bootstrap uses actual HTTPexports/capturedKafkaoffsets before normalconsumer (implementedTask3), respects configuredreadURI. No sourceMongo reads by coordinator/query/rebuild. Sharedstream/DLQ/group fixed in Compose to contractual names; standalone envknobs remain for isolatedtest use.

Public-image Docker environment helper avoids the observed blocking globalcredentialhelper for localUnixengines, preserves endpoint/Compose/Buildxpluginlocations, never copies credentials or edits globalconfig. ExplicitDOCKER_CONFIG/remotecontexts preserved.

## Verification

- Gateway initialRED5behaviorfailures; added unavailable/ratecaseRED. GREEN8tests afterimplementation. TCPreset regression confirms singleattempt. Actual7upstreamheaders exposed duplicate responsevalues; stub now sends real upstream XRequestId, RED1 failure, normalization beforecommit yields GREENall8. Final log/tmp/openobec-header-dedup-green.log, package+Dockerimage rebuilt/restarted.
- Fullreactor140tests passed beforeidentity; identityslice fullverify148tests0fail/errors/skips53.148s (/tmp/openobec-task4-identity-verify.log), then finalgateway8test/package passed10.376s on its finalchangedcode. All14Mavenmodules packaged. MACnativeDNS dependency is activated only on macOSaarch64; no dependency workaround in Linuximages.
- Runtime realNode renamed-process RED→GREEN; PID+UTCstarttime guards termination and reapschildren. RealTCP TIME_WAIT restart test RED→GREEN. Final2runtime testsPASS0.077s (/tmp/openobec-runtime-green.log). Portpreflight uses reuseaddress and boundedDockerDesktop-release grace; unrelated listeningports still rejected.
- Existing infra/contract12testsPASS2.645s after fixture now copies newdocker_env.py companion (/tmp/openobec-final-contracts.log). Canonicaldotenv secret/dollarhandling preserved.
- Manual complete productionup succeeded, all12apps+72seedrecords,5PlaywrightPASS18.1s (/tmp/openobec-manual-full-up.log,/tmp/openobec-manual-e2e.log). Individual9Java wrappers and3Nextdev+productionbuilds verified in course of implementation.
- Default `scripts/dev/up.sh docker` succeeded with all12images built and all12healthchecksUP,72seedrecords retained (/tmp/openobec-docker-trace-build-up.log). No specialDockerflags needed. Docker7PlaywrightPASS19.4s and fast4APIacceptancePASS6.824s; all70concrete responses schema-valid. Node visualfixes are now being handled in Task5 and will have finalcombinedE2Eevidence.
- Live7APIroutes through gateway each200 with exactlyone suppliedrequestID and total12; .run/request-identity-proof.json. ActualECSJSON logs observed from real source andgateway with sameID/service/method/path/status.
- OrdinaryDockerdown/up with namedvolumes preserved: all72fullsourceDTOs byte-equivalent as parsedJSON, originalPDFSHA2562ff3a6f9653d871136835945d12111d94da30a4d25bc882b6f416184a6cdfabb, and pre-restart signedgraphcursor/root stillvalid. .run/persistence-proof.json; logs/tmp/openobec-persistence-final-{down,up}.log. No reset/purge/historicalKafka cleanup.
- Scopedproject-only resources captured in .run/docker-resources.jsonl; final durableverificationreport will summarize. OtherDockerprojects untouched.

## Remaining coordinated work

Task5threeUIreview fixes, design documentation, finalfreshUIverdict; Task6finalcombinedchecks/wholebranchreview remain controller-owned. No merge/push/deployment outside this localworkspace.
