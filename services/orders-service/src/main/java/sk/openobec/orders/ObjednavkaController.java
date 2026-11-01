package sk.openobec.orders;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/objednavky")
public class ObjednavkaController extends DomainController {
  public ObjednavkaController(ObjednavkaRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
