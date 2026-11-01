package sk.openobec.procurement;

import com.mongodb.client.MongoClient;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import sk.openobec.common.*;

@Repository
public class VerejneObstaravanieRepository extends RecordStore {
  public VerejneObstaravanieRepository(
      MongoClient client, MongoTemplate template, ReferenceValidator references) {
    super(client, template.getDb(), new VerejneObstaravanieDefinition(), references);
  }
}
