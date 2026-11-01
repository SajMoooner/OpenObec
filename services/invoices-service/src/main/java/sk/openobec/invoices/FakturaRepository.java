package sk.openobec.invoices;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class FakturaRepository extends RecordStore {
  public FakturaRepository(
      MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new FakturaDefinition(), references);
  }
}
