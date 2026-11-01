package sk.openobec.gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.ServerSocket;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayPostRetryTest {
  static final AtomicInteger accepted = new AtomicInteger();
  static final ServerSocket resetServer = start();

  static ServerSocket start() {
    try {
      var server = new ServerSocket(0);
      var worker =
          new Thread(
              () -> {
                while (!server.isClosed()) {
                  try (var socket = server.accept()) {
                    accepted.incrementAndGet();
                    socket.setSoLinger(true, 0);
                  } catch (java.io.IOException failure) {
                    if (!server.isClosed()) throw new IllegalStateException(failure);
                  }
                }
              });
      worker.setDaemon(true);
      worker.start();
      return server;
    } catch (java.io.IOException e) {
      throw new IllegalStateException(e);
    }
  }

  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry r) {
    r.add("openobec.services.faktury", () -> "http://127.0.0.1:" + resetServer.getLocalPort());
  }

  @LocalServerPort int port;

  @AfterAll
  static void close() throws Exception {
    resetServer.close();
  }

  @Test
  void connectionResetNeverReplaysPost() {
    WebTestClient.bindToServer()
        .baseUrl("http://127.0.0.1:" + port)
        .build()
        .post()
        .uri("/rest/v1/faktury")
        .header("X-Obec-Id", "zilina")
        .header("Content-Type", "application/json")
        .bodyValue("{}")
        .exchange()
        .expectStatus()
        .isEqualTo(503);
    assertThat(accepted.get())
        .as("A write has exactly one upstream connection attempt")
        .isEqualTo(1);
  }
}
