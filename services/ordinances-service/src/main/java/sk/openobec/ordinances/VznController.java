package sk.openobec.ordinances;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/vzn")
public class VznController extends DomainController {
  public VznController(VznRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
