package sk.openobec.read;

import java.util.*;
import org.bson.Document;

public record Ref(String typ, String id) implements Comparable<Ref> {
  public static final Set<String> TYPES =
      Set.of("faktury", "dodavatelske-faktury", "zmluvy", "objednavky", "verejne-obstaravanie");

  public Ref {
    if (!TYPES.contains(typ) || id == null || id.isBlank() || id.length() > 200)
      throw new IllegalArgumentException("Invalid reference");
  }

  public Document bson() {
    return new Document("typ", typ).append("id", id);
  }

  public static Ref from(Document d) {
    return new Ref(d.getString("typ"), d.getString("id"));
  }

  public String key() {
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(bson().toJson().getBytes(java.nio.charset.StandardCharsets.UTF_8));
  }

  public int compareTo(Ref b) {
    int c = typ.compareTo(b.typ);
    return c == 0 ? id.compareTo(b.id) : c;
  }

  public static boolean allowed(String source, String target) {
    return TYPES.contains(source)
        && TYPES.contains(target)
        && !source.equals(target)
        && !(source.endsWith("faktury") && target.endsWith("faktury"));
  }
}
