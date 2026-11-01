package sk.openobec.query;

import jakarta.servlet.http.*;
import java.util.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.*;
import org.springframework.web.servlet.config.annotation.*;
import sk.openobec.common.*;
import sk.openobec.read.Ref;

@RestController
@RequestMapping("/rest/v1")
public class QueryController {
  private final QueryService service;

  public QueryController(QueryService service) {
    this.service = service;
  }

  private Map<String, String> params(MultiValueMap<String, String> p) {
    Map<String, String> m = new HashMap<>();
    p.forEach(
        (k, v) -> {
          if (v.size() != 1) throw ListQuery.bad();
          m.put(k, v.getFirst());
        });
    return m;
  }

  private Ref ref(String type, String id) {
    try {
      return new Ref(type, id);
    } catch (IllegalArgumentException e) {
      throw ApiException.notFound();
    }
  }

  @GetMapping("/query/{type}")
  Object list(@PathVariable String type, @RequestParam MultiValueMap<String, String> p) {
    ref(type, "validation");
    return service.list(type, params(p), false);
  }

  @GetMapping("/vyber-zaznamov")
  Object selector(@RequestParam MultiValueMap<String, String> p) {
    return service.selector(params(p));
  }

  @GetMapping("/query/{type}/{id}")
  ResponseEntity<?> detail(
      @PathVariable String type,
      @PathVariable String id,
      @RequestParam MultiValueMap<String, String> p) {
    return result(service.detail(ref(type, id), params(p)));
  }

  @GetMapping("/{type}/{id}/suvislosti")
  ResponseEntity<?> relations(
      @PathVariable String type,
      @PathVariable String id,
      @RequestParam MultiValueMap<String, String> p) {
    return result(service.relations(ref(type, id), params(p)));
  }

  private ResponseEntity<?> result(QueryService.Result r) {
    var b = ResponseEntity.status(r.status());
    if (r.status() == 202) b.header("Retry-After", "2");
    return b.body(r.body());
  }

  @Configuration
  static class Web implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
      registry
          .addInterceptor(
              new HandlerInterceptor() {
                public boolean preHandle(
                    HttpServletRequest req, HttpServletResponse res, Object h) {
                  String incoming = req.getHeader("X-Request-Id");
                  String id =
                      incoming != null && incoming.matches("[A-Za-z0-9._:-]{1,100}")
                          ? incoming
                          : UUID.randomUUID().toString();
                  req.setAttribute("request_id", id);
                  res.setHeader("X-Request-Id", id);
                  if (!"zilina".equals(req.getHeader("X-Obec-Id")))
                    throw new ApiException(400, "BAD_REQUEST", "Vyžaduje sa X-Obec-Id: zilina.");
                  return true;
                }
              })
          .addPathPatterns("/rest/**");
    }
  }
}
