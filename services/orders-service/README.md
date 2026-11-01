# orders-service

Independent Java 21 / Spring Boot application for `objednavky`. The concrete `ObjednavkaRequest`, `ObjednavkaDefinition`, `ObjednavkaRepository` and `ObjednavkaController` own this agenda. Technical transaction, query, error and attachment mechanics are shared.

From repository root, start infrastructure with `scripts/dev/infra.sh up`, then run `services/orders-service/run.sh`. The wrapper builds its executable jar if missing; after code changes rebuild with `./mvnw -pl services/orders-service -am -DskipTests package`. Default port: **8084**. Default owning database: `openobec_orders` on localhost:27020, replica set `rs-orders`. No service reads another domain database.

Every data request needs `X-Obec-Id: zilina`. The authoritative paths are `/rest/v1/objednavky`, `/{id}`, `/{id}/update` and `/{id}/delete`; creates, updates and deletes use POST. Four attachment operations use `/{id}/prilohy`, `/{id}/prilohy/{file_id}/download` and `/{id}/prilohy/{file_id}/delete`. See root OpenAPI for exact editable fields and response envelopes. `GET /actuator/health` reports local health.

Configuration: `MONGODB_URI`, `KAFKA_BOOTSTRAP_SERVERS`, `SERVER_PORT`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`. S3 uses private path-style access. Owner HTTP URLs are `INVOICES_SERVICE_URL`, `SUPPLIER_INVOICES_SERVICE_URL`, `CONTRACTS_SERVICE_URL`, `ORDERS_SERVICE_URL`, `PROCUREMENT_SERVICE_URL`, defaulting to localhost:8081–8085. In Docker set those to owning service DNS URLs. URI credentials are never returned in API responses.

Build container from root: `docker build -f services/orders-service/Dockerfile -t openobec/orders-service:local .`. Supply the owning Docker Mongo URI and internal Kafka/S3/HTTP URLs from `.env.example`. Run on the infrastructure network and publish `8084:8084` only on localhost.

Every document mutation commits document, audit and nested full-state outbox event in one Mongo snapshot/majority transaction. A leased publisher sends to `openobec.documents.v1`, marks delivery only after broker ACK and retries pending rows after failure. Internal export/rebuild wire format is documented in `../../libs/java/common-api/README.md`.

Verification: `./mvnw -pl services/orders-service -am test` requires the real owning Mongo replica set and RustFS on default local ports. Tests isolate/drop a uniquely named Mongo database, compensate failed S3 uploads, and remove their own stored S3 files. They never reset shared volumes. Some tests intentionally provoke database validation errors to verify rollback.

Orphan recovery: compare S3 objects under `zilina/objednavky/` with this database's `attachments.object_key` values, including logically deleted attachments. Remove only keys with no metadata after ensuring no upload is in flight; resolve `storage_cleanup` entries by retrying their object deletions. Logical file/document deletion intentionally retains blobs until an explicit demo reset.
