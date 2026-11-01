package sk.openobec.common;

import java.util.List;

public class ApiException extends RuntimeException {
  private final int status;
  private final String code;
  private final List<ErrorDetail> details;

  public ApiException(int status, String code, String message, List<ErrorDetail> details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = List.copyOf(details);
  }

  public ApiException(int status, String code, String message) {
    this(status, code, message, List.of());
  }

  public int status() {
    return status;
  }

  public String code() {
    return code;
  }

  public List<ErrorDetail> details() {
    return details;
  }

  public static ApiException validation(String field, String code, String message) {
    return new ApiException(
        422, "VALIDATION_ERROR", message, List.of(new ErrorDetail(field, code, message)));
  }

  public static ApiException notFound() {
    return new ApiException(404, "NOT_FOUND", "Záznam neexistuje.");
  }
}
