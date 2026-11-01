package sk.openobec.orders;

import java.time.*;
import java.util.List;
import sk.openobec.common.*;

/** Domain-specific editable fields; server fields are never accepted. */
public record ObjednavkaRequest(
    String cislo,
    String predmet,
    Counterparty dodavatel,
    LocalDate datum_objednania,
    LocalDate termin_dodania,
    Money suma_s_dph,
    String mena,
    Boolean zverejnene,
    List<Reference> suvisiace_zaznamy) {}
