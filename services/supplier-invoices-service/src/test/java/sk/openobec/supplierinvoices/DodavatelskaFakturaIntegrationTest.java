package sk.openobec.supplierinvoices;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.mongodb.client.*;
import com.mongodb.client.model.*;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import org.bson.Document;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.*;
import sk.openobec.common.*;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"openobec.outbox.enabled=false"})
class DodavatelskaFakturaIntegrationTest {
  static final String DB =
      "task2_supplierinvoices_" + UUID.randomUUID().toString().replace("-", "");

  @DynamicPropertySource
  static void settings(DynamicPropertyRegistry r) {
    r.add(
        "spring.data.mongodb.uri",
        () ->
            "mongodb://localhost:27018/"
                + DB
                + "?replicaSet=rs-supplier-invoices&directConnection=true");
  }

  @LocalServerPort int port;
  @Autowired MongoClient mongo;
  final HttpClient http = HttpClient.newHttpClient();
  final ObjectMapper mapper = Json.mapper();

  String base() {
    return "http://localhost:" + port + "/rest/v1/dodavatelske-faktury";
  }

  ObjectNode valid() throws Exception {
    ObjectNode n =
        (ObjectNode)
            mapper.readTree(
                "{\"cislo\": \"Test cislo\", \"predmet\": \"Test predmet\", \"dodavatel\":"
                    + " {\"nazov\": \"Dodávateľ\", \"ico\": \"12345678\"}, \"datum_vystavenia\":"
                    + " \"2026-11-01\", \"datum_splatnosti\": \"2026-11-01\", \"suma_bez_dph\":"
                    + " \"10.00\", \"suma_dph\": \"2.00\", \"suma_s_dph\": \"12.00\", \"mena\":"
                    + " \"EUR\", \"zverejnene\": false, \"suvisiace_zaznamy\": []}");
    n.put("cislo", "TEST-" + UUID.randomUUID());
    return n;
  }

