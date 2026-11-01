package sk.openobec.ordinances;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class VznRepository extends RecordStore {
  public VznRepository(MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new VznDefinition(), references);
  }
}
