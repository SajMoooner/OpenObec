package sk.openobec.read;

import com.mongodb.*;
import com.mongodb.client.*;
import com.mongodb.client.model.*;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import org.bson.Document;

/** Shared transactional generation store used by the listener, rebuild and Query. */
public final class ProjectionStore {
  private final MongoClient client;
  private final MongoDatabase db;

  public ProjectionStore(MongoClient client, String database) {
    this.client = client;
    db = client.getDatabase(database);
    init();
  }

  public MongoDatabase db() {
    return db;
  }

  private void init() {
    for (String c :
        List.of(
            "records",
            "reference_claims",
            "edges",
            "processed_events",
            "pending_references",
            "query_snapshots",
            "query_snapshot_chunks",
            "projection_metadata"))
      if (!db.listCollectionNames().into(new ArrayList<>()).contains(c))
        try {
          db.createCollection(c);
        } catch (MongoCommandException e) {
          if (e.getErrorCode() != 48) throw e;
        }
    for (String c :
        List.of("records", "reference_claims", "edges", "processed_events", "pending_references"))
      db.getCollection(c).createIndex(new Document("generation", 1).append("obec_id", 1));
    db.getCollection("records")
        .createIndex(
            new Document("generation", 1)
                .append("type", 1)
                .append("data.deleted", 1)
                .append("data.created_at", -1)
                .append("data.id", 1));
    db.getCollection("reference_claims")
        .createIndex(new Document("generation", 1).append("source", 1));
    db.getCollection("reference_claims")
        .createIndex(new Document("generation", 1).append("target", 1));
    db.getCollection("edges").createIndex(new Document("generation", 1).append("a", 1));
    db.getCollection("edges").createIndex(new Document("generation", 1).append("b", 1));
    db.getCollection("pending_references")
        .createIndex(new Document("generation", 1).append("source", 1));
    db.getCollection("query_snapshot_chunks")
        .createIndex(
            new Document("snapshot", 1).append("kind", 1).append("position", 1),
            new IndexOptions().unique(true));
    for (String c : List.of("query_snapshots", "query_snapshot_chunks"))
      db.getCollection(c)
          .createIndex(
              new Document("expires_at", 1), new IndexOptions().expireAfter(0L, TimeUnit.SECONDS));
    db.getCollection("projection_metadata")
        .updateOne(
            new Document("_id", "active:zilina"),
            new Document(
                "$setOnInsert", new Document("generation", "initial").append("ready", true)),
            new UpdateOptions().upsert(true));
  }

  public <T> T transaction(Function<ClientSession, T> f) {
    try (var s = client.startSession()) {
      return s.withTransaction(
          () -> f.apply(s),
          TransactionOptions.builder()
              .readConcern(ReadConcern.SNAPSHOT)
              .writeConcern(WriteConcern.MAJORITY)
              .readPreference(ReadPreference.primary())
              .build());
    }
  }

  public String activeGeneration(ClientSession s) {
    var m =
        db.getCollection("projection_metadata")
            .find(s, new Document("_id", "active:zilina"))
            .first();
    if (m == null || !Boolean.TRUE.equals(m.getBoolean("ready")))
      throw new sk.openobec.common.ApiException(
          503, "DEPENDENCY_UNAVAILABLE", "Prehľad sa obnovuje.");
    return m.getString("generation");
  }

  public Document record(ClientSession s, String generation, Ref ref) {
    return db.getCollection("records")
        .find(s, new Document("_id", recordKey(generation, ref)))
        .first();
  }

  public static String recordKey(String generation, Ref ref) {
    return generation + ":zilina:" + ref.key();
  }

  /** Caller must stop listener and hand off broker offsets before enabling query again. */
  public void activateGeneration(String generation) {
    transaction(
        s -> {
          db.getCollection("projection_metadata")
              .updateOne(
                  s,
                  new Document("_id", "active:zilina"),
                  new Document(
                      "$set",
                      new Document("generation", generation)
                          .append("ready", true)
                          .append("activated_at", new Date())),
                  new UpdateOptions().upsert(true));
          return null;
        });
  }

  public void setReady(boolean ready) {
    db.getCollection("projection_metadata")
        .updateOne(
            new Document("_id", "active:zilina"),
            new Document("$set", new Document("ready", ready)));
  }

  public static boolean live(Document r) {
    return r != null && !r.get("data", Document.class).getBoolean("deleted", true);
  }
}
