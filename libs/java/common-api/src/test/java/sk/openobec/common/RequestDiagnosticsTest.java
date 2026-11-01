package sk.openobec.common;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.junit.jupiter.api.*;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

class RequestDiagnosticsTest {
  MockMvc mvc;
  Logger logger;
  ListAppender<ILoggingEvent> events;

  @BeforeEach
  void setup() {
    var registry = new VisibleRegistry();
    new CommonConfiguration().addInterceptors(registry);
    mvc =
        MockMvcBuilders.standaloneSetup(new ProbeController())
            .setControllerAdvice(new ApiErrors())
            .setMessageConverters(new MappingJackson2HttpMessageConverter(Json.mapper()))
            .addInterceptors(registry.interceptors().toArray(HandlerInterceptor[]::new))
            .build();
    logger = (Logger) LoggerFactory.getLogger("sk.openobec.common.RequestDiagnosticsInterceptor");
    events = new ListAppender<>();
    events.start();
    logger.addAppender(events);
  }

  @AfterEach
  void cleanup() {
    logger.detachAppender(events);
    events.stop();
  }

  @Test
  void validIncomingGatewayIdentitySurvivesSourceApi() throws Exception {
    mvc.perform(
            get("/rest/probe")
                .header("X-Obec-Id", "zilina")
                .header("X-Request-Id", "gateway_123-ABC"))
        .andExpect(status().isOk())
        .andExpect(header().string("X-Request-Id", "gateway_123-ABC"))
        .andExpect(jsonPath("$.request_id").value("gateway_123-ABC"));
  }

  @Test
  void onlyStrictBoundedIncomingIdentitiesAreAccepted() throws Exception {
    for (String valid : List.of("A_1-z", "a".repeat(100))) {
      mvc.perform(get("/rest/probe").header("X-Obec-Id", "zilina").header("X-Request-Id", valid))
          .andExpect(status().isOk())
          .andExpect(header().string("X-Request-Id", valid));
    }
    Set<String> generated = new HashSet<>();
    for (String invalid : List.of("", "a.b", "a:b", "a b", "a/b", "ž", "a".repeat(101))) {
      var result =
          mvc.perform(
                  get("/rest/probe").header("X-Obec-Id", "zilina").header("X-Request-Id", invalid))
              .andExpect(status().isOk())
              .andReturn();
      String id = result.getResponse().getHeader("X-Request-Id");
      assertNotNull(id);
      assertTrue(id.matches("req_[A-Za-z0-9_-]{1,96}"), id);
      assertNotEquals(invalid, id);
      assertTrue(generated.add(id));
      assertEquals(
          id,
          Json.mapper()
              .readTree(result.getResponse().getContentAsString())
              .path("request_id")
              .asText());
    }
  }

  @Test
  void rejectedTenantSharesIdentityWithHeaderEnvelopeAndDiagnostic() throws Exception {
    for (String tenant : List.of("", "other")) {
      events.list.clear();
      var request = get("/rest/probe").header("X-Request-Id", "tenant_failure");
      if (!tenant.isEmpty()) request.header("X-Obec-Id", tenant);
      mvc.perform(request)
          .andExpect(status().isBadRequest())
          .andExpect(header().string("X-Request-Id", "tenant_failure"))
          .andExpect(jsonPath("$.error.request_id").value("tenant_failure"))
          .andExpect(jsonPath("$.error.code").value("BAD_REQUEST"))
          .andExpect(jsonPath("$.error.details").isArray());
      assertDiagnostic("tenant_failure", "GET", "/rest/probe", 400);
    }
  }

