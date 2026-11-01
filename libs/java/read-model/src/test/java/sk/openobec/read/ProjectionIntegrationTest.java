package sk.openobec.read;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mongodb.client.*;
import java.util.*;
import org.bson.Document;
import org.junit.jupiter.api.*;
import sk.openobec.common.Json;

class ProjectionIntegrationTest {
  static MongoClient client;
  static ProjectionStore store;
  static ProjectionEngine engine;
  static String db = "task3_projection_" + UUID.randomUUID().toString().replace("-", "");

  @BeforeAll
  static void start() {
    client =
        MongoClients.create(
            "mongodb://localhost:27023/" + db + "?replicaSet=rs-read&directConnection=true");
    store = new ProjectionStore(client, db);
    engine = new ProjectionEngine(store);
  }

  @AfterAll
  static void end() {
    client.getDatabase(db).drop();
    client.close();
  }

  static ObjectNode event(String type, String id, int version, boolean deleted, String... refs) {
    var d = Json.mapper().createObjectNode();
    d.put("id", id)
        .put("obec_id", "zilina")
        .put("entity_version", version)
        .put("cislo", id)
        .put("predmet", "Predmet " + id)
        .put("zverejnene", true)
        .put("created_at", "2026-11-01T10:00:00Z")
        .put("updated_at", "2026-11-01T11:00:00Z")
        .put("deleted", deleted);
    if (deleted) d.put("deleted_at", "2026-11-01T11:00:00Z");
    else d.putNull("deleted_at");
    var a = d.putArray("suvisiace_zaznamy");
    for (int i = 0; i < refs.length; i += 2)
      a.addObject().put("typ", refs[i]).put("id", refs[i + 1]);
    switch (type) {
      case "faktury", "dodavatelske-faktury" -> {
        d.putObject(type.equals("faktury") ? "odberatel" : "dodavatel")
            .put("nazov", "Fiktívny partner");
        d.put("datum_vystavenia", "2026-11-01")
            .put("datum_splatnosti", "2026-11-01")
            .put("suma_bez_dph", "10.00")
            .put("suma_dph", "2.00")
            .put("suma_s_dph", "12.00")
            .put("mena", "EUR");
      }
      case "zmluvy" -> {
        d.putObject("zmluvna_strana").put("nazov", "Fiktívny partner");
        d.put("datum_podpisu", "2026-11-01")
            .put("datum_ucinnosti", "2026-11-01")
            .putNull("platnost_do");
        d.put("suma_s_dph", "12.00").put("mena", "EUR");
      }
      case "objednavky" -> {
        d.putObject("dodavatel").put("nazov", "Fiktívny partner");
        d.put("datum_objednania", "2026-11-01").putNull("termin_dodania");
        d.put("suma_s_dph", "12.00").put("mena", "EUR");
      }
      case "verejne-obstaravanie" ->
          d.put("nazov", "Obstarávanie")
              .put("cpv", "45000000-7")
              .put("predpokladana_hodnota_bez_dph", "10.00")
              .put("mena", "EUR")
              .put("lehota_predkladania", "2026-12-01T10:00:00Z")
              .put("stav", "otvorene");
    }
    var e = Json.mapper().createObjectNode();
    e.put("event_id", UUID.randomUUID().toString())
        .put("event_type", deleted ? "document.deleted" : "document.updated")
        .put("schema_version", 1)
        .put("entity_type", type)
        .put("entity_id", id)
        .put("entity_version", version)
        .put("obec_id", "zilina")
        .put("occurred_at", "2026-11-01T11:00:00Z");
    e.set("data", d);
    return e;
  }

  @Test
  void duplicatesOrderingTombstonesAndGenerationIsolation() {
    var e = event("faktury", "a", 2, false);
    assertTrue(engine.apply("order", e));
    assertFalse(engine.apply("order", e));
    assertFalse(engine.apply("order", event("faktury", "a", 1, false)));
    assertTrue(engine.apply("order", event("faktury", "a", 3, true)));
    assertFalse(engine.apply("order", event("faktury", "a", 2, false)));
    assertTrue(engine.apply("other", e));
    assertEquals(
        3,
        store
            .transaction(s -> store.record(s, "order", new Ref("faktury", "a")).getLong("version"))
            .longValue());
  }

