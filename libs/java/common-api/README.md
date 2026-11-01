# Common API mechanics

Java 21 / Spring Boot 3.5. Concrete domain DTOs, allowed fields, reference matrices and business validation remain inside the six services. This library shares strict primitive checks, Mongo transactions/CAS, lists, error envelopes, HTTP reference lookup, attachment metadata and versioned exports. There is no shared universal business document schema.

Public reusable interfaces:

- `ApiException(int status, String code, String message, List<ErrorDetail> details)` and three-argument convenience constructor; `ErrorDetail(field, code, message)`. Errors always serialize as `error: {code,message,details:[],request_id}`. `ApiException.validation(...)` creates field validation errors. `ApiException.notFound()` creates 404.
- `Json.mapper()` uses Java time support, string ISO dates and strict scalar decoding. `Rules` validates JSON scalar types before typed record decoding, so missing versus explicit null can be distinguished by `DomainDefinition.normalize(patch, previous)`.
- `ListQuery.parse(Map<String,String>)`, `ListQuery.pagination(...)`, `ListQuery.number(...)`, `DomainController.parameters(MultiValueMap)` and `ReferenceValidator.validate(next, previous)` can be reused by Query. `ReferenceValidator` validates only newly added `{typ,id}` pairs against owner HTTP detail, with eight concurrent requests, one second request timeout and a twenty second whole-batch deadline; it never queries another owner's database.
- `RecordStore` provides only technical persistence mechanisms. `transaction(Function<ClientSession,T>)` uses snapshot read concern and majority write concern. Five bounded retries reread the latest state, apply the original selective patch and validate the resulting state. Same-field writes follow commit order. `_version` is internal CAS; paired domains expose the same value as `entity_version`.
- `BsonJson` maps ordinary amounts to Decimal128 without float/double. Valid amounts that exceed Decimal128 precision retain canonical exact decimal strings in Mongo; arithmetic and typed DTOs still use BigDecimal. The wire contract does not impose an undocumented maximum precision.
- `OutboxPublisher.publishAvailable()` claims pending rows using lease_owner/lease_until and marks published_at only after Kafka acknowledgement. Topic key is `zilina:agenda:id`. Delivery is at least once. All envelopes live under the outbox row's `event` key. Failure records attempts/next_attempt_at/last_error and retains the committed document.

Query can import `ApiErrors`, construct `Json.mapper()` and call the strict query helpers directly. Avoid scanning the whole `sk.openobec.common` package in a read-only Query application: `CommonConfiguration`, `ExportController` and the domain attachment/publisher beans expect a domain `RecordStore`. Domain applications intentionally scan their own package plus common. Query/pairing should configure their own read-database beans and tenant routing checks.

## Internal consistent export wire contract

This API is internal and must not be routed by the public gateway. It exists only for the five paired agendas. VZN returns 404. Every request requires `X-Obec-Id: zilina`.

Start a new export:

```http
GET /internal/v1/export?page_size=100
X-Obec-Id: zilina
```

Response 200 (JSON):

```json
{
  "schema_version": 1,
  "entity_type": "faktury",
  "obec_id": "zilina",
  "snapshot_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "created_at": "2026-11-01T12:00:00Z",
  "expires_at": "2026-11-01T12:10:00Z",
  "total": 1,
  "data": [
    {
      "event_id": "5e550218-b700-448b-9965-e8876d7b8fe7",
      "event_type": "document.updated",
      "schema_version": 1,
      "entity_type": "faktury",
      "entity_id": "fak_example",
      "entity_version": 3,
      "obec_id": "zilina",
      "occurred_at": "2026-11-01T11:50:00Z",
      "data": {
        "cislo": "FV-2026-001",
        "predmet": "Prenájom sály",
        "odberatel": {
          "nazov": "Syntetická organizácia",
          "ico": "12345678"
        },
        "datum_vystavenia": "2026-11-01",
        "datum_splatnosti": "2026-11-01",
        "suma_bez_dph": "10.00",
        "suma_dph": "2.00",
        "suma_s_dph": "12.00",
        "mena": "EUR",
        "zverejnene": true,
        "suvisiace_zaznamy": [],
        "id": "fak_example",
        "obec_id": "zilina",
        "entity_version": 3,
        "created_at": "2026-11-01T10:00:00Z",
        "updated_at": "2026-11-01T11:50:00Z",
        "deleted": false,
        "deleted_at": null
      }
    }
  ],
  "next_cursor": null
}
```

`event_type` is `document.updated` for every live exported state, including version 1, and `document.deleted` for tombstones. Export event IDs are generated once when freezing the snapshot and remain stable for every repeat of its pages. `occurred_at` is the domain row's `updated_at`, not export creation time. No export event is published to Kafka.

All documents, including tombstones, are frozen in a single Mongo snapshot transaction and sorted by ID ascending. Header and individually stored row chunks commit atomically. This avoids assembling the entire export in a single BSON document. Later writes/deletes do not alter continuation pages. Each row carries its source entity_version, so a consumer can feed it into exactly the ordinary event projection function; newer replayed Kafka states win and older versions cannot resurrect a tombstone.

Continue with the exact same page_size and the returned cursor (URL-encoded as a query value):

```http
GET /internal/v1/export?page_size=100&cursor=OPAQUE_VALUE
X-Obec-Id: zilina
```

`page_size` defaults to 100 and accepts 1–100. `next_cursor: null` is the only end-of-export marker. Empty exports return total 0, data [] and next_cursor null. The snapshot_id, created_at, expires_at and total remain fixed across pages. Cursors are opaque Base64URL references to random snapshot IDs, position and page size; this internal interface does not use the public Query cursor-signing protocol. Wrong shape, duplicate/unknown parameters or changed page size is 400 BAD_REQUEST. Missing/expired snapshots return 410 CURSOR_EXPIRED, checked in the application independently of delayed TTL cleanup. Tenant mismatch/missing header is 400. Snapshot lifetime is ten minutes.

For rebuild, capture Kafka starting offsets before requesting all five independent owner exports, project every page into a new generation, replay Kafka from those offsets using entity_version checks, then verify and activate the new generation. This library only supplies the domain side; pairing/query own the rebuild coordinator and generation switch.

## Private attachment storage

`AttachmentStore` streams upload to a bounded temporary file while hashing SHA-256, checks PDF/PNG/JPEG signatures and MIME, then streams the file to private S3. The owning Mongo transaction serializes changes on the parent and enforces at most ten active attachments. Parent deletion races conflict and retry, so an upload cannot commit against a deleted parent. S3 objects are removed after a confirmed metadata failure; failed compensation is recorded in `storage_cleanup`. A commit whose acknowledgement remains unknown is never treated as an abort: the stable file ID and object key are reconciled against primary/majority attachment metadata. Confirmed metadata returns success while retaining its bytes. An unresolved outcome returns503, retains bytes and records `attachment_reconciliation` identity for a later authoritative check; it never schedules blob deletion. Download never exposes object keys or credentials. Logical deletion retains blobs for audit; service READMEs document orphan reconciliation.

## Verification

Run `./mvnw test` from repository root with the real infrastructure running. Integration tests use random owning Mongo database names and the configured local private RustFS bucket. No Testcontainers substitution, embedded database or fake object storage is used. The reference validator's bounded network/error tests use an actual local HTTP server. Invoice tests also use the actual Kafka broker and an intentionally unreachable broker address to verify pending outbox behavior. Broker tests and the live harness inject `openobec.events.topic` / `OPENOBEC_EVENTS_TOPIC` with a uniquely owned temporary `openobec.task2.*` topic and delete only that topic on completion; production defaults remain `openobec.documents.v1`.
