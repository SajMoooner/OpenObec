package sk.openobec.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

final class GatewayErrors {
  static final String REQUEST_ID = GatewayErrors.class.getName() + ".requestId";

  private GatewayErrors() {}

  static Mono<Void> write(
      ServerWebExchange exchange, ObjectMapper mapper, int status, String code, String message) {
    if (exchange.getResponse().isCommitted()) return Mono.empty();
    exchange.getResponse().setRawStatusCode(status);
    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
    exchange.getResponse().getHeaders().setCacheControl("no-store");
    try {
      var body =
          Map.of(
              "error",
              Map.of(
                  "code",
                  code,
                  "message",
                  message,
                  "details",
                  List.of(),
                  "request_id",
                  exchange.getAttributeOrDefault(REQUEST_ID, "req_gateway")));
      return exchange
          .getResponse()
          .writeWith(
              Mono.just(
                  exchange.getResponse().bufferFactory().wrap(mapper.writeValueAsBytes(body))));
    } catch (Exception failure) {
      return Mono.error(failure);
    }
  }
}
