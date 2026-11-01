package sk.openobec.invoices;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/faktury")
public class FakturaController extends DomainController {
  public FakturaController(FakturaRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
