package sk.openobec.common;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;

public interface DomainDefinition<T> {
  String agenda();

  String prefix();

  Class<T> type();

  Set<String> fields();

  void validate(ObjectNode n);

  boolean paired();

  default ObjectNode normalize(ObjectNode patch, ObjectNode previous) {
    Rules.allowed(patch, fields());
    if (previous != null && patch.isEmpty()) Rules.fail("body", "INVALID_VALUE");
    ObjectNode result = previous == null ? Json.mapper().createObjectNode() : previous.deepCopy();
    result.retain(fields());
    patch.properties().forEach(e -> result.set(e.getKey(), e.getValue()));
    validate(result);
    decode(result);
    return result;
  }

  default T decode(ObjectNode n) {
    try {
      return Json.mapper().treeToValue(n, type());
    } catch (Exception e) {
      throw ApiException.validation("body", "INVALID_TYPE", "Nesprávny typ poľa.");
    }
  }
}
