package sk.openobec.contracts;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class ZmluvaRepository extends RecordStore {
  public ZmluvaRepository(
      MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new ZmluvaDefinition(), references);
  }
}
