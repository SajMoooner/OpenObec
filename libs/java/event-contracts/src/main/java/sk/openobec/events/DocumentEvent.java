package sk.openobec.events;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;

/** Version 1 full snapshot envelope. No attachment bodies or VZN events. */
public record DocumentEvent(
    String event_id,
    String event_type,
    int schema_version,
    String entity_type,
    String entity_id,
    long entity_version,
    String obec_id,
    String occurred_at,
    ObjectNode data) {
  public static final String TOPIC = "openobec.documents.v1";

  public DocumentEvent {
    if (event_id == null
        || event_id.isBlank()
        || schema_version != 1
        || !Set.of("document.created", "document.updated", "document.deleted").contains(event_type)
        || !Set.of(
                "faktury", "dodavatelske-faktury", "zmluvy", "objednavky", "verejne-obstaravanie")
            .contains(entity_type)
        || entity_version < 1
        || !"zilina".equals(obec_id)
        || data == null) throw new IllegalArgumentException("Invalid document event identity");
    if (!entity_id.equals(data.path("id").asText())
        || !obec_id.equals(data.path("obec_id").asText())
        || entity_version != data.path("entity_version").asLong()
        || !data.path("deleted").isBoolean()
        || !data.has("deleted_at"))
      throw new IllegalArgumentException("Envelope and data identity disagree");
    boolean deleted = event_type.equals("document.deleted");
    if (deleted != data.path("deleted").asBoolean()
        || (deleted ? !data.path("deleted_at").isTextual() : !data.path("deleted_at").isNull()))
      throw new IllegalArgumentException("Invalid tombstone");
    java.time.Instant.parse(occurred_at);
    if (deleted) java.time.Instant.parse(data.path("deleted_at").asText());
    data = data.deepCopy();
  }

  public String key() {
    return obec_id + ":" + entity_type + ":" + entity_id;
  }
}
