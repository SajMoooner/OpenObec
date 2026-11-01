package sk.openobec.supplierinvoices;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class DodavatelskaFakturaRepository extends RecordStore {
  public DodavatelskaFakturaRepository(
      MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new DodavatelskaFakturaDefinition(), references);
  }
}
