# Task 1 implementation report

Status: complete. Commit: `0ecc6200136931c9d7751868a7b19d34ca5047f0`. Scope: infrastructure, build parent/wrapper, API/event contracts and contract checks only. No application Java or frontend implementation. User research and controller-owned visual artifacts were untouched.

## Deliverables

- `compose.yaml`: isolated project `openobec`; seven independent MongoDB single-node replica sets, Kafka KRaft, RustFS; loopback-only published ports, named persistent volumes, bounded caches/heaps/container memory, bounded Docker logs, readiness, idempotent topic/bucket setup and RustFS non-root volume ownership.
- Images verified by successful pulls and pinned to manifest digests: Mongo 8.0.17, Apache Kafka 4.1.1, RustFS 1.0.0-alpha.78, AWS CLI 2.31.30, Alpine 3.22 plus digest.
- Kafka INTERNAL `kafka:29092`, EXTERNAL `localhost:9092`. Topics `openobec.documents.v1` and `.dlq`, three partitions each, replication 1, seven-day/128 MiB-per-partition retention and 32 MiB segments. Auto topic creation disabled.
- Root `sk.openobec:openobec-parent:0.1.0-SNAPSHOT`, Java 21, Boot 3.5.16, Cloud 2025.0.3. Empty reactor intentionally registers modules only as they are created. Apache Maven Wrapper 3.3.4, official launcher and binary, Maven 3.9.11, SHA-256 distribution/bootstrap pins.
- `.env.example` contains both host and Docker URI variants; host Mongo uses directConnection=true. `infra.sh` supports up/down/status/logs/verify; ordinary down preserves volumes. `java.sh` verifies JDK 21 and runs parent build or an existing service.
- OpenAPI 3.1 covers exactly 70 concrete operations (46 original + 24 marked attachment additions), 16 read-only query operations, independent six agenda write schemas, decimal strings, source wrappers, explicit service ownership, tenant/header/query bounds, response/error schemas and streamed attachments. JSON-compatible YAML avoids a dependency for the base contract suite.
- Event schema uses JSON Schema 2020-12, five paired entity types, schema_version=1, event types `document.created`, `document.updated`, `document.deleted`, complete `data` snapshots with deleted/deleted_at/version; VZN excluded. Identity agreement across envelope/data remains an application validation responsibility.
- Repeatable real verification clients under each infrastructure directory and short infrastructure READMEs.

## Red/green evidence

1. Before contracts existed, `python3 tests/contracts/test_contracts.py` ran 8 tests and failed all 8 with the intended assertion: `The published contracts/openapi.yaml contract is missing` (exit 1).
2. Generated contracts; the same 8 tests passed (exit 0).
3. Added an omitted-patch-fields regression; 9 tests ran, 1 failed because `FakturaUpdate.zverejnene` inherited create's default false. Removed creation defaults from all update properties; 9/9 passed.
4. A real second infrastructure startup reproduced a Compose `up --wait` race: successfully completed RustFS init exited 0 but Compose treated that completed job as a failed long-running service. Inspected init logs and exit states. Changed launcher to await daemon health separately, wait for both init jobs, then explicitly assert both exit 0. Repeated startup and the complete verification command passed.

## Final verification (2026-11-01)

- `python3 -m unittest discover -s tests/contracts -p 'test_*.py'`: **9 tests, 0 failures**. This is the complete current repository test suite; no service modules exist yet.
- Java 21.0.9+10, official Wrapper Maven 3.9.11: `scripts/dev/java.sh` and `./mvnw -B verify`: **BUILD SUCCESS**. This verifies parent/BOM resolution, not compilation of future application modules.
- `docker compose config --quiet`: exit 0; bash/sh syntax checks: exit 0.
- Formal OpenAPI validator 0.7.2: OpenAPI 3.1 valid. JSON Schema validator 4.25.1: event schema valid under 2020-12.
- **30 actual source response fixtures** (24 domain list/detail/create/update and six joined detail/pending examples), replacing only illustrative obec_001 with approved zilina, validated against the published schemas.
- **15 valid full event fixtures** (five source domain records × create/update/delete) accepted; **15 corresponding invalid numeric/unknown-money payloads** rejected.
- `OPENOBEC_PYTHON=.tools/venv/bin/python scripts/dev/infra.sh verify`: exit 0. **7 Docker-DNS commit+rollback checks + 7 host-port commit+rollback checks**, all real MongoDB sessions. All seven replica sets report writable-primary readiness.
- Kafka: actual external metadata is localhost:9092, actual internal broker metadata is kafka:29092. Host producer → internal consumer and internal producer → host consumer both succeeded with exact message bytes. Only uniquely named temporary probe topics removed.
- RustFS: private bucket exists; actual host put/get and Docker-DNS byte read match the PDF probe; anonymous object read returned **403**. Only uniquely owned probe object removed.
- Final digest-pinned stack was recreated against existing named volumes and verified successfully; no volume reset, no unrelated containers stopped.
- Idle infrastructure measured about **1.45 GiB** aggregate resident container memory on an 8 GiB Docker VM; this is infrastructure only, not the eventual full application stack.

