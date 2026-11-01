package sk.openobec.common;

import com.fasterxml.jackson.annotation.*;
import java.math.BigDecimal;

public record Money(BigDecimal value) {
  @JsonCreator
  public static Money parse(String value) {
    return new Money(new BigDecimal(value));
  }

  @JsonValue
  public String json() {
    return value.setScale(2).toPlainString();
  }
}
