package sk.openobec.common;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.sun.net.httpserver.HttpServer;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.*;

class ReferenceValidatorTest {
  HttpServer server;
  ExecutorService serverPool;
  AtomicInteger requests = new AtomicInteger(),
      inflight = new AtomicInteger(),
      maximum = new AtomicInteger();

  @BeforeEach
  void start() throws Exception {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    serverPool = Executors.newCachedThreadPool();
    server.setExecutor(serverPool);
    server.createContext(
        "/rest/v1/zmluvy/",
        exchange -> {
          requests.incrementAndGet();
          String id = exchange.getRequestURI().getPath().substring("/rest/v1/zmluvy/".length());
          int count = inflight.incrementAndGet();
          maximum.accumulateAndGet(count, Math::max);
          try {
            if (id.startsWith("slow")) Thread.sleep(300);
            int status = id.equals("missing") ? 404 : id.equals("broken") ? 503 : 200;
            String tenant = id.equals("foreign") ? "other" : "zilina";
            byte[] body =
                ("{\"data\":{\"id\":\"" + id + "\",\"obec_id\":\"" + tenant + "\"}}")
                    .getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(status, body.length);
            exchange.getResponseBody().write(body);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          } finally {
            inflight.decrementAndGet();
            exchange.close();
          }
        });
    server.start();
  }

  @AfterEach
  void stop() {
    server.stop(0);
    serverPool.shutdownNow();
  }

  ReferenceValidator validator() {
    return new ReferenceValidator(
        Map.of("zmluvy", "http://127.0.0.1:" + server.getAddress().getPort()));
  }

  ArrayNode refs(String... ids) {
    var a = Json.mapper().createArrayNode();
    for (String id : ids) a.addObject().put("typ", "zmluvy").put("id", id);
    return a;
  }

  @Test
  void missingAndWrongTenantAreInvalidReferences() {
    try (var validator = validator()) {
      for (String id : new String[] {"missing", "foreign"}) {
        ApiException e = assertThrows(ApiException.class, () -> validator.validate(refs(id), null));
        assertEquals(422, e.status());
        assertEquals("INVALID_REFERENCE", e.details().getFirst().code());
      }
    }
  }

  @Test
  void unavailableOwnerIs503() {
    try (var validator = validator()) {
      assertEquals(
          503,
          assertThrows(ApiException.class, () -> validator.validate(refs("broken"), null))
              .status());
    }
  }

  @Test
  void unchangedLegacyReferencesDoNotCallDeletedOwner() {
    try (var validator = validator()) {
      validator.validate(refs("missing"), refs("missing"));
      assertEquals(0, requests.get());
      validator.validate(refs("missing", "new"), refs("missing"));
      assertEquals(1, requests.get());
    }
  }

  @Test
  void validatesHundredReferencesWithBoundedParallelism() {
    try (var validator = validator()) {
      String[] ids = new String[100];
      for (int i = 0; i < 100; i++) ids[i] = "slow" + i;
      Instant start = Instant.now();
      validator.validate(refs(ids), null);
      assertTrue(Duration.between(start, Instant.now()).toSeconds() < 15);
      assertEquals(100, requests.get());
      assertTrue(maximum.get() > 1);
      assertTrue(maximum.get() <= 8, "maximum=" + maximum.get());
    }
  }
}
