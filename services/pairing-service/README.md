# Pairing service

Kafka full-state consumer into the shared Mongo read model. Java21, Kafka and the read replica set are required. Default actuator port: **8091**. It exposes no public document routes.

From root:

```sh
./mvnw -pl services/pairing-service -am -DskipTests package
services/pairing-service/run.sh
```

From this directory: `./run.sh`. The script uses the local JDK21 if JAVA_HOME is unset and builds a missing JAR; rebuild after source changes. Stop only this process with Ctrl-C. `/actuator/health` includes processed/retry/DLQ counters and reports DOWN during infrastructure retries.

| Variable | Host default |
| --- | --- |
| SERVER_PORT | 8091 |
| MONGODB_URI | mongodb://localhost:27023/openobec_read?replicaSet=rs-read&directConnection=true&serverSelectionTimeoutMS=2000 |
| KAFKA_BOOTSTRAP_SERVERS | localhost:9092 |
| OPENOBEC_EVENTS_TOPIC | openobec.documents.v1 |
| OPENOBEC_EVENTS_DLQ | openobec.documents.v1.dlq |
| PAIRING_CONSUMER_GROUP | openobec-pairing-v1 |

Docker build from root: `docker build -f services/pairing-service/Dockerfile -t openobec/pairing-service .`. In the container set MONGODB_URI to mongo-read:27017 with replicaSet=rs-read and Kafka to kafka:29092. The image includes the unchanged checked-in event schema. Use the same read DB as Query.

The shared [projection engine](../../libs/java/read-model/README.md) validates full v1 payloads, string amounts, tenant and envelope/data identity. One majority transaction replaces the source record and only its owned claims, recomputes canonical edges/independent owners and missing-target claims, and records event identity/version. ACK follows commit. Duplicates and old versions cannot resurrect tombstones; late targets resolve both directions. A generation writer fence serializes concurrent graph writers, and the driver retries transaction conflicts/unknown commits safely.

Invalid schema/data is retried twice after the first delivery, then sent to the configured DLQ with raw input and original topic/partition/offset/key. Only confirmed Kafka acknowledgement permits committing the source offset. Mongo/infrastructure errors retry indefinitely with a one-second backoff and visible DOWN status; they never silently drop or become DLQ records. A failed DLQ publication is retried and retains the source offset. Monitor `dlq` and inspect original metadata; do not discard DLQ messages. Correct the producer/schema or projection defect, then explicitly republish the corrected original full snapshot on its source key (same event ID is safe if projection never committed); run the ordinary consumer and verify the expected source version and pending references. Never erase or rewrite the source topic to repair data.

## Offline rebuild and initial authoritative bootstrap

Kafka retention is not an archive. Stop pairing before rebuilding; keep all five domain owners available. The command verifies that the configured consumer group has no members, gates Query, captures Kafka end offsets **before** any of the five consistent HTTP exports, imports every export page (including tombstones) into a fresh generation through the same `ProjectionEngine.apply`, then replays from the captured offsets to a fixed post-export barrier. Version checks make newer replayed states win. It verifies export identities/versions and all edge endpoints, checks the group is still inactive, installs and verifies exact barrier offsets, then atomically activates the generation and releases Query.

```sh
# pairing must be stopped; use the same topic/group/read DB as its next start
services/pairing-service/run.sh rebuild
# start pairing after a successful 'Rebuild active generation=...' message
services/pairing-service/run.sh
```

The rebuild accepts MONGODB_URI, KAFKA_BOOTSTRAP_SERVERS, OPENOBEC_EVENTS_TOPIC and PAIRING_CONSUMER_GROUP above, plus INVOICES_SERVICE_URL (8081), SUPPLIER_INVOICES_SERVICE_URL (8082), CONTRACTS_SERVICE_URL (8083), ORDERS_SERVICE_URL (8084), PROCUREMENT_SERVICE_URL (8085), all defaulting to localhost HTTP URLs. Docker sets the same variables to owning service DNS names. No domain DB access is used.

Run this bootstrap before demo seeding when the shared topic contains old synthetic test fixtures: fresh offsets exclude historical fixtures and authoritative owner exports determine current business records. No source-topic tombstones or topic deletion are needed. Existing generations and query snapshots are retained; ordinary reads select one active generation. An interrupted rebuild leaves Query gated and durable metadata describing its failed generation/offsets. Fix the dependency and rerun while pairing stays stopped. Do not manually turn readiness on after failure. Broker offset handoff and Mongo activation are intentionally separated by the persistent Query gate; a crash between them cannot expose a half-built generation.

Verification: `./mvnw -pl services/pairing-service -am test` with real infrastructure. Tests create only unique `openobec.task3.*` topics and random own read databases, remove only their resources, and never consume the production topic. The live broker test proves confirmed DLQ, unacknowledged actual Mongo write failure and subsequent recovery. The rebuild test covers pre-export historical exclusion, paged exports/tombstones, a concurrent event winning by version and exact consumer-group offsets.
