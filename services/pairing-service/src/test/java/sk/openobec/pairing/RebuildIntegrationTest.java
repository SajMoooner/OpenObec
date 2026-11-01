package sk.openobec.pairing;

import static org.junit.jupiter.api.Assertions.*;
import static sk.openobec.read.fixtures.DocumentEvents.event;

import com.mongodb.client.*;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.TopicPartition;
import org.bson.Document;
import org.junit.jupiter.api.*;
import sk.openobec.common.Json;
import sk.openobec.read.*;

class RebuildIntegrationTest {
  @Test
  void freshOffsetsBeforeExportsReplayAndAtomicGenerationHandoff() throws Exception {
    String topic = "openobec.task3.rebuild." + UUID.randomUUID(),
        group = "task3-rebuild-" + UUID.randomUUID(),
        db = "task3_rebuild_" + UUID.randomUUID().toString().replace("-", "");
    try (var admin = AdminClient.create(Map.of("bootstrap.servers", "localhost:9092"));
        var mongo =
            MongoClients.create(
                "mongodb://localhost:27023/" + db + "?replicaSet=rs-read&directConnection=true");
        var producer =
            new KafkaProducer<String, String>(
                Map.of(
                    "bootstrap.servers",
                    "localhost:9092",
                    "key.serializer",
                    "org.apache.kafka.common.serialization.StringSerializer",
                    "value.serializer",
                    "org.apache.kafka.common.serialization.StringSerializer",
                    "acks",
                    "all"))) {
      admin
          .createTopics(List.of(new NewTopic(topic, 1, (short) 1)))
          .all()
          .get(10, TimeUnit.SECONDS);
      HttpServer owner = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
      var store = new ProjectionStore(mongo, db);
      var engine = new ProjectionEngine(store);
      engine.apply("initial", event("faktury", "obsolete", 1, false));
      producer
          .send(
              new ProducerRecord<>(
                  topic, "old", event("faktury", "historical-test-fixture", 1, false).toString()))
          .get();
      Map<String, String> urls = new HashMap<>();
      for (String type : Ref.TYPES) {
        urls.put(type, "http://127.0.0.1:" + owner.getAddress().getPort() + "/" + type);
        owner.createContext(
            "/" + type + "/internal/v1/export",
            exchange -> {
              try {
                String query = exchange.getRequestURI().getQuery();
                boolean next = query.contains("cursor=");
                var out = Json.mapper().createObjectNode();
                out.put("schema_version", 1)
                    .put("entity_type", type)
                    .put("obec_id", "zilina")
                    .put("snapshot_id", type + "-snapshot")
                    .put("created_at", "2026-11-01T10:00:00Z")
                    .put("expires_at", "2099-11-01T10:10:00Z")
                    .put("total", type.equals("faktury") ? 2 : 1);
                var rows = out.putArray("data");
                if (type.equals("faktury")) {
                  if (!next) {
                    rows.add(event(type, "a", 1, false));
                    out.put("next_cursor", "page2");
                    producer
                        .send(
                            new ProducerRecord<>(
                                topic, "a", event(type, "a", 2, false, "zmluvy", "z").toString()))
                        .get();
                  } else {
                    rows.add(event(type, "deleted", 3, true));
                    out.putNull("next_cursor");
                  }
                } else {
                  rows.add(event(type, type.equals("zmluvy") ? "z" : type, 1, false));
                  out.putNull("next_cursor");
                }
                byte[] bytes = out.toString().getBytes();
                exchange.sendResponseHeaders(200, bytes.length);
                exchange.getResponseBody().write(bytes);
                exchange.close();
              } catch (Exception ex) {
                throw new RuntimeException(ex);
              }
            });
      }
      owner.start();
      try {
        var result = new RebuildRunner(store, "localhost:9092", urls).run(topic, group);
        assertEquals(result.generation(), store.transaction(store::activeGeneration));
        assertEquals(
            6,
            store
                .db()
                .getCollection("records")
                .countDocuments(new Document("generation", result.generation())));
        assertNull(
            store.<Document>transaction(
                s ->
                    store.record(
                        s, result.generation(), new Ref("faktury", "historical-test-fixture"))));
        assertEquals(
            2L,
            store
                .<Document>transaction(
                    s -> store.record(s, result.generation(), new Ref("faktury", "a")))
                .getLong("version"));
        assertEquals(
            1,
            store
                .db()
                .getCollection("edges")
                .countDocuments(new Document("generation", result.generation())));
        assertTrue(
            store
                .<Document>transaction(
                    s -> store.record(s, result.generation(), new Ref("faktury", "deleted")))
                .get("data", Document.class)
                .getBoolean("deleted"));
        assertEquals(
            2L,
            admin
                .listConsumerGroupOffsets(group)
                .partitionsToOffsetAndMetadata()
                .get()
                .get(new TopicPartition(topic, 0))
                .offset());
      } finally {
        owner.stop(0);
        mongo.getDatabase(db).drop();
        admin.deleteTopics(List.of(topic)).all().get(10, TimeUnit.SECONDS);
      }
    }
  }
}
