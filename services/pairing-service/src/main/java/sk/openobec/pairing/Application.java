package sk.openobec.pairing;

import com.mongodb.client.MongoClient;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.*;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import sk.openobec.read.*;

@SpringBootApplication
public class Application {
  public static void main(String[] args) {
    if (args.length > 0 && args[0].equals("rebuild")) {
      RebuildRunner.main(java.util.Arrays.copyOfRange(args, 1, args.length));
      return;
    }
    SpringApplication.run(Application.class, args);
  }

  @Bean
  ProjectionStore projectionStore(MongoClient client, MongoDatabaseFactory factory) {
    return new ProjectionStore(client, factory.getMongoDatabase().getName());
  }

  @Bean
  ProjectionEngine projectionEngine(ProjectionStore store) {
    return new ProjectionEngine(store);
  }
}
