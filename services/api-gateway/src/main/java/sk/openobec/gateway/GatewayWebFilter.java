package sk.openobec.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
class GatewayWebFilter implements WebFilter, Ordered {
  private static final org.slf4j.Logger LOG =
      org.slf4j.LoggerFactory.getLogger(GatewayWebFilter.class);
  private final ObjectMapper mapper;
  private final WindowLimiter limiter;

  GatewayWebFilter(ObjectMapper mapper, @Value("${openobec.gateway.rate-limit:1200}") int limit) {
    this.mapper = mapper;
    this.limiter = new WindowLimiter(limit, 4096, System::currentTimeMillis);
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange original, WebFilterChain chain) {
    String incoming = original.getRequest().getHeaders().getFirst("X-Request-Id");
    String requestId =
        incoming != null && incoming.matches("[A-Za-z0-9_-]{1,100}")
            ? incoming
            : "req_" + UUID.randomUUID();
    original.getAttributes().put(GatewayErrors.REQUEST_ID, requestId);
    original.getResponse().getHeaders().set("X-Request-Id", requestId);
    var exchange =
        original.mutate().request(r -> r.headers(h -> h.set("X-Request-Id", requestId))).build();
    if (!exchange.getRequest().getPath().value().startsWith("/rest/"))
      return chain.filter(exchange);
    exchange
        .getResponse()
        .beforeCommit(
            () -> {
              exchange.getResponse().getHeaders().set("X-Request-Id", requestId);
              var status = exchange.getResponse().getStatusCode();
              LOG.atInfo()
                  .addKeyValue("request_id", requestId)
                  .addKeyValue("method", exchange.getRequest().getMethod().name())
                  .addKeyValue("path", exchange.getRequest().getPath().value())
                  .addKeyValue("status", status == null ? 200 : status.value())
                  .log("HTTP request completed");
              return Mono.empty();
            });
    if (!"zilina".equals(exchange.getRequest().getHeaders().getFirst("X-Obec-Id")))
      return GatewayErrors.write(
          exchange, mapper, 400, "BAD_REQUEST", "Hlavička X-Obec-Id musí mať hodnotu zilina.");
    var address = exchange.getRequest().getRemoteAddress();
    String peer = address == null ? "unknown" : address.getAddress().getHostAddress();
    long retry = limiter.retryAfter(peer);
    if (retry > 0) {
      exchange.getResponse().getHeaders().set("Retry-After", Long.toString(retry));
      return GatewayErrors.write(
          exchange,
          mapper,
          429,
          "RATE_LIMITED",
          "Príliš veľa požiadaviek. Skúste to o chvíľu znova.");
    }
    var mediaType = exchange.getRequest().getHeaders().getContentType();
    long limit =
        mediaType != null && "multipart".equalsIgnoreCase(mediaType.getType())
            ? 21L * 1024 * 1024
            : 1024L * 1024;
    if (exchange.getRequest().getHeaders().getContentLength() > limit)
      return GatewayErrors.write(
          exchange, mapper, 413, "PAYLOAD_TOO_LARGE", "Požiadavka prekračuje povolenú veľkosť.");
    AtomicLong count = new AtomicLong();
    var bounded =
        new ServerHttpRequestDecorator(exchange.getRequest()) {
          @Override
          public Flux<DataBuffer> getBody() {
            return super.getBody()
                .handle(
                    (buffer, sink) -> {
                      if (count.addAndGet(buffer.readableByteCount()) > limit) {
                        DataBufferUtils.release(buffer);
                        sink.error(new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE));
                      } else sink.next(buffer);
                    });
          }
        };
    return chain.filter(exchange.mutate().request(bounded).build());
  }
}
