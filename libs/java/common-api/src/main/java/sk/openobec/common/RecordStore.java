package sk.openobec.common;

import static com.mongodb.client.model.Filters.*;

import com.fasterxml.jackson.databind.node.*;
import com.mongodb.*;
import com.mongodb.client.*;
import com.mongodb.client.model.*;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.regex.Pattern;
import org.bson.Document;
import org.bson.conversions.Bson;
import sk.openobec.events.DocumentEvent;

/** Transaction, storage and CAS mechanics; editable schemas belong to concrete domains. */
public class RecordStore {
  protected final MongoClient client;
  protected final MongoDatabase db;
  protected final DomainDefinition<?> definition;
  protected final ReferenceValidator references;

  public RecordStore(
      MongoClient client,
      MongoDatabase db,
      DomainDefinition<?> definition,
      ReferenceValidator references) {
    this.client = client;
    this.db = db;
    this.definition = definition;
    this.references = references;
    initialize();
  }

  public DomainDefinition<?> definition() {
    return definition;
  }

  public MongoDatabase database() {
    return db;
  }

  private void initialize() {
    Set<String> existing = new HashSet<>(db.listCollectionNames().into(new ArrayList<>()));
    for (String name :
        List.of(
            "documents",
            "outbox",
            "audit",
            "attachments",
            "export_snapshots",
            "export_rows",
            "storage_cleanup"))
      if (!existing.contains(name))
        try {
          db.createCollection(name);
        } catch (MongoCommandException e) {
          if (e.getErrorCode() != 48) throw e;
        }
    docs()
        .createIndex(
            Indexes.compoundIndex(Indexes.ascending("obec_id"), Indexes.ascending("cislo")),
            new IndexOptions().unique(true));
    docs()
        .createIndex(
            Indexes.compoundIndex(
                Indexes.ascending("obec_id", "deleted", "zverejnene"),
                Indexes.descending("created_at"),
                Indexes.ascending("id")));
    docs()
        .createIndex(
            Indexes.compoundIndex(
                Indexes.ascending("obec_id", "deleted", "zverejnene"),
                Indexes.descending("updated_at"),
                Indexes.ascending("id")));
    db.getCollection("outbox")
        .createIndex(
            Indexes.compoundIndex(
                Indexes.ascending("published_at", "next_attempt_at", "lease_until")));
    db.getCollection("attachments")
        .createIndex(Indexes.ascending("obec_id", "document_id", "deleted"));
    db.getCollection("export_snapshots")
        .createIndex(
            Indexes.ascending("expires_at"),
            new IndexOptions().expireAfter(0L, java.util.concurrent.TimeUnit.SECONDS));
    db.getCollection("export_rows")
        .createIndex(Indexes.ascending("snapshot_id", "position"), new IndexOptions().unique(true));
    db.getCollection("export_rows")
        .createIndex(
            Indexes.ascending("expires_at"),
            new IndexOptions().expireAfter(0L, java.util.concurrent.TimeUnit.SECONDS));
  }

  protected MongoCollection<Document> docs() {
    return db.getCollection("documents");
  }

  public Bson activeFilter(String id) {
    return and(eq("obec_id", "zilina"), eq("id", id), eq("deleted", false));
  }

  public Document active(ClientSession s, String id) {
    Document d = docs().find(s, activeFilter(id)).first();
    if (d == null) throw ApiException.notFound();
    return d;
  }

  public Document active(String id) {
    Document d = docs().find(activeFilter(id)).first();
    if (d == null) throw ApiException.notFound();
    return d;
  }

  public ObjectNode ordinary(Document d) {
    ObjectNode n = BsonJson.json(d);
    n.remove(List.of("deleted", "deleted_at"));
    if (definition.paired() && !n.has("suvisiace_zaznamy")) n.putArray("suvisiace_zaznamy");
    if (!definition.paired()) n.remove("entity_version");
    return n;
  }

  public ObjectNode detail(String id) {
    return ordinary(active(id));
  }

  public ObjectNode create(ObjectNode input) {
    ObjectNode normalized = definition.normalize(input, null);
    if (definition.paired()) references.validate(normalized.path("suvisiace_zaznamy"), null);
    return transaction(
        s -> {
          Instant now = Instant.now();
          String id = definition.prefix() + UUID.randomUUID();
          Document d = BsonJson.document(normalized);
          d.put("_id", id);
          d.put("id", id);
          d.put("obec_id", "zilina");
          d.put("created_at", now.toString());
          d.put("updated_at", now.toString());
          d.put("deleted", false);
          d.put("deleted_at", null);
          d.put("_version", 1L);
          d.put("_attachment_epoch", 0L);
          if (definition.paired()) d.put("entity_version", 1L);
          docs().insertOne(s, d);
          recordChange(s, d, "document.created");
          return ordinary(d);
        });
  }

  public ObjectNode update(String id, ObjectNode patch) {
    return transaction(
        s -> {
          Document old = active(s, id);
          ObjectNode normalized = definition.normalize(patch, ordinary(old));
          if (definition.paired())
            references.validate(
                normalized.path("suvisiace_zaznamy"), BsonJson.json(old).path("suvisiace_zaznamy"));
          Document next = BsonJson.document(normalized);
          for (String f : List.of("_id", "id", "obec_id", "created_at", "_attachment_epoch"))
            next.put(f, old.get(f));
          long version = ((Number) old.get("_version")).longValue() + 1;
          next.put("_version", version);
          if (definition.paired()) next.put("entity_version", version);
          next.put("updated_at", Instant.now().toString());
          next.put("deleted", false);
          next.put("deleted_at", null);
          if (docs()
                  .replaceOne(s, and(activeFilter(id), eq("_version", version - 1)), next)
                  .getMatchedCount()
              != 1) throw new RetryConflict();
          recordChange(s, next, "document.updated");
          return ordinary(next);
        });
  }

