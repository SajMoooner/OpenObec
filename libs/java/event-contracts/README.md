# Document events

`DocumentEvent` defines the exact snake_case version 1 full snapshot envelope published on `openobec.documents.v1`. The key is `obec_id:entity_type:entity_id`. Constructor checks envelope/data identity, version, supported paired agendas, event kind and tombstone consistency. Domain DTO validators and the published event JSON Schema provide field-level validation; the record is not a substitute for validating untrusted Kafka input against that schema.

Only five paired agendas emit events. VZN and attachment metadata do not participate. Every domain outbox row stores this full envelope under `event`; `published_at` and lease/retry fields are transport metadata outside the envelope. Source API outputs omit deleted/deleted_at, while event snapshots require both fields.
