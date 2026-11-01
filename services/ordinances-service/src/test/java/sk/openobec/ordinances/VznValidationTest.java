package sk.openobec.ordinances;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.junit.jupiter.api.*;
import sk.openobec.common.*;

class VznValidationTest {
  final ObjectMapper mapper = Json.mapper();
  final VznDefinition definition = new VznDefinition();

  ObjectNode valid() throws Exception {
    return (ObjectNode)
        mapper.readTree(
            "{\"cislo\": \"Test cislo\", \"nazov\": \"Test nazov\", \"predmet\": \"Test predmet\","
                + " \"datum_schvalenia\": \"2026-11-01\", \"datum_ucinnosti\": \"2026-11-01\","
                + " \"platnost_do\": null, \"zverejnene\": false}");
  }

  @Test
  void acceptsConcreteDomainAndDefaults() throws Exception {
    var n = valid();
    n.remove("zverejnene");
    var parsed = definition.normalize(n, null);
    assertEquals(false, parsed.get("zverejnene").booleanValue());
    assertNotNull(definition.decode(parsed));
  }

  @Test
  void rejectsUnknownAndServerFields() throws Exception {
    for (String f :
        new String[] {"unknown", "id", "obec_id", "entity_version", "deleted", "created_at"}) {
      var n = valid();
      n.put(f, "value");
      assertEquals(
          422, assertThrows(ApiException.class, () -> definition.normalize(n, null)).status());
    }
  }

  @Test
  void rejectsNumericAndBooleanCoercion() throws Exception {
    var n = valid();
    n.put("cislo", 23);
    assertThrows(ApiException.class, () -> definition.normalize(n, null));
    var bad = valid();
    bad.put("zverejnene", "false");
    assertThrows(ApiException.class, () -> definition.normalize(bad, null));
  }

  @Test
  void patchPreservesOtherFieldsAndRejectsEmpty() throws Exception {
    var n = definition.normalize(valid(), null);
    var patch = mapper.createObjectNode().put("predmet", "Zmena");
    var result = definition.normalize(patch, n);
    assertEquals("Zmena", result.path("predmet").asText());
    assertEquals(n.path("cislo"), result.path("cislo"));
    assertThrows(ApiException.class, () -> definition.normalize(mapper.createObjectNode(), n));
  }

  @Test
  void nullableCanBeCleared() throws Exception {
    var old = definition.normalize(valid(), null);
    var p = mapper.createObjectNode().put("platnost_do", "2026-12-01");
    var changed = definition.normalize(p, old);
    assertTrue(
        definition
            .normalize(mapper.createObjectNode().putNull("platnost_do"), changed)
            .path("platnost_do")
            .isNull());
  }

  @Test
  void rejectsReverseDates() throws Exception {
    var n = valid();
    n.put("platnost_do", "2026-10-01");
    assertThrows(ApiException.class, () -> definition.normalize(n, null));
  }
}
