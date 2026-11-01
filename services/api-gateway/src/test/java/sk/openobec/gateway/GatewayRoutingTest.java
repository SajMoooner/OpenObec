package sk.openobec.gateway;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRoutingTest {
  static final Map<String, HttpServer> upstreams =
      Map.of(
          "faktury", start("faktury"),
          "dodavatelske-faktury", start("dodavatelske-faktury"),
          "zmluvy", start("zmluvy"),
          "objednavky", start("objednavky"),
          "verejne-obstaravanie", start("verejne-obstaravanie"),
          "vzn", start("vzn"),
          "query", start("query"));

  static HttpServer start(String destination) {
    try {
      HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
      server.createContext(
          "/",
          exchange -> {
            byte[] data =
                ("{\"destination\":\""
                        + destination
                        + "\",\"forwarded\":\""
                        + exchange.getRequestURI().getPath()
                        + "\",\"obec\":\""
                        + exchange.getRequestHeaders().getFirst("X-Obec-Id")
                        + "\",\"request_id\":\""
                        + exchange.getRequestHeaders().getFirst("X-Request-Id")
                        + "\"}")
                    .getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange
                .getResponseHeaders()
                .set("X-Request-Id", exchange.getRequestHeaders().getFirst("X-Request-Id"));
            exchange.sendResponseHeaders(200, data.length);
            try (var out = exchange.getResponseBody()) {
              out.write(data);
            }
          });
      server.start();
      return server;
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    upstreams.forEach(
        (name, upstream) ->
            r.add(
                "openobec.services." + name,
                () -> "http://127.0.0.1:" + upstream.getAddress().getPort()));
  }

  @LocalServerPort int port;

  WebTestClient client() {
    return WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
  }

  @AfterAll
  static void stop() {
    upstreams.values().forEach(upstream -> upstream.stop(0));
  }

  @Test
  void forwardsExactReadRoutesAndRequestIdentity() {
    for (var route :
        Map.ofEntries(
            Map.entry("/rest/v1/query/faktury", "query"),
            Map.entry("/rest/v1/query/dodavatelske-faktury/dfak_1", "query"),
            Map.entry("/rest/v1/query/zmluvy/zml_1", "query"),
            Map.entry("/rest/v1/query/objednavky/obj_1", "query"),
            Map.entry("/rest/v1/query/verejne-obstaravanie/vo_1", "query"),
            Map.entry("/rest/v1/faktury/fak_1/suvislosti", "query"),
            Map.entry("/rest/v1/vyber-zaznamov", "query"),
            Map.entry("/rest/v1/faktury", "faktury"),
            Map.entry("/rest/v1/dodavatelske-faktury", "dodavatelske-faktury"),
            Map.entry("/rest/v1/zmluvy", "zmluvy"),
            Map.entry("/rest/v1/objednavky", "objednavky"),
            Map.entry("/rest/v1/verejne-obstaravanie", "verejne-obstaravanie"),
            Map.entry("/rest/v1/vzn", "vzn"),
            Map.entry("/rest/v1/zmluvy/zml_1/prilohy", "zmluvy"))
            .entrySet())
      client()
          .get()
          .uri(route.getKey())
          .header("X-Obec-Id", "zilina")
          .header("X-Request-Id", "req_gateway_test")
          .exchange()
          .expectStatus()
          .isOk()
          .expectHeader()
          .valueEquals("X-Request-Id", "req_gateway_test")
          .expectBody()
          .jsonPath("$.forwarded")
          .isEqualTo(route.getKey())
          .jsonPath("$.destination")
          .isEqualTo(route.getValue())
          .jsonPath("$.obec")
          .isEqualTo("zilina")
          .jsonPath("$.request_id")
          .isEqualTo("req_gateway_test");
  }

  @Test
  void forwardsPostAndAttachmentDownload() {
    client()
        .post()
        .uri("/rest/v1/objednavky/obj_1/update")
        .header("X-Obec-Id", "zilina")
        .header("Content-Type", "application/json")
        .bodyValue("{\"predmet\":\"Zmena\"}")
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody()
        .jsonPath("$.destination")
        .isEqualTo("objednavky");
    client()
        .get()
        .uri("/rest/v1/faktury/fak_1/prilohy/file_1/download")
        .header("X-Obec-Id", "zilina")
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody()
        .jsonPath("$.destination")
        .isEqualTo("faktury");
  }

  @Test
  void missingOrWrongMunicipalityHasContractError() {
    for (String value : List.of("", "other")) {
      var request = client().get().uri("/rest/v1/faktury");
      if (!value.isEmpty()) request.header("X-Obec-Id", value);
      request
          .exchange()
          .expectStatus()
          .isBadRequest()
          .expectBody()
          .jsonPath("$.error.code")
          .isEqualTo("BAD_REQUEST")
          .jsonPath("$.error.details")
          .isArray()
          .jsonPath("$.error.request_id")
          .isNotEmpty();
    }
  }

  @Test
  void internalAndUnknownPathsAreNotForwarded() {
    for (String path :
        List.of(
            "/internal/v1/export",
            "/rest/v1/query/vzn",
            "/rest/v1/anything",
            "/rest/v1/faktury/1/anything"))
      client()
          .get()
          .uri(path)
          .header("X-Obec-Id", "zilina")
          .exchange()
          .expectStatus()
          .isNotFound()
          .expectBody()
          .jsonPath("$.error.code")
          .isEqualTo("NOT_FOUND");
  }

  @Test
  void oversizeJsonRejectedBeforeProxy() {
    client()
        .post()
        .uri("/rest/v1/faktury")
        .header("X-Obec-Id", "zilina")
        .header("Content-Type", "application/json")
        .bodyValue("x".repeat(1048577))
        .exchange()
        .expectStatus()
        .isEqualTo(413)
        .expectBody()
        .jsonPath("$.error.code")
        .isEqualTo("PAYLOAD_TOO_LARGE");
  }
}