  HttpResponse<String> req(String method, String url, String body) throws Exception {
    var b = HttpRequest.newBuilder(URI.create(url)).header("X-Obec-Id", "zilina");
    if (body != null) b.header("Content-Type", "application/json");
    return http.send(
        b.method(
                method,
                body == null
                    ? HttpRequest.BodyPublishers.noBody()
                    : HttpRequest.BodyPublishers.ofString(body))
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }

  JsonNode data(HttpResponse<String> response) throws Exception {
    return mapper.readTree(response.body()).path("data");
  }

  String create() throws Exception {
    var r = req("POST", base(), valid().toString());
    assertEquals(201, r.statusCode(), r.body());
    return data(r).path("id").asText();
  }

  @AfterAll
  static void cleanup() {
    try (var c = MongoClients.create("mongodb://localhost:27018/?directConnection=true")) {
      var database = c.getDatabase(DB);
      try (var storage =
          new sk.openobec.files.S3Storage(
              "http://localhost:9000",
              "openobec-demo",
              "openobec-local-demo-secret",
              "openobec-documents")) {
        for (Document file : database.getCollection("attachments").find()) {
          storage.remove(file.getString("object_key"));
        }
      }
      database.drop();
    }
  }

  @Test
  void allNineSourceAndAttachmentOperations() throws Exception {
    var r = req("POST", base(), valid().toString());
    assertEquals(201, r.statusCode(), r.body());
    var doc = data(r);
    String id = doc.path("id").asText();
    assertTrue(id.startsWith("dfak_"));
    assertEquals(
        "/rest/v1/dodavatelske-faktury/" + id, r.headers().firstValue("Location").orElse(""));
    assertEquals(200, req("GET", base() + "/" + id, null).statusCode());
    var list =
        req(
            "GET",
            base() + "?q=" + URLEncoder.encode(doc.path("cislo").asText(), StandardCharsets.UTF_8),
            null);
    assertEquals(1, data(list).size());
    assertEquals(
        200, req("POST", base() + "/" + id + "/update", "{\"predmet\":\"Upravené\"}").statusCode());
    var upload =
        upload(
            id,
            "Mestská.pdf",
            "application/pdf",
            "%PDF-1.7\nOpenObec".getBytes(StandardCharsets.UTF_8));
    assertEquals(201, upload.statusCode(), upload.body());
    var attachment = data(upload);
    String fid = attachment.path("id").asText();
    assertEquals(64, attachment.path("sha256").asText().length());
    assertFalse(attachment.has("object_key"));
    assertEquals(1, data(req("GET", base() + "/" + id + "/prilohy", null)).size());
    var download =
        http.send(
            HttpRequest.newBuilder(URI.create(base() + "/" + id + "/prilohy/" + fid + "/download"))
                .header("X-Obec-Id", "zilina")
                .build(),
            HttpResponse.BodyHandlers.ofByteArray());
    assertEquals(200, download.statusCode());
    assertArrayEquals("%PDF-1.7\nOpenObec".getBytes(StandardCharsets.UTF_8), download.body());
    assertTrue(
        download.headers().firstValue("Content-Disposition").orElse("").contains("attachment"));
    assertEquals(
        200, req("POST", base() + "/" + id + "/prilohy/" + fid + "/delete", null).statusCode());
    assertEquals(
        404, req("GET", base() + "/" + id + "/prilohy/" + fid + "/download", null).statusCode());
    assertEquals(
        404, req("POST", base() + "/" + id + "/prilohy/" + fid + "/delete", null).statusCode());
    assertEquals(200, req("POST", base() + "/" + id + "/delete", null).statusCode());
    assertEquals(404, req("POST", base() + "/" + id + "/delete", null).statusCode());
    assertEquals(404, req("GET", base() + "/" + id + "/prilohy", null).statusCode());
    assertEquals(404, upload(id, "a.pdf", "application/pdf", "%PDF-1.7".getBytes()).statusCode());
  }

  HttpResponse<String> upload(String id, String filename, String type, byte[] bytes)
      throws Exception {
    String boundary = "openobec-test-boundary";
    String first =
        "--"
            + boundary
            + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\""
            + filename
            + "\"\r\nContent-Type: "
            + type
            + "\r\n\r\n";
    byte[] head = first.getBytes(StandardCharsets.UTF_8),
        tail = ("\r\n--" + boundary + "--\r\n").getBytes();
    byte[] body = new byte[head.length + bytes.length + tail.length];
    System.arraycopy(head, 0, body, 0, head.length);
    System.arraycopy(bytes, 0, body, head.length, bytes.length);
    System.arraycopy(tail, 0, body, head.length + bytes.length, tail.length);
    return http.send(
        HttpRequest.newBuilder(URI.create(base() + "/" + id + "/prilohy"))
            .header("X-Obec-Id", "zilina")
            .header("Content-Type", "multipart/form-data; boundary=" + boundary)
            .POST(HttpRequest.BodyPublishers.ofByteArray(body))
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }

  @Test
  void strictHttpAndQueryErrors() throws Exception {
    assertEquals(
        400,
        http.send(
                HttpRequest.newBuilder(URI.create(base())).build(),
                HttpResponse.BodyHandlers.ofString())
            .statusCode());
    for (String q :
        new String[] {
          "page=0", "page=1.2", "page_size=101", "sort=cislo", "zverejnene=1", "unknown=x"
        }) assertEquals(400, req("GET", base() + "?" + q, null).statusCode(), q);
    assertEquals(400, req("POST", base(), "{").statusCode());
    assertEquals(422, req("POST", base(), "{\"entity_version\":1}").statusCode());
    var r =
        http.send(
            HttpRequest.newBuilder(URI.create(base()))
                .header("X-Obec-Id", "zilina")
                .header("Content-Type", "text/plain")
                .POST(HttpRequest.BodyPublishers.ofString("text"))
                .build(),
            HttpResponse.BodyHandlers.ofString());
    assertEquals(415, r.statusCode());
  }

  @Test
  void deletedNumberRemainsReserved() throws Exception {
    var payload = valid();
    var r = req("POST", base(), payload.toString());
    assertEquals(201, r.statusCode(), r.body());
    String id = data(r).path("id").asText();
    assertEquals(200, req("POST", base() + "/" + id + "/delete", null).statusCode());
    assertEquals(409, req("POST", base(), payload.toString()).statusCode());
  }

  @Test
  void databaseAndOutboxAreAtomicAndMoneyIsDecimal128() throws Exception {
    String id = create();
    var db = mongo.getDatabase(DB);
    var stored = db.getCollection("documents").find(Filters.eq("id", id)).first();
    assertNotNull(stored);
    assertEquals(1L, ((Number) stored.get("_version")).longValue());
    assertEquals(1, db.getCollection("outbox").countDocuments(Filters.eq("event.entity_id", id)));
    var out =
        db.getCollection("outbox")
            .find(Filters.eq("event.entity_id", id))
            .first()
            .get("event", Document.class);
    assertEquals(id, out.get("entity_id"));
    assertEquals(false, out.get("data", Document.class).get("deleted"));
    assertNull(out.get("data", Document.class).get("deleted_at"));
    assertEquals(1L, ((Number) out.get("entity_version")).longValue());
    assertInstanceOf(org.bson.types.Decimal128.class, stored.get("suma_bez_dph"));
    db.runCommand(
        new Document("collMod", "audit")
            .append("validator", new Document("_id", new Document("$exists", false))));
    try {
      var response = req("POST", base() + "/" + id + "/update", "{\"predmet\":\"Must rollback\"}");
      assertEquals(500, response.statusCode(), response.body());
      assertEquals(
          1L,
          ((Number)
                  db.getCollection("documents").find(Filters.eq("id", id)).first().get("_version"))
              .longValue());
    } finally {
      db.runCommand(new Document("collMod", "audit").append("validator", new Document()));
    }
  }

  @Test
  void parallelPatchesPreserveBothChanges() throws Exception {
    String id = create();
    try (var pool = Executors.newFixedThreadPool(2)) {
      var a =
          pool.submit(
              () -> req("POST", base() + "/" + id + "/update", "{\"predmet\":\"Concurrent\"}"));
      var b =
          pool.submit(() -> req("POST", base() + "/" + id + "/update", "{\"zverejnene\":true}"));
      assertEquals(200, a.get().statusCode());
      assertEquals(200, b.get().statusCode());
    }
    var d = data(req("GET", base() + "/" + id, null));
    assertEquals("Concurrent", d.path("predmet").asText());
    assertTrue(d.path("zverejnene").asBoolean());
  }

  @Test
  void tenActiveFilesAndSignatures() throws Exception {
    String id = create();
    assertEquals(415, upload(id, "a.png", "image/png", "%PDF-1.7".getBytes()).statusCode());
    for (int i = 0; i < 10; i++)
      assertEquals(201, upload(id, "a.pdf", "application/pdf", "%PDF-1.7".getBytes()).statusCode());
    assertEquals(
        422, upload(id, "extra.pdf", "application/pdf", "%PDF-1.7".getBytes()).statusCode());
  }

  @Test
  void exportIsFrozenAndIncludesTombstones() throws Exception {
    String id = create();
    assertEquals(200, req("POST", base() + "/" + id + "/delete", null).statusCode());
    String export = "http://localhost:" + port + "/internal/v1/export?page_size=1";
    var first = req("GET", export, null);
    assertEquals(200, first.statusCode(), first.body());
    JsonNode page = mapper.readTree(first.body());
    String snapshot = page.path("snapshot_id").asText();
    assertFalse(snapshot.isBlank());
    String later = create();
    boolean deletedSeen = false;
    do {
      for (JsonNode event : page.path("data")) {
        assertNotEquals(later, event.path("entity_id").asText());
        if (event.path("entity_id").asText().equals(id)) {
          deletedSeen = true;
          assertTrue(event.path("data").path("deleted").asBoolean());
          assertEquals("document.deleted", event.path("event_type").asText());
        }
      }
      if (page.path("next_cursor").isNull()) break;
      page =
          mapper.readTree(
              req(
                      "GET",
                      "http://localhost:"
                          + port
                          + "/internal/v1/export?page_size=1&cursor="
                          + page.path("next_cursor").asText(),
                      null)
                  .body());
    } while (true);
    assertTrue(deletedSeen);
  }

  @Test
  void metadataFailureCompensatesPrivateS3Object() throws Exception {
    String id = create();
    var db = mongo.getDatabase(DB);
    var s3 =
        software.amazon.awssdk.services.s3.S3Client.builder()
            .region(software.amazon.awssdk.regions.Region.US_EAST_1)
            .endpointOverride(URI.create("http://localhost:9000"))
            .forcePathStyle(true)
            .credentialsProvider(
                software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(
                    software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(
                        "openobec-demo", "openobec-local-demo-secret")))
            .build();
    try (s3) {
      String prefix = "zilina/dodavatelske-faktury/" + id + "/";
      db.runCommand(
          new Document("collMod", "attachments")
              .append("validator", new Document("_id", new Document("$exists", false))));
      try {
        var response = upload(id, "rollback.pdf", "application/pdf", "%PDF-1.7".getBytes());
        assertEquals(500, response.statusCode(), response.body());
        assertEquals(
            0, db.getCollection("attachments").countDocuments(Filters.eq("document_id", id)));
        assertEquals(
            0,
            s3.listObjectsV2(
                    software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
                        .bucket("openobec-documents")
                        .prefix(prefix)
                        .build())
                .keyCount());
        assertEquals(200, req("GET", base() + "/" + id, null).statusCode());
      } finally {
        db.runCommand(new Document("collMod", "attachments").append("validator", new Document()));
      }
    }
  }

  @Test
  void uploadDigestMatchesExactBytesAndLargeFilesAreRejected() throws Exception {
    String id = create();
    byte[] bytes = "%PDF-1.7\nExact content".getBytes(StandardCharsets.UTF_8);
    var response = upload(id, "digest.pdf", "application/pdf", bytes);
    assertEquals(201, response.statusCode(), response.body());
    assertEquals(
        HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes)),
        data(response).path("sha256").asText());
    byte[] large = new byte[20971521];
    System.arraycopy("%PDF-1.7".getBytes(), 0, large, 0, 8);
    assertEquals(413, upload(id, "huge.pdf", "application/pdf", large).statusCode());
  }
}
