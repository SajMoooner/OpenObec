package sk.openobec.ordinances;

import java.time.*;
import sk.openobec.common.*;

/** Domain-specific editable fields; server fields are never accepted. */
public record VznRequest(
    String cislo,
    String nazov,
    String predmet,
    LocalDate datum_schvalenia,
    LocalDate datum_ucinnosti,
    LocalDate platnost_do,
    Boolean zverejnene) {}
