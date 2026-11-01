package sk.openobec.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Order(-2)
class GatewayErrorHandler implements ErrorWebExceptionHandler {
  private static final org.slf4j.Logger LOG =
      org.slf4j.LoggerFactory.getLogger(GatewayErrorHandler.class);
  private final ObjectMapper mapper;

  GatewayErrorHandler(ObjectMapper mapper) {
    this.mapper = mapper;
  }

  @Override
  public Mono<Void> handle(ServerWebExchange exchange, Throwable failure) {
    if (exchange.getResponse().isCommitted()) return Mono.error(failure);
    int status =
        failure instanceof ResponseStatusException response
            ? response.getStatusCode().value()
            : 500;
    Throwable cause = failure;
    while (cause != null) {
      if (cause instanceof IOException
          || cause instanceof TimeoutException
          || cause.getClass().getSimpleName().contains("TimeoutException")
          || cause.getClass().getSimpleName().equals("PrematureCloseException")) {
        status = 503;
        break;
      }
      cause = cause.getCause();
    }
    if (status == 500)
      LOG.error(
          "Gateway failure requestId={}", exchange.getAttribute(GatewayErrors.REQUEST_ID), failure);
    if (status == 502 || status == 504) status = 503;
    String code =
        switch (status) {
          case 400 -> "BAD_REQUEST";
          case 404 -> "NOT_FOUND";
          case 405 -> "METHOD_NOT_ALLOWED";
          case 413 -> "PAYLOAD_TOO_LARGE";
          case 503 -> "DEPENDENCY_UNAVAILABLE";
          default -> "INTERNAL_ERROR";
        };
    String message =
        switch (status) {
          case 400 -> "Požiadavka nie je platná.";
          case 404 -> "Požadovaná operácia neexistuje.";
          case 405 -> "Táto metóda nie je povolená.";
          case 413 -> "Požiadavka prekračuje povolenú veľkosť.";
          case 503 -> "Služba momentálne nie je dostupná. Skúste to znova.";
          default -> "Požiadavku sa nepodarilo spracovať.";
        };
    if (status == 503) exchange.getResponse().getHeaders().set("Retry-After", "2");
    return GatewayErrors.write(exchange, mapper, status, code, message);
  }
}
