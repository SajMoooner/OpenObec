package sk.openobec.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Request-local correlation and completion diagnostics; no thread-local state or request content.
 */
public final class RequestDiagnosticsInterceptor implements HandlerInterceptor {
  private static final Pattern VALID_ID = Pattern.compile("[A-Za-z0-9_-]{1,100}");
  private static final String LOGGED = RequestDiagnosticsInterceptor.class.getName() + ".logged";
  private static final Logger LOG = LoggerFactory.getLogger(RequestDiagnosticsInterceptor.class);

  public static String requestId(HttpServletRequest request) {
    Object existing = request.getAttribute("request_id");
    if (existing instanceof String id && valid(id)) return id;
    String incoming = request.getHeader("X-Request-Id");
    String id = valid(incoming) ? incoming : "req_" + UUID.randomUUID();
    request.setAttribute("request_id", id);
    return id;
  }

  private static boolean valid(String id) {
    return id != null && VALID_ID.matcher(id).matches();
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) {
    response.setHeader("X-Request-Id", requestId(request));
    if (!"zilina".equals(request.getHeader("X-Obec-Id")))
      throw new ApiException(400, "BAD_REQUEST", "Vyžaduje sa X-Obec-Id: zilina.");
    return true;
  }

  @Override
  public void afterCompletion(
      HttpServletRequest request, HttpServletResponse response, Object handler, Exception failure) {
    completed(request, response.getStatus());
  }

  /** Error advice also completes requests rejected before an interceptor can finish preHandle. */
  public static void completed(HttpServletRequest request, int status) {
    String path = request.getRequestURI();
    if (path.equals("/actuator/health") || path.startsWith("/actuator/health/")) return;
    if (Boolean.TRUE.equals(request.getAttribute(LOGGED))) return;
    request.setAttribute(LOGGED, true);
    LOG.atInfo()
        .addKeyValue("request_id", requestId(request))
        .addKeyValue("method", request.getMethod())
        .addKeyValue("path", path)
        .addKeyValue("status", status)
        .log("HTTP request completed");
  }
}
