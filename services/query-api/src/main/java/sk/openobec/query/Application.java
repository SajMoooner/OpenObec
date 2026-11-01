package sk.openobec.query;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.client.MongoClient;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import sk.openobec.common.*;
import sk.openobec.read.*;

@SpringBootApplication
@Import(ApiErrors.class)
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

  @Bean
  ObjectMapper mapper() {
    return Json.mapper();
  }

  @Bean
  ProjectionStore projectionStore(MongoClient client, MongoDatabaseFactory factory) {
    return new ProjectionStore(client, factory.getMongoDatabase().getName());
  }

  @Bean
  ProjectionEngine projectionEngine(ProjectionStore store) {
    return new ProjectionEngine(store);
  }

  @Bean
  QueryService queryService(ProjectionStore store, Environment env) {
    return new QueryService(store, env);
  }
}
