package sk.openobec.invoices;

import java.time.*;
import java.util.List;
import sk.openobec.common.*;

/** Domain-specific editable fields; server fields are never accepted. */
public record FakturaRequest(
    String cislo,
    String predmet,
    Counterparty odberatel,
    LocalDate datum_vystavenia,
    LocalDate datum_splatnosti,
    Money suma_bez_dph,
    Money suma_dph,
    Money suma_s_dph,
    String mena,
    Boolean zverejnene,
    List<Reference> suvisiace_zaznamy) {}
