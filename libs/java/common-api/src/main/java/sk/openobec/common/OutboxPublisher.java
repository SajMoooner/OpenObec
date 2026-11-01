package sk.openobec.common;

import static com.mongodb.client.model.Filters.*;

import com.mongodb.client.model.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import org.bson.Document;
import org.springframework.kafka.core.KafkaTemplate;
import sk.openobec.events.DocumentEvent;

/** At-least-once publisher: broker ACK precedes published_at; crash duplicates are intentional. */
public class OutboxPublisher {
  private final RecordStore store;
  private final KafkaTemplate<String, String> kafka;
  private final String topic;
  private final String owner = UUID.randomUUID().toString();

  public OutboxPublisher(RecordStore store, KafkaTemplate<String, String> kafka) {
    this(store, kafka, DocumentEvent.TOPIC);
  }

  public OutboxPublisher(RecordStore store, KafkaTemplate<String, String> kafka, String topic) {
    this.store = store;
    this.kafka = kafka;
    this.topic = topic;
  }

  public int publishAvailable() {
    if (!store.definition().paired()) return 0;
    int sent = 0;
    var collection = store.database().getCollection("outbox");
    for (int i = 0; i < 50; i++) {
      Instant now = Instant.now();
      Document row =
          collection.findOneAndUpdate(
              and(
                  eq("published_at", null),
                  lte("next_attempt_at", Date.from(now)),
                  lte("lease_until", Date.from(now))),
              Updates.combine(
                  Updates.set("lease_owner", owner),
                  Updates.set("lease_until", Date.from(now.plusSeconds(30))),
                  Updates.inc("attempts", 1)),
              new FindOneAndUpdateOptions()
                  .sort(Sorts.ascending("created_at"))
                  .returnDocument(ReturnDocument.AFTER));
      if (row == null) break;
      try {
        var event = BsonJson.json(row.get("event", Document.class));
        String key =
            event.path("obec_id").asText()
                + ":"
                + event.path("entity_type").asText()
                + ":"
                + event.path("entity_id").asText();
        kafka.send(topic, key, event.toString()).get(12, TimeUnit.SECONDS);
        collection.updateOne(
            and(eq("_id", row.get("_id")), eq("lease_owner", owner)),
            Updates.combine(
                Updates.set("published_at", Date.from(Instant.now())),
                Updates.set("lease_owner", null),
                Updates.set("last_error", null)));
        sent++;
      } catch (Exception e) {
        if (e instanceof InterruptedException) Thread.currentThread().interrupt();
        long seconds = Math.min(60, 1L << Math.min(6, ((Number) row.get("attempts")).intValue()));
        collection.updateOne(
            and(eq("_id", row.get("_id")), eq("lease_owner", owner)),
            Updates.combine(
                Updates.set("lease_owner", null),
                Updates.set("lease_until", Date.from(Instant.EPOCH)),
                Updates.set("next_attempt_at", Date.from(Instant.now().plusSeconds(seconds))),
                Updates.set("last_error", e.getClass().getSimpleName())));
        break;
      }
    }
    return sent;
  }
}
