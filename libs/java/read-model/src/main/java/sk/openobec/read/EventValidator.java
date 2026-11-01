package sk.openobec.read;

import com.fasterxml.jackson.databind.*;
import java.time.*;
import java.util.*;
import sk.openobec.common.Json;
import sk.openobec.events.DocumentEvent;

/** Validates the checked-in v1 JSON schema, with strict primitive types and formats. */
public final class EventValidator {
  private static final JsonNode SCHEMA;

  static {
    try (var in = EventValidator.class.getResourceAsStream("/events/document-event.schema.json")) {
      SCHEMA = Json.mapper().readTree(in);
    } catch (Exception e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  public DocumentEvent validate(JsonNode e) {
    try {
      check(SCHEMA, e);
      JsonNode dataSchema = null;
      for (var branch : SCHEMA.path("oneOf"))
        if (branch
            .path("properties")
            .path("entity_type")
            .path("const")
            .asText()
            .equals(e.path("entity_type").asText()))
          dataSchema = branch.path("properties").path("data");
      if (dataSchema == null) throw bad();
      check(dataSchema, e.path("data"));
      var result = Json.mapper().treeToValue(e, DocumentEvent.class);
      if (!result.data().path("entity_version").isIntegralNumber()
          || !result.data().path("entity_version").equals(e.path("entity_version"))) throw bad();
      return result;
    } catch (IllegalArgumentException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new IllegalArgumentException("Invalid document snapshot", ex);
    }
  }

  private static void check(JsonNode s, JsonNode n) {
    var t = s.get("type");
    if (t != null) {
      boolean ok = false;
      if (t.isArray()) {
        for (var one : t) ok |= type(one.asText(), n);
      } else ok = type(t.asText(), n);
      if (!ok) throw bad();
    }
    if (s.has("const") && !s.get("const").equals(n)) throw bad();
    if (s.has("enum")) {
      boolean ok = false;
      for (var v : s.get("enum")) ok |= v.equals(n);
      if (!ok) throw bad();
    }
    if (n.isObject()) {
      for (var field : s.path("required")) if (!n.has(field.asText())) throw bad();
      var fields = n.fields();
      while (fields.hasNext()) {
        var f = fields.next();
        var spec = s.path("properties").get(f.getKey());
        if (spec == null) {
          if (s.has("additionalProperties") && !s.get("additionalProperties").asBoolean())
            throw bad();
        } else check(spec, f.getValue());
      }
    }
    if (n.isArray()) {
      if (s.has("maxItems") && n.size() > s.get("maxItems").asInt()) throw bad();
      Set<JsonNode> unique = new HashSet<>();
      for (var v : n) {
        if (s.has("items")) check(s.get("items"), v);
        if (s.path("uniqueItems").asBoolean() && !unique.add(v)) throw bad();
      }
    }
    if (n.isTextual()) {
      String v = n.asText();
      if (s.has("minLength") && v.length() < s.get("minLength").asInt()
          || s.has("maxLength") && v.length() > s.get("maxLength").asInt()
          || s.has("pattern") && !v.matches(s.get("pattern").asText())) throw bad();
      try {
        switch (s.path("format").asText()) {
          case "date" -> LocalDate.parse(v);
          case "date-time" -> OffsetDateTime.parse(v);
        }
      } catch (Exception ex) {
        throw bad();
      }
    }
    if (n.isNumber()
        && s.has("minimum")
        && n.decimalValue().compareTo(s.get("minimum").decimalValue()) < 0) throw bad();
  }

  private static boolean type(String t, JsonNode n) {
    return switch (t) {
      case "object" -> n.isObject();
      case "array" -> n.isArray();
      case "string" -> n.isTextual();
      case "boolean" -> n.isBoolean();
      case "null" -> n.isNull();
      case "integer" -> n.isIntegralNumber() && n.canConvertToLong();
      default -> false;
    };
  }

  private static IllegalArgumentException bad() {
    return new IllegalArgumentException("Event violates v1 document schema");
  }
}
