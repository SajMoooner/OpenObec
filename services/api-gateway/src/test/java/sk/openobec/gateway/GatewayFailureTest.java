package sk.openobec.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {"openobec.gateway.rate-limit=2"})
class GatewayFailureTest {
  static final int closedPort = closedPort();

  static int closedPort() {
    try (var socket = new java.net.ServerSocket(0)) {
      return socket.getLocalPort();
    } catch (java.io.IOException e) {
      throw new IllegalStateException(e);
    }
  }

  @org.springframework.test.context.DynamicPropertySource
  static void upstream(org.springframework.test.context.DynamicPropertyRegistry r) {
    r.add("openobec.services.faktury", () -> "http://127.0.0.1:" + closedPort);
  }

  @LocalServerPort int port;

  @Test
  void unavailableAndRateLimitUseContractErrors() {
    var client = WebTestClient.bindToServer().baseUrl("http://127.0.0.1:" + port).build();
    for (int i = 0; i < 2; i++)
      client
          .get()
          .uri("/rest/v1/faktury")
          .header("X-Obec-Id", "zilina")
          .exchange()
          .expectStatus()
          .isEqualTo(503)
          .expectHeader()
          .valueEquals("Retry-After", "2")
          .expectBody()
          .jsonPath("$.error.code")
          .isEqualTo("DEPENDENCY_UNAVAILABLE");
    client
        .post()
        .uri("/rest/v1/faktury")
        .header("X-Obec-Id", "zilina")
        .bodyValue("{}")
        .exchange()
        .expectStatus()
        .isEqualTo(429)
        .expectHeader()
        .exists("Retry-After")
        .expectBody()
        .jsonPath("$.error.code")
        .isEqualTo("RATE_LIMITED");
  }
}
