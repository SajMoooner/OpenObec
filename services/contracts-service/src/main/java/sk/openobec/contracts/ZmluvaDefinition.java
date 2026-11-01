package sk.openobec.contracts;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class ZmluvaDefinition implements DomainDefinition<ZmluvaRequest> {
  public String agenda() {
    return "zmluvy";
  }

  public boolean paired() {
    return true;
  }

  public String prefix() {
    return "zml_";
  }

  public Class<ZmluvaRequest> type() {
    return ZmluvaRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "predmet",
        "zmluvna_strana",
        "datum_podpisu",
        "datum_ucinnosti",
        "platnost_do",
        "suma_s_dph",
        "mena",
        "zverejnene",
        "suvisiace_zaznamy");
  }

  public void validate(ObjectNode n) {
    Rules.text(n, "cislo", 100, false);
    Rules.text(n, "predmet", 5000, false);
    Rules.counterparty(n, "zmluvna_strana");
    Rules.date(n, "datum_podpisu", false);
    Rules.date(n, "datum_ucinnosti", false);
    Rules.date(n, "platnost_do", true);
    Rules.money(n, "suma_s_dph");
    Rules.oneOf(n, "mena", "EUR");
    Rules.bool(n, "zverejnene");
    Rules.references(
        n, Set.of("faktury", "dodavatelske-faktury", "objednavky", "verejne-obstaravanie"));
    Rules.after(n, "datum_ucinnosti", "platnost_do");
  }
}
