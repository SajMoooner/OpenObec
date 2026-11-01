package sk.openobec.gateway;

import java.util.List;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;

@Configuration
class GatewayRoutes {
  @Bean
  org.springframework.cloud.gateway.config.HttpClientCustomizer noAutomaticWriteRetry() {
    return client -> client.disableRetry(true);
  }

  @Bean
  RouteLocator publicRoutes(RouteLocatorBuilder builder, Environment environment) {
    var routes = builder.routes();
    String query = environment.getRequiredProperty("openobec.services.query");
    routes.route(
        "selector", r -> r.method(HttpMethod.GET).and().path("/rest/v1/vyber-zaznamov").uri(query));
    for (String agenda :
        List.of(
            "faktury",
            "dodavatelske-faktury",
            "zmluvy",
            "objednavky",
            "verejne-obstaravanie",
            "vzn")) {
      String root = "/rest/v1/" + agenda;
      if (!agenda.equals("vzn")) {
        routes.route(
            agenda + "-relations",
            r -> r.method(HttpMethod.GET).and().path(root + "/{id}/suvislosti").uri(query));
        routes.route(
            agenda + "-query",
            r ->
                r.method(HttpMethod.GET)
                    .and()
                    .path("/rest/v1/query/" + agenda, "/rest/v1/query/" + agenda + "/{id}")
                    .uri(query));
      }
      String uri = environment.getRequiredProperty("openobec.services." + agenda);
      routes.route(
          agenda + "-read",
          r ->
              r.method(HttpMethod.GET)
                  .and()
                  .path(
                      root,
                      root + "/{id}",
                      root + "/{id}/prilohy",
                      root + "/{id}/prilohy/{file_id}/download")
                  .uri(uri));
      routes.route(
          agenda + "-write",
          r ->
              r.method(HttpMethod.POST)
                  .and()
                  .path(
                      root,
                      root + "/{id}/update",
                      root + "/{id}/delete",
                      root + "/{id}/prilohy",
                      root + "/{id}/prilohy/{file_id}/delete")
                  .uri(uri));
    }
    return routes.build();
  }
}
