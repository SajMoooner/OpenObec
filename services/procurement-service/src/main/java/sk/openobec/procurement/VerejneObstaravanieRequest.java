package sk.openobec.procurement;

import java.time.*;
import java.util.List;
import sk.openobec.common.*;

/** Domain-specific editable fields; server fields are never accepted. */
public record VerejneObstaravanieRequest(
    String cislo,
    String nazov,
    String predmet,
    String cpv,
    Money predpokladana_hodnota_bez_dph,
    String mena,
    Instant lehota_predkladania,
    String stav,
    Boolean zverejnene,
    List<Reference> suvisiace_zaznamy) {}
