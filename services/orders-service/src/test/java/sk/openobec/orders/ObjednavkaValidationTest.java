package sk.openobec.orders;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.junit.jupiter.api.*;
import sk.openobec.common.*;

class ObjednavkaValidationTest {
  final ObjectMapper mapper = Json.mapper();
  final ObjednavkaDefinition definition = new ObjednavkaDefinition();

  ObjectNode valid() throws Exception {
    return (ObjectNode)
        mapper.readTree(
            "{\"cislo\": \"Test cislo\", \"predmet\": \"Test predmet\", \"dodavatel\": {\"nazov\":"
                + " \"Dodávateľ\", \"ico\": \"12345678\"}, \"datum_objednania\": \"2026-11-01\","
                + " \"termin_dodania\": null, \"suma_s_dph\": \"12.00\", \"mena\": \"EUR\","
                + " \"zverejnene\": false, \"suvisiace_zaznamy\": []}");
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
  void counterpartyIsReplacedAsWhole() throws Exception {
    var old = definition.normalize(valid(), null);
    var p = mapper.createObjectNode();
    p.putObject("dodavatel").put("nazov", "Nový");
    var result = definition.normalize(p, old);
    assertFalse(result.path("dodavatel").has("ico"));
    p.removeAll();
    p.putObject("dodavatel").put("ico", "12345678");
    assertThrows(ApiException.class, () -> definition.normalize(p, old));
  }

  @Test
  void nullableCanBeCleared() throws Exception {
    var old = definition.normalize(valid(), null);
    var p = mapper.createObjectNode().put("termin_dodania", "2026-12-01");
    var changed = definition.normalize(p, old);
    assertTrue(
        definition
            .normalize(mapper.createObjectNode().putNull("termin_dodania"), changed)
            .path("termin_dodania")
            .isNull());
  }

  @Test
  void rejectsReverseDates() throws Exception {
    var n = valid();
    n.put("termin_dodania", "2026-10-01");
    assertThrows(ApiException.class, () -> definition.normalize(n, null));
  }

  @Test
  void referenceTypesDuplicatesAndNullAreRejected() throws Exception {
    for (String type : new String[] {"vzn", "objednavky"}) {
      var n = valid();
      n.putArray("suvisiace_zaznamy").addObject().put("typ", type).put("id", "x");
      assertThrows(ApiException.class, () -> definition.normalize(n, null));
    }
    var n = valid();
    n.putNull("suvisiace_zaznamy");
    assertThrows(ApiException.class, () -> definition.normalize(n, null));
    var a = valid();
    var refs = a.putArray("suvisiace_zaznamy");
    var ref = refs.addObject().put("typ", "zmluvy ".trim()).put("id", "x");
    refs.add(ref.deepCopy());
    assertThrows(ApiException.class, () -> definition.normalize(a, null));
  }
}
