package sk.openobec.pairing;

import static org.junit.jupiter.api.Assertions.*;
import static sk.openobec.pairing.TestEvents.event;

import com.mongodb.client.MongoClient;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.bson.Document;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.config.KafkaListenerEndpointRegistry;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.*;
import sk.openobec.common.Json;
import sk.openobec.read.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class PairingKafkaIntegrationTest {
  static final String DB = "task3_pairing_" + UUID.randomUUID().toString().replace("-", "");
  static final String TOPIC = "openobec.task3." + UUID.randomUUID(),
      DLQ = TOPIC + ".dlq",
      GROUP = "task3-" + UUID.randomUUID();
  static final java.util.concurrent.atomic.AtomicReference<String> DLQ_TARGET =
      new java.util.concurrent.atomic.AtomicReference<>(DLQ);
  static AdminClient admin;

  @DynamicPropertySource
  static void settings(DynamicPropertyRegistry r) throws Exception {
    admin = AdminClient.create(Map.of("bootstrap.servers", "localhost:9092"));
    admin
        .createTopics(List.of(new NewTopic(TOPIC, 1, (short) 1), new NewTopic(DLQ, 1, (short) 1)))
        .all()
        .get(10, TimeUnit.SECONDS);
    r.add(
        "spring.data.mongodb.uri",
        () -> "mongodb://localhost:27023/" + DB + "?replicaSet=rs-read&directConnection=true");
    r.add("openobec.events.topic", () -> TOPIC);
    r.add("openobec.events.dlq", DLQ_TARGET::get);
    r.add("openobec.pairing.group", () -> GROUP);
  }

  @Autowired ProjectionStore store;
  @Autowired MongoClient mongo;
  @Autowired KafkaTemplate<String, String> kafka;
  @Autowired PairingListener listener;
  @Autowired KafkaListenerEndpointRegistry registry;

  @AfterAll
  static void end() throws Exception {
    try (var c =
        com.mongodb.client.MongoClients.create(
            "mongodb://localhost:27023/?replicaSet=rs-read&directConnection=true")) {
      c.getDatabase(DB).drop();
    }
    admin.deleteTopics(List.of(TOPIC, DLQ)).all().get(10, TimeUnit.SECONDS);
    admin.close();
  }

  void send(com.fasterxml.jackson.databind.node.ObjectNode e) throws Exception {
    kafka
        .send(
            TOPIC,
            "zilina:" + e.path("entity_type").asText() + ":" + e.path("entity_id").asText(),
            e.toString())
        .get(10, TimeUnit.SECONDS);
  }

  void until(java.util.function.BooleanSupplier check) throws Exception {
    long until = System.nanoTime() + TimeUnit.SECONDS.toNanos(20);
    while (System.nanoTime() < until) {
      if (check.getAsBoolean()) return;
      Thread.sleep(50);
    }
    assertTrue(check.getAsBoolean(), "Timed out waiting for Kafka/Mongo state");
  }

  @Test
  void actualBrokerDuplicateOrderConfirmedDlqAndMongoRecovery() throws Exception {
    var good = event("faktury", "a", 2, false);
    send(good);
    send(good);
    send(event("faktury", "a", 1, false));
    var bad = event("faktury", "bad", 1, false);
    bad.put("schema_version", 99);
    send(bad);
    send(event("zmluvy", "b", 1, false, "faktury", "a"));
    until(
        () ->
            listener.status().get("dlq").equals(1L)
                && store.db().getCollection("edges").countDocuments() == 1);
    assertEquals(2, store.db().getCollection("records").countDocuments());
    try (var consumer =
        new KafkaConsumer<String, String>(
            Map.of(
                "bootstrap.servers",
                "localhost:9092",
                "group.id",
                GROUP + "-dlq",
                "key.deserializer",
                "org.apache.kafka.common.serialization.StringDeserializer",
                "value.deserializer",
                "org.apache.kafka.common.serialization.StringDeserializer",
                "auto.offset.reset",
                "earliest",
                "enable.auto.commit",
                false))) {
      consumer.subscribe(List.of(DLQ));
      List<ConsumerRecord<String, String>> rows = new ArrayList<>();
      long until = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
      while (rows.isEmpty() && System.nanoTime() < until)
        consumer.poll(Duration.ofMillis(200)).forEach(rows::add);
      assertEquals(1, rows.size());
      var payload = Json.mapper().readTree(rows.getFirst().value());
      assertEquals(
          99, Json.mapper().readTree(payload.path("raw").asText()).path("schema_version").asInt());
      assertEquals(TOPIC, payload.path("source_topic").asText());
    }
    long before = listener.status().get("retries");
    store
        .db()
        .runCommand(
            new Document("collMod", "records")
                .append("validator", new Document("type", "impossible"))
                .append("validationLevel", "strict"));
    send(event("faktury", "recover", 1, false));
    until(() -> listener.status().get("retries") > before);
    assertEquals(
        0, store.db().getCollection("records").countDocuments(new Document("data.id", "recover")));
    assertEquals(1L, listener.status().get("dlq"));
    var offsets =
        admin
            .listConsumerGroupOffsets(GROUP)
            .partitionsToOffsetAndMetadata()
            .get(5, TimeUnit.SECONDS);
    assertTrue(
        offsets.getOrDefault(new TopicPartition(TOPIC, 0), new OffsetAndMetadata(0)).offset() <= 5,
        "failed state must not ACK offset 6");
    store.db().runCommand(new Document("collMod", "records").append("validator", new Document()));
    until(
        () ->
            store.db().getCollection("records").countDocuments(new Document("data.id", "recover"))
                == 1);
    until(
        () -> {
          try {
            return admin
                    .listConsumerGroupOffsets(GROUP)
                    .partitionsToOffsetAndMetadata()
                    .get(2, TimeUnit.SECONDS)
                    .get(new TopicPartition(TOPIC, 0))
                    .offset()
                == 6;
          } catch (Exception e) {
            return false;
          }
        });
    DLQ_TARGET.set("invalid/topic");
    long retryBeforeDlq = listener.status().get("retries");
    send(bad.deepCopy().put("event_id", UUID.randomUUID().toString()));
    until(() -> listener.status().get("retries") > retryBeforeDlq + 3);
    assertEquals(
        1L, listener.status().get("dlq"), "failed DLQ publication must not count as confirmed");
    assertTrue(
        admin
                .listConsumerGroupOffsets(GROUP)
                .partitionsToOffsetAndMetadata()
                .get()
                .get(new TopicPartition(TOPIC, 0))
                .offset()
            <= 6);
    assertEquals(
        org.springframework.boot.actuate.health.Status.DOWN, listener.health().getStatus());
    DLQ_TARGET.set(DLQ);
    until(() -> listener.status().get("dlq").equals(2L));
    until(
        () -> {
          try {
            return admin
                    .listConsumerGroupOffsets(GROUP)
                    .partitionsToOffsetAndMetadata()
                    .get()
                    .get(new TopicPartition(TOPIC, 0))
                    .offset()
                == 7;
          } catch (Exception e) {
            return false;
          }
        });
    registry.stop();
  }
}