  public Map<String, Object> delete(String id) {
    return transaction(
        s -> {
          Document old = active(s, id);
          long version = ((Number) old.get("_version")).longValue() + 1;
          String now = Instant.now().toString();
          old.put("_version", version);
          if (definition.paired()) old.put("entity_version", version);
          old.put("deleted", true);
          old.put("deleted_at", now);
          old.put("updated_at", now);
          if (docs()
                  .replaceOne(s, and(activeFilter(id), eq("_version", version - 1)), old)
                  .getMatchedCount()
              != 1) throw new RetryConflict();
          recordChange(s, old, "document.deleted");
          return Map.of("id", id, "deleted", true, "deleted_at", now);
        });
  }

  public Map<String, Object> list(ListQuery query) {
    List<Bson> filters = new ArrayList<>(List.of(eq("obec_id", "zilina"), eq("deleted", false)));
    if (query.zverejnene() != null) filters.add(eq("zverejnene", query.zverejnene()));
    if (!query.q().isEmpty()) {
      Pattern regex =
          Pattern.compile(
              Pattern.quote(query.q()), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
      filters.add(or(regex("cislo", regex), regex("predmet", regex), regex("nazov", regex)));
    }
    Bson filter = and(filters);
    long total = docs().countDocuments(filter);
    long skip = (long) (query.page() - 1) * query.page_size();
    List<ObjectNode> data = new ArrayList<>();
    if (skip < total && skip <= Integer.MAX_VALUE) {
      boolean descending = query.sort().startsWith("-");
      String key = descending ? query.sort().substring(1) : query.sort();
      docs()
          .find(filter)
          .sort(
              Sorts.orderBy(
                  descending ? Sorts.descending(key) : Sorts.ascending(key), Sorts.ascending("id")))
          .skip((int) skip)
          .limit(query.page_size())
          .forEach(d -> data.add(ordinary(d)));
    }
    return Map.of(
        "data", data, "pagination", ListQuery.pagination(total, query.page(), query.page_size()));
  }

  private void recordChange(ClientSession s, Document d, String type) {
    db.getCollection("audit")
        .insertOne(
            s,
            new Document("_id", UUID.randomUUID().toString())
                .append("obec_id", "zilina")
                .append("entity_id", d.getString("id"))
                .append("entity_version", d.get("_version"))
                .append("operation", type)
                .append("occurred_at", d.getString("updated_at")));
    if (!definition.paired()) return;
    DocumentEvent event = event(d, type);
    ObjectNode json = Json.mapper().valueToTree(event);
    Document out =
        new Document("_id", event.event_id())
            .append("event", BsonJson.document(json))
            .append("published_at", null)
            .append("lease_until", Date.from(Instant.EPOCH))
            .append("lease_owner", null)
            .append("attempts", 0)
            .append("next_attempt_at", Date.from(Instant.EPOCH))
            .append("created_at", Date.from(Instant.now()));
    db.getCollection("outbox").insertOne(s, out);
  }

  public DocumentEvent event(Document d, String type) {
    ObjectNode snapshot = BsonJson.json(d);
    if (definition.paired() && !snapshot.has("suvisiace_zaznamy"))
      snapshot.putArray("suvisiace_zaznamy");
    return new DocumentEvent(
        UUID.randomUUID().toString(),
        type,
        1,
        definition.agenda(),
        d.getString("id"),
        ((Number) d.get("_version")).longValue(),
        "zilina",
        d.getString("updated_at"),
        snapshot);
  }

  /**
   * Each retry rereads latest committed state, reapplies the patch and validates the complete
   * result.
   */
  public <T> T transaction(Function<ClientSession, T> action) {
    for (int attempt = 0; attempt < 5; attempt++)
      try (ClientSession s = client.startSession()) {
        s.startTransaction(
            TransactionOptions.builder()
                .readConcern(ReadConcern.SNAPSHOT)
                .writeConcern(WriteConcern.MAJORITY)
                .maxCommitTime(5L, java.util.concurrent.TimeUnit.SECONDS)
                .build());
        try {
          T result = action.apply(s);
          for (int commit = 0; ; commit++) {
            try {
              s.commitTransaction();
              return result;
            } catch (MongoException e) {
              if (e.hasErrorLabel(MongoException.UNKNOWN_TRANSACTION_COMMIT_RESULT_LABEL)) {
                if (commit < 2) continue;
                throw new IndeterminateCommitException(e);
              }
              throw e;
            }
          }
        } catch (RuntimeException e) {
          // A commit may already be durable: neither abort nor replay establishes otherwise.
          if (e instanceof IndeterminateCommitException) throw e;
          try {
            if (s.hasActiveTransaction()) s.abortTransaction();
          } catch (Exception ignored) {
          }
          if (e instanceof RetryConflict
              || (e instanceof MongoException m
                  && (m.hasErrorLabel(MongoException.TRANSIENT_TRANSACTION_ERROR_LABEL)
                      || m.getCode() == 112))) {
            if (attempt == 4)
              throw new ApiException(409, "CONFLICT", "Súbežná zmena; skúste zápis znovu.");
            continue;
          }
          if (e instanceof MongoException m && m.getCode() == 11000)
            throw new ApiException(409, "CONFLICT", "Evidenčné číslo už existuje.");
          throw e;
        }
      }
    throw new ApiException(409, "CONFLICT", "Súbežná zmena.");
  }

  private static class RetryConflict extends RuntimeException {}
}