## Local verification environment and concerns

- Host originally had no JDK. Ignored project-local JDK is `.tools/jdk-21.0.9+10/Contents/Home`; use `JAVA_HOME="$PWD/.tools/jdk-21.0.9+10/Contents/Home"` and prepend its bin directory to PATH. Python clients are in ignored `.tools/venv` (pymongo 4.15.4, kafka-python 2.2.15, boto3 1.40.65).
- Docker Desktop's global `docker-credential-desktop get` helper stalled on public pulls. Public images and all checks succeeded without global changes using isolated `DOCKER_CONFIG=/tmp/openobec-docker` and `DOCKER_HOST=unix:///Users/simonochotnicky/.docker/run/docker.sock`. Temporary config has no credentials and points at Docker Desktop's existing CLI plugin directory. Only task-owned stalled client processes were terminated.
- RustFS version is an explicitly pinned upstream **alpha**, appropriate to the approved local demo scope; production suitability is not claimed.
- `/suvislosti` preserves its original nested `data.projection` example; joined views preserve top-level `projection`. Consumers must respect this source distinction.
- Standard validation of fixture references emitted one upstream RefResolver deprecation warning during an ad hoc validator invocation; contract tests, build and runtime checks have no outstanding failures.
- Infra stays running for subsequent implementation. No full application or whole-stack acceptance claim is made in Task 1.

Report is retained in the intentionally ignored implementation workspace; the commit contains only the 22 Task 1 deliverable files.

## Review fix round 1: verifier configuration parity

Review finding: `.env` customizations used by Compose startup were absent from host verifier processes, so custom S3 credentials or bucket failed verification.

Covering test command: `python3 tests/contracts/test_infra_config.py`.

- RED, before launcher changes: 3 tests ran, **2 failed**, exit 1. The dotenv case received default credentials/bucket; the partial explicit-environment override case retained the default bucket instead of the dotenv bucket. The default-only case passed.
- The regression uses temporary project copies and synthetic credentials, the **real Docker Compose configuration parser**, stubbed Docker engine/network actions and host verification clients. The actual project `.env`, existing services and stored application data are never changed. Captures remain in temporary fixture files and tests assert that credentials do not appear in stdout/stderr.
- Launcher now reads resolved `docker compose config --format json` in memory and passes S3_ACCESS_KEY, S3_SECRET_KEY and S3_BUCKET through the host verifier subprocess environment. Compose performs dotenv parsing, defaults and explicit environment precedence. No dotenv file is sourced as executable shell and no resolved configuration is printed.
- One intermediate covering run exposed Compose's canonical serialization escaping: a literal `$` is rendered `$$`. Added one-time decoding before subprocess export; covering tests now include quoted dotenv values with spaces/hash/dollar characters and explicit environment values containing both `$` and `$$`.
- GREEN: `python3 tests/contracts/test_infra_config.py`: **3 tests, 0 failures**, exit 0.
- Full current contract suite: `python3 -m unittest discover -s tests/contracts -p 'test_*.py'`: **12 tests, 0 failures**, exit 0.
- `bash -n scripts/dev/infra.sh` and `git diff --check`: exit 0.

Review fix commit: `9c70873033a6df7dfa0b4bc0d67baf0dafe6e0e3` (launcher + isolated regression tests only).
