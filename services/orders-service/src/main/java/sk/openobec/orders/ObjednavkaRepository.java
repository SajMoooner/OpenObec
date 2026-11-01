package sk.openobec.orders;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class ObjednavkaRepository extends RecordStore {
  public ObjednavkaRepository(
      MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new ObjednavkaDefinition(), references);
  }
}
