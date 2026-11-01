package sk.openobec.common;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import sk.openobec.files.FileFailure;

@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(ApiException.class)
  public ResponseEntity<?> api(ApiException e, HttpServletRequest req) {
    return response(e.status(), e.code(), e.getMessage(), e.details(), req);
  }

  @ExceptionHandler(FileFailure.class)
  public ResponseEntity<?> file(FileFailure e, HttpServletRequest req) {
    String code =
        switch (e.status()) {
          case 413 -> "PAYLOAD_TOO_LARGE";
          case 415 -> "UNSUPPORTED_MEDIA_TYPE";
          case 503 -> "DEPENDENCY_UNAVAILABLE";
          default -> "VALIDATION_ERROR";
        };
    return response(e.status(), code, e.getMessage(), List.of(), req);
  }

  @ExceptionHandler({
    HttpMessageNotReadableException.class,
    MissingServletRequestPartException.class,
    MethodArgumentTypeMismatchException.class
  })
  public ResponseEntity<?> bad(Exception e, HttpServletRequest req) {
    return response(400, "BAD_REQUEST", "Neplatná požiadavka.", List.of(), req);
  }

  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  public ResponseEntity<?> media(Exception e, HttpServletRequest req) {
    return response(415, "UNSUPPORTED_MEDIA_TYPE", "Nesprávny Content-Type.", List.of(), req);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<?> size(Exception e, HttpServletRequest req) {
    return response(413, "PAYLOAD_TOO_LARGE", "Príloha presahuje 20 MiB.", List.of(), req);
  }

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<?> missing(Exception e, HttpServletRequest req) {
    return response(404, "NOT_FOUND", "Cesta neexistuje.", List.of(), req);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> unexpected(Exception e, HttpServletRequest req) {
    org.slf4j.LoggerFactory.getLogger(ApiErrors.class)
        .atError()
        .addKeyValue("request_id", RequestDiagnosticsInterceptor.requestId(req))
        .addKeyValue("exception_type", e.getClass().getSimpleName())
        .log("HTTP request failed");
    return response(500, "INTERNAL_ERROR", "Požiadavku sa nepodarilo dokončiť.", List.of(), req);
  }

  private ResponseEntity<?> response(
      int status, String code, String message, List<ErrorDetail> details, HttpServletRequest req) {
    String requestId = RequestDiagnosticsInterceptor.requestId(req);
    RequestDiagnosticsInterceptor.completed(req, status);
    var builder = ResponseEntity.status(status).header("X-Request-Id", requestId);
    if (status == 503) builder.header("Retry-After", "2");
    return builder.body(
        Map.of(
            "error",
            Map.of("code", code, "message", message, "details", details, "request_id", requestId)));
  }
}
