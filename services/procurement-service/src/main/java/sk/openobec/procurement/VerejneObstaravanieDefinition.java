package sk.openobec.procurement;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class VerejneObstaravanieDefinition
    implements DomainDefinition<VerejneObstaravanieRequest> {
  public String agenda() {
    return "verejne-obstaravanie";
  }

  public boolean paired() {
    return true;
  }

  public String prefix() {
    return "vo_";
  }

  public Class<VerejneObstaravanieRequest> type() {
    return VerejneObstaravanieRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "nazov",
        "predmet",
        "cpv",
        "predpokladana_hodnota_bez_dph",
        "mena",
        "lehota_predkladania",
        "stav",
        "zverejnene",
        "suvisiace_zaznamy");
  }

  public void validate(ObjectNode n) {
    Rules.text(n, "cislo", 100, false);
    Rules.text(n, "nazov", 500, false);
    Rules.text(n, "predmet", 5000, false);
    Rules.text(n, "cpv", 10, false);
    if (!n.path("cpv").asText().matches("[0-9]{8}-[0-9]")) Rules.fail("cpv", "INVALID_VALUE");
    Rules.money(n, "predpokladana_hodnota_bez_dph");
    Rules.oneOf(n, "mena", "EUR");
    Rules.instant(n, "lehota_predkladania");
    Rules.oneOf(n, "stav", "otvorene", "vyhodnocovanie", "ukoncene", "zrusene");
    Rules.bool(n, "zverejnene");
    Rules.references(n, Set.of("faktury", "dodavatelske-faktury", "zmluvy", "objednavky"));
  }
}
