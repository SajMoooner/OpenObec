package sk.openobec.ordinances;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class VznDefinition implements DomainDefinition<VznRequest> {
  public String agenda() {
    return "vzn";
  }

  public boolean paired() {
    return false;
  }

  public String prefix() {
    return "vzn_";
  }

  public Class<VznRequest> type() {
    return VznRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "nazov",
        "predmet",
        "datum_schvalenia",
        "datum_ucinnosti",
        "platnost_do",
        "zverejnene");
  }

  public void validate(ObjectNode n) {
    Rules.text(n, "cislo", 100, false);
    Rules.text(n, "nazov", 500, false);
    Rules.text(n, "predmet", 5000, false);
    Rules.date(n, "datum_schvalenia", false);
    Rules.date(n, "datum_ucinnosti", false);
    Rules.date(n, "platnost_do", true);
    Rules.bool(n, "zverejnene");
    Rules.after(n, "datum_ucinnosti", "platnost_do");
  }
}
