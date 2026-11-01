package sk.openobec.contracts;

import java.time.*;
import java.util.List;
import sk.openobec.common.*;

/** Domain-specific editable fields; server fields are never accepted. */
public record ZmluvaRequest(
    String cislo,
    String predmet,
    Counterparty zmluvna_strana,
    LocalDate datum_podpisu,
    LocalDate datum_ucinnosti,
    LocalDate platnost_do,
    Money suma_s_dph,
    String mena,
    Boolean zverejnene,
    List<Reference> suvisiace_zaznamy) {}