  @Test
  void completionDiagnosticsIncludeSuccessAndFailureWithoutQueryBodyOrSecrets() throws Exception {
    mvc.perform(
            post("/rest/failure?secret=never-log-query")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"password\":\"never-log-body\"}")
                .header("Authorization", "Bearer never-log-token")
                .header("X-Obec-Id", "zilina")
                .header("X-Request-Id", "failed_write"))
        .andExpect(status().isUnprocessableEntity())
        .andExpect(header().string("X-Request-Id", "failed_write"))
        .andExpect(jsonPath("$.error.request_id").value("failed_write"));
    assertDiagnostic("failed_write", "POST", "/rest/failure", 422);
    events.list.clear();
    mvc.perform(
            get("/rest/probe?query=never-log-query")
                .header("X-Obec-Id", "zilina")
                .header("X-Request-Id", "successful_read"))
        .andExpect(status().isOk());
    assertDiagnostic("successful_read", "GET", "/rest/probe", 200);
  }

  @Test
  void asynchronousBytesKeepOneIdentityAndOneCompletionWithoutMdcLeak() throws Exception {
    Map<String, String> before = MDC.getCopyOfContextMap();
    var initial =
        mvc.perform(get("/rest/download").header("X-Obec-Id", "zilina"))
            .andExpect(request().asyncStarted())
            .andReturn();
    String id = initial.getResponse().getHeader("X-Request-Id");
    assertNotNull(id);
    assertTrue(id.startsWith("req_"));
    mvc.perform(asyncDispatch(initial))
        .andExpect(status().isOk())
        .andExpect(header().string("X-Request-Id", id))
        .andExpect(content().bytes("%PDF-1.7\nExact bytes".getBytes(StandardCharsets.UTF_8)));
    assertDiagnostic(id, "GET", "/rest/download", 200);
    assertEquals(before, MDC.getCopyOfContextMap());
    events.list.clear();
    mvc.perform(get("/rest/probe").header("X-Request-Id", "invalid-tenant"))
        .andExpect(status().isBadRequest());
    assertEquals(before, MDC.getCopyOfContextMap());
    events.list.clear();
    var next =
        mvc.perform(get("/rest/probe").header("X-Obec-Id", "zilina"))
            .andExpect(status().isOk())
            .andReturn();
    assertNotEquals(id, next.getResponse().getHeader("X-Request-Id"));
    assertDiagnostic(next.getResponse().getHeader("X-Request-Id"), "GET", "/rest/probe", 200);
  }

  @Test
  void mediaRejectionBeforePreHandleStillPreservesIdentityAndDiagnostic() throws Exception {
    mvc.perform(
            post("/rest/failure")
                .contentType(MediaType.TEXT_PLAIN)
                .content("never-log-body")
                .header("X-Obec-Id", "zilina")
                .header("X-Request-Id", "media_failure"))
        .andExpect(status().isUnsupportedMediaType())
        .andExpect(header().string("X-Request-Id", "media_failure"))
        .andExpect(jsonPath("$.error.request_id").value("media_failure"));
    assertDiagnostic("media_failure", "POST", "/rest/failure", 415);
  }

  @Test
  void healthProbesDoNotEmitHttpDiagnosticsOrRequireMunicipality() throws Exception {
    mvc.perform(get("/actuator/health"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("UP"));
    assertTrue(events.list.isEmpty());
  }

  private void assertDiagnostic(String id, String method, String path, int status) {
    assertEquals(1, events.list.size(), events.list.toString());
    var event = events.list.getFirst();
    Map<String, Object> fields = new HashMap<>();
    assertNotNull(event.getKeyValuePairs());
    event.getKeyValuePairs().forEach(pair -> fields.put(pair.key, pair.value));
    assertEquals(id, fields.get("request_id"));
    assertEquals(method, fields.get("method"));
    assertEquals(path, fields.get("path"));
    assertEquals(status, fields.get("status"));
    String complete = event.getFormattedMessage() + fields;
    assertFalse(complete.contains("never-log"));
    assertFalse(complete.contains("?"));
  }

  static class VisibleRegistry extends InterceptorRegistry {
    List<Object> interceptors() {
      return getInterceptors();
    }
  }

  @RestController
  static class ProbeController {
    @GetMapping("/rest/probe")
    Map<String, Object> probe(HttpServletRequest request) {
      return Map.of("request_id", request.getAttribute("request_id"));
    }

    @PostMapping(value = "/rest/failure", consumes = MediaType.APPLICATION_JSON_VALUE)
    Object failure(@RequestBody Map<String, Object> ignored) {
      throw ApiException.validation("field", "INVALID_VALUE", "Rejected test input.");
    }

    @GetMapping("/rest/download")
    StreamingResponseBody download() {
      return output -> output.write("%PDF-1.7\nExact bytes".getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/actuator/health")
    Map<String, String> health() {
      return Map.of("status", "UP");
    }
  }
}
