package sk.openobec.read.fixtures;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.*;
import sk.openobec.common.Json;

/** Full valid five-agenda snapshots shared only by read-side integration tests. */
public final class DocumentEvents {
  private DocumentEvents() {}

  public static ObjectNode event(
      String type, String id, int version, boolean deleted, String... refs) {
    var d = Json.mapper().createObjectNode();
    d.put("id", id)
        .put("obec_id", "zilina")
        .put("entity_version", version)
        .put("cislo", id)
        .put("predmet", "Predmet " + id)
        .put("zverejnene", true)
        .put("created_at", "2026-11-01T10:00:00Z")
        .put("updated_at", "2026-11-01T11:00:00Z")
        .put("deleted", deleted);
    if (deleted) d.put("deleted_at", "2026-11-01T11:00:00Z");
    else d.putNull("deleted_at");
    var a = d.putArray("suvisiace_zaznamy");
    for (int i = 0; i < refs.length; i += 2)
      a.addObject().put("typ", refs[i]).put("id", refs[i + 1]);
    switch (type) {
      case "faktury", "dodavatelske-faktury" -> {
        d.putObject(type.equals("faktury") ? "odberatel" : "dodavatel")
            .put("nazov", "Fiktívny partner");
        d.put("datum_vystavenia", "2026-11-01")
            .put("datum_splatnosti", "2026-11-01")
            .put("suma_bez_dph", "10.00")
            .put("suma_dph", "2.00")
            .put("suma_s_dph", "12.00")
            .put("mena", "EUR");
      }
      case "zmluvy" -> {
        d.putObject("zmluvna_strana").put("nazov", "Fiktívny partner");
        d.put("datum_podpisu", "2026-11-01")
            .put("datum_ucinnosti", "2026-11-01")
            .putNull("platnost_do");
        d.put("suma_s_dph", "12.00").put("mena", "EUR");
      }
      case "objednavky" -> {
        d.putObject("dodavatel").put("nazov", "Fiktívny partner");
        d.put("datum_objednania", "2026-11-01").putNull("termin_dodania");
        d.put("suma_s_dph", "12.00").put("mena", "EUR");
      }
      case "verejne-obstaravanie" ->
          d.put("nazov", "Obstarávanie")
              .put("cpv", "45000000-7")
              .put("predpokladana_hodnota_bez_dph", "10.00")
              .put("mena", "EUR")
              .put("lehota_predkladania", "2026-12-01T10:00:00Z")
              .put("stav", "otvorene");
    }
    var e = Json.mapper().createObjectNode();
    e.put("event_id", UUID.randomUUID().toString())
        .put("event_type", deleted ? "document.deleted" : "document.updated")
        .put("schema_version", 1)
        .put("entity_type", type)
        .put("entity_id", id)
        .put("entity_version", version)
        .put("obec_id", "zilina")
        .put("occurred_at", "2026-11-01T11:00:00Z");
    e.set("data", d);
    return e;
  }
}