  @Test
  void lateTargetsAndIndependentOwners() {
    engine.apply("owners", event("faktury", "a", 1, false, "zmluvy", "b"));
    assertEquals(1, count("pending_references", "owners"));
    assertEquals(0, count("edges", "owners"));
    engine.apply("owners", event("zmluvy", "b", 1, false, "faktury", "a"));
    assertEquals(0, count("pending_references", "owners"));
    assertEquals(1, count("edges", "owners"));
    Document edge =
        store.db().getCollection("edges").find(new Document("generation", "owners")).first();
    assertEquals(2, edge.getList("owners", Document.class).size());
    engine.apply("owners", event("faktury", "a", 2, false));
    assertEquals(1, count("edges", "owners"));
    engine.apply("owners", event("zmluvy", "b", 2, false));
    assertEquals(0, count("edges", "owners"));
    engine.apply("owners", event("zmluvy", "b", 3, false, "faktury", "a"));
    engine.apply("owners", event("faktury", "a", 3, true));
    assertEquals(0, count("edges", "owners"));
    assertEquals(1, count("pending_references", "owners"));
  }

  @Test
  void persistenceKeysIncludeTenantTypeAndIdentity() {
    assertTrue(
        ProjectionStore.recordKey("generation", new Ref("faktury", "identity"))
            .contains(":zilina:"));
  }

  @Test
  void rejectsMalformedSchemaBeforeAnyWrite() {
    for (var e :
        List.of(
            event("faktury", "x", 1, false),
            event("faktury", "y", 1, false),
            event("faktury", "z", 1, false))) {
      if (e.path("entity_id").asText().equals("x")) e.put("schema_version", 99);
      else if (e.path("entity_id").asText().equals("y"))
        ((ObjectNode) e.get("data")).put("entity_version", 5);
      else ((ObjectNode) e.get("data")).put("suma_s_dph", 12);
      assertThrows(IllegalArgumentException.class, () -> engine.apply("invalid", e));
    }
    assertEquals(0, count("records", "invalid"));
  }

  @Test
  void failedEdgeWriteRollsBackFullStateAndProcessedMarker() {
    engine.apply("atomic", event("zmluvy", "target", 1, false));
    engine.apply("atomic", event("faktury", "owner", 1, false));
    var update = event("faktury", "owner", 2, false, "zmluvy", "target");
    store
        .db()
        .runCommand(
            new Document("collMod", "edges").append("validator", new Document("a", "impossible")));
    try {
      assertThrows(com.mongodb.MongoException.class, () -> engine.apply("atomic", update));
      assertEquals(
          1L,
          store
              .transaction(
                  session ->
                      store
                          .record(session, "atomic", new Ref("faktury", "owner"))
                          .getLong("version"))
              .longValue());
      assertEquals(0, count("reference_claims", "atomic"));
      assertEquals(2, count("processed_events", "atomic"));
    } finally {
      store.db().runCommand(new Document("collMod", "edges").append("validator", new Document()));
    }
    assertTrue(engine.apply("atomic", update));
    assertEquals(1, count("edges", "atomic"));
  }

  @Test
  void concurrentOwnersCommitOneCanonicalEdge() throws Exception {
    try (var pool = java.util.concurrent.Executors.newFixedThreadPool(8)) {
      java.util.List<java.util.concurrent.Future<Boolean>> futures = new ArrayList<>();
      futures.add(
          pool.submit(() -> engine.apply("concurrent", event("zmluvy", "center", 1, false))));
      for (int i = 0; i < 20; i++) {
        int n = i;
        futures.add(
            pool.submit(
                () ->
                    engine.apply(
                        "concurrent", event("faktury", "f" + n, 1, false, "zmluvy", "center"))));
      }
      for (var future : futures) assertTrue(future.get(20, java.util.concurrent.TimeUnit.SECONDS));
    }
    assertEquals(21, count("records", "concurrent"));
    assertEquals(20, count("edges", "concurrent"));
    assertEquals(0, count("pending_references", "concurrent"));
  }

  long count(String coll, String gen) {
    return store.db().getCollection(coll).countDocuments(new Document("generation", gen));
  }
}
