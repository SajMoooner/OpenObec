package sk.openobec.common;

import static com.mongodb.client.model.Filters.*;

import com.mongodb.client.model.*;
import java.time.Instant;
import java.util.*;
import org.bson.Document;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

@RestController
public class ExportController {
  private final RecordStore store;

  public ExportController(RecordStore store) {
    this.store = store;
  }

  @GetMapping("/internal/v1/export")
  public Map<String, Object> export(@RequestParam MultiValueMap<String, String> parameters) {
    if (!store.definition().paired()) throw ApiException.notFound();
    Map<String, String> params = DomainController.parameters(parameters);
    if (!Set.of("page_size", "cursor").containsAll(params.keySet())) throw ListQuery.bad();
    int size = ListQuery.number(params.getOrDefault("page_size", "100"), 1, 100), offset = 0;
    String snapshot;
    if (params.containsKey("cursor")) {
      try {
        String[] parts =
            new String(
                    Base64.getUrlDecoder().decode(params.get("cursor")),
                    java.nio.charset.StandardCharsets.UTF_8)
                .split(":");
        if (parts.length != 3 || Integer.parseInt(parts[2]) != size) throw ListQuery.bad();
        snapshot = UUID.fromString(parts[0]).toString();
        offset = ListQuery.number(parts[1], 0, Integer.MAX_VALUE);
      } catch (Exception e) {
        throw ListQuery.bad();
      }
    } else {
      snapshot = createSnapshot(size);
    }
    Document header =
        store.database().getCollection("export_snapshots").find(eq("_id", snapshot)).first();
    if (header == null) throw new ApiException(410, "CURSOR_EXPIRED", "Export už nie je dostupný.");
    if (header.getDate("expires_at").toInstant().isBefore(Instant.now()))
      throw new ApiException(410, "CURSOR_EXPIRED", "Export už nie je dostupný.");
    if (!header.getString("obec_id").equals("zilina") || header.getInteger("page_size") != size)
      throw ListQuery.bad();
    List<Object> data = new ArrayList<>();
    store
        .database()
        .getCollection("export_rows")
        .find(
            and(
                eq("snapshot_id", snapshot),
                gte("position", offset),
                lt("position", (long) offset + size)))
        .sort(Sorts.ascending("position"))
        .forEach(d -> data.add(BsonJson.json(d.get("event", Document.class))));
    long total = ((Number) header.get("total")).longValue();
    String next =
        offset + (long) size < total
            ? Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                    (snapshot + ":" + (offset + size) + ":" + size)
                        .getBytes(java.nio.charset.StandardCharsets.UTF_8))
            : null;
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("schema_version", 1);
    response.put("entity_type", store.definition().agenda());
    response.put("obec_id", "zilina");
    response.put("snapshot_id", snapshot);
    response.put("created_at", header.getString("created_at"));
    response.put("expires_at", header.getDate("expires_at").toInstant().toString());
    response.put("total", total);
    response.put("data", data);
    response.put("next_cursor", next);
    return response;
  }

  private String createSnapshot(int size) {
    return store.transaction(
        s -> {
          String id = UUID.randomUUID().toString();
          Instant now = Instant.now();
          Date expires = Date.from(now.plusSeconds(600));
          int position = 0;
          try (var rows =
              store
                  .database()
                  .getCollection("documents")
                  .find(s, eq("obec_id", "zilina"))
                  .sort(Sorts.ascending("id"))
                  .iterator()) {
            while (rows.hasNext()) {
              Document row = rows.next();
              String type =
                  Boolean.TRUE.equals(row.get("deleted")) ? "document.deleted" : "document.updated";
              var event = store.event(row, type);
              Document stored = BsonJson.document(Json.mapper().valueToTree(event));
              store
                  .database()
                  .getCollection("export_rows")
                  .insertOne(
                      s,
                      new Document("snapshot_id", id)
                          .append("position", position++)
                          .append("event", stored)
                          .append("expires_at", expires));
            }
          }
          store
              .database()
              .getCollection("export_snapshots")
              .insertOne(
                  s,
                  new Document("_id", id)
                      .append("obec_id", "zilina")
                      .append("entity_type", store.definition().agenda())
                      .append("page_size", size)
                      .append("created_at", now.toString())
                      .append("expires_at", expires)
                      .append("total", position));
          return id;
        });
  }
}
