package sk.openobec.query;

import static org.junit.jupiter.api.Assertions.*;
import static sk.openobec.read.fixtures.DocumentEvents.event;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.mongodb.client.*;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.net.http.*;
import java.util.*;
import org.bson.Document;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.*;
import sk.openobec.common.*;
import sk.openobec.read.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class QueryIntegrationTest {
  static final String DB = "task3_query_" + UUID.randomUUID().toString().replace("-", "");
  static HttpServer owner;
  static int ownerStatus = 200;
  static int ownerCalls = 0;
  static boolean ownerPublished = true;

  @DynamicPropertySource
  static void settings(DynamicPropertyRegistry r) throws Exception {
    owner = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    owner.createContext(
        "/",
        e -> {
          ownerCalls++;
          byte[] b = ("{\"data\":{\"zverejnene\":" + ownerPublished + "}}").getBytes();
          e.sendResponseHeaders(ownerStatus, b.length);
          e.getResponseBody().write(b);
          e.close();
        });
    owner.start();
    r.add(
        "spring.data.mongodb.uri",
        () -> "mongodb://localhost:27023/" + DB + "?replicaSet=rs-read&directConnection=true");
    for (String type : Ref.TYPES)
      r.add("openobec.owners." + type, () -> "http://127.0.0.1:" + owner.getAddress().getPort());
  }

  @Autowired ProjectionStore store;
  @Autowired ProjectionEngine engine;
  @LocalServerPort int port;
  HttpClient http = HttpClient.newHttpClient();
  ObjectMapper json = Json.mapper();

  @AfterAll
  static void end() {
    owner.stop(0);
    try (var c =
        MongoClients.create(
            "mongodb://localhost:27023/?replicaSet=rs-read&directConnection=true")) {
      c.getDatabase(DB).drop();
    }
  }

  @BeforeEach
  void gen() {
    store.activateGeneration(UUID.randomUUID().toString());
    ownerStatus = 200;
    ownerPublished = true;
    ownerCalls = 0;
  }

  String generation() {
    return store.transaction(s -> store.activeGeneration(s));
  }

  void put(ObjectNode e) {
    engine.apply(generation(), e);
  }

  HttpResponse<String> get(String path) throws Exception {
    return http.send(
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .header("X-Obec-Id", "zilina")
            .GET()
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }

  JsonNode body(HttpResponse<String> r) throws Exception {
    return json.readTree(r.body());
  }

  @Test
  void listPreservesFullPayloadStringsFiltersAndLiteralSearch() throws Exception {
    put(event("faktury", "a", 1, false));
    var draft = event("faktury", "b", 1, false);
    ((ObjectNode) draft.get("data")).put("zverejnene", false).put("predmet", "Literal [.*]");
    put(draft);
    var r = get("/rest/v1/query/faktury");
    assertEquals(200, r.statusCode());
    assertEquals(2, body(r).path("pagination").path("total").asInt());
    assertTrue(body(r).path("data").get(0).path("zaznam").path("suma_s_dph").isTextual());
    assertFalse(body(r).path("data").get(0).path("zaznam").has("deleted"));
    assertEquals(1, body(get("/rest/v1/query/faktury?zverejnene=true")).path("data").size());
    assertEquals(1, body(get("/rest/v1/query/faktury?q=%5B.*%5D")).path("data").size());
    assertEquals(0, body(get("/rest/v1/query/faktury?page=999")).path("data").size());
  }

  @Test
  void selectorChecksEveryTypeCombination() throws Exception {
    for (String a : Ref.TYPES)
      for (String b : Ref.TYPES)
        assertEquals(
            Ref.allowed(a, b) ? 200 : 400,
            get("/rest/v1/vyber-zaznamov?zdroj_typ=" + a + "&typ=" + b).statusCode(),
            a + " " + b);
    assertEquals(
        400,
        get("/rest/v1/vyber-zaznamov?zdroj_typ=faktury&typ=zmluvy&sort=created_at").statusCode());
  }

  @Test
  void rejectsInvalidAndDuplicateParametersAndTenant() throws Exception {
    for (String q :
        List.of(
            "page=0",
            "page_size=101",
            "page=x",
            "sort=cislo",
            "zverejnene=1",
            "page=1&page=2",
            "unknown=x",
            "q=" + "a".repeat(201)))
      assertEquals(400, get("/rest/v1/query/faktury?" + q).statusCode(), q);
    for (String q : List.of("hlbka=0", "hlbka=4", "hlbka=x"))
      assertEquals(400, get("/rest/v1/faktury/a/suvislosti?" + q).statusCode());
    var r =
        http.send(
            HttpRequest.newBuilder(
                    URI.create("http://localhost:" + port + "/rest/v1/query/faktury"))
                .GET()
                .build(),
            HttpResponse.BodyHandlers.ofString());
    assertEquals(400, r.statusCode());
    assertTrue(body(r).path("error").path("details").isArray());
  }

  @Test
  void fiveRootsCyclesAndBidirectionalFullGraph() throws Exception {
    put(event("faktury", "a", 1, false, "zmluvy", "b"));
    put(event("zmluvy", "b", 1, false, "objednavky", "c"));
    put(event("objednavky", "c", 1, false, "verejne-obstaravanie", "d"));
    put(event("verejne-obstaravanie", "d", 1, false, "faktury", "a", "dodavatelske-faktury", "e"));
    put(event("dodavatelske-faktury", "e", 1, false));
    String[] ids = {"a", "b", "c", "d", "e"},
        types = {"faktury", "zmluvy", "objednavky", "verejne-obstaravanie", "dodavatelske-faktury"};
    for (int i = 0; i < ids.length; i++) {
      var r = body(get("/rest/v1/query/" + types[i] + "/" + ids[i]));
      assertEquals(4, r.path("data").path("suvisiace_zaznamy").size());
      assertEquals(5, r.path("data").path("vazby").size());
      assertEquals("ready", r.path("projection").path("status").asText());
    }
    assertEquals(0, ownerCalls);
    var g = body(get("/rest/v1/faktury/a/suvislosti?hlbka=1"));
    assertEquals(3, g.path("data").path("nodes").size());
    assertTrue(g.path("data").path("projection").isObject());
    assertEquals(1, ownerCalls);
  }

  @Test
  void publicCannotTraverseHiddenIntermediatesOrLeakNestedRefs() throws Exception {
    put(event("faktury", "a", 1, false, "zmluvy", "hidden"));
    var h = event("zmluvy", "hidden", 1, false, "objednavky", "far");
    ((ObjectNode) h.get("data")).put("zverejnene", false);
    put(h);
    put(event("objednavky", "far", 1, false));
    var r = body(get("/rest/v1/query/faktury/a?zverejnene=true"));
    assertEquals(0, r.path("data").path("suvisiace_zaznamy").size());
    assertEquals(0, r.path("data").path("root").path("zaznam").path("suvisiace_zaznamy").size());
    assertEquals(
        2, body(get("/rest/v1/query/faktury/a")).path("data").path("suvisiace_zaznamy").size());
    assertEquals(404, get("/rest/v1/query/zmluvy/hidden?zverejnene=true").statusCode());
  }

  @Test
  void missingRootPendingNotFoundAndOwnerFailure() throws Exception {
    var p = get("/rest/v1/query/faktury/missing");
    assertEquals(202, p.statusCode());
    assertEquals("2", p.headers().firstValue("Retry-After").orElse(""));
    assertTrue(body(p).path("data").path("root").path("zaznam").isNull());
    assertTrue(body(p).path("data").path("pagination").path("total").isNull());
    ownerStatus = 404;
    assertEquals(404, get("/rest/v1/query/faktury/missing").statusCode());
    ownerStatus = 503;
    assertEquals(503, get("/rest/v1/query/faktury/missing").statusCode());
    ownerStatus = 200;
    ownerPublished = false;
    assertEquals(404, get("/rest/v1/query/faktury/missing?zverejnene=true").statusCode());
  }

  @Test
  void danglingTargetsArePendingWithoutInventedRecords() throws Exception {
    put(event("faktury", "a", 1, false, "zmluvy", "late"));
    var list = body(get("/rest/v1/query/faktury"));
    assertEquals("pending", list.path("projection").path("status").asText());
    assertEquals(1, list.path("projection").path("unresolved_references_count").asInt());
    var r = body(get("/rest/v1/query/faktury/a"));
    assertEquals("pending", r.path("projection").path("status").asText());
    assertEquals(1, r.path("projection").path("unresolved_references_count").asInt());
    assertEquals(0, r.path("data").path("suvisiace_zaznamy").size());
    put(event("zmluvy", "late", 1, false));
    assertEquals(
        "ready", body(get("/rest/v1/query/faktury/a")).path("projection").path("status").asText());
  }

  @Test
  void summaryCountsMissingClaimsOnDepthBoundaryWithoutExpandingIt() throws Exception {
    put(event("faktury", "a", 1, false, "zmluvy", "b"));
    put(event("zmluvy", "b", 1, false, "objednavky", "missing", "verejne-obstaravanie", "beyond"));
    put(event("verejne-obstaravanie", "beyond", 1, false));
    var response = get("/rest/v1/faktury/a/suvislosti?hlbka=1");
    assertEquals(200, response.statusCode());
    var summary = body(response).path("data");
    assertEquals(2, summary.path("nodes").size(), "boundary nodes must not expand");
    assertEquals(1, summary.path("edges").size());
    assertFalse(summary.path("truncated").asBoolean());
    assertEquals("pending", summary.path("projection").path("status").asText());
    assertEquals(1, summary.path("projection").path("unresolved_references_count").asInt());
    var joined = body(get("/rest/v1/query/faktury/a"));
    assertEquals(2, joined.path("data").path("suvisiace_zaznamy").size());
    assertEquals(
        summary.path("projection").path("status"), joined.path("projection").path("status"));
    assertEquals(1, joined.path("projection").path("unresolved_references_count").asInt());
    put(event("objednavky", "missing", 1, false));
    var resolved = body(get("/rest/v1/faktury/a/suvislosti?hlbka=1")).path("data");
    assertEquals(2, resolved.path("nodes").size());
    assertEquals(1, resolved.path("edges").size());
    assertEquals("ready", resolved.path("projection").path("status").asText());
    assertEquals(0, resolved.path("projection").path("unresolved_references_count").asInt());
  }

  @Test
  void snapshotsNeverTruncateAndStayStableAcrossEdits() throws Exception {
    put(event("zmluvy", "root", 1, false));
    for (int i = 0; i < 105; i++)
      put(event("faktury", String.format("f%03d", i), 1, false, "zmluvy", "root"));
    var first = body(get("/rest/v1/query/zmluvy/root?related_page_size=100"));
    assertEquals(100, first.path("data").path("suvisiace_zaznamy").size());
    assertEquals(105, first.path("data").path("pagination").path("total").asInt());
    assertEquals(105, first.path("data").path("vazby").size());
    String c = first.path("data").path("pagination").path("next_cursor").asText();
    put(event("zmluvy", "root", 2, true));
    put(event("faktury", "f104", 2, true));
    var second = body(get("/rest/v1/query/zmluvy/root?related_page_size=100&cursor=" + c));
    assertEquals(5, second.path("data").path("suvisiace_zaznamy").size());
    assertEquals(1, second.path("data").path("root").path("zaznam").path("entity_version").asInt());
    assertTrue(second.path("data").path("pagination").path("complete").asBoolean());
    assertEquals(5, second.path("data").path("vazby").size());
    assertEquals(
        400, get("/rest/v1/query/zmluvy/root?related_page_size=99&cursor=" + c).statusCode());
    assertEquals(
        400,
        get("/rest/v1/query/zmluvy/root?related_page_size=100&zverejnene=true&cursor=" + c)
            .statusCode());
    assertEquals(400, get("/rest/v1/query/zmluvy/root?cursor=" + c + "x").statusCode());
    store.db().getCollection("query_snapshots").deleteMany(new Document());
    assertEquals(
        410, get("/rest/v1/query/zmluvy/root?related_page_size=100&cursor=" + c).statusCode());
  }

  @Test
  void summaryHasDepthAndHundredNodeBoundary() throws Exception {
    put(event("zmluvy", "root", 1, false));
    for (int i = 0; i < 101; i++) put(event("faktury", "n" + i, 1, false, "zmluvy", "root"));
    var r = body(get("/rest/v1/zmluvy/root/suvislosti"));
    assertEquals(100, r.path("data").path("nodes").size());
    assertTrue(r.path("data").path("truncated").asBoolean());
    assertEquals(99, r.path("data").path("edges").size());
  }
}
