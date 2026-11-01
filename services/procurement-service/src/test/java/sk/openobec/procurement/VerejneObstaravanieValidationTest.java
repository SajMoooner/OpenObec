package sk.openobec.procurement;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.junit.jupiter.api.*;
import sk.openobec.common.*;

class VerejneObstaravanieValidationTest {
  final ObjectMapper mapper = Json.mapper();
  final VerejneObstaravanieDefinition definition = new VerejneObstaravanieDefinition();

  ObjectNode valid() throws Exception {
    return (ObjectNode)
        mapper.readTree(
            "{\"cislo\": \"Test cislo\", \"nazov\": \"Test nazov\", \"predmet\": \"Test predmet\","
                + " \"cpv\": \"45000000-7\", \"predpokladana_hodnota_bez_dph\": \"10.00\","
                + " \"mena\": \"EUR\", \"lehota_predkladania\": \"2026-11-01T10:00:00+01:00\","
                + " \"stav\": \"otvorene\", \"zverejnene\": false, \"suvisiace_zaznamy\": []}");
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
  void referenceTypesDuplicatesAndNullAreRejected() throws Exception {
    for (String type : new String[] {"vzn", "verejne-obstaravanie"}) {
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
