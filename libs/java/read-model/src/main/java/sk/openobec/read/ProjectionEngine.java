package sk.openobec.read;

import com.fasterxml.jackson.databind.JsonNode;
import com.mongodb.client.*;
import com.mongodb.client.model.*;
import java.util.*;
import org.bson.Document;
import sk.openobec.events.DocumentEvent;

/** The single full-state projector. Explicit generations make rebuild reuse ordinary delivery. */
public final class ProjectionEngine {
  private final ProjectionStore store;
  private final EventValidator validator = new EventValidator();

  public ProjectionEngine(ProjectionStore store) {
    this.store = store;
  }

  public boolean apply(String generation, JsonNode raw) {
    var event = validator.validate(raw);
    return store.transaction(s -> apply(s, generation, event));
  }

  public boolean applyActive(JsonNode raw) {
    var event = validator.validate(raw);
    return store.transaction(s -> apply(s, store.activeGeneration(s), event));
  }

  private boolean apply(ClientSession s, String gen, DocumentEvent e) {
    var db = store.db();
    String eventKey = gen + ":zilina:" + e.event_id();
    Ref source = new Ref(e.entity_type(), e.entity_id());
    String sourceKey = source.key();
    if (db.getCollection("processed_events").find(s, new Document("_id", eventKey)).first() != null)
      return false;
    // Serialize graph writers within a generation; retries re-read the latest complete state.
    db.getCollection("projection_metadata")
        .updateOne(
            s,
            new Document("_id", "writer:zilina:" + gen),
            new Document("$inc", new Document("revision", 1L)),
            new UpdateOptions().upsert(true));
    var old = store.record(s, gen, source);
    boolean newer = old == null || e.entity_version() > old.getLong("version");
    if (newer) {
      Document data = Document.parse(e.data().toString());
      db.getCollection("records")
          .replaceOne(
              s,
              new Document("_id", ProjectionStore.recordKey(gen, source)),
              new Document("_id", ProjectionStore.recordKey(gen, source))
                  .append("generation", gen)
                  .append("obec_id", e.obec_id())
                  .append("type", e.entity_type())
                  .append("ref", source.bson())
                  .append("version", e.entity_version())
                  .append("projected_at", new Date())
                  .append("data", data),
              new ReplaceOptions().upsert(true));
      Set<String> pairs = new HashSet<>();
      for (var c :
          db.getCollection("reference_claims")
              .find(s, new Document("generation", gen).append("source", sourceKey)))
        pairs.add(c.getString("pair"));
      db.getCollection("reference_claims")
          .deleteMany(s, new Document("generation", gen).append("source", sourceKey));
      if (!data.getBoolean("deleted"))
        for (Document r : data.getList("suvisiace_zaznamy", Document.class)) {
          Ref target = Ref.from(r);
          String pair = pair(source, target);
          pairs.add(pair);
          db.getCollection("reference_claims")
              .insertOne(
                  s,
                  new Document("_id", gen + ":zilina:" + sourceKey + ":" + target.key())
                      .append("generation", gen)
                      .append("obec_id", e.obec_id())
                      .append("source", sourceKey)
                      .append("target", target.key())
                      .append("from", source.bson())
                      .append("to", target.bson())
                      .append("pair", pair));
        }
      for (var c :
          db.getCollection("reference_claims")
              .find(s, new Document("generation", gen).append("target", sourceKey)))
        pairs.add(c.getString("pair"));
      for (String pair : pairs) refreshPair(s, gen, pair);
    }
    db.getCollection("processed_events")
        .insertOne(
            s,
            new Document("_id", eventKey)
                .append("generation", gen)
                .append("obec_id", e.obec_id())
                .append("event_id", e.event_id())
                .append("entity", source.bson())
                .append("version", e.entity_version())
                .append("applied", newer)
                .append("processed_at", new Date()));
    return newer;
  }

  private static String pair(Ref a, Ref b) {
    return a.compareTo(b) < 0 ? a.key() + ":" + b.key() : b.key() + ":" + a.key();
  }

  private void refreshPair(ClientSession s, String gen, String pair) {
    var db = store.db();
    var filter = new Document("generation", gen).append("pair", pair);
    var claims = db.getCollection("reference_claims").find(s, filter).into(new ArrayList<>());
    db.getCollection("edges").deleteOne(s, new Document("_id", gen + ":zilina:" + pair));
    db.getCollection("pending_references").deleteMany(s, filter);
    List<Document> owners = new ArrayList<>();
    Ref a = null, b = null;
    for (var c : claims) {
      var from = Ref.from(c.get("from", Document.class));
      var to = Ref.from(c.get("to", Document.class));
      a = from.compareTo(to) < 0 ? from : to;
      b = from.compareTo(to) < 0 ? to : from;
      if (ProjectionStore.live(store.record(s, gen, from))) {
        if (ProjectionStore.live(store.record(s, gen, to))) owners.add(from.bson());
        else
          db.getCollection("pending_references")
              .insertOne(
                  s,
                  new Document("_id", c.getString("_id"))
                      .append("generation", gen)
                      .append("obec_id", "zilina")
                      .append("pair", pair)
                      .append("source", from.key())
                      .append("target", to.key())
                      .append("from", from.bson())
                      .append("to", to.bson()));
      }
    }
    if (!owners.isEmpty()) {
      owners.sort(Comparator.comparing(x -> Ref.from(x)));
      db.getCollection("edges")
          .insertOne(
              s,
              new Document("_id", gen + ":zilina:" + pair)
                  .append("generation", gen)
                  .append("obec_id", "zilina")
                  .append("a", a.key())
                  .append("b", b.key())
                  .append("from", a.bson())
                  .append("to", b.bson())
                  .append("owners", owners));
    }
  }
}
