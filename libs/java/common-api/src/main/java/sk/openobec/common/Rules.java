package sk.openobec.common;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

public final class Rules {
  private Rules() {}

  public static void fail(String field, String code) {
    throw ApiException.validation(field, code, "Neplatná hodnota poľa " + field + ".");
  }

  public static void allowed(ObjectNode n, Set<String> names) {
    n.fieldNames()
        .forEachRemaining(
            f -> {
              if (!names.contains(f)) fail(f, "UNKNOWN_FIELD");
            });
  }

  public static String text(ObjectNode n, String f, int max, boolean nullable) {
    JsonNode x = n.get(f);
    if (nullable && (x == null || x.isNull())) {
      n.putNull(f);
      return null;
    }
    if (x == null || !x.isTextual()) fail(f, "INVALID_TYPE");
    String s = x.textValue();
    if (s.isBlank() || s.length() > max) fail(f, "INVALID_VALUE");
    return s;
  }

  public static void bool(ObjectNode n, String f) {
    if (!n.has(f)) n.put(f, false);
    if (!n.path(f).isBoolean()) fail(f, "INVALID_TYPE");
  }

  public static void date(ObjectNode n, String f, boolean nullable) {
    String s = text(n, f, 10, nullable);
    if (s != null)
      try {
        if (!s.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) throw new IllegalArgumentException();
        LocalDate.parse(s);
      } catch (Exception e) {
        fail(f, "INVALID_VALUE");
      }
  }

  public static void instant(ObjectNode n, String f) {
    String s = text(n, f, 100, false);
    try {
      n.put(f, OffsetDateTime.parse(s).toInstant().toString());
    } catch (Exception e) {
      fail(f, "INVALID_VALUE");
    }
  }

  public static void money(ObjectNode n, String f) {
    String s = text(n, f, Integer.MAX_VALUE, false);
    if (!s.matches("(0|[1-9][0-9]*)\\.[0-9]{2}")) fail(f, "INVALID_VALUE");
    try {
      new BigDecimal(s);
    } catch (Exception e) {
      fail(f, "INVALID_VALUE");
    }
  }

  public static void oneOf(ObjectNode n, String f, String... values) {
    String s = text(n, f, 100, false);
    if (!Set.of(values).contains(s)) fail(f, "INVALID_VALUE");
  }

  public static void counterparty(ObjectNode n, String f) {
    if (!(n.get(f) instanceof ObjectNode c)) fail(f, "INVALID_TYPE");
    ObjectNode c = (ObjectNode) n.get(f);
    allowed(c, Set.of("nazov", "ico"));
    text(c, "nazov", 500, false);
    if (c.hasNonNull("ico")) {
      String s = text(c, "ico", 8, false);
      if (!s.matches("[0-9]{8}")) fail(f + ".ico", "INVALID_VALUE");
    }
  }

  public static void after(ObjectNode n, String earlier, String later) {
    if (n.hasNonNull(later)
        && LocalDate.parse(n.path(later).asText())
            .isBefore(LocalDate.parse(n.path(earlier).asText()))) fail(later, "INVALID_VALUE");
  }

  public static void exactSum(ObjectNode n) {
    if (new BigDecimal(n.path("suma_bez_dph").asText())
            .add(new BigDecimal(n.path("suma_dph").asText()))
            .compareTo(new BigDecimal(n.path("suma_s_dph").asText()))
        != 0) fail("suma_s_dph", "INVALID_VALUE");
  }

  public static void references(ObjectNode n, Set<String> types) {
    if (!n.has("suvisiace_zaznamy")) n.putArray("suvisiace_zaznamy");
    JsonNode refs = n.get("suvisiace_zaznamy");
    if (!refs.isArray()) fail("suvisiace_zaznamy", "INVALID_TYPE");
    if (refs.size() > 100) fail("suvisiace_zaznamy", "INVALID_VALUE");
    Set<String> found = new HashSet<>();
    for (JsonNode ref : refs) {
      if (!(ref instanceof ObjectNode)) fail("suvisiace_zaznamy", "INVALID_TYPE");
      ObjectNode r = (ObjectNode) ref;
      allowed(r, Set.of("typ", "id"));
      String type = text(r, "typ", 100, false);
      String id = text(r, "id", 200, false);
      if (!types.contains(type)) fail("suvisiace_zaznamy", "INVALID_TYPE");
      if (!found.add(type + "\0" + id)) fail("suvisiace_zaznamy", "DUPLICATE_REFERENCE");
    }
  }
}
