package sk.openobec.supplierinvoices;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/dodavatelske-faktury")
public class DodavatelskaFakturaController extends DomainController {
  public DodavatelskaFakturaController(
      DodavatelskaFakturaRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
