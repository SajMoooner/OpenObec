package sk.openobec.supplierinvoices;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Set;
import sk.openobec.common.*;

public final class DodavatelskaFakturaDefinition
    implements DomainDefinition<DodavatelskaFakturaRequest> {
  public String agenda() {
    return "dodavatelske-faktury";
  }

  public boolean paired() {
    return true;
  }

  public String prefix() {
    return "dfak_";
  }

  public Class<DodavatelskaFakturaRequest> type() {
    return DodavatelskaFakturaRequest.class;
  }

  public Set<String> fields() {
    return Set.of(
        "cislo",
        "predmet",
        "dodavatel",
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
    Rules.counterparty(n, "dodavatel");
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
