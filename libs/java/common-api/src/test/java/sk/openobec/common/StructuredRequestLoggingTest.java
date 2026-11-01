package sk.openobec.common;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.*;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.test.system.*;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@ExtendWith(OutputCaptureExtension.class)
class StructuredRequestLoggingTest {
  @Test
  void ecsConsoleIncludesServiceAndIdentityForSuccessfulAndFailingHttp(CapturedOutput output)
      throws Exception {
    try (var context =
        new SpringApplicationBuilder(ProbeApplication.class)
            .web(WebApplicationType.SERVLET)
            .properties(
                Map.of(
                    "server.port", "0",
                    "spring.application.name", "identity-http-test",
                    "logging.structured.format.console", "ecs",
                    "spring.main.banner-mode", "off"))
            .run()) {
      int port = ((ServletWebServerApplicationContext) context).getWebServer().getPort();
      var client = HttpClient.newHttpClient();
      var success =
          client.send(
              HttpRequest.newBuilder(
                      URI.create("http://localhost:" + port + "/rest/probe?hidden=never-log-query"))
                  .header("X-Obec-Id", "zilina")
                  .header("X-Request-Id", "ecs_success")
                  .header("Authorization", "Bearer never-log-token")
                  .build(),
              HttpResponse.BodyHandlers.ofString());
      assertEquals(200, success.statusCode());
      assertEquals("ecs_success", success.headers().firstValue("X-Request-Id").orElseThrow());
      var failure =
          client.send(
              HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/rest/probe"))
                  .header("X-Request-Id", "ecs_tenant_failure")
                  .build(),
              HttpResponse.BodyHandlers.ofString());
      assertEquals(400, failure.statusCode());
      assertEquals(
          "ecs_tenant_failure",
          Json.mapper().readTree(failure.body()).path("error").path("request_id").asText());
      org.awaitility.Awaitility.await()
          .atMost(Duration.ofSeconds(3))
          .until(() -> completionRecords(output.getOut()).size() == 2);
      var records = completionRecords(output.getOut());
      for (var record : records) {
        assertEquals("identity-http-test", record.path("service").path("name").asText());
        assertEquals("GET", record.path("method").asText());
        assertEquals("/rest/probe", record.path("path").asText());
        String id = record.path("request_id").asText();
        assertTrue(Set.of("ecs_success", "ecs_tenant_failure").contains(id));
        assertEquals(id.equals("ecs_success") ? 200 : 400, record.path("status").asInt());
      }
      assertFalse(output.getOut().contains("never-log"));
    }
  }

  private List<JsonNode> completionRecords(String output) throws Exception {
    List<JsonNode> result = new ArrayList<>();
    for (String line : output.split("\\R")) {
      if (!line.startsWith("{")) continue;
      JsonNode value = Json.mapper().readTree(line);
      if (value.has("request_id")
          && value.path("message").asText().equals("HTTP request completed")) result.add(value);
    }
    return result;
  }

  @Configuration(proxyBeanMethods = false)
  @EnableAutoConfiguration(
      exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
        MongoRepositoriesAutoConfiguration.class,
        KafkaAutoConfiguration.class
      })
  static class ProbeApplication {
    @Bean
    RequestDiagnosticsTest.ProbeController probe() {
      return new RequestDiagnosticsTest.ProbeController();
    }

    @Bean
    ApiErrors errors() {
      return new ApiErrors();
    }

    @Bean
    WebMvcConfigurer interceptor() {
      return new WebMvcConfigurer() {
        @Override
        public void addInterceptors(InterceptorRegistry registry) {
          new CommonConfiguration().addInterceptors(registry);
        }
      };
    }
  }
}
