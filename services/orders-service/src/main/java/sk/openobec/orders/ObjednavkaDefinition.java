package sk.openobec.orders;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class ObjednavkaDefinition implements DomainDefinition<ObjednavkaRequest> {
  public String agenda() {
    return "objednavky";
  }

  public boolean paired() {
    return true;
  }

  public String prefix() {
    return "obj_";
  }

  public Class<ObjednavkaRequest> type() {
    return ObjednavkaRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "predmet",
        "dodavatel",
        "datum_objednania",
        "termin_dodania",
        "suma_s_dph",
        "mena",
        "zverejnene",
        "suvisiace_zaznamy");
  }

  public void validate(ObjectNode n) {
    Rules.text(n, "cislo", 100, false);
    Rules.text(n, "predmet", 5000, false);
    Rules.counterparty(n, "dodavatel");
    Rules.date(n, "datum_objednania", false);
    Rules.date(n, "termin_dodania", true);
    Rules.money(n, "suma_s_dph");
    Rules.oneOf(n, "mena", "EUR");
    Rules.bool(n, "zverejnene");
    Rules.references(
        n, Set.of("faktury", "dodavatelske-faktury", "zmluvy", "verejne-obstaravanie"));
    Rules.after(n, "datum_objednania", "termin_dodania");
  }
}
