package sk.openobec.query;

import com.fasterxml.jackson.databind.*;
import com.mongodb.client.ClientSession;
import com.mongodb.client.model.*;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.regex.Pattern;
import org.bson.Document;
import org.springframework.core.env.Environment;
import sk.openobec.common.*;
import sk.openobec.read.*;

/** Query reads only the selected local generation. Owner HTTP is used solely for root checks. */
public final class QueryService {
  public record Result(int status, Object body) {}

  private final ProjectionStore store;
  private final CursorCodec cursors;
  private final Environment env;
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(1)).build();

  public QueryService(ProjectionStore store, Environment env) {
    this.store = store;
    this.env = env;
    cursors =
        new CursorCodec(
            env.getProperty("QUERY_CURSOR_SECRET", "openobec-local-cursor-key-change-outside-demo"),
            Clock.systemUTC());
  }

  private static Document obj(Object... fields) {
    var d = new Document();
    for (int i = 0; i < fields.length; i += 2) d.put((String) fields[i], fields[i + 1]);
    return d;
  }

  private static void allowed(Map<String, String> p, String... keys) {
    if (!Set.of(keys).containsAll(p.keySet())) throw ListQuery.bad();
  }

  private static Boolean filter(Map<String, String> p) {
    String v = p.get("zverejnene");
    if (v != null && !Set.of("true", "false").contains(v)) throw ListQuery.bad();
    return v == null ? null : Boolean.valueOf(v);
  }

  private boolean visible(Document r, Boolean published) {
    return ProjectionStore.live(r)
        && (published == null
            || published.equals(r.get("data", Document.class).getBoolean("zverejnene")));
  }

  private Document record(ClientSession s, String gen, Document r, Boolean published) {
    var d = new Document(r.get("data", Document.class));
    d.remove("deleted");
    d.remove("deleted_at");
    if (published != null) {
      List<Document> refs = new ArrayList<>();
      for (var link : d.getList("suvisiace_zaznamy", Document.class))
        if (visible(store.record(s, gen, Ref.from(link)), published)) refs.add(link);
      d.put("suvisiace_zaznamy", refs);
    }
    return d;
  }

  private Document joined(ClientSession s, String gen, Document r, Boolean published) {
    return obj("typ", r.getString("type"), "zaznam", record(s, gen, r, published));
  }

  private Document summary(Document r) {
    var d = r.get("data", Document.class);
    String label =
        d.getString("cislo") + " — " + d.getString(d.containsKey("nazov") ? "nazov" : "predmet");
    return obj(
        "typ",
        r.getString("type"),
        "id",
        d.getString("id"),
        "cislo",
        d.getString("cislo"),
        "label",
        label,
        "zverejnene",
        d.getBoolean("zverejnene"));
  }

  public Object selector(Map<String, String> params) {
    allowed(params, "zdroj_typ", "typ", "page", "page_size", "q", "zverejnene");
    String source = params.get("zdroj_typ"), target = params.get("typ");
    if (source == null || target == null || !Ref.allowed(source, target)) throw ListQuery.bad();
    var p = new HashMap<>(params);
    p.remove("zdroj_typ");
    p.remove("typ");
    return list(target, p, true);
  }

  public Object list(String type, Map<String, String> params, boolean selector) {
    ListQuery q = ListQuery.parse(params);
    return store.transaction(
        s -> {
          String gen = store.activeGeneration(s);
          Document f =
              obj("generation", gen, "obec_id", "zilina", "type", type, "data.deleted", false);
          if (q.zverejnene() != null) f.put("data.zverejnene", q.zverejnene());
          if (!q.q().isEmpty()) {
            var literal =
                Pattern.compile(
                    Pattern.quote(q.q()), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
            f.put(
                "$or",
                List.of(
                    obj("data.cislo", literal),
                    obj("data.predmet", literal),
                    obj("data.nazov", literal)));
          }
          long total = store.db().getCollection("records").countDocuments(s, f);
          String field = q.sort().replace("-", "");
          Document sort =
              selector
                  ? obj("data.cislo", 1, "data.id", 1)
                  : obj("data." + field, q.sort().startsWith("-") ? -1 : 1, "data.id", 1);
          long offset = (long) (q.page() - 1) * q.page_size();
          List<Document> data = new ArrayList<>();
          if (offset <= Integer.MAX_VALUE)
            for (var r :
                store
                    .db()
                    .getCollection("records")
                    .find(s, f)
                    .sort(sort)
                    .skip((int) offset)
                    .limit(q.page_size())) {
              if (selector) data.add(summary(r));
              else {
                var j = joined(s, gen, r, q.zverejnene());
                j.put(
                    "detail_url",
                    "/rest/v1/query/" + type + "/" + r.get("data", Document.class).getString("id"));
                data.add(j);
              }
            }
          Document result =
              obj("data", data, "pagination", ListQuery.pagination(total, q.page(), q.page_size()));
          if (!selector) {
            var sources =
                data.stream()
                    .map(
                        j ->
                            new Ref(
                                    j.getString("typ"),
                                    j.get("zaznam", Document.class).getString("id"))
                                .key())
                    .toList();
            long pending =
                sources.isEmpty()
                    ? 0
                    : store
                        .db()
                        .getCollection("pending_references")
                        .countDocuments(s, obj("generation", gen, "source", obj("$in", sources)));
            result.put("projection", projection(null, pending, new Date()));
          }
          return result;
        });
  }

  private void owner(Ref root, Boolean published) {
    String envKey =
        switch (root.typ()) {
          case "faktury" -> "INVOICES_SERVICE_URL";
          case "dodavatelske-faktury" -> "SUPPLIER_INVOICES_SERVICE_URL";
          case "zmluvy" -> "CONTRACTS_SERVICE_URL";
          case "objednavky" -> "ORDERS_SERVICE_URL";
          default -> "PROCUREMENT_SERVICE_URL";
        };
    int port =
        switch (root.typ()) {
          case "faktury" -> 8081;
          case "dodavatelske-faktury" -> 8082;
          case "zmluvy" -> 8083;
          case "objednavky" -> 8084;
          default -> 8085;
        };
    String base =
        env.getProperty(
            "openobec.owners." + root.typ(), env.getProperty(envKey, "http://localhost:" + port));
    try {
      var r =
          http.send(
              HttpRequest.newBuilder(
                      URI.create(
                          base
                              + "/rest/v1/"
                              + root.typ()
                              + "/"
                              + URLEncoder.encode(
                                  root.id(), java.nio.charset.StandardCharsets.UTF_8)))
                  .header("X-Obec-Id", "zilina")
                  .timeout(Duration.ofSeconds(2))
                  .GET()
                  .build(),
              HttpResponse.BodyHandlers.ofString());
      if (r.statusCode() == 404) throw ApiException.notFound();
      if (r.statusCode() != 200) throw unavailable();
      JsonNode body = Json.mapper().readTree(r.body()).path("data");
      if (!body.isObject() || !body.path("zverejnene").isBoolean()) throw unavailable();
      if (published != null && published != body.path("zverejnene").asBoolean())
        throw ApiException.notFound();
    } catch (ApiException e) {
      throw e;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw unavailable();
    } catch (Exception e) {
      throw unavailable();
    }
  }

  private static ApiException unavailable() {
    return new ApiException(
        503, "DEPENDENCY_UNAVAILABLE", "Vlastník záznamu je dočasne nedostupný.");
  }

  private Document projection(Document root, long unresolved, Date asOf) {
    return obj(
        "status",
        unresolved > 0 ? "pending" : "ready",
        "root_entity_version",
        root == null ? null : root.getLong("version"),
        "as_of",
        asOf == null ? null : asOf.toInstant().toString(),
        "unresolved_references_count",
        unresolved);
  }

  private Document pendingProjection() {
    return obj(
        "status",
        "pending",
        "root_entity_version",
        null,
        "as_of",
        null,
        "unresolved_references_count",
        null);
  }

  private static Document edge(Document e) {
    return obj("from", e.get("from"), "to", e.get("to"), "owners", e.get("owners"));
  }

  private record Graph(
      LinkedHashMap<String, Document> records,
      List<Document> edges,
      boolean truncated,
      long unresolved,
      Date asOf) {}

  private Graph graph(
      ClientSession s, String gen, Ref root, Boolean published, int depth, int limit) {
    LinkedHashMap<String, Document> records = new LinkedHashMap<>();
    var rootDoc = store.record(s, gen, root);
    records.put(root.key(), rootDoc);
    ArrayDeque<Map.Entry<Ref, Integer>> queue = new ArrayDeque<>();
    queue.add(Map.entry(root, 0));
    Map<String, Document> edges = new TreeMap<>();
    boolean truncated = false;
    Date asOf = rootDoc.getDate("projected_at");
    long unresolved = 0;
    while (!queue.isEmpty()) {
      var node = queue.remove();
      Ref from = node.getKey();
      int distance = node.getValue();
      if (distance >= depth) continue;
      unresolved +=
          store
              .db()
              .getCollection("pending_references")
              .countDocuments(s, obj("generation", gen, "source", from.key()));
      var links =
          store
              .db()
              .getCollection("edges")
              .find(
                  s,
                  obj(
                      "generation",
                      gen,
                      "$or",
                      List.of(obj("a", from.key()), obj("b", from.key()))))
              .sort(obj("_id", 1));
      for (var e : links) {
        Ref a = Ref.from(e.get("from", Document.class)), b = Ref.from(e.get("to", Document.class));
        Ref target = a.equals(from) ? b : a;
        Document r = store.record(s, gen, target);
        if (!visible(r, published)) continue;
        if (!records.containsKey(target.key())) {
          if (records.size() >= limit) {
            truncated = true;
            continue;
          }
          records.put(target.key(), r);
          queue.add(Map.entry(target, distance + 1));
          if (r.getDate("projected_at").after(asOf)) asOf = r.getDate("projected_at");
        }
        edges.put(e.getString("_id"), e);
      }
    }
    // Include all edges among visited nodes, even when both ends are on the depth boundary.
    for (String key : records.keySet())
      for (var e : store.db().getCollection("edges").find(s, obj("generation", gen, "a", key)))
        if (records.containsKey(e.getString("b"))) edges.put(e.getString("_id"), e);
    var result = new ArrayList<Document>();
    for (var e : edges.values())
      if (records.containsKey(e.getString("a")) && records.containsKey(e.getString("b")))
        result.add(edge(e));
    return new Graph(records, result, truncated, unresolved, asOf);
  }

  public Result relations(Ref root, Map<String, String> params) {
    allowed(params, "hlbka", "zverejnene");
    int depth = ListQuery.number(params.getOrDefault("hlbka", "3"), 1, 3);
    Boolean published = filter(params);
    owner(root, published);
    return store.transaction(
        s -> {
          String gen = store.activeGeneration(s);
          Document r = store.record(s, gen, root);
          if (r == null)
            return new Result(
                202,
                obj(
                    "data",
                    obj(
                        "root",
                        root.bson(),
                        "nodes",
                        List.of(),
                        "edges",
                        List.of(),
                        "truncated",
                        false,
                        "projection",
                        pendingProjection())));
          if (!visible(r, published)) throw ApiException.notFound();
          Graph g = graph(s, gen, root, published, depth, 100);
          return new Result(
              200,
              obj(
                  "data",
                  obj(
                      "root",
                      root.bson(),
                      "nodes",
                      g.records.values().stream().map(this::summary).toList(),
                      "edges",
                      g.edges,
                      "truncated",
                      g.truncated,
                      "projection",
                      projection(r, g.unresolved, g.asOf))));
        });
  }

  private Document binding(Ref root, Boolean published, int size) {
    return obj(
        "tenant",
        "zilina",
        "type",
        root.typ(),
        "root",
        root.id(),
        "filter",
        published,
        "size",
        size);
  }

  public Result detail(Ref root, Map<String, String> params) {
    allowed(params, "zverejnene", "related_page_size", "cursor");
    Boolean published = filter(params);
    int size = ListQuery.number(params.getOrDefault("related_page_size", "100"), 1, 100);
    Document bound = binding(root, published, size);
    if (params.containsKey("cursor")) {
      Document token = cursors.decode(params.get("cursor"), bound);
      return store.transaction(s -> page(s, token, bound));
    }
    // Existing local roots never call owners. Missing roots alone require authoritative existence.
    Boolean exists =
        store.transaction(
            s -> {
              String gen = store.activeGeneration(s);
              Document r = store.record(s, gen, root);
              if (r != null && !visible(r, published)) throw ApiException.notFound();
              return r != null;
            });
    if (!exists) {
      owner(root, published);
      return new Result(
          202,
          obj(
              "data",
              obj(
                  "root",
                  obj("typ", root.typ(), "id", root.id(), "zaznam", null),
                  "suvisiace_zaznamy",
                  List.of(),
                  "vazby",
                  List.of(),
                  "pagination",
                  obj(
                      "related_page_size",
                      size,
                      "total",
                      null,
                      "next_cursor",
                      null,
                      "complete",
                      false)),
              "projection",
              pendingProjection()));
    }
    return store.transaction(
        s -> {
          String gen = store.activeGeneration(s);
          Document r = store.record(s, gen, root);
          if (!visible(r, published)) throw ApiException.notFound();
          Graph graph = graph(s, gen, root, published, Integer.MAX_VALUE, Integer.MAX_VALUE);
          String sid = UUID.randomUUID().toString();
          Date now = new Date(), expires = Date.from(now.toInstant().plusSeconds(600));
          var header =
              obj(
                  "_id",
                  sid,
                  "binding",
                  bound,
                  "created_at",
                  now,
                  "expires_at",
                  expires,
                  "root",
                  joined(s, gen, r, published),
                  "projection",
                  projection(r, graph.unresolved, graph.asOf),
                  "total",
                  graph.records.size() - 1);
          store.db().getCollection("query_snapshots").insertOne(s, header);
          List<Document> ordered =
              graph.records.values().stream()
                  .filter(x -> !Ref.from(x.get("ref", Document.class)).equals(root))
                  .sorted(Comparator.comparing(x -> Ref.from(x.get("ref", Document.class))))
                  .toList();
          int pos = 0;
          for (var doc : ordered)
            chunk(s, sid, "record", pos++, joined(s, gen, doc, published), expires);
          pos = 0;
          for (var edge : graph.edges) chunk(s, sid, "edge", pos++, edge, expires);
          return page(s, token(sid, 0, expires, bound), bound);
        });
  }

  private void chunk(
      ClientSession s, String sid, String kind, int position, Document data, Date expires) {
    store
        .db()
        .getCollection("query_snapshot_chunks")
        .insertOne(
            s,
            obj(
                "_id",
                sid + ":" + kind + ":" + position,
                "snapshot",
                sid,
                "kind",
                kind,
                "position",
                position,
                "data",
                data,
                "expires_at",
                expires));
  }

  private Document token(String sid, int pos, Date expires, Document binding) {
    var t = new Document(binding);
    t.put("snapshot", sid);
    t.put("position", pos);
    t.put("expires", expires.toInstant().getEpochSecond());
    t.put("format", 1);
    return t;
  }

  private Result page(ClientSession s, Document token, Document binding) {
    store.activeGeneration(s);
    String sid = token.getString("snapshot");
    var h = store.db().getCollection("query_snapshots").find(s, obj("_id", sid)).first();
    if (h == null || !h.getDate("expires_at").after(new Date())) throw CursorCodec.expired();
    if (!binding.equals(h.get("binding", Document.class))) throw ListQuery.bad();
    int pos = ((Number) token.get("position")).intValue(),
        size = binding.getInteger("size"),
        total = h.getInteger("total");
    if (pos > total || pos % size != 0) throw ListQuery.bad();
    List<Document> docs = new ArrayList<>();
    for (var c :
        store
            .db()
            .getCollection("query_snapshot_chunks")
            .find(
                s,
                obj(
                    "snapshot",
                    sid,
                    "kind",
                    "record",
                    "position",
                    obj("$gte", pos, "$lt", (long) pos + size)))
            .sort(obj("position", 1))) docs.add(c.get("data", Document.class));
    Set<Ref> incident = new HashSet<>();
    for (var d : docs)
      incident.add(new Ref(d.getString("typ"), d.get("zaznam", Document.class).getString("id")));
    if (pos == 0) incident.add(new Ref(binding.getString("type"), binding.getString("root")));
    List<Document> edges = new ArrayList<>();
    for (var c :
        store
            .db()
            .getCollection("query_snapshot_chunks")
            .find(s, obj("snapshot", sid, "kind", "edge"))
            .sort(obj("position", 1))) {
      var e = c.get("data", Document.class);
      if (incident.contains(Ref.from(e.get("from", Document.class)))
          || incident.contains(Ref.from(e.get("to", Document.class)))) edges.add(e);
    }
    int next = pos + docs.size();
    String cursor =
        next < total ? cursors.encode(token(sid, next, h.getDate("expires_at"), binding)) : null;
    return new Result(
        200,
        obj(
            "data",
            obj(
                "root",
                h.get("root"),
                "suvisiace_zaznamy",
                docs,
                "vazby",
                edges,
                "pagination",
                obj(
                    "related_page_size",
                    size,
                    "total",
                    total,
                    "next_cursor",
                    cursor,
                    "complete",
                    cursor == null)),
            "projection",
            h.get("projection")));
  }
}
