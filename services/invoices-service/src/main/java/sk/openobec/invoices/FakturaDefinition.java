package sk.openobec.invoices;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class FakturaDefinition implements DomainDefinition<FakturaRequest> {
  public String agenda() {
    return "faktury";
  }

  public boolean paired() {
    return true;
  }

  public String prefix() {
    return "fak_";
  }

  public Class<FakturaRequest> type() {
    return FakturaRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "predmet",
        "odberatel",
        "datum_vystavenia",
        "datum_splatnosti",
        "suma_bez_dph",
        "suma_dph",
        "suma_s_dph",
        "mena",
        "zverejnene",
        "suvisiace_zaznamy");
  }

  public void validate(ObjectNode n) {
    Rules.text(n, "cislo", 100, false);
    Rules.text(n, "predmet", 5000, false);
    Rules.counterparty(n, "odberatel");
    Rules.date(n, "datum_vystavenia", false);
    Rules.date(n, "datum_splatnosti", false);
    Rules.money(n, "suma_bez_dph");
    Rules.money(n, "suma_dph");
    Rules.money(n, "suma_s_dph");
    Rules.oneOf(n, "mena", "EUR");
    Rules.bool(n, "zverejnene");
    Rules.references(n, Set.of("zmluvy", "objednavky", "verejne-obstaravanie"));
    Rules.exactSum(n);
    Rules.after(n, "datum_vystavenia", "datum_splatnosti");
  }
}
