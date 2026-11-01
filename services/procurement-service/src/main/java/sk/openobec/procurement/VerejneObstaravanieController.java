package sk.openobec.procurement;

import org.springframework.web.bind.annotation.*;
import sk.openobec.common.*;

@RestController
@RequestMapping("/rest/v1/verejne-obstaravanie")
public class VerejneObstaravanieController extends DomainController {
  public VerejneObstaravanieController(
      VerejneObstaravanieRepository repository, AttachmentStore attachments) {
    super(repository, attachments);
  }
}
