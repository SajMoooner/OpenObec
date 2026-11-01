package sk.openobec.contracts;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/zmluvy")
public class ZmluvaController extends DomainController {
  public ZmluvaController(ZmluvaRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
