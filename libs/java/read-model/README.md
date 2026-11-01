# Shared read model

Technical read-side storage shared by Pairing, Query and the offline rebuild. It does not read domain databases or define business fields. The unchanged v1 event schema from `contracts/events` is packaged as a resource at build time.

Public interfaces:

- `new ProjectionStore(MongoClient, databaseName)` creates the eight read-side collections/indexes, including active-generation metadata for `zilina`. `transaction(Function<ClientSession,T>)` uses snapshot reads, majority writes and the Mongo driver's transaction retry/unknown-commit handling.
- `ProjectionStore.activeGeneration(session)` reads `projection_metadata` under the same snapshot as all records/edges. It throws API503 when rebuild has gated Query. `record(session,generation,Ref)` returns the full stored state, including tombstones. `ProjectionStore.live(record)` checks availability.
- `new ProjectionEngine(store).apply(generation, JsonNode)` validates the exact event envelope/full data schema and applies one complete event atomically. Returns false for duplicate IDs/older versions. `applyActive(JsonNode)` selects the active generation in that transaction. Both methods use exactly the same full-state algorithm. Each generation has independent processed IDs, record versions, claims, pending references and edges.
- `ProjectionStore.setReady(false)` gates reads before an offline rebuild; `activateGeneration(generation)` atomically selects the completed generation and enables reads. The rebuild coordinator must stop/verify inactive pairing, capture/replay Kafka, verify export state and hand off offsets before activation. Never call activation merely because exports finished.
- `Ref(typ,id)` uses the exact five agenda names, supports canonical sorting and provides `{typ,id}` BSON with collision-free keys. `Ref.allowed(source,target)` is the source selector/reference matrix.

Storage documents carry `generation` and `obec_id`; compound primary keys additionally include document/event/edge identity. A generation writer fence makes source-claim replacement, edge owners, late-target resolution and processed-event insertion one serialized Mongo transaction. Source payloads remain strings for amounts and retain every DTO field; Query strips only deletion internals and filtered nested references. No complete graph is stored in a single BSON row.
