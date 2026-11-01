package sk.openobec.common;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.util.*;
import org.bson.Document;
import org.bson.types.Decimal128;

/** Money remains Decimal128 in Mongo and canonical two-decimal strings on the wire. */
public final class BsonJson {
  private BsonJson() {}

  public static Document document(ObjectNode n) {
    return (Document) toBson(null, n);
  }

  private static Object toBson(String field, JsonNode n) {
    if (n.isNull()) return null;
    if (n.isObject()) {
      Document d = new Document();
      n.properties().forEach(e -> d.put(e.getKey(), toBson(e.getKey(), e.getValue())));
      return d;
    }
    if (n.isArray()) {
      List<Object> a = new ArrayList<>();
      n.forEach(x -> a.add(toBson(null, x)));
      return a;
    }
    if (n.isBoolean()) return n.booleanValue();
    if (n.isIntegralNumber()) return n.longValue();
    if (n.isTextual()) {
      if (field != null
          && (field.startsWith("suma_") || field.equals("predpokladana_hodnota_bez_dph"))) {
        try {
          return new Decimal128(new java.math.BigDecimal(n.asText()));
        } catch (ArithmeticException precision) {
          return n.asText();
        }
      }
      return n.asText();
    }
    throw new IllegalArgumentException("Unsupported BSON value");
  }

  public static ObjectNode json(Document d) {
    return (ObjectNode) fromBson(d);
  }

  private static JsonNode fromBson(Object v) {
    if (v == null) return NullNode.instance;
    if (v instanceof Decimal128 n)
      return TextNode.valueOf(n.bigDecimalValue().setScale(2).toPlainString());
    if (v instanceof Map<?, ?> m) {
      ObjectNode n = Json.mapper().createObjectNode();
      m.forEach(
          (k, x) -> {
            if (!k.toString().startsWith("_")) n.set(k.toString(), fromBson(x));
          });
      return n;
    }
    if (v instanceof List<?> a) {
      ArrayNode n = Json.mapper().createArrayNode();
      a.forEach(x -> n.add(fromBson(x)));
      return n;
    }
    if (v instanceof Boolean b) return BooleanNode.valueOf(b);
    if (v instanceof Number n) return LongNode.valueOf(n.longValue());
    if (v instanceof java.util.Date d) return TextNode.valueOf(d.toInstant().toString());
    return TextNode.valueOf(v.toString());
  }
}
