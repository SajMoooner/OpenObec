package sk.openobec.gateway;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRoutingTest {
  static final HttpServer upstream = start();

  static HttpServer start() {
    try {
      HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
      server.createContext(
          "/",
          exchange -> {
            byte[] data =
                ("{\"forwarded\":\""
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
    for (String name :
        List.of(
            "faktury",
            "dodavatelske-faktury",
            "zmluvy",
            "objednavky",
            "verejne-obstaravanie",
            "vzn",
            "query"))
      r.add(
          "openobec.services." + name, () -> "http://127.0.0.1:" + upstream.getAddress().getPort());
  }

  @LocalServerPort int port;

  WebTestClient client() {
    return WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
  }

  @AfterAll
  static void stop() {
    upstream.stop(0);
  }

  @Test
  void forwardsExactReadRoutesAndRequestIdentity() {
    for (String path :
        List.of(
            "/rest/v1/query/faktury",
            "/rest/v1/faktury/fak_1/suvislosti",
            "/rest/v1/vyber-zaznamov",
            "/rest/v1/vzn",
            "/rest/v1/zmluvy/zml_1/prilohy"))
      client()
          .get()
          .uri(path)
          .header("X-Obec-Id", "zilina")
          .header("X-Request-Id", "req_gateway_test")
          .exchange()
          .expectStatus()
          .isOk()
          .expectHeader()
          .valueEquals("X-Request-Id", "req_gateway_test")
          .expectBody()
          .jsonPath("$.forwarded")
          .isEqualTo(path)
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
        .isOk();
    client()
        .get()
        .uri("/rest/v1/faktury/fak_1/prilohy/file_1/download")
        .header("X-Obec-Id", "zilina")
        .exchange()
        .expectStatus()
        .isOk();
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
