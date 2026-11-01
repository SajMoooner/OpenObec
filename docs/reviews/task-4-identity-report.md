# Task 4 scoped request identity and HTTP diagnostics report

Status: complete. Commit: `0d2e0352639bf2b01935826636cb731381a23e07`. This is the delegated servlet identity/logging slice of Task4. Gateway/reactive logging, Docker images/runtime/UI, root Maven, infrastructure and fixture-helper changes remain controller-owned. Existing Task2 reports were not changed.

## Changes

- Added technical `RequestDiagnosticsInterceptor`, reused by common-api's six domain applications and QueryController.Web. Incoming `X-Request-Id` is accepted only when it matches **`[A-Za-z0-9_-]{1,100}`**; missing/invalid IDs become `req_<UUID>`. The same validated identity is retained in the request's `request_id` attribute and response header. Async redispatch reuses that attribute instead of generating another ID.
- Municipality remains exactly `X-Obec-Id: zilina`; missing/other tenant still returns the existing400 error contract. ApiErrors reuses the same identity for its wrapper/header, including exceptions such as415 that can occur before preHandle runs. Error codes, response envelopes, source/query business methods and download bytes are preserved.
- One completion event per request uses SLF4J fluent key-values `request_id`, `method`, `path` (request URI without query), `status`. Request-scoped attributes deduplicate advice/interceptor/async completion. No ThreadLocal/MDC is set, and errors in preHandle cannot leak an ID into another request. Health probes emit no HTTP completion records. Query text, bodies, authorization headers, files and secrets are not logged.
- Unexpected-error diagnostics use fluent request_id/exception_type fields rather than embedding only a plaintext ID. Error messages remain generic and do not log request bodies or exception messages.
- The six source service properties, Query properties and Pairing properties now default `logging.structured.format.console=${LOGGING_STRUCTURED_FORMAT_CONSOLE:ecs}`. Existing application names supply ECS service.name (serialized by Boot as nested `service: {name: ...}`); the environment override remains available. Gateway YAML is outside this commit.

## Owned changed paths

- `libs/java/common-api/src/main/java/sk/openobec/common/{RequestDiagnosticsInterceptor,CommonConfiguration,ApiErrors}.java`
- `libs/java/common-api/src/test/java/sk/openobec/common/{RequestDiagnosticsTest,StructuredRequestLoggingTest}.java`
- `services/{invoices-service,supplier-invoices-service,contracts-service,orders-service,procurement-service,ordinances-service}/src/main/resources/application.properties`
- `services/query-api/src/main/java/sk/openobec/query/QueryController.java` — Web interceptor registration and related imports only
- `services/query-api/src/main/resources/application.properties`
- `services/pairing-service/src/main/resources/application.properties`

No rootpom, Dockerfile, test Mockito resource, runtime launcher, seed, main-topic cleanup, frontend or other business/schema change is included.

## RED evidence

Command from repository root:

`JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl libs/java/common-api -am test -Dtest=RequestDiagnosticsTest#validIncomingGatewayIdentitySurvivesSourceApi -Dsurefire.failIfNoSpecifiedTests=false`

Result: **1 test, 1 assertion failure, 0 errors/skips**, exit1. The actual CommonConfiguration MVC interceptor replaced `gateway_123-ABC` with `8c13cabc-802e-448d-a5db-b46e253d3b82`. This reproduces loss of the gateway identity using production interceptor registration, not a duplicate test implementation. Log: `/tmp/openobec-task4-identity-red.log`.

## GREEN and package evidence

Focused command:

`JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B -pl libs/java/common-api -am test '-Dtest=RequestDiagnosticsTest,StructuredRequestLoggingTest' -Dsurefire.failIfNoSpecifiedTests=false`

Result: **8 tests, 0 failures, 0 errors, 0 skipped**, BUILD SUCCESS. Log: `/tmp/openobec-task4-identity-focused.log`.

Coverage:

1. Preserves a valid incoming gateway identity in header and source response request attribute.
2. Accepts strict valid IDs through the100-character boundary; invalid punctuation, whitespace, slash, Unicode, empty and101-character IDs get distinct valid req_ fallbacks.
3. Missing/invalid municipality remains400 with identical identity in response header, error wrapper and structured completion status.
4. Successful200 and failing422 emit exact method/path/status/request_id; query/body/authorization test secrets are absent.
5. An actual async streaming response retains its single generated identity through redispatch, emits one final completion and preserves exact PDF bytes; MDC remains unchanged after async and rejected-tenant requests, and a later request gets its own identity.
6. A415 rejection before preHandle still has a shared header/wrapper identity and completion event.
7. Health probes do not require the municipality or emit HTTP diagnostics.
8. Starts a separate real random-port Boot servlet fixture with Mongo/Kafka auto-configuration excluded, sends successful and failing actual HTTP calls, captures ECS console JSON and asserts service.name, request_id, method, no-query path, correct status, and absence of secrets. This does not connect to or stop a running demo application.

Complete root verification:

`JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home" ./mvnw -B verify`

Result: **BUILD SUCCESS, 148 Java tests, 0 failures, 0 errors, 0 skipped** across14 reactor modules. All nine Java applications packaged, including the six source services, Query, Pairing and Gateway. Duration53.148 seconds. Log: `/tmp/openobec-task4-identity-verify.log`. The controller subsequently changed only its own gateway logging; it explicitly confirmed this full-root proof remains valid for this common/source/query slice and asked not to repeat it for gateway-only changes.

Google Java Format applied to owned Java changes; `git diff --check`: exit0.

## Other observed checks and scope limits

`python3 -m unittest discover -s tests/contracts -p 'test_*.py'` ran12 tests: **9 passed, 3 failed** in controller-owned infrastructure fixture setup. Each temporary fixture copied the changed infra.sh but omitted its new `scripts/dev/docker_env.py` companion, causing Python exit2/missing file. Exact failures:

- `test_compose_defaults_apply_when_configuration_is_absent`
- `test_dotenv_credentials_and_bucket_reach_host_verification`
- `test_explicit_environment_overrides_dotenv_without_erasing_other_values`

Log: `/tmp/openobec-task4-identity-contracts.log`. The controller acknowledged and owns copying the new helper into that temporary fixture; this delegated scope did not edit those files or misreport the failures as passing.

No Docker runtime was stopped/restarted, no demo/seed record was written, and no shared Kafka message was fabricated/deleted/cleaned. Existing integration suites retain their isolated Mongo/topic/S3 teardown. The controller owns rebuilding images and verifying the final gateway-to-all-seven-HTTP-API identities and live structured fields after this commit; this report certifies source/test/package behavior rather than deployment of the updated images.
