package sk.openobec.query;

import com.mongodb.MongoException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestControllerAdvice
@Order(-1)
class QueryErrors {
  @ExceptionHandler(MongoException.class)
  ResponseEntity<?> mongo(MongoException e, HttpServletRequest req) {
    return new ApiErrors()
        .api(
            new ApiException(503, "DEPENDENCY_UNAVAILABLE", "Prehľad je dočasne nedostupný."), req);
  }
}
